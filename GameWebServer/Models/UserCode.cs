using System.ComponentModel.DataAnnotations;

namespace GameWebServer.Models
{
    public class UserCode
    {
        [Key]
        public int Id { get; set; }
        public int UserId { get; set; }
        public User User { get; set; }
        public string Title { get; set; }
        public DateTime CreatedDate { get; set; }
        public string Code { get; set; }
    }
}
