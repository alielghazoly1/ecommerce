// src/components/common/SearchBar.jsx
import { Search, XCircle } from 'lucide-react';

const SearchBar = ({ value, onChange, onClear, placeholder = 'ابحث...' }) => (
  <div className="relative">
    <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 text-purple-400" />
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full pr-14 pl-14 py-4 bg-slate-800 border-2 border-purple-500/30 rounded-2xl text-white text-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all shadow-lg"
    />
    {value && (
      <button
        onClick={onClear}
        className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition bg-slate-700 rounded-lg p-1.5"
      >
        <XCircle className="w-5 h-5" />
      </button>
    )}
  </div>
);

export default SearchBar;