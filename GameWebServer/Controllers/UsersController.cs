using GameWebServer.Models;
using GameWebServer.Services;
using GameWebServer.Utilities;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Text.Json.Nodes;

namespace GameWebServer.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UsersController : Controller
    {
        private readonly IUsersService usersDbService;
        private readonly string secretKey;

        public UsersController(IUsersService usersService, IConfiguration configuration)
        {
            this.secretKey = configuration["JWTParams:SecretKey"];
            this.usersDbService = usersService;
        }

        [HttpGet("GetProfile")]
        [Permission(Role.User)]
        public async Task<ActionResult<User>> GetProfile([FromQuery] string username)
        {
            var user = await usersDbService.GetUser(username);
            if (user == null)
            {
                return NotFound();
            }
            return Ok(user);
        }

        [HttpPost("Register")]
        public async Task<ActionResult<bool>> Register([FromBody] JsonObject body)
        {
            var result = await usersDbService.Register(body["username"].ToString(), body["password"].ToString(), body["displayName"].ToString());
            if (result)
            {
                return Ok();
            }
            else
            {
                return Forbid();
            }
        }

        // GET: Users/Details/5
        [HttpPost("Login")]
        public async Task<ActionResult<User?>> Login([FromBody] JsonObject body)
        {
            var user = await usersDbService.Login(body["username"].ToString(), body["password"].ToString());
            if (user == null)
            {
                return Forbid();
            }

            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.ASCII.GetBytes(secretKey);

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new Claim[]
                {
                    new Claim(ClaimTypes.Name, user.Username),
                    new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                    new Claim(ClaimTypes.Role, user.Role.ToString())
                }),
                Expires = DateTime.UtcNow.AddDays(1),
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };

            var token = tokenHandler.CreateToken(tokenDescriptor);
            var tokenString = tokenHandler.WriteToken(token);

            return Ok(new { Token = tokenString, User = user });
        }
        [HttpPost("Change")]
        [Permission(Role.User)]
        public async Task<ActionResult> Change([FromBody] JsonObject body)
        {
            var usernameClaim = HttpContext.User.Claims.FirstOrDefault(x => x.Type == ClaimTypes.Name);
            var roleClaim = HttpContext.User.Claims.FirstOrDefault(x => x.Type == ClaimTypes.Role);
            if (usernameClaim == null || roleClaim == null)
            {
                return Forbid();
            }
            if (!int.TryParse(roleClaim.Value, out var roleInt))
            {
                return Forbid();
            }
            var role = (Role)roleInt;
            var username = body["username"].ToString();
            if (usernameClaim.Value != username && role < Role.Admin)
            {
                return Forbid();
            }


            var password = body["password"].ToString();
            var displayName = body["displayName"].ToString();

            if (role >= Role.Admin)
            {
                if (!int.TryParse(body["role"].ToString(), out roleInt))
                {
                    return BadRequest();
                }
                role = (Role)roleInt;
            }

            var result = await usersDbService.EditUser(new User() { Username = username, DisplayName = displayName, Password = password, Role = role });
            if (result)
            {
                return Ok();
            }
            else
            {
                return Forbid();
            }
        }

        [HttpPost("Search")]
        [Permission(Role.User)]
        public async Task<ActionResult<List<User>>> Search([FromBody] JsonObject body)
        {
            if (body.ContainsKey("username"))
            {
                var username = body["username"].ToString();
                return await usersDbService.Search(username, HttpContext.GetCurrentUserId()!.Value);
            }
            return BadRequest();
        }
    }
}
