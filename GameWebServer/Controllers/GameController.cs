using GameWebServer.Models;
using GameWebServer.Services;
using GameWebServer.Utilities;
using Microsoft.AspNetCore.Mvc;

namespace GameWebServer.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class GameController : ControllerBase
    {
        private IGameService gameService;
        private IUsersService usersService;

        public GameController(IGameService gameService, IUsersService usersService)
        {
            this.gameService = gameService;
            this.usersService = usersService;
        }

        [HttpGet("Get")]
        public async Task<ActionResult> GetGame([FromQuery] int id)
        {
            return Ok(await gameService.GetGame(id));
        }

        [HttpGet("Latest")]
        public async Task<ActionResult> GetLatest()
        {
            return Ok(await gameService.GetLatest());
        }

        [HttpGet("GetHistory")]
        [Permission(Role.User)]
        public async Task<ActionResult> GetGameHistory()
        {
            var playerId = HttpContext.GetCurrentUserId()!.Value;
            return Ok(await gameService.GetHistory(playerId));
        }

        [HttpGet("Start")]
        [Permission(Role.User)]
        public async Task<ActionResult> StartGame([FromQuery] int player2)
        {
            var user1 = await usersService.GetUserById(HttpContext.GetCurrentUserId()!.Value);


            if (!user1.Friends.Any(x => (x.UserId == user1.Id && x.FriendId == player2) || (x.UserId == player2 && x.FriendId == user1.Id)))
            {
                return Forbid();
            }

            var user2 = await usersService.GetUserById(player2);

            if (user1.SelectedCode == null || user2.SelectedCode == null)
            {
                return NotFound();
            }

            return Ok(await gameService.StartGame(user1, user2));


        }
        [HttpGet("Stats")]
        [Permission(Role.User)]
        public async Task<ActionResult> GetStats()
        {
            return Ok(await gameService.GetStats());
        }
    }
}
