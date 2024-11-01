using GameWebServer.Models;
using GameWebServer.Services;
using GameWebServer.Utilities;
using Microsoft.AspNetCore.Cors.Infrastructure;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore.Metadata.Internal;
using System.Text.Json.Nodes;

namespace GameWebServer.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ReportController : ControllerBase
    {
        private readonly IUsersService usersService;
        private readonly IReportService reportService;
        public ReportController(IUsersService usersService, IReportService reportService)
        {
            this.usersService = usersService;
            this.reportService = reportService;
        }

        [HttpGet("GetReports")]
        [Permission(Role.Admin)]
        public async Task<ActionResult<IEnumerable<GameReport>>> GetAllReports()
        {
            return Ok(await reportService.GetAllReports());
        }

        [HttpGet("Submit")]
        [Permission(Role.User)]
        public async Task<ActionResult<bool>> Submit([FromQuery] int gameId, [FromQuery] string message)
        {
            GameReport gr = new GameReport() { GameResultId = gameId, ReportContent = message, ReporterId = HttpContext.GetCurrentUserId().Value };
            return Ok(await reportService.SubmitReport(gr));
        }

        [HttpGet("Delete")]
        [Permission(Role.Admin)]
        public async Task<ActionResult<IEnumerable<GameReport>>> DeleteReport([FromQuery] int reportId)
        {
            await reportService.DeleteReport(reportId);
            return Ok(await reportService.GetAllReports());
        }

        [HttpGet("BanUser")]
        [Permission(Role.Admin)]
        public async Task<ActionResult<IEnumerable<GameReport>>> BanUser([FromQuery] int userId, [FromQuery] int reportId)
        {

            await reportService.BanUser(userId, reportId);
            await reportService.DeleteReport(reportId);
            return Ok(await reportService.GetAllReports());
        }


    }
}
