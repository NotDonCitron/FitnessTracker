import { useEvolutionEngine } from '../src/hooks/useEvolutionEngine';
import { PokemonWithEvolution, TriggerContext } from '../src/types/pokemon';
import { Workout } from '../src/types/workout';
import { SkillMilestone } from '../src/types/skills';

// Mock data for testing
const mockWorkouts: Workout[] = [
  {
    id: '1',
    name: 'Test Workout',
    date: new Date().toISOString(),
    duration: 30,
    sets: [],
    exercises: [],
    totalSets: 0,
    totalReps: 0,
    totalWeight: 0,
    completed: true
  }
];

const mockPokemon: PokemonWithEvolution = {
  id: 1,
  name: 'bulbasaur',
  sprites: {
    static: 'bulbasaur.png',
    animated: 'bulbasaur.gif'
  },
  types: ['grass', 'poison'],
  evolutionData: {
    currentForm: {
      id: 1,
      name: 'bulbasaur',
      sprites: {
        static: 'bulbasaur.png',
        animated: 'bulbasaur.gif'
      },
      types: ['grass', 'poison']
    },
    evolutionChain: [
      {
        id: 1,
        name: 'bulbasaur',
        evolvesTo: [
          {
            id: 2,
            name: 'ivysaur',
            evolvesTo: [
              {
                id: 3,
                name: 'venusaur',
                evolvesTo: []
              }
            ]
          }
        ]
      }
    ],
    nextEvolutions: [
      {
        id: 2,
        name: 'ivysaur',
        sprites: {
          static: 'ivysaur.png',
          animated: 'ivysaur.gif'
        },
        types: ['grass', 'poison']
      }
    ]
  },
  canEvolve: true,
  evolutionProgress: {
    currentLevel: 1,
    workoutsCompleted: 10,
    workoutTypes: ['grass'],
    requiredWorkouts: 5,
    requiredTypes: ['grass'],
    lastEvolutionCheck: new Date().toISOString()
  }
};

// Test the handleActivityEvent function with normalized context
async function testTriggerContextNormalization() {
  console.log('🧪 Starting TriggerContext normalization test...');
  
  // Create a mock context similar to what would be passed to handleActivityEvent
  const mockContext = {
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
  
  // Create a mock callback to verify the evolved Pokemon
  const onEvolutionTriggered = (fromPokemon: PokemonWithEvolution, toPokemon: PokemonWithEvolution, reason: string) => {
    console.log('✅ Evolution triggered successfully!');
    console.log(`   From: ${fromPokemon.name} (ID: ${fromPokemon.id})`);
    console.log(`   To: ${toPokemon.name} (ID: ${toPokemon.id})`);
    console.log(`   Reason: ${reason}`);
    
    // Verify that the evolved Pokemon has the correct data
    if (toPokemon.id === 2 && toPokemon.name === 'ivysaur') {
      console.log('✅ Evolved Pokemon data is correct!');
    } else {
      console.error('❌ Evolved Pokemon data is incorrect!');
    }
  };
  
  // Initialize the evolution engine
  const { handleActivityEvent } = useEvolutionEngine({ 
    workouts: mockWorkouts, 
    onEvolutionTriggered 
  });
  
  try {
    // Call handleActivityEvent with the mock context
    await handleActivityEvent('workout', mockContext, [mockPokemon]);
    console.log('✅ handleActivityEvent executed successfully!');
  } catch (error) {
    console.error('❌ Error during handleActivityEvent execution:', error);
  }
  
  console.log('🧪 TriggerContext normalization test completed.');
}

// Run the test
testTriggerContextNormalization().catch(console.error);
