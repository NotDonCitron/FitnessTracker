import { useState, useEffect } from 'react';
+import { Achievement, Badge, ACHIEVEMENT_DEFINITIONS } from '../types/achievements';
+import { storage } from '../utils/storage';

+export const useAchievements = () => {
+  const [unlockedAchievements, setUnlockedAchievements] = useState<Achievement[]>([]);
+  const [badges, setBadges] = useState<Badge[]>([]);

+  useEffect(() => {
+    loadAchievements();
+  }, []);

+  const loadAchievements = () => {
+    const stored = localStorage.getItem('achievements');
+    if (stored) {
+      setUnlockedAchievements(JSON.parse(stored));
+    }
+    
+    const storedBadges = localStorage.getItem('badges');
+    if (storedBadges) {
+      setBadges(JSON.parse(storedBadges));
+    }
+  };

+  const checkAchievements = () => {
+    const workouts = storage.getWorkouts().filter(w => w.completed);
+    const stats = storage.getStats();
+    const newAchievements: Achievement[] = [];

+    ACHIEVEMENT_DEFINITIONS.forEach(achievement => {
+      // Skip if already unlocked
+      if (unlockedAchievements.some(a => a.id === achievement.id)) return;

+      let isUnlocked = false;
+      let progress = 0;

+      switch (achievement.requirement.type) {
+        case 'workout_count':
+          progress = workouts.length;
+          isUnlocked = progress >= achievement.requirement.value;
+          break;
+          
+        case 'total_time':
+          progress = stats.totalDuration;
+          isUnlocked = progress >= achievement.requirement.value;
+          break;
+          
+        case 'exercise_weight':
+          if (achievement.requirement.exerciseId) {
+            const exerciseSets = workouts
+              .flatMap(w => w.sets.filter(s => 
+                s.exerciseId === achievement.requirement.exerciseId && s.completed
+              ));
+            progress = exerciseSets.length > 0 ? Math.max(...exerciseSets.map(s => s.weight)) : 0;
+            isUnlocked = progress >= achievement.requirement.value;
+          }
+          break;
+          
+        case 'streak_days':
+          // Calculate current streak
+          const sortedWorkouts = workouts
+            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
+          
+          let streak = 0;
+          let currentDate = new Date();
+          currentDate.setHours(0, 0, 0, 0);
+          
+          for (let i = 0; i < 365; i++) {
+            const hasWorkout = sortedWorkouts.some(w => {
+              const workoutDate = new Date(w.date);
+              workoutDate.setHours(0, 0, 0, 0);
+              return workoutDate.getTime() === currentDate.getTime();
+            });
+            
+            if (hasWorkout) {
+              streak++;
+            } else {
+              break;
+            }
+            
+            currentDate.setDate(currentDate.getDate() - 1);
+          }
+          
+          progress = streak;
+          isUnlocked = progress >= achievement.requirement.value;
+          break;
+      }

+      if (isUnlocked) {
+        const unlockedAchievement = {
+          ...achievement,
+          unlockedDate: new Date().toISOString(),
+          progress: achievement.requirement.value
+        };
+        newAchievements.push(unlockedAchievement);
+      } else {
+        // Update progress for tracking
+        const progressAchievement = {
+          ...achievement,
+          progress
+        };
+        // You could store progress achievements separately if needed
+      }
+    });

+    if (newAchievements.length > 0) {
+      const updatedAchievements = [...unlockedAchievements, ...newAchievements];
+      setUnlockedAchievements(updatedAchievements);
+      localStorage.setItem('achievements', JSON.stringify(updatedAchievements));
+      
+      // Show notifications for new achievements
+      newAchievements.forEach(achievement => {
+        if ('Notification' in window && Notification.permission === 'granted') {
+          new Notification(`🏆 Achievement Unlocked!`, {
+            body: `${achievement.title} - ${achievement.description}`,
+            icon: '/icon-192.png'
+          });
+        }
+        
+        // Haptic feedback
+        if ('vibrate' in navigator) {
+          navigator.vibrate([200, 100, 200, 100, 200]);
+        }
+      });
+      
+      return newAchievements;
+    }
+    
+    return [];
+  };

+  const getAchievementProgress = (achievementId: string) => {
+    const achievement = ACHIEVEMENT_DEFINITIONS.find(a => a.id === achievementId);
+    if (!achievement) return { progress: 0, total: 1, percentage: 0 };
+    
+    const workouts = storage.getWorkouts().filter(w => w.completed);
+    const stats = storage.getStats();
+    let progress = 0;
+    
+    switch (achievement.requirement.type) {
+      case 'workout_count':
+        progress = workouts.length;
+        break;
+      case 'total_time':
+        progress = stats.totalDuration;
+        break;
+      case 'exercise_weight':
+        if (achievement.requirement.exerciseId) {
+          const exerciseSets = workouts
+            .flatMap(w => w.sets.filter(s => 
+              s.exerciseId === achievement.requirement.exerciseId && s.completed
+            ));
+          progress = exerciseSets.length > 0 ? Math.max(...exerciseSets.map(s => s.weight)) : 0;
+        }
+        break;
+    }
+    
+    const percentage = Math.min((progress / achievement.requirement.value) * 100, 100);
+    
+    return {
+      progress,
+      total: achievement.requirement.value,
+      percentage
+    };
+  };

+  return {
+    unlockedAchievements,
+    badges,
+    checkAchievements,
+    getAchievementProgress,
+    availableAchievements: ACHIEVEMENT_DEFINITIONS
+  };
+};
+