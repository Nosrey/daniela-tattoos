import React, { forwardRef } from 'react';
import { InputProps } from '@/types';

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, type = 'text', name, placeholder, value, onChange, error, required = false, disabled = false, className = '' }, ref) => {
    
    const isColorInput = type === 'color';

    const inputClasses = `
      block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400
      focus:outline-none focus:ring-black focus:border-black
      disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
      ${isColorInput ? 'h-10 p-1' : ''}
      ${error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}
      ${className}
    `;

    const wrapperClasses = `
      flex items-center space-x-2
    `;

    if (isColorInput) {
      return (
        <div className="space-y-1">
          {label && (
            <label className="block text-sm font-medium text-gray-700">
              {label}
              {required && <span className="text-gray-900 ml-1">*</span>}
            </label>
          )}
          <div className={wrapperClasses}>
            <input
              ref={ref}
              type="color"
              value={value}
              onChange={onChange}
              disabled={disabled}
              className={`w-12 h-10 p-1 border border-gray-300 rounded-md cursor-pointer ${className}`}
            />
            <input
              type="text"
              value={value}
              onChange={onChange}
              required={required}
              disabled={disabled}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="#RRGGBB"
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>
      );
    }

    return (
      <div className="space-y-1">
        {label && (
          <label className="block text-sm font-medium text-gray-700">
            {label}
            {required && <span className="text-gray-900 ml-1">*</span>}
          </label>
        )}
        <input
          ref={ref}
          type={type}
          name={name}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          required={required}
          disabled={disabled}
          className={inputClasses}
        />
        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input; 