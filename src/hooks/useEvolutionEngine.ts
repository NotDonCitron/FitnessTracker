import { useState, useEffect, useCallback, useRef } from 'react';
import type { PokemonWithEvolution, EvolutionProgress, EvolutionStage, Pokemon, EvolutionEvent, TriggerContext } from '../types/pokemon';
import type { Workout, WorkoutExercise } from '../types/workout';
import type { SkillMilestone } from '../types/skills';
import { pokemonAPI } from '../utils/pokemonApi';
import { evolutionDataProvider } from '../utils/evolutionDataSources';

// Shared constant for streak window to ensure consistency
const STREAK_WINDOW = 20;

// Helper function to map workout types to Pokemon types
const mapWorkoutTypeToPokemonType = (workoutType?: string): string => {
  const typeMapping: Record<string, string> = {
    'cardio': 'fire',
    'strength': 'fighting',
    'flexibility': 'grass',
    'balance': 'psychic',
    'endurance': 'normal',
    'speed': 'electric',
    'power': 'dragon',
    'general': 'normal',
    'chest': 'fighting',
    'back': 'flying',
    'legs': 'ground',
    'arms': 'fighting',
    'core': 'rock',
    'shoulders': 'fighting',
    'running': 'fire',
    'cycling': 'electric',
    'swimming': 'water',
    'yoga': 'psychic',
    'pilates': 'fairy',
    'dancing': 'normal',
    'boxing': 'fighting',
    'martial-arts': 'fighting',
    'climbing': 'rock',
    'hiking': 'grass'
  };

if (!workoutType) {
  return 'unknown';
}

const normalizedType = workoutType.trim().toLowerCase().replace(/\s+/g, '-');
return typeMapping[normalizedType] || 'unknown';
};

// Helper function to determine required types based on Pokemon's type
const determineRequiredTypes = async (nextEvolution: EvolutionStage, mostCommonTypes: string[]): Promise<string[]> => {
  try {
    // First, try to get actual Pokemon type data from the API
    const types = (await pokemonAPI.getPokemonTypes(nextEvolution.id))
      ?.map((t: string) => t.toLowerCase());
    
    if (types && types.length > 0) {
      // Return up to 2 unique Pokemon types directly
      const uniqueTypes = [...new Set(types)];
      console.log(`[Evolution] Using API-based type requirements for ${nextEvolution.name}:`, uniqueTypes);
      return uniqueTypes.slice(0, 2); // Limit to 2 types for reasonable requirements
    }
  } catch (error) {
    console.warn(`[Evolution] Failed to fetch Pokemon type data for ${nextEvolution.name}:`, error);
  }
  
  // Fallback 1: Use user's most common workout types
  if (mostCommonTypes.length >= 2) {
    console.log(`[Evolution] Using user's most common types for ${nextEvolution.name}:`, mostCommonTypes.slice(0, 2));
    return mostCommonTypes.slice(0, 2);
  }
  
  // Fallback 2: Use balanced default types
  const defaultTypes = ['normal', 'fighting']; // Encourage basic fitness
  console.log(`[Evolution] Using default types for ${nextEvolution.name}:`, defaultTypes);
  return defaultTypes;
};

// Helper function to generate special conditions based on evolution and workout history
const generateSpecialConditions = (nextEvolution: EvolutionStage, workouts: Workout[]): string[] => {
  const conditions: string[] = [];
  const totalWorkouts = workouts.length;

  // Add conditions based on workout volume
  if (totalWorkouts < 10) {
    conditions.push('Complete more workouts to evolve');
  } else if (totalWorkouts > 50) {
    conditions.push('High workout volume detected - evolution ready');
  }

  // Add conditions based on workout variety
  const uniqueWorkoutTypes = new Set(
    workouts.flatMap(w => (w.exercises ?? [])
      .map(we => we.exercise?.category?.trim().toLowerCase())
      .filter((c): c is string => Boolean(c))
    )
  );
  if (uniqueWorkoutTypes.size < 3) {
    conditions.push('Try different workout types for better evolution chances');
  } else {
    conditions.push('Good workout variety - supports evolution');
  }

  // Add Pokemon-specific conditions
  if (nextEvolution.name) {
    const pokemonName = nextEvolution.name.toLowerCase();
    if (pokemonName.includes('dragon') || pokemonName.includes('legend')) {
      conditions.push('Legendary evolution - requires exceptional dedication');
    }
  }

  return conditions;
};

