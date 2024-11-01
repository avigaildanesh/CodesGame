using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace GameWebServer.Migrations
{
    /// <inheritdoc />
    public partial class code4 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "SelectedCodeId",
                table: "Users",
                type: "integer",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "UserCodes",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    UserId = table.Column<int>(type: "integer", nullable: false),
                    Title = table.Column<string>(type: "text", nullable: false),
                    CreatedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Code = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserCodes", x => x.Id);
                    table.ForeignKey(
                        name: "FK_UserCodes_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Users_SelectedCodeId",
                table: "Users",
                column: "SelectedCodeId");

            migrationBuilder.CreateIndex(
                name: "IX_UserCodes_UserId",
                table: "UserCodes",
                column: "UserId");

            migrationBuilder.AddForeignKey(
                name: "FK_Users_UserCodes_SelectedCodeId",
                table: "Users",
                column: "SelectedCodeId",
                principalTable: "UserCodes",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Users_UserCodes_SelectedCodeId",
                table: "Users");

            migrationBuilder.DropTable(
                name: "UserCodes");

            migrationBuilder.DropIndex(
                name: "IX_Users_SelectedCodeId",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "SelectedCodeId",
                table: "Users");
        }
    }
}
