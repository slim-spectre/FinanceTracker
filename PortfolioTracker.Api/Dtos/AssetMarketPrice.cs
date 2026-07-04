public class AssetMarketPrice
{
    public int Id {get;set;}
    public int AssetId {get;set;}

    public string Ticker {get;set;} = string.Empty;
    public decimal CurrentPrice {get;set;}

    public DateTime LastUpdated {get;set;}

    public string Name {get;set;} = string.Empty;
}
