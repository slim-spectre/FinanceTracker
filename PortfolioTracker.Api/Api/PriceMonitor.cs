using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Configuration;

public class PriceMonitor
{
    private readonly IServiceProvider _serviceProvider;

    public PriceMonitor(IServiceProvider serviceProvider)
    {
        _serviceProvider = serviceProvider;
    }

    public async Task StartTracking()
    {
        
        using var httpClient = new HttpClient();
        
        var configuration = _serviceProvider.GetRequiredService<IConfiguration>();
        string apiKey = configuration["CoinGecko:ApiKey"];
        httpClient.DefaultRequestHeaders.Add("x-cg-demo-api-key", apiKey);
        httpClient.DefaultRequestHeaders.UserAgent.ParseAdd("MyCryptoApp/1.0");

        while (true)
        {
            try
            {
                Console.WriteLine($"\n[{DateTime.Now}] Запит до CoinGecko (Топ-100 монет)...");

            
                var response = await httpClient.GetStringAsync(
                    "https://api.coingecko.com/api/v3/coins/markets?per_page=100&vs_currency=usd"
                );
                
              
                var result = JsonSerializer.Deserialize<List<CoinMarketData>>(response);

                if (result != null && result.Count > 0)
                {
                    using var scope = _serviceProvider.CreateScope();
                    var db = scope.ServiceProvider.GetRequiredService<FinanceDbContext>();

                    await SyncDatabase(db, result);
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error: {ex.Message}");
                try
                {
                    using var scope = _serviceProvider.CreateScope();
                    var db = scope.ServiceProvider.GetRequiredService<FinanceDbContext>();
                    
                    var fakeData = new List<CoinMarketData>
                    {
                        new() { Ticker = "btc", Name = "Bitcoin (Test)", CurrentPrice = 65000 },
                        new() { Ticker = "eth", Name = "Ethereum (Test)", CurrentPrice = 3500 }
                    };

                    await SyncDatabase(db, fakeData);
                }
                catch (Exception dbEx)
                {
                    Console.WriteLine($"Critical error: {dbEx.Message}");
                }
            }

            await Task.Delay(TimeSpan.FromMinutes(5)); 
        }
    }

    private async Task SyncDatabase(FinanceDbContext db, List<CoinMarketData> coins)
    {
        int maxAssetId = await db.MarketPrices.AnyAsync() 
            ? await db.MarketPrices.MaxAsync(x => x.AssetId) 
            : 0;

        int addedCount = 0;
        int updatedCount = 0;

        foreach (var coin in coins)
        {
            var dbPrice = await db.MarketPrices
                .FirstOrDefaultAsync(x => x.Ticker.ToLower() == coin.Ticker.ToLower());

            if (dbPrice != null)
            {
                dbPrice.CurrentPrice = coin.CurrentPrice;
                dbPrice.LastUpdated = DateTime.UtcNow;
                dbPrice.Name = coin.Name;
                updatedCount++;
            }
            else
            {
                maxAssetId++;
                var newAssetPrice = new AssetMarketPrice
                {
                    AssetId = maxAssetId,
                    Ticker = coin.Ticker.ToUpper(),
                    Name = coin.Name,
                    CurrentPrice = coin.CurrentPrice,
                    LastUpdated = DateTime.UtcNow
                };

                await db.MarketPrices.AddAsync(newAssetPrice);
                addedCount++;
            }
        }

        await db.SaveChangesAsync();
    }
}