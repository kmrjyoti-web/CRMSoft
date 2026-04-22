import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export function FilterSection({
  title,
  children,
  defaultOpen = false,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className="mb-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center w-full text-left text-sm font-semibold text-gray-800 mb-2 hover:text-blue-600"
      >
        <ChevronDown size={14} className={`mr-1 transition-transform ${isOpen ? '' : '-rotate-90'}`} />
        {title}
      </button>
      {isOpen && (
        <div className="pl-5 space-y-2">
          {children}
        </div>
      )}
    </div>
  );
}
