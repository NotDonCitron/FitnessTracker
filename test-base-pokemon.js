// Simple test to verify base Pokemon selection
import { getRandomPokemon } from './dist/src/utils/pokemonApi.js';
import { evolutionDataProvider } from './dist/src/utils/evolutionDataSources.js';

async function testBasePokemon() {
 console.log('Testing base Pokemon selection...');
  
  // Get base Pokemon IDs from evolution data
  const evolutionData = evolutionDataProvider.fallbackData;
  const basePokemonIds = Object.keys(evolutionData).map(Number);
  console.log(`Total base Pokemon: ${basePokemonIds.length}`);
  
  // Test multiple random selections
 const testCount = 5;
  console.log(`Testing ${testCount} random Pokemon selections...`);
  
  for (let i = 0; i < testCount; i++) {
    try {
      const pokemon = await getRandomPokemon();
      const isBasePokemon = basePokemonIds.includes(pokemon.id);
      console.log(`Selected Pokemon: ${pokemon.name} (ID: ${pokemon.id}) - ${isBasePokemon ? 'BASE' : 'NOT BASE'}`);
    } catch (error) {
      console.error(`Error fetching Pokemon:`, error);
    }
  }
  
  console.log('Test completed!');
}

testBasePokemon();
