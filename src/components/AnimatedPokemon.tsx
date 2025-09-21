import React, { useState, useEffect, useRef } from 'react';
import { getStaticSprite, getAnimatedSprite, preloadPokemonSprites } from '../utils/spriteHelpers';

interface AnimatedPokemonProps {
  sprite: string;
  animatedSprite?: string;
  name: string;
  className?: string;
  size?: 'small' | 'medium' | 'large';
  animationType?: 'bounce' | 'float' | 'pulse' | 'shake' | 'evolutionGlow' | 'evolutionTransform' | 'evolutionReveal' | 'evolutionCelebrate' | 'evolutionAnticipation' | 'evolutionIntensify' | 'evolutionTransition' | 'evolutionEmerge' | 'evolutionTriumph';
  evolutionPhase?: 'anticipation' | 'transformation' | 'reveal' | 'complete';
  onSpriteLoad?: (success: boolean, error?: Error) => void;
  preloaded?: boolean;
  preloadedStaticImg?: HTMLImageElement;
  preloadedAnimatedImg?: HTMLImageElement;
}

const AnimatedPokemon: React.FC<AnimatedPokemonProps> = React.memo(({
  sprite,
  animatedSprite,
  name,
  className = '',
  size = 'medium',
  animationType = 'bounce',
  preloaded,
  preloadedStaticImg
}) => {
  const [currentSprite, setCurrentSprite] = useState(sprite);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  const sizeClasses = {
    small: 'w-16 h-16',
    medium: 'w-24 h-24',
    large: 'w-32 h-32'
  };

  const animationClasses = {
    bounce: 'animate-bounce',
    float: 'animate-pulse',
    pulse: 'animate-ping',
    shake: 'animate-shake',
    evolutionGlow: 'animate-glow-pulse',
    evolutionTransform: 'animate-shake',
    evolutionReveal: 'animate-reveal-pop',
    evolutionCelebrate: 'animate-glow-pulse',
    evolutionAnticipation: 'animate-pulse',
    evolutionIntensify: 'animate-shake',
    evolutionTransition: 'animate-ping',
    evolutionEmerge: 'animate-reveal-pop',
    evolutionTriumph: 'animate-glow-pulse'
  };

  // Try to load animated sprite first, fallback to static
  useEffect(() => {
    let mounted = true;

    const loadSprite = async () => {
      setIsLoading(true);
      setError(false);

      // If preloaded images are provided, use them directly
      if (preloaded && preloadedStaticImg) {
        if (mounted) {
          setCurrentSprite(sprite);
          setIsLoading(false);
          return;
        }
      }

      // Try animated sprite first
      if (animatedSprite) {
        try {
          await preloadImageWithRetry(animatedSprite);
          if (mounted) {
            setCurrentSprite(animatedSprite);
            setIsLoading(false);
            return;
          }
        } catch (err) {
          console.log(`Failed to load animated sprite for ${name}, using static`, err);
        }
      }

      // Fallback to static sprite
      try {
        await preloadImageWithRetry(sprite);
        if (mounted) {
          setCurrentSprite(sprite);
          setIsLoading(false);
        }
      } catch (err) {
        console.error(`Failed to load static sprite for ${name}:`, err);
      // Try fallback URLs using sprite helpers
      try {
        // Create a mock Pokemon object for fallback
        const mockPokemon = { name: name };
        const fallbackUrl = getStaticSprite(mockPokemon);
        
        if (fallbackUrl) {
          await preloadImageWithRetry(fallbackUrl);
          if (mounted) {
            setCurrentSprite(fallbackUrl);
            setIsLoading(false);
          }
        } else {
          throw new Error('No fallback sprite URL available');
        }
      } catch (fallbackErr) {
        console.error(`Failed to load fallback sprite for ${name}:`, fallbackErr);
        if (mounted) {
          setError(true);
          setIsLoading(false);
        }
      }
      }
    };

    loadSprite();

    return () => {
      mounted = false;
    };
  }, [sprite, animatedSprite, name, preloaded, preloadedStaticImg]);

  const preloadImage = (src: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (!src) {
        reject(new Error('Empty source URL'));
        return;
      }
      
      const img = new Image();
      img.onload = () => resolve();
      img.onerror = () => reject(new Error(`Failed to load image from ${src}`));
      img.src = src;
    });
  };

  const preloadImageWithRetry = async (src: string, retries = 2): Promise<void> => {
    let lastError: any;
    
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        await preloadImage(src);
        return;
      } catch (error) {
        lastError = error;
        
        // If this isn't the last attempt, wait with exponential backoff
        if (attempt < retries) {
          const delay = Math.pow(3, attempt) * 200; // 200ms, 600ms, 1800ms
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    throw lastError;
  };

  if (error) {
    return (
      <div className={`${sizeClasses[size]} ${className} bg-gray-200 rounded-full flex items-center justify-center`}>
        <span className="text-gray-500 text-xs">❓</span>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {isLoading && (
        <div className={`${sizeClasses[size]} bg-gray-200 rounded-full animate-pulse flex items-center justify-center`}>
          <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
      
      <img
        ref={imgRef}
        src={currentSprite}
        alt={name}
        className={`${sizeClasses[size]} object-contain ${animationClasses[animationType]} ${isLoading ? 'opacity-0' : 'opacity-10'} transition-opacity duration-300`}
        style={{ 
          imageRendering: 'pixelated',
          filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.3))'
        }}
        loading="lazy"
        onLoad={() => setIsLoading(false)}
        onError={() => setError(true)}
      />

      {/* Sparkle effects for animated sprites */}
      {!isLoading && !error && animatedSprite === currentSprite && (
        <>
          <div className="absolute -top-1 -left-1 w-2 h-2 bg-yellow-400 rounded-full animate-ping opacity-75"></div>
          <div className="absolute -top-1 -right-1 w-1 h-1 bg-blue-400 rounded-full animate-ping opacity-75" style={{ animationDelay: '0.5s' }}></div>
          <div className="absolute -bottom-1 -left-1 w-1.5 h-1.5 bg-pink-400 rounded-full animate-ping opacity-75" style={{ animationDelay: '1s' }}></div>
        </>
      )}

      {/* Custom CSS animations */}
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-2px); }
          20%, 40%, 60%, 80% { transform: translateX(2px); }
        }
        @keyframes glow-pulse {
          0%, 100% { filter: drop-shadow(0 0 5px #FFD700); }
          50% { filter: drop-shadow(0 20px #FFD700); }
        }
        @keyframes reveal-pop {
          0% { transform: scale(0.8); opacity: 0; }
          70% { transform: scale(1.1); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes evolution-glow {
          0%, 100% { filter: drop-shadow(0 0 5px #FFD700); }
          50% { filter: drop-shadow(0 0 20px #FFD700); }
        }
        @keyframes evolution-shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-2px); }
          20%, 40%, 60%, 80% { transform: translateX(2px); }
        }
        @keyframes evolution-reveal {
          0% { transform: scale(0.8); opacity: 0; }
          70% { transform: scale(1.1); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
        .animate-glow-pulse {
          animation: glow-pulse 1s ease-in-out infinite;
        }
        .animate-reveal-pop {
          animation: reveal-pop 0.6s cubic-bezier(0.175, 0.85, 0.32, 1.275);
        }
        .animate-evolution-glow {
          animation: evolution-glow 1s ease-in-out infinite;
        }
        .animate-evolution-shake {
          animation: evolution-shake 0.5s ease-in-out;
        }
        .animate-evolution-reveal {
          animation: evolution-reveal 0.6s cubic-bezier(0.175, 0.85, 0.32, 1.275);
        }
      `}</style>
    </div>
  );
});

AnimatedPokemon.displayName = 'AnimatedPokemon';

export default AnimatedPokemon;
