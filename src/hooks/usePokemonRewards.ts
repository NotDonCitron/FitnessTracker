import { useState, useEffect, useCallback } from 'react';
import { PokemonReward } from '../types/pokemon';
import { getRandomPokemon } from '../utils/pokemonApi';

export const usePokemonRewards = (onWorkoutComplete?: () => void, onStreakAchieved?: () => void) => {
  const [rewards, setRewards] = useState<PokemonReward[]>([]);
  const [currentReward, setCurrentReward] = useState<PokemonReward | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastWorkoutId, setLastWorkoutId] = useState<string | null>(null);

  // Load rewards from localStorage on mount
  useEffect(() => {
    const savedRewards = localStorage.getItem('pokemonRewards');
    if (savedRewards) {
      try {
        setRewards(JSON.parse(savedRewards));
      } catch (error) {
        console.error('Error loading Pokemon rewards:', error);
      }
    }
  }, []);

  // Save rewards to localStorage whenever rewards change
  useEffect(() => {
    if (rewards.length > 0) {
      localStorage.setItem('pokemonRewards', JSON.stringify(rewards));
    }
  }, [rewards]);

  const triggerWorkoutReward = useCallback(async (workoutId?: string) => {
    console.log('🏀 [DEBUG] triggerWorkoutReward called, isLoading:', isLoading);
    
    // Prevent duplicate rewards for the same workout
    if (workoutId && lastWorkoutId === workoutId) {
      console.log('🚫 [DEBUG] Duplicate reward prevented for workout:', workoutId);
      return;
    }
    
    if (isLoading) return;
    
    setIsLoading(true);
    try {
      console.log('🔍 [DEBUG] Fetching random Pokemon from API...');
      const pokemon = await getRandomPokemon();
      console.log('✨ [DEBUG] Pokemon fetched successfully:', pokemon);
      
      const reward: PokemonReward = {
        id: Date.now().toString(),
        pokemon: {
          id: pokemon.id,
          name: pokemon.name,
          sprite: pokemon.sprites.static,
          animatedSprite: pokemon.sprites.animated,
          type1: pokemon.types[0] || 'normal',
          type2: pokemon.types[1]
        },
        type: 'workout',
        reason: 'Completed a workout session',
        timestamp: new Date().toISOString(),
        seen: false
      };

      console.log('🎁 [DEBUG] Created reward object:', reward);
      setRewards(prev => [reward, ...prev]);
      console.log('🎯 [DEBUG] Setting currentReward to show modal...');
      setCurrentReward(reward);
      console.log('🎊 [DEBUG] currentReward state updated, modal should appear now!');
      
      // Remember this workout ID to prevent duplicates
      if (workoutId) {
        setLastWorkoutId(workoutId);
      }
      
      if (onWorkoutComplete) {
        console.log('📞 [DEBUG] Calling onWorkoutComplete callback');
        onWorkoutComplete();
      }
    } catch (error) {
      console.error('❌ [DEBUG] Error triggering workout reward:', error);
      console.error('❌ [DEBUG] Full error details:', error.message, error.stack);
    } finally {
      setIsLoading(false);
      console.log('✅ [DEBUG] triggerWorkoutReward completed, isLoading set to false');
    }
  }, [isLoading, onWorkoutComplete, lastWorkoutId]);

  const triggerMilestoneReward = useCallback(async (milestoneName: string) => {
    if (isLoading) return;
    
    setIsLoading(true);
    try {
      const pokemon = await getRandomPokemon();
      const reward: PokemonReward = {
        id: Date.now().toString(),
        pokemon: {
          id: pokemon.id,
          name: pokemon.name,
          sprite: pokemon.sprites.static,
          animatedSprite: pokemon.sprites.animated,
          type1: pokemon.types[0] || 'normal',
          type2: pokemon.types[1]
        },
        type: 'milestone',
        reason: `Achieved milestone: ${milestoneName}`,
        timestamp: new Date().toISOString(),
        seen: false
      };

      setRewards(prev => [reward, ...prev]);
      setCurrentReward(reward);
    } catch (error) {
      console.error('Error triggering milestone reward:', error);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading]);

  const triggerStreakReward = useCallback(async (streakDays: number) => {
    if (isLoading) return;
    
    setIsLoading(true);
    try {
      const pokemon = await getRandomPokemon();
      const reward: PokemonReward = {
        id: Date.now().toString(),
        pokemon: {
          id: pokemon.id,
          name: pokemon.name,
          sprite: pokemon.sprites.static,
          animatedSprite: pokemon.sprites.animated,
          type1: pokemon.types[0] || 'normal',
          type2: pokemon.types[1]
        },
        type: 'streak',
        reason: `Maintained ${streakDays}-day workout streak`,
        timestamp: new Date().toISOString(),
        seen: false
      };

      setRewards(prev => [reward, ...prev]);
      setCurrentReward(reward);
      
      if (onStreakAchieved) {
        onStreakAchieved();
      }
    } catch (error) {
      console.error('Error triggering streak reward:', error);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, onStreakAchieved]);

  const dismissCurrentReward = useCallback(() => {
    setCurrentReward(null);
  }, []);

  const getRewardStats = useCallback(() => {
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const thisWeek = rewards.filter(reward => 
      new Date(reward.timestamp) >= oneWeekAgo
    ).length;
    
    const uniquePokemon = new Set(rewards.map(reward => reward.pokemon.id)).size;
    const streakRewards = rewards.filter(reward => reward.type === 'streak').length;
    
    // Show up to 12 recent rewards instead of just 5
    const recentRewards = rewards.slice(0, 12);
    
    return {
      totalRewards: rewards.length,
      uniquePokemon,
      thisWeek,
      streakRewards,
      recentRewards
    };
  }, [rewards]);

  return {
    rewards,
    currentReward,
    isLoading,
    triggerWorkoutReward,
    triggerMilestoneReward,
    triggerStreakReward,
    dismissCurrentReward,
    getRewardStats
  };
};