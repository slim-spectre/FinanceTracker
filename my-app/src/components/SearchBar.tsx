import { type ISearchBarProps } from "../types/ISearchBarProps";

function SearchBar({searchTerm,setSearchTerm} : ISearchBarProps) {
  return  (
    <div className="relative max-w-md mt-2 mb-6">
          <img className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" src="/images/search.png" alt="search icon" />
          <input type="text" placeholder="Search by name or ticker..." 
            value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-sm text-gray-950 placeholder:text-gray-400 rounded-xl border border-gray-200 bg-white/80 focus:border-gray-400 focus:ring-2 focus:ring-gray-100 transition-all" />
        </div>
  );
}

export default SearchBar;