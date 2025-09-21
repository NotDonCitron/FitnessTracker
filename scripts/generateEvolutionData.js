const fs = require('fs');
const path = require('path');

// Import the pokemonAPI utility
// Note: This requires transpiling TypeScript or using a loader
// For simplicity, we'll implement the API calls directly in this script

class EvolutionDataGenerator {
  constructor() {
    this.baseUrl = 'https://pokeapi.co/api/v2';
    this.generatedData = {};
    this.errors = [];
    this.rateLimitDelay = 100; // 100ms between requests to be respectful
  }

  // Fetch with retry logic and timeout
  async fetchWithRetry(url, retries = 3) {
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

        const response = await fetch(url, {
          signal: controller.signal
        });

        clearTimeout(timeoutId);
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        return await response.json();
      } catch (error) {
        if (attempt === retries) {
          throw error;
        }
        
        // Exponential backoff
        const delay = 1000 * Math.pow(2, attempt);
        console.log(`Attempt ${attempt + 1} failed for ${url}, retrying in ${delay}ms...`);
        await this.sleep(delay);
      }
    }
  }

  // Sleep utility
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Get evolution chain for a Pokemon
  async getEvolutionChain(pokemonId) {
    try {
      // First get the Pokemon species to find evolution chain URL
      console.log(`Fetching species data for Pokemon ${pokemonId}...`);
      const speciesData = await this.fetchWithRetry(`${this.baseUrl}/pokemon-species/${pokemonId}`);
      
      // Extract evolution chain ID from URL
      const evolutionChainUrl = speciesData.evolution_chain.url;
      const chainId = evolutionChainUrl.split('/').filter(Boolean).pop();
      
      console.log(`Fetching evolution chain ${chainId} for Pokemon ${pokemonId}...`);
      const chainData = await this.fetchWithRetry(`${this.baseUrl}/evolution-chain/${chainId}`);
      
      return this.parseEvolutionChain(chainData);
    } catch (error) {
      console.error(`Error fetching evolution data for Pokemon ${pokemonId}:`, error.message);
      this.errors.push({ pokemonId, error: error.message });
      return null;
    }
  }

  // Parse evolution chain data into our format
  parseEvolutionChain(chainData) {
    const parseStage = (stage) => {
      const evolutionDetails = stage.evolution_details || [];
      const requirements = evolutionDetails.map(detail => ({
        trigger: detail.trigger?.name || 'unknown',
        level: detail.min_level,
        item: detail.item?.name,
        heldItem: detail.held_item?.name,
        timeOfDay: detail.time_of_day,
        location: detail.location?.name,
        knownMove: detail.known_move?.name,
        knownMoveType: detail.known_move_type?.name,
        minLevel: detail.min_level,
        gender: detail.gender === 1 ? 'female' : detail.gender === 2 ? 'male' : undefined,
        relativePhysicalStats: detail.relative_physical_stats,
        partySpecies: detail.party_species?.name,
        partyType: detail.party_type?.name,
        tradeSpecies: detail.trade_species?.name,
        needsOverworldRain: detail.needs_overworld_rain,
        turnUpsideDown: detail.turn_upside_down
      }));

      return {
        id: Number(stage.species.url.split('/').filter(Boolean).pop()),
        name: stage.species.name,
        evolvesTo: stage.evolves_to.map(parseStage),
        evolutionRequirements: requirements.length > 0 ? requirements : undefined
      };
    };

    return {
      id: chainData.id,
      chain: [parseStage(chainData.chain)],
      timestamp: Date.now()
    };
  }

  // Convert evolution chain to FALLBACK_EVOLUTION_DATA format
  convertToFallbackFormat(evolutionChain) {
    if (!evolutionChain || !evolutionChain.chain || evolutionChain.chain.length === 0) {
      return null;
    }

    // Extract the first element from the chain array (which is an EvolutionStage)
    const firstStage = evolutionChain.chain[0];
    
    // Convert to the exact format needed for FALLBACK_EVOLUTION_DATA
    const convertStage = (stage) => ({
      id: stage.id,
      name: stage.name,
      evolvesTo: stage.evolvesTo ? stage.evolvesTo.map(convertStage) : []
    });

    return convertStage(firstStage);
  }

  // Generate evolution data for Pokemon IDs 667-1025
  async generateEvolutionData() {
    console.log('Starting evolution data generation for Pokemon IDs 667-1025...');
    console.log('This may take a while due to rate limiting...\n');

    const startId = 667;
    const endId = 1025;
    const totalPokemon = endId - startId + 1;
    let processed = 0;

    for (let pokemonId = startId; pokemonId <= endId; pokemonId++) {
      try {
        console.log(`Processing Pokemon ${pokemonId} (${processed + 1}/${totalPokemon})...`);
        
        const evolutionChain = await this.getEvolutionChain(pokemonId);
        
        if (evolutionChain) {
          const fallbackData = this.convertToFallbackFormat(evolutionChain);
          
          if (fallbackData) {
            this.generatedData[pokemonId] = fallbackData;
            console.log(`✓ Successfully processed Pokemon ${pokemonId}: ${fallbackData.name}`);
          } else {
            console.log(`⚠ No valid evolution data for Pokemon ${pokemonId}`);
          }
        } else {
          console.log(`✗ Failed to fetch data for Pokemon ${pokemonId}`);
        }
        
        processed++;
        
        // Progress update every 10 Pokemon
        if (processed % 10 === 0) {
          console.log(`\nProgress: ${processed}/${totalPokemon} (${Math.round(processed/totalPokemon*100)}%)`);
          console.log(`Errors so far: ${this.errors.length}\n`);
        }
        
        // Rate limiting - wait between requests
        await this.sleep(this.rateLimitDelay);
        
      } catch (error) {
        console.error(`Unexpected error processing Pokemon ${pokemonId}:`, error);
        this.errors.push({ pokemonId, error: error.message });
        processed++;
      }
    }

    console.log('\n=== Generation Complete ===');
    console.log(`Total Pokemon processed: ${processed}`);
    console.log(`Successful entries: ${Object.keys(this.generatedData).length}`);
    console.log(`Errors: ${this.errors.length}`);
    
    return this.generatedData;
  }

  // Generate TypeScript code snippet
  generateTypeScriptCode() {
    const entries = Object.entries(this.generatedData)
      .sort(([a], [b]) => Number(a) - Number(b))
      .map(([id, data]) => {
        const formatEvolvesTo = (evolvesTo) => {
          if (!evolvesTo || evolvesTo.length === 0) {
            return '[]';
          }
          
          return `[
${evolvesTo.map(evolution => `      {
        id: ${evolution.id},
        name: '${evolution.name}',
        evolvesTo: ${formatEvolvesTo(evolution.evolvesTo)}
      }`).join(',\n')}
    ]`;
        };

        return `  ${id}: { // ${data.name.charAt(0).toUpperCase() + data.name.slice(1)}
    id: ${data.id},
    name: '${data.name}',
    evolvesTo: ${formatEvolvesTo(data.evolvesTo)}
  }`;
      });

    const generationComments = {
      667: '  // Generation 7 (Alola) - Pokemon IDs 667-809',
      810: '  // Generation 8 (Galar) - Pokemon IDs 810-905', 
      906: '  // Generation 9 (Paldea) - Pokemon IDs 906-1025'
    };

    let codeLines = [];
    
    entries.forEach((entry, index) => {
      const id = Object.keys(this.generatedData)[index];
      
      // Add generation comment if this is the start of a new generation
      if (generationComments[id]) {
        if (codeLines.length > 0) {
          codeLines.push('');
        }
        codeLines.push(generationComments[id]);
      }
      
      codeLines.push(entry);
    });

    return `// Generated evolution data for Pokemon IDs 667-1025
// Generated on: ${new Date().toISOString()}
// Total entries: ${Object.keys(this.generatedData).length}

const GENERATION_7_9_EVOLUTION_DATA: Record<number, EvolutionStage> = {
${codeLines.join(',\n')}
};

// To integrate this data, add these entries to the existing FALLBACK_EVOLUTION_DATA object
// in src/utils/evolutionDataSources.ts`;
  }

  // Save output to file
  async saveOutput() {
    const outputDir = path.join(__dirname, 'output');
    
    // Create output directory if it doesn't exist
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    
    // Save TypeScript code
    const tsCode = this.generateTypeScriptCode();
    const tsFilePath = path.join(outputDir, `evolution-data-gen7-9-${timestamp}.ts`);
    fs.writeFileSync(tsFilePath, tsCode, 'utf8');
    console.log(`TypeScript code saved to: ${tsFilePath}`);

    // Save raw JSON data
    const jsonData = {
      metadata: {
        generatedAt: new Date().toISOString(),
        totalEntries: Object.keys(this.generatedData).length,
        errors: this.errors.length,
        pokemonRange: '667-1025',
        generations: 'Gen 7-9'
      },
      data: this.generatedData,
      errors: this.errors
    };
    
    const jsonFilePath = path.join(outputDir, `evolution-data-gen7-9-${timestamp}.json`);
    fs.writeFileSync(jsonFilePath, JSON.stringify(jsonData, null, 2), 'utf8');
    console.log(`Raw JSON data saved to: ${jsonFilePath}`);

    // Save error report if there are errors
    if (this.errors.length > 0) {
      const errorReport = this.errors.map(err => 
        `Pokemon ${err.pokemonId}: ${err.error}`
      ).join('\n');
      
      const errorFilePath = path.join(outputDir, `errors-${timestamp}.txt`);
      fs.writeFileSync(errorFilePath, errorReport, 'utf8');
      console.log(`Error report saved to: ${errorFilePath}`);
    }

    return {
      tsFilePath,
      jsonFilePath,
      errorFilePath: this.errors.length > 0 ? path.join(outputDir, `errors-${timestamp}.txt`) : null
    };
  }

  // Generate summary report
  generateSummary() {
    const totalGenerated = Object.keys(this.generatedData).length;
    const totalErrors = this.errors.length;
    const totalAttempted = 1025 - 667 + 1; // 359 Pokemon

    console.log('\n=== GENERATION SUMMARY ===');
    console.log(`Pokemon range: 667-1025 (Generations 7-9)`);
    console.log(`Total attempted: ${totalAttempted}`);
    console.log(`Successfully generated: ${totalGenerated}`);
    console.log(`Errors: ${totalErrors}`);
    console.log(`Success rate: ${Math.round(totalGenerated/totalAttempted*100)}%`);
    
    if (this.errors.length > 0) {
      console.log('\nErrors encountered:');
      this.errors.slice(0, 10).forEach(err => {
        console.log(`  - Pokemon ${err.pokemonId}: ${err.error}`);
      });
      if (this.errors.length > 10) {
        console.log(`  ... and ${this.errors.length - 10} more errors`);
      }
    }

    // Sample of generated data
    const sampleIds = Object.keys(this.generatedData).slice(0, 5);
    if (sampleIds.length > 0) {
      console.log('\nSample generated entries:');
      sampleIds.forEach(id => {
        const data = this.generatedData[id];
        console.log(`  - ${id}: ${data.name} (${data.evolvesTo.length} evolution${data.evolvesTo.length !== 1 ? 's' : ''})`);
      });
    }
  }
}

