export interface Exercise {
  id: string;
  name: string;
  category: 'chest' | 'back' | 'legs' | 'shoulders' | 'arms' | 'core' | 'cardio';
  muscleGroups: string[];
  equipment?: string;
  instructions?: string[];
  icon?: string;
}

/**
 * Represents a single set within a workout exercise.
 * All properties are required for proper functionality across the application.
 */
export interface WorkoutSet {
  /** Unique identifier for the set - required for tracking and data consistency */
  id: string;
  setNumber: number;
  /** Exercise identifier - required for linking sets to exercises in both legacy and new formats */
  exerciseId: string;
  reps: number;
  weight: number;
  duration?: number; // for timed exercises
  rest: number; // rest time in seconds
  /** Completion status - required for progress tracking and statistics */
  completed: boolean;
}

export interface WorkoutExercise {
  exercise: Exercise;
  sets: WorkoutSet[];
  planData?: {
    exerciseId: string;
    sets: number;
    reps: number;
    weight?: number;
    rest: number;
  };
}

/**
 * Represents a complete workout session.
 * 
 * Data Structure Migration:
 * - Legacy format: Sets stored in flat `sets[]` array
 * - New format: Sets stored hierarchically in `exercises[].sets[]`
 * - Both formats are maintained for backward compatibility
 * - Use helper functions from workoutHelpers.ts for consistent data access
 */
export interface Workout {
  id: string;
  name: string;
  date: string;
  duration: number; // total duration in minutes
  /** @deprecated Use exercises[].sets[] instead. This property is maintained for backward compatibility. */
  sets: WorkoutSet[];
  /** Preferred data structure - exercises with their associated sets */
  exercises: WorkoutExercise[];
  totalSets: number;
  totalReps: number;
  totalWeight: number;
  notes?: string;
  completed: boolean;
  planData?: {
    exerciseId: string;
    sets: number;
    reps: number;
    weight?: number;
    rest: number;
  }[];
}

export interface WorkoutPlan {
  id: string;
  name: string;
  description: string;
  exercises: {
    exerciseId: string;
    sets: number;
    reps: number;
    weight?: number;
    rest: number;
  }[];
  estimatedDuration: number;
}

export interface WorkoutStats {
  totalWorkouts: number;
  totalDuration: number; // in minutes
  averageDuration: number;
  mostWorkedMuscle: string;
  strengthProgress: Record<string, number[]>;
  weeklyProgress: number[];
}</parameter>
