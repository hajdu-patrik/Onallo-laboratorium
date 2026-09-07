using AutoService.ApiService.Realtime;

namespace AutoService.ApiService.Appointments.Realtime;

/**
 * Payload published whenever an appointment is created or changed.
 *
 * The payload stays deliberately small. Subscribers refresh the view they are currently showing
 * rather than patching state from the event, because an appointment can move between months and a
 * client would otherwise have to reason about both the old and the new bucket to stay correct.
 *
 * @param AppointmentId Appointment that changed.
 * @param OccurredAt Unix milliseconds, so clients can ignore events older than their last refresh.
 */
internal sealed record AppointmentUpdatedEvent(
    int AppointmentId,
    long OccurredAt);

/** Fan-out channel for appointment changes. */
internal interface IAppointmentUpdateBroadcaster : IUpdateBroadcaster<AppointmentUpdatedEvent>;

/**
 * Appointment channel over the shared bounded fan-out.
 *
 * Concurrency handling lives in {@code UpdateBroadcaster<TEvent>}; this type only fixes the payload
 * so the DI container can resolve an appointment-specific dependency, and so this channel gets its
 * own subscription budget instead of competing with the profile-picture one.
 */
internal sealed class AppointmentUpdateBroadcaster
    : UpdateBroadcaster<AppointmentUpdatedEvent>, IAppointmentUpdateBroadcaster;
