using GameWebServer.Models;
using GameWebServer.Services;
using Microsoft.AspNetCore.Mvc;
using System.Text.Json.Nodes;
using GameWebServer.Utilities;

namespace GameWebServer.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class FriendController : ControllerBase
    {
        private readonly IFriendService friendService;
        public FriendController(IFriendService friendService)
        {
            this.friendService = friendService;
        }

        [HttpGet("Get")]
        [Permission(Role.User)]
        public async Task<ActionResult<IEnumerable<Friendship>>> Get()
        {
            var currentUserId = HttpContext.GetCurrentUserId();
            return Ok(await friendService.GetFriendsAsync(currentUserId.Value));
        }

        [HttpPost("Invite")]
        [Permission(Role.User)]
        public async Task<ActionResult<bool>> Invite([FromBody] JsonObject body)
        {
            int from, to;
            if (body.ContainsKey("from") && body.ContainsKey("to"))
            {
                if (int.TryParse(body["from"].ToString(), out from) && int.TryParse(body["to"].ToString(), out to))
                {
                    var currentUserId = HttpContext.GetCurrentUserId();
                    if (currentUserId == from)
                    {
                        return await friendService.AddFriendAsync(from, to);
                    }
                    else
                    {
                        return Forbid();
                    }
                }
            }

            return Problem();
        }

        [HttpPost("Accept")]
        [Permission(Role.User)]
        public async Task<ActionResult<bool>> Accept([FromBody] JsonObject body)
        {
            int from, to;
            if (body.ContainsKey("from") && body.ContainsKey("to"))
            {
                if (int.TryParse(body["from"].ToString(), out from) && int.TryParse(body["to"].ToString(), out to))
                {
                    var currentUserId = HttpContext.GetCurrentUserId();
                    if (currentUserId == to)
                    {
                        return await friendService.AcceptFriendRequestAsync(from, to);
                    }
                    else
                    {
                        return Forbid();
                    }
                }
            }

            return Problem();
        }

        [HttpPost("Reject")]
        [Permission(Role.User)]
        public async Task<ActionResult<bool>> Reject([FromBody] JsonObject body)
        {
            int from, to;
            if (body.ContainsKey("from") && body.ContainsKey("to"))
            {
                if (int.TryParse(body["from"].ToString(), out from) && int.TryParse(body["to"].ToString(), out to))
                {
                    var currentUserId = HttpContext.GetCurrentUserId();
                    if (currentUserId == to)
                    {
                        return await friendService.RejectFriendRequestAsync(from, to);
                    }
                    else
                    {
                        return Forbid();
                    }
                }
            }

            return Problem();
        }

        [HttpPost("Remove")]
        [Permission(Role.User)]
        public async Task<ActionResult<bool>> Remove([FromBody] JsonObject body)
        {
            int from, to;
            if (body.ContainsKey("from") && body.ContainsKey("to"))
            {
                if (int.TryParse(body["from"].ToString(), out from) && int.TryParse(body["to"].ToString(), out to))
                {
                    var currentUserId = HttpContext.GetCurrentUserId();
                    if (currentUserId == from || currentUserId == to)
                    {
                        return await friendService.RemoveFriendAsync(from, to);
                    }
                    else
                    {
                        return Forbid();
                    }
                }
            }

            return Problem();
        }
    }
}
