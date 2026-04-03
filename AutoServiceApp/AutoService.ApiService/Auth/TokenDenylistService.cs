using Microsoft.Extensions.Caching.Memory;

namespace AutoService.ApiService.Auth;

internal interface ITokenDenylistService
{
    void Revoke(string jwtId, DateTimeOffset expiresAtUtc);
    bool IsRevoked(string jwtId);
}

internal sealed class TokenDenylistService(IMemoryCache memoryCache) : ITokenDenylistService
{
    private const string KeyPrefix = "denylist-jti:";

    public void Revoke(string jwtId, DateTimeOffset expiresAtUtc)
    {
        var remaining = expiresAtUtc - DateTimeOffset.UtcNow;
        if (remaining <= TimeSpan.Zero)
        {
            return;
        }

        memoryCache.Set(BuildKey(jwtId), true, remaining);
    }

    public bool IsRevoked(string jwtId)
        => memoryCache.TryGetValue(BuildKey(jwtId), out _);

    private static string BuildKey(string jwtId) => $"{KeyPrefix}{jwtId}";
}
