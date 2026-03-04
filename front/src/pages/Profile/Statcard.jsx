/**
 * StatCard
 * --------
 * Reusable card that displays a single account statistic (e.g. total orders).
 *
 * Props:
 *  - icon      {React.ElementType} – Lucide icon component
 *  - label     {string}            – Human-readable label (Arabic)
 *  - value     {string|number}     – Formatted value to display
 *  - bgColor   {string}            – Tailwind background class  (e.g. "bg-cyan-50")
 *  - iconColor {string}            – Tailwind icon colour class  (e.g. "text-cyan-600")
 *  - valueColor{string}            – Tailwind value colour class (e.g. "text-cyan-600")
 */
const StatCard = ({  label, value, bgColor, iconColor, valueColor }) => (
  <div className={`flex items-center justify-between p-3 ${bgColor} rounded-lg`}>
    <div className="flex items-center gap-3">
      <Icon className={`w-5 h-5 ${iconColor}`} />
      <span className="font-medium text-gray-700">{label}</span>
    </div>
    <span className={`text-xl font-bold ${valueColor}`}>{value}</span>
  </div>
);

export default StatCard;