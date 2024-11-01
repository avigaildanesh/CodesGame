using GameWebServer.Services;
using GameWebServer.Utilities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;

namespace GameWebServer.Models
{

    public class PermissionAttribute : Attribute, IAuthorizationFilter
    {
        public static readonly List<BannedUser> bannedUsers = new List<BannedUser>();
        private readonly Role _minimumRole;

        public PermissionAttribute(Role minimumRole)
        {
            _minimumRole = minimumRole;
        }

        public async void OnAuthorization(AuthorizationFilterContext context)
        {
            var authHeader = context.HttpContext.Request.Headers["Authorization"].FirstOrDefault();
            if (string.IsNullOrEmpty(authHeader) || !authHeader.StartsWith("Bearer "))
            {
                context.Result = new UnauthorizedResult();
                return;
            }

            var token = authHeader.Substring("Bearer ".Length).Trim();

            // Resolve the JWT Token Validator service using the IServiceProvider
            var tokenValidator = context.HttpContext.RequestServices.GetService<IJwtTokenValidator>();

            var claimsPrincipal = tokenValidator.ValidateToken(token);
            if (claimsPrincipal == null)
            {
                context.Result = new UnauthorizedResult(); // Token validation failed
                return;
            }

            // Extract the role from claims
            context.HttpContext.User = claimsPrincipal;
            var roleClaim = claimsPrincipal.Claims.FirstOrDefault(c => c.Type == ClaimTypes.Role);
            if (roleClaim != null && Enum.TryParse(roleClaim.Value, out Role userRole))
            {

                var userId = context.HttpContext.GetCurrentUserId().Value;
                if (!bannedUsers.Any(x => x.UserId == userId) && userRole >= _minimumRole)
                {
                    return; // Authorized
                }
            }

            context.Result = new ForbidResult(); // Role not sufficient
        }
    }
}