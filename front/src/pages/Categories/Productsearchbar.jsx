import { Search } from 'lucide-react';

/**
 * Controlled search input with a clear button.
 * Parent owns the state via `value` + `onChange`.
 */
const ProductSearchBar = ({ value, onChange }) => (
  <div className="max-w-2xl mx-auto mb-6 sm:mb-8">
    <div className="relative group">
      {/* Glow layer */}
      <div className="absolute inset-0 bg-linear-to-r from-blue-500 to-indigo-500 rounded-2xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity duration-300" />

      <div className="relative flex items-center bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
        <Search className="absolute right-4 sm:right-6 w-5 h-5 sm:w-6 sm:h-6 text-gray-400 pointer-events-none" />
        <input
          type="text"
          placeholder="ابحث عن المنتج الذي تريده..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full pr-12 sm:pr-16 pl-10 sm:pl-6 py-4 sm:py-5 text-base sm:text-lg text-gray-900 placeholder-gray-400 bg-transparent focus:outline-none"
          dir="rtl"
        />
        {value && (
          <button
            onClick={() => onChange('')}
            className="absolute left-4 sm:left-6 text-gray-400 hover:text-gray-600 transition-colors duration-200"
            aria-label="مسح البحث"
          >
            <span className="text-2xl leading-none">×</span>
          </button>
        )}
      </div>
    </div>
  </div>
);

export default ProductSearchBar;