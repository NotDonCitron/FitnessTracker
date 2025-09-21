// Simple manual test to verify base Pokemon selection
// This test directly uses the compiled JavaScript files

// Import the getRandomPokemon function
import { getRandomPokemon } from './dist/src/utils/pokemonApi.js';

// Import the evolution data
import { evolutionDataProvider } from './dist/src/utils/evolutionDataSources.js';

async function testBasePokemon() {
  console.log('Testing base Pokemon selection...');
  
  // Get base Pokemon IDs from evolution data
  const evolutionData = evolutionDataProvider.fallbackData;
  const basePokemonIds = Object.keys(evolutionData).map(Number);
  console.log(`Total base Pokemon: ${basePokemonIds.length}`);
  
  // Show some examples of base Pokemon
  console.log('First 10 base Pokemon IDs:', basePokemonIds.slice(0, 10));
  
  // Test multiple random selections
 const testCount = 5;
  console.log(`Testing ${testCount} random Pokemon selections...`);
  
  for (let i = 0; i < testCount; i++) {
    try {
      const pokemon = await getRandomPokemon();
      const isBasePokemon = basePokemonIds.includes(pokemon.id);
      console.log(`Selected Pokemon: ${pokemon.name} (ID: ${pokemon.id}) - ${isBasePokemon ? 'BASE' : 'NOT BASE'}`);
      
      // Verify it's a base Pokemon
      if (!isBasePokemon) {
        console.error(`ERROR: Non-base Pokemon selected! ${pokemon.name} (ID: ${pokemon.id})`);
        return false;
      }
    } catch (error) {
      console.error(`Error fetching Pokemon:`, error);
      return false;
    }
  }
  
  console.log('All tests passed! getRandomPokemon correctly returns only base Pokemon.');
  return true;
}

// Run the test
testBasePokemon().then(success => {
  if (success) {
    console.log('✅ Base Pokemon selection test PASSED');
  } else {
    console.log('❌ Base Pokemon selection test FAILED');
  }
});
