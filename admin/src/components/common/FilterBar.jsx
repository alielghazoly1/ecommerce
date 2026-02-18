// src/components/common/FilterBar.jsx
import { Filter } from 'lucide-react';

const FilterBar = ({
  title,
  icon: Icon = Filter,
  options,
  activeValue,
  onSelect,
  getCount,
}) => (
  <div className="bg-slate-800 rounded-2xl border-2 border-purple-500/20 p-6 shadow-xl">
    <div className="flex items-center gap-3 mb-5">
      <Icon className="w-6 h-6 text-purple-400" />
      <h3 className="text-xl font-bold text-white">{title}</h3>
    </div>
    <div className="flex items-center gap-3 flex-wrap">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onSelect(opt.value)}
          className={`px-6 py-3.5 rounded-xl font-bold text-base transition-all transform hover:scale-105 border-2 ${
            activeValue === opt.value
              ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white border-purple-400 shadow-2xl shadow-purple-500/50'
              : 'bg-slate-700 text-gray-300 border-slate-600 hover:bg-slate-600 hover:border-purple-500/50'
          }`}
        >
          {opt.label}
          {getCount && (
            <span className="ml-2 font-black text-lg">
              ({getCount(opt.value)})
            </span>
          )}
        </button>
      ))}
    </div>
  </div>
);

export default FilterBar;
