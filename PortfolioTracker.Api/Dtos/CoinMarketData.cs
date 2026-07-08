using System.Text.Json.Serialization;

public class CoinMarketData
{
    [JsonPropertyName("id")]
    public string Id {get;set;} // becouse api of coinGecko returns it as string
    [JsonPropertyName("symbol")]
    public string Ticker {get;set;} = string.Empty;
    [JsonPropertyName("name")]
    public string Name {get;set;} = string.Empty;
    [JsonPropertyName("current_price")]
    public decimal CurrentPrice {get;set;}
    [JsonPropertyName("image")]
    public string coinIcon {get;set;} = string.Empty;
    [JsonPropertyName("price_change_percentage_24h")]
    public decimal changeOfPriceByDayInPercent  {get;set;}

}