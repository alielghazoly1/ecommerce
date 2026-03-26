// src/components/monitoring/MetricCard.jsx
import { TrendingUp } from 'lucide-react';

export const MetricCard = ({ icon: Icon, title, value, subtitle, color, trend }) => (
  <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 hover:border-purple-500/30 transition-all group">
    <div className="flex items-start justify-between mb-4">
      <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      {trend && (
        <div className="flex items-center gap-1 text-green-400 text-sm">
          <TrendingUp className="w-4 h-4" />
          <span className="font-semibold">{trend}</span>
        </div>
      )}
    </div>
    <p className="text-gray-400 text-sm mb-2">{title}</p>
    <p className="text-2xl font-bold text-white mb-1">{value}</p>
    {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
  </div>
);

export const ProgressBar = ({ percentage, color = 'purple' }) => {
  const colorClasses = {
    purple: 'from-purple-500 to-pink-500',
    green: 'from-green-500 to-emerald-500',
    blue: 'from-blue-500 to-cyan-500',
    red: 'from-red-500 to-pink-500',
    yellow: 'from-yellow-500 to-orange-500',
  };
  return (
    <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
      <div
        className={`h-full bg-linear-to-r ${colorClasses[color]} transition-all duration-500`}
        style={{ width: `${Math.min(percentage, 100)}%` }}
      />
    </div>
  );
};

export const LogLevelBadge = ({ level }) => {
  const colors = {
    ERROR: 'bg-red-500/20 text-red-400 border-red-500/30',
    WARN: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    INFO: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    SUCCESS: 'bg-green-500/20 text-green-400 border-green-500/30',
    DEBUG: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  };
  return (
    <span className={`px-2 py-1 rounded-lg text-xs font-bold border ${colors[level] || colors.INFO}`}>
      {level}
    </span>
  );
};