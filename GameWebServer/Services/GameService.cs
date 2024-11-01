using GameWebServer.Data;
using GameWebServer.Models;
using Microsoft.EntityFrameworkCore;
using NuGet.Versioning;
using System.Collections.Generic;
using System.Diagnostics;
using System.Text.Json.Nodes;

namespace GameWebServer.Services
{
    public interface IGameService
    {
        Task<GameResult?> StartGame(User user1, User user2);
        Task<GameResult?> GetGame(int id);
        Task<IEnumerable<GameResult>> GetHistory(int playerId);
        Task<IEnumerable<GameResult>> GetLatest();

        Task<IEnumerable<object>> GetStats();
    }
    public class GameService : IGameService
    {
        private readonly IUsersService usersService;
        private readonly AppDbContext _context;
        public GameService(IUsersService usersService, AppDbContext context)
        {
            this.usersService = usersService;
            this._context = context;
        }

        public async Task<GameResult?> GetGame(int id)
        {
            return await _context.GameResults.FirstOrDefaultAsync(x => x.Id == id);
        }

        public async Task<IEnumerable<GameResult>> GetHistory(int playerId)
        {
            return await _context.GameResults.Include(x => x.User1).Include(x => x.User2).Where(x => x.User1Id == playerId || x.User2Id == playerId).OrderByDescending(x => x.Id).ToListAsync();
        }

        public async Task<IEnumerable<GameResult>> GetLatest()
        {
            return await _context.GameResults.Include(x => x.User1).Include(x => x.User2).OrderByDescending(x => x.Id).Take(10).ToListAsync();
        }

        public async Task<IEnumerable<object>> GetStats()
        {
            return await _context.Users.Select(user => new
            {
                User = user,
                TotalScore = _context.GameResults.Where(gr => gr.User1Id == user.Id || gr.User2Id == user.Id).Sum(gr => gr.User1Id == user.Id ? gr.User1Score : gr.User2Score),
                Wins = _context.GameResults.Count(gr => gr.Winner == user.Id)
            }).OrderByDescending(result => result.TotalScore * result.Wins)
            .Select(x => new { User = x.User.Username, TotalScore = x.TotalScore, Wins = x.Wins, FinalScore = x.TotalScore * x.Wins }).ToListAsync();
        }

        public async Task<GameResult?> StartGame(User user1, User user2)
        {
            var player1 = user1.Id;
            var player2 = user2.Id;

            if (user1 == null || user2 == null)
            {
                return null;
            }

            var user1Code = user1.SelectedCode.Code;
            var user2Code = user2.SelectedCode.Code;
            var gameDir = $"Game-{player1}-vs-{player2}";
            Directory.CreateDirectory(gameDir);
            await File.WriteAllTextAsync($"{gameDir}/Bot1.cs", user1Code);
            await File.WriteAllTextAsync($"{gameDir}/Bot2.cs", user2Code);
            File.Copy("maps/map.smap", $"{gameDir}/map.smap");



            var psi = new ProcessStartInfo("Runners/StrategyGameRunner.exe");
            psi.UseShellExecute = false;
            psi.RedirectStandardOutput = true;
            psi.RedirectStandardError = true;
            psi.ArgumentList.Add("Bot1.cs");
            psi.ArgumentList.Add("Bot2.cs");
            psi.ArgumentList.Add("map.smap");
            psi.WorkingDirectory = gameDir;
            var proc = Process.Start(psi);
            var result = (JsonObject)await JsonObject.ParseAsync(proc.StandardOutput.BaseStream);
            await proc.WaitForExitAsync();


            var gameResult = new GameResult()
            {
                ReplayData = result.ToString(),
                User1Id = player1,
                User2Id = player2,
                User1Score = int.Parse(result["Bot1Score"].ToString()),
                User2Score = int.Parse(result["Bot2Score"].ToString()),
                Winner = result["Winner"].ToString() == "1" ? player1 : result["Winner"].ToString() == "2" ? player2 : -1
            };

            Directory.Delete(gameDir, true);

            _context.GameResults.Add(gameResult);
            await _context.SaveChangesAsync();
            return gameResult;
        }


    }
}
