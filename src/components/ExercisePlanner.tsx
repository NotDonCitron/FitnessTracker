import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Play, Clock, Dumbbell, Target } from 'lucide-react';
import { WorkoutPlan } from '../types/workout';
import { getExerciseById, EXERCISE_DATABASE } from '../utils/exercises';

const ExercisePlanner = ({ plans, savePlan, deletePlan, saveWorkout, setActiveWorkout }) => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingPlan, setEditingPlan] = useState<WorkoutPlan | null>(null);
  const [newPlan, setNewPlan] = useState<Partial<WorkoutPlan>>({
    name: '',
    description: '',
    exercises: []
  });

  const startWorkoutFromPlan = (plan: WorkoutPlan) => {
    // Create a new workout from the plan with proper structure
    const workout: Workout = {
      id: Date.now().toString(),
      name: plan.name,
      date: new Date().toISOString(),
      duration: 0,
      exercises: plan.exercises.map(planEx => ({
        exercise: getExerciseById(planEx.exerciseId)!,
        sets: [],
        planData: planEx // Store the original plan data for reference
      })),
      sets: plan.exercises.flatMap(planEx => 
        Array.from({ length: planEx.sets }, (_, setIndex) => ({
          id: `${Date.now()}-${planEx.exerciseId}-${setIndex}-${Math.random()}`,
          setNumber: setIndex + 1,
          exerciseId: planEx.exerciseId,
          reps: planEx.reps,
          weight: planEx.weight || 0,
          rest: planEx.rest,
          completed: false
        }))
      ),
      totalSets: 0,
      totalReps: 0,
      totalWeight: 0,
      completed: false,
      planData: plan.exercises // Store plan data at workout level
    };
    
    // Save the workout and switch to workout tab
    saveWorkout(workout);
    setActiveWorkout(workout);
    
    // Trigger tab change event
    const event = new CustomEvent('changeTab', { detail: { tab: 'workout' } });
    window.dispatchEvent(event);
  };

  const createNewPlan = () => {
    if (!newPlan.name || !newPlan.exercises?.length) return;

    const plan: WorkoutPlan = {
      id: editingPlan?.id || Date.now().toString(),
      name: newPlan.name,
      description: newPlan.description || '',
      exercises: newPlan.exercises,
      estimatedDuration: calculateEstimatedDuration(newPlan.exercises)
    };

    savePlan(plan);
    setNewPlan({ name: '', description: '', exercises: [] });
    setShowCreateForm(false);
    setEditingPlan(null);
  };

  const calculateEstimatedDuration = (exercises: WorkoutPlan['exercises']) => {
    // Rough estimation: 3 minutes per set (including rest)
    const totalSets = exercises.reduce((sum, ex) => sum + ex.sets, 0);
    return Math.round(totalSets * 3);
  };

  const addExerciseToPlan = (exerciseId: string) => {
    const exercise = {
      exerciseId,
      sets: 3,
      reps: 10,
      weight: 0,
      rest: 60
    };

    setNewPlan(prev => ({
      ...prev,
      exercises: [...(prev.exercises || []), exercise]
    }));
  };

  const removeExerciseFromPlan = (index: number) => {
    setNewPlan(prev => ({
      ...prev,
      exercises: prev.exercises?.filter((_, i) => i !== index) || []
    }));
  };

  const updatePlanExercise = (index: number, updates: Partial<WorkoutPlan['exercises'][0]>) => {
    setNewPlan(prev => ({
      ...prev,
      exercises: prev.exercises?.map((ex, i) => 
        i === index ? { ...ex, ...updates } : ex
      ) || []
    }));
  };

  const startEditingPlan = (plan: WorkoutPlan) => {
    setEditingPlan(plan);
    setNewPlan({
      name: plan.name,
      description: plan.description,
      exercises: [...plan.exercises]
    });
    setShowCreateForm(true);
  };

  const categories = ['chest', 'back', 'legs', 'shoulders', 'arms', 'core', 'cardio'];
  const [selectedCategory, setSelectedCategory] = useState('chest');

  if (showCreateForm) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {editingPlan ? 'Edit Workout Plan' : 'Create New Workout Plan'}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Plan Name
              </label>
              <input
                type="text"
                value={newPlan.name || ''}
                onChange={(e) => setNewPlan(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Push Day, Full Body Workout"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <input
                type="text"
                value={newPlan.description || ''}
                onChange={(e) => setNewPlan(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Brief description of the workout"
              />
            </div>
          </div>

          {/* Exercise Categories */}
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Add Exercises</h3>
            <div className="flex flex-wrap gap-2 mb-4">
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    selectedCategory === category
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-6">
              {EXERCISE_DATABASE
                .filter(ex => ex.category === selectedCategory)
                .map(exercise => (
                  <button
                    key={exercise.id}
                    onClick={() => addExerciseToPlan(exercise.id)}
                    className="text-left p-3 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors"
                  >
                    <div className="font-medium text-gray-900">{exercise.name}</div>
                    <div className="text-sm text-gray-600">
                      {exercise.muscleGroups.join(', ')}
                    </div>
                  </button>
                ))}
            </div>
          </div>

          {/* Selected Exercises */}
          {newPlan.exercises && newPlan.exercises.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Plan Exercises</h3>
              <div className="space-y-4">
                {newPlan.exercises.map((planEx, index) => {
                  const exercise = getExerciseById(planEx.exerciseId);
                  if (!exercise) return null;

                  return (
                    <div key={index} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-medium text-gray-900">{exercise.name}</h4>
                          <p className="text-sm text-gray-600">
                            {exercise.muscleGroups.join(', ')}
                          </p>
                        </div>
                        <button
                          onClick={() => removeExerciseFromPlan(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Sets
                          </label>
                          <input
                            type="number"
                            value={planEx.sets}
                            onChange={(e) => updatePlanExercise(index, { sets: parseInt(e.target.value) || 1 })}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                            min="1"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Reps
                          </label>
                          <input
                            type="number"
                            value={planEx.reps}
                            onChange={(e) => updatePlanExercise(index, { reps: parseInt(e.target.value) || 1 })}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                            min="1"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Weight (kg)
                          </label>
                          <input
                            type="number"
                            value={planEx.weight || ''}
                            onChange={(e) => updatePlanExercise(index, { weight: parseInt(e.target.value) || 0 })}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                            min="0"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Rest (sec)
                          </label>
                          <input
                            type="number"
                            value={planEx.rest}
                            onChange={(e) => updatePlanExercise(index, { rest: parseInt(e.target.value) || 30 })}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                            min="0"
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="flex space-x-3">
            <button
              onClick={createNewPlan}
              className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-6 rounded-lg transition-colors"
            >
              {editingPlan ? 'Update Plan' : 'Create Plan'}
            </button>
            <button
              onClick={() => {
                setShowCreateForm(false);
                setEditingPlan(null);
                setNewPlan({ name: '', description: '', exercises: [] });
              }}
              className="bg-gray-300 hover:bg-gray-400 text-gray-700 font-medium py-2 px-6 rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Workout Plans</h1>
          <p className="text-gray-600 mt-2">Create and manage your workout routines</p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="flex items-center bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Plan
        </button>
      </div>

      {/* Plans Grid */}
      {plans.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div key={plan.id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{plan.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">{plan.description}</p>
                </div>
                <div className="flex space-x-1">
                  <button
                    onClick={() => startEditingPlan(plan)}
                    className="text-blue-500 hover:text-blue-700 p-1"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => deletePlan(plan.id)}
                    className="text-red-500 hover:text-red-700 p-1"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex items-center text-sm text-gray-600">
                  <Dumbbell className="h-4 w-4 mr-2" />
                  {plan.exercises.length} exercises
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Clock className="h-4 w-4 mr-2" />
                  ~{plan.estimatedDuration} minutes
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Target className="h-4 w-4 mr-2" />
                  {plan.exercises.reduce((sum, ex) => sum + ex.sets, 0)} total sets
                </div>
              </div>

              <button onClick={() => startWorkoutFromPlan(plan)} className="w-full bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center">
                <Play className="h-4 w-4 mr-2" />
                Start Workout
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="bg-white rounded-lg shadow-md p-8">
            <Dumbbell className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No workout plans yet</h3>
            <p className="text-gray-600 mb-6">Create your first workout plan to get started</p>
            <button
              onClick={() => setShowCreateForm(true)}
              className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-6 rounded-lg transition-colors"
            >
              Create Your First Plan
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExercisePlanner;