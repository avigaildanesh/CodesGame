using System.ComponentModel.DataAnnotations;

namespace GameWebServer.Models
{
    public class GameReport
    {
        [Key]
        public int Id { get; set; }
        public int GameResultId { get; set; }
        public GameResult GameResult { get; set; }
        public string ReportContent { get; set; }
        public int ReporterId { get; set; }
        public User Reporter { get; set; }
        public bool IsDeleted { get; set; }
    }
}
