import { type PortfolioAsset } from "./PortfolioAsset";


export interface ISellAssetModalProps {
  asset: PortfolioAsset;     
  onClose: () => void;        
  onAssetSold: () => void;    
}