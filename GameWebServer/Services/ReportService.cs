using GameWebServer.Data;
using GameWebServer.Models;
using Microsoft.EntityFrameworkCore;

namespace GameWebServer.Services
{
    public interface IReportService
    {
        Task<IEnumerable<GameReport>> GetAllReports();
        Task<bool> SubmitReport(GameReport report);
        Task<bool> DeleteReport(int reportId);
        Task<bool> BanUser(int userId, int reportId);
        Task<bool> IsUserBanned(int userId);
    }
    public class ReportService : IReportService
    {
        private readonly AppDbContext _context;
        public ReportService(AppDbContext context)
        {
            this._context = context;
        }

        public async Task<bool> BanUser(int userId, int reportId)
        {
            var bannedUser = new BannedUser { UserId = userId, ReportId = reportId };
            _context.BannedUsers.Add(bannedUser);
            PermissionAttribute.bannedUsers.Add(bannedUser);
            return await _context.SaveChangesAsync() > 0;
        }

        public async Task<bool> DeleteReport(int reportId)
        {
            var report = await _context.GameReports.Where(x => x.Id == reportId).FirstOrDefaultAsync();
            if (report != null)
            {
                report.IsDeleted = true;
            }
            return await _context.SaveChangesAsync() > 0;
        }

        public async Task<IEnumerable<GameReport>> GetAllReports()
        {
            return await _context.GameReports.Where(x => !x.IsDeleted).Include(x => x.GameResult).Include(x => x.GameResult.User1).Include(x => x.GameResult.User2).ToListAsync();
        }

        public async Task<bool> SubmitReport(GameReport report)
        {
            _context.GameReports.Add(report);
            return await _context.SaveChangesAsync() > 0;
        }

        public async Task<bool> IsUserBanned(int userId)
        {
            return await _context.BannedUsers.AnyAsync(x => x.UserId == userId);
        }
    }
}
