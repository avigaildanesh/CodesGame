using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace GameWebServer.Services
{
    public interface IJwtTokenValidator
    {
        ClaimsPrincipal ValidateToken(string token);
    }

    public class JwtTokenValidator : IJwtTokenValidator
    {
        private readonly byte[] _secretKey;

        public JwtTokenValidator(IConfiguration configuration)
        {
            _secretKey = Encoding.ASCII.GetBytes(configuration["JWTParams:SecretKey"]);
        }

        public ClaimsPrincipal? ValidateToken(string token)
        {
            var tokenHandler = new JwtSecurityTokenHandler();

            try
            {
                var claimsPrincipal = tokenHandler.ValidateToken(token, new TokenValidationParameters
                {
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = new SymmetricSecurityKey(_secretKey),
                    ValidateIssuer = false,
                    ValidateAudience = false,
                }, out SecurityToken validatedToken);

                return claimsPrincipal;
            }
            catch (Exception)
            {
                return null;  // Return null if the token is invalid
            }
        }
    }
}