interface EvolutionCondition {
  requiredWorkouts: number;
  requiredTypes: string[];
  minWorkoutStreak?: number;
  specialConditions?: string[];
}

interface UseEvolutionEngineProps {
  workouts: Workout[];
  onEvolutionTriggered?: (fromPokemon: PokemonWithEvolution, toPokemon: PokemonWithEvolution, reason: string) => void;
}

export const useEvolutionEngine = ({ workouts, onEvolutionTriggered }: UseEvolutionEngineProps) => {
  const [evolutionCandidates, setEvolutionCandidates] = useState<PokemonWithEvolution[]>([]);
  const [evolutionHistory, setEvolutionHistory] = useState<EvolutionEvent[]>([]);

  // Performance cache for evolution conditions (short-lived in-memory cache)
  const evolutionCache = useRef(new Map<string, { conditions: EvolutionCondition; timestamp: number }>());
  const CACHE_TTL = 5000; // 5 seconds cache TTL

  // Calculate activity multiplier based on user's recent activity
  const calculateActivityMultiplier = useCallback((workouts: Workout[]): number => {
    // Calculate workouts in last 7 days
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 1000);
    const workoutsLast7Days = workouts.filter(w => 
      w.completed && new Date(w.date) >= sevenDaysAgo
    ).length;

    // Calculate total training minutes in last 7 days
    const totalMinutesLast7Days = workouts
      .filter(w => w.completed && new Date(w.date) >= sevenDaysAgo)
      .reduce((total, w) => total + (Number(w.duration) || 0), 0);

    // Calculate current streak length with validation
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let currentDate = new Date(today);

    for (let i = 0; i < 30; i++) { // Check last 30 days
      const hasWorkout = workouts.some(w => {
        // Validate date before using it
        if (!w.date) return false;
        const workoutDate = new Date(w.date);
        // Check if date is valid
        if (isNaN(workoutDate.getTime())) return false;
        workoutDate.setHours(0, 0, 0, 0);
        return workoutDate.getTime() === currentDate.getTime() && w.completed;
      });

      if (hasWorkout) {
        streak++;
      } else {
        break;
      }

      currentDate.setDate(currentDate.getDate() - 1);
    }

    // Determine activity level and multiplier
    // Very Active: 0.4x (5+ workouts/week + 7+ day streak + 150+ minutes/week)
    if (workoutsLast7Days >= 5 && streak >= 7 && totalMinutesLast7Days >= 150) {
      return 0.4;
    }
    // Active: 0.6x (4+ workouts/week + 5+ day streak + 120+ minutes/week)
    if (workoutsLast7Days >= 4 && streak >= 5 && totalMinutesLast7Days >= 120) {
      return 0.6;
    }
    // Moderate: 0.8x (3+ workouts/week + 3+ day streak + 90+ minutes/week)
    if (workoutsLast7Days >= 3 && streak >= 3 && totalMinutesLast7Days >= 90) {
      return 0.8;
    }
    // Inactive: 1.0x (default)
    return 1.0;
  }, []);

  // Clear expired cache entries
  const clearExpiredCache = useCallback(() => {
    const now = Date.now();
    for (const [key, entry] of evolutionCache.current.entries()) {
      if (now - entry.timestamp > CACHE_TTL) {
        evolutionCache.current.delete(key);
      }
    }
  }, []);

  // Clear entire cache
  const clearCache = useCallback(() => {
    evolutionCache.current.clear();
  }, []);

  // Load evolution history from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('evolutionHistory');
    if (saved) {
      try {
        setEvolutionHistory(JSON.parse(saved));
      } catch (error) {
        console.error('Failed to load evolution history:', error);
      }
    }
  }, []);

  // Save evolution history to localStorage
  useEffect(() => {
    if (evolutionHistory.length > 0) {
      localStorage.setItem('evolutionHistory', JSON.stringify(evolutionHistory));
    }
  }, [evolutionHistory]);

  // Clear cache when workouts change
  useEffect(() => {
    clearCache();
  }, [workouts, clearCache]);

  // Calculate evolution conditions based on workout patterns with caching
  const calculateEvolutionConditions = useCallback(async (evolutionChain: EvolutionStage[], currentPokemonId: number): Promise<EvolutionCondition> => {
    // Find the current stage in the evolution chain
        const currentStageInChain = evolutionChain.find(stage => stage.id === currentPokemonId) || evolutionChain[0];
        const nextEvolution = currentStageInChain?.evolvesTo[0];
    
        // Create cache key after nextEvolution is defined
        const typeFingerprint = workouts
          .flatMap(w => (w.exercises ?? []).map(we => we.exercise?.category || ''))
          .map(s => s?.toLowerCase().trim())
          .sort()
          .join('|');
        const cacheKey = `${currentPokemonId}-${nextEvolution?.id || 'none'}-${workouts.length}-${typeFingerprint}`;
        const now = Date.now();
    
        // Check cache first
        const cachedEntry = evolutionCache.current.get(cacheKey);
        if (cachedEntry && (now - cachedEntry.timestamp < CACHE_TTL)) {
          return cachedEntry.conditions;
        }
    
        // Clear expired cache entries
        clearExpiredCache();

    if (!nextEvolution) {
      const defaultConditions = {
        requiredWorkouts: 15,
        requiredTypes: [],
      };
      
      // Cache the result
      evolutionCache.current.set(cacheKey, {
        conditions: defaultConditions,
        timestamp: now
      });
      
      return defaultConditions;
    }

    // Enhanced workout pattern analysis
    const typeCounts = workouts.reduce((acc, w) => {
      (w.exercises ?? []).forEach((we) => {
        const type = mapWorkoutTypeToPokemonType(we.exercise?.category);
        if (type !== 'unknown') {
          acc[type] = (acc[type] || 0) + 1;
        }
      });
      return acc;
    }, {} as Record<string, number>);

    const mostCommonTypes = Object.entries(typeCounts)
      .sort(([,a], [,b]) => (b as number) - (a as number))
      .slice(0, 3)
      .map(([type]) => type);

    // Calculate requirements based on evolution chain complexity
    const totalWorkouts = workouts.length;
    const totalCompleted = workouts.filter(w => w.completed ?? false).length;
    
    // Helper function to calculate chain depth recursively
    const getChainDepth = (stage: EvolutionStage): number => {
      if (!stage.evolvesTo || stage.evolvesTo.length === 0) {
        return 1;
      }
      const depths = stage.evolvesTo.map(evolution => getChainDepth(evolution));
      return 1 + Math.max(...depths, 0);
    };

    const chainDepth = currentStageInChain ? getChainDepth(currentStageInChain) : 1;

    // More realistic evolution requirements
    const complexityMultiplier = Math.max(1, Math.min(1.5, chainDepth * 0.3));
    const baseRequirement = Math.max(3, Math.min(20, Math.floor((totalCompleted * 0.15 + 5) * complexityMultiplier)));
    
        // Handle edge case: no workouts yields empty mostCommonTypes; defaults kick in correctly
        let finalRequiredTypes = await determineRequiredTypes(nextEvolution, mostCommonTypes);
        let finalBaseRequirement = baseRequirement;
        if (totalWorkouts === 0) {
          // If no workouts, set requiredTypes to a single type present in progress.workoutTypes or reduce requirements
          if (mostCommonTypes.length > 0) {
            finalRequiredTypes = [mostCommonTypes[0]];
          } else {
            // Fallback to default requirements
            finalRequiredTypes = ['normal'];
            finalBaseRequirement = 3; // Reduced requirements
          }
        }
    
        // Determine required types using the new robust method
        const requiredTypes = finalRequiredTypes;

    // Calculate streak requirements
    const streakRequirement = Math.max(2, Math.min(4, Math.floor(finalBaseRequirement * 0.3)));
    
    // Apply activity multiplier to reduce requirements for active users
    const activityMultiplier = calculateActivityMultiplier(workouts);
    const adjustedBaseRequirement = Math.ceil(finalBaseRequirement * activityMultiplier);
    const adjustedStreakRequirement = Math.ceil(streakRequirement * activityMultiplier);
    
    // Ensure minimum requirements even for very active users
    const requiredWorkouts = Math.max(1, adjustedBaseRequirement);
    const minWorkoutStreak = Math.max(1, adjustedStreakRequirement);
    
        const conditions = {
          requiredWorkouts: requiredWorkouts,
          requiredTypes: requiredTypes,
          minWorkoutStreak: minWorkoutStreak,
          specialConditions: generateSpecialConditions(nextEvolution, workouts)
        };

    // Cache the result
    evolutionCache.current.set(cacheKey, {
      conditions,
      timestamp: now
    });

    return conditions;
  }, [workouts, clearExpiredCache, calculateActivityMultiplier]);

  // Check if a Pokemon can evolve based on current conditions
  const canEvolve = useCallback(async (pokemon: PokemonWithEvolution): Promise<boolean> => {
    if (!pokemon.evolutionData || !pokemon.evolutionProgress) {
      return false;
    }

    const progress = pokemon.evolutionProgress;
    const conditions = await calculateEvolutionConditions(pokemon.evolutionData.evolutionChain, pokemon.id);

    // Check basic requirements
    const effectiveCompleted = Math.floor(progress.workoutsCompletedWeighted ?? progress.workoutsCompleted);
    const hasEnoughWorkouts = effectiveCompleted >= (conditions.requiredWorkouts || 0);
    const workoutTypesSet = new Set((progress.workoutTypes || []).map(t => t.toLowerCase()));
    const required = (conditions.requiredTypes || []).map(t => t.toLowerCase());
    const hasRequiredTypes = required.every(type => workoutTypesSet.has(type));

    // Check streak requirement with consecutive-day calculation
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let currentDate = new Date(today);

    for (let i = 0; i < 30; i++) { // Check last 30 days
      const hasWorkout = workouts.some(w => {
        // Validate date before using it
        if (!w.date) return false;
        const workoutDate = new Date(w.date);
        // Check if date is valid
        if (isNaN(workoutDate.getTime())) return false;
        workoutDate.setHours(0, 0, 0, 0);
        return workoutDate.getTime() === currentDate.getTime() && w.completed;
      });

      if (hasWorkout) {
        streak++;
      } else {
        break;
      }

      currentDate.setDate(currentDate.getDate() - 1);
    }
    
    const hasStreak = !conditions.minWorkoutStreak || streak >= conditions.minWorkoutStreak;

    return hasEnoughWorkouts && hasRequiredTypes && hasStreak;
  }, [calculateEvolutionConditions, workouts]);

  // Evolve a Pokemon