// Main execution function
async function main() {
  console.log('Pokemon Evolution Data Generator');
  console.log('================================');
  console.log('Generating evolution data for Pokemon IDs 667-1025 (Generations 7-9)');
  console.log('This script will fetch data from PokeAPI and convert it to the format needed for FALLBACK_EVOLUTION_DATA\n');

  const generator = new EvolutionDataGenerator();
  
  try {
    // Generate the evolution data
    await generator.generateEvolutionData();
    
    // Save output files
    const outputFiles = await generator.saveOutput();
    
    // Generate summary
    generator.generateSummary();
    
    console.log('\n=== FILES GENERATED ===');
    console.log(`TypeScript code: ${outputFiles.tsFilePath}`);
    console.log(`JSON data: ${outputFiles.jsonFilePath}`);
    if (outputFiles.errorFilePath) {
      console.log(`Error report: ${outputFiles.errorFilePath}`);
    }
    
    console.log('\n=== NEXT STEPS ===');
    console.log('1. Review the generated TypeScript code');
    console.log('2. Copy the evolution data entries to src/utils/evolutionDataSources.ts');
    console.log('3. Add the entries to the existing FALLBACK_EVOLUTION_DATA object');
    console.log('4. Run tests to verify the integration');
    
  } catch (error) {
    console.error('Fatal error during generation:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\nReceived SIGINT. Gracefully shutting down...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\nReceived SIGTERM. Gracefully shutting down...');
  process.exit(0);
});

// Run the script
if (require.main === module) {
  main().catch(error => {
    console.error('Unhandled error:', error);
    process.exit(1);
  });
}

module.exports = { EvolutionDataGenerator };