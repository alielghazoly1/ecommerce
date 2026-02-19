// src/components/common/FormField.jsx - REUSABLE FORM FIELD
import { AlertCircle } from 'lucide-react';

const FormField = ({
  label,
  name,
  type = 'text',
  value,
  onChange,
  error,
  placeholder,
  required = false,
  icon: Icon,
  rows,
  options, // للـ select
  className = '',
  min,
  max,
  step,
  disabled = false,
}) => {
  const inputClasses = `w-full px-4 py-4 ${Icon ? 'pr-12' : ''} bg-white/10 border ${
    error ? 'border-red-500' : 'border-white/20'
  } rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${
    disabled ? 'opacity-50 cursor-not-allowed' : ''
  } ${className}`;

  return (
    <div>
      <label className="block text-sm font-semibold text-gray-200 mb-3">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <div className="relative">
        {Icon && (
          <Icon className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 pointer-events-none" />
        )}

        {type === 'textarea' ? (
          <textarea
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            rows={rows || 4}
            disabled={disabled}
            className={`${inputClasses} resize-none`}
          />
        ) : type === 'select' ? (
          <select
            name={name}
            value={value}
            onChange={onChange}
            disabled={disabled}
            className={`${inputClasses} appearance-none cursor-pointer`}
          >
            {options?.map((option) => (
              <option
                key={option.value}
                value={option.value}
                className="bg-slate-800"
              >
                {option.icon} {option.label}
              </option>
            ))}
          </select>
        ) : type === 'checkbox' ? (
          <label className="flex items-center gap-3 cursor-pointer group">
            <input
              type="checkbox"
              name={name}
              checked={value}
              onChange={onChange}
              disabled={disabled}
              className="w-5 h-5 rounded bg-white/10 border-white/20 text-purple-500 focus:ring-2 focus:ring-purple-500 cursor-pointer disabled:opacity-50"
            />
            <span className="text-gray-200 font-medium group-hover:text-white transition-colors">
              {placeholder}
            </span>
          </label>
        ) : (
          <input
            type={type}
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            min={min}
            max={max}
            step={step}
            disabled={disabled}
            className={inputClasses}
          />
        )}

        {error && (
          <div className="flex items-center gap-2 mt-2 text-red-400 text-sm">
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default FormField;
