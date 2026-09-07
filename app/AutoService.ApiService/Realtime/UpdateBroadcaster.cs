using System.Collections.Concurrent;
using System.Threading.Channels;

namespace AutoService.ApiService.Realtime;

/**
 * Fan-out contract for server-sent update channels.
 *
 * @param TEvent Immutable payload delivered to every live subscriber.
 */
internal interface IUpdateBroadcaster<TEvent>
{
    /**
     * Registers a subscriber unless a capacity limit is reached.
     *
     * @param userId Person identifier used for the per-user limit.
     * @param subscriptionId Identifier the caller must pass back to {@code Unsubscribe}.
     * @param reader Reader the caller drains until the client disconnects.
     * @return True when the subscription was accepted.
     */
    bool TrySubscribe(int userId, out Guid subscriptionId, out ChannelReader<TEvent> reader);

    /**
     * Releases a subscription and its channel.
     *
     * @param subscriptionId Identifier returned by {@code TrySubscribe}.
     */
    void Unsubscribe(Guid subscriptionId);

    /**
     * Delivers an event to every current subscriber.
     *
     * @param updateEvent Payload to fan out.
     */
    void Publish(TEvent updateEvent);
}

/**
 * Bounded in-memory fan-out used by the server-sent event endpoints.
 *
 * Every subscriber gets its own bounded channel in {@code DropOldest} mode, so one slow client can
 * never apply back-pressure to a mutation or grow memory without limit; it just misses intermediate
 * events and catches up on the next one. The concurrency caps exist because each subscription holds
 * an open HTTP response for as long as the client stays connected.
 *
 * The generic base exists so a second channel does not mean a second copy of this concurrency
 * handling.
 *
 * @param TEvent Immutable payload delivered to every live subscriber.
 */
internal abstract class UpdateBroadcaster<TEvent> : IUpdateBroadcaster<TEvent>
{
    /** Upper bound on simultaneously open streams for this channel. */
    protected virtual int MaxConcurrentSubscriptions => 200;

    /** Upper bound on simultaneously open streams for a single person. */
    protected virtual int MaxSubscriptionsPerUser => 5;

    /** Events buffered per subscriber before the oldest is dropped. */
    protected virtual int PerSubscriberBufferSize => 32;

    private readonly ConcurrentDictionary<Guid, (Channel<TEvent> Channel, int UserId)> subscribers = new();
    private int subscriptionCount;

    /**
     * Registers a subscriber unless the per-user or global cap is reached.
     */
    public bool TrySubscribe(int userId, out Guid subscriptionId, out ChannelReader<TEvent> reader)
    {
        var userCount = subscribers.Values.Count(subscriber => subscriber.UserId == userId);
        if (userCount >= MaxSubscriptionsPerUser)
        {
            return Reject(out subscriptionId, out reader);
        }

        var newCount = Interlocked.Increment(ref subscriptionCount);
        if (newCount > MaxConcurrentSubscriptions)
        {
            Interlocked.Decrement(ref subscriptionCount);
            return Reject(out subscriptionId, out reader);
        }

        subscriptionId = Guid.NewGuid();
        var channel = Channel.CreateBounded<TEvent>(new BoundedChannelOptions(PerSubscriberBufferSize)
        {
            SingleReader = true,
            SingleWriter = false,
            AllowSynchronousContinuations = false,
            FullMode = BoundedChannelFullMode.DropOldest
        });

        if (!subscribers.TryAdd(subscriptionId, (channel, userId)))
        {
            channel.Writer.TryComplete();
            Interlocked.Decrement(ref subscriptionCount);
            return Reject(out subscriptionId, out reader);
        }

        reader = channel.Reader;
        return true;
    }

    /**
     * Releases a subscription and completes its channel.
     */
    public void Unsubscribe(Guid subscriptionId)
    {
        if (subscribers.TryRemove(subscriptionId, out var entry))
        {
            entry.Channel.Writer.TryComplete();
            Interlocked.Decrement(ref subscriptionCount);
        }
    }

    /**
     * Delivers an event to every subscriber, dropping channels whose reader has already completed.
     */
    public void Publish(TEvent updateEvent)
    {
        foreach (var subscriber in subscribers)
        {
            var channel = subscriber.Value.Channel;
            if (!channel.Writer.TryWrite(updateEvent) && channel.Reader.Completion.IsCompleted)
            {
                Unsubscribe(subscriber.Key);
            }
        }
    }

    /**
     * Produces the rejected-subscription result shape.
     */
    private static bool Reject(out Guid subscriptionId, out ChannelReader<TEvent> reader)
    {
        subscriptionId = Guid.Empty;
        reader = null!;
        return false;
    }
}
