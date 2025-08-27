import { useState, useEffect } from 'react';
import { SkillTree, SkillMilestone, SkillStats } from '../types/skills';
import { storage } from '../utils/storage';

export const useSkills = (onMilestoneReward?: () => void) => {
  const [skills, setSkills] = useState<SkillTree[]>([]);

  useEffect(() => {
    loadSkills();
  }, []);

  const loadSkills = () => {
    try {
      setSkills(storage.getSkills());
    } catch (error) {
      console.error('Error loading skills:', error);
    }
  };

  const saveSkill = (skill: SkillTree) => {
    try {
      storage.saveSkill(skill);
      setSkills(storage.getSkills());
    } catch (error) {
      console.error('Error saving skill:', error);
    }
  };

  const deleteSkill = (id: string) => {
    try {
      storage.deleteSkill(id);
      setSkills(storage.getSkills());
    } catch (error) {
      console.error('Error deleting skill:', error);
    }
  };

  const updateMilestone = (skillId: string, milestoneId: string, updates: Partial<SkillMilestone>) => {
    try {
      storage.updateMilestone(skillId, milestoneId, updates);
      setSkills(storage.getSkills());
    } catch (error) {
      console.error('Error updating milestone:', error);
    }
  };

  const autoUpdateMilestones = () => {
    // This function will be called after workouts to auto-detect achievements
    const workouts = storage.getWorkouts();
    const updatedSkills = [...skills];
    let hasUpdates = false;

    updatedSkills.forEach(skill => {
      skill.milestones.forEach(milestone => {
        if (!milestone.completed) {
          let newValue = milestone.currentValue;

          switch (milestone.unit) {
            case 'workouts':
              newValue = workouts.filter(w => w.completed).length;
              break;
            case 'sets':
              newValue = workouts.reduce((total, w) => total + w.sets.filter(s => s.completed).length, 0);
              break;
            case 'reps':
              if (milestone.exerciseId) {
                newValue = workouts.reduce((total, w) => {
                  return total + w.sets
                    .filter(s => s.exerciseId === milestone.exerciseId && s.completed)
                    .reduce((sum, s) => sum + s.reps, 0);
                }, 0);
              }
              break;
            case 'weight':
              if (milestone.exerciseId) {
                const exerciseSets = workouts.flatMap(w => 
                  w.sets.filter(s => s.exerciseId === milestone.exerciseId && s.completed)
                );
                if (exerciseSets.length > 0) {
                  newValue = Math.max(...exerciseSets.map(s => s.weight));
                }
              }
              break;
          }

          if (newValue !== milestone.currentValue) {
            milestone.currentValue = newValue;
            hasUpdates = true;

            if (newValue >= milestone.targetValue && !milestone.completed) {
              milestone.completed = true;
              milestone.completedDate = new Date().toISOString();
              
              // Trigger Pokemon reward for milestone
              if (onMilestoneReward) {
                setTimeout(() => onMilestoneReward(), 1000);
              }
              
              // Show notification for achievement
              if ('Notification' in window && Notification.permission === 'granted') {
                new Notification('🎉 Milestone Achieved!', {
                  body: `${milestone.title} - ${milestone.description}`,
                  icon: '/icon-192.png'
                });
              }
            }
          }
        }
      });

      // Update skill progress
      const completedCount = skill.milestones.filter(m => m.completed).length;
      skill.totalProgress = skill.milestones.length > 0 
        ? (completedCount / skill.milestones.length) * 100 
        : 0;
    });

    if (hasUpdates) {
      updatedSkills.forEach(skill => storage.saveSkill(skill));
      setSkills(updatedSkills);
    }
  };

  const getSkillStats = (): SkillStats => {
    const totalMilestones = skills.reduce((sum, skill) => sum + skill.milestones.length, 0);
    const completedMilestones = skills.reduce((sum, skill) => 
      sum + skill.milestones.filter(m => m.completed).length, 0
    );
    
    const recentAchievements = skills
      .flatMap(skill => skill.milestones.filter(m => m.completed && m.completedDate))
      .sort((a, b) => new Date(b.completedDate!).getTime() - new Date(a.completedDate!).getTime())
      .slice(0, 5);

    return {
      totalSkills: skills.length,
      completedMilestones,
      totalMilestones,
      averageProgress: skills.length > 0 
        ? skills.reduce((sum, skill) => sum + skill.totalProgress, 0) / skills.length 
        : 0,
      recentAchievements
    };
  };

  return {
    skills,
    saveSkill,
    deleteSkill,
    updateMilestone,
    autoUpdateMilestones,
    getSkillStats,
    refreshSkills: loadSkills
  };
};