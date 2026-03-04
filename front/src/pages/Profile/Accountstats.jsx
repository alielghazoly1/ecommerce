import { Package, Award, TrendingUp } from 'lucide-react';
import StatCard from './StatCard';
import { formatEGP } from '../lib/utils';

/**
 * AccountStats
 * ------------
 * Displays summary statistics for the user's account (total orders & spending).
 *
 * Props:
 *  - metadata {object} – user.metadata: { totalOrders, totalSpent }
 */
const AccountStats = ({ metadata = {} }) => (
  <div className="bg-white rounded-2xl shadow-lg p-6">
    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
      <TrendingUp className="w-5 h-5 text-cyan-600" />
      إحصائيات الحساب
    </h3>

    <div className="space-y-4">
      <StatCard
        icon={Package}
        label="إجمالي الطلبات"
        value={metadata.totalOrders || 0}
        bgColor="bg-cyan-50"
        iconColor="text-cyan-600"
        valueColor="text-cyan-600"
      />
      <StatCard
        icon={Award}
        label="إجمالي الإنفاق"
        value={formatEGP(metadata.totalSpent || 0)}
        bgColor="bg-green-50"
        iconColor="text-green-600"
        valueColor="text-green-600"
      />
    </div>
  </div>
);

export default AccountStats;