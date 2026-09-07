using AutoService.ApiService.Appointments.Realtime;
using AutoService.ApiService.Realtime;

namespace AutoService.ApiService.Appointments;

public static partial class AppointmentEndpoints
{
    /**
     * Handles {@code GET /api/appointments/updates} and streams appointment changes as server-sent events.
     *
     * Clients use this to reflect other people's changes without polling. The event payload is
     * intentionally minimal; subscribers refresh the view they are showing rather than patching
     * local state from the event.
     *
     * @param httpContext - Current HTTP context.
     * @param broadcaster - Appointment update fan-out.
     * @param cancellationToken - Cancelled when the client disconnects.
     * @return An open event stream, or 503 when the subscription limit is reached.
     */
    private static async Task<IResult> StreamAppointmentUpdatesAsync(
        HttpContext httpContext,
        IAppointmentUpdateBroadcaster broadcaster,
        CancellationToken cancellationToken)
    {
        var personIdClaim = httpContext.User.FindFirst("person_id")?.Value;
        var userId = int.TryParse(personIdClaim, out var parsedPersonId) ? parsedPersonId : 0;

        if (!broadcaster.TrySubscribe(userId, out var subscriptionId, out var reader))
        {
            return Results.Problem(
                detail: "Too many active appointment update subscriptions. Please retry later.",
                statusCode: StatusCodes.Status503ServiceUnavailable);
        }

        ServerSentEventStream.ConfigureResponse(httpContext.Response);

        try
        {
            await ServerSentEventStream.WriteAsync(
                httpContext.Response,
                reader,
                "appointment-updated",
                "appointment updates stream ready",
                cancellationToken);
        }
        catch (OperationCanceledException) when (cancellationToken.IsCancellationRequested)
        {
            // Client disconnected.
        }
        finally
        {
            broadcaster.Unsubscribe(subscriptionId);
        }

        return Results.Empty;
    }

    /**
     * Publishes an appointment change to every live subscriber.
     *
     * Called from each mutation handler after its {@code SaveChangesAsync}, so a failed write never
     * produces an event.
     *
     * @param broadcaster - Appointment update fan-out.
     * @param appointmentId - Appointment that changed.
     */
    private static void PublishAppointmentChanged(IAppointmentUpdateBroadcaster broadcaster, int appointmentId)
        => broadcaster.Publish(new AppointmentUpdatedEvent(
            appointmentId,
            DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()));
}
