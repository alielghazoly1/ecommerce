// src/components/common/PageHeader.jsx
const PageHeader = ({ icon: Icon, title, subtitle, actions }) => (
  <div className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-xl border-b border-white/10 shadow-2xl">
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-white mb-1 flex items-center gap-3">
            {Icon && <Icon className="w-10 h-10 text-purple-400" />}
            {title}
          </h1>
          {subtitle && <p className="text-gray-300 text-base font-semibold">{subtitle}</p>}
        </div>
        {actions && <div className="flex items-center gap-3 flex-wrap">{actions}</div>}
      </div>
    </div>
  </div>
);

export default PageHeader;