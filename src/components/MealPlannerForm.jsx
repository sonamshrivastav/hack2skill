import React, { useState } from 'react';
import { ChefHat, Clock, DollarSign, Heart, Salad, Users, User, Dumbbell, Sparkles } from 'lucide-react';

export default function MealPlannerForm({ onSubmit, isLoading }) {
  const [formData, setFormData] = useState({
    name: '',
    people: 1,
    preference: 'Veg',
    budget: 'Medium',
    time: '30 mins',
    diet: '',
    goal: 'Maintenance',
    ingredients: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-3xl p-8 shadow-2xl max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-slate-100 flex items-center justify-center gap-3">
          <ChefHat className="text-indigo-400" size={36} />
          Your AI Sous-Chef
        </h2>
        <p className="text-slate-400 mt-2">Tell us about your needs and let AI handle the planning.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-slate-300">
              <User size={16} className="text-indigo-400"/> Name
            </label>
            <input 
              type="text" required name="name" value={formData.name} onChange={handleChange}
              placeholder="E.g. Gordon"
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-slate-100 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
            />
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-slate-300">
              <Users size={16} className="text-indigo-400"/> Number of People
            </label>
            <input 
              type="number" min="1" required name="people" value={formData.people} onChange={handleChange}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-slate-100 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
            />
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-slate-300">
              <Salad size={16} className="text-indigo-400"/> Preference
            </label>
            <select 
              name="preference" value={formData.preference} onChange={handleChange}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-slate-100 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
            >
              <option value="Veg">Vegetarian</option>
              <option value="Non-Veg">Non-Vegetarian</option>
              <option value="Vegan">Vegan</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-slate-300">
              <DollarSign size={16} className="text-indigo-400"/> Budget
            </label>
            <select 
              name="budget" value={formData.budget} onChange={handleChange}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-slate-100 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
            >
              <option value="Low ($)">Budget-Friendly ($)</option>
              <option value="Medium ($$)">Standard ($$)</option>
              <option value="High ($$$)">Premium ($$$)</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-slate-300">
              <Clock size={16} className="text-indigo-400"/> Cooking Time
            </label>
            <select 
              name="time" value={formData.time} onChange={handleChange}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-slate-100 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
            >
              <option value="Under 30 mins">Under 30 mins (Quick)</option>
              <option value="30-60 mins">30-60 mins (Standard)</option>
              <option value="Over 60 mins">Over 60 mins (Elaborate)</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-slate-300">
              <Dumbbell size={16} className="text-indigo-400"/> Fitness Goal
            </label>
            <select 
              name="goal" value={formData.goal} onChange={handleChange}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-slate-100 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
            >
              <option value="Maintenance">Maintenance</option>
              <option value="Weight Loss">Weight Loss</option>
              <option value="Muscle Gain">Muscle Gain</option>
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-slate-300">
            <Heart size={16} className="text-indigo-400"/> Dietary Restrictions / Allergies (Optional)
          </label>
          <input 
            type="text" name="diet" value={formData.diet} onChange={handleChange}
            placeholder="E.g. Peanut allergy, Gluten-free, Keto"
            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-slate-100 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
          />
        </div>

        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-slate-300">
            <Sparkles size={16} className="text-indigo-400"/> Ingredients you already have (Optional)
          </label>
          <textarea 
            name="ingredients" value={formData.ingredients} onChange={handleChange}
            placeholder="E.g. I have some chicken breast, rice, and broccoli."
            rows="2"
            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-slate-100 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors resize-none"
          ></textarea>
        </div>

        <button 
          type="submit" 
          disabled={isLoading}
          className="w-full mt-6 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white font-semibold py-4 rounded-xl shadow-lg transform transition-all hover:-translate-y-1 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex justify-center items-center gap-2"
        >
          {isLoading ? 'Generating Plan...' : 'Generate Plan'}
        </button>
      </form>
    </div>
  );
}
