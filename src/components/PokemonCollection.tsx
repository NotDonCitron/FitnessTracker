import React, { useState, useCallback } from 'react';
import { Trophy, Star, Calendar, TrendingUp, Award, Zap, Search, Filter, Plus } from 'lucide-react';
import { usePokemonRewards } from '../hooks/usePokemonRewards';
import { useWorkouts } from '../hooks/useWorkouts';
import AnimatedPokemon from './AnimatedPokemon';
import TestEvolutionButton from './TestEvolutionButton';

// Generate motivational messages for all Pokemon (extended Pokedex)
const getMotivationForPokemon = (pokemon: any): string => {
  const pokemonName = pokemon.name || 'Pokemon';
  const pokemonId = pokemon.id || 1;

  // Base motivational templates
  const templates = [
    `🌟 ${pokemonName}! You're absolutely incredible!`,
    `💪 ${pokemonName}! Your strength knows no bounds!`,
    `🔥 ${pokemonName}! You're burning bright with determination!`,
    `⚡ ${pokemonName}! Your energy is electric!`,
    `🛡️ ${pokemonName}! You're unbreakable and resilient!`,
    `🏆 ${pokemonName}! You're a champion in every way!`,
    `🚀 ${pokemonName}! You're reaching legendary heights!`,
    `💎 ${pokemonName}! You're truly one of a kind!`,
    `🌈 ${pokemonName}! You're colorful and magnificent!`,
    `⭐ ${pokemonName}! You're shining bright!`
  ];

  // Special messages for legendary Pokemon (approximate IDs)
  const legendaryIds = [144, 145, 146, 150, 151, 243, 244, 245, 249, 250, 251, 377, 378, 379, 380, 381, 382, 383, 384, 385, 386, 480, 481, 482, 483, 484, 485, 486, 487, 488, 489, 490, 491, 492, 493, 494, 638, 639, 640, 641, 642, 643, 644, 645, 646, 647, 648, 649, 716, 717, 718, 719, 720, 721, 789, 790, 791, 792, 800, 807, 808, 809];

  if (legendaryIds.includes(pokemonId)) {
    return `🌟 LEGENDARY ${pokemonName}! You're a mythical force of nature!`;
  }

  // Use Pokemon name hash for consistent but varied messages
  const hash = pokemonName.split('').reduce((a: number, b: string) => {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0);

  return templates[Math.abs(hash) % templates.length];
};

interface PokemonCollectionProps {
  rewards: any[];
  addTestPokemon?: (pokemonId: number, pokemonName: string) => Promise<void>;
  onEvolutionTriggered?: (fromPokemon: any, toPokemon: any, reason: string) => void;
}

const PokemonCollection: React.FC<PokemonCollectionProps> = ({ rewards, addTestPokemon, onEvolutionTriggered }) => {
  // Debug log to see rewards updates
  React.useEffect(() => {
    console.log('Pokemon rewards updated:', rewards);
  }, [rewards]);

  // Helper function to calculate reward stats from the rewards prop
  const getRewardStats = useCallback(() => {
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 1000);
    
    const thisWeek = rewards.filter(reward => 
      new Date(reward.timestamp) >= oneWeekAgo
    ).length;
    
    const uniquePokemon = new Set(rewards.map(reward => reward.pokemon.id)).size;
    const streakRewards = rewards.filter(reward => reward.type === 'streak').length;
    
    // Show up to 12 recent rewards instead of just 5
    const recentRewards = rewards.slice(0, 12);
    
    return {
      totalRewards: rewards.length,
      uniquePokemon,
      thisWeek,
      streakRewards,
      recentRewards
    };
  }, [rewards]);
  const [selectedPokemon, setSelectedPokemon] = useState<any>(null);
  const [filter, setFilter] = useState<'all' | 'workout' | 'milestone' | 'streak' | 'evolution'>('all');
  const [showAllPokemon, setShowAllPokemon] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);

  const stats = {
    totalRewards: rewards.length,
    uniquePokemon: new Set(rewards.map(reward => reward.pokemon.id)).size,
    thisWeek: rewards.filter(reward => {
      const now = new Date();
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 1000);
      return new Date(reward.timestamp) >= oneWeekAgo;
    }).length,
    streakRewards: rewards.filter(reward => reward.type === 'streak').length,
    recentRewards: rewards.slice(0, 12)
  };

  const filteredRewards = rewards.filter(reward => {
    // Type filter (workout/milestone/streak)
    if (filter !== 'all' && reward.type !== filter) return false;

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const pokemonName = reward.pokemon.name?.toLowerCase() || '';
      if (!pokemonName.includes(query)) return false;
    }

    // Pokemon type filter
    if (typeFilter !== 'all') {
      const pokemonTypes = reward.pokemon.types;
      if (!pokemonTypes.includes(typeFilter)) return false;
    }

    return true;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'workout': return <Zap className="h-4 w-4" />;
      case 'milestone': return <Trophy className="h-4 w-4" />;
      case 'streak': return <Award className="h-4 w-4" />;
      case 'evolution': return <TrendingUp className="h-4 w-4" />;
      default: return <Star className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'workout': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'milestone': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'streak': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'evolution': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default: return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          🏀 Pokémon Collection
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Your legendary fitness companions earned through dedication and hard work
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100">Total Encounters</p>
              <p className="text-3xl font-bold">{stats.totalRewards}</p>
            </div>
            <Trophy className="h-8 w-8 text-blue-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-teal-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100">Unique Species</p>
              <p className="text-3xl font-bold">{stats.uniquePokemon}</p>
            </div>
            <Star className="h-8 w-8 text-green-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-orange-500 to-red-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100">This Week</p>
              <p className="text-3xl font-bold">{stats.thisWeek}</p>
            </div>
            <Calendar className="h-8 w-8 text-orange-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100">Streak Rewards</p>
              <p className="text-3xl font-bold">{stats.streakRewards}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-purple-200" />
          </div>
        </div>
      </div>

      {/* Search and Filter Controls */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Search Pokémon..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          {/* Reward Type Filter */}
          <div className="flex-1">
            <div className="flex space-x-1">
              {[
                { key: 'all', label: 'All', icon: Star },
                { key: 'workout', label: 'Workout', icon: Zap },
                { key: 'milestone', label: 'Milestone', icon: Trophy },
                { key: 'streak', label: 'Streak', icon: Award },
                { key: 'evolution', label: 'Evolution', icon: TrendingUp }
              ].map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setFilter(key as any)}
                  className={`flex-1 flex items-center justify-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    filter === key
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                      : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <Icon className="h-4 w-4 mr-1" />
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center space-x-2">
            {/* Pokemon Type Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              <Filter className="h-4 w-4 mr-2" />
              Type Filter
            </button>

            {/* Add Test Weedle Button */}
            <button
              onClick={async () => {
                if (addTestPokemon) {
                  try {
                    await addTestPokemon(13, 'weedle');
                    console.log('Test Weedle added successfully');
                  } catch (error) {
                    console.error('Failed to add Test Weedle:', error);
                  }
                } else {
                  console.log('addTestPokemon function not available');
                }
              }}
              className="flex items-center px-4 py-2 bg-green-500 dark:bg-green-600 text-white rounded-lg hover:bg-green-600 dark:hover:bg-green-700 transition-colors"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Weedle
            </button>

            {/* Test Evolution Button */}
            <TestEvolutionButton onEvolutionTriggered={onEvolutionTriggered || (() => {})} />
          </div>
        </div>

        {/* Pokemon Type Filters */}
        {showFilters && (
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
            {[
              'all', 'normal', 'fire', 'water', 'electric', 'grass',
              'ice', 'fighting', 'poison', 'ground', 'flying', 'psychic',
              'bug', 'rock', 'ghost', 'dragon', 'dark', 'steel',
              'fairy'
            ].map(type => (
              <button
                key={type}
                onClick={() => setTypeFilter(type)}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors capitalize ${
                  typeFilter === type
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {type === 'all' ? 'All Types' : type}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Pokemon Grid */}
      {filteredRewards.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🏀</div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            No Pokémon Yet
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Complete workouts, achieve milestones, and maintain streaks to encounter legendary Pokémon!
          </p>
          <button
            onClick={() => window.dispatchEvent(new CustomEvent('changeTab', { detail: { tab: 'workout' } }))}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Start Training
          </button>
        </div>
      ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {showAllPokemon ? 'All Encounters' : 'Recent Encounters'}
              </h2>
              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {showAllPokemon 
                    ? `Showing all ${filteredRewards.length} encounters`
                    : `Showing ${Math.min(stats.recentRewards.length, 12)} of ${stats.totalRewards} total encounters`
                  }
                </span>
                <button
                  onClick={() => setShowAllPokemon(!showAllPokemon)}
                  className="px-3 py-1 text-sm bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
                >
                  {showAllPokemon ? 'Show Recent' : 'View All'}
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {(showAllPokemon ? filteredRewards : filteredRewards.slice(0, 12)).map((reward, index) => (
                <div
                  key={`${reward.pokemon.id}-${reward.timestamp}-${index}`}
                  onClick={() => setSelectedPokemon(reward)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setSelectedPokemon(reward);
                    }
                  }}
                  role="button"
                  tabIndex={0}
                  className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-lg p-4 cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105"
                >
                  <div className="text-center">
                    <div className="text-4xl mb-2">
                      <AnimatedPokemon 
                        sprite={reward.pokemon.sprites?.static}
                        animatedSprite={reward.pokemon.sprites?.animated}
                        name={reward.pokemon.name}
                        size="medium"
                      />
                    </div>
                    <h3 className="font-medium text-gray-900 dark:text-white text-sm mb-1">
                      {reward.pokemon.name}
                    </h3>
                    <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(reward.type)}`}>
                      {getTypeIcon(reward.type)}
                      <span className="ml-1 capitalize">{reward.type}</span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {new Date(reward.timestamp).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
      )}

      {/* Pokemon Detail Modal */}
      {selectedPokemon && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
            <div className="text-center mb-6">
              <div className="text-8xl mb-4">
                <AnimatedPokemon 
                  sprite={selectedPokemon.pokemon.sprites?.static}
                  animatedSprite={selectedPokemon.pokemon.sprites?.animated}
                  name={selectedPokemon.pokemon.name}
                  size="large"
                />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {selectedPokemon.pokemon.name}
              </h2>
              <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getTypeColor(selectedPokemon.type)}`}>
                {getTypeIcon(selectedPokemon.type)}
                <span className="ml-2 capitalize">{selectedPokemon.type} Reward</span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Encounter Details</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">Date:</span>
                    <span className="text-gray-900 dark:text-white">
                      {new Date(selectedPokemon.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">Time:</span>
                    <span className="text-gray-900 dark:text-white">
                      {new Date(selectedPokemon.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">Reason:</span>
                    <span className="text-gray-900 dark:text-white">{selectedPokemon.reason}</span>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900 rounded-lg p-4">
                <p className="text-blue-800 dark:text-blue-200 text-sm text-center">
                  {getMotivationForPokemon(selectedPokemon.pokemon)}
                </p>
              </div>
            </div>

            <button
              onClick={() => setSelectedPokemon(null)}
              className="w-full mt-6 bg-gray-600 hover:bg-gray-700 text-white py-2 rounded-lg font-medium transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PokemonCollection;
