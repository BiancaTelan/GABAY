import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export default function FAQItem({ question, answer }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-gray-300 last:border-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between py-5 text-left transition-all hover:bg-gray-50 px-4 rounded-lg group"
      >
        <span className={`font-montserrat font-semibold text-lg transition-colors ${isOpen ? 'text-gabay-teal' : 'text-gabay-blue group-hover:text-gabay-teal'}`}>
          {question}
        </span>
        <ChevronDown 
          className={`text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-180 text-gabay-teal' : ''}`} 
          size={30} 
        />
      </button>
      
      <div className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-96 opacity-100 mb-5' : 'max-h-0 opacity-0'}`}>
        <div className="px-4 text-xs md:text-base text-gray-500 font-poppins leading-relaxed border-l-2 border-gabay-teal ml-4">
          {answer}
        </div>
      </div>
    </div>
  );
}