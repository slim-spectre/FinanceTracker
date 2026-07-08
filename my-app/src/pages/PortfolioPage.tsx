import { useState, useEffect } from "react";
import fetchUserPortfolio from "../services/portfolioService";
import AddAssetForm from "../components/AddAssetForm";
import { type UserPortfolio } from "../types/UserPortfolio";
import SellAssetModal from "../components/SellAssetModal";

function PortfolioPage() {
  const [portfolioData, setPortfolioData] = useState<UserPortfolio | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [selectedAsset, setSelectedAsset] = useState<any>(null);

  const onClose = () => setSelectedAsset(null);

  const handleSellClick = (item: any) => {
      setSelectedAsset(item);
  };
  
  const loadData = async () => {
    try {
      setIsLoading(true);
      const data = await fetchUserPortfolio();
      setPortfolioData(data);
    } catch (ex) {
      setError(`${ex}`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (isLoading) return <div className="text-center py-12 text-gray-500 font-medium animate-pulse">Loading portfolio...</div>;
  if (error) return <div className="text-center py-12 text-rose-600 font-medium bg-rose-50 border border-rose-200 rounded-xl max-w-xl mx-auto">Error: {error}</div>;

  return (
    <div className="space-y-8">
      {selectedAsset && (
        <SellAssetModal 
          asset={selectedAsset} 
          onClose={onClose} 
          onAssetSold={loadData} 
        />
      )}

      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">My Invest Portfolio</h1>
        <p className="text-sm text-gray-500 mt-1">Real-time overview of your financial assets.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between">
          <span className="text-sm font-semibold text-gray-400 uppercase tracking-wider">General balance (NetWorth)</span>
          <span className="text-3xl font-bold text-gray-900 mt-2">${portfolioData?.NetWorth?.toLocaleString()}</span>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between">
          <span className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Available money (CashBalance)</span>
          <span className="text-3xl font-bold text-emerald-600 mt-2">${portfolioData?.CashBalance?.toLocaleString()}</span>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Buy New Asset</h3>
        <AddAssetForm onAssetBought={loadData} />
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-full divide-y divide-gray-200 text-left text-sm">
            <thead className="bg-gray-50/70">
              <tr>
                <th className="px-6 py-4 font-semibold text-gray-500 uppercase tracking-wider text-xs">Asset ID</th>
                <th className="px-6 py-4 font-semibold text-gray-500 uppercase tracking-wider text-xs">Amount</th>
                <th className="px-6 py-4 font-semibold text-gray-500 uppercase tracking-wider text-xs">Average Price</th>
                <th className="px-6 py-4 font-semibold text-gray-500 uppercase tracking-wider text-xs">Current Price</th>
                <th className="px-6 py-4 font-semibold text-gray-500 uppercase tracking-wider text-xs">Profit/Loss</th>
                <th className="px-6 py-4 font-semibold text-gray-500 uppercase tracking-wider text-xs text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white"> 
              {portfolioData?.Assets?.map((item: any) => (
                <tr key={item.AssetId} className="hover:bg-gray-50/60 transition-colors">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <img 
                        src={item.CoinIcon || item.coinIcon} 
                        className="w-6 h-6 rounded-full object-contain bg-gray-50" 
                        alt="" 
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "https://placeholder.co/24";
                        }}
                      /> 
                      <div>
                        
                        <div className="font-semibold text-slate-900 tracking-wide uppercase">
                          {item.AssetTicker || item.assetTicker || `ID: ${item.AssetId || item.assetId}`}
                        </div>

                        <div className="text-xs text-slate-400">
                          {item.AssetName || item.assetName || "Crypto Asset"}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{item.Quantity}</td>
                  <td className="px-6 py-4 text-gray-600">${item.AveragePrice}</td>
                  <td className="px-6 py-4 text-gray-600">${item.CurrentPrice}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center font-semibold ${item.UnrealizedPnL >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                      {item.UnrealizedPnL >= 0 ? "+" : ""}${item.UnrealizedPnL.toFixed(2)} ({item.RoiPercentage}%)
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => handleSellClick(item)}
                      className="bg-rose-50 text-rose-600 hover:bg-rose-100 font-semibold px-4 py-1.5 rounded-xl text-xs transition-colors"
                    >
                      Sell
                    </button>
                </td> 
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default PortfolioPage;