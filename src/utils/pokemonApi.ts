// Enhanced Pokémon API with caching and optimization
import type { EvolutionStage, EvolutionRequirement } from '../types/pokemon';

interface PokemonSpriteUrls {
  static: string;
  animated?: string;
  fallback: string;
}

interface CachedPokemon {
  id: number;
  name: string;
  sprites: PokemonSpriteUrls;
  types: string[];
  timestamp: number;
}

interface EvolutionChain {
  id: number;
  chain: EvolutionStage[];
  timestamp: number;
}

class PokemonAPI {
  private readonly cache = new Map<number, CachedPokemon>();
  private readonly evolutionCache = new Map<number, EvolutionChain>();
  private readonly typeCache = new Map<number, { types: string[]; timestamp: number }>(); // Cache for Pokemon types
 private readonly cacheExpiry = 24 * 60 * 60 * 1000; // 24 hours
  private readonly loadingPromises = new Map<number, Promise<CachedPokemon>>();
  private readonly evolutionLoadingPromises = new Map<number, Promise<EvolutionChain>>();
  private readonly maxRetries = 3;
  private readonly retryDelay = 1000; // 1 second

  // Enhanced fetch with retry logic and timeout
  private async fetchWithRetry(url: string, options: RequestInit = {}, retries = this.maxRetries): Promise<Response> {
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

        const response = await fetch(url, {
          ...options,
          signal: controller.signal
        });

        clearTimeout(timeoutId);
        return response;
      } catch (error) {
        if (attempt === retries) {
          throw error;
        }

        // Exponential backoff
        const delay = this.retryDelay * Math.pow(2, attempt);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    throw new Error('Max retries exceeded');
  }

  // Optimized sprite URLs for different approaches
  private getSpriteUrls(pokemonData: any): PokemonSpriteUrls {
    const sprites = pokemonData.sprites;

    return {
      static: sprites.front_default,
      animated: sprites.versions?.['generation-v']?.['black-white']?.animated?.front_default ||
               sprites.versions?.['generation-v']?.['black-white']?.front_default,
      fallback: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemonData.id}.png`
    };
  }

  // Preload and cache Pokémon data
  async preloadPokemon(ids: number[]): Promise<void> {
    const promises = ids.map(id => this.getPokemon(id));
    await Promise.allSettled(promises);
  }

  // Get Pokémon with caching
  async getPokemon(id: number): Promise<CachedPokemon> {
    // Check cache first
    const cached = this.cache.get(id);
    if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
      return cached;
    }

    // Check if already loading
    if (this.loadingPromises.has(id)) {
      return this.loadingPromises.get(id)!;
    }

    // Create loading promise
    const loadingPromise = this.fetchPokemon(id);
    this.loadingPromises.set(id, loadingPromise);

    try {
      const pokemon = await loadingPromise;
      this.cache.set(id, pokemon);
      return pokemon;
    } finally {
      this.loadingPromises.delete(id);
    }
  }

  // Get Pokémon types with caching
  async getPokemonTypes(id: number): Promise<string[]> {
    // Check type cache first
    const cachedTypes = this.typeCache.get(id);
    if (cachedTypes && Date.now() - cachedTypes.timestamp < this.cacheExpiry) {
      return cachedTypes.types;
    }

    // Get full Pokémon data (will use main cache if available)
    const pokemon = await this.getPokemon(id);
    const types = pokemon.types;

    // Cache the types
    this.typeCache.set(id, {
      types: types,
      timestamp: Date.now()
    });

    return types;
  }

  private async fetchPokemon(id: number): Promise<CachedPokemon> {
    let response;
    try {
      response = await this.fetchWithRetry(`https://pokeapi.co/api/v2/pokemon/${id}`);
    } catch (networkError) {
      throw new Error(`Network error fetching Pokemon ${id}: ${networkError instanceof Error ? networkError.message : 'Unknown error'}`);
    }

    if (!response.ok) {
      throw new Error(`Failed to fetch Pokémon ${id}: ${response.status} ${response.statusText}`);
    }

    let data;
    try {
      data = await response.json();
    } catch (parseError) {
      throw new Error(`Failed to parse Pokemon data for ${id}: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`);
    }

    const cachedPokemon = {
      id: data.id,
      name: data.name,
      sprites: this.getSpriteUrls(data),
      types: data.types.map((t: any) => t.type.name),
      timestamp: Date.now()
    };

