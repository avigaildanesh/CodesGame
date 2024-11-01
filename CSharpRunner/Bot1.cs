using Shared;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.CompilerServices;
using System.Text;
using System.Threading.Tasks;

namespace CSharpRunner
{
    public class Bot1 : IGameBot
    {
        public Direction GetOppositeDirection(Direction direction)
        {
            return direction switch
            {
                Direction.Left => Direction.Right,
                Direction.Right => Direction.Left,
                Direction.Up => Direction.Down,
                Direction.Down => Direction.Up,
                _ => direction,
            };
        }

        public Direction? GetFreeDirection(IGame game, Location start, Location end, List<Location> locations)
        {
            var directions = game.GetDirections(start, end);
            foreach (var direction in directions)
            {
                var loc = game.GetLocationInDirection(start, direction);
                if (!locations.Contains(loc))
                    return direction;
            }
            return null;
        }
        public bool Move(IGame game, Ship ship, Location location, List<Location> locations)
        {
            var dir = GetFreeDirection(game, ship.Location, location, locations);
            if (dir == null)
            {
                game.Debug($"Can't move {ship} into {location}");
                return false;
            };
            Direction dir2 = (Direction)dir;
            var loc = game.GetLocationInDirection(ship.Location, dir2);
            game.Debug($"Moving {ship} into {loc}");
            game.Move(ship, loc);
            locations.Add(loc);
            return true;

        }

        public void DoTurn(IGame game)
        {
            // send equal amount of ships to each island
            var locations = new List<Location>();
            var ships = game.GetMyLivingShips();
            if (ships.Count < 1)
            {
                game.Debug("No available ships");
                return;
            }

            while (ships.Count > 0 && game.GetNotMyIslands().Count > 0)
            {
                var ship = ships.FirstOrDefault();
                if (ship == null)
                {
                    game.Debug($"No more ships");
                    return;
                }
                var island = game.GetNotMyIslands().OrderBy(x => x.Location.Distance(ship.Location)).FirstOrDefault();
                game.Debug($"Not my islands = {string.Join(",", game.GetNotMyIslands())}");
                if (island != null)
                {
                    var dir = GetFreeDirection(game, ship.Location, island.Location, locations);
                    if (dir != null || ship.Location == island.Location)
                    {
                        Location loc;
                        if (ship.Location == island.Location)
                        {
                            loc = ship.Location;
                            dir = GetFreeDirection(game, ship.Location, ship.Spawn, locations);
                        }
                        else
                        {
                            loc = game.GetLocationInDirection(ship.Location, (Direction)dir);
                        }
                        var enemiesNearLoc = game.GetEnemyLivingShips().Where(x => game.InRange(x.Location, loc, x.AttackRange + 3));
                        var alliesNearLoc = game.GetMyLivingShips().Where(x => game.InRange(x.Location, loc, ship.AttackRange));
                        if (enemiesNearLoc.Count() >= alliesNearLoc.Count())
                        {
                            var opposite = GetFreeDirection(game, ship.Location, game.GetLocationInDirection(ship.Location, GetOppositeDirection((Direction)dir)), locations);
                            if (opposite != null)
                            {
                                var escapeLoc = game.GetLocationInDirection(ship.Location, (Direction)opposite);
                                Move(game, ship, escapeLoc, locations);
                                game.Debug($"Not moving {ship} into {loc} because there are too many enemies there, escaping to {escapeLoc}");
                            }
                            ships.Remove(ship);
                        }
                        else
                        {
                            Move(game, ship, loc, locations);
                            ships.Remove(ship);
                        }
                    }
                    else
                    {
                        ships.Remove(ship);
                        game.Debug($"Not moving {ship} into {dir} because a collision will occure");
                    }
                }
            }
        }
    }
}