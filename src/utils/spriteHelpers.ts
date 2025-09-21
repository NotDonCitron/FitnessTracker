import { Pokemon } from '../types/pokemon';

// LRU Cache implementation for sprite caching
class LRUCache<T> {
  private cache: Map<string, { value: T; timestamp: number }>;
  private maxSize: number;
  private ttl: number; // Time to live in milliseconds

  constructor(maxSize: number = 100, ttl: number = 30 * 60 * 1000) { // 30 minutes default
    this.cache = new Map();
    this.maxSize = maxSize;
    this.ttl = ttl;
  }

  get(key: string): T | undefined {
    const item = this.cache.get(key);
    if (!item) return undefined;

    // Check if item is expired
    if (Date.now() - item.timestamp > this.ttl) {
      this.cache.delete(key);
      return undefined;
    }

    // Move to front (most recently used)
    this.cache.delete(key);
    this.cache.set(key, { value: item.value, timestamp: Date.now() });
    return item.value;
  }

  set(key: string, value: T): void {
    // Remove oldest item if cache is full
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) this.cache.delete(firstKey);
    }

    this.cache.set(key, { value, timestamp: Date.now() });
  }

  has(key: string): boolean {
    return this.get(key) !== undefined;
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }

  // Get cache statistics
  getStats(): { size: number; maxSize: number; hitRate: number } {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      hitRate: 0 // Simplified for now
    };
  }
}

// Global sprite cache
const spriteCache = new LRUCache<HTMLImageElement>(200, 30 * 60 * 1000); // 200 items, 30 minutes TTL

/**
 * Extracts the static sprite URL from a Pokemon object, supporting both new and legacy formats.
 * 
 * @param pokemon - Pokemon object that may have either new sprites.static or legacy sprite property
 * @returns The static sprite URL, or empty string if not found
 */
export function getStaticSprite(pokemon: any): string {
  // Prioritize new format
  if (pokemon?.sprites?.static) {
    return pokemon.sprites.static;
  }
  
  // Fallback to legacy format
  if (pokemon?.sprite) {
    return pokemon.sprite;
  }
  
  return '';
}

/**
 * Extracts the animated sprite URL from a Pokemon object, supporting both new and legacy formats.
 * 
 * @param pokemon - Pokemon object that may have either new sprites.animated or legacy animatedSprite property
 * @returns The animated sprite URL, or undefined if not found
 */
export function getAnimatedSprite(pokemon: any): string | undefined {
  // Prioritize new format
  if (pokemon?.sprites?.animated) {
    return pokemon.sprites.animated;
  }
  
  // Fallback to legacy format
  if (pokemon?.animatedSprite) {
    return pokemon.animatedSprite;
  }
  
  return undefined;
}

/**
 * Preloads a sprite image and returns a Promise that resolves when loaded.
 * 
 * @param url - The URL of the sprite to preload
 * @returns Promise that resolves with the loaded image element
 */
export function preloadSprite(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    if (!url) {
      reject(new Error('Invalid sprite URL'));
      return;
    }

    // Check cache first
    const cachedImage = spriteCache.get(url);
    if (cachedImage) {
      resolve(cachedImage);
      return;
    }

    const img = new Image();
    img.onload = () => {
      // Store in cache
      spriteCache.set(url, img);
      resolve(img);
    };
    img.onerror = () => reject(new Error(`Failed to load sprite: ${url}`));
    img.src = url;
  });
}

/**
 * Preloads all sprites for a Pokemon and returns a Promise with loaded images.
 * 
 * @param pokemon - Pokemon object to preload sprites for
 * @returns Promise that resolves with both static and animated sprites
 */
