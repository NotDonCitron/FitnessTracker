import { Workout, WorkoutSet, WorkoutExercise } from '../types/workout';
import { getExerciseById } from './exercises';

/**
 * Safe random ID generator with fallback for older browsers and Node environments
 * @returns A random UUID string
 */
export function safeRandomId(): string {
  // Try crypto.randomUUID first (modern browsers and Node 14.17+)
 if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    try {
      return crypto.randomUUID();
    } catch (error) {
      console.warn('crypto.randomUUID failed, falling back to Math.random:', error);
    }
 }
  
  // Fallback implementation using Math.random
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * Options for filtering sets when retrieving them from workouts
 */
export interface GetSetsOptions {
  /** If true, only return completed sets */
  completedOnly?: boolean;
}

/**
 * Extracts all sets from a workout, handling both legacy and new data formats.
 * 
 * @param workout - The workout to extract sets from
 * @param options - Optional filtering options
 * @returns Array of WorkoutSet objects from either format
 */
export function getAllSets(workout: Workout, options: GetSetsOptions = {}): WorkoutSet[] {
  const { completedOnly = false } = options;
  let allSets: WorkoutSet[] = [];

  // First, try to get sets from the new hierarchical format (workout.exercises[].sets[])
  if (workout.exercises && workout.exercises.length > 0) {
    allSets = workout.exercises.flatMap(exerciseData => {
      return exerciseData.sets.map(set => ({
        ...set,
        // Ensure required properties are present for legacy compatibility
        id: set.id,
        exerciseId: set.exerciseId || exerciseData.exercise.id,
        rest: set.rest ?? 90
      }));
    });
  }

  // If no sets found in new format, fall back to legacy format (workout.sets[])
  if (allSets.length === 0 && workout.sets && workout.sets.length > 0) {
    allSets = workout.sets.map(set => ({
      ...set,
      // Ensure all required properties are present
      id: set.id,
      exerciseId: set.exerciseId || '',
      rest: set.rest ?? 90
    }));
  }

  // Filter for completed sets if requested
  if (completedOnly) {
    allSets = allSets.filter(set => set.completed);
  }

  return allSets;
}

/**
 * Returns the count of completed sets from a workout, handling both data formats.
 * 
 * @param workout - The workout to count completed sets from
 * @returns Number of completed sets
 */
export function getCompletedSetCount(workout: Workout): number {
  return getAllSets(workout, { completedOnly: true }).length;
}

/**
 * Returns an array of completed sets from a workout, handling both data formats.
 * 
 * @param workout - The workout to get completed sets from
 * @returns Array of completed WorkoutSet objects
 */
export function getCompletedSets(workout: Workout): WorkoutSet[] {
  return getAllSets(workout, { completedOnly: true });
}

/**
 * Migrates workout data to ensure both legacy and new formats are populated.
 * This function ensures backward compatibility by maintaining both data structures.
 * 
 * @param workout - The workout to migrate
 * @returns The migrated workout with both formats populated
 */
