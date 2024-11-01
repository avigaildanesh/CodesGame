using System.Text.Json.Nodes;

namespace GameWebServer.Models
{
    public class GameResult
    {
        public int Id { get; set; }
        public int User1Id { get; set; }
        public User User1 { get; set; }

        public int User2Id { get; set; }
        public User User2 { get; set; }

        public int Winner { get; set; }
        
        public int User1Score { get; set; }
        public int User2Score { get; set; }

        public string ReplayData { get; set; }
    }
}
