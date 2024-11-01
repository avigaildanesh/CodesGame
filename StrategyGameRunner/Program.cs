using Shared;
using System.Diagnostics;
using System.Text.Json;

namespace CoreRunner
{
    class Program
    {
        private static readonly CancellationTokenSource cts = new();
        private static bool safeExit = false;
        private static readonly string[] SUPPORTED_FORMATS = [".cs", ".py", ".ts", ".js"];
        public const string BOT1 = "1";
        public const string BOT2 = "2";

        private static void Out(string message)
        {

        }
        private static Process GetRunnerProcess(string runner, string codeLocation, string botNumber)
        {
            return new Process()
            {
                StartInfo = new ProcessStartInfo()
                {
                    FileName = runner,
                    CreateNoWindow = true,
                    RedirectStandardInput = true,
                    RedirectStandardError = true,
                    RedirectStandardOutput = true,
                    Arguments = $"\"{codeLocation}\" {botNumber}"
                }
            };
        }

        private static string GetRunnerByExtenstion(string extension)
        {
            switch (extension)
            {
                case ".py":
                    return $"pythonRunner.py";

                case ".cs":
                    return "CSharpRunner.exe";

                case ".js":
                case ".ts":
                    return $"node";


                default:
                    Out($"Format {extension} is not supported");
                    throw new ArgumentException($"Format {extension} is not supported");
            }
        }

        private static async Task<bool> IsRunnerReady(StreamReader reader, string botNum, CancellationToken token)
        {
            ArgumentNullException.ThrowIfNull(reader);

            string? line;
            while ((line = await reader.ReadLineAsync(token)) != "ready")
            {
                Log($"Bot {botNum}: {line}", botNum);
                await Task.Delay(100, token).ConfigureAwait(false);
            }
            return true;
        }

        static async Task Main(string[] args)
        {
            //validate that we have enough arguments to run the game
            if (!ValidateArgs(args))
                return;

            // determine which language the bot uses
            string bot1RunnerLang = GetRunnerByExtenstion(Path.GetExtension(args[0]));
            string bot2RunnerLang = GetRunnerByExtenstion(Path.GetExtension(args[1]));

            //get bot processes

            var bot1Runner = GetRunnerProcess(bot1RunnerLang, args[0], "1");
            var bot2Runner = GetRunnerProcess(bot2RunnerLang, args[1], "2");

            bot1Runner.Exited += (s, e) => BotRunner_Exited("1", e);
            bot2Runner.Exited += (s, e) => BotRunner_Exited("2", e);

            bot1Runner.Start();
            bot2Runner.Start();

            var bot1Reader = bot1Runner.StandardOutput;
            var bot1Writer = bot1Runner.StandardInput;

            var bot2Reader = bot2Runner.StandardOutput;
            var bot2Writer = bot2Runner.StandardInput;


            Out("Waiting for the runners to be ready..");

            cts.CancelAfter(TimeSpan.FromSeconds(20));
            await Task.WhenAll([IsRunnerReady(bot1Runner.StandardOutput, BOT1, cts.Token), IsRunnerReady(bot2Runner.StandardOutput, BOT2, cts.Token)]).ConfigureAwait(false);

            Out("Runners ready, running turns");

            //parse the map
            var gameConfig = await ParseGameConfig(args[2]).ConfigureAwait(false);
            var gameState = new GameState(gameConfig.Ships, gameConfig.Islands);
            var gameReplay = new List<string>();
            var jsonFormatterOptions = new JsonSerializerOptions() { IncludeFields = true };
            string? bot1Response = null, bot2Response = null;
            Orders bot1Orders = new(), bot2Orders = new();

            TurnResult results = new();
            for (int i = 0; i < 1000; i++)
            {
                Out($"Turn {i}:");

                // Pass the state to the runners
                gameState.Turn = i;
                var gameStateJson = JsonSerializer.Serialize(gameState, jsonFormatterOptions);
                gameReplay.Add(gameStateJson);
                gameState.BotMessages?.ForEach(x => Log(x.Item2, x.Item1));
                gameState.BotMessages?.Clear();
                if (!string.IsNullOrWhiteSpace(results.Winner))
                {
                    break;
                }
                await bot1Writer.WriteLineAsync(gameStateJson).ConfigureAwait(false);
                await bot1Writer.FlushAsync().ConfigureAwait(false);

                await bot2Writer.WriteLineAsync(gameStateJson).ConfigureAwait(false);
                await bot2Writer.FlushAsync().ConfigureAwait(false);

                // Get response from the bots
                bot1Response = await bot1Reader.ReadLineAsync().ConfigureAwait(false);
                bot2Response = await bot2Reader.ReadLineAsync().ConfigureAwait(false);
                bot1Orders = JsonSerializer.Deserialize<Orders>(bot1Response)!;
                bot2Orders = JsonSerializer.Deserialize<Orders>(bot2Response)!;


                if (bot1Orders.Errors.Count != 0 && bot2Orders.Errors.Count != 0)
                {
                    results.Winner = "0";
                    break;
                }

                if (bot1Orders.Errors.Count != 0)
                {
                    results.Winner = BOT2;
                    break;
                }

                if (bot2Orders.Errors.Count != 0)
                {
                    results.Winner = BOT1;
                    break;
                }

                results = GameManager.DoTurn(bot1Orders, bot2Orders, gameState, gameConfig);
            }

            Out($"The winner is {results.Winner}");
            bot1Writer.Dispose();
            bot2Writer.Dispose();
            bot1Reader.Dispose();
            bot2Reader.Dispose();

            safeExit = true;
            if (bot1Response != null && !bot1Runner.HasExited) bot1Runner.Kill();
            if (bot2Response != null && !bot2Runner.HasExited) bot2Runner.Kill();

            Console.WriteLine($"{results.Winner}, {results.GameState.Bot1Score}, {results.GameState.Bot2Score}");
            //generate replay
            string replayFileName = "./visualizer/";
            if (args.Length == 3)
            {
                replayFileName += "replay.js";
            }
            else
            {
                replayFileName += args[3];
            }

            File.WriteAllText(replayFileName, $"window.rd = JSON.parse(`{{\"states\": [{string.Join(",", gameReplay)}], \"width\":{gameConfig.xLimit}, \"height\": {gameConfig.yLimit}, \"TurnsToRevive\": {gameConfig.TurnsToReviveShip}, \"TurnsToCaptureIsland\": {gameConfig.TurnsToCaptureIsland}}}`);");
            //File.WriteAllText(HTML_FILE_PATH, File.ReadAllText(TEMPLATE_FILE_PATH).Replace("##MAP DATA##", JsonConvert.SerializeObject(jmo)).Replace("##TURNS DATA##", JsonConvert.SerializeObject(jo)));
        }

