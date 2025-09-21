// Generation 7-9 Evolution Tests
import { useEvolutionEngine } from '../src/hooks/useEvolutionEngine';

// Mock data and utilities
const mockWorkouts = [
  {
    id: '1',
    name: 'Test Workout',
    exercises: [
      {
        id: '1',
        exercise: {
          name: 'Push-ups',
          category: 'strength'
        },
        sets: 3,
        reps: 10,
        weight: 0,
        completed: true
      }
    ],
    completed: true,
    timestamp: new Date().toISOString()
  }
];

// Mock the evolution data provider
jest.mock('../src/utils/evolutionDataSources', () => ({
  evolutionDataProvider: {
    getEvolutionChain: jest.fn()
 }
}));

// Mock the pokemon API
jest.mock('../src/utils/pokemonApi', () => ({
  pokemonAPI: {
    getPokemonTypes: jest.fn(),
    getPokemon: jest.fn()
  }
}));

describe('Generation 7-9 Pokemon Evolution Requirements', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should require 3-20 workouts for evolution', async () => {
    // Mock evolution chain data for a Gen 7-9 Pokemon
    const mockEvolutionChain = [
      {
        id: 722, // Rowlet (Gen 7)
        name: 'rowlet',
        evolvesTo: [{
          id: 723,
          name: 'dartrix',
          evolvesTo: [{
            id: 724,
            name: 'decidueye',
            evolvesTo: []
          }]
        }]
      }
    ];

    const { evolutionDataProvider } = require('../src/utils/evolutionDataSources');
    evolutionDataProvider.getEvolutionChain.mockResolvedValue(mockEvolutionChain);

    const { useEvolutionEngine } = require('../src/hooks/useEvolutionEngine');
    const { calculateEvolutionConditions } = useEvolutionEngine({ workouts: mockWorkouts });

    const conditions = await calculateEvolutionConditions(mockEvolutionChain, 722);
    
    // Verify requirements are within 3-20 range
    expect(conditions.requiredWorkouts).toBeGreaterThanOrEqual(3);
    expect(conditions.requiredWorkouts).toBeLessThanOrEqual(20);
  });

  test('should adapt requirements based on Pokemon type', async () => {
    // Mock evolution chain data
    const mockEvolutionChain = [
      {
        id: 810, // Grookey (Gen 8)
        name: 'grookey',
        evolvesTo: [{
          id: 811,
          name: 'thwackey',
          evolvesTo: [{
            id: 812,
            name: 'rillaboom',
            evolvesTo: []
          }]
        }]
      }
    ];

    const { evolutionDataProvider } = require('../src/utils/evolutionDataSources');
    evolutionDataProvider.getEvolutionChain.mockResolvedValue(mockEvolutionChain);

    // Mock Pokemon types API
    const { pokemonAPI } = require('../src/utils/pokemonApi');
    pokemonAPI.getPokemonTypes.mockResolvedValue(['grass']);

    const { useEvolutionEngine } = require('../src/hooks/useEvolutionEngine');
    const { calculateEvolutionConditions } = useEvolutionEngine({ workouts: mockWorkouts });

    const conditions = await calculateEvolutionConditions(mockEvolutionChain, 810);
    
    // Verify type-based requirements are calculated
    expect(conditions.requiredTypes).toContain('grass');
    expect(pokemonAPI.getPokemonTypes).toHaveBeenCalledWith(811); // Next evolution ID
  });
});
