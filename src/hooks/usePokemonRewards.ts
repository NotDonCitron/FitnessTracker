import { useState, useEffect, useCallback } from 'react';
import { PokemonRewardWithEvolution, PokemonWithEvolution } from '../types/pokemon';
import { getRandomPokemon } from '../utils/pokemonApi';
import { useEvolutionEngine } from './useEvolutionEngine';

interface UsePokemonRewardsProps {
  workouts: any[];
  onWorkoutComplete?: () => void;
  onStreakAchieved?: () => void;
  onEvolutionTriggered?: (fromPokemon: PokemonWithEvolution, toPokemon: PokemonWithEvolution, reason: string) => void;
  onMilestoneComplete?: (milestone: any) => void;
}

export const usePokemonRewards = ({
  workouts,
  onWorkoutComplete,
  onStreakAchieved,
  onEvolutionTriggered
}: UsePokemonRewardsProps) => {
  const [rewards, setRewards] = useState<PokemonRewardWithEvolution[]>([]);
  const [currentReward, setCurrentReward] = useState<PokemonRewardWithEvolution | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastWorkoutId, setLastWorkoutId] = useState<string | null>(null);

  // Initialize evolution engine
  const evolutionEngine = useEvolutionEngine({
    workouts,
    onEvolutionTriggered: (fromPokemon: PokemonWithEvolution, toPokemon: PokemonWithEvolution, reason: string) => {
      // Handle evolution in rewards
      handleEvolution(fromPokemon, toPokemon, reason);
      if (onEvolutionTriggered) {
        onEvolutionTriggered(fromPokemon, toPokemon, reason);
      }
    }
  });

 // Handle Pokemon evolution in rewards
  const handleEvolution = useCallback((fromPokemon: PokemonWithEvolution, toPokemon: PokemonWithEvolution, reason: string) => {
    setRewards(prev => {
      // First, update the existing reward with the evolved Pokemon data
      const updatedRewards = prev.map(reward => {
        // Match by both Pokemon ID and name to ensure we're updating the correct reward
        if (reward.pokemon.id === fromPokemon.id && reward.pokemon.name === fromPokemon.name) {
          return {
            ...reward,
            pokemon: toPokemon,
            evolutionTriggered: true,
            evolutionHistory: [
              ...(reward.evolutionHistory || []),
              {
                id: Date.now().toString(),
                fromPokemon: fromPokemon,
                toPokemon: toPokemon,
                triggerType: 'workout' as const,
                triggerReason: reason,
                timestamp: new Date().toISOString(),
                workoutContext: {
                  workoutType: fromPokemon.evolutionProgress?.workoutTypes.join(', ') || 'mixed',
                  workoutPokemonTypes: fromPokemon.evolutionProgress?.workoutTypes.join(', ') || 'mixed',
                  workoutCount: fromPokemon.evolutionProgress?.workoutsCompleted || 0
                }
              }
            ]
          };
        }
        return reward;
      });
      
      // Then, create a new reward for the evolved Pokemon
      const newReward: PokemonRewardWithEvolution = {
        id: `${Date.now()}-evolution-${toPokemon.id}`,
        pokemon: toPokemon,
        type: 'evolution',
        reason: `Evolved from ${fromPokemon.name}`,
        timestamp: new Date().toISOString(),
        seen: false,
        evolutionEligible: toPokemon.canEvolve,
        evolutionTriggered: false
      };
      
      // Add the new reward to the beginning of the array (most recent first)
      return [newReward, ...updatedRewards];
    });
  }, []);

  // Load rewards from localStorage on mount
  useEffect(() => {
    const savedRewards = localStorage.getItem('pokemonRewards');
    if (savedRewards) {
      try {
        const parsedRewards = JSON.parse(savedRewards);
        console.log('Loaded pokemon rewards from localStorage:', parsedRewards);
        setRewards(parsedRewards);
      } catch (error) {
        console.error('Failed to load pokemon rewards from localStorage:', error);
      }
    }
  }, []);

  // Save rewards to localStorage whenever rewards change
  useEffect(() => {
    if (rewards.length > 0) {
      console.log('Saving pokemon rewards to localStorage:', rewards);
      localStorage.setItem('pokemonRewards', JSON.stringify(rewards));
    }
  }, [rewards]);

  // Common reward creation logic
  const createReward = useCallback(async (
    type: 'workout' | 'milestone' | 'streak',
    reason: string,
    workoutId?: string,
    callback?: () => void,
    targetPokemonId?: number
  ) => {
    if (isLoading) return;

    // Prevent duplicate rewards for the same workout
    if (type === 'workout' && workoutId && lastWorkoutId === workoutId) {
      return;
    }

    setIsLoading(true);
    try {
      const pokemon = await getRandomPokemon(targetPokemonId);

      // Load evolution data for the Pokemon
      const pokemonWithEvolution = await evolutionEngine.loadEvolutionData({
        id: pokemon.id,
        name: pokemon.name,
        sprites: {
          static: pokemon.sprites.static,
          animated: pokemon.sprites.animated
        },
        types: pokemon.types,
        type1: pokemon.types[0] || 'normal',
        type2: pokemon.types[1]
      });

      const reward: PokemonRewardWithEvolution = {
        id: Date.now().toString(),
        pokemon: pokemonWithEvolution,
        type,
        reason,
        timestamp: new Date().toISOString(),
        seen: false,
        evolutionEligible: pokemonWithEvolution.canEvolve,
        evolutionTriggered: false
      };

      setRewards(prev => [reward, ...prev]);
      setCurrentReward(reward);

      // Remember workout ID to prevent duplicates
      if (type === 'workout' && workoutId) {
        setLastWorkoutId(workoutId);
      }

      if (callback) {
        callback();
      }
    } catch (error) {
      console.error('Failed to generate pokemon reward:', error);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, lastWorkoutId]);

  const triggerWorkoutReward = useCallback(async (workoutId?: string) => {
    await createReward('workout', 'Completed a workout session', workoutId, onWorkoutComplete);
    
    // Process immediate evolutions for all current rewards
    const updatedRewards = [...rewards];
    for (const reward of updatedRewards) {
      const updatedPokemon = await evolutionEngine.updateEvolutionProgress(reward.pokemon);
      const evolvedPokemon = await evolutionEngine.evolvePokemon(updatedPokemon as any, { 
        triggerType: 'instant_workout',
        triggerReason: 'Immediate trigger from workout completion'
      });
      
      if (evolvedPokemon) {
        handleEvolution(reward.pokemon, evolvedPokemon as PokemonWithEvolution, 'Immediate trigger from workout completion');
      }
    }
    
    // After successfully creating a Pokemon reward, call evolutionEngine.handleActivityEvent('workout')
    // This ensures any Pokemon that becomes evolution-eligible due to the new workout gets evolved immediately
    evolutionEngine.handleActivityEvent('workout', { workout: { id: workoutId } }, rewards.map((r: any) => r.pokemon));
  }, [createReward, onWorkoutComplete, evolutionEngine, rewards, handleEvolution]);

  const triggerMilestoneReward = useCallback(async (milestoneName: string) => {
    await createReward('milestone', `Achieved milestone: ${milestoneName}`);
  }, [createReward]);

  // Function to add a specific Pokemon for testing (e.g., Weedle)
  const addTestPokemon = useCallback(async (pokemonId: number, pokemonName: string) => {
    await createReward('workout', `Test Pokemon: ${pokemonName}`, undefined, undefined, pokemonId);
  }, [createReward]);

  // Add milestone completion handler
  const handleMilestoneCompletion = useCallback(async (milestone: any) => {
    // This will be called when daily goals (skill milestones) are completed
    // Call evolutionEngine.handleActivityEvent('milestone', { milestone })
    // This will be called when users complete their daily fitness goals
    
    // Process immediate evolutions for all current rewards
    const updatedRewards = [...rewards];
    for (const reward of updatedRewards) {
      const updatedPokemon = await evolutionEngine.updateEvolutionProgress(reward.pokemon);
      const evolvedPokemon = await evolutionEngine.evolvePokemon(updatedPokemon as any, { 
        triggerType: 'instant_milestone',
        triggerReason: 'Immediate trigger from milestone completion'
      });
      
      if (evolvedPokemon) {
        handleEvolution(reward.pokemon, evolvedPokemon as PokemonWithEvolution, 'Immediate trigger from milestone completion');
      }
    }
    
    evolutionEngine.handleActivityEvent('milestone', { milestone }, rewards.map((r: any) => r.pokemon));
  }, [evolutionEngine, rewards, handleEvolution]);

  const triggerStreakReward = useCallback(async (streakDays: number) => {
    await createReward('streak', `Maintained ${streakDays}-day workout streak`, undefined, onStreakAchieved);
    
    // Process immediate evolutions for all current rewards
    const updatedRewards = [...rewards];
    for (const reward of updatedRewards) {
      const updatedPokemon = await evolutionEngine.updateEvolutionProgress(reward.pokemon);
      const evolvedPokemon = await evolutionEngine.evolvePokemon(updatedPokemon as any, { 
        triggerType: 'instant_streak',
        triggerReason: 'Immediate trigger from streak completion'
      });
      
      if (evolvedPokemon) {
        handleEvolution(reward.pokemon, evolvedPokemon as PokemonWithEvolution, 'Immediate trigger from streak completion');
      }
    }
    
    // After creating streak reward, call evolutionEngine.handleActivityEvent('streak', { streakDays })
    // This handles immediate evolution for streak extensions
    evolutionEngine.handleActivityEvent('streak', { streakDays }, rewards.map((r: any) => r.pokemon));
  }, [createReward, onStreakAchieved, evolutionEngine, rewards, handleEvolution]);

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
    getRewardStats,
    handleMilestoneCompletion,
    addTestPokemon
  };
};
