using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GameWebServer.Migrations
{
    /// <inheritdoc />
    public partial class AddIsDeletedToReport : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_BannedUsers_GameReports_ReportId",
                table: "BannedUsers");

            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                table: "GameReports",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddForeignKey(
                name: "FK_BannedUsers_GameReports_ReportId",
                table: "BannedUsers",
                column: "ReportId",
                principalTable: "GameReports",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_BannedUsers_GameReports_ReportId",
                table: "BannedUsers");

            migrationBuilder.DropColumn(
                name: "IsDeleted",
                table: "GameReports");

            migrationBuilder.AddForeignKey(
                name: "FK_BannedUsers_GameReports_ReportId",
                table: "BannedUsers",
                column: "ReportId",
                principalTable: "GameReports",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }
    }
}
