using GameWebServer.Data;
using GameWebServer.Models;
using Microsoft.EntityFrameworkCore;

namespace GameWebServer.Services
{
    public interface IFriendService
    {
        public Task<bool> AddFriendAsync(int userId, int friendId);
        public Task<IEnumerable<Friendship>> GetFriendsAsync(int userId);
        public Task<bool> AcceptFriendRequestAsync(int userId, int friendId);
        public Task<bool> RejectFriendRequestAsync(int userId, int friendId);
        public Task<bool> RemoveFriendAsync(int userId, int friendId);


    }
    public class FriendService : IFriendService
    {
        private readonly AppDbContext _context;

        public FriendService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<bool> AddFriendAsync(int userId, int friendId)
        {
            // Check if a friendship already exists
            var existingFriendship = await _context.Friendships
                .FirstOrDefaultAsync(f => f.UserId == userId && f.FriendId == friendId);

            if (existingFriendship != null)
            {
                return false; // Friendship already exists
            }

            var friendship = new Friendship
            {
                UserId = userId,
                FriendId = friendId,
                Status = FriendshipStatus.Pending
            };

            _context.Friendships.Add(friendship);
            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<IEnumerable<Friendship>> GetFriendsAsync(int userId)
        {
            var query = _context.Friendships.Include(x => x.Friend).Include(x => x.User)
                .Where(f => f.UserId == userId || f.FriendId == userId);
            var querySQL = query.ToQueryString();
            Console.WriteLine(querySQL);
            return await query.ToListAsync();
        }

        public async Task<bool> AcceptFriendRequestAsync(int userId, int friendId)
        {
            var friendship = await _context.Friendships
                .FirstOrDefaultAsync(f => f.UserId == userId && f.FriendId == friendId && f.Status == FriendshipStatus.Pending);

            if (friendship != null)
            {
                friendship.Status = FriendshipStatus.Accepted;
                await _context.SaveChangesAsync();
                return true;
            }

            return false;
        }
        public async Task<bool> RejectFriendRequestAsync(int userId, int friendId)
        {
            var friendship = await _context.Friendships
                .FirstOrDefaultAsync(f => f.UserId == userId && f.FriendId == friendId && f.Status == FriendshipStatus.Pending);

            if (friendship != null)
            {
                friendship.Status = FriendshipStatus.Rejected;
                await _context.SaveChangesAsync();
                return true;
            }

            return false;
        }

        public async Task<bool> RemoveFriendAsync(int userId, int friendId)
        {
            // Find the friendship where the user is either the requester or the recipient
            var friendship = await _context.Friendships
                .FirstOrDefaultAsync(f => (f.UserId == userId && f.FriendId == friendId)
                                       || (f.UserId == friendId && f.FriendId == userId));

            if (friendship != null)
            {
                _context.Friendships.Remove(friendship);
                await _context.SaveChangesAsync();
                return true;  // Friendship removed successfully
            }

            return false;  // No friendship found
        }
    }
}
