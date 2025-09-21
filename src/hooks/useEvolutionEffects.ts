import { useState, useEffect, useCallback, useRef } from 'react';
import { Pokemon } from '../types/pokemon';

export interface EvolutionEffectsState {
  intensity: number;
  isActive: boolean;
 currentEffects: string[];
  performance: {
    fps: number;
    memoryUsage: number;
    quality: 'high' | 'medium' | 'low';
  };
}

export interface EvolutionEffectsConfig {
  maxIntensity?: number;
  adaptiveQuality?: boolean;
  reducedMotion?: boolean;
  enableParticles?: boolean;
  enableScreenEffects?: boolean;
  prefersReducedMotion?: boolean;
}

export const useEvolutionEffects = (
  pokemon: Pokemon,
  config: EvolutionEffectsConfig = {}
) => {
  const [effectsState, setEffectsState] = useState<EvolutionEffectsState>({
    intensity: 1,
    isActive: false,
    currentEffects: [],
    performance: {
      fps: 60,
      memoryUsage: 0,
      quality: 'high'
    }
  });

  const fpsRef = useRef<number>(0);
  const lastFrameTimeRef = useRef<number>(0);
  const frameCountRef = useRef<number>(0);
  const animationFrameRef = useRef<number>(0);

  const defaultConfig: Required<EvolutionEffectsConfig> = {
    maxIntensity: 1,
    adaptiveQuality: true,
    reducedMotion: false,
    enableParticles: true,
    enableScreenEffects: true,
    prefersReducedMotion: false
  };

  const mergedConfig = {
    ...defaultConfig,
    ...config
  };

  // Performance monitoring
  useEffect(() => {
    if (!mergedConfig.adaptiveQuality) return;

    const monitorPerformance = () => {
      frameCountRef.current++;
      const now = performance.now();
      
      if (lastFrameTimeRef.current) {
        const delta = now - lastFrameTimeRef.current;
        if (delta >= 1000) { // Update FPS every second
          const fps = Math.round((frameCountRef.current * 1000) / delta);
          fpsRef.current = fps;
          frameCountRef.current = 0;
          
          // Adjust quality based on performance
          setEffectsState(prev => {
            let quality: 'high' | 'medium' | 'low' = 'high';
            if (fps < 30) quality = 'low';
            else if (fps < 50) quality = 'medium';
            
            return {
              ...prev,
              performance: {
                ...prev.performance,
                fps,
                quality
              }
            };
          });
        }
      }
      
      lastFrameTimeRef.current = now;
      animationFrameRef.current = requestAnimationFrame(monitorPerformance);
    };

    animationFrameRef.current = requestAnimationFrame(monitorPerformance);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [mergedConfig.adaptiveQuality]);

  // Memory usage monitoring
  useEffect(() => {
    const updateMemoryUsage = () => {
      // @ts-ignore - browser-specific API
      if ('memory' in performance) {
        // @ts-ignore - browser-specific API
        const memory = performance.memory;
        // @ts-ignore - browser-specific API
        if (memory && memory.usedJSHeapSize) {
          // @ts-ignore - browser-specific API
          const usage = Math.round(memory.usedJSHeapSize / 1048576); // MB
          setEffectsState(prev => ({
            ...prev,
            performance: {
              ...prev.performance,
              memoryUsage: usage
            }
          }));
        }
      }
    };

    const interval = setInterval(updateMemoryUsage, 5000); // Update every 5 seconds
    return () => clearInterval(interval);
  }, []);

  // Effect orchestration
  const triggerEffect = useCallback((effectName: string, duration?: number) => {
    setEffectsState(prev => ({
      ...prev,
      currentEffects: [...prev.currentEffects, effectName],
      isActive: true
    }));

    if (duration) {
      setTimeout(() => {
        setEffectsState(prev => ({
          ...prev,
          currentEffects: prev.currentEffects.filter(effect => effect !== effectName)
        }));
      }, duration);
    }
  }, []);

  // Intensity control
  const setIntensity = useCallback((intensity: number) => {
    const clampedIntensity = Math.min(Math.max(intensity, 0), mergedConfig.maxIntensity);
    setEffectsState(prev => ({
      ...prev,
      intensity: clampedIntensity
    }));
  }, [mergedConfig.maxIntensity]);

  // Adaptive quality adjustment
  const adjustQuality = useCallback((quality: 'high' | 'medium' | 'low') => {
    setEffectsState(prev => ({
      ...prev,
      performance: {
        ...prev.performance,
        quality
      }
    }));
  }, []);

  // Reset effects
  const resetEffects = useCallback(() => {
    setEffectsState({
      intensity: 1,
      isActive: false,
      currentEffects: [],
      performance: {
        fps: 60,
        memoryUsage: 0,
        quality: 'high'
      }
    });
  }, []);

  // Get effect recommendations based on Pokemon type and current phase
  const getEffectRecommendations = useCallback((
    phase: 'anticipation' | 'transformation' | 'reveal' | 'complete'
  ) => {
    const primaryType = pokemon.types[0] || 'normal';
    const recommendations: string[] = [];

    switch (phase) {
      case 'anticipation':
        recommendations.push('energyRings', 'typeAura', 'particles');
        break;
      case 'transformation':
        recommendations.push('screenFlash', 'chromaticShift', 'particles');
        break;
      case 'reveal':
        recommendations.push('confetti', 'sparkles', 'radialBlur');
        break;
      case 'complete':
        recommendations.push('celebration', 'sparkles');
        break;
    }

    // Type-specific effects
    switch (primaryType.toLowerCase()) {
      case 'electric':
        recommendations.push('lightning', 'crackle');
        break;
      case 'fire':
        recommendations.push('flames', 'heat');
        break;
      case 'water':
        recommendations.push('bubbles', 'waves');
        break;
      case 'grass':
        recommendations.push('leaves', 'growth');
        break;
      case 'psychic':
        recommendations.push('mindWaves', 'telekinesis');
        break;
    }

    return recommendations;
  }, [pokemon.types]);

  // Preload effects for smooth playback
  const preloadEffects = useCallback(async () => {
    // In a real implementation, this would preload effect assets
    // For now, we'll just simulate the process
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        setEffectsState(prev => ({
          ...prev,
          isActive: true
        }));
        resolve();
      }, 10);
    });
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      resetEffects();
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
 }, [resetEffects]);

  return {
    effectsState,
    triggerEffect,
    setIntensity,
    adjustQuality,
    resetEffects,
    getEffectRecommendations,
    preloadEffects
  };
};

export default useEvolutionEffects;
