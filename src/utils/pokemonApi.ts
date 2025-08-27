// Enhanced Pokémon API with caching and optimization
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

class PokemonAPI {
  private cache = new Map<number, CachedPokemon>();
  private cacheExpiry = 24 * 60 * 60 * 1000; // 24 hours
  private loadingPromises = new Map<number, Promise<CachedPokemon>>();

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

  private async fetchPokemon(id: number): Promise<CachedPokemon> {
    console.log('🌐 [DEBUG] Fetching Pokemon ID:', id, 'from PokeAPI');
    
    let response;
    try {
      response = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`, {
        timeout: 10000 // 10 second timeout
      });
    } catch (networkError) {
      console.error('❌ [DEBUG] Network error fetching Pokemon:', networkError);
      throw new Error(`Network error: ${networkError.message}`);
    }
    
    if (!response.ok) {
      console.error('❌ [DEBUG] Pokemon API request failed:', response.status, response.statusText);
      throw new Error(`Failed to fetch Pokémon ${id}: ${response.status} ${response.statusText}`);
    }
    
    let data;
    try {
      data = await response.json();
      console.log('📦 [DEBUG] Raw Pokemon data received for', data.name);
    } catch (parseError) {
      console.error('❌ [DEBUG] Failed to parse Pokemon JSON:', parseError);
      throw new Error(`Failed to parse Pokemon data: ${parseError.message}`);
    }
    
    const cachedPokemon = {
      id: data.id,
      name: data.name,
      sprites: this.getSpriteUrls(data),
      types: data.types.map((t: any) => t.type.name),
      timestamp: Date.now()
    };
    
    console.log('✨ [DEBUG] Processed Pokemon data:', cachedPokemon);
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
}

export const pokemonAPI = new PokemonAPI();
export type { CachedPokemon, PokemonSpriteUrls };

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
// Get a random Pokémon from the original 151
export async function getRandomPokemon(): Promise<CachedPokemon> {
  // Original 151 Pokémon IDs
  const ORIGINAL_151_POKEMON = Array.from({ length: 151 }, (_, i) => i + 1);
  
  const randomId = ORIGINAL_151_POKEMON[Math.floor(Math.random() * ORIGINAL_151_POKEMON.length)];
  console.log('🎲 [DEBUG] Selected random Pokemon ID:', randomId);
  
  try {
    const pokemon = await pokemonAPI.getPokemon(randomId);
    console.log('🎯 [DEBUG] Successfully got random Pokemon:', pokemon.name);
    return pokemon;
  } catch (error) {
    console.error('❌ [DEBUG] Failed to get random Pokemon, using fallback:', error);
    // Return a random fallback Pokemon
    const fallbackPokemon = FALLBACK_POKEMON[Math.floor(Math.random() * FALLBACK_POKEMON.length)];
    console.log('🔄 [DEBUG] Using fallback Pokemon:', fallbackPokemon.name);
    return fallbackPokemon;
  }
}