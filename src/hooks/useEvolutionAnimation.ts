import { useState, useEffect, useCallback, useRef } from 'react';
import { Pokemon } from '../types/pokemon';
import { preloadPokemonSprites, getEvolutionSpritePair } from '../utils/spriteHelpers';

export interface EvolutionAnimationState {
  phase: 'idle' | 'anticipation' | 'transformation' | 'reveal' | 'complete';
  progress: number;
  isPlaying: boolean;
  error: string | null;
  spritesLoaded: boolean;
}

export interface EvolutionAnimationConfig {
  duration?: {
    anticipation?: number;
    transformation?: number;
    reveal?: number;
 };
  enableParticles?: boolean;
  enableSound?: boolean;
  reducedMotion?: boolean;
  playbackSpeed?: number;
  autoPlay?: boolean;
  loop?: boolean;
  reverseOnComplete?: boolean;
}

export interface SpriteLoadingState {
  from: {
    static: boolean;
    animated: boolean;
    error: boolean;
  };
  to: {
    static: boolean;
    animated: boolean;
    error: boolean;
  };
}

export type AnimationPhase = 'anticipation' | 'transformation' | 'reveal' | 'complete';

export const useEvolutionAnimation = (
  fromPokemon: Pokemon,
  toPokemon: Pokemon,
  config: EvolutionAnimationConfig = {}
) => {
  const [animationState, setAnimationState] = useState<EvolutionAnimationState>({
    phase: 'idle',
    progress: 0,
    isPlaying: false,
    error: null,
    spritesLoaded: false
  });

  const [spriteLoadingState, setSpriteLoadingState] = useState<SpriteLoadingState>({
    from: { static: false, animated: false, error: false },
    to: { static: false, animated: false, error: false }
  });

  const animationRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);
  const phaseTimersRef = useRef<Record<string, NodeJS.Timeout>>({});

  const defaultConfig: Required<EvolutionAnimationConfig> = {
    duration: {
      anticipation: 1500,
      transformation: 2500,
      reveal: 2000
    },
    enableParticles: true,
    enableSound: false,
    reducedMotion: false,
    playbackSpeed: 1,
    autoPlay: false,
    loop: false,
    reverseOnComplete: false
  };

  const mergedConfig = {
    ...defaultConfig,
    ...config,
    duration: {
      ...defaultConfig.duration,
      ...config.duration
    }
  };

 // Apply playback speed to durations
  const getAdjustedDuration = (duration: number) => {
    return duration / mergedConfig.playbackSpeed;
  };

  // Preload sprites
  const preloadSprites = useCallback(async () => {
    try {
      setAnimationState(prev => ({ ...prev, error: null }));
      
      const result = await getEvolutionSpritePair(fromPokemon, toPokemon);
      
      setAnimationState(prev => ({ ...prev, spritesLoaded: true }));
      setSpriteLoadingState({
        from: { 
          static: Boolean(result.from.static), 
          animated: Boolean(result.from.animated), 
          error: false 
        },
        to: { 
          static: Boolean(result.to.static), 
          animated: Boolean(result.to.animated), 
          error: false 
        }
      });
    } catch (error) {
      console.error('Failed to preload evolution sprites:', error);
      setAnimationState(prev => ({ ...prev, error: 'Failed to load Pokemon sprites' }));
      
      // Set error states for failed loads - partial success handling
      setSpriteLoadingState(prev => ({
        from: { 
          static: prev.from.static, 
          animated: prev.from.animated, 
          error: true 
        },
        to: { 
          static: prev.to.static, 
          animated: prev.to.animated, 
          error: true 
        }
      }));
    }
  }, [fromPokemon, toPokemon]);

  // Start animation sequence
  const startAnimation = useCallback(() => {
    if (animationState.isPlaying) return;

    setAnimationState(prev => ({
      ...prev,
      phase: 'anticipation',
      progress: 0,
      isPlaying: true,
      error: null
    }));

    startTimeRef.current = Date.now();
  }, [animationState.isPlaying]);

  // Auto-start animation when sprites are loaded and autoPlay is enabled
  useEffect(() => {
    if (mergedConfig.autoPlay && animationState.spritesLoaded && !animationState.isPlaying) {
      startAnimation();
    }
  }, [animationState.spritesLoaded, animationState.isPlaying, mergedConfig.autoPlay, startAnimation]);

  // Pause animation
  const pauseAnimation = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    
    // Clear all phase timers
    Object.values(phaseTimersRef.current).forEach(timer => clearTimeout(timer));
    
    setAnimationState(prev => ({ ...prev, isPlaying: false }));
  }, []);

  // Reset animation
  const resetAnimation = useCallback(() => {
    pauseAnimation();
    
    // Clear all phase timers
    Object.values(phaseTimersRef.current).forEach(timer => clearTimeout(timer));
    phaseTimersRef.current = {};
    
    setAnimationState({
      phase: 'idle',
      progress: 0,
      isPlaying: false,
      error: null,
      spritesLoaded: false
    });
  }, [pauseAnimation]);

  // Skip to specific phase
  const skipToPhase = useCallback((phase: AnimationPhase) => {
    setAnimationState(prev => ({ ...prev, phase }));
  }, []);

 // Animation phase management
  useEffect(() => {
    if (!animationState.isPlaying) return;

    const advancePhase = () => {
      setAnimationState(prev => {
        switch (prev.phase) {
          case 'anticipation':
            return { ...prev, phase: 'transformation', progress: 33 };
          case 'transformation':
            return { ...prev, phase: 'reveal', progress: 66 };
          case 'reveal':
            if (mergedConfig.loop) {
              // Loop back to anticipation
              return { ...prev, phase: 'anticipation', progress: 0 };
            } else if (mergedConfig.reverseOnComplete) {
              // Reverse animation would go here
              return { ...prev, phase: 'complete', progress: 100, isPlaying: false };
            } else {
              return { ...prev, phase: 'complete', progress: 100, isPlaying: false };
            }
          case 'complete':
            return { ...prev, isPlaying: false };
          default:
            return prev;
        }
      });
    };

    const phaseDurations = mergedConfig.duration;
    
    // Apply playback speed
    const adjustedDuration = (duration: number) => duration / mergedConfig.playbackSpeed;
    
    switch (animationState.phase) {
      case 'anticipation':
        phaseTimersRef.current.anticipation = setTimeout(advancePhase, adjustedDuration(phaseDurations.anticipation || 150));
        break;
      case 'transformation':
        phaseTimersRef.current.transformation = setTimeout(advancePhase, adjustedDuration(phaseDurations.transformation || 2500));
        break;
      case 'reveal':
        phaseTimersRef.current.reveal = setTimeout(advancePhase, adjustedDuration(phaseDurations.reveal || 2000));
        break;
    }

    return () => {
      Object.values(phaseTimersRef.current).forEach(timer => clearTimeout(timer));
    };
  }, [animationState.phase, animationState.isPlaying, mergedConfig.duration, mergedConfig.loop, mergedConfig.reverseOnComplete, mergedConfig.playbackSpeed]);

  // Preload sprites on mount
  useEffect(() => {
    preloadSprites();
  }, [preloadSprites]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      resetAnimation();
    };
  }, [resetAnimation]);

  // Progress animation frame
  useEffect(() => {
    if (!animationState.isPlaying) return;

    const animate = () => {
      const elapsed = Date.now() - startTimeRef.current;
      const totalDuration = 
        (mergedConfig.duration.anticipation || 1500) + 
        (mergedConfig.duration.transformation || 2500) + 
        (mergedConfig.duration.reveal || 2000);
      
      const progress = Math.min((elapsed / totalDuration) * 100, 100);
      
      setAnimationState(prev => ({ ...prev, progress }));
      
      if (progress < 100) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [animationState.isPlaying, mergedConfig.duration]);

  return {
    animationState,
    spriteLoadingState,
    startAnimation,
    pauseAnimation,
    resetAnimation,
    skipToPhase,
    preloadSprites
  };
};

export default useEvolutionAnimation;