export async function preloadPokemonSprites(pokemon: any): Promise<{static: HTMLImageElement, animated?: HTMLImageElement}> {
  const staticSprite = getStaticSprite(pokemon);
  const animatedSprite = getAnimatedSprite(pokemon);

  if (!staticSprite) {
    throw new Error(`No static sprite found for Pokemon: ${pokemon?.name || pokemon?.id}`);
  }

  try {
    // Load static sprite first
    const staticImg = await preloadSprite(staticSprite);
    
    // Try to load animated sprite if available
    let animatedImg: HTMLImageElement | undefined;
    if (animatedSprite) {
      try {
        animatedImg = await preloadSprite(animatedSprite);
      } catch (err) {
        console.warn(`Failed to load animated sprite for ${pokemon.name}, using static`, err);
      }
    }

    return {
      static: staticImg,
      animated: animatedImg
    };
  } catch (error) {
    throw new Error(`Failed to preload sprites for ${pokemon.name}: ${error}`);
  }
}

/**
 * Validates if a sprite URL is valid.
 * 
 * @param url - The URL to validate
 * @returns boolean indicating if the URL is valid
 */
export function validateSpriteUrl(url: string): boolean {
  if (!url || typeof url !== 'string') return false;
  
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Gets sprite loading priority based on Pokemon characteristics.
 * 
 * @param pokemon - Pokemon object to determine priority for
 * @returns Priority level: 'high' | 'medium' | 'low'
 */
export function getSpriteLoadingPriority(pokemon: any): 'high' | 'medium' | 'low' {
  if (!pokemon) return 'low';
  
  // High priority for evolution-related Pokemon
  if (pokemon.evolutionData || pokemon.canEvolve) {
    return 'high';
  }
  
  // Medium priority for common Pokemon
  const commonPokemon = ['pikachu', 'charmander', 'squirtle', 'bulbasaur', 'eevee'];
  if (commonPokemon.includes(pokemon.name?.toLowerCase())) {
    return 'medium';
  }
  
  return 'low';
}

/**
 * Normalizes a Pokemon object to ensure it has both new and legacy sprite properties.
 * This function provides backward compatibility by creating missing properties from existing ones.
 * 
 * @param pokemon - Pokemon object to normalize
 * @returns Pokemon object with both new (sprites.static/animated) and legacy (sprite/animatedSprite) properties
 */
export function normalizeSprites<T extends Record<string, any>>(pokemon: T): T & {
  sprites: { static: string; animated?: string };
  sprite?: string;
  animatedSprite?: string;
} {
  if (!pokemon) {
    return pokemon as any;
  }

  const normalized: any = { ...pokemon };

  // Ensure sprites object exists
  if (!normalized.sprites) {
    normalized.sprites = {
      static: '',
      animated: undefined
    };
  }

  // Populate sprites.static if missing
  if (!normalized.sprites.static && normalized.sprite) {
    normalized.sprites.static = normalized.sprite;
  }

  // Populate sprites.animated if missing
  if (!normalized.sprites.animated && normalized.animatedSprite) {
    normalized.sprites.animated = normalized.animatedSprite;
  }

  // Populate legacy sprite if missing (for backward compatibility)
  if (!normalized.sprite && normalized.sprites.static) {
    normalized.sprite = normalized.sprites.static;
  }

  // Populate legacy animatedSprite if missing (for backward compatibility)
  if (!normalized.animatedSprite && normalized.sprites.animated) {
    normalized.animatedSprite = normalized.sprites.animated;
  }

  return normalized;
}

/**
 * Type guard to check if a Pokemon object has the new sprite format.
 * 
 * @param pokemon - Pokemon object to check
 * @returns True if the Pokemon has the new sprites.static property
 */
export function hasNewSpriteFormat(pokemon: any): boolean {
  return pokemon?.sprites?.static !== undefined;
}

/**
 * Type guard to check if a Pokemon object has the legacy sprite format.
 * 
 * @param pokemon - Pokemon object to check
 * @returns True if the Pokemon has the legacy sprite property
 */
export function hasLegacySpriteFormat(pokemon: any): boolean {
  return pokemon?.sprite !== undefined;
}

/**
 * Migrates an array of Pokemon objects from legacy to new sprite format.
 * This is useful for migrating localStorage data or API responses.
 * 
 * @param pokemonArray - Array of Pokemon objects to migrate
 * @returns Array of Pokemon objects with normalized sprite properties
 */
export function migratePokemonSprites<T extends any[]>(pokemonArray: T): T {
  if (!Array.isArray(pokemonArray)) {
    return pokemonArray;
  }

  return pokemonArray.map(pokemon => normalizeSprites(pokemon)) as T;
}

/**
 * Gets sprite pair for evolution (from and to Pokemon).
 * 
 * @param fromPokemon - Source Pokemon
 * @param toPokemon - Target Pokemon
 * @returns Promise that resolves with both Pokemon's sprites
 */
export async function getEvolutionSpritePair(fromPokemon: any, toPokemon: any): Promise<{
  from: { static: HTMLImageElement, animated?: HTMLImageElement },
  to: { static: HTMLImageElement, animated?: HTMLImageElement }
}> {
  try {
    const [fromSprites, toSprites] = await Promise.all([
      preloadPokemonSprites(fromPokemon),
      preloadPokemonSprites(toPokemon)
    ]);

    return {
      from: fromSprites,
      to: toSprites
    };
  } catch (error) {
    throw new Error(`Failed to load evolution sprite pair: ${error}`);
  }
}

/**
 * Checks if both Pokemon have the required sprites for evolution.
 * 
 * @param fromPokemon - Source Pokemon
 * @param toPokemon - Target Pokemon
 * @returns boolean indicating if both Pokemon have required sprites
 */
export function hasEvolutionSprites(fromPokemon: any, toPokemon: any): boolean {
  try {
    const fromStatic = getStaticSprite(fromPokemon);
    const toStatic = getStaticSprite(toPokemon);
    
    return !!fromStatic && !!toStatic;
  } catch {
    return false;
  }
}

/**
 * Gets fallback sprites for evolution when primary sprites fail.
 * 
 * @param fromPokemon - Source Pokemon
 * @param toPokemon - Target Pokemon
 * @returns Object with fallback sprite URLs
 */
export function getEvolutionFallbackSprites(fromPokemon: any, toPokemon: any): {
  from: { static: string, animated?: string },
  to: { static: string, animated?: string }
} {
  // Generate fallback sprite URLs (this would typically use a sprite service)
  const generateFallbackUrl = (pokemon: any, type: 'static' | 'animated' = 'static') => {
    if (!pokemon) return '';
    const baseUrl = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/';
    
    // Use ID if available, otherwise use name-based URL
    if (pokemon.id) {
      return type === 'static' 
        ? `${baseUrl}pokemon/${pokemon.id}.png`
        : `${baseUrl}pokemon/other/showdown/${pokemon.id}.gif`;
    } else if (pokemon.name) {
      // Fallback to name-based URL or generic silhouette
      const sanitizedName = pokemon.name.toLowerCase().replace(/[^a-z0-9]/g, '');
      return type === 'static'
        ? `${baseUrl}pokemon/other/official-artwork/${sanitizedName}.png`
        : `${baseUrl}pokemon/other/showdown/${sanitizedName}.gif`;
    } else {
      // Generic silhouette fallback
      return type === 'static'
        ? `${baseUrl}pokemon/other/official-artwork/0.png`
        : `${baseUrl}pokemon/other/showdown/0.gif`;
    }
  };

  return {
    from: {
      static: getStaticSprite(fromPokemon) || generateFallbackUrl(fromPokemon, 'static'),
      animated: getAnimatedSprite(fromPokemon) || generateFallbackUrl(fromPokemon, 'animated')
    },
    to: {
      static: getStaticSprite(toPokemon) || generateFallbackUrl(toPokemon, 'static'),
      animated: getAnimatedSprite(toPokemon) || generateFallbackUrl(toPokemon, 'animated')
    }
  };
}
