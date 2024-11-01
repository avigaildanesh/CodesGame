using Shared;

namespace CoreRunner
{
    static class GameManager
    {
        private const string MANAGER = "0";
        private static List<Ship> livingShips = [], deadShips = [], shipsToRevive = [], shipsToKill = [];
        private static List<(Ship, Location)> shipsToMove = [];
        private static void KillShip(Ship s, GameConfig config, GameState state)
        {
            if (s != null && !deadShips.Contains(s))
            {
                state.BotMessages.Add((MANAGER, $"Killing {s}"));
                s.CanMove = false;
                s.TurnsToLive = config.TurnsToReviveShip;
                //s.Location = null;
                livingShips.Remove(s);
                deadShips.Add(s);
            }
        }

        private static void ReviveShip(Ship s)
        {
            if (s != null)
            {
                s.CanMove = true;
                s.TurnsToLive = 0;
                s.Location = s.Spawn;
                livingShips.Add(s);
                deadShips.Remove(s);
            }
        }

        private static void ProcessOrder(GameState state, Order order, string owner, GameConfig config)
        {
            if (order.EntityId == null)
            {
                // TODO: add internal debug message about order with null entity, should fix this in the runner if it happens
                return;
            }

            if (order.EntityId == "0" && !string.IsNullOrWhiteSpace(order.message))
            {
                state.BotMessages.Add((owner, order.message));
                return;
            }

            if (order.NewLocation == null)
            {
                return;
            }

            if (!order.EntityId.StartsWith(owner))
            {
                state.BotMessages.Add((MANAGER, $"Bot {owner}: attempt to move an entity which is not owned by you: {order.EntityId}"));
                return;
            }

            var ship = state.Ships.FirstOrDefault(x => x.EntityID == order.EntityId);
            if (ship == null)
            {
                state.BotMessages.Add((MANAGER, $"Bot {owner}: attempt to move a non existing entity {order.EntityId}"));
                return;
            }

            if (!ship.CanMove)
            {
                state.BotMessages.Add((MANAGER, $"Bot {owner} tried moving {ship} but it can't move"));
                return;
            }

            if (ship.Location.IsSameLocation(order.NewLocation))
            {
                return;
            }
            if (ship.TurnsToLive > 0)
            {
                state.BotMessages.Add((MANAGER, $"Bot {owner}: attempt to move a dead entity: {ship}"));
                return;
            }

            if (!ship.CanMove)
            {
                state.BotMessages.Add((MANAGER, $"Bot {owner}: attempt to move an entity that can't move anymore: {ship}"));
                return;
            }

            if (ship.Location.TotalDistance(order.NewLocation) > ship.Speed)
            {
                state.BotMessages.Add((MANAGER, $"Bot {owner} can't move {ship} from {ship.Location} to {order.NewLocation}, the distance is more than the ship's travel speed"));
                return;
            }

            if (order.NewLocation.x < 0 || order.NewLocation.y < 0 || order.NewLocation.y > config.yLimit || order.NewLocation.x > config.xLimit)
            {
                state.BotMessages.Add((MANAGER, $"Bot {owner}: attempt to move {ship} outside of map, to {order.NewLocation}"));
                return;
            }


            shipsToMove.Add((ship, order.NewLocation));

        }

