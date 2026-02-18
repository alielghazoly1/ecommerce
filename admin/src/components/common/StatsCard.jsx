// src/components/common/StatsCard.jsx

const StatsCard = ({ label, value, color = 'white', size = 'md' }) => {
  const colorMap = {
    white: 'text-white',
    green: 'text-green-400',
    red: 'text-red-400',
    yellow: 'text-yellow-400',
    blue: 'text-blue-400',
    purple: 'text-purple-400',
    cyan: 'text-cyan-400',
  };

  return (
    <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-4">
      <p className="text-gray-400 text-sm mb-1">{label}</p>
      <p className={`font-bold ${colorMap[color]} ${size === 'lg' ? 'text-3xl' : 'text-2xl'}`}>
        {value}
      </p>
    </div>
  );
};

export default StatsCard;