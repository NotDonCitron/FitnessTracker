import React from 'react';
import { Dumbbell, Calendar } from 'lucide-react';
import { Workout } from '../types/workout';

interface QuickActionsProps {
  saveWorkout: (workout: Workout) => void;
}

const QuickActions: React.FC<QuickActionsProps> = ({ saveWorkout }) => {
  return (
    <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg shadow-md p-6 text-white">
      <h3 className="text-lg font-semibold mb-4">Quick Start</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button 
          onClick={() => {
            const workout = {
              id: Date.now().toString(),
              name: `Workout ${new Date().toLocaleDateString()}`,
              date: new Date().toISOString(),
              duration: 0,
              exercises: [],
              sets: [],
              totalSets: 0,
              totalReps: 0,
              totalWeight: 0,
              completed: false
            };
            saveWorkout(workout);
            
            const event = new CustomEvent('changeTab', { detail: { tab: 'workout' } });
            window.dispatchEvent(event);
          }}
          className="bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg p-4 text-left transition-all duration-200"
        >
          <Dumbbell className="h-6 w-6 mb-2" />
          <div className="font-medium">Start Workout</div>
          <div className="text-sm opacity-90">Begin tracking exercises</div>
        </button>
        <button 
          onClick={() => {
            const event = new CustomEvent('changeTab', { detail: { tab: 'planner' } });
            window.dispatchEvent(event);
          }}
          className="bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg p-4 text-left transition-all duration-200"
        >
          <Calendar className="h-6 w-6 mb-2" />
          <div className="font-medium">Plan Workout</div>
          <div className="text-sm opacity-90">Create workout routine</div>
        </button>
        <button 
          onClick={() => {
            console.log('🧪 [DEBUG] Manual Pokemon test triggered');
            // Trigger a test Pokemon reward
            const testWorkout = {
              id: 'test-' + Date.now(),
              name: 'Test Workout',
              date: new Date().toISOString(),
              duration: 30,
              exercises: [],
              sets: [],
              totalSets: 5,
              totalReps: 50,
              totalWeight: 100,
              completed: true
            };
            console.log('🧪 [DEBUG] Saving test workout:', testWorkout);
            saveWorkout(testWorkout);
          }}
          className="bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg p-4 text-left transition-all duration-200 md:col-span-2"
        >
          <div className="text-2xl mb-2">🏀</div>
          <div className="font-medium">Test Pokemon</div>
          <div className="text-sm opacity-90">Debug reward system</div>
        </button>
      </div>
    </div>
  );
};

export default QuickActions;
