import { expect, test } from '@playwright/test';
import { AuthPage } from './pages/auth.page';
import { SchedulerPage } from './pages/scheduler.page';
import { getAppointmentFlowEnv } from './support/e2e-env';
import { installApiMocks } from './support/api-mocks';

test.describe('Scheduler live update channel', () => {
  test('refreshes scheduler reads when an appointment update event arrives', async ({ page }) => {
    const env = getAppointmentFlowEnv();
    const routeCallLog: string[] = [];
    await installApiMocks(page, { profileEmail: env.mechanicEmail, routeCallLog });
    await new AuthPage(page).loginAsMechanic(env);
    await new SchedulerPage(page).goto();

    // The scheduler must have opened the live stream while mounted.
    await expect
      .poll(() => routeCallLog.filter((key) => key === 'GET /api/appointments/updates').length)
      .toBeGreaterThanOrEqual(1);

    const readsBefore = routeCallLog.filter((key) => key === 'GET /api/appointments').length;

    // Simulate the event the SSE channel dispatches when someone else changes an appointment.
    await page.evaluate(() => {
      globalThis.dispatchEvent(new CustomEvent('autoservice:appointment-updated', {
        detail: { appointmentId: 1, occurredAt: Date.now() },
      }));
    });

    await expect
      .poll(() => routeCallLog.filter((key) => key === 'GET /api/appointments').length)
      .toBeGreaterThan(readsBefore);
  });
});
