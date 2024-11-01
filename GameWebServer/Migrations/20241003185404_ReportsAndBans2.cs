using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GameWebServer.Migrations
{
    /// <inheritdoc />
    public partial class ReportsAndBans2 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_BannedUsers_GameReports_ReportId",
                table: "BannedUsers");

            migrationBuilder.DropForeignKey(
                name: "FK_BannedUsers_Users_UserId",
                table: "BannedUsers");

            migrationBuilder.DropForeignKey(
                name: "FK_GameReports_GameResults_GameResultId",
                table: "GameReports");

            migrationBuilder.DropForeignKey(
                name: "FK_GameReports_Users_ReporterId",
                table: "GameReports");

            migrationBuilder.AddForeignKey(
                name: "FK_BannedUsers_GameReports_ReportId",
                table: "BannedUsers",
                column: "ReportId",
                principalTable: "GameReports",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_BannedUsers_Users_UserId",
                table: "BannedUsers",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_GameReports_GameResults_GameResultId",
                table: "GameReports",
                column: "GameResultId",
                principalTable: "GameResults",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_GameReports_Users_ReporterId",
                table: "GameReports",
                column: "ReporterId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_BannedUsers_GameReports_ReportId",
                table: "BannedUsers");

            migrationBuilder.DropForeignKey(
                name: "FK_BannedUsers_Users_UserId",
                table: "BannedUsers");

            migrationBuilder.DropForeignKey(
                name: "FK_GameReports_GameResults_GameResultId",
                table: "GameReports");

            migrationBuilder.DropForeignKey(
                name: "FK_GameReports_Users_ReporterId",
                table: "GameReports");

            migrationBuilder.AddForeignKey(
                name: "FK_BannedUsers_GameReports_ReportId",
                table: "BannedUsers",
                column: "ReportId",
                principalTable: "GameReports",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_BannedUsers_Users_UserId",
                table: "BannedUsers",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_GameReports_GameResults_GameResultId",
                table: "GameReports",
                column: "GameResultId",
                principalTable: "GameResults",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_GameReports_Users_ReporterId",
                table: "GameReports",
                column: "ReporterId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
