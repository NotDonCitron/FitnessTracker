import React, { useState, useEffect, useRef } from 'react';

interface AnimatedPokemonProps {
  sprite: string;
  animatedSprite?: string;
  name: string;
  className?: string;
  size?: 'small' | 'medium' | 'large';
  animationType?: 'bounce' | 'float' | 'pulse' | 'shake';
}

const AnimatedPokemon: React.FC<AnimatedPokemonProps> = ({
  sprite,
  animatedSprite,
  name,
  className = '',
  size = 'medium',
  animationType = 'bounce'
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
    shake: 'animate-bounce'
  };

  // Try to load animated sprite first, fallback to static
  useEffect(() => {
    let mounted = true;

    const loadSprite = async () => {
      setIsLoading(true);
      setError(false);

      // Try animated sprite first
      if (animatedSprite) {
        try {
          await preloadImage(animatedSprite);
          if (mounted) {
            setCurrentSprite(animatedSprite);
            setIsLoading(false);
            return;
          }
        } catch (err) {
          console.log(`Failed to load animated sprite for ${name}, using static`);
        }
      }

      // Fallback to static sprite
      try {
        await preloadImage(sprite);
        if (mounted) {
          setCurrentSprite(sprite);
          setIsLoading(false);
        }
      } catch (err) {
        if (mounted) {
          setError(true);
          setIsLoading(false);
        }
      }
    };

    loadSprite();

    return () => {
      mounted = false;
    };
  }, [sprite, animatedSprite, name]);

  const preloadImage = (src: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve();
      img.onerror = reject;
      img.src = src;
    });
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
        className={`${sizeClasses[size]} object-contain ${animationClasses[animationType]} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
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
    </div>
  );
};

export default AnimatedPokemon;