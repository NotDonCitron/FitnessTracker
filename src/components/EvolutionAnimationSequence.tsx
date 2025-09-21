import React, { useState, useEffect } from 'react';
import { Pokemon } from '../types/pokemon';
import { getStaticSprite, getAnimatedSprite, preloadPokemonSprites } from '../utils/spriteHelpers';
import AnimatedPokemon from './AnimatedPokemon';
import { EvolutionEffects } from './EvolutionEffects';

interface EvolutionAnimationSequenceProps {
  fromPokemon: Pokemon;
  toPokemon: Pokemon;
  onAnimationComplete: () => void;
  onAnimationPhaseChange?: (phase: 'anticipation' | 'transformation' | 'reveal' | 'complete') => void;
  initialPhase?: 'anticipation' | 'transformation' | 'reveal' | 'complete';
}

const EvolutionAnimationSequence: React.FC<EvolutionAnimationSequenceProps> = ({
  fromPokemon,
  toPokemon,
  onAnimationComplete,
  onAnimationPhaseChange,
 initialPhase = 'anticipation'
}) => {
  const [currentPhase, setCurrentPhase] = useState<'anticipation' | 'transformation' | 'reveal' | 'complete'>(initialPhase);
  const [showFlash, setShowFlash] = useState(false);
  const [showShake, setShowShake] = useState(false);
  const [showTargetPokemon, setShowTargetPokemon] = useState(false);
  const [targetPokemonOpacity, setTargetPokemonOpacity] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Preload sprites
  useEffect(() => {
    const loadSprites = async () => {
      try {
        await Promise.all([
          preloadPokemonSprites(fromPokemon),
          preloadPokemonSprites(toPokemon)
        ]);
        setIsLoading(false);
      } catch (error) {
        console.error('Failed to preload evolution sprites:', error);
        setLoadError('Failed to load Pokemon sprites');
        setIsLoading(false);
      }
    };

    loadSprites();
  }, [fromPokemon, toPokemon]);

  // Animation phase management
  useEffect(() => {
    if (isLoading) return;

    const phaseTimings = {
      anticipation: 1500,
      transformation: 2500,
      reveal: 200
    };

    let timer: NodeJS.Timeout;
    let transitionTimer: NodeJS.Timeout;

    switch (currentPhase) {
      case 'anticipation':
        onAnimationPhaseChange?.('anticipation');
        
        timer = setTimeout(() => {
          setCurrentPhase('transformation');
        }, phaseTimings.anticipation);
        break;

      case 'transformation':
        setShowFlash(true);
        setShowShake(true);
        onAnimationPhaseChange?.('transformation');
        
        // Start showing target Pokemon during transformation with fade-in effect
        transitionTimer = setTimeout(() => {
          setShowTargetPokemon(true);
          // Gradually increase opacity during transformation
          let opacity = 0;
          const opacityInterval = setInterval(() => {
            opacity += 5;
            setTargetPokemonOpacity(opacity);
            if (opacity >= 100) {
              clearInterval(opacityInterval);
            }
          }, 50);
        }, 300);

        timer = setTimeout(() => {
          setCurrentPhase('reveal');
          setShowShake(false);
          setShowFlash(false);
        }, phaseTimings.transformation);
        break;

      case 'reveal':
        setShowTargetPokemon(true);
        setTargetPokemonOpacity(100);
        onAnimationPhaseChange?.('reveal');
        
        timer = setTimeout(() => {
          setCurrentPhase('complete');
          onAnimationPhaseChange?.('complete');
          onAnimationComplete();
        }, phaseTimings.reveal);
        break;
    }

    return () => {
      if (timer) clearTimeout(timer);
      if (transitionTimer) clearTimeout(transitionTimer);
    };
  }, [currentPhase, isLoading, onAnimationComplete, onAnimationPhaseChange]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Preparing evolution...</p>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center text-red-500">
          <p className="mb-2">⚠️ {loadError}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {/* Evolution Effects */}
      <EvolutionEffects
        pokemon={toPokemon}
        phase={currentPhase}
        intensity={1}
      />

      {/* Screen shake effect container */}
      <div className={showShake ? 'animate-shake' : ''}>
        {/* Pokemon display area */}
        <div className="relative flex items-center justify-center space-x-12">
          {/* Source Pokemon */}
          <div className={`transition-all duration-1000 ${currentPhase === 'transformation' ? 'opacity-0 scale-75' : 'opacity-100'}`}>
            <AnimatedPokemon
              sprite={getStaticSprite(fromPokemon)}
              animatedSprite={getAnimatedSprite(fromPokemon)}
              name={fromPokemon.name}
              size="large"
              animationType={currentPhase === 'anticipation' ? 'evolutionGlow' : 'bounce'}
            />
          </div>

          {/* Evolution arrow */}
          <div className="text-4xl text-yellow-500 animate-pulse">→</div>

          {/* Target Pokemon */}
          <div 
            className={`transition-all duration-1000 ${showTargetPokemon ? 'scale-100' : 'scale-75'}`}
            style={{ opacity: showTargetPokemon ? targetPokemonOpacity / 100 : 0 }}
          >
            {showTargetPokemon && (
              <AnimatedPokemon
                sprite={getStaticSprite(toPokemon)}
                animatedSprite={getAnimatedSprite(toPokemon)}
                name={toPokemon.name}
                size="large"
                animationType="evolutionReveal"
              />
            )}
          </div>
        </div>
      </div>

      {/* Custom CSS animations */}
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
          20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
        .animate-shake {
          animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
        }
      `}</style>
    </div>
 );
};

export default EvolutionAnimationSequence;
