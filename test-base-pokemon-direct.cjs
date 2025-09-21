// Direct test of base Pokemon implementation
const fs = require('fs');

// Read the compiled pokemonApi.js file
const pokemonApiContent = fs.readFileSync('./dist/src/utils/pokemonApi.js', 'utf8');

// Check if the getBasePokemon function exists
if (pokemonApiContent.includes('function getBasePokemon()')) {
  console.log('✓ getBasePokemon function exists in pokemonApi.js');
} else {
  console.log('✗ getBasePokemon function does not exist in pokemonApi.js');
}

// Check if getRandomPokemon uses getBasePokemon
if (pokemonApiContent.includes('const basePokemonIds = getBasePokemon()')) {
  console.log('✓ getRandomPokemon uses getBasePokemon function');
} else {
  console.log('✗ getRandomPokemon does not use getBasePokemon function');
}

// Read the compiled evolutionDataSources.js file
const evolutionDataContent = fs.readFileSync('./dist/src/utils/evolutionDataSources.js', 'utf8');

// Check if FALLBACK_EVOLUTION_DATA exists
if (evolutionDataContent.includes('const FALLBACK_EVOLUTION_DATA')) {
  console.log('✓ FALLBACK_EVOLUTION_DATA exists in evolutionDataSources.js');
} else {
  console.log('✗ FALLBACK_EVOLUTION_DATA does not exist in evolutionDataSources.js');
}

// Check if evolutionDataProvider exports evolutionDataProvider
if (evolutionDataContent.includes('export const evolutionDataProvider')) {
  console.log('✓ evolutionDataProvider is exported from evolutionDataSources.js');
} else {
  console.log('✗ evolutionDataProvider is not exported from evolutionDataSources.js');
}

console.log('Direct verification completed');
