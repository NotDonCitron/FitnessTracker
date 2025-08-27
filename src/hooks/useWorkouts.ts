import { useState, useEffect } from 'react';
import { Workout, WorkoutPlan, WorkoutStats } from '../types/workout';
import { storage } from '../utils/storage';

export const useWorkouts = (onWorkoutComplete?: () => void, onStreakReward?: (days: number) => void) => {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [plans, setPlans] = useState<WorkoutPlan[]>([]);
  const [stats, setStats] = useState<WorkoutStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeWorkout, setActiveWorkout] = useState<Workout | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setLoading(true);
    try {
      setWorkouts(storage.getWorkouts());
      setPlans(storage.getPlans());
      setStats(storage.getStats());
    } catch (error) {
      console.error('Error loading workout data:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveWorkout = (workout: Workout) => {
    try {
      console.log('🏋️ [DEBUG] Attempting to save workout:', workout);
      storage.saveWorkout(workout);
      setWorkouts(storage.getWorkouts());
      setStats(storage.getStats());
      
      // Trigger Pokemon reward for completed workouts
      console.log('✅ [DEBUG] Workout completed status:', workout.completed);
      if (workout.completed) {
        if (onWorkoutComplete) {
          console.log('🎯 [DEBUG] onWorkoutComplete callback exists, calling it now...');
          onWorkoutComplete(workout.id); // Pass workout ID to prevent duplicates
        } else {
          console.log('❌ [DEBUG] onWorkoutComplete callback is null/undefined!');
        }
        
        // Check for streak rewards
        const recentWorkouts = getRecentWorkouts(7);
        const streak = calculateCurrentStreak(recentWorkouts);
        console.log('🔥 [DEBUG] Current streak:', streak);
        if (streak > 0 && streak % 3 === 0) { // Reward every 3 days
          if (onStreakReward) {
            console.log('🏆 [DEBUG] onStreakReward callback triggered for', streak, 'day streak');
            setTimeout(() => onStreakReward(streak), 2000); // Delay second reward
          }
        }
      } else {
        console.log('⚠️ [DEBUG] Workout not marked as completed, no Pokemon reward');
      }
    } catch (error) {
      console.error('Error saving workout:', error);
    }
  };

  const deleteWorkout = (id: string) => {
    try {
      storage.deleteWorkout(id);
      setWorkouts(storage.getWorkouts());
      setStats(storage.getStats());
    } catch (error) {
      console.error('Error deleting workout:', error);
    }
  };

  const savePlan = (plan: WorkoutPlan) => {
    try {
      storage.savePlan(plan);
      setPlans(storage.getPlans());
    } catch (error) {
      console.error('Error saving plan:', error);
    }
  };

  const deletePlan = (id: string) => {
    try {
      storage.deletePlan(id);
      setPlans(storage.getPlans());
    } catch (error) {
      console.error('Error deleting plan:', error);
    }
  };

  const getRecentWorkouts = (limit: number = 5) => {
    return workouts
      .filter(w => w.completed)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, limit);
  };

  const getWorkoutsByDateRange = (startDate: Date, endDate: Date) => {
    return workouts.filter(w => {
      const workoutDate = new Date(w.date);
      return workoutDate >= startDate && workoutDate <= endDate && w.completed;
    });
  };

  const calculateCurrentStreak = (workouts: Workout[]) => {
    if (workouts.length === 0) return 0;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let streak = 0;
    let currentDate = new Date(today);
    
    for (let i = 0; i < 30; i++) { // Check last 30 days
      const hasWorkout = workouts.some(w => {
        const workoutDate = new Date(w.date);
        workoutDate.setHours(0, 0, 0, 0);
        return workoutDate.getTime() === currentDate.getTime();
      });
      
      if (hasWorkout) {
        streak++;
      } else {
        break;
      }
      
      currentDate.setDate(currentDate.getDate() - 1);
    }
    
    return streak;
  };

  return {
    workouts,
    plans,
    stats,
    loading,
    activeWorkout,
    setActiveWorkout,
    saveWorkout,
    deleteWorkout,
    savePlan,
    deletePlan,
    getRecentWorkouts,
    getWorkoutsByDateRange,
    refreshData: loadData
  };
};