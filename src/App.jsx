import React, { useState } from 'react';
import MealPlannerForm from './components/MealPlannerForm';
import PlanResults from './components/PlanResults';
import LoadingSpinner from './components/LoadingSpinner';
import { generateMealPlan } from './utils/geminiApi';

function App() {
  const [isLoading, setIsLoading] = useState(false);
  const [planData, setPlanData] = useState(null);
  const [error, setError] = useState('');

  const handleGeneratePlan = async (formData) => {
    setIsLoading(true);
    setError('');
    setPlanData(null);
    
    try {
      const data = await generateMealPlan(formData);
      setPlanData(data);
    } catch (err) {
      setError(err.message || 'Something went wrong while generating the plan.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setPlanData(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen p-4 md:p-8 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-600/20 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-600/20 blur-[120px] pointer-events-none"></div>

      <div className="relative z-10 max-w-7xl mx-auto">
        <header className="text-center mb-12">
          <h1 className="text-5xl font-extrabold tracking-tight mb-4">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
              Cooking To-Do List
            </span>
          </h1>
          <p className="text-lg text-slate-400">Intelligent meal planning powered by Gemini AI</p>
        </header>

        {error && (
          <div className="max-w-4xl mx-auto mb-8 p-4 bg-red-900/30 border border-red-500/50 rounded-xl text-red-200 text-center">
            {error}
          </div>
        )}

        {!planData && !isLoading && (
          <MealPlannerForm onSubmit={handleGeneratePlan} isLoading={isLoading} />
        )}

        {isLoading && (
          <LoadingSpinner />
        )}

        {planData && !isLoading && (
          <PlanResults data={planData} onReset={handleReset} />
        )}
      </div>
    </div>
  );
}

export default App;
