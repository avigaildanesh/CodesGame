namespace Shared
{
    public class GameState
    {
        public List<Ship> Ships { get; set; }
        public List<Island> Islands { get; set; }
        public List<(string, string)> BotMessages { get; set; } = [];
        public int Turn { get; set; } = 0;
        public int Bot1Score { get; set; } = 0;
        public int Bot2Score { get; set; } = 0;

        public GameState(List<Ship> ships, List<Island> islands)
        {
            this.Ships = ships;
            this.Islands = islands;
        }

        public GameState()
        {

        }
    }
}
