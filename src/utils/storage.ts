import { Workout, WorkoutPlan, WorkoutStats } from '../types/workout';
import { SkillTree, SkillMilestone } from '../types/skills';
import { getExerciseById } from './exercises';
import { migrateWorkoutData, getAllSets } from './workoutHelpers';

const STORAGE_KEYS = {
  WORKOUTS: 'fittracker_workouts',
  PLANS: 'fittracker_plans',
  STATS: 'fittracker_stats',
  SETTINGS: 'fittracker_settings',
  SKILLS: 'fittracker_skills'
};

/**
 * Enhanced storage utilities with robust error handling and safe operations
 * Provides safe localStorage access with automatic error recovery
 */
export const storage = {
  /**
   * Safely retrieve item from localStorage with error handling
   * @param key - Storage key to retrieve
   * @returns Stored value or null if not found or error occurred
   */
  safeGetItem: (key: string): string | null => {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.warn(`Failed to read from localStorage key "${key}":`, error);
      return null;
    }
  },

  safeSetItem: (key: string, value: string): boolean => {
    try {
      localStorage.setItem(key, value);
      return true;
    } catch (error) {
      console.warn(`Failed to write to localStorage key "${key}":`, error);
      return false;
    }
  },

  safeRemoveItem: (key: string): boolean => {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.warn(`Failed to remove localStorage key "${key}":`, error);
      return false;
    }
  },

  // Workouts
  getWorkouts: (): Workout[] => {
    try {
      const data = storage.safeGetItem(STORAGE_KEYS.WORKOUTS);
      const workouts = data ? JSON.parse(data) : [];

      // Normalize workout data to ensure all required properties exist
      const normalizedWorkouts = workouts.map((workout: any) => ({
        ...workout,
        exercises: workout.exercises || [],
        sets: workout.sets || [],
        totalSets: workout.totalSets || 0,
        totalReps: workout.totalReps || 0,
        totalWeight: workout.totalWeight || 0
      }));

      // Migrate workout data to ensure both legacy and new formats are populated
      let needsPersistence = false;
      const migratedWorkouts = normalizedWorkouts.map((workout: Workout) => {
        try {
          const migratedWorkout = migrateWorkoutData(workout);
          
          // Check if migration actually changed the data
          const hadLegacyData = workout.sets && workout.sets.length > 0;
          const hadNewData = workout.exercises && workout.exercises.length > 0;
          const hasLegacyAfter = migratedWorkout.sets && migratedWorkout.sets.length > 0;
          const hasNewAfter = migratedWorkout.exercises && migratedWorkout.exercises.length > 0;
          
          // Determine if data was actually modified during migration
          const wasMigrated = 
            (hadLegacyData && !hadNewData && hasNewAfter) ||
            (!hadLegacyData && hadNewData && hasLegacyAfter) ||
            (hadLegacyData && hadNewData && (
              JSON.stringify(workout.sets) !== JSON.stringify(migratedWorkout.sets) ||
              JSON.stringify(workout.exercises) !== JSON.stringify(migratedWorkout.exercises)
            ));
          
          if (wasMigrated) {
            needsPersistence = true;
            console.debug(`Migrated workout ${workout.id}: Data format updated`);
          }
          
          return migratedWorkout;
        } catch (migrationError) {
          console.warn(`Failed to migrate workout ${workout.id}:`, migrationError);
          // Return the normalized workout without migration to prevent data corruption
          return workout;
        }
      });

      // Persist migrated data if any changes were made
      if (needsPersistence) {
        const success = storage.safeSetItem(STORAGE_KEYS.WORKOUTS, JSON.stringify(migratedWorkouts));
        if (success) {
          console.debug('Successfully persisted migrated workout data');
        } else {
          console.warn('Failed to persist migrated workout data');
        }
      }

      return migratedWorkouts;
    } catch (error) {
      console.error('Error parsing workouts from localStorage:', error);
      return [];
    }
  },

  saveWorkout: (workout: Workout) => {
    try {
      const workouts = storage.getWorkouts();
      const existingIndex = workouts.findIndex(w => w.id === workout.id);

      if (existingIndex >= 0) {
        workouts[existingIndex] = workout;
      } else {
        workouts.push(workout);
      }

      const success = storage.safeSetItem(STORAGE_KEYS.WORKOUTS, JSON.stringify(workouts));
      if (success) {
        storage.updateStats();
      }
    } catch (error) {
      console.error('Error saving workout:', error);
    }
  },

  deleteWorkout: (id: string) => {
    try {
      const workouts = storage.getWorkouts().filter(w => w.id !== id);
      const success = storage.safeSetItem(STORAGE_KEYS.WORKOUTS, JSON.stringify(workouts));
      if (success) {
        storage.updateStats();
      }
    } catch (error) {
      console.error('Error deleting workout:', error);
    }
  },

  // Workout Plans
  getPlans: (): WorkoutPlan[] => {
    try {
      const data = storage.safeGetItem(STORAGE_KEYS.PLANS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error parsing plans from localStorage:', error);
      return [];
    }
  },

  savePlan: (plan: WorkoutPlan) => {
    try {
      const plans = storage.getPlans();
      const existingIndex = plans.findIndex(p => p.id === plan.id);

      if (existingIndex >= 0) {
        plans[existingIndex] = plan;
      } else {
        plans.push(plan);
      }

      storage.safeSetItem(STORAGE_KEYS.PLANS, JSON.stringify(plans));
    } catch (error) {
      console.error('Error saving plan:', error);
    }
  },

  deletePlan: (id: string) => {
    try {
      const plans = storage.getPlans().filter(p => p.id !== id);
      storage.safeSetItem(STORAGE_KEYS.PLANS, JSON.stringify(plans));
    } catch (error) {
      console.error('Error deleting plan:', error);
    }
  },

  // Statistics
  getStats: (): WorkoutStats => {
    try {
      const data = storage.safeGetItem(STORAGE_KEYS.STATS);
      return data ? JSON.parse(data) : {
        totalWorkouts: 0,
        totalDuration: 0,
        averageDuration: 0,
        mostWorkedMuscle: '',
        strengthProgress: {},
        weeklyProgress: [0, 0, 0, 0, 0, 0, 0]
      };
    } catch (error) {
      console.error('Error parsing stats from localStorage:', error);
      return {
        totalWorkouts: 0,
        totalDuration: 0,
        averageDuration: 0,
        mostWorkedMuscle: '',
        strengthProgress: {},
        weeklyProgress: [0, 0, 0, 0, 0, 0, 0]
      };
    }
  },

  updateStats: () => {
    try {
      const workouts = storage.getWorkouts().filter(w => w.completed);

      if (workouts.length === 0) {
        const emptyStats = {
          totalWorkouts: 0,
          totalDuration: 0,
          averageDuration: 0,
          mostWorkedMuscle: '',
          strengthProgress: {},
          weeklyProgress: [0, 0, 0, 0, 0, 0, 0]
        };
        const success = storage.safeSetItem(STORAGE_KEYS.STATS, JSON.stringify(emptyStats));
        if (!success) {
          console.warn('Failed to save empty stats to localStorage');
        }
        return;
      }

      const totalDuration = workouts.reduce((sum, w) => sum + w.duration, 0);
      const averageDuration = totalDuration / workouts.length;

      // Calculate muscle group frequency by counting each set's exercise's muscle groups
      const muscleFrequency: Record<string, number> = {};
      workouts.forEach(workout => {
        try {
          // Use getAllSets to get all sets and count muscles per set
          const allSets = getAllSets(workout, { completedOnly: true });
          allSets.forEach((set: any) => {
            const exercise = getExerciseById(set.exerciseId);
            if (exercise) {
              exercise.muscleGroups.forEach(muscle => {
                muscleFrequency[muscle] = (muscleFrequency[muscle] || 0) + 1;
              });
            }
          });
        } catch (error) {
          console.warn('Error processing workout for stats:', error);
        }
      });

      const mostWorkedMuscle = Object.entries(muscleFrequency)
        .sort(([,a], [,b]) => b - a)[0]?.[0] || '';

      // Calculate weekly progress (last 7 days)
      const now = new Date();
      const weeklyProgress = Array(7).fill(0);
      workouts.forEach(workout => {
        try {
          const workoutDate = new Date(workout.date);
          const daysAgo = Math.floor((now.getTime() - workoutDate.getTime()) / (1000 * 60 * 60 * 24));
          if (daysAgo >= 0 && daysAgo < 7) {
            weeklyProgress[6 - daysAgo] += 1;
          }
        } catch (error) {
          console.warn('Error processing workout date for weekly progress:', error);
        }
      });

      const stats: WorkoutStats = {
        totalWorkouts: workouts.length,
        totalDuration,
        averageDuration,
        mostWorkedMuscle,
        strengthProgress: {}, // Would track weight progress over time
        weeklyProgress
      };

      const success = storage.safeSetItem(STORAGE_KEYS.STATS, JSON.stringify(stats));
      if (!success) {
        console.warn('Failed to save updated stats to localStorage');
      }
    } catch (error) {
      console.error('Error updating stats:', error);
    }
  },

  // Settings
  getSettings: () => {
    try {
      const data = storage.safeGetItem(STORAGE_KEYS.SETTINGS);
      return data ? JSON.parse(data) : {
        theme: 'dark',
        notifications: true,
        units: 'metric'
      };
    } catch (error) {
      console.error('Error parsing settings from localStorage:', error);
      return {
        theme: 'dark',
        notifications: true,
        units: 'metric'
      };
    }
  },

  saveSetting: (key: string, value: any) => {
    try {
      const settings = storage.getSettings();
      settings[key] = value;
      storage.safeSetItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving setting:', error);
    }
  },

  // Skills
  getSkills: (): SkillTree[] => {
    try {
      const data = storage.safeGetItem(STORAGE_KEYS.SKILLS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error parsing skills from localStorage:', error);
      return [];
    }
  },

  saveSkill: (skill: SkillTree) => {
    try {
      const skills = storage.getSkills();
      const existingIndex = skills.findIndex(s => s.id === skill.id);

      if (existingIndex >= 0) {
        skills[existingIndex] = skill;
      } else {
        skills.push(skill);
      }

      storage.safeSetItem(STORAGE_KEYS.SKILLS, JSON.stringify(skills));
    } catch (error) {
      console.error('Error saving skill:', error);
    }
  },

  deleteSkill: (id: string) => {
    try {
      const skills = storage.getSkills().filter(s => s.id !== id);
      storage.safeSetItem(STORAGE_KEYS.SKILLS, JSON.stringify(skills));
    } catch (error) {
      console.error('Error deleting skill:', error);
    }
  },

  updateMilestone: (skillId: string, milestoneId: string, updates: Partial<SkillMilestone>) => {
    try {
      const skills = storage.getSkills();
      const skill = skills.find(s => s.id === skillId);

      if (skill) {
        const milestone = skill.milestones.find(m => m.id === milestoneId);
        if (milestone) {
          Object.assign(milestone, updates);

          // Auto-complete milestone if target reached
          if (milestone.currentValue >= milestone.targetValue && !milestone.completed) {
            milestone.completed = true;
            milestone.completedDate = new Date().toISOString();
          }

          // Update skill progress
          const completedCount = skill.milestones.filter(m => m.completed).length;
          skill.totalProgress = (completedCount / skill.milestones.length) * 100;

          storage.saveSkill(skill);
        }
      }
    } catch (error) {
      console.error('Error updating milestone:', error);
    }
  }
};
