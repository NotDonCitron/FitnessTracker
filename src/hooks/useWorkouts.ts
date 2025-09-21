import { useState, useEffect } from 'react';
import { Workout, WorkoutPlan, WorkoutStats } from '../types/workout';
import { storage } from '../utils/storage';

export const useWorkouts = (onWorkoutComplete?: (workoutId: string) => void, onStreakReward?: (days: number) => void) => {
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
      // Silently handle data loading errors
    } finally {
      setLoading(false);
    }
  };

  const saveWorkout = (workout: Workout) => {
    try {
      storage.saveWorkout(workout);
      setWorkouts(storage.getWorkouts());
      setStats(storage.getStats());

      // Trigger Pokemon reward for completed workouts
      if (workout.completed) {
        if (onWorkoutComplete) {
          onWorkoutComplete(workout.id); // Pass workout ID to prevent duplicates
        }

        // Check for streak rewards
        const recentWorkouts = getRecentWorkouts(7);
        const streak = calculateCurrentStreak(recentWorkouts);
        if (streak > 0 && streak % 3 === 0) { // Reward every 3 days
          if (onStreakReward) {
            setTimeout(() => onStreakReward(streak), 2000); // Delay second reward
          }
        }
      }
    } catch (error) {
      // Silently handle workout saving errors
    }
  };

  const deleteWorkout = (id: string) => {
    try {
      storage.deleteWorkout(id);
      setWorkouts(storage.getWorkouts());
      setStats(storage.getStats());
    } catch (error) {
      // Silently handle workout deletion errors
    }
  };

  const savePlan = (plan: WorkoutPlan) => {
    try {
      storage.savePlan(plan);
      setPlans(storage.getPlans());
    } catch (error) {
      // Silently handle plan saving errors
    }
  };

  const deletePlan = (id: string) => {
    try {
      storage.deletePlan(id);
      setPlans(storage.getPlans());
    } catch (error) {
      // Silently handle plan deletion errors
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