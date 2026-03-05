import { useState } from 'react';
import { Eye, EyeOff, CalendarDays, ChevronDown } from 'lucide-react';

export default function Input({ label, type = "text", error, placeholder, value, onChange, name, ...props }) {
  const [showPassword, setShowPassword] = useState(false);
  
  const isPasswordType = type === "password";
  const isDateType = type === "date";
  const isSelectType = type === "select";

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="flex flex-col w-full mb-2 relative">
      {label && (
        <label className="text-sm font-medium text-gabay-navy mb-1 font-poppins">
          {label}
        </label>
      )}

      <div className="relative">
        <input
          {...props}
          type={isPasswordType ? (showPassword ? "text" : "password") : (isSelectType ? "text" : type)}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`w-full border rounded px-3 py-2 pr-10 outline-none transition-all font-poppins text-sm placeholder:text-gray-400 shadow-sm
            ${error ? 'border-red-500 focus:ring-1 focus:ring-red-500' : 'border-gray-300 focus:ring-1 focus:ring-gabay-teal focus:border-gabay-teal'}
            ${isSelectType ? 'cursor-pointer' : ''} 
            [&::-ms-reveal]:hidden [&::-ms-clear]:hidden [&::-webkit-contacts-auto-fill-button]:hidden
            [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-0 
            [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full 
            [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:cursor-pointer`}
        />

        {/* PASSWORD TOGGLE */}
        {isPasswordType && (
          <button
            type="button"
            onClick={togglePasswordVisibility}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gabay-blue transition-colors z-20"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}

        {/* CALENDAR ICON */}
        {isDateType && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none z-10">
            <CalendarDays size={18} />
          </div>
        )}

        {/* CHEVRON ICON - New logic for Select/Dropdowns */}
        {isSelectType && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none z-10">
            <ChevronDown size={18} />
          </div>
        )}
      </div>

      {error && (
        <span className="text-red-500 text-[12px] mt-1 font-poppins absolute -bottom-4 left-0 whitespace-nowrap z-10">
          {error}
        </span>
      )}
    </div>
  );
}