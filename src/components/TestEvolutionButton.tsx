import React, { useState } from 'react';
import { Sparkles, Zap } from 'lucide-react';
import { usePokemonRewards } from '../hooks/usePokemonRewards';
import { useEvolutionEngine } from '../hooks/useEvolutionEngine';
import { useWorkouts } from '../hooks/useWorkouts';
import { pokemonAPI } from '../utils/pokemonApi';
import { PokemonWithEvolution } from '../types/pokemon';

interface TestEvolutionButtonProps {
  onEvolutionTriggered?: (fromPokemon: PokemonWithEvolution, toPokemon: PokemonWithEvolution, reason: string) => void;
}

const TestEvolutionButton: React.FC<TestEvolutionButtonProps> = ({ onEvolutionTriggered }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [eligiblePokemon, setEligiblePokemon] = useState<PokemonWithEvolution[]>([]);
  const [showSelectionModal, setShowSelectionModal] = useState(false);

  const { workouts } = useWorkouts();
  const { rewards } = usePokemonRewards({ workouts, onEvolutionTriggered });
  const { loadEvolutionData, evolvePokemon } = useEvolutionEngine({ workouts });

  // Only show in development mode
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  const handleScanForEvolution = async () => {
    setIsScanning(true);

    try {
      const candidates: PokemonWithEvolution[] = [];

      for (const reward of rewards) {
        // Load evolution data for this Pokemon
        const pokemonWithEvolution = await loadEvolutionData(reward.pokemon);

        // Include ALL Pokemon in test mode (we can force evolution even for final forms)
        if (pokemonWithEvolution.evolutionData) {
          candidates.push(pokemonWithEvolution);
        }
      }

      setEligiblePokemon(candidates);

      if (candidates.length > 0) {
        setShowSelectionModal(true);
      } else {
        alert('No evolvable Pokemon found in your collection. Pokemon that are already at their final evolution stage cannot evolve further. Try collecting more Pokemon through workouts!');
      }
    } catch (error) {
      console.error('Error scanning for evolution candidates:', error);
      alert('Error scanning for evolution candidates. Check console for details.');
    } finally {
      setIsScanning(false);
    }
  };

  const handleEvolutionSelect = async (pokemon: PokemonWithEvolution) => {
    setShowSelectionModal(false);

    console.log('🎯 [TEST] Starting evolution for:', pokemon.name, {
      canEvolve: pokemon.canEvolve,
      hasNextEvolutions: pokemon.evolutionData?.nextEvolutions?.length || 0,
      nextEvolution: pokemon.evolutionData?.nextEvolutions?.[0]?.name,
      evolutionProgress: pokemon.evolutionProgress,
      requiredTypes: pokemon.evolutionProgress?.requiredTypes,
      workoutTypes: pokemon.evolutionProgress?.workoutTypes
    });

    try {
      // First try normal evolution through the evolution engine
      let evolvedPokemon = await evolvePokemon(pokemon, {
        triggerType: 'test_mode',
        triggerReason: 'Test mode evolution visualization',
        activityLevel: 'active'
      });

      // If normal evolution failed, create a test evolution manually
      if (!evolvedPokemon) {
        console.log('🔄 [TEST] Normal evolution failed, creating test evolution manually...');

        // Determine target evolution
        let targetEvolutionId = pokemon.id + 1;
        let targetEvolutionName = '';

        // Try to get the actual next evolution from the chain
        if (pokemon.evolutionData?.evolutionChain && pokemon.evolutionData.evolutionChain.length > 0) {
          const findNextEvolution = (chain: any[]): any | null => {
            for (const stage of chain) {
              if (stage.id === pokemon.id) {
                if (stage.evolvesTo && stage.evolvesTo.length > 0) {
                  return stage.evolvesTo[0];
                }
                // If final form, cycle back to first for visualization
                return chain[0];
              }
              if (stage.evolvesTo && stage.evolvesTo.length > 0) {
                const nextEvo = findNextEvolution(stage.evolvesTo);
                if (nextEvo) return nextEvo;
              }
            }
            return null;
          };

          const nextEvolution = findNextEvolution(pokemon.evolutionData.evolutionChain);
          if (nextEvolution) {
            targetEvolutionId = nextEvolution.id;
            targetEvolutionName = nextEvolution.name;
          }
        }

        // Create the evolved Pokemon data
        try {
          const evolvedPokemonData = await pokemonAPI.getPokemon(targetEvolutionId);
          
          const fullEvolvedPokemon: PokemonWithEvolution = {
            id: evolvedPokemonData.id,
            name: evolvedPokemonData.name,
            sprites: {
              static: evolvedPokemonData.sprites?.static || `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${targetEvolutionId}.png`,
              animated: evolvedPokemonData.sprites?.animated || `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/${targetEvolutionId}.gif`
            },
            types: evolvedPokemonData.types || ['normal'],
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

          // Trigger the evolution modal through the callback
          console.log('🎬 [TEST] Triggering evolution modal:', {
            from: pokemon.name,
            to: fullEvolvedPokemon.name,
            reason: 'Test mode evolution visualization',
            callbackExists: !!onEvolutionTriggered
          });

          if (onEvolutionTriggered) {
            onEvolutionTriggered(pokemon, fullEvolvedPokemon, 'Test mode evolution visualization');
          } else {
            console.warn('⚠️ [TEST] No onEvolutionTriggered callback available');
            alert('Evolution completed, but modal callback is not available.');
          }
        } catch (apiError) {
          console.error('❌ [TEST] Failed to fetch Pokemon data:', apiError);
          
          // Fallback with basic data
          const fallbackEvolvedPokemon: PokemonWithEvolution = {
            id: targetEvolutionId,
            name: targetEvolutionName || `pokemon-${targetEvolutionId}`,
            sprites: {
              static: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${targetEvolutionId}.png`,
              animated: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/${targetEvolutionId}.gif`
            },
            types: ['normal'],
            evolutionData: {
              currentForm: {
                id: targetEvolutionId,
                name: targetEvolutionName || `pokemon-${targetEvolutionId}`,
                sprites: {
                  static: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${targetEvolutionId}.png`,
                  animated: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/${targetEvolutionId}.gif`
                },
                types: ['normal']
              },
              evolutionChain: [],
              nextEvolutions: [],
              evolutionRequirements: undefined
            },
            evolutionProgress: {
              currentLevel: 2,
              workoutsCompleted: 0,
              workoutTypes: [],
              lastEvolutionCheck: new Date().toISOString(),
              requiredWorkouts: 0,
              requiredTypes: []
            },
            canEvolve: false
          };

          if (onEvolutionTriggered) {
            onEvolutionTriggered(pokemon, fallbackEvolvedPokemon, 'Test mode evolution visualization (fallback)');
          }
        }
      } else {
        console.log('✅ [TEST] Normal evolution successful:', pokemon.name, '->', evolvedPokemon.name);
      }
    } catch (error) {
      console.error('❌ [TEST] Error during test evolution:', error);
      alert('Error during evolution. Check console for details.');
    }
  };
    
      // Test function to detect Pokemon types
      const testTypeDetection = async () => {
        console.log('🔍 [TEST] Starting type detection test...');
        
        // Test with a few known Pokémon
        const testPokemonIds = [25, 1, 4, 7, 252, 255, 258]; // Pikachu, Bulbasaur, Charmander, Squirtle, Treecko, Torchic, Mudkip
        
        for (const id of testPokemonIds) {
          try {
            const pokemonData = await pokemonAPI.getPokemon(id);
            console.log(`✅ [TEST] ${pokemonData.name} (ID: ${id}) - Types:`, pokemonData.types);
          } catch (error) {
            console.error(`❌ [TEST] Failed to fetch Pokemon ${id}:`, error);
          }
        }
        
        alert('Type detection test completed! Check console for results.');
      };
    
      return (
    <>
          <div className="flex gap-2">
            <button
              onClick={handleScanForEvolution}
              disabled={isScanning}
              className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors"
              title="Development tool: Manually trigger Pokemon evolution"
            >
              {isScanning ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Scanning...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Test Evolution
                </>
              )}
            </button>
            
            <button
              onClick={testTypeDetection}
              className="flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
              title="Development tool: Test Pokemon type detection"
            >
              <Zap className="h-4 w-4 mr-2" />
              Test Types
            </button>
          </div>

      {/* Selection Modal */}
      {showSelectionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
                <Zap className="h-6 w-6 mr-2 text-yellow-500" />
                Select Pokemon to Evolve
              </h2>
              <button
                onClick={() => setShowSelectionModal(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-100"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {eligiblePokemon.map((pokemon) => (
                <button
                  key={pokemon.id}
                  className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-center hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
                  onClick={() => handleEvolutionSelect(pokemon)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleEvolutionSelect(pokemon);
                    }
                  }}
                  tabIndex={0}
                  aria-label={`Select ${pokemon.name} for evolution`}
                >
                  <img
                    src={pokemon.sprites?.static}
                    alt={pokemon.name}
                    className="w-16 h-16 mx-auto mb-2"
                  />
                  <h3 className="font-semibold text-gray-900 dark:text-white">{pokemon.name}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">#{pokemon.id.toString().padStart(3, '0')}</p>
                  {pokemon.evolutionData?.nextEvolutions[0] && (
                    <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                      → {pokemon.evolutionData.nextEvolutions[0].name}
                    </p>
                  )}
                  <div className="mt-2">
                    {pokemon.canEvolve ? (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                        Naturally Eligible
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                        Test Mode Only
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Click on a Pokemon to trigger its evolution!
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TestEvolutionButton;
