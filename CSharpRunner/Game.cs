using Shared;

namespace CSharpRunner
{
    internal class Game(GameState state) : IGame
    {
        private readonly GameState state = state;
        internal Orders orders = new();

        public List<Ship> GetAllMyShips() => state.Ships.Where(x => x.EntityID.StartsWith(Program.ME)).OrderBy(x=> x.EntityID).ToList();

        public List<Ship> GetAllEnemyShips() => state.Ships.Where(x => !x.EntityID.StartsWith(Program.ME)).OrderBy(x => x.EntityID).ToList();

        public List<Ship> GetEnemyLivingShips() => state.Ships.Where(x => !x.EntityID.StartsWith(Program.ME) && x.TurnsToLive == 0).OrderBy(x => x.EntityID).ToList();

        public List<Ship> GetMyLivingShips() => state.Ships.Where(x => x.EntityID.StartsWith(Program.ME) && x.TurnsToLive == 0).OrderBy(x => x.EntityID).ToList();



        public List<Island> GetAllIslands() => state.Islands.OrderBy(x => x.EntityID).ToList();

        public List<Island> GetMyIslands() => state.Islands.Where(x => x.Owner == Program.ME).OrderBy(x => x.EntityID).ToList();

        public List<Island> GetEnemyIslands() => state.Islands.Where(x => x.Owner == Program.ENEMY).OrderBy(x => x.EntityID).ToList();
        public List<Island> GetNotMyIslands() => state.Islands.Where(x => x.Owner != Program.ME).OrderBy(x => x.EntityID).ToList();


        public MapObject GetMapObjectOn(Location location)
        {
            foreach (var ship in state.Ships)
                if (ship.Location.IsSameLocation(location))
                    return ship;

            foreach (var island in state.Islands)
                if (island.Location.IsSameLocation(location))
                    return island;

            return new MapObject(location, "0", MapItem.None);
        }



        public bool InRange(Location a, Location b, int range) => a.Distance(b) <= range;




        public int GetTurn() => state.Turn;

        public int GetMyScore() => Program.ME switch
        {
            "1" => state.Bot1Score,
            "2" => state.Bot2Score,
            _ => 0,
        };



        public int GetEnemyScore() => Program.ME switch
        {
            "1" => state.Bot2Score,
            "2" => state.Bot1Score,
            _ => 0,
        };

        public void Debug(string message)
        {
            orders.OrdersList.Add(new Order() { EntityId = "0", message = message });
        }

        public void Move(Ship ship, Location location)
        {
            orders.OrdersList.Add(new Order(){ EntityId = ship.EntityID, NewLocation = location });
        }

        public void Move(Ship ship, Direction direction)
        {
            orders.OrdersList.Add(new Order() { EntityId = ship.EntityID, NewLocation = GetLocationInDirection(ship.Location, direction) });
        }

        public Location GetLocationInDirection(Location loc, Direction direction)
        {
            Location new_loc = new(loc.x, loc.y);
            switch (direction)
            {
                case Direction.Up:
                    new_loc.y -= 1;
                    break;

                case Direction.Down:
                    new_loc.y += 1;
                    break;

                case Direction.Left:
                    new_loc.x -= 1;
                    break;

                case Direction.Right:
                    new_loc.x += 1;
                    break;

            }
            return new_loc;
        }

        private static int TotalDistance(Location a, Location b)
        {
            return Math.Abs(a.x - b.x) + Math.Abs(a.y - b.y);
        }

        public List<Direction> GetDirections(Location loc1, Location loc2)
        {
            var directions = new List<Direction>();
            var distance = TotalDistance(loc1, loc2);
            
            Direction[] allDirections = [Direction.Up, Direction.Down, Direction.Left, Direction.Right];
            foreach (Direction direction in allDirections)
            {
                var loc = GetLocationInDirection(loc1, direction);
                if (TotalDistance(loc, loc2) < distance)
                    directions.Add(direction);
            }
            
            return directions;
        }
    }
}
