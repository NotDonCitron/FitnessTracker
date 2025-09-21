import React, { useState } from 'react';
import { BarChart3, TrendingUp, Calendar, Award, Clock, Dumbbell, User, Zap } from 'lucide-react';
import { getExerciseById } from '../utils/exercises';
import { getAllSets, getCompletedSets, getCompletedSetCount } from '../utils/workoutHelpers';
import { Workout, WorkoutStats } from '../types/workout';

interface StatisticsProps {
  stats: WorkoutStats | null;
  workouts: Workout[];
  getWorkoutsByDateRange: (startDate: Date, endDate: Date) => Workout[];
}

const Statistics: React.FC<StatisticsProps> = ({ stats, workouts, getWorkoutsByDateRange }) => {
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('week');

  if (!stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const getTimeRangeData = (): Workout[] => {
    const now = new Date();
    let startDate: Date;

    switch (timeRange) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case 'year':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 1000);
        break;
    }

    return getWorkoutsByDateRange(startDate, now);
  };

  const timeRangeWorkouts = getTimeRangeData();
  const completedWorkouts = workouts.filter(w => w.completed);

  // Calculate streaks
  const calculateStreak = () => {
    const sortedWorkouts = completedWorkouts
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    let currentStreak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    for (const workout of sortedWorkouts) {
      const workoutDate = new Date(workout.date);
      workoutDate.setHours(0, 0, 0, 0);
      
      const daysDiff = Math.floor((currentDate.getTime() - workoutDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDiff === currentStreak) {
        currentStreak++;
      } else if (daysDiff === currentStreak + 1 && currentStreak === 0) {
        // Allow for today or yesterday if no streak started yet
        currentStreak = 1;
      } else {
        break;
      }
    }

    return currentStreak;
  };

  const currentStreak = calculateStreak();

  // Get most popular exercises
  const exerciseFrequency: Record<string, number> = {};
  completedWorkouts.forEach((workout: Workout) => {
    getAllSets(workout, { completedOnly: true }).forEach((set: any) => {
      // Exclude 'unknown' exercise IDs from frequency count
      if (set.exerciseId && set.exerciseId !== 'unknown') {
        exerciseFrequency[set.exerciseId] = (exerciseFrequency[set.exerciseId] || 0) + 1;
      }
    });
  });

  const topExercises = Object.entries(exerciseFrequency)
    .sort((a: [string, number], b: [string, number]) => b[1] - a[1])
    .slice(0, 5);

  // Calculate strength progress for major lifts
  const getStrengthProgress = () => {
      const majorLifts = ['bench-press', 'squats', 'deadlifts', 'pull-ups'];
      const progressData: Record<string, { current: number; previous: number; change: number }> = {};
      
      majorLifts.forEach(exerciseId => {
        // Create workout sets with parent workout time for proper sorting
        const workoutSets = completedWorkouts
          .flatMap((workout: Workout) => 
            getAllSets(workout, { completedOnly: true })
              .filter((set: any) => set.exerciseId === exerciseId)
              .map((set: any) => ({ ...set, _workoutTime: new Date(workout.date).getTime() }))
          )
          .sort((a: any, b: any) => a._workoutTime - b._workoutTime);
        
        if (workoutSets.length >= 2) {
          const recent = workoutSets.slice(-5);
          const previous = workoutSets.slice(-10, -5);
          
          const currentMax = Math.max(...recent.map(s => s.weight));
          const previousMax = previous.length > 0 ? Math.max(...previous.map(s => s.weight)) : currentMax;
          
          progressData[exerciseId] = {
            current: currentMax,
            previous: previousMax,
            change: ((currentMax - previousMax) / previousMax) * 100
          };
        }
      });
    
    return progressData;
  };

  const strengthProgress = getStrengthProgress();

  // Muscle group heatmap data
  const getMuscleGroupHeatmap = () => {
    const muscleGroups = ['chest', 'back', 'legs', 'shoulders', 'arms', 'core'];
    const heatmapData: Record<string, number> = {};
    
    muscleGroups.forEach(muscle => {
      heatmapData[muscle] = 0;
    });
    
    completedWorkouts.forEach((workout: Workout) => {
      getCompletedSets(workout).forEach((set: any) => {
        const exercise = getExerciseById(set.exerciseId);
        if (exercise) {
          exercise.muscleGroups.forEach(muscle => {
            if (heatmapData[muscle] !== undefined) {
              heatmapData[muscle] += 1;
            }
          });
        }
      });
    });
    
    const maxValue = Math.max(...Object.values(heatmapData), 1);
    
    return Object.entries(heatmapData).map(([muscle, count]) => ({
      muscle,
      count,
      intensity: (count / maxValue) * 100
    }));
  };

  const muscleHeatmap = getMuscleGroupHeatmap();

  const StatCard: React.FC<{
    icon: React.ReactNode;
    title: string;
    value: string | number;
    subtitle?: string;
    color: string;
    trend?: string;
  }> = ({ icon, title, value, subtitle, color, trend }) => (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-2">
        <div className={`p-2 rounded-lg bg-opacity-20`} style={{ backgroundColor: color }}>
          {icon}
        </div>
        {trend && (
          <span className="text-sm font-medium text-green-600 flex items-center">
            <TrendingUp className="h-3 w-3 mr-1" />
            {trend}
          </span>
        )}
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Statistics</h1>
        <p className="text-gray-600 mt-2">Track your fitness progress and achievements</p>
      </div>

      {/* Time Range Selector */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="flex space-x-2">
          {(['week', 'month', 'year'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                timeRange === range
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {range.charAt(0).toUpperCase() + range.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<Dumbbell className="h-6 w-6 text-blue-600" />}
          title="Total Workouts"
          value={stats.totalWorkouts}
          subtitle="All time"
          color="#3B82F6"
        />
        
        <StatCard
          icon={<Clock className="h-6 w-6 text-green-600" />}
          title="Total Time"
          value={formatDuration(stats.totalDuration)}
          subtitle="Hours trained"
          color="#10B981"
        />
        
        <StatCard
          icon={<BarChart3 className="h-6 w-6 text-purple-600" />}
          title="Avg Workout"
          value={formatDuration(Math.round(stats.averageDuration))}
          subtitle="Per session"
          color="#8B5CF6"
        />
        
        <StatCard
          icon={<Award className="h-6 w-6 text-orange-600" />}
          title="Current Streak"
          value={`${currentStreak} days`}
          subtitle="Keep it up!"
          color="#F59E0B"
        />
      </div>

      {/* Weekly Progress Chart */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Calendar className="h-5 w-5 mr-2 text-blue-600" />
          Weekly Activity
        </h3>
        <div className="flex items-end justify-between h-40 bg-gray-50 rounded p-4">
          {stats.weeklyProgress.map((count: number, index: number) => {
            const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
            const maxCount = Math.max(...stats.weeklyProgress, 1);
            const height = (count / maxCount) * 100;
            
            return (
              <div key={`weekly-${index}`} className="flex flex-col items-center">
                <div className="text-xs font-semibold text-gray-900 mb-1">{count}</div>
                <div 
                  className="w-8 bg-blue-500 rounded-t transition-all duration-300 hover:bg-blue-600"
                  style={{ height: `${height}%` }}
                ></div>
                <span className="text-xs text-gray-600 mt-2">{days[index]}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Time Range Summary */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {timeRange.charAt(0).toUpperCase() + timeRange.slice(1)} Summary
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{timeRangeWorkouts.length}</div>
            <div className="text-sm text-gray-600">Workouts Completed</div>
          </div>
          
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {formatDuration(timeRangeWorkouts.reduce((sum: number, w: Workout) => sum + w.duration, 0))}
            </div>
            <div className="text-sm text-gray-600">Time Exercised</div>
          </div>
          
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">
              {timeRangeWorkouts.reduce((sum: number, w: Workout) => sum + getCompletedSetCount(w), 0)}
            </div>
            <div className="text-sm text-gray-600">Sets Completed</div>
          </div>
        </div>
      </div>

      {/* Top Exercises */}
      {topExercises.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <TrendingUp className="h-5 w-5 mr-2 text-green-600" />
            Most Popular Exercises
          </h3>
          
          <div className="space-y-3">
            {topExercises.map(([exerciseId, count], index) => (
              <div key={`top-${exerciseId}`} className="flex items-center">
                <div className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 rounded-full mr-3 font-semibold">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <div className="font-medium text-gray-900">
                    {exerciseId.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ width: `${(count / topExercises[0][1]) * 100}%` }}
                    ></div>
                  </div>
                </div>
                <div className="ml-4 text-sm font-semibold text-gray-600">
                  {count} sets
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Strength Progress */}
      {Object.keys(strengthProgress).length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <Zap className="h-5 w-5 mr-2 text-yellow-600" />
            Strength Progress
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(strengthProgress).map(([exerciseId, progress]) => {
              const exercise = getExerciseById(exerciseId);
              if (!exercise) return null;
              
              return (
                <div key={`strength-${exerciseId}`} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium text-gray-900 dark:text-white">{exercise.name}</h4>
                    <span className={`text-sm font-bold ${
                      progress.change > 0 ? 'text-green-600' : progress.change < 0 ? 'text-red-600' : 'text-gray-600'
                    }`}>
                      {progress.change > 0 ? '+' : ''}{progress.change.toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                    <span>Previous: {progress.previous}kg</span>
                    <span>Current: {progress.current}kg</span>
                  </div>
                  <div className="mt-2 w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        progress.change > 0 ? 'bg-green-500' : progress.change < 0 ? 'bg-red-500' : 'bg-gray-400'
                      }`}
                      style={{ width: `${Math.min(Math.abs(progress.change) * 10, 100)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Muscle Group Heatmap */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <User className="h-5 w-5 mr-2 text-purple-600" />
          Muscle Group Activity
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {muscleHeatmap.map(({ muscle, count, intensity }) => (
            <div key={`muscle-${muscle}`} className="text-center">
              <div 
                className="w-16 h-16 mx-auto rounded-full flex items-center justify-center text-white font-bold text-sm mb-2"
                style={{ 
                  backgroundColor: `rgba(59, 130, 246, ${intensity / 100})`,
                  border: '2px solid #3B82F6'
                }}
              >
                {count}
              </div>
              <p className="text-sm font-medium text-gray-900 dark:text-white capitalize">{muscle}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{count} sets</p>
            </div>
          ))}
        </div>
      </div>

      {/* Achievement Badges */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Award className="h-5 w-5 mr-2 text-yellow-600" />
          Achievements
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* First Workout Badge */}
          <div className={`text-center p-4 rounded-lg border-2 ${
            stats.totalWorkouts >= 1 ? 'border-green-300 bg-green-50' : 'border-gray-200 bg-gray-50'
          }`}>
            <div className={`text-2xl mb-2 ${stats.totalWorkouts >= 1 ? '' : 'grayscale opacity-50'}`}>🏃</div>
            <div className="text-sm font-medium text-gray-900">First Workout</div>
            <div className="text-xs text-gray-600">Complete 1 workout</div>
          </div>

          {/* Consistent Week Badge */}
          <div className={`text-center p-4 rounded-lg border-2 ${
            currentStreak >= 7 ? 'border-green-300 bg-green-50' : 'border-gray-200 bg-gray-50'
          }`}>
            <div className={`text-2xl mb-2 ${currentStreak >= 7 ? '' : 'grayscale opacity-50'}`}>🔥</div>
            <div className="text-sm font-medium text-gray-900">Week Streak</div>
            <div className="text-xs text-gray-600">7 day streak</div>
          </div>

          {/* Dedicated Badge */}
          <div className={`text-center p-4 rounded-lg border-2 ${
            stats.totalWorkouts >= 10 ? 'border-green-300 bg-green-50' : 'border-gray-200 bg-gray-50'
          }`}>
            <div className={`text-2xl mb-2 ${stats.totalWorkouts >= 10 ? '' : 'grayscale opacity-50'}`}>💪</div>
            <div className="text-sm font-medium text-gray-900">Dedicated</div>
            <div className="text-xs text-gray-600">Complete 10 workouts</div>
          </div>

          {/* Time Champion Badge */}
          <div className={`text-center p-4 rounded-lg border-2 ${
            stats.totalDuration >= 600 ? 'border-green-300 bg-green-50' : 'border-gray-200 bg-gray-50'
          }`}>
            <div className={`text-2xl mb-2 ${stats.totalDuration >= 600 ? '' : 'grayscale opacity-50'}`}>⏰</div>
            <div className="text-sm font-medium text-gray-900">Time Champion</div>
            <div className="text-xs text-gray-600">10+ hours trained</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Statistics;
