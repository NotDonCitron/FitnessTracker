export interface Achievement {
+  id: string;
+  title: string;
+  description: string;
+  icon: string;
+  rarity: 'common' | 'rare' | 'epic' | 'legendary';
+  category: 'workout' | 'strength' | 'endurance' | 'consistency' | 'special';
+  requirement: {
+    type: 'workout_count' | 'streak_days' | 'total_time' | 'exercise_weight' | 'custom';
+    value: number;
+    exerciseId?: string;
+  };
+  unlockedDate?: string;
+  progress?: number;
+}

+export interface Badge {
+  id: string;
+  name: string;
+  description: string;
+  icon: string;
+  color: string;
+  earnedDate: string;
+  category: string;
+}

+export const ACHIEVEMENT_DEFINITIONS: Achievement[] = [
+  // Workout Count Achievements
+  {
+    id: 'first_workout',
+    title: 'First Steps',
+    description: 'Complete your first workout',
+    icon: '🏃',
+    rarity: 'common',
+    category: 'workout',
+    requirement: { type: 'workout_count', value: 1 }
+  },
+  {
+    id: 'dedicated_trainer',
+    title: 'Dedicated Trainer',
+    description: 'Complete 10 workouts',
+    icon: '💪',
+    rarity: 'common',
+    category: 'workout',
+    requirement: { type: 'workout_count', value: 10 }
+  },
+  {
+    id: 'fitness_enthusiast',
+    title: 'Fitness Enthusiast',
+    description: 'Complete 50 workouts',
+    icon: '🔥',
+    rarity: 'rare',
+    category: 'workout',
+    requirement: { type: 'workout_count', value: 50 }
+  },
+  {
+    id: 'gym_legend',
+    title: 'Gym Legend',
+    description: 'Complete 100 workouts',
+    icon: '👑',
+    rarity: 'epic',
+    category: 'workout',
+    requirement: { type: 'workout_count', value: 100 }
+  },
+  
+  // Streak Achievements
+  {
+    id: 'week_warrior',
+    title: 'Week Warrior',
+    description: 'Maintain a 7-day workout streak',
+    icon: '🔥',
+    rarity: 'common',
+    category: 'consistency',
+    requirement: { type: 'streak_days', value: 7 }
+  },
+  {
+    id: 'month_master',
+    title: 'Month Master',
+    description: 'Maintain a 30-day workout streak',
+    icon: '🌟',
+    rarity: 'rare',
+    category: 'consistency',
+    requirement: { type: 'streak_days', value: 30 }
+  },
+  {
+    id: 'unstoppable',
+    title: 'Unstoppable',
+    description: 'Maintain a 100-day workout streak',
+    icon: '⚡',
+    rarity: 'legendary',
+    category: 'consistency',
+    requirement: { type: 'streak_days', value: 100 }
+  },
+  
+  // Time-based Achievements
+  {
+    id: 'time_champion',
+    title: 'Time Champion',
+    description: 'Train for 10+ hours total',
+    icon: '⏰',
+    rarity: 'common',
+    category: 'endurance',
+    requirement: { type: 'total_time', value: 600 } // 10 hours in minutes
+  },
+  {
+    id: 'marathon_trainer',
+    title: 'Marathon Trainer',
+    description: 'Train for 50+ hours total',
+    icon: '🏃‍♂️',
+    rarity: 'rare',
+    category: 'endurance',
+    requirement: { type: 'total_time', value: 3000 } // 50 hours
+  },
+  
+  // Strength Achievements
+  {
+    id: 'bench_press_100',
+    title: 'Century Press',
+    description: 'Bench press 100kg',
+    icon: '🏋️‍♂️',
+    rarity: 'rare',
+    category: 'strength',
+    requirement: { type: 'exercise_weight', value: 100, exerciseId: 'bench-press' }
+  },
+  {
+    id: 'squat_150',
+    title: 'Squat Master',
+    description: 'Squat 150kg',
+    icon: '🦵',
+    rarity: 'epic',
+    category: 'strength',
+    requirement: { type: 'exercise_weight', value: 150, exerciseId: 'squats' }
+  },
+  {
+    id: 'deadlift_200',
+    title: 'Deadlift Beast',
+    description: 'Deadlift 200kg',
+    icon: '💀',
+    rarity: 'legendary',
+    category: 'strength',
+    requirement: { type: 'exercise_weight', value: 200, exerciseId: 'deadlifts' }
+  }
+];
+