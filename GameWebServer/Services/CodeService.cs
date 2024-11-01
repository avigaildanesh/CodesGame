using GameWebServer.Data;
using GameWebServer.Models;
using Microsoft.EntityFrameworkCore;

namespace GameWebServer.Services
{
    public interface IUserCodesService
    {
        Task<UserCode> GetUserCodeByIdAsync(int id);
        Task<bool> CreateUserCodeAsync(UserCode userCode);
        Task<bool> DeleteUserCodeAsync(int id);
        Task<bool> EditUserCodeAsync(int id, string title, string code);
        Task<IEnumerable<UserCode>> GetUserCodeByUserId(int id);
        Task<bool> SelectCode(int id);
    }
    public class CodeService : IUserCodesService
    {
        private readonly AppDbContext _context;

        public CodeService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<UserCode>> GetUserCodeByUserId(int id)
        {
            return await _context.UserCodes.Where(x => x.UserId == id).ToListAsync();
        }

        public async Task<UserCode> GetUserCodeByIdAsync(int id)
        {
            return await _context.UserCodes.Include(x => x.User).FirstOrDefaultAsync(x => x.Id == id);
        }

        public async Task<bool> CreateUserCodeAsync(UserCode userCode)
        {
            userCode.CreatedDate = DateTime.UtcNow; // Automatically set creation date
            _context.UserCodes.Add(userCode);
            await _context.SaveChangesAsync();
            return true;
        }


        public async Task<bool> DeleteUserCodeAsync(int id)
        {
            var userCode = await _context.UserCodes.FindAsync(id);
            if (userCode == null)
            {
                return false;
            }

            _context.UserCodes.Remove(userCode);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> EditUserCodeAsync(int id, string title, string code)
        {
            var uc = await GetUserCodeByIdAsync(id);
            uc.Code = code;
            uc.Title = title;
            return await _context.SaveChangesAsync() > 0;
        }

        public async Task<bool> SelectCode(int id)
        {
            var uc = await GetUserCodeByIdAsync(id);
            uc.User.SelectedCodeId = uc.Id;
            return await _context.SaveChangesAsync() > 0;
        }
    }
}
