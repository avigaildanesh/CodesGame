using GameWebServer.Data;
using GameWebServer.Models;
using System;
using System.Security.Cryptography;
using GameWebServer.Utilities;
using Microsoft.EntityFrameworkCore;

namespace GameWebServer.Services
{
    public interface IUsersService
    {
        public Task<User?> GetUserById(int id);
        public Task<User?> GetUser(string username);
        public Task<User?> Login(string username, string password);
        public Task<bool> Register(string username, string password, string displayName);
        public Task<bool> EditUser(User editedUser);
        public Task<List<User>> Search(string username, int currentUserId);
    }
    public class UsersService : IUsersService
    {
        private readonly AppDbContext _context;
        public UsersService(AppDbContext context)
        {
            _context = context;
        }

        public Task<User?> GetUser(string username)
        {
            return _context.Users.FirstOrDefaultAsync(x => x.Username == username);
        }

        public Task<User?> Login(string username, string password)
        {
            return _context.Users.Include(x => x.Friends).Include(x => x.UserCodes).Include(x => x.SelectedCode).FirstOrDefaultAsync(x => x.Username == username && x.Password == Hash.Sha512(password));
        }

        public async Task<bool> EditUser(User editedUser)
        {
            var user = await GetUser(editedUser.Username);
            if (user == null)
            {
                return false;
            }

            user.DisplayName = editedUser.DisplayName;
            user.Password = editedUser.Password;
            user.Role = editedUser.Role;

            return await _context.SaveChangesAsync() > 0;
        }

        public async Task<bool> Register(string username, string password, string displayName)
        {
            var user = await GetUser(username);
            if (user == null)
            {
                user = new User() { Username = username, Password = Hash.Sha512(password), DisplayName = displayName, Role = Role.User };
                await _context.Users.AddAsync(user);
                return await _context.SaveChangesAsync() > 0;
            }
            else
            {
                return false;
            }
        }

        public Task<List<User>> Search(string username, int currentUserId)
        {
            return _context.Users.Where(x => x.Username.StartsWith(username) && x.Id != currentUserId).ToListAsync();
        }

        public async Task<User?> GetUserById(int id)
        {
            return await _context.Users.Include(x=> x.Friends).Include(x=> x.SelectedCode).Where(x => x.Id == id).FirstOrDefaultAsync();
        }
    }
}
