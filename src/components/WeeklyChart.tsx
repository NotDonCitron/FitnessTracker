import React from 'react';
import { Calendar } from 'lucide-react';
import { WorkoutStats } from '../types/workout';

interface WeeklyChartProps {
  stats: WorkoutStats | null;
}

const WeeklyChart: React.FC<WeeklyChartProps> = ({ stats }) => {
  if (!stats) return null;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
        <Calendar className="h-5 w-5 mr-2 text-blue-600" />
        Weekly Progress
      </h3>
      <div className="flex items-end justify-between h-32 bg-gray-50 dark:bg-gray-700 rounded p-4">
        {stats.weeklyProgress.map((count, index) => {
          const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
          const maxCount = Math.max(...(stats.weeklyProgress || [1]), 1);
          const height = (count / maxCount) * 100;
          
          return (
            <div key={`weekly-${days[index]}-${count}`} className="flex flex-col items-center">
              <div 
                className="w-8 bg-blue-500 rounded-t transition-all duration-300 hover:bg-blue-600"
                style={{ height: `${height}%` }}
              ></div>
              <span className="text-xs text-gray-600 dark:text-gray-400 mt-2">{days[index]}</span>
              <span className="text-xs font-semibold text-gray-900 dark:text-white">{count}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WeeklyChart;
