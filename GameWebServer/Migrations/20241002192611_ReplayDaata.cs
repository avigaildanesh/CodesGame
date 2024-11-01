using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GameWebServer.Migrations
{
    /// <inheritdoc />
    public partial class ReplayDaata : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "States",
                table: "GameResults",
                newName: "ReplayData");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "ReplayData",
                table: "GameResults",
                newName: "States");
        }
    }
}
