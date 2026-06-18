public class Transaction
{
    public int Id {get;set;}
    public int UserId {get;set;}
    public int AssetId {get;set;}
    public TransactionType Type {get;set;}
    public decimal Quantity {get;set;}
    public decimal Price {get;set;}
    public decimal TotalAmount {get;set;}
    public DateTime Date {get;set;}
    public decimal Fees {get;set;}
    public string Notes {get;set;} = string.Empty;
    
}