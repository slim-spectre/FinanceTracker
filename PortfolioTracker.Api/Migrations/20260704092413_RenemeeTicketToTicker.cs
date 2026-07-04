using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PortfolioTracker.Api.Migrations
{
    /// <inheritdoc />
    public partial class RenemeeTicketToTicker : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "Ticket",
                table: "MarketPrices",
                newName: "Ticker");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "Ticker",
                table: "MarketPrices",
                newName: "Ticket");
        }
    }
}
