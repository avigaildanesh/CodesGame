using Shared;
using System.Text.Json;

namespace CSharpRunner
{
    internal class Program
    {
        private static Orders orders = new Orders();
        public static string ME, ENEMY;
        public static void Out(string message, OutState state)
        {
            switch (state)
            {
                case OutState.Debug:
                    orders.OrdersList.Add(new Order() { EntityId = "0", message = $"{message}" });
                    break;

                case OutState.Response:
                    Console.WriteLine(message);
                    Console.Out.Flush();
                    break;

                case OutState.Error:
                    orders.Errors.Add(new Order() { EntityId = "0", message = $"{message}" });
                    break;
            }
        }
        static void Main(string[] args)
        {
            // make sure we have a bot file to compile
            if (args.Length < 2)
            {
                Console.WriteLine($"usage: CSharpRunner.exe [bot] [botNum]");
                Environment.Exit(-1);
            }

            //make sure the file\path exist
            if (!File.Exists(args[0]) && !Directory.Exists(args[0]))
            {
                Console.WriteLine($"File/Directory {args[0]} does not exist on the system.");
                Environment.Exit(-1);
            }

            // try to compile the bot
            Bot<IGameBot> bot = null;
            try
            {
                ME = args[1];
                switch (ME)
                {
                    case "1":
                        ENEMY = "2";
                        break;
                    case "2":
                        ENEMY = "1";
                        break;
                    default:
                        ENEMY = "0";
                        break;
                }
                bot = new Bot<IGameBot>(BotLoader<IGameBot>.FromFile(args[0]), ME);
            }
            catch (InvalidOperationException ce)
            {
                Console.WriteLine("e: " + ce.StackTrace.Replace(Environment.NewLine, string.Empty));
                Environment.Exit(-1);
            }
            catch (ClassNotFoundException)
            {
                Console.WriteLine("Please make sure you implent the bot interface.");
                Environment.Exit(-1);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"An unkown error has occured. {ex.ToString().Replace(Environment.NewLine, string.Empty)}");
                Environment.Exit(-1);
            }

            //tell CoreRunner we are ready to begin
            Out("ready", OutState.Response);
            try
            {
                bool passed = true;
                string stateJson;
                GameState gameState;
                Game game;
                while (passed)
                {
                    stateJson = Console.ReadLine()!;

                    gameState = JsonSerializer.Deserialize<GameState>(stateJson);
                    game = new Game(gameState);


                    passed = bot.DoTurn(game);
                    orders = game.orders;
                    if (!passed)
                    {
                        Out("Timed out", OutState.Error);
                    }

                    Out(JsonSerializer.Serialize(orders), OutState.Response);
                }
            }
            catch (Exception ex)
            {
                Out(JsonSerializer.Serialize(ex.Message), OutState.Error);
                Out(JsonSerializer.Serialize(orders), OutState.Response);

            }

        }
    }
}
