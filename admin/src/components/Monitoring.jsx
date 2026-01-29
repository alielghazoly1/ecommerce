// src/components/Monitoring.jsx - PROFESSIONAL MONITORING DASHBOARD ✨
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import {
  Activity,
  Cpu,
  HardDrive,
  Server,
  Database,
  AlertCircle,
  CheckCircle,
  Clock,
  Download,
  RefreshCw,
  Trash2,
  Loader2,
  TrendingUp,
  Globe,
  Zap,
  BarChart3,
  XCircle,
  FileText,
  Terminal,
  Eye,
  EyeOff,
} from 'lucide-react';
import toast from 'react-hot-toast';

const Monitoring = () => {
  const { token } = useAuth();
  const url = 'https://low-hayley-totasheco-426426a6.koyeb.app';

  const [data, setData] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [showLogs, setShowLogs] = useState(false);
  const [logFilter, setLogFilter] = useState('all');

  // =====================
  // Data Fetching
  // =====================
  const fetchMonitoringData = useCallback(
    async (isRefresh = false) => {
      try {
        if (isRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        const [dashboardRes, logsRes] = await Promise.all([
          axios.get(`${url}/api/monitoring/dashboard`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${url}/api/monitoring/logs?limit=50`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if (dashboardRes.data.success) {
          setData(dashboardRes.data.data);
          console.log(dashboardRes);
        }

        if (logsRes.data.success) {
          setLogs(logsRes.data.data);
        }

        setLoading(false);
        setRefreshing(false);

        if (isRefresh) {
          toast.success('تم تحديث البيانات');
        }
      } catch (error) {
        console.error('Error fetching monitoring data:', error);
        setLoading(false);
        setRefreshing(false);
        if (isRefresh) {
          toast.error('فشل تحديث البيانات');
        }
      }
    },
    [token, url],
  );

  useEffect(() => {
    if (token) {
      fetchMonitoringData();
    }
  }, [token, fetchMonitoringData]);

  // Auto-refresh every 10 seconds
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchMonitoringData(true);
    }, 10000);

    return () => clearInterval(interval);
  }, [autoRefresh, fetchMonitoringData]);

  // =====================
  // Actions
  // =====================
  const handleRefresh = () => {
    fetchMonitoringData(true);
  };

  const handleClearLogs = async () => {
    if (!window.confirm('هل أنت متأكد من حذف جميع السجلات؟')) return;

    try {
      const res = await axios.post(
        `${url}/api/monitoring/logs/clear`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );

      if (res.data.success) {
        toast.success('تم حذف السجلات بنجاح');
        fetchMonitoringData(true);
      }
    } catch (error) {
      toast.error('فشل حذف السجلات');
      console.error(error);
    }
  };

  const handleExportLogs = async () => {
    try {
      const res = await axios.get(`${url}/api/monitoring/logs/export`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob',
      });

      const blob = new Blob([res.data], { type: 'application/json' });
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `logs-${new Date().toISOString()}.json`;
      document.body.appendChild(link);
      link.click();
      link.remove();

      toast.success('تم تصدير السجلات بنجاح');
    } catch (error) {
      toast.error('فشل تصدير السجلات');
      console.error(error);
    }
  };

  // =====================
  // Components
  // =====================
  const MetricCard = ({ icon: Icon, title, value, subtitle, color, trend }) => (
    <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 hover:border-purple-500/30 transition-all group">
      <div className="flex items-start justify-between mb-4">
        <div
          className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}
        >
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

  const ProgressBar = ({ percentage, color = 'purple' }) => {
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
          className={`h-full bg-gradient-to-r ${colorClasses[color]} transition-all duration-500`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
    );
  };

  const LogLevelBadge = ({ level }) => {
    const colors = {
      ERROR: 'bg-red-500/20 text-red-400 border-red-500/30',
      WARN: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      INFO: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      SUCCESS: 'bg-green-500/20 text-green-400 border-green-500/30',
      DEBUG: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    };

    return (
      <span
        className={`px-2 py-1 rounded-lg text-xs font-bold border ${colors[level] || colors.INFO}`}
      >
        {level}
      </span>
    );
  };

  // =====================
  // Filter Logs
  // =====================
  const filteredLogs = logs.filter((log) => {
    if (logFilter === 'all') return true;
    return log.level === logFilter.toUpperCase();
  });

  // =====================
  // Loading State
  // =====================
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <Loader2 className="w-16 h-16 animate-spin text-purple-400 mx-auto mb-4" />
          <p className="text-gray-400 text-lg">جارٍ تحميل البيانات...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <p className="text-gray-400 text-lg">فشل تحميل البيانات</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 max-w-[1600px] mx-auto">
      {/* ===================== */}
      {/* Header */}
      {/* ===================== */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-4xl font-black text-white mb-2 flex items-center gap-3">
              <Activity className="w-10 h-10 text-purple-400" />
              مراقبة النظام
            </h1>
            <p className="text-gray-400">
              آخر تحديث: {new Date(data.timestamp).toLocaleString('ar-EG')}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-all ${
                autoRefresh
                  ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                  : 'bg-white/5 text-gray-400 border border-white/10'
              }`}
            >
              <Zap className="w-4 h-4" />
              تحديث تلقائي
            </button>

            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-2 px-6 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white font-semibold transition-all disabled:opacity-50"
            >
              <RefreshCw
                className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`}
              />
              تحديث
            </button>
          </div>
        </div>

        {/* Status Badge */}
        <div className="flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-green-400" />
          <span className="text-green-400 font-semibold">
            النظام يعمل بشكل طبيعي
          </span>
        </div>
      </div>

      {/* ===================== */}
      {/* System Overview Cards */}
      {/* ===================== */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <MetricCard
          icon={Clock}
          title="وقت التشغيل"
          value={data.uptime.formatted}
          subtitle={`${data.uptime.seconds.toFixed(0)} ثانية`}
          color="bg-gradient-to-br from-blue-500 to-cyan-600"
        />

        <MetricCard
          icon={Server}
          title="المعالج"
          value={`${data.cpu.cores} نوى`}
          subtitle={`Load: ${data.cpu.loadAverage[0]}`}
          color="bg-gradient-to-br from-purple-500 to-pink-600"
        />

        <MetricCard
          icon={Database}
          title="قاعدة البيانات"
          value={data.database.status === 'connected' ? 'متصل' : 'غير متصل'}
          subtitle={data.database.name}
          color={
            data.database.status === 'connected'
              ? 'bg-gradient-to-br from-green-500 to-emerald-600'
              : 'bg-gradient-to-br from-red-500 to-pink-600'
          }
        />

        <MetricCard
          icon={Globe}
          title="الطلبات النشطة"
          value={data.requests.active}
          subtitle="طلب حالي"
          color="bg-gradient-to-br from-orange-500 to-red-600"
        />
      </div>

      {/* ===================== */}
      {/* Memory & CPU */}
      {/* ===================== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Process Memory */}
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
              <HardDrive className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">ذاكرة العملية</h3>
              <p className="text-sm text-gray-400">استخدام Node.js</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-400 text-sm">Heap Used</span>
                <span className="text-white font-bold">
                  {data.memory.process.heapUsed}
                </span>
              </div>
              <ProgressBar
                percentage={parseFloat(data.memory.process.heapUsedPercentage)}
                color="purple"
              />
              <p className="text-xs text-gray-500 mt-1">
                {data.memory.process.heapUsedPercentage}%
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
              <div>
                <p className="text-xs text-gray-400 mb-1">Heap Total</p>
                <p className="text-white font-semibold">
                  {data.memory.process.heapTotal}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">RSS</p>
                <p className="text-white font-semibold">
                  {data.memory.process.rss}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* System Memory */}
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center">
              <Cpu className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">ذاكرة النظام</h3>
              <p className="text-sm text-gray-400">استخدام الخادم</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-400 text-sm">Memory Used</span>
                <span className="text-white font-bold">
                  {data.memory.system.used}
                </span>
              </div>
              <ProgressBar
                percentage={parseFloat(data.memory.system.usedPercentage)}
                color="blue"
              />
              <p className="text-xs text-gray-500 mt-1">
                {data.memory.system.usedPercentage}%
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
              <div>
                <p className="text-xs text-gray-400 mb-1">Total Memory</p>
                <p className="text-white font-semibold">
                  {data.memory.system.total}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">Free Memory</p>
                <p className="text-white font-semibold">
                  {data.memory.system.free}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ===================== */}
      {/* System Info */}
      {/* ===================== */}
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 mb-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
            <Terminal className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">معلومات النظام</h3>
            <p className="text-sm text-gray-400">تفاصيل الخادم والتشغيل</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <p className="text-xs text-gray-400 mb-2">المنصة</p>
            <p className="text-white font-semibold">{data.system.platform}</p>
          </div>
          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <p className="text-xs text-gray-400 mb-2">المعمارية</p>
            <p className="text-white font-semibold">{data.system.arch}</p>
          </div>
          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <p className="text-xs text-gray-400 mb-2">إصدار Node</p>
            <p className="text-white font-semibold">
              {data.system.nodeVersion}
            </p>
          </div>
          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <p className="text-xs text-gray-400 mb-2">اسم المضيف</p>
            <p className="text-white font-semibold truncate">
              {data.system.hostname}
            </p>
          </div>
        </div>
      </div>

      {/* ===================== */}
      {/* Recent Errors */}
      {/* ===================== */}
      {data.errors.count > 0 && (
        <div className="bg-red-500/10 backdrop-blur-xl rounded-2xl border border-red-500/30 p-6 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <XCircle className="w-6 h-6 text-red-400" />
            <h3 className="text-xl font-bold text-white">
              أحدث الأخطاء ({data.errors.count})
            </h3>
          </div>

          <div className="space-y-2">
            {data.errors.recent.map((error, index) => (
              <div
                key={index}
                className="bg-white/5 rounded-xl p-3 border border-white/10"
              >
                <div className="flex items-start justify-between mb-2">
                  <p className="text-red-400 font-semibold text-sm">
                    {error.message}
                  </p>
                  <span className="text-xs text-gray-500">
                    {new Date(error.timestamp).toLocaleTimeString('ar-EG')}
                  </span>
                </div>
                {error.stack && (
                  <pre className="text-xs text-gray-400 overflow-x-auto">
                    {error.stack.substring(0, 200)}...
                  </pre>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ===================== */}
      {/* Logs Section */}
      {/* ===================== */}
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl flex items-center justify-center">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">سجل الأحداث</h3>
              <p className="text-sm text-gray-400">{logs.length} سجل</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowLogs(!showLogs)}
              className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white transition-all"
            >
              {showLogs ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
              {showLogs ? 'إخفاء' : 'عرض'}
            </button>

            <button
              onClick={handleExportLogs}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-xl text-blue-400 transition-all"
            >
              <Download className="w-4 h-4" />
              تصدير
            </button>

            <button
              onClick={handleClearLogs}
              className="flex items-center gap-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-xl text-red-400 transition-all"
            >
              <Trash2 className="w-4 h-4" />
              حذف
            </button>
          </div>
        </div>

        {showLogs && (
          <>
            {/* Log Filter */}
            <div className="flex items-center gap-2 mb-4">
              {['all', 'error', 'warn', 'info', 'success'].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setLogFilter(filter)}
                  className={`px-4 py-2 rounded-xl font-semibold transition-all ${
                    logFilter === filter
                      ? 'bg-purple-500 text-white'
                      : 'bg-white/5 text-gray-400 hover:bg-white/10'
                  }`}
                >
                  {filter === 'all' ? 'الكل' : filter.toUpperCase()}
                </button>
              ))}
            </div>

            {/* Logs List */}
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {filteredLogs.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 text-gray-600 mx-auto mb-2" />
                  <p className="text-gray-400">لا توجد سجلات</p>
                </div>
              ) : (
                filteredLogs.map((log, index) => (
                  <div
                    key={index}
                    className="bg-white/5 rounded-xl p-3 border border-white/10 hover:bg-white/10 transition-all"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <LogLevelBadge level={log.level} />
                        <span className="text-white text-sm">
                          {log.message}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500">
                        {new Date(log.timestamp).toLocaleString('ar-EG')}
                      </span>
                    </div>
                    {log.meta && Object.keys(log.meta).length > 0 && (
                      <pre className="text-xs text-gray-400 mt-2 overflow-x-auto">
                        {JSON.stringify(log.meta, null, 2)}
                      </pre>
                    )}
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Monitoring;
