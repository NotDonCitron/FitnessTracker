import React, { useState, useEffect } from 'react';
import { Home, Dumbbell, Calendar, BarChart3, Menu, X, Target, Sun, Moon } from 'lucide-react';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import Dashboard from './components/Dashboard';
import WorkoutTracker from './components/WorkoutTracker';
import ExercisePlanner from './components/ExercisePlanner';
import Statistics from './components/Statistics';
import SkillDevelopment from './components/SkillDevelopment';
import PokemonCollection from './components/PokemonCollection';
import PokemonReward from './components/PokemonReward';
import { usePokemonRewards } from './hooks/usePokemonRewards';
import { useWorkouts } from './hooks/useWorkouts';
import { useSkills } from './hooks/useSkills';
import { EXERCISE_DATABASE } from './utils/exercises';

type ActiveTab = 'dashboard' | 'workout' | 'planner' | 'stats' | 'skills' | 'pokemon';

function AppContent() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  // Initialize Pokemon rewards
  const {
    rewards,
    currentReward,
    isLoading: pokemonLoading,
    triggerWorkoutReward,
    triggerMilestoneReward,
    triggerStreakReward,
    dismissCurrentReward,
    getRewardStats
  } = usePokemonRewards();

  // Debug current reward state
  React.useEffect(() => {
    console.log('🎮 [DEBUG] App: currentReward state changed:', currentReward);
    if (currentReward) {
      console.log('🎊 [DEBUG] Pokemon reward should be visible now!');
    } else {
      console.log('😴 [DEBUG] No current reward, modal should be hidden');
    }
  }, [currentReward]);
  
  // Initialize workout hook with pokemon callbacks
  const workoutHook = useWorkouts((workoutId) => {
    console.log('🎯 [DEBUG] Workout completion callback triggered in App.tsx');
    triggerWorkoutReward(workoutId);
  }, (days) => {
    console.log('🔥 [DEBUG] Streak reward callback triggered in App.tsx for', days, 'days');
    triggerStreakReward(days);
  });

  // Initialize skills hook with pokemon callbacks
  const skillHook = useSkills(triggerMilestoneReward);

  useEffect(() => {
    // Listen for tab changes from components
    const handleTabChange = (event) => {
      if (event.detail?.tab) {
        setActiveTab(event.detail.tab);
      }
    };
    
    window.addEventListener('changeTab', handleTabChange);

    return () => {
      window.removeEventListener('changeTab', handleTabChange);
    };
  }, []);

  const tabs = [
    { id: 'dashboard' as ActiveTab, name: 'Dashboard', icon: Home },
    { id: 'workout' as ActiveTab, name: 'Workout', icon: Dumbbell },
    { id: 'planner' as ActiveTab, name: 'Plans', icon: Calendar },
    { id: 'stats' as ActiveTab, name: 'Stats', icon: BarChart3 },
    { id: 'skills' as ActiveTab, name: 'Skills', icon: Target },
    { id: 'pokemon' as ActiveTab, name: 'Pokémon', icon: () => <span className="text-lg">🏀</span> },
  ];

  const renderActiveComponent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard {...workoutHook} />;
      case 'workout':
        return <WorkoutTracker {...workoutHook} />;
      case 'planner':
        return <ExercisePlanner {...workoutHook} />;
      case 'stats':
        return <Statistics {...workoutHook} />;
      case 'skills':
        return <SkillDevelopment {...skillHook} EXERCISE_DATABASE={EXERCISE_DATABASE} />;
      case 'pokemon':
        return <PokemonCollection />;
      default:
        return <Dashboard {...workoutHook} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors">
      {/* Mobile Header */}
      <div className="md:hidden bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 px-4 py-3">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">STONK-Brothers</h1>
          <div className="flex items-center space-x-2">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-md text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-md text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
        
        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="mt-4 pb-4">
            <nav className="flex flex-col space-y-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isCustomIcon = typeof Icon === 'function' && Icon.name === '';
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      activeTab === tab.id
                        ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                        : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    {isCustomIcon ? (
                      <span className="mr-3"><Icon /></span>
                    ) : (
                      <Icon className="h-5 w-5 mr-3" />
                    )}
                    {tab.name}
                  </button>
                );
              })}
            </nav>
          </div>
        )}
      </div>

      <div className="flex h-screen md:h-auto">
        {/* Desktop Sidebar */}
        <div className="hidden md:flex md:w-64 md:flex-col">
          <div className="flex flex-col flex-grow bg-white dark:bg-gray-800 shadow-sm">
            <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center">
                <Dumbbell className="h-8 w-8 text-blue-600 dark:text-blue-400 mr-3" />
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">FitTracker</h1>
              </div>
              <button
                onClick={toggleTheme}
                className="p-2 rounded-md text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </button>
            </div>
            
            <nav className="flex-1 px-4 py-6 space-y-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isCustomIcon = typeof Icon === 'function' && Icon.name === '';
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      activeTab === tab.id
                        ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                        : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    {isCustomIcon ? (
                      <span className="mr-3"><Icon /></span>
                    ) : (
                      <Icon className="h-5 w-5 mr-3" />
                    )}
                    {tab.name}
                  </button>
                );
              })}
            </nav>
            
            <div className="px-4 py-4 border-t border-gray-200 dark:border-gray-700">
              <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
                FitTracker v1.0<br />
                Your fitness companion
              </div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">STONK-Brothers</h1>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 dark:bg-gray-900">
            <div className="container mx-auto px-4 py-6 max-w-7xl">
              {renderActiveComponent()}
            </div>
          </main>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-4 py-2">
        <div className="flex justify-around">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isCustomIcon = typeof Icon === 'function' && Icon.name === '';
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center p-2 rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? 'text-blue-600 dark:text-blue-400'
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                {isCustomIcon ? (
                  <div className="mb-1"><Icon /></div>
                ) : (
                  <Icon className="h-5 w-5 mb-1" />
                )}
                <span className="text-xs font-medium">{tab.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Pokemon Reward Modal */}
      {currentReward && (
        <PokemonReward 
          reward={currentReward} 
          onDismiss={dismissCurrentReward} 
        />
      )}
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

export default App;