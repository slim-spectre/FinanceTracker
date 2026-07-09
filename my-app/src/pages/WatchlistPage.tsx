import { useState, useEffect } from "react";
import { fetchWatchlists, deleteWatchlist } from "../services/watchlistService";
import { type Watchlist } from "../types/Watchlist"; 
import SearchBar from "../components/SearchBar";

function WatchlistPage() {
  const [watchlistData, setWatchlistData] = useState<Watchlist[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError("");
      const data = await fetchWatchlists();
      setWatchlistData(data);
    } catch (ex) {
      setError(`${ex}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (assetId: number) => {
    try {
      await deleteWatchlist({ AssetId: assetId });
      
      setWatchlistData(prev => prev.filter(item => item.assetId !== assetId));
    } catch (ex) {
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredWatchlist = watchlistData.filter(
    item =>
      item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.ticker?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) return <div className="text-center py-12 text-gray-500 font-medium animate-pulse">Loading watchlist...</div>;
  if (error) return <div className="text-center py-12 text-rose-600 font-medium bg-rose-50 border border-rose-200 rounded-xl max-w-xl mx-auto">Error: {error}</div>;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">My Watchlist Assets</h1>
        <p className="text-sm text-slate-500 mt-1">Assets you are tracking</p>
      </div>

      <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />

      {filteredWatchlist.length === 0 ? (
        <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-2xl border border-dashed border-gray-300">
          No assets found in your watchlist.
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-full divide-y divide-gray-200 text-left text-sm">
              <thead className="bg-gray-50/70">
                <tr>
                  <th className="px-6 py-4 font-semibold text-gray-500 uppercase tracking-wider text-xs">Asset</th>
                  <th className="px-6 py-4 font-semibold text-gray-500 uppercase tracking-wider text-xs">Current Price</th>
                  <th className="px-6 py-4 font-semibold text-gray-500 uppercase tracking-wider text-xs">24h Change</th>
                  <th className="px-6 py-4 font-semibold text-gray-500 uppercase tracking-wider text-xs text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100 bg-white">
                {filteredWatchlist.map((item) => (
                  <tr key={item.assetId} className="hover:bg-gray-50/60 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <img
                          src={item.coinIcon}
                          className="w-6 h-6 rounded-full object-contain bg-gray-50"
                          alt=""
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "https://placeholder.co/24";
                          }}
                        />
                        <div>
                          <div className="font-semibold text-slate-900 tracking-wide uppercase">
                            {item.ticker}
                          </div>
                          <div className="text-xs text-slate-400">
                            {item.name}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600 font-medium">
                      ${item.currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center font-semibold ${item.priceChangePercentage24h >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                        {item.priceChangePercentage24h >= 0 ? "+" : ""}
                        {item.priceChangePercentage24h.toFixed(2)}%
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDelete(item.assetId)}
                        className="bg-rose-50 text-rose-600 hover:bg-rose-100 font-semibold px-4 py-1.5 rounded-xl text-xs transition-colors"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default WatchlistPage;