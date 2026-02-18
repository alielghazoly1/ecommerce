// src/components/Monitoring.jsx
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Activity, Clock, Server, Database, Globe, HardDrive, Cpu, Terminal, FileText, Zap, RefreshCw, Download, Trash2, Eye, EyeOff, XCircle, CheckCircle } from 'lucide-react';
import { fetchMonitoringData, clearLogs, setLogFilter, setAutoRefresh } from '../store/slices/monitoringSlice';
import { MetricCard, ProgressBar, LogLevelBadge } from './monitoring/MetricCard';
import LoadingSpinner from './common/LoadingSpinner';
import axios from '../config/axiosConfig';
import toast from 'react-hot-toast';

const Monitoring = () => {
  const dispatch = useDispatch();
  const { data, logs, loading, logFilter, autoRefresh } = useSelector((s) => s.monitoring);
  const [showLogs, setShowLogs] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    dispatch(fetchMonitoringData());
  }, [dispatch]);

  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => dispatch(fetchMonitoringData()), 10000);
    return () => clearInterval(interval);
  }, [autoRefresh, dispatch]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await dispatch(fetchMonitoringData());
    setRefreshing(false);
    toast.success('تم تحديث البيانات');
  };

  const handleExportLogs = async () => {
    try {
      const res = await axios.get('/monitoring/logs/export', { responseType: 'blob' });
      const blob = new Blob([res.data], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `logs-${new Date().toISOString()}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      toast.success('تم تصدير السجلات بنجاح');
    } catch {
      toast.error('فشل تصدير السجلات');
    }
  };

  const filteredLogs = logs.filter((log) => logFilter === 'all' || log.level === logFilter.toUpperCase());

  if (loading && !data) return <LoadingSpinner text="جارٍ تحميل البيانات..." />;
  if (!data) return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center">
        <XCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
        <p className="text-gray-400 text-lg">فشل تحميل البيانات</p>
      </div>
    </div>
  );

  return (
    <div className="p-6 md:p-10 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black text-white mb-2 flex items-center gap-3">
            <Activity className="w-10 h-10 text-purple-400" />مراقبة النظام
          </h1>
          <p className="text-gray-400">آخر تحديث: {new Date(data.timestamp).toLocaleString('ar-EG')}</p>
          <div className="flex items-center gap-2 mt-2">
            <CheckCircle className="w-5 h-5 text-green-400" />
            <span className="text-green-400 font-semibold">النظام يعمل بشكل طبيعي</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => dispatch(setAutoRefresh(!autoRefresh))}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-all ${autoRefresh ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-white/5 text-gray-400 border border-white/10'}`}>
            <Zap className="w-4 h-4" />تحديث تلقائي
          </button>
          <button onClick={handleRefresh} disabled={refreshing}
            className="flex items-center gap-2 px-6 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white font-semibold transition-all disabled:opacity-50">
            <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />تحديث
          </button>
        </div>
      </div>

      {/* System Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <MetricCard icon={Clock} title="وقت التشغيل" value={data.uptime.formatted} subtitle={`${data.uptime.seconds.toFixed(0)} ثانية`} color="bg-gradient-to-br from-blue-500 to-cyan-600" />
        <MetricCard icon={Server} title="المعالج" value={`${data.cpu.cores} نوى`} subtitle={`Load: ${data.cpu.loadAverage[0]}`} color="bg-gradient-to-br from-purple-500 to-pink-600" />
        <MetricCard icon={Database} title="قاعدة البيانات" value={data.database.status === 'connected' ? 'متصل' : 'غير متصل'}
          subtitle={data.database.name} color={data.database.status === 'connected' ? 'bg-gradient-to-br from-green-500 to-emerald-600' : 'bg-gradient-to-br from-red-500 to-pink-600'} />
        <MetricCard icon={Globe} title="الطلبات النشطة" value={data.requests.active} subtitle="طلب حالي" color="bg-gradient-to-br from-orange-500 to-red-600" />
      </div>

      {/* Memory Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {[
          { icon: HardDrive, title: 'ذاكرة العملية', subtitle: 'استخدام Node.js', color: 'from-purple-500 to-pink-600',
            items: [{ label: 'Heap Used', value: data.memory.process.heapUsed, pct: data.memory.process.heapUsedPercentage, pctColor: 'purple' }],
            extra: [{ label: 'Heap Total', value: data.memory.process.heapTotal }, { label: 'RSS', value: data.memory.process.rss }] },
          { icon: Cpu, title: 'ذاكرة النظام', subtitle: 'استخدام الخادم', color: 'from-cyan-500 to-blue-600',
            items: [{ label: 'Memory Used', value: data.memory.system.used, pct: data.memory.system.usedPercentage, pctColor: 'blue' }],
            extra: [{ label: 'Total Memory', value: data.memory.system.total }, { label: 'Free Memory', value: data.memory.system.free }] },
        ].map(({ icon: Icon, title, subtitle, color, items, extra }) => (
          <div key={title} className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className={`w-12 h-12 bg-gradient-to-br ${color} rounded-xl flex items-center justify-center`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              <div><h3 className="text-xl font-bold text-white">{title}</h3><p className="text-sm text-gray-400">{subtitle}</p></div>
            </div>
            <div className="space-y-4">
              {items.map(({ label, value, pct, pctColor }) => (
                <div key={label}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-400 text-sm">{label}</span>
                    <span className="text-white font-bold">{value}</span>
                  </div>
                  <ProgressBar percentage={parseFloat(pct)} color={pctColor} />
                  <p className="text-xs text-gray-500 mt-1">{pct}%</p>
                </div>
              ))}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
                {extra.map(({ label, value }) => (
                  <div key={label}><p className="text-xs text-gray-400 mb-1">{label}</p><p className="text-white font-semibold">{value}</p></div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* System Info */}
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 mb-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
            <Terminal className="w-6 h-6 text-white" />
          </div>
          <div><h3 className="text-xl font-bold text-white">معلومات النظام</h3><p className="text-sm text-gray-400">تفاصيل الخادم والتشغيل</p></div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'المنصة', value: data.system.platform },
            { label: 'المعمارية', value: data.system.arch },
            { label: 'إصدار Node', value: data.system.nodeVersion },
            { label: 'اسم المضيف', value: data.system.hostname },
          ].map(({ label, value }) => (
            <div key={label} className="bg-white/5 rounded-xl p-4 border border-white/10">
              <p className="text-xs text-gray-400 mb-2">{label}</p>
              <p className="text-white font-semibold truncate">{value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Errors */}
      {data.errors.count > 0 && (
        <div className="bg-red-500/10 rounded-2xl border border-red-500/30 p-6 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <XCircle className="w-6 h-6 text-red-400" />
            <h3 className="text-xl font-bold text-white">أحدث الأخطاء ({data.errors.count})</h3>
          </div>
          <div className="space-y-2">
            {data.errors.recent.map((error, i) => (
              <div key={i} className="bg-white/5 rounded-xl p-3 border border-white/10">
                <div className="flex items-start justify-between mb-2">
                  <p className="text-red-400 font-semibold text-sm">{error.message}</p>
                  <span className="text-xs text-gray-500">{new Date(error.timestamp).toLocaleTimeString('ar-EG')}</span>
                </div>
                {error.stack && <pre className="text-xs text-gray-400 overflow-x-auto">{error.stack.substring(0, 200)}...</pre>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Logs Section */}
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl flex items-center justify-center">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div><h3 className="text-xl font-bold text-white">سجل الأحداث</h3><p className="text-sm text-gray-400">{logs.length} سجل</p></div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setShowLogs(!showLogs)} className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white transition-all">
              {showLogs ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              {showLogs ? 'إخفاء' : 'عرض'}
            </button>
            <button onClick={handleExportLogs} className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-xl text-blue-400 transition-all">
              <Download className="w-4 h-4" />تصدير
            </button>
            <button onClick={() => dispatch(clearLogs())} className="flex items-center gap-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-xl text-red-400 transition-all">
              <Trash2 className="w-4 h-4" />حذف
            </button>
          </div>
        </div>

        {showLogs && (
          <>
            <div className="flex items-center gap-2 mb-4">
              {['all', 'error', 'warn', 'info', 'success'].map((f) => (
                <button key={f} onClick={() => dispatch(setLogFilter(f))}
                  className={`px-4 py-2 rounded-xl font-semibold transition-all ${logFilter === f ? 'bg-purple-500 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}>
                  {f === 'all' ? 'الكل' : f.toUpperCase()}
                </button>
              ))}
            </div>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {filteredLogs.length === 0 ? (
                <div className="text-center py-8"><FileText className="w-12 h-12 text-gray-600 mx-auto mb-2" /><p className="text-gray-400">لا توجد سجلات</p></div>
              ) : filteredLogs.map((log, i) => (
                <div key={i} className="bg-white/5 rounded-xl p-3 border border-white/10 hover:bg-white/10 transition-all">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <LogLevelBadge level={log.level} />
                      <span className="text-white text-sm">{log.message}</span>
                    </div>
                    <span className="text-xs text-gray-500">{new Date(log.timestamp).toLocaleString('ar-EG')}</span>
                  </div>
                  {log.meta && Object.keys(log.meta).length > 0 && (
                    <pre className="text-xs text-gray-400 mt-2 overflow-x-auto">{JSON.stringify(log.meta, null, 2)}</pre>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Monitoring;