    return cachedPokemon;
  }

  // Batch load multiple Pokémon
  async getBatchPokemon(ids: number[]): Promise<CachedPokemon[]> {
    const promises = ids.map(id => this.getPokemon(id));
    return Promise.all(promises);
  }

  // Clear old cache entries
  clearExpiredCache(): void {
    const now = Date.now();
    for (const [id, pokemon] of this.cache.entries()) {
      if (now - pokemon.timestamp > this.cacheExpiry) {
        this.cache.delete(id);
      }
    }
  }

  // Get cache statistics
  getCacheStats(): { size: number; hitRate: number; entries: number } {
    return {
      size: this.cache.size,
      hitRate: 0, // Would need to track hits/misses for accurate rate
      entries: this.cache.size
    };
  }

  // Preload popular Pokemon (first 50)
  async preloadPopularPokemon(): Promise<void> {
    const popularIds = Array.from({ length: 50 }, (_, i) => i + 1);
    await this.preloadPokemon(popularIds);
  }

  // Force cache refresh for specific Pokemon
  async refreshCache(id: number): Promise<void> {
    this.cache.delete(id);
    this.loadingPromises.delete(id);
    // Optionally preload immediately
    await this.getPokemon(id);
  }

  // Get evolution chain for a Pokemon
  async getEvolutionChain(pokemonId: number): Promise<EvolutionChain> {
    // Check cache first
    const cached = this.evolutionCache.get(pokemonId);
    if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
      return cached;
    }

    // Check if already loading
    if (this.evolutionLoadingPromises.has(pokemonId)) {
      return this.evolutionLoadingPromises.get(pokemonId)!;
    }

    // Create loading promise
    const loadingPromise = this.fetchEvolutionChain(pokemonId);
    this.evolutionLoadingPromises.set(pokemonId, loadingPromise);

    try {
      const evolutionChain = await loadingPromise;
      this.evolutionCache.set(pokemonId, evolutionChain);
      return evolutionChain;
    } finally {
      this.evolutionLoadingPromises.delete(pokemonId);
    }
  }

  private async fetchEvolutionChain(pokemonId: number): Promise<EvolutionChain> {
    // First get the Pokemon species to find evolution chain URL
    let speciesResponse;
    try {
      speciesResponse = await this.fetchWithRetry(`https://pokeapi.co/api/v2/pokemon-species/${pokemonId}`);
    } catch (networkError) {
      throw new Error(`Network error fetching Pokemon species ${pokemonId}: ${networkError instanceof Error ? networkError.message : 'Unknown error'}`);
    }

    if (!speciesResponse.ok) {
      throw new Error(`Failed to fetch Pokémon species ${pokemonId}: ${speciesResponse.status} ${speciesResponse.statusText}`);
    }

    let speciesData;
    try {
      speciesData = await speciesResponse.json();
    } catch (parseError) {
      throw new Error(`Failed to parse Pokemon species data for ${pokemonId}: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`);
    }

    // Extract evolution chain ID from URL
    const evolutionChainUrl = speciesData.evolution_chain.url;
    const chainId = evolutionChainUrl.split('/').filter(Boolean).pop();

    // Fetch evolution chain
    let chainResponse;
    try {
      chainResponse = await this.fetchWithRetry(`https://pokeapi.co/api/v2/evolution-chain/${chainId}`);
    } catch (networkError) {
      throw new Error(`Network error fetching evolution chain ${chainId}: ${networkError instanceof Error ? networkError.message : 'Unknown error'}`);
    }

    if (!chainResponse.ok) {
      throw new Error(`Failed to fetch evolution chain ${chainId}: ${chainResponse.status} ${chainResponse.statusText}`);
    }

    let chainData;
    try {
      chainData = await chainResponse.json();
    } catch (parseError) {
      throw new Error(`Failed to parse evolution chain data for ${chainId}: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`);
    }

    const evolutionChain = this.parseEvolutionChain(chainData);
    return evolutionChain;
  }

  private parseEvolutionChain(chainData: any): EvolutionChain {
    console.log('[PokeAPI] Parsing evolution chain:', chainData);
    
    const parseStage = (stage: any): EvolutionStage => {
      const pokemonId = Number(stage.species.url.split('/').filter(Boolean).pop());
      const evolutionDetails = stage.evolution_details || [];
      
      console.log(`[PokeAPI] Parsing stage: ${stage.species.name} (ID: ${pokemonId})`);
      
      const requirements: EvolutionRequirement[] = evolutionDetails.map((detail: any) => {
        const requirement = {
          trigger: detail.trigger?.name || 'level-up',
          level: detail.min_level || undefined,
          item: detail.item?.name || undefined,
          heldItem: detail.held_item?.name || undefined,
          timeOfDay: detail.time_of_day || undefined,
          location: detail.location?.name || undefined,
          knownMove: detail.known_move?.name || undefined,
          knownMoveType: detail.known_move_type?.name || undefined,
          minLevel: detail.min_level || undefined,
          gender: detail.gender === 1 ? 'female' : detail.gender === 2 ? 'male' : undefined,
          relativePhysicalStats: detail.relative_physical_stats || undefined,
          partySpecies: detail.party_species?.name || undefined,
          partyType: detail.party_type?.name || undefined,
          tradeSpecies: detail.trade_species?.name || undefined,
          needsOverworldRain: detail.needs_overworld_rain || undefined,
          turnUpsideDown: detail.turn_upside_down || undefined
        };
        
        console.log(`[PokeAPI] Evolution requirement for ${stage.species.name}:`, requirement);
        return requirement;
      });

      const evolvesToStages = stage.evolves_to ? stage.evolves_to.map(parseStage) : [];
      console.log(`[PokeAPI] ${stage.species.name} evolves to ${evolvesToStages.length} forms:`, evolvesToStages.map(s => s.name));

      return {
        id: pokemonId,
        name: stage.species.name,
        evolvesTo: evolvesToStages,
        evolutionRequirements: requirements.length > 0 ? requirements : undefined
      };
    };

    const parsedChain = {
      id: chainData.id,
      chain: [parseStage(chainData.chain)],
      timestamp: Date.now()
    };
    
    console.log('[PokeAPI] Final parsed evolution chain:', parsedChain);
    return parsedChain;
  }
}

