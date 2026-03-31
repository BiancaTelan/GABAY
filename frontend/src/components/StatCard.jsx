import React from 'react';

const colorMap = {
  green: { border: 'border-gabay-green', text: 'text-gabay-green', bg: 'bg-green-50' },
  teal: { border: 'border-gabay-teal', text: 'text-gabay-teal', bg: 'bg-teal-50' },
  violet: { border: 'border-gabay-violet', text: 'text-gabay-violet', bg: 'bg-violet-50' },
  orange: { border: 'border-gabay-orange', text: 'text-gabay-orange', bg: 'bg-orange-50' },
  blue: { border: 'border-gabay-blue', text: 'text-gabay-blue', bg: 'bg-blue-50' },
  red: { border: 'border-red-500', text: 'text-gabay-red', bg: 'bg-red-50' },
  gray: { border: 'border-gray-400', text: 'text-gray-500', bg: 'bg-gray-50' },
};

export default function StatCard({ 
  title, 
  value, 
  icon: Icon, 
  color = 'gray', 
  isSelected = false,
  onClick, 
}) {
  const styles = colorMap[color] || colorMap.gray;

  const cardContent = (
    <div className={`bg-white p-6 rounded-xl shadow-sm border ${isSelected ? 'border-[#3B82F6] ring-2 ring-[#3B82F6]/20' : 'border-gray-100'} transition-all duration-200 ${onClick ? 'cursor-pointer hover:shadow-md' : ''}`}>
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

  if (onClick) {
    return (
      <button onClick={onClick} className="w-full text-left focus:outline-none">
        {cardContent}
      </button>
    );
  }

  return cardContent;
}