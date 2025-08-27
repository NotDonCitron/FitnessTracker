import React, { useState, useEffect } from 'react';
import { Play, Pause, Square, Plus, Minus, Clock, Target, Trash2 } from 'lucide-react';
import { Exercise, WorkoutSet, Workout } from '../types/workout';
import { EXERCISE_DATABASE } from '../utils/exercises';
import Timer from './Timer';

interface WorkoutTrackerProps {
  workouts: Workout[];
  saveWorkout: (workout: Workout) => void;
  activeWorkout: Workout | null;
  setActiveWorkout: (workout: Workout | null) => void;
}

const WorkoutTracker: React.FC<WorkoutTrackerProps> = ({
  workouts,
  saveWorkout,
  activeWorkout,
  setActiveWorkout
}) => {
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [currentSet, setCurrentSet] = useState(1);
  const [weight, setWeight] = useState('');
  const [reps, setReps] = useState('');
  const [duration, setDuration] = useState('');
  const [restTimer, setRestTimer] = useState(0);
  const [isResting, setIsResting] = useState(false);

  // Get previous workout data for the selected exercise
  const getPreviousExerciseData = (exerciseId: string) => {
    const completedWorkouts = workouts.filter(w => w.completed);
    
    // Find the most recent workout that included this exercise
    for (let i = completedWorkouts.length - 1; i >= 0; i--) {
      const workout = completedWorkouts[i];
      
      // Check in exercises array (new format)
      if (workout.exercises) {
        const exerciseData = workout.exercises.find(ex => ex.exercise.id === exerciseId);
        if (exerciseData && exerciseData.sets.length > 0) {
          const lastSet = exerciseData.sets[exerciseData.sets.length - 1];
          return {
            weight: lastSet.weight || 0,
            reps: lastSet.reps || 0,
            sets: exerciseData.sets.length,
            date: workout.date
          };
        }
      }
      
      // Check in sets array (legacy format)
      if (workout.sets) {
        const exerciseSets = workout.sets.filter(set => set.exerciseId === exerciseId && set.completed);
        if (exerciseSets.length > 0) {
          const lastSet = exerciseSets[exerciseSets.length - 1];
          return {
            weight: lastSet.weight || 0,
            reps: lastSet.reps || 0,
            sets: exerciseSets.length,
            date: workout.date
          };
        }
      }
    }
    
    return null;
  };

  const startNewWorkout = () => {
    const newWorkout: Workout = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      exercises: [],
      duration: 0,
      totalSets: 0,
      totalReps: 0,
      totalWeight: 0,
      notes: ''
    };
    setActiveWorkout(newWorkout);
  };

  const addExerciseToWorkout = (exercise: Exercise) => {
    if (!activeWorkout) return;

    const updatedWorkout = {
      ...activeWorkout,
      exercises: [...activeWorkout.exercises, {
        exercise,
        sets: []
      }]
    };
    setActiveWorkout(updatedWorkout);
    setSelectedExercise(exercise);
    setCurrentSet(1);
    // Values will be auto-filled by useEffect
  };

  const selectExerciseFromDatabase = (exercise: Exercise) => {
    addExerciseToWorkout(exercise);
  };

  // Auto-fill previous values when selecting an exercise
  useEffect(() => {
    if (selectedExercise) {
      const previousData = getPreviousExerciseData(selectedExercise.id);
      if (previousData) {
        setWeight(previousData.weight.toString());
        setReps(previousData.reps.toString());
      } else {
        setWeight('');
        setReps('');
      }
      setDuration('');
    }
  }, [selectedExercise]);

  const addSet = () => {
    if (!activeWorkout || !selectedExercise) return;

    const newSet: WorkoutSet = {
      setNumber: currentSet,
      weight: weight ? parseFloat(weight) : undefined,
      reps: reps ? parseInt(reps) : undefined,
      duration: duration ? parseInt(duration) : undefined,
      completed: true
    };

    const updatedWorkout = {
      ...activeWorkout,
      exercises: activeWorkout.exercises.map(ex => 
        ex.exercise.id === selectedExercise.id
          ? { ...ex, sets: [...ex.sets, newSet] }
          : ex
      )
    };

    setActiveWorkout(updatedWorkout);
    setCurrentSet(currentSet + 1);
    
    // Keep the same values for the next set (common in strength training)
    // User can adjust if needed
    setDuration('');

    // Start rest timer
    setRestTimer(90); // 90 seconds default rest
    setIsResting(true);
  };

  const removeSet = (exerciseId: string, setIndex: number) => {
    if (!activeWorkout) return;

    const updatedWorkout = {
      ...activeWorkout,
      exercises: activeWorkout.exercises.map(ex => 
        ex.exercise.id === exerciseId
          ? { ...ex, sets: ex.sets.filter((_, index) => index !== setIndex) }
          : ex
      )
    };

    setActiveWorkout(updatedWorkout);
  };

  const finishWorkout = () => {
    if (!activeWorkout) return;

    console.log('🏁 [DEBUG] Finishing workout:', activeWorkout.id);
    
    const totalSets = activeWorkout.exercises.reduce((sum, ex) => sum + ex.sets.length, 0);
    const totalReps = activeWorkout.exercises.reduce((sum, ex) => 
      sum + ex.sets.reduce((setSum, set) => setSum + (set.reps || 0), 0), 0);
    const totalWeight = activeWorkout.exercises.reduce((sum, ex) => 
      sum + ex.sets.reduce((setSum, set) => setSum + ((set.weight || 0) * (set.reps || 1)), 0), 0);

    const finishedWorkout = {
      ...activeWorkout,
      completed: true,
      totalSets,
      totalReps,
      totalWeight,
      duration: Math.floor((Date.now() - new Date(activeWorkout.date).getTime()) / 1000 / 60)
    };

    console.log('💾 [DEBUG] Saving finished workout with completed=true:', finishedWorkout);
    saveWorkout(finishedWorkout);
    console.log('🧹 [DEBUG] Cleaning up workout state...');
    setActiveWorkout(null);
    setSelectedExercise(null);
    setCurrentSet(1);
    setWeight('');
    setReps('');
    setDuration('');
    console.log('✅ [DEBUG] Workout finish process completed');
  };

  const cancelWorkout = () => {
    setActiveWorkout(null);
    setSelectedExercise(null);
    setCurrentSet(1);
    setWeight('');
    setReps('');
    setDuration('');
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isResting && restTimer > 0) {
      interval = setInterval(() => {
        setRestTimer(prev => {
          if (prev <= 1) {
            setIsResting(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isResting, restTimer]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!activeWorkout) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Ready to Train?</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">Start a new workout to begin tracking your exercises</p>
          <button
            onClick={startNewWorkout}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium transition-colors"
          >
            <Play className="h-5 w-5 inline mr-2" />
            Start New Workout
          </button>
        </div>

        {workouts.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Workouts</h3>
            <div className="space-y-3">
              {workouts.slice(0, 5).map((workout) => (
                <div key={workout.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {new Date(workout.date).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {workout.exercises.length} exercises • {workout.totalSets} sets • {workout.duration} min
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
                      {workout.totalWeight}kg total
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Workout Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Active Workout</h2>
          <div className="flex space-x-2">
            <button
              onClick={finishWorkout}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              <Square className="h-4 w-4 inline mr-2" />
              Finish
            </button>
            <button
              onClick={cancelWorkout}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {activeWorkout.exercises.length}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-300">Exercises</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              {activeWorkout.exercises.reduce((sum, ex) => sum + ex.sets.length, 0)}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-300">Sets Completed</p>
          </div>
          <div className="text-center">
            <Timer startTime={new Date(activeWorkout.date)} />
          </div>
        </div>
      </div>

      {/* Rest Timer */}
      {isResting && (
        <div className="bg-orange-100 dark:bg-orange-900 border border-orange-200 dark:border-orange-700 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Clock className="h-5 w-5 text-orange-600 dark:text-orange-400 mr-2" />
              <span className="font-medium text-orange-800 dark:text-orange-200">Rest Time</span>
            </div>
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              {formatTime(restTimer)}
            </div>
          </div>
        </div>
      )}

      {/* Exercise Selection */}
      {!selectedExercise && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {activeWorkout.exercises.length > 0 ? 'Select Exercise from Plan' : 'Add Exercise'}
          </h3>
          
          {/* Show exercises from the workout plan first */}
          {activeWorkout.exercises.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {activeWorkout.exercises.map((exerciseData, index) => {
                const previousData = getPreviousExerciseData(exerciseData.exercise.id);
                return (
                  <button
                    key={index}
                    onClick={() => setSelectedExercise(exerciseData.exercise)}
                    className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:border-blue-500 dark:hover:border-blue-400 transition-colors text-left"
                  >
                    <div className="flex items-center mb-2">
                      <span className="text-2xl mr-3">{exerciseData.exercise.icon}</span>
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">{exerciseData.exercise.name}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-300">{exerciseData.exercise.category}</p>
                      </div>
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {exerciseData.sets.length > 0 ? `${exerciseData.sets.length} sets completed` : 'No sets yet'}
                      {previousData && (
                        <div className="mt-1 text-xs text-blue-600 dark:text-blue-400">
                          Last: {previousData.weight}kg × {previousData.reps} reps ({new Date(previousData.date).toLocaleDateString()})
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            /* Show all exercises if no plan is active */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {EXERCISE_DATABASE.map((exercise) => {
                const previousData = getPreviousExerciseData(exercise.id);
                return (
                  <button
                    key={exercise.id}
                    onClick={() => selectExerciseFromDatabase(exercise)}
                    className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:border-blue-500 dark:hover:border-blue-400 transition-colors text-left"
                  >
                    <div className="flex items-center mb-2">
                      <span className="text-2xl mr-3">{exercise.icon}</span>
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">{exercise.name}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-300">{exercise.category}</p>
                      </div>
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      <p>{exercise.muscleGroups?.join(', ')}</p>
                      {previousData && (
                        <div className="mt-1 text-xs text-blue-600 dark:text-blue-400">
                          Last: {previousData.weight}kg × {previousData.reps} reps ({new Date(previousData.date).toLocaleDateString()})
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
          
          {/* Option to add more exercises even when using a plan */}
          {activeWorkout.exercises.length > 0 && (
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
              <h4 className="text-md font-medium text-gray-700 dark:text-gray-300 mb-3">Add More Exercises</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {EXERCISE_DATABASE.map((exercise) => {
                  const previousData = getPreviousExerciseData(exercise.id);
                  return (
                    <button
                      key={exercise.id}
                      onClick={() => addExerciseToWorkout(exercise)}
                      className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:border-blue-500 dark:hover:border-blue-400 transition-colors text-left"
                    >
                      <div className="flex items-center mb-2">
                        <span className="text-2xl mr-3">{exercise.icon}</span>
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white">{exercise.name}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-300">{exercise.category}</p>
                        </div>
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        <p>{exercise.muscleGroups?.join(', ')}</p>
                        {previousData && (
                          <div className="mt-1 text-xs text-blue-600 dark:text-blue-400">
                            Last: {previousData.weight}kg × {previousData.reps} reps ({new Date(previousData.date).toLocaleDateString()})
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Current Exercise */}
      {selectedExercise && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <span className="text-3xl mr-3">{selectedExercise.icon}</span>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{selectedExercise.name}</h3>
                <p className="text-gray-600 dark:text-gray-300">{selectedExercise.category}</p>
                {(() => {
                  const previousData = getPreviousExerciseData(selectedExercise.id);
                  return previousData && (
                    <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                      Previous: {previousData.weight}kg × {previousData.reps} reps ({previousData.sets} sets) - {new Date(previousData.date).toLocaleDateString()}
                    </p>
                  );
                })()}
              </div>
            </div>
            <button
              onClick={() => setSelectedExercise(null)}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <Target className="h-5 w-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Weight (kg)
              </label>
              <input
                type="number"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Reps
              </label>
              <input
                type="number"
                value={reps}
                onChange={(e) => setReps(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Duration (sec)
              </label>
              <input
                type="number"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="0"
              />
            </div>
          </div>

          <button
            onClick={addSet}
            disabled={!weight && !reps && !duration}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-3 rounded-lg font-medium transition-colors"
          >
            <Plus className="h-5 w-5 inline mr-2" />
            Add Set {currentSet}
          </button>
        </div>
      )}

      {/* Exercise History */}
      {activeWorkout.exercises.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Workout Summary</h3>
          <div className="space-y-4">
            {activeWorkout.exercises.map((exerciseData, index) => (
              <div key={index} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    <span className="text-2xl mr-3">{exerciseData.exercise.icon}</span>
                    <h4 className="font-medium text-gray-900 dark:text-white">{exerciseData.exercise.name}</h4>
                  </div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {exerciseData.sets.length} sets
                  </span>
                </div>
                <div className="space-y-2">
                  {exerciseData.sets.map((set, setIndex) => (
                    <div key={setIndex} className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 p-2 rounded">
                      <span className="text-sm text-gray-600 dark:text-gray-300">
                        Set {set.setNumber}: {set.weight ? `${set.weight}kg` : ''} {set.reps ? `× ${set.reps}` : ''} {set.duration ? `${set.duration}s` : ''}
                      </span>
                      <button
                        onClick={() => removeSet(exerciseData.exercise.id, setIndex)}
                        className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkoutTracker;