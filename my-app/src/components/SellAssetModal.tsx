import React, { useState } from 'react'
import { toast } from 'react-hot-toast'
import { type ISellAssetModalProps } from '../types/ISellAssetModalProps'
import { validateSellQuantity } from '../utils/validation'
import { fetchSellAsset } from '../services/portfolioService'

function SellAssetModal({ asset, onClose, onAssetSold }: ISellAssetModalProps) {
  const [quantity, setQuantity] = useState<number>()
  const [quantityError, setQuantityError] = useState<string>('')
  const price = asset.CurrentPrice
  const maxQuantity = asset.Quantity

  const handleSubmit = async (e: React.SubmitEvent) => {
    try {
      e.preventDefault()
      if (quantityError || !quantity) {
        toast.error('Please eradicate validation errors')
        return
      }
      await fetchSellAsset({ 
        assetId: asset.AssetId, 
        quantity: quantity,
        price : price,
      });

      toast.success("Asset sold successfully!");
      onAssetSold();
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Network error, please try again later')
    }
  }

  const handleQuantity = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value)
    setQuantity(value)
    setQuantityError(validateSellQuantity(value, maxQuantity, 'Not correct quantity'))
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-md bg-white border border-gray-200 rounded-2xl shadow-2xl p-6 relative">
        <h3 className="text-xl font-bold text-gray-900 mb-2">Sell Asset</h3>
        <p className="text-sm text-gray-500 mb-5">Asset ID: <span className="font-semibold text-gray-800">#{asset.AssetId}</span></p>

        <div className="bg-gray-50 border border-gray-100 rounded-xl p-3.5 mb-5 text-sm text-gray-600 space-y-1">
          <div className="flex justify-between">
            <span>Available for sale:</span>
            <span className="font-semibold text-gray-900">{asset.Quantity}</span>
          </div>
          <div className="flex justify-between">
            <span>Market Price:</span>
            <span className="font-semibold text-emerald-600">${price}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Quantity to sell</label>
            <input 
              type="number" 
              value={quantity || ''} 
              onChange={handleQuantity} 
              placeholder="0.00" 
              className={`w-full px-3 py-2 border rounded-xl focus:outline-none transition-all text-sm ${
                quantityError ? "border-rose-500 focus:ring-4 focus:ring-rose-500/10" : "border-gray-300 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500"
              }`}
            />
            {quantityError && <p className="text-rose-500 text-xs mt-1 font-medium">{quantityError}</p>}
          </div>

          <div className="flex gap-3 pt-2">
            <button 
              type="button" 
              onClick={onClose}
              className="w-1/2 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-sm rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="w-1/2 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-sm rounded-xl shadow-sm transition-colors"
            >
              Confirm Sell
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default SellAssetModal;