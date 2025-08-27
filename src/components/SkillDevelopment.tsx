import React, { useState } from 'react';
import { Plus, Target, Trophy, TrendingUp, Edit2, Trash2, Star, CheckCircle } from 'lucide-react';
import { SkillTree, SkillMilestone } from '../types/skills';
import { LEGENDARY_SKILL_TREES } from '../data/legendarySkills';

const SkillDevelopment = ({ skills, saveSkill, deleteSkill, updateMilestone, getSkillStats, EXERCISE_DATABASE }) => {
  const [showCreateSkill, setShowCreateSkill] = useState(false);
  const [showCreateMilestone, setShowCreateMilestone] = useState<string | null>(null);
  const [editingSkill, setEditingSkill] = useState<SkillTree | null>(null);
  const [showLegendarySkills, setShowLegendarySkills] = useState(false);

  const stats = getSkillStats();

  const categories = [
    { id: 'strength', name: 'Strength', icon: '💪', color: '#EF4444' },
    { id: 'endurance', name: 'Endurance', icon: '🏃', color: '#10B981' },
    { id: 'flexibility', name: 'Flexibility', icon: '🧘', color: '#8B5CF6' },
    { id: 'consistency', name: 'Consistency', icon: '📈', color: '#F59E0B' },
    { id: 'custom', name: 'Custom', icon: '🎯', color: '#6B7280' }
  ];

  const units = [
    { id: 'reps', name: 'Reps', example: 'e.g., 100 push-ups' },
    { id: 'weight', name: 'Weight (kg)', example: 'e.g., 50kg bench press' },
    { id: 'time', name: 'Time (min)', example: 'e.g., 30 min plank' },
    { id: 'workouts', name: 'Workouts', example: 'e.g., 20 workouts' },
    { id: 'sets', name: 'Sets', example: 'e.g., 100 total sets' },
    { id: 'custom', name: 'Custom', example: 'Your own metric' }
  ];

  const [newSkill, setNewSkill] = useState({
    name: '',
    description: '',
    category: 'strength',
    icon: '💪',
    color: '#EF4444'
  });

  const [newMilestone, setNewMilestone] = useState({
    title: '',
    description: '',
    targetValue: 0,
    unit: 'reps',
    category: 'strength',
    exerciseId: ''
  });

  const createSkill = () => {
    if (!newSkill.name) return;

    const skill: SkillTree = {
      id: editingSkill?.id || Date.now().toString(),
      name: newSkill.name,
      description: newSkill.description,
      category: newSkill.category as any,
      icon: newSkill.icon,
      color: newSkill.color,
      milestones: editingSkill?.milestones || [],
      totalProgress: 0,
      createdDate: editingSkill?.createdDate || new Date().toISOString()
    };

    saveSkill(skill);
    setNewSkill({ name: '', description: '', category: 'strength', icon: '💪', color: '#EF4444' });
    setShowCreateSkill(false);
    setEditingSkill(null);
  };

  const createMilestone = (skillId: string) => {
    if (!newMilestone.title || !newMilestone.targetValue) return;

    const skill = skills.find(s => s.id === skillId);
    if (!skill) return;

    const milestone: SkillMilestone = {
      id: Date.now().toString(),
      title: newMilestone.title,
      description: newMilestone.description,
      targetValue: newMilestone.targetValue,
      currentValue: 0,
      unit: newMilestone.unit as any,
      exerciseId: newMilestone.exerciseId || undefined,
      completed: false,
      category: newMilestone.category as any
    };

    const updatedSkill = {
      ...skill,
      milestones: [...skill.milestones, milestone]
    };

    saveSkill(updatedSkill);
    setNewMilestone({ title: '', description: '', targetValue: 0, unit: 'reps', category: 'strength', exerciseId: '' });
    setShowCreateMilestone(null);
  };

  const addLegendarySkill = (legendarySkill: SkillTree) => {
    // Check if this legendary skill already exists
    const exists = skills.some(skill => skill.id === legendarySkill.id);
    if (exists) {
      alert('This legendary skill tree already exists!');
      return;
    }
    
    // Create a new instance with fresh timestamp
    const newSkill = {
      ...legendarySkill,
      createdDate: new Date().toISOString()
    };
    
    saveSkill(newSkill);
    setShowLegendarySkills(false);
  };
  const updateMilestoneProgress = (skillId: string, milestoneId: string, newValue: number) => {
    updateMilestone(skillId, milestoneId, { currentValue: newValue });
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 100) return 'bg-green-500';
    if (progress >= 75) return 'bg-blue-500';
    if (progress >= 50) return 'bg-yellow-500';
    return 'bg-gray-400';
  };

  if (showCreateSkill) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {editingSkill ? 'Edit Skill Tree' : 'Create New Skill Tree'}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Skill Name
              </label>
              <input
                type="text"
                value={newSkill.name}
                onChange={(e) => setNewSkill({ ...newSkill, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Push-up Master, Cardio Beast"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={newSkill.category}
                onChange={(e) => {
                  const category = categories.find(c => c.id === e.target.value);
                  setNewSkill({
                    ...newSkill,
                    category: e.target.value,
                    icon: category?.icon || '🎯',
                    color: category?.color || '#6B7280'
                  });
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.icon} {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={newSkill.description}
              onChange={(e) => setNewSkill({ ...newSkill, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="Describe what this skill tree represents..."
            />
          </div>

          <div className="flex space-x-3">
            <button
              onClick={createSkill}
              className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-6 rounded-lg transition-colors"
            >
              {editingSkill ? 'Update Skill' : 'Create Skill'}
            </button>
            <button
              onClick={() => {
                setShowCreateSkill(false);
                setEditingSkill(null);
                setNewSkill({ name: '', description: '', category: 'strength', icon: '💪', color: '#EF4444' });
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
          <h1 className="text-3xl font-bold text-gray-900">Skill Development</h1>
          <p className="text-gray-600 mt-2">Track your fitness milestones and achievements</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowCreateSkill(true)}
            className="flex items-center bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Skill Tree
          </button>
          <button
            onClick={() => setShowLegendarySkills(true)}
            className="flex items-center bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-medium py-2 px-4 rounded-lg transition-all transform hover:scale-105 shadow-lg"
          >
            <Trophy className="h-4 w-4 mr-2" />
            Legendary Skills
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-blue-500">
          <div className="flex items-center">
            <Target className="h-6 w-6 text-blue-600 mr-3" />
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.totalSkills}</p>
              <p className="text-sm text-gray-600">Skill Trees</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-green-500">
          <div className="flex items-center">
            <CheckCircle className="h-6 w-6 text-green-600 mr-3" />
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.completedMilestones}</p>
              <p className="text-sm text-gray-600">Achievements</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-yellow-500">
          <div className="flex items-center">
            <TrendingUp className="h-6 w-6 text-yellow-600 mr-3" />
            <div>
              <p className="text-2xl font-bold text-gray-900">{Math.round(stats.averageProgress)}%</p>
              <p className="text-sm text-gray-600">Avg Progress</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-purple-500">
          <div className="flex items-center">
            <Trophy className="h-6 w-6 text-purple-600 mr-3" />
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.totalMilestones}</p>
              <p className="text-sm text-gray-600">Total Milestones</p>
            </div>
          </div>
        </div>
      </div>

      {/* Skills Grid */}
      {skills.length > 0 ? (
        <div className="space-y-6">
          {skills.map(skill => (
            <div key={skill.id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center">
                  <div 
                    className="text-3xl mr-4 p-2 rounded-lg bg-opacity-20"
                    style={{ backgroundColor: skill.color }}
                  >
                    {skill.icon}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{skill.name}</h3>
                    <p className="text-gray-600">{skill.description}</p>
                    <div className="flex items-center mt-2">
                      <div className="w-32 h-2 bg-gray-200 rounded-full mr-3">
                        <div 
                          className={`h-2 rounded-full ${getProgressColor(skill.totalProgress)}`}
                          style={{ width: `${skill.totalProgress}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-600">
                        {Math.round(skill.totalProgress)}% Complete
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={() => setShowCreateMilestone(skill.id)}
                    className="text-green-600 hover:text-green-800 p-1"
                    title="Add Milestone"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => {
                      setEditingSkill(skill);
                      setNewSkill({
                        name: skill.name,
                        description: skill.description,
                        category: skill.category,
                        icon: skill.icon,
                        color: skill.color
                      });
                      setShowCreateSkill(true);
                    }}
                    className="text-blue-600 hover:text-blue-800 p-1"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => deleteSkill(skill.id)}
                    className="text-red-600 hover:text-red-800 p-1"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Milestones */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {skill.milestones.map(milestone => (
                  <div 
                    key={milestone.id} 
                    className={`p-4 rounded-lg border-2 transition-all ${
                      milestone.completed 
                        ? 'border-green-300 bg-green-50' 
                        : 'border-gray-200 bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold text-gray-900">{milestone.title}</h4>
                      {milestone.completed && (
                        <Star className="h-5 w-5 text-yellow-500" />
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{milestone.description}</p>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span className="font-medium">
                          {milestone.currentValue}/{milestone.targetValue} {milestone.unit}
                        </span>
                      </div>
                      
                      <div className="w-full h-2 bg-gray-200 rounded-full">
                        <div 
                          className={`h-2 rounded-full ${
                            milestone.completed ? 'bg-green-500' : 'bg-blue-500'
                          }`}
                          style={{ 
                            width: `${Math.min((milestone.currentValue / milestone.targetValue) * 100, 100)}%` 
                          }}
                        />
                      </div>

                      {!milestone.completed && (
                        <div className="mt-3">
                          <input
                            type="number"
                            value={milestone.currentValue}
                            onChange={(e) => updateMilestoneProgress(
                              skill.id, 
                              milestone.id, 
                              parseInt(e.target.value) || 0
                            )}
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                            placeholder="Update progress"
                          />
                        </div>
                      )}

                      {milestone.completed && milestone.completedDate && (
                        <p className="text-xs text-green-600 font-medium">
                          ✅ Completed {new Date(milestone.completedDate).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                ))}

                {/* Add Milestone Button */}
                <button
                  onClick={() => setShowCreateMilestone(skill.id)}
                  className="p-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-blue-400 hover:text-blue-600 transition-colors flex flex-col items-center justify-center min-h-[160px]"
                >
                  <Plus className="h-6 w-6 mb-2" />
                  <span className="text-sm font-medium">Add Milestone</span>
                </button>
              </div>

              {/* Create Milestone Form */}
              {showCreateMilestone === skill.id && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="font-semibold text-gray-900 mb-3">Create New Milestone</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Milestone Title
                      </label>
                      <input
                        type="text"
                        value={newMilestone.title}
                        onChange={(e) => setNewMilestone({ ...newMilestone, title: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., First 50 Push-ups"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Target Value
                      </label>
                      <input
                        type="number"
                        value={newMilestone.targetValue}
                        onChange={(e) => setNewMilestone({ ...newMilestone, targetValue: parseInt(e.target.value) || 0 })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="50"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Unit
                      </label>
                      <select
                        value={newMilestone.unit}
                        onChange={(e) => setNewMilestone({ ...newMilestone, unit: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {units.map(unit => (
                          <option key={unit.id} value={unit.id}>
                            {unit.name} - {unit.example}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Linked Exercise (Optional)
                      </label>
                      <select
                        value={newMilestone.exerciseId}
                        onChange={(e) => setNewMilestone({ ...newMilestone, exerciseId: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">None (Manual tracking)</option>
                        {EXERCISE_DATABASE.map(exercise => (
                          <option key={exercise.id} value={exercise.id}>
                            {exercise.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <input
                      type="text"
                      value={newMilestone.description}
                      onChange={(e) => setNewMilestone({ ...newMilestone, description: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Description of this milestone..."
                    />
                  </div>

                  <div className="flex space-x-3">
                    <button
                      onClick={() => createMilestone(skill.id)}
                      className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                    >
                      Create Milestone
                    </button>
                    <button
                      onClick={() => {
                        setShowCreateMilestone(null);
                        setNewMilestone({ title: '', description: '', targetValue: 0, unit: 'reps', category: 'strength', exerciseId: '' });
                      }}
                      className="bg-gray-300 hover:bg-gray-400 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="bg-white rounded-lg shadow-md p-8">
            <Target className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No skill trees yet</h3>
            <p className="text-gray-600 mb-6">Create your first skill tree to start tracking milestones</p>
            <button
              onClick={() => setShowCreateSkill(true)}
              className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-6 rounded-lg transition-colors"
            >
              Create Your First Skill Tree
            </button>
          </div>
        </div>
      )}

      {/* Legendary Skills Modal */}
      {showLegendarySkills && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
                    <Trophy className="h-6 w-6 mr-2 text-yellow-500" />
                    Legendary Pokémon Skill Trees
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">
                    Channel the power of legendary Pokémon in your fitness journey
                  </p>
                </div>
                <button
                  onClick={() => setShowLegendarySkills(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <Plus className="h-6 w-6 rotate-45" />
                </button>
              </div>
            </div>

            <div className="overflow-y-auto max-h-96 p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {LEGENDARY_SKILL_TREES.map(legendarySkill => {
                  const alreadyAdded = skills.some(skill => skill.id === legendarySkill.id);
                  
                  return (
                    <div
                      key={legendarySkill.id}
                      className={`relative p-6 rounded-xl border-2 transition-all duration-300 ${
                        alreadyAdded 
                          ? 'border-green-300 bg-green-50 dark:bg-green-900/20' 
                          : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-purple-300 hover:shadow-lg transform hover:scale-105'
                      }`}
                    >
                      {/* Legendary Badge */}
                      <div className="absolute -top-2 -right-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
                        LEGENDARY
                      </div>

                      <div className="flex items-start mb-4">
                        <div 
                          className="text-4xl mr-4 p-3 rounded-xl bg-opacity-20 shadow-inner"
                          style={{ backgroundColor: legendarySkill.color }}
                        >
                          {legendarySkill.icon}
                        </div>
                        <div className="flex-1">
                          <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                            {legendarySkill.name}
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                            {legendarySkill.description}
                          </p>
                          <div className="flex items-center text-xs text-gray-500 dark:text-gray-500">
                            <Target className="h-3 w-3 mr-1" />
                            {legendarySkill.milestones.length} Epic Milestones
                          </div>
                        </div>
                      </div>

                      {/* Milestone Preview */}
                      <div className="space-y-2 mb-4">
                        {legendarySkill.milestones.slice(0, 2).map(milestone => (
                          <div key={milestone.id} className="flex items-center text-sm">
                            <Star className="h-3 w-3 mr-2 text-yellow-500" />
                            <span className="text-gray-700 dark:text-gray-300">{milestone.title}</span>
                          </div>
                        ))}
                        {legendarySkill.milestones.length > 2 && (
                          <div className="text-xs text-gray-500 dark:text-gray-500 ml-5">
                            +{legendarySkill.milestones.length - 2} more legendary challenges...
                          </div>
                        )}
                      </div>

                      {/* Action Button */}
                      {alreadyAdded ? (
                        <div className="flex items-center justify-center py-2 text-green-600 dark:text-green-400 font-medium">
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Already Added
                        </div>
                      ) : (
                        <button
                          onClick={() => addLegendarySkill(legendarySkill)}
                          className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-md"
                        >
                          Add Legendary Skill
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recent Achievements */}
      {stats.recentAchievements.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Trophy className="h-5 w-5 mr-2 text-yellow-600" />
            Recent Achievements
          </h3>
          <div className="space-y-3">
            {stats.recentAchievements.map(achievement => (
              <div key={achievement.id} className="flex items-center p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                <Star className="h-5 w-5 text-yellow-500 mr-3" />
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{achievement.title}</h4>
                  <p className="text-sm text-gray-600">{achievement.description}</p>
                </div>
                <div className="text-sm text-yellow-600 font-medium">
                  {achievement.completedDate && new Date(achievement.completedDate).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SkillDevelopment;