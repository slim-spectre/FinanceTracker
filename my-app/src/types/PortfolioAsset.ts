export interface PortfolioAsset {
  AssetId: number;
  Quantity: number;
  AveragePrice: number;
  CurrentPrice: number;
  UnrealizedPnL: number;
  RoiPercentage: number;
  assetTicker?: string; 
  assetName?: string; 
  coinIcon?: string;
}