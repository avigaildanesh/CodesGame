using GameWebServer.Models;
using GameWebServer.Services;
using GameWebServer.Utilities;
using Microsoft.AspNetCore.Mvc;
using System.Text.Json.Nodes;

namespace GameWebServer.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CodeController : ControllerBase
    {
        private readonly IUserCodesService codeService;
        public CodeController(IUserCodesService codeService)
        {
            this.codeService = codeService;
        }

        [HttpGet("Get")]
        [Permission(Role.User)]
        public async Task<ActionResult<UserCode>> Get(int id)
        {
            var currentUser = HttpContext.GetCurrentUserId();
            var code = await codeService.GetUserCodeByIdAsync(id);
            if (code == null)
            {
                return Forbid();
            }

            if (code.UserId == currentUser || HttpContext.GetCurrentUserRole() >= Role.Admin)
            {
                return Ok(code);
            }
            else
            {
                return Forbid();
            }
        }

        [HttpGet("GetMyCodes")]
        [Permission(Role.User)]
        public async Task<ActionResult<IEnumerable<UserCode>>> GetMyCodes()
        {
            var currentUser = HttpContext.GetCurrentUserId();
            return Ok(await codeService.GetUserCodeByUserId(currentUser.Value));
        }

        [HttpPost("Create")]
        [Permission(Role.User)]
        public async Task<ActionResult<IEnumerable<UserCode>>> CreateUserCode([FromBody] JsonObject body)
        {
            if (body == null || !body.ContainsKey("title") || !body.ContainsKey("code"))
            {
                return BadRequest();
            }

            var title = body["title"].ToString();
            var code = body["code"].ToString();
            var userId = HttpContext.GetCurrentUserId().Value;

            var userCode = new UserCode() { Code = code, Title = title, UserId = userId, CreatedDate = DateTime.UtcNow };
            await codeService.CreateUserCodeAsync(userCode);
            return Ok(await codeService.GetUserCodeByUserId(userId));

        }

        [HttpPost("Edit")]
        [Permission(Role.User)]
        public async Task<ActionResult<bool>> EditUserCode([FromBody] JsonObject body)
        {
            if (body == null || !body.ContainsKey("id") || !body.ContainsKey("title") || !body.ContainsKey("code"))
            {
                return BadRequest();
            }

            var id_str = body["id"].ToString();
            var id = int.Parse(id_str);
            var title = body["title"].ToString();
            var code = body["code"].ToString();
            var currentUser = HttpContext.GetCurrentUserId();
            var usercode = await codeService.GetUserCodeByIdAsync(id);
            if (usercode.UserId != currentUser)
            {
                return Forbid();
            }

            await codeService.EditUserCodeAsync(id, title, code);
            return Ok(await codeService.GetUserCodeByUserId(currentUser.Value));

        }

        [HttpPost("Delete")]
        [Permission(Role.User)]
        public async Task<ActionResult<IEnumerable<UserCode>>> Delete([FromBody] JsonObject body)
        {
            if (body == null || !body.ContainsKey("id"))
            {
                Forbid();
            }

            var idStr = body["id"].ToString();
            if (!int.TryParse(idStr, out int id))
            {
                Forbid();
            }
            var currentUser = HttpContext.GetCurrentUserId();
            var code = await codeService.GetUserCodeByIdAsync(id);
            if (code == null)
            {
                return Forbid();
            }

            if (code.UserId == currentUser || HttpContext.GetCurrentUserRole() >= Role.Admin)
            {
                await codeService.DeleteUserCodeAsync(id);
                return Ok(await codeService.GetUserCodeByUserId(currentUser.Value));
            }
            else
            {
                return Forbid();
            }
        }

        [HttpPost("Select")]
        [Permission(Role.User)]
        public async Task<ActionResult<IEnumerable<UserCode>>> Select([FromBody] JsonObject body)
        {
            if (body == null || !body.ContainsKey("id"))
            {
                Forbid();
            }

            var idStr = body["id"].ToString();
            if (!int.TryParse(idStr, out int id))
            {
                Forbid();
            }
            var currentUser = HttpContext.GetCurrentUserId();
            var code = await codeService.GetUserCodeByIdAsync(id);
            if (code == null)
            {
                return Forbid();
            }

            if (code.UserId == currentUser || HttpContext.GetCurrentUserRole() >= Role.Admin)
            {
                await codeService.SelectCode(id);
                return Ok(await codeService.GetUserCodeByUserId(currentUser.Value));
            }
            else
            {
                return Forbid();
            }
        }
    }
}
