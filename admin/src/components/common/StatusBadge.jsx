// src/components/common/StatusBadge.jsx
import { getStatusColor, getStatusLabel } from '../../utils/helpers';

const StatusBadge = ({ status, className = '' }) => (
  <span className={`px-4 py-2 rounded-xl font-black text-sm border-2 ${getStatusColor(status)} ${className}`}>
    {getStatusLabel(status)}
  </span>
);

export default StatusBadge;