/**
 * Real-time profile picture update service.
 *
 * Subscribes to {@code /api/profile/picture/updates} and re-dispatches
 * {@code autoservice:profile-picture-updated} DOM events for consumers (sidebar avatar, scheduler
 * mechanic avatars) to react to. Connection lifecycle, auth-aware reconnect and teardown live in
 * the shared {@link createLiveUpdateChannel} factory.
 * @module services/profile/profile-picture-live.service
 */

import { profileService } from './profile.service';
import { createLiveUpdateChannel } from '../live/live-update-channel';

/** Custom event name dispatched on profile picture changes. */
export const PROFILE_PICTURE_UPDATED_EVENT = 'autoservice:profile-picture-updated';

/**
 * Detail payload for the {@code autoservice:profile-picture-updated} custom event.
 */
export interface ProfilePictureUpdatedDetail {
  /** Person ID whose profile picture changed. */
  personId: number;
  /** Whether the person currently has a profile picture. */
  hasProfilePicture: boolean;
  /** Cache-busting timestamp to force image reload. */
  cacheBuster: number;
}

/**
 * Parses a raw SSE data string into a typed profile picture update detail.
 * @param data - The raw JSON string from the SSE message.
 * @returns Parsed detail, or {@code null} if the data is invalid.
 */
function parseProfilePictureUpdate(data: string): ProfilePictureUpdatedDetail | null {
  try {
    const parsed = JSON.parse(data) as Partial<ProfilePictureUpdatedDetail>;
    if (
      typeof parsed.personId !== 'number' ||
      typeof parsed.hasProfilePicture !== 'boolean' ||
      typeof parsed.cacheBuster !== 'number'
    ) {
      return null;
    }

    return {
      personId: parsed.personId,
      hasProfilePicture: parsed.hasProfilePicture,
      cacheBuster: parsed.cacheBuster,
    };
  } catch {
    return null;
  }
}

const channel = createLiveUpdateChannel<ProfilePictureUpdatedDetail>({
  resolveUrl: () => profileService.getProfilePictureUpdatesUrl(),
  sseEventName: 'profile-picture-updated',
  domEventName: PROFILE_PICTURE_UPDATED_EVENT,
  parse: parseProfilePictureUpdate,
});

/**
 * Subscribes to real-time profile picture updates. Starts the SSE connection on the first
 * subscriber and tears it down when the last subscriber unsubscribes.
 * @returns An unsubscribe function that decrements the subscriber count.
 */
export function startProfilePictureLiveUpdates(): () => void {
  return channel.start();
}

/**
 * Manually emits a profile picture updated event (for example after a local upload or delete).
 * Auto-generates a cache-buster timestamp if not provided.
 * @param detail - The update detail with optional cache-buster override.
 */
export function emitProfilePictureUpdated(
  detail: Omit<ProfilePictureUpdatedDetail, 'cacheBuster'> & { cacheBuster?: number },
): void {
  channel.dispatch({
    ...detail,
    cacheBuster: detail.cacheBuster ?? Date.now(),
  });
}
