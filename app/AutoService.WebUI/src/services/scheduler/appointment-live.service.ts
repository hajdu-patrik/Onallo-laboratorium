/**
 * Real-time appointment update service.
 *
 * Subscribes to {@code /api/appointments/updates} and re-dispatches
 * {@code autoservice:appointment-updated} DOM events. This is what makes another user's scheduler
 * change appear without waiting for the periodic background refresh.
 *
 * The payload is deliberately minimal: consumers refresh the view they are currently showing rather
 * than patching local state, because an appointment can move between months and patching would have
 * to reason about both the old and the new bucket to stay correct.
 * @module services/scheduler/appointment-live.service
 */

import { appointmentService } from './appointment.service';
import { createLiveUpdateChannel } from '../live/live-update-channel';

/** Custom event name dispatched when any appointment changes. */
export const APPOINTMENT_UPDATED_EVENT = 'autoservice:appointment-updated';

/** Detail payload for the {@code autoservice:appointment-updated} custom event. */
export interface AppointmentUpdatedDetail {
  /** Appointment that changed. */
  appointmentId: number;
  /** Unix milliseconds when the change was published. */
  occurredAt: number;
}

/**
 * Parses a raw SSE data string into a typed appointment update detail.
 * @param data - The raw JSON string from the SSE message.
 * @returns Parsed detail, or {@code null} if the data is invalid.
 */
function parseAppointmentUpdate(data: string): AppointmentUpdatedDetail | null {
  try {
    const parsed = JSON.parse(data) as Partial<AppointmentUpdatedDetail>;
    if (typeof parsed.appointmentId !== 'number' || typeof parsed.occurredAt !== 'number') {
      return null;
    }

    return { appointmentId: parsed.appointmentId, occurredAt: parsed.occurredAt };
  } catch {
    return null;
  }
}

const channel = createLiveUpdateChannel<AppointmentUpdatedDetail>({
  resolveUrl: () => appointmentService.getAppointmentUpdatesUrl(),
  sseEventName: 'appointment-updated',
  domEventName: APPOINTMENT_UPDATED_EVENT,
  parse: parseAppointmentUpdate,
});

/**
 * Subscribes to real-time appointment updates. Starts the SSE connection on the first subscriber
 * and tears it down when the last subscriber unsubscribes.
 * @returns An unsubscribe function that decrements the subscriber count.
 */
export function startAppointmentLiveUpdates(): () => void {
  return channel.start();
}
