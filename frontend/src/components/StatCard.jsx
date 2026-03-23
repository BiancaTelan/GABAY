import React from 'react';

const colorMap = {
  green: { border: 'border-[#10B981]', text: 'text-[#10B981]', bg: 'bg-[#ECFDF5]' },
  red: { border: 'border-[#EF4444]', text: 'text-[#EF4444]', bg: 'bg-[#FEF2F2]' },
  blue: { border: 'border-[#3B82F6]', text: 'text-[#3B82F6]', bg: 'bg-[#EFF6FF]' },
  gray: { border: 'border-[#6B7280]', text: 'text-[#6B7280]', bg: 'bg-[#F9FAFB]' },
};

export default function StatCard({ 
  title, 
  value, 
  icon: Icon, 
  color = 'gray', 
  isSelected = false 
}) {
  const styles = colorMap[color];

  return (
    <div className={`bg-white p-6 rounded-xl shadow-sm border ${isSelected ? 'border-[#3B82F6] ring-2 ring-[#3B82F6]/20' : 'border-gray-100'}`}>
      <div className="flex items-center justify-between mb-2">
        {/* Data */}
        <h3 className={`font-montserrat text-4xl font-bold ${styles.text}`}>
          {value}
        </h3>
        
        {/* Icon */}
        <div className={`p-2.5 rounded-lg ${styles.bg}`}>
          <Icon className={`${styles.text}`} size={24} strokeWidth={2.5} />
        </div>
      </div>
      
      {/* Title */}
      <p className="font-poppins text-xs text-gray-500 font-medium">
        {title}
      </p>
    </div>
  );
}