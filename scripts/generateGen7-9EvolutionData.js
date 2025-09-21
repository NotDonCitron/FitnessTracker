const https = require('https');
const fs = require('fs');

// Function to make API requests with retry logic
function makeRequest(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (error) {
          reject(error);
        }
      });
    }).on('error', reject);
  });
}

// Function to get Pokemon species data
async function getPokemonSpecies(id) {
  try {
    const url = `https://pokeapi.co/api/v2/pokemon-species/${id}`;
    return await makeRequest(url);
  } catch (error) {
    console.warn(`Failed to fetch species data for Pokemon ${id}:`, error.message);
    return null;
  }
}

// Function to get evolution chain data
async function getEvolutionChain(chainUrl) {
  try {
    return await makeRequest(chainUrl);
  } catch (error) {
    console.warn(`Failed to fetch evolution chain:`, error.message);
    return null;
  }
}

// Function to parse evolution chain into our format
function parseEvolutionChain(chainData) {
  const evolutionStages = new Map();
  
  function processChain(chain) {
    const pokemonId = parseInt(chain.species.url.split('/').slice(-2, -1)[0]);
    const pokemonName = chain.species.name;
    
    // Create evolution stage
    const stage = {
      id: pokemonId,
      name: pokemonName,
      evolvesTo: []
    };
    
    // Process evolutions
    if (chain.evolves_to && chain.evolves_to.length > 0) {
      for (const evolution of chain.evolves_to) {
        const evolvedId = parseInt(evolution.species.url.split('/').slice(-2, -1)[0]);
        const evolvedName = evolution.species.name;
        
        stage.evolvesTo.push({
          id: evolvedId,
          name: evolvedName,
          evolvesTo: []
        });
        
        // Recursively process further evolutions
        processChain(evolution);
      }
    }
    
    evolutionStages.set(pokemonId, stage);
  }
  
  processChain(chainData.chain);
  return evolutionStages;
}

// Main function to generate evolution data
async function generateEvolutionData() {
  console.log('🚀 Starting Generation 7-9 Pokemon evolution data generation...');
  
  const evolutionData = {};
  const processedChains = new Set();
  
  // Process Pokemon IDs 667-1025 (Generation 7-9)
  for (let id = 667; id <= 1025; id++) {
    console.log(`Processing Pokemon ${id}...`);
    
    try {
      // Get species data
      const speciesData = await getPokemonSpecies(id);
      if (!speciesData) {
        console.log(`  ⚠️ No species data for Pokemon ${id}`);
        continue;
      }
      
      // Get evolution chain URL
      const chainUrl = speciesData.evolution_chain.url;
      const chainId = chainUrl.split('/').slice(-2, -1)[0];
      
      // Skip if we've already processed this chain
      if (processedChains.has(chainId)) {
        console.log(`  ✅ Evolution chain already processed for Pokemon ${id}`);
        continue;
      }
      
      // Get evolution chain data
      const chainData = await getEvolutionChain(chainUrl);
      if (!chainData) {
        console.log(`  ⚠️ No evolution chain data for Pokemon ${id}`);
        continue;
      }
      
      // Parse evolution chain
      const stages = parseEvolutionChain(chainData);
      
      // Add stages to our data
      for (const [pokemonId, stage] of stages) {
        if (pokemonId >= 667 && pokemonId <= 1025) {
          evolutionData[pokemonId] = stage;
          console.log(`  ✅ Added evolution data for ${stage.name} (${pokemonId})`);
        }
      }
      
      processedChains.add(chainId);
      
      // Rate limiting to avoid overwhelming the API
      await new Promise(resolve => setTimeout(resolve, 100));
      
    } catch (error) {
      console.error(`  ❌ Error processing Pokemon ${id}:`, error.message);
    }
  }
  
  // Generate TypeScript code
  const tsCode = generateTypeScriptCode(evolutionData);
  
  // Save to file
  fs.writeFileSync('generation7-9-evolution-data.ts', tsCode);
  
  console.log('\n🎉 Generation complete!');
  console.log(`📊 Generated evolution data for ${Object.keys(evolutionData).length} Pokemon`);
  console.log('📁 Data saved to: generation7-9-evolution-data.ts');
 console.log('\n📋 Next steps:');
  console.log('1. Review the generated data in generation7-9-evolution-data.ts');
  console.log('2. Copy the data to src/utils/evolutionDataSources.ts');
  console.log('3. Add it to the FALLBACK_EVOLUTION_DATA object');
}

// Function to generate TypeScript code
function generateTypeScriptCode(evolutionData) {
  let code = `// Generated Evolution Data for Generation 7-9 Pokemon (IDs 667-1025)\n`;
  code += `// Generated on: ${new Date().toISOString()}\n\n`;
  
  code += `// Add this data to the FALLBACK_EVOLUTION_DATA object in evolutionDataSources.ts\n`;
  code += `const GENERATION_7_9_DATA = {\n`;
  
  const sortedIds = Object.keys(evolutionData).map(Number).sort((a, b) => a - b);
  
  for (const id of sortedIds) {
    const stage = evolutionData[id];
    code += `  ${id}: { // ${stage.name}\n`;
    code += `    id: ${stage.id},\n`;
    code += `    name: '${stage.name}',\n`;
    
    if (stage.evolvesTo.length > 0) {
      code += `    evolvesTo: [\n`;
      for (const evolution of stage.evolvesTo) {
        code += `      {\n`;
        code += `        id: ${evolution.id},\n`;
        code += `        name: '${evolution.name}',\n`;
        code += `        evolvesTo: []\n`;
        code += `      }${stage.evolvesTo.indexOf(evolution) < stage.evolvesTo.length - 1 ? ',' : ''}\n`;
      }
      code += `    ]\n`;
    } else {
      code += `    evolvesTo: []\n`;
    }
    
    code += `  }${sortedIds.indexOf(id) < sortedIds.length - 1 ? ',' : ''}\n`;
  }
  
  code += `};\n\n`;
  code += `export default GENERATION_7_9_DATA;\n`;
  
  return code;
}

// Run the script
generateEvolutionData().catch(console.error);
