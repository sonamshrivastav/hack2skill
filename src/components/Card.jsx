import React from 'react';

export default function Card({ title, icon: Icon, children, className = "" }) {
  return (
    <div className={`bg-slate-800 border border-slate-700 rounded-2xl p-6 shadow-lg transition-transform hover:-translate-y-1 hover:shadow-2xl ${className}`}>
      <div className="flex items-center gap-3 mb-4 border-b border-slate-700 pb-3">
        <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg">
          <Icon size={24} />
        </div>
        <h3 className="text-xl font-semibold text-slate-100">{title}</h3>
      </div>
      <div className="text-slate-300 prose prose-invert max-w-none prose-p:leading-relaxed prose-li:my-1" dangerouslySetInnerHTML={{ __html: children }} />
    </div>
  );
}
