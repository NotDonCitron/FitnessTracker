import { useState, useEffect } from 'react';
import { SkillTree, SkillMilestone, SkillStats } from '../types/skills';
import { storage } from '../utils/storage';
import { getAllSets, getCompletedSetCount } from '../utils/workoutHelpers';

export const useSkills = (onMilestoneReward?: (milestoneName: string) => void, onMilestoneComplete?: (milestone: any) => void) => {
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

  // Helper functions to reduce complexity
  const calculateWorkoutCount = (workouts: any[]) => {
    return workouts.filter(w => w.completed).length;
  };

  const calculateSetCount = (workouts: any[]) => {
    return workouts.reduce((total, w) => total + getCompletedSetCount(w), 0);
  };

  const calculateRepCount = (workouts: any[], exerciseId: string) => {
    return workouts.reduce((total, w) => {
      const exerciseSets = getAllSets(w, {completedOnly: true}).filter(s => s.exerciseId === exerciseId);
      return total + exerciseSets.reduce((sum: number, s: any) => sum + s.reps, 0);
    }, 0);
  };

  const calculateMaxWeight = (workouts: any[], exerciseId: string) => {
    const exerciseSets = workouts.flatMap((w: any) =>
      getAllSets(w, {completedOnly: true}).filter(s => s.exerciseId === exerciseId)
    );
    return exerciseSets.length > 0 ? Math.max(...exerciseSets.map((s: any) => s.weight)) : 0;
  };

  const triggerMilestoneReward = (milestone: SkillMilestone) => {
    if (onMilestoneReward) {
      setTimeout(() => onMilestoneReward(`${milestone.title}: ${milestone.targetValue} ${milestone.unit}`), 1000);
    }
  };

  const showNotification = (milestone: SkillMilestone) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('🎉 Milestone Achieved!', {
        body: `${milestone.title} - ${milestone.description}`,
        icon: '/icon-192.png'
      });
    }
  };

  const updateSkillProgress = (skill: SkillTree) => {
    const completedCount = skill.milestones.filter(m => m.completed).length;
    skill.totalProgress = skill.milestones.length > 0
      ? (completedCount / skill.milestones.length) * 100
      : 0;
  };

  const autoUpdateMilestones = () => {
    const workouts = storage.getWorkouts();
    const updatedSkills = [...skills];
    let hasUpdates = false;

    updatedSkills.forEach(skill => {
      skill.milestones.forEach(milestone => {
        if (!milestone.completed) {
          let newValue = milestone.currentValue;

          // Calculate new value based on milestone unit
          switch (milestone.unit) {
            case 'workouts':
              newValue = calculateWorkoutCount(workouts);
              break;
            case 'sets':
              newValue = calculateSetCount(workouts);
              break;
            case 'reps':
              if (milestone.exerciseId) {
                newValue = calculateRepCount(workouts, milestone.exerciseId);
              }
              break;
            case 'weight':
              if (milestone.exerciseId) {
                newValue = calculateMaxWeight(workouts, milestone.exerciseId);
              }
              break;
          }

          // Update milestone if value changed
          if (newValue !== milestone.currentValue) {
            milestone.currentValue = newValue;
            hasUpdates = true;

            // Check if milestone is completed
            if (newValue >= milestone.targetValue && !milestone.completed) {
              milestone.completed = true;
              milestone.completedDate = new Date().toISOString();

              triggerMilestoneReward(milestone);
              showNotification(milestone);
              
              // Call the milestone completion callback
              if (onMilestoneComplete) {
                onMilestoneComplete(milestone);
              }
            }
          }
        }
      });

      updateSkillProgress(skill);
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
