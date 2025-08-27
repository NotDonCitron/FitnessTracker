import { Workout, WorkoutPlan, WorkoutStats } from '../types/workout';
import { SkillTree, SkillMilestone } from '../types/skills';
import { getExerciseById } from './exercises';

const STORAGE_KEYS = {
  WORKOUTS: 'fittracker_workouts',
  PLANS: 'fittracker_plans',
  STATS: 'fittracker_stats',
  SETTINGS: 'fittracker_settings',
  SKILLS: 'fittracker_skills'
};

export const storage = {
  // Workouts
  getWorkouts: (): Workout[] => {
    const data = localStorage.getItem(STORAGE_KEYS.WORKOUTS);
    const workouts = data ? JSON.parse(data) : [];
    
    // Normalize workout data to ensure all required properties exist
    return workouts.map((workout: any) => ({
      ...workout,
      exercises: workout.exercises || [],
      sets: workout.sets || [],
      totalSets: workout.totalSets || 0,
      totalReps: workout.totalReps || 0,
      totalWeight: workout.totalWeight || 0
    }));
  },

  saveWorkout: (workout: Workout) => {
    const workouts = storage.getWorkouts();
    const existingIndex = workouts.findIndex(w => w.id === workout.id);
    
    if (existingIndex >= 0) {
      workouts[existingIndex] = workout;
    } else {
      workouts.push(workout);
    }
    
    localStorage.setItem(STORAGE_KEYS.WORKOUTS, JSON.stringify(workouts));
    storage.updateStats();
  },

  deleteWorkout: (id: string) => {
    const workouts = storage.getWorkouts().filter(w => w.id !== id);
    localStorage.setItem(STORAGE_KEYS.WORKOUTS, JSON.stringify(workouts));
    storage.updateStats();
  },

  // Workout Plans
  getPlans: (): WorkoutPlan[] => {
    const data = localStorage.getItem(STORAGE_KEYS.PLANS);
    return data ? JSON.parse(data) : [];
  },

  savePlan: (plan: WorkoutPlan) => {
    const plans = storage.getPlans();
    const existingIndex = plans.findIndex(p => p.id === plan.id);
    
    if (existingIndex >= 0) {
      plans[existingIndex] = plan;
    } else {
      plans.push(plan);
    }
    
    localStorage.setItem(STORAGE_KEYS.PLANS, JSON.stringify(plans));
  },

  deletePlan: (id: string) => {
    const plans = storage.getPlans().filter(p => p.id !== id);
    localStorage.setItem(STORAGE_KEYS.PLANS, JSON.stringify(plans));
  },

  // Statistics
  getStats: (): WorkoutStats => {
    const data = localStorage.getItem(STORAGE_KEYS.STATS);
    return data ? JSON.parse(data) : {
      totalWorkouts: 0,
      totalDuration: 0,
      averageDuration: 0,
      mostWorkedMuscle: '',
      strengthProgress: {},
      weeklyProgress: [0, 0, 0, 0, 0, 0, 0]
    };
  },

  updateStats: () => {
    const workouts = storage.getWorkouts().filter(w => w.completed);
    
    if (workouts.length === 0) {
      localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify({
        totalWorkouts: 0,
        totalDuration: 0,
        averageDuration: 0,
        mostWorkedMuscle: '',
        strengthProgress: {},
        weeklyProgress: [0, 0, 0, 0, 0, 0, 0]
      }));
      return;
    }

    const totalDuration = workouts.reduce((sum, w) => sum + w.duration, 0);
    const averageDuration = totalDuration / workouts.length;

    // Calculate muscle group frequency
    const muscleFrequency: Record<string, number> = {};
    workouts.forEach(workout => {
      if (workout.exercises) {
        workout.exercises.forEach(exerciseData => {
          exerciseData.exercise.muscleGroups.forEach(muscle => {
            muscleFrequency[muscle] = (muscleFrequency[muscle] || 0) + 1;
          });
        });
      } else if (workout.sets) {
        // Fallback for old workout format
        workout.sets.forEach(set => {
          const exercise = getExerciseById(set.exerciseId);
          if (exercise) {
            exercise.muscleGroups.forEach(muscle => {
              muscleFrequency[muscle] = (muscleFrequency[muscle] || 0) + 1;
            });
          }
        });
      }
      });

    const mostWorkedMuscle = Object.entries(muscleFrequency)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || '';

    // Calculate weekly progress (last 7 days)
    const now = new Date();
    const weeklyProgress = Array(7).fill(0);
    workouts.forEach(workout => {
      const workoutDate = new Date(workout.date);
      const daysAgo = Math.floor((now.getTime() - workoutDate.getTime()) / (1000 * 60 * 60 * 24));
      if (daysAgo >= 0 && daysAgo < 7) {
        weeklyProgress[6 - daysAgo] += 1;
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

    localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(stats));
  },

  // Settings
  getSettings: () => {
    const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    return data ? JSON.parse(data) : {
      theme: 'dark',
      notifications: true,
      units: 'metric'
    };
  },

  saveSetting: (key: string, value: any) => {
    const settings = storage.getSettings();
    settings[key] = value;
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  },

  // Skills
  getSkills: (): SkillTree[] => {
    const data = localStorage.getItem(STORAGE_KEYS.SKILLS);
    return data ? JSON.parse(data) : [];
  },

  saveSkill: (skill: SkillTree) => {
    const skills = storage.getSkills();
    const existingIndex = skills.findIndex(s => s.id === skill.id);
    
    if (existingIndex >= 0) {
      skills[existingIndex] = skill;
    } else {
      skills.push(skill);
    }
    
    localStorage.setItem(STORAGE_KEYS.SKILLS, JSON.stringify(skills));
  },

  deleteSkill: (id: string) => {
    const skills = storage.getSkills().filter(s => s.id !== id);
    localStorage.setItem(STORAGE_KEYS.SKILLS, JSON.stringify(skills));
  },

  updateMilestone: (skillId: string, milestoneId: string, updates: Partial<SkillMilestone>) => {
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
  }
};