import { evolutionDataProvider } from './evolutionDataSources';

export const pokemonAPI = new PokemonAPI();
export type { CachedPokemon, PokemonSpriteUrls, EvolutionChain, EvolutionStage, EvolutionRequirement };

// Get base Pokemon IDs from evolution data
function getBasePokemon(): number[] {
  // Get the fallback evolution data which contains all base Pokemon as top-level keys
  const evolutionData = (evolutionDataProvider as any).fallbackData;
  return Object.keys(evolutionData).map(Number);
}

// Fallback Pokemon data for when API fails
const FALLBACK_POKEMON: CachedPokemon[] = [
  {
    id: 25,
    name: 'pikachu',
    sprites: {
      static: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png',
      animated: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/25.gif',
      fallback: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png'
    },
    types: ['electric'],
    timestamp: Date.now()
  },
  {
    id: 1,
    name: 'bulbasaur',
    sprites: {
      static: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1.png',
      animated: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/1.gif',
      fallback: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1.png'
    },
    types: ['grass', 'poison'],
    timestamp: Date.now()
  },
  {
    id: 4,
    name: 'charmander',
    sprites: {
      static: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/4.png',
      animated: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/4.gif',
      fallback: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/4.png'
    },
    types: ['fire'],
    timestamp: Date.now()
  }
];
// Get a random Pokémon that is a base evolution (first in chain or doesn't evolve)
export async function getRandomPokemon(targetId?: number): Promise<CachedPokemon> {
  let pokemonId: number;
  
  if (targetId) {
    // Use specific Pokemon ID for testing
    pokemonId = targetId;
  } else {
    // Get all base Pokemon IDs
    const basePokemonIds = getBasePokemon();
    
    // Select a random base Pokemon ID
    pokemonId = basePokemonIds[Math.floor(Math.random() * basePokemonIds.length)];
  }

  try {
    const pokemon = await pokemonAPI.getPokemon(pokemonId);
    return pokemon;
  } catch (error) {
    console.error(`Failed to fetch Pokemon ${pokemonId}:`, error);
    // Return a random fallback Pokemon
    const fallbackPokemon = FALLBACK_POKEMON[Math.floor(Math.random() * FALLBACK_POKEMON.length)];
    return fallbackPokemon;
  }
}
