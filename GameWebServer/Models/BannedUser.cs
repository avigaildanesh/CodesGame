using System.ComponentModel.DataAnnotations;

namespace GameWebServer.Models
{
    public class BannedUser
    {
        [Key]
        public int Id { get; set; }
        public int UserId { get; set; }
        public User User { get; set; }
        public int ReportId { get; set; }
        public GameReport GameReport { get; set; }
    }
}
