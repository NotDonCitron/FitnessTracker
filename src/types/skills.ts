export interface SkillMilestone {
  id: string;
  title: string;
  description: string;
  targetValue: number;
  currentValue: number;
  unit: 'reps' | 'weight' | 'time' | 'workouts' | 'sets' | 'custom';
  exerciseId?: string; // Optional: link to specific exercise
  completed: boolean;
  completedDate?: string;
  category: 'strength' | 'endurance' | 'flexibility' | 'consistency' | 'custom';
}

export interface SkillTree {
  id: string;
  name: string;
  description: string;
  category: 'strength' | 'endurance' | 'flexibility' | 'consistency' | 'custom';
  icon: string;
  color: string;
  milestones: SkillMilestone[];
  totalProgress: number; // Percentage of completed milestones
  createdDate: string;
}

export interface SkillStats {
  totalSkills: number;
  completedMilestones: number;
  totalMilestones: number;
  averageProgress: number;
  recentAchievements: SkillMilestone[];
}