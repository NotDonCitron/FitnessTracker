import React, { useState } from 'react';
import { X, Sparkles, SkipForward, RotateCcw } from 'lucide-react';
import { PokemonWithEvolution } from '../types/pokemon';
import EvolutionAnimationSequence from './EvolutionAnimationSequence';

interface EvolutionModalProps {
  fromPokemon: PokemonWithEvolution;
  toPokemon: PokemonWithEvolution;
  reason: string;
  onClose: () => void;
  onEvolutionTriggered?: (fromPokemon: PokemonWithEvolution, toPokemon: PokemonWithEvolution, reason: string) => void;
}

const EvolutionModal: React.FC<EvolutionModalProps> = (props) => {
  const [showEvolution, setShowEvolution] = useState(false);
  const [animationPhase, setAnimationPhase] = useState<'anticipation' | 'transformation' | 'reveal' | 'complete'>('anticipation');
  const [showSkipConfirm, setShowSkipConfirm] = useState(false);
  const [isReplaying, setIsReplaying] = useState(false);
  const [animationKey, setAnimationKey] = useState(0);

  const handleClose = () => {
    setShowEvolution(false);
    setTimeout(props.onClose, 500);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-8 max-w-md w-full mx-4 relative overflow-hidden">
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-100"
        >
          <X className="h-6 w-6" />
        </button>


        <div className="text-center">
          {/* Evolution sparkles icon */}
          <div className="mb-6 flex justify-center">
            <div className="relative">
              <Sparkles className="h-12 w-12 text-yellow-500 animate-bounce" />
            </div>
          </div>

          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Evolution!
          </h2>

          <p className="text-gray-600 dark:text-gray-300 mb-8">
            {props.reason}
          </p>

          {/* Animation controls */}
          <div className="flex justify-center space-x-4 mb-4">
          <button
            onClick={() => setShowSkipConfirm(true)}
            className="flex items-center space-x-1 bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded text-sm transition-colors"
          >
            <SkipForward className="h-4 w-4" />
            <span>Skip</span>
          </button>
            <button
              onClick={() => setIsReplaying(true)}
              className="flex items-center space-x-1 bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm transition-colors"
            >
              <RotateCcw className="h-4 w-4" />
              <span>Replay</span>
            </button>
          </div>

          {/* Evolution Animation Sequence */}
          <div className="mb-8 h-64 flex items-center justify-center">
            <EvolutionAnimationSequence
              key={animationKey}
              fromPokemon={props.fromPokemon}
              toPokemon={props.toPokemon}
              onAnimationComplete={() => {
                setShowEvolution(true);
                // Also update the parent state to reflect the evolution
                if (props.onEvolutionTriggered) {
                  props.onEvolutionTriggered(props.fromPokemon, props.toPokemon, props.reason);
                }
              }}
              onAnimationPhaseChange={setAnimationPhase}
              initialPhase={animationPhase}
            />
          </div>

          {/* Progress indicator */}
          <div className="mb-4">
            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300 mb-1">
              <span>Progress</span>
              <span className="capitalize">{animationPhase}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ 
                  width: animationPhase === 'anticipation' ? '33%' : 
                         animationPhase === 'transformation' ? '66%' : 
                         animationPhase === 'reveal' ? '100%' : '100%' 
                }}
              ></div>
            </div>
          </div>

          {/* Evolution details */}
          {showEvolution && (
            <div className="bg-green-50 dark:bg-green-900 rounded-lg p-4 mb-6">
              <h3 className="text-lg font-semibold text-green-800 dark:text-green-200 mb-2">
                Evolution Complete!
              </h3>
              <p className="text-green-700 dark:text-green-300 text-sm">
                Your {props.fromPokemon.name} has evolved into {props.toPokemon.name}!
              </p>
            </div>
          )}

          {/* Close button */}
          {/* Skip confirmation dialog */}
          {showSkipConfirm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-sm w-full mx-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Skip Evolution Animation?
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Are you sure you want to skip the evolution animation? You can always replay it later.
                </p>
                <div className="flex space-x-3">
                  <button
                    onClick={() => setShowSkipConfirm(false)}
                    className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 dark:bg-gray-600 dark:hover:bg-gray-500 dark:text-white py-2 px-4 rounded transition-colors"
                  >
                    Cancel
                  </button>
          <button
            onClick={() => {
              setShowSkipConfirm(false);
              // Skip to completion by setting animation phase to complete
              setAnimationPhase('complete');
              setShowEvolution(true);
            }}
            className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded transition-colors"
          >
            Skip
          </button>
                </div>
              </div>
            </div>
          )}

          {/* Replay animation */}
          {isReplaying && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-sm w-full mx-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Replay Evolution?
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  This will restart the evolution animation from the beginning.
                </p>
                <div className="flex space-x-3">
                  <button
                    onClick={() => setIsReplaying(false)}
                    className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 dark:bg-gray-600 dark:hover:bg-gray-500 dark:text-white py-2 px-4 rounded transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      setIsReplaying(false);
                      // Reset animation state and trigger replay
                      setShowEvolution(false);
                      setAnimationPhase('anticipation');
                      setAnimationKey(k => k + 1);
                    }}
                    className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded transition-colors"
                  >
                    Replay
                  </button>
                </div>
              </div>
            </div>
          )}

          <button
            onClick={() => {
              // Reset phase when closing
              setAnimationPhase('anticipation');
              handleClose();
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
};

export default EvolutionModal;
