import { useState, useEffect } from "react"
import { fetchTransactions } from "../services/transactionService";
import { type Transaction } from "../types/Transaction";
import FilteredTransactions from "../components/FilterTransactions";

function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isDownloading, setIsDownloading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [currentType,setCurrentType] = useState<string>("ALL");

  const filteredTransactions = currentType == "ALL" ? transactions : currentType == "BUY" ? 
  transactions.filter(t => t.Type == "BUY") : currentType == "SELL" ? transactions.filter(t => t.Type == "SELL") : [];


  useEffect(() => {
    const loadData = async ()  => {
        try{
          const funcResult = await fetchTransactions();
          setTransactions(funcResult.transactions || []);
        }catch(ex){
          setError(`${ex}`);
        }finally {
          setIsDownloading(false);
        }
      };
    loadData(); 
  }, []);

  return (
    
  <div className="max-w-6xl mx-auto px-4 py-8">
    <div className="mb-8">
      <h1 className="text-3xl font-bold text-slate-900 tracking-tight">History of transactions</h1>
      <p className="text-slate-500 mt-1">Full list of your finance transactions on stock.</p>
    </div>

    {isDownloading && (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-slate-500">Loading history...</span>
      </div>
    )}

    {error && (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6">
        <p className="font-semibold">Couldntt download data</p>
        <p className="text-sm">{error}</p>
      </div>
    )}

    {!isDownloading && !error && (
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {transactions.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <p className="text-xl font-medium">No transactions now</p>
            <p className="text-sm mt-1">Here you can see your transactions of assets.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <FilteredTransactions currentType={currentType} setCurrentType={setCurrentType} />
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/75 border-b border-slate-100 text-slate-500 text-xs font-semibold uppercase tracking-wider">
                  <th className="py-4 px-6">Type</th>
                  <th className="py-4 px-6">Asset</th>
                  <th className="py-4 px-6">Quantity</th>
                  <th className="py-4 px-6">Price</th>
                  <th className="py-4 px-6">Total amount</th>
                  <th className="py-4 px-6">Fees</th>
                  <th className="py-4 px-6">Date</th>
                  <th className="py-4 px-6">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                {filteredTransactions?.map((tx) => {
                  const isBuy = tx.Type === 'BUY';

                  return (
                    <tr key={tx.Id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium tracking-wide shadow-sm
                          ${isBuy 
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}>
                          {isBuy ? 'BUY' : 'SELL'}
                        </span>
                      </td>

                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <img src={tx.AssetIcon} className="w-6 h-6 rounded-full object-contain" alt="" /> 
                          <div>
                            <div className="font-semibold text-slate-900 tracking-wide">
                              {tx.AssetTicker}
                            </div>
                            <div className="text-xs text-slate-400">
                              {tx.AssetName}
                            </div>
                          </div>
                        </div>
                      </td>
                      
                      <td className="py-4 px-6 font-mono">{tx.Quantity}</td>
                      
                      <td className="py-4 px-6 font-mono">${Number(tx.Price).toLocaleString()}</td>
                      
                      <td className="py-4 px-6 font-mono font-semibold text-slate-900">
                        ${Number(tx.TotalAmount).toLocaleString()}
                      </td>
                      
                      <td className="py-4 px-6 font-mono text-slate-400">${tx.Fees}</td>
                      
                      <td className="py-4 px-6 text-slate-500">
                        {new Date(tx.Date).toLocaleDateString('uk-UA', {
                          day: 'numeric',
                          month: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                      <td className="py-4 px-6 text-slate-400 italic max-w-xs truncate" title={tx.Notes}>
                        {tx.Notes || '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    )}
  </div>
  );
  
}

export default TransactionsPage;