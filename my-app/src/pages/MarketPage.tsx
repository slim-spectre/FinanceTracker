import { useState, useEffect } from "react"
import FetchMarketAssets from "../services/apiService"
import { type Asset } from "../types/Asset";
import SearchBar from "../components/SearchBar";

function MarketPage() {
  const [marketAssets, setMarketAssets] = useState<Asset[]>([]);
  const [isDownloading, setIsDownloading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [searchTerm,setSearchTerm] = useState<string>("");

  const filteredAssets = marketAssets.filter
  (asset => asset.Name.toLowerCase().includes(searchTerm.toLowerCase()) || asset.Ticker.toLowerCase().includes(searchTerm.toLowerCase()))


  useEffect(() => {
    const loadData = async () => {
      try {
        const funcResult = await FetchMarketAssets();
        setMarketAssets(funcResult.assets || []);
      } catch (ex) {
        setError(`${ex}`);
      } finally {
        setIsDownloading(false);
      }
    };
    loadData(); 
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Crypto Market</h1>
        <p className="text-sm text-gray-500 mt-1">Live asset pricing and historical metadata.</p>
        <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm}></SearchBar>
      </div>

      {isDownloading ? (
        <div className="text-center py-12 text-gray-500 font-medium animate-pulse">Downloading of assets...</div>
      ) : error ? (
        <div className="text-center py-12 text-rose-600 font-medium bg-rose-50 border border-rose-200 rounded-xl max-w-xl mx-auto">Error: {error}</div>
      ) : (
        
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-full divide-y divide-gray-200 text-left text-sm">
              <thead className="bg-gray-50/70">
                <tr>
                  <th className="px-6 py-4 font-semibold text-gray-500 uppercase tracking-wider text-xs">Name</th>
                  <th className="px-6 py-4 font-semibold text-gray-500 uppercase tracking-wider text-xs">Ticker</th>
                  <th className="px-6 py-4 font-semibold text-gray-500 uppercase tracking-wider text-xs">Current Price</th>
                  <th className="px-6 py-4 font-semibold text-gray-500 uppercase tracking-wider text-xs">24h Change</th>
                  <th className="px-6 py-4 font-semibold text-gray-500 uppercase tracking-wider text-xs">Last Updated</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {filteredAssets.map((item) => (
                  <tr key={item.AssetId} className="hover:bg-gray-50/60 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <img 
                          src={item.CoinIcon} 
                          className="w-6 h-6 rounded-full object-contain bg-gray-50" 
                          alt={item.Name} 
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "https://placeholder.co/24";
                          }}
                        /> 
                        <div className="font-semibold text-slate-900 tracking-wide">
                          {item.Name}
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-6 font-mono font-medium text-gray-600">
                      <span className="bg-gray-100 px-2 py-1 rounded text-xs uppercase">
                        {item.Ticker}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-gray-900 font-semibold">
                      ${item.CurrentPrice?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
                    </td>

                    <td className="py-4 px-6 font-mono font-medium">
                      {(() => {
                        const change = item.PriceChangePercentage24h ?? 0;
                        const isPositive = change >= 0;
                        return (
                          <span className={isPositive ? "text-emerald-600" : "text-rose-600"}>
                            {isPositive ? "▲ +" : "▼ "}{change.toFixed(2)}%
                          </span>
                        );
                      })()}
                    </td>

                    <td className="px-6 py-4 text-gray-500">
                      {item.LastUpdated ? new Date(item.LastUpdated).toLocaleDateString() : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )} 
    </div>
  )
}

export default MarketPage;