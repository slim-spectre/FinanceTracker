public class TransactionResponseDto
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public int AssetId { get; set; }
    
    public string AssetTicker { get; set; } = string.Empty;
    public string AssetName { get; set; } = string.Empty;
    public string AssetIcon { get; set; } = string.Empty;

    public string Type { get; set; } = string.Empty; 
    public decimal Quantity { get; set; }
    public decimal Price { get; set; }
    public decimal TotalAmount { get; set; }
    public DateTime Date { get; set; }
    public decimal Fees { get; set; }
    public string Notes { get; set; } = string.Empty;
}