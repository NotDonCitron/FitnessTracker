import React from 'react';
import { Play, Pause, RotateCcw, Coffee } from 'lucide-react';
import { useTimer } from '../hooks/useTimer';

interface TimerProps {
  onTimerComplete?: () => void;
  autoStart?: boolean;
  showRestTimer?: boolean;
}

const Timer: React.FC<TimerProps> = ({ 
  onTimerComplete, 
  autoStart = false, 
  showRestTimer = true 
}) => {
  const { 
    seconds, 
    isRunning, 
    isResting, 
    start, 
    pause, 
    reset, 
    startRest, 
    formatTime 
  } = useTimer(0);

  const handleRestTimer = (restSeconds: number) => {
    startRest(restSeconds);
  };

  React.useEffect(() => {
    if (autoStart) {
      start();
    }
  }, [autoStart]);

  React.useEffect(() => {
    if (seconds === 0 && !isRunning && isResting && onTimerComplete) {
      onTimerComplete();
    }
  }, [seconds, isRunning, isResting, onTimerComplete]);

  const getTimerColor = () => {
    if (isResting) return 'text-orange-600';
    if (isRunning) return 'text-green-600';
    return 'text-gray-600';
  };

  const getButtonColor = () => {
    if (isResting) return 'bg-orange-500 hover:bg-orange-600';
    if (isRunning) return 'bg-red-500 hover:bg-red-600';
    return 'bg-green-500 hover:bg-green-600';
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="text-center">
        {/* Timer Display */}
        <div className={`text-6xl font-bold font-mono mb-4 ${getTimerColor()}`}>
          {formatTime()}
        </div>

        {/* Status Indicator */}
        {isResting && (
          <div className="flex items-center justify-center mb-4 text-orange-600">
            <Coffee className="h-5 w-5 mr-2" />
            <span className="font-medium">Rest Time</span>
          </div>
        )}

        {/* Control Buttons */}
        <div className="flex justify-center space-x-4 mb-6">
          <button
            onClick={isRunning ? pause : start}
            className={`flex items-center px-6 py-4 text-lg rounded-lg text-white font-medium transition-all duration-200 transform hover:scale-105 ${getButtonColor()}`}
          >
            {isRunning ? (
              <>
                <Pause className="h-5 w-5 mr-2" />
                Pause
              </>
            ) : (
              <>
                <Play className="h-5 w-5 mr-2" />
                Start
              </>
            )}
          </button>

          <button
            onClick={() => reset(0)}
            className="flex items-center px-6 py-4 text-lg bg-gray-500 hover:bg-gray-600 rounded-lg text-white font-medium transition-all duration-200 transform hover:scale-105"
          >
            <RotateCcw className="h-5 w-5 mr-2" />
            Reset
          </button>
        </div>

        {/* Rest Timer Shortcuts */}
        {showRestTimer && !isResting && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">Quick Rest Timers</h4>
            <div className="flex justify-center space-x-2">
              {[30, 60, 90, 120, 180].map((restTime) => (
                <button
                  key={restTime}
                  onClick={() => handleRestTimer(restTime)}
                  className="px-4 py-3 bg-blue-100 dark:bg-blue-900 hover:bg-blue-200 dark:hover:bg-blue-800 text-blue-700 dark:text-blue-300 rounded-lg text-sm font-medium transition-all duration-200 transform hover:scale-105"
                >
                  {restTime < 60 ? `${restTime}s` : `${restTime / 60}m`}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Custom Rest Timer Input */}
        {showRestTimer && !isResting && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-center space-x-3">
              <input
               ref={(input) => {
                 if (input) {
                   input.addEventListener('keypress', (e) => {
                     if (e.key === 'Enter') {
                       const seconds = parseInt(input.value);
                       if (seconds > 0) {
                         handleRestTimer(seconds);
                         input.value = '';
                          // Haptic feedback
                          if ('vibrate' in navigator) {
                            navigator.vibrate(50);
                          }
                       }
                     }
                   });
                 }
               }}
                type="number"
                placeholder="Custom seconds"
                className="w-32 px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-center focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
               id="customRestInput"
              />
             <button
               onClick={() => {
                 const input = document.getElementById('customRestInput') as HTMLInputElement;
                 const seconds = parseInt(input.value);
                 if (seconds > 0) {
                   handleRestTimer(seconds);
                   input.value = '';
                    // Haptic feedback
                    if ('vibrate' in navigator) {
                      navigator.vibrate(50);
                    }
                 }
               }}
               className="px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-all duration-200 transform hover:scale-105"
             >
               Start
             </button>
              <span className="text-sm text-gray-600">seconds</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Timer;