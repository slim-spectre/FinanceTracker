import { type IFilteredTransactionsProps } from "../types/IFilteredTransactionsProps";

function FilteredTransactions({ currentType, setCurrentType }: IFilteredTransactionsProps) {
  const baseStyle = "rounded-lg px-4 py-1.5 text-xs font-semibold tracking-wide uppercase transition-all duration-200";
  const activeStyle = "bg-white text-slate-900 shadow-sm border border-slate-200/50";
  const inactiveStyle = "text-slate-500 hover:text-slate-800 hover:bg-slate-200/50 bg-transparent border border-transparent";

  return (
    <div className="inline-flex bg-slate-100/80 p-1 rounded-xl gap-1 mb-6 mt-4 mx-6 border border-slate-200/30">
      
     
      <button 
        onClick={() => setCurrentType("ALL")}
        className={`${baseStyle} ${currentType === "ALL" ? activeStyle : inactiveStyle}`}
      >
        ALL
      </button>

      <button 
        onClick={() => setCurrentType("BUY")}
        className={`${baseStyle} ${currentType === "BUY" ? activeStyle : inactiveStyle}`}
      >
        BUY
      </button>

      <button 
        onClick={() => setCurrentType("SELL")}
        className={`${baseStyle} ${currentType === "SELL" ? activeStyle : inactiveStyle}`}
      >
        SELL
      </button>

    </div>
  );
}

export default FilteredTransactions;