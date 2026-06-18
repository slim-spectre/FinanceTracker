public class Portfolio
{
    public int Id {get;set;}
    public int UserId  {get;set;}

    public int AssetId {get;set;}
    public decimal Quantity {get;set;}
    public decimal AveragePrice {get;set;}
    public decimal TotalInvested {get;set;}
}