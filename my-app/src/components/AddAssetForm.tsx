import React, { useState, useEffect } from "react";
import { validateAssetId, validatePrice, validateQuantity } from "../utils/validation";
import { toast } from 'react-hot-toast';
import { type BuyAssetCredentials } from "../types/BuyAssetCredentials";
import { fetchBuyAsset } from "../services/portfolioService";
import FetchMarketAssets from "../services/apiService"; 
import { type Asset } from "../types/Asset";
import { type IAddAssetFormProps } from "../types/IAddAssetFormProps";


function AddAssetForm({ onAssetBought }: IAddAssetFormProps) {
  const [availableAssets, setAvailableAssets] = useState<Asset[]>([]);
  const [assetId, setAssetId] = useState<number>(0);
  const [quantity, setQuantity] = useState<number | string>("");
  const [price, setPrice] = useState<number | string>("");

  const [assetIdError, setAssetIdError] = useState<string>("");
  const [quantityError, setQuantityError] = useState<string>("");
  const [priceError, setPriceError] = useState<string>("");

  useEffect(() => {
    const getAssets = async () => {
      try {
        const data = await FetchMarketAssets();
        setAvailableAssets(data.assets || data); 
      } catch (ex) {
        toast.error("Couldntt loadd assets sorrryyy");
      }
    };
    getAssets();
  } , []);

  
  const handleSubmit = async (e: React.SubmitEvent) => {
    try {
      e.preventDefault();
      
      const numAssetId = Number(assetId);
      const numQuantity = Number(quantity);
      const numPrice = Number(price);

      if (assetIdError || quantityError || priceError || !numAssetId || !numQuantity || !numPrice) {
        toast.error("Please eridicate errors of validation");
        return;
      }
      
      const credentials: BuyAssetCredentials = { 
        assetId: numAssetId, 
        quantity: numQuantity, 
        price: numPrice 
      };
      
      await fetchBuyAsset(credentials);
      
      toast.success("Asset was boiught successfully!");
      
      setQuantity("");
      setPrice("");
      setAssetId(0);

      onAssetBought(); 
    } catch (error: any) {
      toast.error(error.message || "Network error try laterr pleaseeee");
    }
  };

  const handleAssetId = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = Number(e.target.value);
    setAssetId(value);
    setAssetIdError(validateAssetId(value, "Choose correct assrt"));
  };

  const handleQuantity = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuantity(value);
    setQuantityError(validateQuantity(Number(value), "Not correct quantity"));
  };

  const handlePrice = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPrice(value);
    setPriceError(validatePrice(Number(value), "Not correct price"));
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '300px' }}>
      <select value={assetId} onChange={handleAssetId}>
        <option value={0}>-- Choose asset --</option>
        {availableAssets.map((asset) => (
          <option key={asset.AssetId} value={asset.AssetId}>
            {asset.Name} ({asset.Ticker})
          </option>
        ))}
      </select>
      {assetIdError && <span style={{ color: 'red' }}>{assetIdError}</span>}

      <input type="number" step="any" value={quantity} onChange={handleQuantity} placeholder="(Quantity)" />
      {quantityError && <span style={{ color: 'red' }}>{quantityError}</span>}
      
      <input type="number" step="any" value={price} onChange={handlePrice} placeholder="(Price в USD)" />
      {priceError && <span style={{ color: 'red' }}>{priceError}</span>}
      
      <button type="submit">Buy Asset</button>
    </form>
  );
}

export default AddAssetForm;