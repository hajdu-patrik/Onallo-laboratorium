using System.Security.Claims;
using AutoService.ApiService.Data;
using AutoService.ApiService.Models.UniqueTypes;
using Microsoft.EntityFrameworkCore;

namespace AutoService.ApiService.Appointments;

public static partial class AppointmentEndpoints
{
    private static async Task<IResult> ClaimAsync(
        int id,
        ClaimsPrincipal user,
        AutoServiceDbContext db,
        CancellationToken cancellationToken)
    {
        var personIdClaim = user.FindFirst("person_id")?.Value;
        if (string.IsNullOrWhiteSpace(personIdClaim) || !int.TryParse(personIdClaim, out var mechanicId))
        {
            return Results.Unauthorized();
        }

        var mechanic = await db.Mechanics.FindAsync([mechanicId], cancellationToken);
        if (mechanic is null)
        {
            return Results.Unauthorized();
        }

        var appointment = await db.Appointments
            .Include(a => a.Mechanics)
            .Include(a => a.Vehicle).ThenInclude(v => v.Customer)
            .FirstOrDefaultAsync(a => a.Id == id, cancellationToken);

        if (appointment is null)
        {
            return Results.NotFound(new { code = "appointment_not_found" });
        }

        if (appointment.Status == ProgresStatus.Cancelled)
        {
            return Results.UnprocessableEntity(new { code = "appointment_cancelled" });
        }

        if (appointment.Mechanics.Any(m => m.Id == mechanicId))
        {
            return Results.Conflict(new { code = "already_claimed" });
        }

        appointment.Mechanics.Add(mechanic);

        try
        {
            await db.SaveChangesAsync(cancellationToken);
        }
        catch (DbUpdateException)
        {
            return Results.Conflict(new { code = "already_claimed" });
        }

        return Results.Ok(ToDto(appointment));
    }

    private static async Task<IResult> UpdateStatusAsync(
        int id,
        UpdateStatusRequest request,
        ClaimsPrincipal user,
        AutoServiceDbContext db,
        CancellationToken cancellationToken)
    {
        if (!Enum.TryParse<ProgresStatus>(request.Status, ignoreCase: true, out var newStatus))
        {
            return Results.BadRequest(new { code = "invalid_status", error = $"Valid statuses: {string.Join(", ", Enum.GetNames<ProgresStatus>())}" });
        }

        var personIdClaim = user.FindFirst("person_id")?.Value;
        if (string.IsNullOrWhiteSpace(personIdClaim) || !int.TryParse(personIdClaim, out var mechanicId))
        {
            return Results.Unauthorized();
        }

        var appointment = await db.Appointments
            .Include(a => a.Mechanics)
            .Include(a => a.Vehicle).ThenInclude(v => v.Customer)
            .FirstOrDefaultAsync(a => a.Id == id, cancellationToken);

        if (appointment is null)
        {
            return Results.NotFound(new { code = "appointment_not_found" });
        }

        if (!appointment.Mechanics.Any(m => m.Id == mechanicId))
        {
            return Results.Forbid();
        }

        appointment.Status = newStatus;
        await db.SaveChangesAsync(cancellationToken);

        return Results.Ok(ToDto(appointment));
    }
}