using GameWebServer.Models;
using Microsoft.EntityFrameworkCore;
namespace GameWebServer.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options)
            : base(options)
        {
        }
        public DbSet<User> Users { get; set; }
        public DbSet<Friendship> Friendships { get; set; }
        public DbSet<UserCode> UserCodes { get; set; }
        public DbSet<GameResult> GameResults { get; set; }
        public DbSet<GameReport> GameReports { get; set; }
        public DbSet<BannedUser> BannedUsers { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<Friendship>()
                .HasKey(f => new { f.UserId, f.FriendId });

            modelBuilder.Entity<Friendship>()
                .HasOne(f => f.User)
                .WithMany(u => u.Friends)
                .HasForeignKey(f => f.UserId)
                .OnDelete(DeleteBehavior.Restrict); // Avoid cascading delete

            modelBuilder.Entity<Friendship>()
                .HasOne(f => f.Friend)
                .WithMany()
                .HasForeignKey(f => f.FriendId)
                .OnDelete(DeleteBehavior.Restrict); // Avoid cascading delete


            modelBuilder.Entity<UserCode>()
                .HasOne(uc => uc.User)
                .WithMany(u => u.UserCodes)
                .HasForeignKey(uc => uc.UserId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<User>()
                .HasOne(u => u.SelectedCode)
                .WithMany()
                .HasForeignKey(t => t.SelectedCodeId)
                .OnDelete(DeleteBehavior.SetNull);

            modelBuilder.Entity<GameResult>()
                .HasKey(x => x.Id);

            modelBuilder.Entity<GameResult>()
                .HasOne(x => x.User1).WithMany()
                .HasForeignKey(x => x.User1Id)
                .OnDelete(DeleteBehavior.SetNull);

            modelBuilder.Entity<GameResult>()
                .HasOne(x => x.User2)
                .WithMany()
                .HasForeignKey(x => x.User2Id)
                .OnDelete(DeleteBehavior.SetNull);

            modelBuilder.Entity<GameReport>()
                .HasOne(x => x.GameResult)
                .WithMany()
                .HasForeignKey(x => x.GameResultId)
                .OnDelete(DeleteBehavior.SetNull);

            modelBuilder.Entity<GameReport>()
                .HasOne(x => x.Reporter)
                .WithMany()
                .HasForeignKey(x => x.ReporterId)
                .OnDelete(DeleteBehavior.SetNull);

            modelBuilder.Entity<BannedUser>()
                .HasOne(x => x.User)
                .WithMany()
                .HasForeignKey(x => x.UserId).OnDelete(DeleteBehavior.SetNull);

            modelBuilder.Entity<BannedUser>()
                .HasOne(x => x.GameReport)
                .WithMany()
                .HasForeignKey(x => x.ReportId)
                .OnDelete(DeleteBehavior.Restrict);


        }
    }

}
