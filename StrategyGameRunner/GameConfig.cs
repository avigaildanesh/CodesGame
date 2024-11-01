using Shared;
namespace CoreRunner
{
    class GameConfig
    {
        public List<Ship> Ships;
        public List<Island> Islands;
        public int xLimit;
        public int yLimit;
        public int TurnsToReviveShip = 20;
        public int TurnsToCaptureIsland = 30;

        public GameConfig() { }
    }
}
