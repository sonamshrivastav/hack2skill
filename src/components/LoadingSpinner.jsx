import React from 'react';
import { ChefHat } from 'lucide-react';

export default function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center justify-center py-12 space-y-4">
      <div className="relative w-20 h-20">
        <div className="absolute inset-0 border-4 border-indigo-500/20 rounded-full"></div>
        <div className="absolute inset-0 border-4 border-indigo-500 rounded-full border-t-transparent animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center text-indigo-400 animate-pulse">
          <ChefHat size={32} />
        </div>
      </div>
      <p className="text-lg text-slate-400 font-medium animate-pulse">Consulting your AI Chef...</p>
    </div>
  );
}
