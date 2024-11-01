namespace GameWebServer.Models
{
    public enum FriendshipStatus
    {
        Pending = 0,
        Accepted = 1,
        Rejected = 2
    }

    public class Friendship
    {
        public int UserId { get; set; }
        public User User { get; set; }

        public int FriendId { get; set; }
        public User Friend { get; set; }

        public FriendshipStatus Status { get; set; } = FriendshipStatus.Pending;
    }
}
