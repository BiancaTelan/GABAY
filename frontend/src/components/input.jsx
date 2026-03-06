import { useState } from 'react';
import { Eye, EyeOff, CalendarDays, ChevronDown } from 'lucide-react';

export default function Input({ 
  label, 
  type = "text", 
  error, 
  placeholder, 
  value, 
  onChange, 
  onIconClick, 
  name, 
  isEditing, 
  noHover, 
  required,
  ...props 
}) {

  const [showPassword, setShowPassword] = useState(false);
  const isPasswordType = type === "password";
  const isDateType = type === "date" || name === "dob";
  const isSelectType = type === "select";
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="flex flex-col w-full mb-2 relative">
      {label && (
        <label className="text-sm font-medium text-gabay-navy mb-1 font-poppins">
          {label}
          {isEditing && required && (<span className="text-red-500 ml-1">*</span>)}
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
            ${error ? 'border-red-500 focus:ring-1 focus:ring-red-500' : 
              noHover ? 'border-gray-300 focus:ring-0 cursor-default' : 'border-gray-300 focus:ring-1 focus:ring-gabay-teal focus:border-gabay-teal'}
            ${isSelectType ? 'cursor-pointer' : ''} 
            ${props.readOnly ? 'bg-gray-50' : 'bg-white'}
            [&::-ms-reveal]:hidden [&::-ms-clear]:hidden [&::-webkit-contacts-auto-fill-button]:hidden`}
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

        {/* CALENDAR PICKER ANCHOR */}
        {isDateType && isEditing && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center w-5 h-5 z-20">
            {/* The actual date input is hidden but covers the icon area */}
            <input
              type="date"
              max={new Date().toISOString().split("T")[0]}
              onChange={onIconClick}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-30"
            />
            {/* The icon sits behind the invisible input */}
            <CalendarDays size={18} className="text-gray-400 pointer-events-none" />
          </div>
        )}

        {/* CHEVRON ICON */}
        {isSelectType && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none z-10">
            <ChevronDown size={18} />
          </div>
        )}
      </div>

      {error && (
        <span className="text-red-500 text-[10px] mt-1 font-poppins absolute -bottom-4 left-0 whitespace-nowrap z-10 font-bold uppercase">
          {error}
        </span>
      )}
    </div>
  );
}