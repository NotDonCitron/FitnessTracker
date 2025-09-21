// Flexible Evolution Data Sources System
import { EvolutionStage } from '../types/pokemon';
import { pokemonAPI } from './pokemonApi';

// Minimal fallback evolution data - only used when PokeAPI is completely unavailable
const MINIMAL_FALLBACK_DATA: Record<number, EvolutionStage> = {
  // Gen 1 starters only
  1: { id: 1, name: 'bulbasaur', evolvesTo: [{ id: 2, name: 'ivysaur', evolvesTo: [{ id: 3, name: 'venusaur', evolvesTo: [] }] }] },
  4: { id: 4, name: 'charmander', evolvesTo: [{ id: 5, name: 'charmeleon', evolvesTo: [{ id: 6, name: 'charizard', evolvesTo: [] }] }] },
  7: { id: 7, name: 'squirtle', evolvesTo: [{ id: 8, name: 'wartortle', evolvesTo: [{ id: 9, name: 'blastoise', evolvesTo: [] }] }] },
  25: { id: 25, name: 'pikachu', evolvesTo: [{ id: 26, name: 'raichu', evolvesTo: [] }] },
  // Gen 3 starters
  252: { id: 252, name: 'treecko', evolvesTo: [{ id: 253, name: 'grovyle', evolvesTo: [{ id: 254, name: 'sceptile', evolvesTo: [] }] }] },
  255: { id: 255, name: 'torchic', evolvesTo: [{ id: 256, name: 'combusken', evolvesTo: [{ id: 257, name: 'blaziken', evolvesTo: [] }] }] },
  258: { id: 258, name: 'mudkip', evolvesTo: [{ id: 259, name: 'marshtomp', evolvesTo: [{ id: 260, name: 'swampert', evolvesTo: [] }] }] }
};

export class EvolutionDataProvider {
  private cache = new Map<number, EvolutionStage>();
  private cacheExpiry = new Map<number, number>();
  private readonly CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

  /**
   * Get evolution chain for a Pokemon, preferring PokeAPI data
   */
  async getEvolutionChain(pokemonId: number): Promise<EvolutionStage | null> {
    console.log(`[EvolutionDataProvider] Getting evolution chain for Pokemon ${pokemonId}`);

    // Check cache first
    const cached = this.getCachedData(pokemonId);
    if (cached) {
      console.log(`[EvolutionDataProvider] Using cached data for Pokemon ${pokemonId}`);
      return cached;
    }

    try {
      // Try to get from PokeAPI
      console.log(`[EvolutionDataProvider] Fetching from PokeAPI for Pokemon ${pokemonId}`);
      const evolutionChain = await pokemonAPI.getEvolutionChain(pokemonId);
      
      if (evolutionChain && evolutionChain.chain && evolutionChain.chain.length > 0) {
        const rootStage = evolutionChain.chain[0];
        this.setCachedData(pokemonId, rootStage);
        console.log(`[EvolutionDataProvider] Successfully fetched evolution chain from PokeAPI for Pokemon ${pokemonId}`);
        return rootStage;
      }
    } catch (error) {
      console.warn(`[EvolutionDataProvider] PokeAPI failed for Pokemon ${pokemonId}:`, error);
    }

    // Fallback to minimal local data
    const fallbackData = this.getFallbackData(pokemonId);
    if (fallbackData) {
      console.log(`[EvolutionDataProvider] Using fallback data for Pokemon ${pokemonId}`);
      this.setCachedData(pokemonId, fallbackData);
      return fallbackData;
    }

    console.warn(`[EvolutionDataProvider] No evolution data found for Pokemon ${pokemonId}`);
    return null;
  }

  /**
   * Get cached evolution data if still valid
   */
  private getCachedData(pokemonId: number): EvolutionStage | null {
    const expiry = this.cacheExpiry.get(pokemonId);
    if (expiry && Date.now() < expiry) {
      return this.cache.get(pokemonId) || null;
    }
    return null;
  }

  /**
   * Cache evolution data with expiry
   */
  private setCachedData(pokemonId: number, data: EvolutionStage): void {
    this.cache.set(pokemonId, data);
    this.cacheExpiry.set(pokemonId, Date.now() + this.CACHE_DURATION);
  }

  /**
   * Get fallback data for essential Pokemon
   */
  private getFallbackData(pokemonId: number): EvolutionStage | null {
    return MINIMAL_FALLBACK_DATA[pokemonId] || null;
  }

  /**
   * Find the evolution stage for a specific Pokemon in an evolution chain
   */
  findPokemonInChain(chain: EvolutionStage, targetId: number): EvolutionStage | null {
    if (chain.id === targetId) {
      return chain;
    }

    for (const evolution of chain.evolvesTo) {
      const found = this.findPokemonInChain(evolution, targetId);
      if (found) return found;
    }

    return null;
  }

  /**
   * Get all Pokemon IDs in an evolution chain
   */
  getAllIdsInChain(chain: EvolutionStage): number[] {
    const ids = [chain.id];
    for (const evolution of chain.evolvesTo) {
      ids.push(...this.getAllIdsInChain(evolution));
    }
    return ids;
  }

  /**
   * Clear cache (for testing or debugging)
   */
  clearCache(): void {
    this.cache.clear();
    this.cacheExpiry.clear();
    console.log('[EvolutionDataProvider] Cache cleared');
  }

  /**
   * Get fallback data for debugging
   */
  get fallbackData(): Record<number, EvolutionStage> {
    return MINIMAL_FALLBACK_DATA;
  }
}

// Export singleton instance
export const evolutionDataProvider = new EvolutionDataProvider();

// Export fallback data for backwards compatibility
export const FALLBACK_EVOLUTION_DATA = MINIMAL_FALLBACK_DATA;