export function migrateWorkoutData(workout: Workout): Workout {
  const migratedWorkout = { ...workout };

  try {
    // Ensure exercises array exists
    if (!migratedWorkout.exercises) {
      migratedWorkout.exercises = [];
    }

    // Ensure sets array exists
    if (!migratedWorkout.sets) {
      migratedWorkout.sets = [];
    }

    // Normalize IDs in both formats using nullish coalescing
    // Walk all sets in exercises[].sets[] and sets[] and assign proper IDs
    const normalizedExerciseSets: WorkoutSet[] = [];
    const normalizedLegacySets: WorkoutSet[] = [];

    // Normalize exercise sets (new format)
    migratedWorkout.exercises = migratedWorkout.exercises.map(exerciseData => {
      const normalizedSets = exerciseData.sets.map(set => ({
        ...set,
        id: set.id || safeRandomId(),
        exerciseId: set.exerciseId || exerciseData.exercise.id,
        rest: set.rest ?? 90
      }));
      normalizedExerciseSets.push(...normalizedSets);
      return {
        ...exerciseData,
        sets: normalizedSets
      };
    });

    // Normalize legacy sets
    migratedWorkout.sets = migratedWorkout.sets.map(set => ({
      ...set,
      id: set.id || safeRandomId(),
      exerciseId: set.exerciseId || '',
      rest: set.rest ?? 90
    }));

    // Case 1: New format has data, legacy format is empty
    // Populate legacy format from new format
    if (migratedWorkout.exercises.length > 0 && migratedWorkout.sets.length === 0) {
      migratedWorkout.sets = [...normalizedExerciseSets];
    }

    // Case 2: Legacy format has data, new format is empty
    // Create synthetic exercises from legacy sets using real exercise data when available
    else if (migratedWorkout.sets.length > 0 && migratedWorkout.exercises.length === 0) {
      // Group sets by exerciseId to create synthetic exercises
      const setsByExercise = migratedWorkout.sets.reduce((acc, set) => {
        const exerciseId = set.exerciseId || 'unknown';
        if (!acc[exerciseId]) {
          acc[exerciseId] = [];
        }
        acc[exerciseId].push(set);
        return acc;
      }, {} as Record<string, WorkoutSet[]>);

      // Create synthetic exercises for each group using real exercise data when available
      migratedWorkout.exercises = Object.entries(setsByExercise).map(([exerciseId, sets]) => {
        // Try to get real exercise data, fallback to placeholders
        const realExercise = getExerciseById(exerciseId);
        return {
          exercise: realExercise || {
            id: exerciseId,
            name: `Exercise ${exerciseId}`,
            category: 'core',
            muscleGroups: ['unknown'],
            isPlaceholder: true
          },
          sets: sets
        };
      });
    }

    // Case 3: Both formats have data
    // Ensure they are synchronized (prefer new format as source of truth)
    else if (migratedWorkout.exercises.length > 0 && migratedWorkout.sets.length > 0) {
      // Update legacy format to match new format
      migratedWorkout.sets = [...normalizedExerciseSets];
    }

    // Update totals based on current data
    const allSets = getAllSets(migratedWorkout);
    const completedSets = getCompletedSets(migratedWorkout);
    
    migratedWorkout.totalSets = completedSets.length;
    migratedWorkout.totalReps = completedSets.reduce((sum, set) => sum + (set.reps || 0), 0);
    migratedWorkout.totalWeight = completedSets.reduce((sum, set) => 
      sum + ((set.weight || 0) * (set.reps || 1)), 0);

    return migratedWorkout;
  } catch (error) {
    console.warn('Error during workout data migration:', error);
    // Return original workout if migration fails to prevent data corruption
    return workout;
  }
}

/**
 * Helper function to get the total number of exercises in a workout.
 * This counts unique exercises regardless of data format.
 * 
 * @param workout - The workout to count exercises from
 * @returns Number of unique exercises
 */
export function getExerciseCount(workout: Workout): number {
  // Try new format first
  if (workout.exercises && workout.exercises.length > 0) {
    return workout.exercises.length;
  }

  // Fall back to counting unique exercise IDs from legacy format
  if (workout.sets && workout.sets.length > 0) {
    const uniqueExerciseIds = new Set(workout.sets.map(set => set.exerciseId));
    return uniqueExerciseIds.size;
  }

  return 0;
}

/**
 * Helper function to get sets for a specific exercise ID from a workout.
 * 
 * @param workout - The workout to search
 * @param exerciseId - The ID of the exercise to get sets for
 * @param options - Optional filtering options
 * @returns Array of WorkoutSet objects for the specified exercise
 */
export function getSetsForExercise(
  workout: Workout, 
  exerciseId: string, 
  options: GetSetsOptions = {}
): WorkoutSet[] {
  const allSets = getAllSets(workout, options);
  return allSets.filter(set => set.exerciseId === exerciseId);
}
