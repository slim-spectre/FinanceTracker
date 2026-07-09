import { useState, useEffect } from "react";
import fetchUserPortfolio from "../services/portfolioService";
import AddAssetForm from "../components/AddAssetForm";
import { type UserPortfolio } from "../types/UserPortfolio";
import SellAssetModal from "../components/SellAssetModal";
import {type  ChartAsset } from "../types/ChartAsset";
import PortfolioPieChart from "../components/PortfolioPieChart";
import SearchBar from "../components/SearchBar";

function PortfolioPage() {
  const [portfolioData, setPortfolioData] = useState<UserPortfolio | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [selectedAsset, setSelectedAsset] = useState<any>(null);
  const [searchTerm,setSearchTerm] = useState<string>("");
  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#3b82f6', '#ec4899'];

  const onClose = () => setSelectedAsset(null);

  const handleSellClick = (item: any) => {
      setSelectedAsset(item);
  };
  const totalPnL = portfolioData?.Assets?.reduce((sum, item) => sum + (item.UnrealizedPnL || 0), 0) || 0;
  const assetsCount = portfolioData?.Assets?.length || 0;

  const filteredPortfolio = portfolioData?.Assets.filter
  (portfolio => portfolio.AssetName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
  portfolio.AssetTicker?.toLowerCase().includes(searchTerm.toLowerCase()))
  console.log(filteredPortfolio)

  const chartData = (portfolioData?.Assets || [])
  .map((t, index) => ({
    name: t.AssetTicker,
    value: t.Quantity * t.CurrentPrice,
    fill: COLORS[index % COLORS.length]
  }))
  .sort((a, b) => a.value - b.value) as ChartAsset[];


  
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
      

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      <div className="lg:col-span-2 flex flex-col justify-between min-h-[340px]">
        
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
          <span className="text-sm font-semibold text-gray-400 uppercase tracking-wider">General balance (NetWorth)</span>
          <span className="text-3xl font-bold text-gray-900 mt-2 block">${portfolioData?.NetWorth?.toLocaleString()}</span>
        </div>

        <div className="grid grid-cols-2 gap-4 my-2">
          <div className="bg-gray-50/60 border border-gray-100 p-4 rounded-xl flex items-center justify-between">
            <div>
              <span className="text-xs font-medium text-gray-400 block">Total Profit / Loss</span>
              <span className={`text-base font-bold mt-0.5 block ${totalPnL >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                {totalPnL >= 0 ? "+" : ""}${totalPnL.toFixed(2)}
              </span>
            </div>
            <span className="text-xl">📈</span>
          </div>
          
          <div className="bg-gray-50/60 border border-gray-100 p-4 rounded-xl flex items-center justify-between">
            <div>
              <span className="text-xs font-medium text-gray-400 block">Active Assets</span>
              <span className="text-base font-bold text-slate-700 mt-0.5 block">{assetsCount} positions</span>
            </div>
            <span className="text-xl">🪙</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
          <span className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Available money (CashBalance)</span>
          <span className="text-3xl font-bold text-emerald-600 mt-2 block">${portfolioData?.CashBalance?.toLocaleString()}</span>
        </div>

      </div>

      <div className="lg:col-span-1">
        <PortfolioPieChart chartData={chartData || []} />
      </div>

    </div>
      


      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Buy New Asset</h3>
        <AddAssetForm onAssetBought={loadData} />
      </div>
      <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm}></SearchBar>
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
              {filteredPortfolio?.map((item: any) => (
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