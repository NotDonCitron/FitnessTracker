import { getRandomPokemon } from '../dist/src/utils/pokemonApi.js';
import { evolutionDataProvider } from '../dist/src/utils/evolutionDataSources.js';

// Test to verify that getRandomPokemon now returns only base Pokemon
async function testBasePokemonSelection() {
  console.log('Testing base Pokemon selection...');
  
  // Get base Pokemon IDs from evolution data
  const evolutionData = (evolutionDataProvider as any).fallbackData;
  const basePokemonIds = Object.keys(evolutionData).map(Number);
  console.log(`Total base Pokemon: ${basePokemonIds.length}`);
  
  // Test multiple random selections
  const testCount = 10;
  console.log(`Testing ${testCount} random Pokemon selections...`);
  
  for (let i = 0; i < testCount; i++) {
    try {
      const pokemon = await getRandomPokemon();
      const isBasePokemon = basePokemonIds.includes(pokemon.id);
      console.log(`Selected Pokemon: ${pokemon.name} (ID: ${pokemon.id}) - ${isBasePokemon ? 'BASE' : 'NOT BASE'}`);
      
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
testBasePokemonSelection().then(success => {
  if (success) {
    console.log('✅ Base Pokemon selection test PASSED');
  } else {
    console.log('❌ Base Pokemon selection test FAILED');
  }
});
