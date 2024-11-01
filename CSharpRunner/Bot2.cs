using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Shared;

namespace CSharpRunner
{
    internal class Bot2 : IGameBot
    {

        public Location GetFreeLocation(IGame game, Location start, Location end, List<Location> locations)
        {
            var directions = game.GetDirections(start, end);
            foreach (var direction in directions)
            {
                var loc = game.GetLocationInDirection(start, direction);
                if (!locations.Contains(loc))
                    return loc;
            }
            return null;
        }

        public void DoTurn(IGame game)
        {
            // Move all ships to the same island
            var island = game.GetNotMyIslands().LastOrDefault();
            game.Debug($"not my islands: {string.Join(',', game.GetNotMyIslands())}");
            var shipsLocations = new List<Location>();
            if (island != null)
            {
                
                foreach (var ship in game.GetMyLivingShips())
                {
                    var loc = GetFreeLocation(game, ship.Location, island.Location, shipsLocations);
                    if (loc != null)
                    {
                        shipsLocations.Add(loc);
                        game.Move(ship, loc);
                        game.Debug($"Moving {ship} to {loc}");
                    }
                    else
                    {
                        game.Debug($"Not moving {ship} because a collision will occure");
                    }
                }
            }
            else
            {
                game.Debug($"No island found to capture");
            }
        }
    }
}
