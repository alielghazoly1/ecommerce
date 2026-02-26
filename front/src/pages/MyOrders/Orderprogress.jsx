import { STATUS_STEPS, STEP_LABELS, STEP_ICONS } from "./Orderconstants"

const OrderProgress = ({ status }) => {
  if (status === 'cancelled') return null;
  const currentIdx = STATUS_STEPS.indexOf(status);

  return (
    <div className="flex items-center gap-0 mb-5">
      {STATUS_STEPS.map((step, idx) => {
        const Icon = STEP_ICONS[step];
        const isCompleted = idx <= currentIdx;
        const isCurrent   = idx === currentIdx;
        return (
          <div key={step} className="flex items-center flex-1">
            <div className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 
                ${isCompleted ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-200' : 'bg-gray-100 text-gray-400'} 
                ${isCurrent ? 'ring-2 ring-cyan-300 ring-offset-1' : ''}`}>
                <Icon className="w-3.5 h-3.5" />
              </div>
              <span className={`text-[10px] mt-1 font-medium ${isCompleted ? 'text-cyan-700' : 'text-gray-400'}`}>
                {STEP_LABELS[step]}
              </span>
            </div>
            {idx < STATUS_STEPS.length - 1 && (
              <div className={`h-0.5 flex-1 mb-4 transition-all duration-500 ${idx < currentIdx ? 'bg-cyan-500' : 'bg-gray-200'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
};

export default OrderProgress;