import React from 'react';
import Card from './Card';
import { Sunrise, Sun, Moon, ShoppingCart, Repeat, Wallet, ArrowLeft } from 'lucide-react';

export default function PlanResults({ data, onReset }) {
  if (!data) return null;

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-slate-100">Your Personalized Plan</h2>
        <button 
          onClick={onReset}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-600 rounded-lg transition-colors"
        >
          <ArrowLeft size={18} />
          Back to Planner
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card title="Breakfast" icon={Sunrise}>
          {data.breakfast}
        </Card>
        <Card title="Lunch" icon={Sun}>
          {data.lunch}
        </Card>
        <Card title="Dinner" icon={Moon}>
          {data.dinner}
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <Card title="Grocery List" icon={ShoppingCart} className="md:col-span-1">
          {data.groceryList}
        </Card>
        
        <div className="md:col-span-2 space-y-6">
          <Card title="Substitutions" icon={Repeat}>
            {data.substitutions}
          </Card>
          
          <Card title="Budget Analysis" icon={Wallet} className="border-indigo-500/30 bg-indigo-900/10">
            {data.budgetAnalysis}
          </Card>
        </div>
      </div>
    </div>
  );
}
