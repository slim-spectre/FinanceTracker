import { type PortfolioAsset } from "./PortfolioAsset";

export interface UserPortfolio {
  NetWorth: number;
  CashBalance: number;
  Assets: PortfolioAsset[];
}