        /// <summary>
        /// This function gets the orders of the 2 bots and the game map and produces a new game map according to the game rules
        /// </summary>
        /// <returns>A tuple with the winner and the new game map, winner will be 0 if there is no winner yet</returns>
        public static TurnResult DoTurn(Orders bot1Orders, Orders bot2Orders, GameState state, GameConfig config)
        {
            var results = new TurnResult();
            shipsToKill.Clear();
            shipsToRevive.Clear();
            shipsToMove.Clear();
            livingShips = state.Ships.Where(x => x.TurnsToLive == 0).ToList();
            // Reset ship move
            livingShips.ForEach(x => x.CanMove = true);



            // Move ships
            foreach (var order in bot1Orders.OrdersList)
            {
                ProcessOrder(state, order, Program.BOT1, config);
            }

            foreach (var order in bot2Orders.OrdersList)
            {
                ProcessOrder(state, order, Program.BOT2, config);
            }

            foreach (var moveOrder in shipsToMove)
            {
                var ship = moveOrder.Item1;
                ship.Location = moveOrder.Item2;
            }

            // handle collisions
            var sameLocationShips = livingShips.GroupBy(x => x.Location).Where(group => group.Count() >= 2);
            foreach (var group in sameLocationShips)
            {
                state.BotMessages.Add((MANAGER, $"({string.Join(", ", group)}) collided on {group.Key}"));
                shipsToKill.AddRange(group);
            }
            shipsToKill.ForEach(x => KillShip(x, config, state));
            shipsToKill.Clear();

            // Calculate islands points
            var bot1Islands = state.Islands.Where(x => x.Owner == Program.BOT1);
            if (bot1Islands.Any())
            {
                state.Bot1Score += Convert.ToInt32(Math.Pow(2, bot1Islands.Count()));
            }
            var bot2Islands = state.Islands.Where(x => x.Owner == Program.BOT2);
            if (bot2Islands.Any())
            {
                state.Bot2Score += Convert.ToInt32(Math.Pow(2, bot2Islands.Count()));
            }

            // Combat
            foreach (var ship in livingShips)
            {
                var nearbyShips = livingShips.Where(x => x.Location.TotalDistance(ship.Location) <= ship.AttackRange);
                List<Ship> friends = [], enemies = [];

                foreach (var nearby in nearbyShips)
                    (nearby.EntityID[0] == ship.EntityID[0] ? friends : enemies).Add(nearby);


                if (friends.Count <= enemies.Count)
                    shipsToKill.Add(ship);
                else
                    shipsToKill.AddRange(enemies);
            }

            // Kill the dead
            shipsToKill.ForEach(x => KillShip(x, config, state));
            shipsToKill.Clear();


            // Capture islands
            foreach (var island in state.Islands)
            {
                var shipsInIslandRange = livingShips.Where(x => island.Location.TotalDistance(x.Location) <= island.CaptureRange);
                if (!shipsInIslandRange.Any())
                {
                    continue;
                }
                var team1Ships = shipsInIslandRange.Where(x => x.EntityID[0] == Program.BOT1[0]).ToList();
                var team2Ships = shipsInIslandRange.Where(x => x.EntityID[0] == Program.BOT2[0]).ToList();
                if (team1Ships.Count == team2Ships.Count)
                {
                    // Its a tie
                    continue;
                }
                var capturingTeam = team1Ships.Count > team2Ships.Count ? Program.BOT1 : Program.BOT2;

                if (island.Owner != capturingTeam)
                {
                    if (island.TurnsToCapture == 0)
                    {
                        if (island.Owner == "0")
                        {
                            island.Owner = capturingTeam;
                            island.TurnsToCapture = config.TurnsToCaptureIsland;
                        }
                        else
                        {
                            island.Owner = "0";
                            island.TurnsToCapture = config.TurnsToCaptureIsland;
                        }
                    }
                    else
                    {
                        island.CapturingTeam = capturingTeam;
                        island.TurnsToCapture -= 1;
                    }
                }
                else
                {
                    if (island.TurnsToCapture < config.TurnsToCaptureIsland)
                    {
                        island.TurnsToCapture += 1;
                    }
                }
            }

            // Revive dead ships
            foreach (var ship in deadShips)
            {
                ship.TurnsToLive -= 1;
                if (ship.TurnsToLive == 0)
                {
                    shipsToRevive.Add(ship);
                }
            }

            foreach (var ship in shipsToRevive)
            {
                ReviveShip(ship);
            }

            if (state.Bot1Score >= 1000 && state.Bot2Score >= 1000)
            {
                results.Winner = "0";
            }
            if (state.Bot1Score >= 1000)
            {
                results.Winner = Program.BOT1;
            }
            else if (state.Bot2Score >= 1000)
            {
                results.Winner = Program.BOT2;
            }

            results.GameState = state;
            return results;
        }
    }
}