        private static bool ValidateArgs(string[] args)
        {
            if (args.Length < 3)
            {
                Out("Usage: \"CoreRunner.exe [bot1] [bot2] [map]\"");
                return false;
            }

            if (!SUPPORTED_FORMATS.Any(x => args[0].EndsWith(x)) || !SUPPORTED_FORMATS.Any(x => args[1].EndsWith(x)))
            {
                Out("Supported formats are .cs, .py or .java");
                return false;
            }

            if (!args[2].EndsWith(".smap"))
            {
                Out($"Supported map format is .smap, please provide a valid map file.");
                return false;
            }

            // validate that the arguments are existing files

            int i = 0;
            foreach (string file in args)
            {
                if (++i == 4) { break; }
                if (!File.Exists(file))
                {
                    Out($"\"{file}\" does not exist");
                    return false;
                }
            }

            return true;
        }

        private static void BotRunner_Exited(object sender, EventArgs e)
        {
            if (!safeExit)
            {
                Out($"Bot {sender} has stopped working");
                Console.ReadLine();
                Environment.Exit(-1);
            }
        }

        static async Task<GameConfig> ParseGameConfig(string fileLocation)
        {
            var lines = await File.ReadAllLinesAsync(fileLocation);
            var config = new GameConfig();
            int entityID = 0;
            var ships = new List<Ship>();
            var islands = new List<Island>();
            for (int i = 0; i < lines.Length; i++)
            {
                for (int j = 0; j < lines[i].Length; j++)
                {
                    var loc = new Location(j, i);
                    switch (lines[i][j])
                    {
                        case '.':
                            break;

                        case 'a':
                            ships.Add(new Ship(loc, $"{BOT1}-{entityID}"));
                            entityID++;
                            break;

                        case 'b':
                            ships.Add(new Ship(loc, $"{BOT2}-{entityID}"));
                            entityID++;
                            break;

                        case 'i':
                            islands.Add(new Island(loc, $"i-{entityID}", config.TurnsToCaptureIsland));
                            entityID++;
                            break;

                        default:
                            throw new Exception($"Unexpected character in {fileLocation} '{lines[i][j]}'");
                    }
                }
            }
            config.xLimit = lines[0].Length - 1;
            config.yLimit = lines.Length - 1;
            config.Ships = ships;
            config.Islands = islands;
            return config;
        }

        static void Log(string message, string sender)
        {
            switch (sender)
            {
                case BOT1:
                    Console.ForegroundColor = ConsoleColor.Magenta;
                    Out($"Bot {sender}: {message}");
                    Console.ForegroundColor = ConsoleColor.Gray;
                    break;

                case BOT2:
                    Console.ForegroundColor = ConsoleColor.Blue;
                    Out($"Bot {sender}: {message}");
                    Console.ForegroundColor = ConsoleColor.Gray;
                    break;

                default:
                    Console.ForegroundColor = ConsoleColor.Cyan;
                    Out($"Bot {sender}: {message}");
                    Console.ForegroundColor = ConsoleColor.Gray;
                    break;
            }
        }


    }
}