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
        toast.error("Couldn't load assets summary");
      }
    };
    getAssets();
  } , []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    try {
      e.preventDefault();
      
      const numAssetId = Number(assetId);
      const numQuantity = Number(quantity);
      const numPrice = Number(price);

      if (assetIdError || quantityError || priceError || !numAssetId || !numQuantity || !numPrice) {
        toast.error("Please eradicate validation errors");
        return;
      }
      
      const credentials: BuyAssetCredentials = { 
        assetId: numAssetId, 
        quantity: numQuantity, 
        price: numPrice 
      };
      
      await fetchBuyAsset(credentials);
      toast.success("Asset was bought successfully!");
      
      setQuantity("");
      setPrice("");
      setAssetId(0);
      onAssetBought(); 
    } catch (error: any) {
      toast.error(error.message || "Network error, try later please");
    }
  };

  const handleAssetId = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = Number(e.target.value);
    setAssetId(value);
    setAssetIdError(validateAssetId(value, "Choose correct asset"));

    const selectedAsset = availableAssets.find((asset) => asset.AssetId === value);
    if (selectedAsset) {
      setPrice(selectedAsset.CurrentPrice); 
      setPriceError(""); 
    } else {
      setPrice(""); 
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col lg:flex-row items-start gap-4 w-full">
      <div className="w-full lg:w-1/4">
        <select 
          value={assetId} 
          onChange={handleAssetId}
          className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 bg-white text-sm"
        >
          <option value={0}>-- Choose asset --</option>
          {availableAssets.map((asset) => (
            <option key={asset.AssetId} value={asset.AssetId}>
              {asset.Name} ({asset.Ticker})
            </option>
          ))}
        </select>
        {assetIdError && <p className="text-rose-500 text-xs mt-1 font-medium">{assetIdError}</p>}
      </div>

      <div className="w-full lg:w-1/4">
        <input 
          type="number" 
          step="any" 
          value={quantity} 
          onChange={(e) => {
            setQuantity(e.target.value);
            setQuantityError(validateQuantity(Number(e.target.value), "Not correct quantity"));
          }} 
          placeholder="Quantity" 
          className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 text-sm"
        />
        {quantityError && <p className="text-rose-500 text-xs mt-1 font-medium">{quantityError}</p>}
      </div>
      
      <div className="w-full lg:w-1/4">
        <input 
          type="number" 
          step="any" 
          readOnly 
          value={price} 
          placeholder="Price in USD" 
          className="w-full px-3 py-2 border border-gray-100 rounded-xl bg-gray-50 text-gray-500 text-sm focus:outline-none cursor-not-allowed"
        />
        {priceError && <p className="text-rose-500 text-xs mt-1 font-medium">{priceError}</p>}
      </div>
      
      <button 
        type="submit"
        className="w-full lg:w-auto px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl transition-colors shadow-sm self-stretch lg:self-auto"
      >
        Buy Asset
      </button>
    </form>
  );
}

export default AddAssetForm;