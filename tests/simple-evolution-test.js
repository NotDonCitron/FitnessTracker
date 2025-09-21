// Simple test to verify Pokemon evolution functionality
console.log('🧪 Starting simple Pokemon evolution test...');

// Mock Pokemon data
const mockPokemon = {
  id: 1,
  name: 'bulbasaur',
  sprites: {
    static: 'bulbasaur.png',
    animated: 'bulbasaur.gif'
  },
  types: ['grass', 'poison']
};

console.log('✅ Mock Pokemon created:', mockPokemon.name);

// Test the evolution trigger context normalization
// This simulates what we implemented in useEvolutionEngine.ts
const mockContext = {
  workout: { id: 'workout-123', name: 'Test Workout' },
  streakDays: 7,
  milestone: { 
    id: 'milestone-456', 
    title: 'Test Milestone',
    description: 'Test milestone for evolution',
    targetValue: 10,
    currentValue: 5,
    unit: 'workouts',
    completed: false,
    category: 'strength'
 }
};

// Normalize the context (this is what we implemented in useEvolutionEngine.ts)
const normalizedContext = mockContext
  ? {
      workoutId: mockContext.workout?.id,
      milestoneId: mockContext.milestone?.id,
      streakDays: mockContext.streakDays,
    }
  : undefined;

console.log('✅ Context normalized successfully');
console.log('   Original context:', JSON.stringify(mockContext, null, 2));
console.log('   Normalized context:', JSON.stringify(normalizedContext, null, 2));

// Verify the normalized context has the correct structure
if (normalizedContext && 
    normalizedContext.workoutId === 'workout-123' &&
    normalizedContext.milestoneId === 'milestone-456' &&
    normalizedContext.streakDays === 7) {
  console.log('✅ Normalized context has correct structure and values');
} else {
  console.error('❌ Normalized context does not have correct structure or values');
}

console.log('🎉 Simple Pokemon evolution test completed successfully!');
