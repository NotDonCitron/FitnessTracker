export interface Exercise {
  id: string;
  name: string;
  category: 'chest' | 'back' | 'legs' | 'shoulders' | 'arms' | 'core' | 'cardio';
  muscleGroups: string[];
  equipment?: string;
  instructions?: string[];
  icon?: string;
}

export interface WorkoutSet {
  id: string;
  setNumber: number;
  exerciseId: string;
  reps: number;
  weight: number;
  duration?: number; // for timed exercises
  rest: number; // rest time in seconds
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

export interface Workout {
  id: string;
  name: string;
  date: string;
  duration: number; // total duration in minutes
  sets: WorkoutSet[];
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