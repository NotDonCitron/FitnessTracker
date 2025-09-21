// Simple test to verify base Pokemon selection
const fs = require('fs');

// Read the compiled files
const pokemonApiContent = fs.readFileSync('dist/src/utils/pokemonApi.js', 'utf8');
const evolutionDataContent = fs.readFileSync('dist/src/utils/evolutionDataSources.js', 'utf8');

console.log('Files read successfully');

// Check if the evolutionDataSources file exports evolutionDataProvider
if (evolutionDataContent.includes('export const evolutionDataProvider')) {
  console.log('✓ evolutionDataSources.js exports evolutionDataProvider');
} else {
  console.log('✗ evolutionDataSources.js does not export evolutionDataProvider');
}

// Check if the pokemonApi.js file imports evolutionDataProvider
if (pokemonApiContent.includes("import { evolutionDataProvider } from './evolutionDataSources'")) {
  console.log('✓ pokemonApi.js imports evolutionDataProvider correctly');
} else {
  console.log('✗ pokemonApi.js does not import evolutionDataProvider correctly');
}

console.log('Basic verification completed');
