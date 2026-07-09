export interface Watchlist {
  assetId: number; 
  ticker: string;
  name: string;
  currentPrice: number;
  coinIcon: string;
  priceChangePercentage24h: number;
}