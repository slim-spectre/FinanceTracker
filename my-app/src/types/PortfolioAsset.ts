export interface PortfolioAsset {
  AssetId: number;
  Quantity: number;
  AveragePrice: number;
  CurrentPrice: number;
  UnrealizedPnL: number;
  RoiPercentage: number;
  AssetTicker?: string; 
  AssetName?: string; 
  coinIcon?: string;
}