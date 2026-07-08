export interface Transaction {
  Id: number;
  UserId: number;
  AssetId: number;
  
  AssetTicker: string;
  AssetName: string;
  AssetIcon: string;
  Type: 'BUY' | 'SELL'; 
  
  Quantity: number;
  Price: number;
  TotalAmount: number;
  Date: string;
  Fees: number;
  Notes: string;
}