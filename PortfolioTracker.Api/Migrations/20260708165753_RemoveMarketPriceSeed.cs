using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace PortfolioTracker.Api.Migrations
{
    /// <inheritdoc />
    public partial class RemoveMarketPriceSeed : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "MarketPrices",
                keyColumn: "Id",
                keyValue: 1);

            migrationBuilder.DeleteData(
                table: "MarketPrices",
                keyColumn: "Id",
                keyValue: 2);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.InsertData(
                table: "MarketPrices",
                columns: new[] { "Id", "AssetId", "CurrentPrice", "LastUpdated", "Name", "Ticker" },
                values: new object[,]
                {
                    { 1, 1, 250m, new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "Bitcoin", "BTC" },
                    { 2, 2, 6800m, new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "Eutherium", "EUT" }
                });
        }
    }
}