const evolvePokemon = useCallback(async (pokemon: PokemonWithEvolution, opts?: {
    triggerType?: EvolutionEvent['triggerType'];
    triggerReason?: string;
    triggerContext?: TriggerContext;
    activityLevel?: 'very_active' | 'active' | 'moderate' | 'inactive';
  }): Promise<Pokemon | null> => {
  // For test mode, always allow evolution even if nextEvolutions is empty
  const hasNextEvolutions = pokemon.evolutionData?.nextEvolutions && pokemon.evolutionData.nextEvolutions.length > 0;
  const isInTestMode = process.env.NODE_ENV === 'development';
  
  // In production, require next evolutions to exist
  if (!isInTestMode && !hasNextEvolutions) {
    console.warn('[Evolution] No next evolutions found for', pokemon.name, pokemon.evolutionData?.evolutionChain);
    return null;
  }
  
  // In test mode, allow evolution even for final forms
  if (!isInTestMode && !(await canEvolve(pokemon))) {
    return null;
  }

    // Get the correct next evolution from the evolution chain
    let nextEvolution = pokemon.evolutionData?.nextEvolutions?.[0];
    
    // In test mode, if no next evolution, try to find it in the evolution chain
    if (isInTestMode && !nextEvolution && pokemon.evolutionData?.evolutionChain) {
      console.log('🧪 [TEST] No next evolution found, searching evolution chain for', pokemon.name);
      
      // Find current Pokemon in the evolution chain and get its next evolution
      const findNextEvolutionInChain = (chain: EvolutionStage[]): EvolutionStage | null => {
        for (const stage of chain) {
          if (stage.id === pokemon.id) {
            // Found current Pokemon, return its first next evolution
            if (stage.evolvesTo && stage.evolvesTo.length > 0) {
              return stage.evolvesTo[0];
            }
            // Current Pokemon is final form - don't cycle, return null for final forms
            console.log(`🚫 [TEST] ${pokemon.name} is a final form Pokemon with no further evolutions`);
            return null;
          }
          
          // Recursively search in evolvesTo
          if (stage.evolvesTo && stage.evolvesTo.length > 0) {
            const result = findNextEvolutionInChain(stage.evolvesTo);
            if (result) {
              return result;
            }
          }
        }
        return null;
      };
      
      const chainNextEvolution = findNextEvolutionInChain(pokemon.evolutionData.evolutionChain);
      if (chainNextEvolution) {
        nextEvolution = {
          id: chainNextEvolution.id,
          name: chainNextEvolution.name,
          sprites: {
            static: '', // Will be loaded when needed
            animated: undefined
          },
          types: ['normal']
        };
        console.log('🧪 [TEST] Found next evolution in chain:', nextEvolution.name);
      } else {
        // Still no next evolution, use simple increment for test mode
        const nextId = pokemon.id + 1;
        nextEvolution = {
          id: nextId,
          name: `pokemon-${nextId}`,
          sprites: {
            static: '',
            animated: undefined
          },
          types: ['normal']
        };
        console.log('🧪 [TEST] Using simple increment fallback:', nextEvolution.name);
      }
    }

    // If still no next evolution, return null (except in test mode)
    if (!nextEvolution) {
      if (!isInTestMode) {
        console.warn('[Evolution] No valid next evolution found for', pokemon.name);
        return null;
      }
      // In test mode, create a fallback evolution
      const fallbackId = pokemon.id + 1;
      nextEvolution = {
        id: fallbackId,
        name: `pokemon-${fallbackId}`,
        sprites: {
          static: '',
          animated: undefined
        },
        types: ['normal']
      };
      console.log('🧪 [TEST] Using fallback evolution:', nextEvolution.name);
    }

    try {
      // Get full Pokemon data for the evolution
      const evolvedPokemonData = await pokemonAPI.getPokemon(nextEvolution.id);

      const evolvedPokemon: PokemonWithEvolution = {
        id: evolvedPokemonData.id,
        name: evolvedPokemonData.name,
        sprites: {
          static: evolvedPokemonData.sprites?.static || `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${evolvedPokemonData.id}.png`,
          animated: evolvedPokemonData.sprites?.animated || `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/${evolvedPokemonData.id}.gif`
        },
        types: evolvedPokemonData.types || ['normal'],
        type2: evolvedPokemonData.types?.[1],
        evolutionData: {
          currentForm: evolvedPokemonData,
          evolutionChain: pokemon.evolutionData?.evolutionChain || [],
          nextEvolutions: [],
          evolutionRequirements: pokemon.evolutionData?.evolutionRequirements
        },
        evolutionProgress: {
          currentLevel: 2,
          workoutsCompleted: pokemon.evolutionProgress?.workoutsCompleted || 0,
          workoutTypes: pokemon.evolutionProgress?.workoutTypes || [],
          lastEvolutionCheck: new Date().toISOString(),
          requiredWorkouts: 0,
          requiredTypes: []
        },
        canEvolve: false
      };

      // Create evolution event
      const evolutionEvent: EvolutionEvent = {
        id: Date.now().toString(),
        fromPokemon: pokemon,
        toPokemon: evolvedPokemon,
        triggerType: opts?.triggerType || (isInTestMode ? 'test_mode' : 'workout'),
        triggerReason: opts?.triggerReason || (isInTestMode ? 'Test mode evolution visualization' : `Evolved through ${pokemon.evolutionProgress?.workoutsCompleted} workouts`),
        timestamp: new Date().toISOString(),
        workoutContext: {
          workoutType: pokemon.evolutionProgress?.workoutTypes?.join(', ') || 'mixed',
          workoutPokemonTypes: pokemon.evolutionProgress?.workoutTypes?.join(', ') || 'mixed',
          workoutCount: pokemon.evolutionProgress?.workoutsCompleted || 0,
          activityLevel: opts?.activityLevel,
          triggerContext: opts?.triggerContext
        }
      };

      setEvolutionHistory(prev => [...prev, evolutionEvent]);

      // Trigger callback
      if (onEvolutionTriggered) {
        onEvolutionTriggered(pokemon, evolvedPokemon, evolutionEvent.triggerReason);
      }

      return evolvedPokemon;
    } catch (error) {
      console.error('Failed to evolve Pokemon:', error);
      
      // In test mode, still trigger evolution with fallback data
      if (isInTestMode) {
        console.log('🧪 [TEST] Using fallback data for evolution visualization');
        const fallbackEvolvedPokemon: PokemonWithEvolution = {
          id: nextEvolution.id,
          name: nextEvolution.name,
          sprites: {
            static: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/0.png',
            animated: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/0.gif'
          },
          types: ['normal'],
          type2: undefined,
          evolutionData: {
            currentForm: {
              id: nextEvolution.id,
              name: nextEvolution.name,
              sprites: {
                static: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/0.png',
                animated: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/0.gif'
              },
              types: ['normal']
            },
            evolutionChain: pokemon.evolutionData?.evolutionChain || [],
            nextEvolutions: [],
            evolutionRequirements: pokemon.evolutionData?.evolutionRequirements
          },
          evolutionProgress: {
            currentLevel: 2,
            workoutsCompleted: pokemon.evolutionProgress?.workoutsCompleted || 0,
            workoutTypes: pokemon.evolutionProgress?.workoutTypes || [],
            lastEvolutionCheck: new Date().toISOString(),
            requiredWorkouts: 0,
            requiredTypes: []
          },
          canEvolve: false
        };

        const evolutionEvent: EvolutionEvent = {
          id: Date.now().toString(),
          fromPokemon: pokemon,
          toPokemon: fallbackEvolvedPokemon,
          triggerType: 'test_mode',
          triggerReason: 'Test mode evolution visualization (fallback)',
          timestamp: new Date().toISOString(),
          workoutContext: {
            workoutType: pokemon.evolutionProgress?.workoutTypes?.join(', ') || 'mixed',
            workoutPokemonTypes: pokemon.evolutionProgress?.workoutTypes?.join(', ') || 'mixed',
            workoutCount: pokemon.evolutionProgress?.workoutsCompleted || 0,
            activityLevel: opts?.activityLevel,
            triggerContext: opts?.triggerContext
          }
        };

        setEvolutionHistory(prev => [...prev, evolutionEvent]);

        if (onEvolutionTriggered) {
          onEvolutionTriggered(pokemon, fallbackEvolvedPokemon, evolutionEvent.triggerReason);
        }

        return fallbackEvolvedPokemon;
      }
      
      return null;
    }
  }, [canEvolve, onEvolutionTriggered]);

  // Update evolution progress for a Pokemon with recent activity weighting
  const updateEvolutionProgress = useCallback(async (pokemon: PokemonWithEvolution): Promise<PokemonWithEvolution> => {
    const conditions = await calculateEvolutionConditions(pokemon.evolutionData?.evolutionChain || [], pokemon.id);

    // Calculate weighted workouts completed based on recent activity
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 1000);
    const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 1000);

    let workoutsCompletedWeighted = 0;
    workouts.filter(w => w.completed ?? false).forEach(workout => {
      const workoutDate = new Date(workout.date);
      if (workoutDate >= sevenDaysAgo) {
        // Workouts in last 7 days weighted 1.5x
        workoutsCompletedWeighted += 1.5;
      } else if (workoutDate >= fourteenDaysAgo) {
        // Workouts in last 14 days weighted 1.2x
        workoutsCompletedWeighted += 1.2;
      } else {
        // Older workouts weighted 1.0x
        workoutsCompletedWeighted += 1.0;
      }
    });

    const progress: EvolutionProgress = {
      currentLevel: 1,
      workoutsCompleted: workouts.filter(w => w.completed ?? false).length,
      workoutsCompletedWeighted: workoutsCompletedWeighted,
      workoutTypes: (() => {
        const rawWorkoutTypes = workouts.flatMap((workout: Workout) =>
          (workout.exercises ?? []).map((we: WorkoutExercise) =>
            mapWorkoutTypeToPokemonType(we.exercise?.category)
          ).filter(type => type !== 'unknown')
        );
        const uniqueWorkoutTypes = [...new Set(rawWorkoutTypes)];
        return uniqueWorkoutTypes;
      })(),
      lastEvolutionCheck: new Date().toISOString(),
      requiredWorkouts: conditions.requiredWorkouts,
      requiredTypes: conditions.requiredTypes,
      minWorkoutStreak: conditions.minWorkoutStreak,
      specialConditions: conditions.specialConditions,
      activityMultiplier: calculateActivityMultiplier(workouts)
    };

    return {
      ...pokemon,
      evolutionProgress: progress,
      canEvolve: await canEvolve({ ...pokemon, evolutionProgress: progress })
    };
  }, [calculateEvolutionConditions, canEvolve, workouts, calculateActivityMultiplier]);

  // Load evolution data for a Pokemon
  const loadEvolutionData = useCallback(async (pokemon: Pokemon): Promise<PokemonWithEvolution> => {
    try {
      console.log(`[DEBUG] Loading evolution data for ${pokemon.name} (ID: ${pokemon.id})`);
      const evolutionChain = await evolutionDataProvider.getEvolutionChain(pokemon.id);
      console.log(`[DEBUG] Evolution chain for ${pokemon.name}:`, evolutionChain);
      
      // Extract next evolutions
      const nextEvolutions: Pokemon[] = [];
      const findNextEvolutions = (stage: EvolutionStage) => {
        console.log(`[DEBUG] Checking stage: ${stage.name} (ID: ${stage.id}) against Pokemon ID: ${pokemon.id}`);
        // Find the current Pokémon stage in the chain
        if (stage.id === pokemon.id) {
          console.log(`[DEBUG] Found current Pokemon ${pokemon.name} (ID: ${pokemon.id}) in evolution chain`);
          console.log(`[DEBUG] Current stage evolvesTo:`, stage.evolvesTo);
          // Add all direct next evolutions
          stage.evolvesTo.forEach(evolutionStage => {
            // Prevent self-evolution (critical for test data consistency)
            if (evolutionStage.id !== pokemon.id) {
              console.log(`[DEBUG] Adding next evolution: ${evolutionStage.name} (ID: ${evolutionStage.id})`);
              nextEvolutions.push({
                id: evolutionStage.id,
                name: evolutionStage.name,
                sprites: {
                  static: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${evolutionStage.id}.png`,
                  animated: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/${evolutionStage.id}.gif`
                },
                types: ['normal']
              });
            } else {
              console.log(`[DEBUG] Skipping self-evolution: ${evolutionStage.name} (ID: ${evolutionStage.id})`);
            }
          });
          return;
        }
        // Continue searching through the chain
        stage.evolvesTo.forEach(findNextEvolutions);
      };

      evolutionChain.forEach(findNextEvolutions);
      console.log(`[DEBUG] Final nextEvolutions for ${pokemon.name}:`, nextEvolutions);

      const evolutionData = {
        currentForm: pokemon,
        evolutionChain: evolutionChain,
        nextEvolutions,
        evolutionRequirements: evolutionChain[0]?.evolutionRequirements
      };

      const pokemonWithEvolution: PokemonWithEvolution = {
        ...pokemon,
        evolutionData,
        canEvolve: false
      };

      return updateEvolutionProgress(pokemonWithEvolution);
    } catch (error) {
      console.error('Failed to load evolution data:', error);
      return {
        ...pokemon,
        canEvolve: false
      };
    }
  }, [updateEvolutionProgress]);

  // Handle immediate evolution triggers for active users
  const handleActivityEvent = useCallback(async (
    eventType: 'workout' | 'streak' | 'milestone',
    context?: {
      workout?: any;
      streakDays?: number;
      milestone?: SkillMilestone;
    },
    pokemonsToCheck?: PokemonWithEvolution[]
  ): Promise<void> => {
    // If no pokemons provided, just log the event
    if (!pokemonsToCheck || pokemonsToCheck.length === 0) {
      console.log(`[Evolution] Handling activity event: ${eventType}`, context);
      return;
    }

    // For each Pokemon, update evolution progress and check if it can evolve
    for (const pokemon of pokemonsToCheck) {
      const updatedPokemon = await updateEvolutionProgress(pokemon);
      const triggerType = eventType === 'workout' ? 'instant_workout' : 
                         eventType === 'streak' ? 'instant_streak' : 'instant_milestone';
      
      // Normalize context before passing it to evolvePokemon
      const tc: TriggerContext | undefined = context
        ? {
            workoutId: context.workout?.id,
            milestoneId: context.milestone?.id,
            streakDays: context.streakDays,
          }
        : undefined;
      
      // Try to evolve the Pokemon with the appropriate trigger type
      await evolvePokemon(updatedPokemon, { 
        triggerType, 
        triggerReason: `Immediate trigger from ${eventType} event`,
        triggerContext: tc,
      });
    }
  }, [updateEvolutionProgress, evolvePokemon]);

  // Check for evolution candidates
  const checkForEvolutionCandidates = useCallback(async (pokemons: Pokemon[]) => {
    const candidates: PokemonWithEvolution[] = [];

    for (const pokemon of pokemons) {
      const pokemonWithEvolution = await loadEvolutionData(pokemon);
      if (pokemonWithEvolution.canEvolve) {
        candidates.push(pokemonWithEvolution);
      }
    }

    setEvolutionCandidates(candidates);
  }, [loadEvolutionData]);

  // Test function to verify context normalization (for development/testing only)
  const testContextNormalization = () => {
    // Test case 1: Normal context
    const mockContext1 = {
      workout: { id: 'workout-123', name: 'Test Workout' },
      streakDays: 7,
      milestone: { 
        id: 'milestone-456', 
        title: 'Test Milestone',
        description: 'Test milestone for evolution',
        targetValue: 10,
        currentValue: 5,
        unit: 'workouts' as const,
        completed: false,
        category: 'strength' as const
      }
    };
    
    const normalizedContext1 = mockContext1
      ? {
          workoutId: mockContext1.workout?.id,
          milestoneId: mockContext1.milestone?.id,
          streakDays: mockContext1.streakDays,
        }
      : undefined;
    
    console.log('Test 1 - Normal context:', normalizedContext1);
    
    // Test case 2: Undefined context
    const mockContext2 = undefined;
    const normalizedContext2 = mockContext2
      ? {
          workoutId: (mockContext2 as any).workout?.id,
          milestoneId: (mockContext2 as any).milestone?.id,
          streakDays: (mockContext2 as any).streakDays,
        }
      : undefined;
    
    console.log('Test 2 - Undefined context:', normalizedContext2);
    
    // Test case 3: Partial context
    const mockContext3 = {
      workout: { id: 'workout-789', name: 'Another Test Workout' }
    };
    
    const normalizedContext3 = mockContext3
      ? {
          workoutId: mockContext3.workout?.id,
          milestoneId: (mockContext3 as any).milestone?.id,
          streakDays: (mockContext3 as any).streakDays,
        }
      : undefined;
    
    console.log('Test 3 - Partial context:', normalizedContext3);
    
    return {
      test1: normalizedContext1,
      test2: normalizedContext2,
      test3: normalizedContext3
    };
  };

  return {
    evolutionCandidates,
    evolutionHistory,
    canEvolve,
    evolvePokemon,
    loadEvolutionData,
    updateEvolutionProgress,
    checkForEvolutionCandidates,
    calculateEvolutionConditions,
    handleActivityEvent,
    testContextNormalization // Export the test function
  };
};
