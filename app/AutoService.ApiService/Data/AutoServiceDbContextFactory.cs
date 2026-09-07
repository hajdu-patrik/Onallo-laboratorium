using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace AutoService.ApiService.Data;

/**
 * Design-time DbContext factory used by the EF Core tools.
 *
 * Without this, {@code dotnet ef} builds the context through the application host, which fail-fasts
 * on runtime configuration the tools have no reason to need — the connection string, the JWT secret,
 * then the object storage endpoint and credentials. Those live in the gitignored
 * appsettings.Local.json, so the offline schema gate could never run on a clean machine or in CI.
 *
 * The offline commands (for example {@code migrations has-pending-model-changes}) only compare the
 * model against the last migration and never open a connection, so a placeholder connection string
 * is enough. A real one can still be supplied through {@code ConnectionStrings__AutoServiceDb} for
 * commands that do reach the database.
 */
internal sealed class AutoServiceDbContextFactory : IDesignTimeDbContextFactory<AutoServiceDbContext>
{
    /** Placeholder used when no connection string is supplied; never contacted by offline commands. */
    private const string DesignTimeFallbackConnectionString =
        "Host=localhost;Port=5432;Database=AutoServiceDb;Username=design-time;Password=design-time";

    /**
     * Builds a context configured only enough for the EF Core tooling.
     *
     * @param args Arguments forwarded by the EF tools; unused.
     * @return A context bound to the Npgsql provider.
     */
    public AutoServiceDbContext CreateDbContext(string[] args)
    {
        var connectionString = Environment.GetEnvironmentVariable("ConnectionStrings__AutoServiceDb");

        var options = new DbContextOptionsBuilder<AutoServiceDbContext>()
            .UseNpgsql(string.IsNullOrWhiteSpace(connectionString)
                ? DesignTimeFallbackConnectionString
                : connectionString)
            .Options;

        return new AutoServiceDbContext(options);
    }
}
