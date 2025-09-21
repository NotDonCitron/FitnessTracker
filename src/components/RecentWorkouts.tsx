import React from 'react';
import { Activity, Target } from 'lucide-react';
import { Workout } from '../types/workout';
import { getCompletedSetCount, getExerciseCount } from '../utils/workoutHelpers';

interface RecentWorkoutsProps {
  recentWorkouts: Workout[];
}

const RecentWorkouts: React.FC<RecentWorkoutsProps> = ({ recentWorkouts }) => {
  const formatDuration = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
        <Activity className="h-5 w-5 mr-2 text-green-600" />
        Recent Workouts
      </h3>
      
      {recentWorkouts.length > 0 ? (
        <div className="space-y-3">
          {recentWorkouts.map((workout) => (
            <div key={`recent-${workout.id}`} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">{workout.name}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {new Date(workout.date).toLocaleDateString()} • {formatDuration(workout.duration)}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-500">
                    {getExerciseCount(workout)} exercises • {getCompletedSetCount(workout)} sets completed
                  </p>
                </div>
                <div className="flex items-center text-green-600">
                  <Target className="h-4 w-4 mr-1" />
                  <span className="text-sm font-medium">Complete</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <Activity className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600 dark:text-gray-400">No workouts yet</p>
          <p className="text-sm text-gray-50 dark:text-gray-500">Start your first workout to see progress here</p>
        </div>
      )}
    </div>
  );
};

export default RecentWorkouts;
