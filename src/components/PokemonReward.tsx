import React, { useEffect, useState } from 'react';
import { X, Star, Trophy } from 'lucide-react';
import { PokemonReward as IPokemonReward } from '../types/pokemon';
import { getMotivationForPokemon } from '../data/pokemonMotivations';
import AnimatedPokemon from './AnimatedPokemon';

interface PokemonRewardProps {
  reward: IPokemonReward;
  onDismiss: () => void;
}

const PokemonReward: React.FC<PokemonRewardProps> = React.memo(({ reward, onDismiss }) => {
    const [isVisible, setIsVisible] = useState(false);
    const [showFireworks, setShowFireworks] = useState(false);
    const [motivation, setMotivation] = useState('');

   useEffect(() => {
      // Get motivation specific to this Pokémon
      const pokemonMotivation = getMotivationForPokemon(reward.pokemon.id);
      setMotivation(pokemonMotivation);

      // Animate in
      setTimeout(() => {
        setIsVisible(true);

        // Focus management for accessibility
        setTimeout(() => {
          const closeButton = document.querySelector('[data-close-button]') as HTMLButtonElement;
          if (closeButton) {
            closeButton.focus();
          }
        }, 500);
      }, 100);

      // Show fireworks effect
      setTimeout(() => setShowFireworks(true), 800);

      // Hide fireworks after animation
      setTimeout(() => setShowFireworks(false), 3000);
    }, [reward.pokemon.id]);

    // Handle Escape key globally when modal is visible
    useEffect(() => {
      if (!isVisible) return;

      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onDismiss();
        }
      };

      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }, [isVisible, onDismiss]);

  const formatPokemonName = (name: string) => {
    return name.charAt(0).toUpperCase() + name.slice(1).replace('-', ' ');
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      normal: '#A8A77A',
      fire: '#EE8130',
      water: '#6390F0',
      electric: '#F7D02C',
      grass: '#7AC74C',
      ice: '#96D9D6',
      fighting: '#C22E28',
      poison: '#A33EA1',
      ground: '#E2BF65',
      flying: '#A98FF3',
      psychic: '#F95587',
      bug: '#A6B91A',
      rock: '#B6A136',
      ghost: '#735797',
      dragon: '#6F35FC',
      dark: '#705746',
      steel: '#B7B7CE',
      fairy: '#D685AD'
    };
    return colors[type] || '#68D391';
  };

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4 transition-opacity duration-500 ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={onDismiss}
        aria-label="Close reward modal"
      >
        {/* Reward Card */}
        <dialog
          className={`bg-gradient-to-b from-white to-blue-50 rounded-2xl p-8 max-w-sm w-full text-center relative transform transition-all duration-700 shadow-2xl border-4 border-yellow-300 ${
            isVisible ? 'scale-100 rotate-0 translate-y-0' : 'scale-75 rotate-12 translate-y-10'
          }`}
          open={isVisible}
          aria-labelledby="reward-title"
        >
          <div onClick={(e) => e.stopPropagation()}>
            {/* Close Button */}
            <button
            onClick={onDismiss}
            data-close-button
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors z-10 bg-white rounded-full w-8 h-8 flex items-center justify-center shadow-md"
            aria-label="Close reward dialog"
          >
            <X className="h-6 w-6" />
          </button>

          {/* Celebration Icons */}
          <div className="flex justify-center mb-6">
            <div className="flex space-x-2">
              <Trophy className="h-8 w-8 text-yellow-500 animate-bounce" style={{ animationDelay: '0ms' }} />
              <Star className="h-8 w-8 text-yellow-400 animate-bounce" style={{ animationDelay: '200ms' }} />
              <Trophy className="h-8 w-8 text-yellow-500 animate-bounce" style={{ animationDelay: '400ms' }} />
            </div>
          </div>

          {/* Achievement Reason */}
          <h2 id="reward-title" className="text-2xl font-bold text-gray-900 mb-3 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {reward.reason}
          </h2>
          <p className="text-gray-700 mb-8 text-lg font-medium">A wild Pokémon appeared!</p>

          {/* Pokemon Display */}
          <div className="relative mb-6">
            {/* Pokémon Platform */}
            <div className="w-36 h-36 mx-auto mb-6 relative bg-gradient-to-b from-blue-100 to-blue-200 rounded-full flex items-center justify-center shadow-inner">
              <AnimatedPokemon
                sprite={reward.pokemon.sprites.static}
                animatedSprite={reward.pokemon.sprites.animated}
                name={reward.pokemon.name}
                size="large"
                animationType="bounce"
                className="transform scale-110"
              />
              
              {/* Sparkle effects around Pokemon */}
              {showFireworks && (
                <div className="absolute inset-0 pointer-events-none overflow-visible">
                  {[...Array(8)].map((_, i) => (
                    <div
                      key={`sparkle-${reward.pokemon.id}-${i}`}
                      className={`absolute w-3 h-3 rounded-full animate-ping`}
                      style={{
                        backgroundColor: ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8'][i],
                        top: `${Math.random() * 100}%`,
                        left: `${Math.random() * 100}%`,
                        animationDelay: `${i * 0.2}s`,
                        animationDuration: `${1 + Math.random()}s`
                      }}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Pokemon Info */}
            <div className="space-y-3">
              <h3 className="text-2xl font-bold text-gray-900">
                {formatPokemonName(reward.pokemon.name)}
              </h3>
              <p className="text-gray-500 text-lg">#{reward.pokemon.id.toString().padStart(3, '0')}</p>
              
              {/* Pokemon Types */}
              <div className="flex justify-center space-x-2 mt-3">
                <span 
                  className="px-3 py-1 rounded-full text-white text-sm font-medium"
                  style={{ backgroundColor: getTypeColor(reward.pokemon.types[0]) }}
                >
                  {reward.pokemon.types[0]}
                </span>
                {reward.pokemon.types[1] && (
                  <span 
                    className="px-3 py-1 rounded-full text-white text-sm font-medium"
                    style={{ backgroundColor: getTypeColor(reward.pokemon.types[1]) }}
                  >
                    {reward.pokemon.types[1]}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Action Button */}
          <button
            onClick={onDismiss}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold py-4 px-6 rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 shadow-lg text-lg"
          >
            {motivation}
          </button>
          </div>
        </dialog>
      </div>

      {/* Confetti Effect */}
      {showFireworks && (
        <div className="fixed inset-0 pointer-events-none z-40 overflow-hidden">
          {[...Array(30)].map((_, i) => (
            <div
              key={`confetti-${reward.pokemon.id}-${i}`}
              className="absolute rounded-full animate-bounce"
              style={{
                width: `${4 + Math.random() * 6}px`,
                height: `${4 + Math.random() * 6}px`,
                backgroundColor: ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'][Math.floor(Math.random() * 6)],
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 60}%`,
                animationDelay: `${Math.random() * 1}s`,
                animationDuration: `${0.8 + Math.random() * 0.4}s`
              }}
            />
          ))}
        </div>
      )}
    </>
  );
});

PokemonReward.displayName = 'PokemonReward';

export default PokemonReward;
