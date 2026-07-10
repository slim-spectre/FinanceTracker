using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;

public class PriceMonitor
{
    private readonly DbContextOptions<FinanceDbContext> _options;
    private readonly IConfiguration _configuration;

    public PriceMonitor(DbContextOptions<FinanceDbContext> options, IConfiguration configuration)
    {
        _options = options;
        _configuration = configuration;
    }

    public async Task StartTracking()
    {
        using var httpClient = new HttpClient();
        
        string apiKey = _configuration["CoinGecko:ApiKey"] ?? "";
        if (!string.IsNullOrEmpty(apiKey))
            httpClient.DefaultRequestHeaders.Add("x-cg-demo-api-key", apiKey);
        
        httpClient.DefaultRequestHeaders.UserAgent.ParseAdd("MyCryptoApp/1.0");

        while (true)
        {
            try
            {
                var response = await httpClient.GetStringAsync(
                    "https://api.coingecko.com/api/v3/coins/markets?per_page=100&vs_currency=usd"
                );
                
                var result = JsonSerializer.Deserialize<List<CoinMarketData>>(response);

                if (result != null && result.Count > 0)
                {
                    using var db = new FinanceDbContext(_options);
                    await SyncDatabase(db, result);
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in PriceMonitor: {ex.Message}");
            }

            await Task.Delay(TimeSpan.FromMinutes(5)); 
        }
    }

    private async Task SyncDatabase(FinanceDbContext db, List<CoinMarketData> coins)
    {
        var allPrices = await db.MarketPrices.ToListAsync();
        var priceDict = allPrices.ToDictionary(p => p.Ticker.ToLower());

        foreach (var coin in coins)
        {
            var ticker = coin.Ticker.ToLower();
            
            if (priceDict.TryGetValue(ticker, out var dbPrice))
            {
                
                dbPrice.CurrentPrice = coin.CurrentPrice;
                dbPrice.LastUpdated = DateTime.UtcNow;
                dbPrice.PriceChangePercentage24h = coin.ChangeOfPriceByDayInPercent;
                dbPrice.Name = coin.Name;
                dbPrice.CoinIcon = coin.CoinIcon;
            }
            else
            {
             
                db.MarketPrices.Add(new AssetMarketPrice 
                { 
                    Ticker = coin.Ticker, 
                    CurrentPrice = coin.CurrentPrice,
                    Name = coin.Name,
                    CoinIcon = coin.CoinIcon,
                    PriceChangePercentage24h = coin.ChangeOfPriceByDayInPercent,
                    LastUpdated = DateTime.UtcNow
                });
            }
        }
        
        await db.SaveChangesAsync();
    }
}