using GameWebServer.Models;
using System.Security.Claims;

namespace GameWebServer.Utilities
{
    public static class ExtensionMethods
    {
        public static string? GetCurrentUsername(this HttpContext context)
        {
            if (context != null)
            {
                var usernameClaim = context.User.Claims.FirstOrDefault(x => x.Type == ClaimTypes.Name);
                var roleClaim = context.User.Claims.FirstOrDefault(x => x.Type == ClaimTypes.Role);
                if (usernameClaim == null)
                {
                    return null;
                }
                return usernameClaim.Value;
            }
            return null;
        }
        public static Role? GetCurrentUserRole(this HttpContext context)
        {
            if (context != null)
            {
                var roleClaim = context.User.Claims.FirstOrDefault(x => x.Type == ClaimTypes.Role);
                if (roleClaim == null)
                {
                    return null;
                }
                if (int.TryParse(roleClaim.Value, out var roleInt))
                {
                    return (Role)roleInt;
                }

            }
            return null;
        }

        public static int? GetCurrentUserId(this HttpContext context)
        {
            if (context != null)
            {
                var userIdClaim = context.User.Claims.FirstOrDefault(x => x.Type == ClaimTypes.NameIdentifier);
                if (userIdClaim == null)
                {
                    return null;
                }
                if (int.TryParse(userIdClaim.Value, out var userId))
                {
                    return userId;
                }

            }
            return null;
        }
    }
}
