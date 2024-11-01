namespace Shared
{
    public interface IGame
    {

        /// <summary>
        /// Gets a list with all of the bot's ships
        /// </summary>
        List<Ship> GetAllMyShips();

        /// <summary>
        /// Gets a list with all the enemy bot's ships
        /// </summary>
        List<Ship> GetAllEnemyShips();

        /// <summary>
        /// Gets a list with all the enemy bot's living ships
        /// </summary>
        List<Ship> GetEnemyLivingShips();

        /// <summary>
        /// Gets a list with all of the bot's living ships
        /// </summary>
        List<Ship> GetMyLivingShips();



        /// <summary>
        /// Gets a list with all the islands on the map
        /// </summary>
        List<Island> GetAllIslands();

        /// <summary>
        /// Gets a list with all the islands owned by the current player
        /// </summary>
        List<Island> GetMyIslands();

        /// <summary>
        /// Gets a list with all the islands owned by the enemy
        /// </summary>
        List<Island> GetEnemyIslands();


        /// <summary>
        /// Gets a list with all the islands not owned by the current player
        /// </summary>
        List<Island> GetNotMyIslands();

        /// <summary>
        /// Gets a MapObject object in a given location
        /// </summary>
        /// <param name="location">The location to look for the MapObject in</param>
        MapObject GetMapObjectOn(Location location);



        /// <summary>
        /// Checks if a location is in the range of another location
        /// </summary>
        bool InRange(Location a, Location b, int range);



        /// <summary>
        /// Returns the current turn number
        /// </summary>
        int GetTurn();

        /// <summary>
        /// Returns the current bot's score
        /// </summary>
        int GetMyScore();

        /// <summary>
        /// Returns the current enemy bot's score
        /// </summary>
        int GetEnemyScore();

        /// <summary>
        /// Outputs a message to the main console window
        /// </summary>
        /// <param name="message">The message to be outputted</param>
        void Debug(string message);

        /// <summary>
        /// Moves a ship to a different location.
        /// </summary>
        /// <param name="ship">The ship to move</param>
        /// <param name="location">The new location for the ship to move to</param>
        void Move(Ship ship, Location location);

        /// <summary>
        /// Moves the ship in a given direction
        /// </summary>
        /// <param name="ship">The ship to move</param>
        /// <param name="direction">The direction to move the ship in</param>
        void Move(Ship ship, Direction direction);


        List<Direction> GetDirections(Location loc1, Location loc2);

        /// <summary>
        /// Gets a new location in the given direction
        /// </summary>
        /// <param name="loc">The starting location</param>
        /// <param name="direction">The direction to move in</param>
        /// <returns></returns>
        Location GetLocationInDirection(Location loc, Direction direction);

    }
}
