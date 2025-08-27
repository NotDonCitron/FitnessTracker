import React, { useState, useEffect } from 'react';
import { Trophy, Star, Calendar, TrendingUp, Award, Zap } from 'lucide-react';
import { usePokemonRewards } from '../hooks/usePokemonRewards';
import AnimatedPokemon from './AnimatedPokemon';

// Pokemon-specific motivational messages (1-151)
const getMotivationForPokemon = (pokemonId: number): string => {
  const motivations = [
    "🌱 Bulbasaur Seed! You planted the seeds of greatness!",
    "🌿 Ivysaur Growth! You're evolving into excellence!",
    "🌺 Venusaur Bloom! You've blossomed into a champion!",
    "🔥 Charmander Spark! You ignited your inner fire!",
    "🔥 Charmeleon Flame! You're burning bright with determination!",
    "🐉 Charizard Roar! You soared to legendary heights!",
    "💧 Squirtle Squad! You made waves in the gym!",
    "🌊 Wartortle Shell! Your defense is impenetrable!",
    "💪 Blastoise Cannon! You blasted through every limit!",
    "🐛 Caterpie Crawl! Small steps lead to big gains!",
    "🛡️ Metapod Harden! You're building unbreakable strength!",
    "🦋 Butterfree Flight! You've transformed beautifully!",
    "🐝 Weedle Sting! You packed a powerful punch!",
    "⚡ Kakuna Shock! You're charged with energy!",
    "🐝 Beedrill Drill! You pierced through every challenge!",
    "🐦 Pidgey Fly! You soared above expectations!",
    "🦅 Pidgeotto Wing! You're spreading your wings wide!",
    "🦅 Pidgeot Gust! You created a whirlwind of success!",
    "🐭 Rattata Quick! Your speed was incredible!",
    "🐭 Raticate Bite! You sank your teeth into victory!",
    "🐦 Spearow Peck! You struck with precision!",
    "🦅 Fearow Keen! Your focus was razor sharp!",
    "🐍 Ekans Coil! You wrapped up that workout perfectly!",
    "🐍 Arbok Intimidate! You commanded respect in the gym!",
    "⚡ Pikachu Power! You're absolutely electrifying!",
    "⚡ Raichu Thunder! You brought the storm of gains!",
    "🏜️ Sandshrew Dig! You dug deep for that strength!",
    "🏜️ Sandslash Slash! You cut through every obstacle!",
    "♀️ Nidoran♀ Poison! You're toxic to weakness!",
    "👑 Nidorina Queen! You ruled that workout!",
    "👑 Nidoqueen Majesty! You're the queen of gains!",
    "♂️ Nidoran♂ Horn! You charged ahead fearlessly!",
    "🦏 Nidorino Fury! Your intensity was unstoppable!",
    "👑 Nidoking Power! You're the king of the gym!",
    "🧚 Clefairy Magic! You made the impossible look easy!",
    "🌙 Clefable Moonlight! You illuminated greatness!",
    "🦊 Vulpix Fire! You brought the heat to training!",
    "🦊 Ninetales Mystical! Your performance was legendary!",
    "🎤 Jigglypuff Song! You hit all the right notes!",
    "🎵 Wigglytuff Melody! Your rhythm was perfect!",
    "🦇 Zubat Flight! You navigated through challenges!",
    "🦇 Golbat Bite! You sank your fangs into success!",
    "🌱 Oddish Root! You're grounded in strength!",
    "🌺 Gloom Bloom! You're flowering into greatness!",
    "🌻 Vileplume Petal! You're beautiful and powerful!",
    "🍄 Paras Spore! You spread excellence everywhere!",
    "🍄 Parasect Mushroom! You're growing stronger daily!",
    "🐛 Venonat Eyes! You saw victory coming!",
    "🦋 Venomoth Dust! You scattered weakness to the wind!",
    "🕳️ Diglett Tunnel! You dug deep for that power!",
    "🕳️ Dugtrio Triple! You tripled your efforts!",
    "🐱 Meowth Coin! You struck gold in the gym!",
    "🐱 Persian Scratch! You clawed your way to victory!",
    "🦆 Psyduck Psychic! Your mental game was strong!",
    "🦆 Golduck Swim! You dove deep into excellence!",
    "🐵 Mankey Rage! Your fury fueled your success!",
    "🐵 Primeape Anger! You channeled rage into power!",
    "🐕 Growlithe Loyal! Your dedication never wavers!",
    "🐕 Arcanine Legendary! You're a mythical athlete!",
    "🐸 Poliwag Tadpole! You're swimming toward greatness!",
    "🐸 Poliwhirl Whirl! You spun circles around weakness!",
    "🐸 Poliwrath Punch! You packed a powerful blow!",
    "🧠 Abra Teleport! You moved at the speed of thought!",
    "🧠 Kadabra Spoon! You bent reality with your will!",
    "🧠 Alakazam Psychic! Your mind power is unmatched!",
    "💪 Machop Muscle! You're building serious strength!",
    "💪 Machoke Flex! Your muscles are impressive!",
    "💪 Machamp Champion! You're the ultimate fighter!",
    "🌱 Bellsprout Root! You're growing stronger daily!",
    "🌱 Weepinbell Bell! You rang in victory!",
    "🌱 Victreebel Trap! You caught success perfectly!",
    "🌊 Tentacool Float! You flowed through that workout!",
    "🌊 Tentacruel Cruel! You were merciless to weakness!",
    "🗿 Geodude Rock! You're solid as a mountain!",
    "🗿 Graveler Roll! You rolled over every obstacle!",
    "🗿 Golem Explosion! You blew away expectations!",
    "🐴 Ponyta Gallop! You raced toward victory!",
    "🐴 Rapidash Speed! You blazed through that workout!",
    "🐌 Slowpoke Slow! Steady progress wins the race!",
    "🐌 Slowbro Bro! You're a reliable champion!",
    "⚡ Magnemite Magnet! You attracted success!",
    "⚡ Magneton Triple! You tripled your magnetic power!",
    "🦆 Farfetch'd Leek! You're uniquely awesome!",
    "🐦 Doduo Double! You doubled your efforts!",
    "🐦 Dodrio Triple! You tripled your speed!",
    "🦭 Seel Seal! You sealed the deal on greatness!",
    "🦭 Dewgong Song! Your performance was music!",
    "💜 Grimer Sludge! You turned mess into success!",
    "💜 Muk Toxic! You're poisonous to mediocrity!",
    "🐚 Shellder Shell! Your defense is legendary!",
    "🐚 Cloyster Spike! You're sharp and dangerous!",
    "👻 Gastly Ghost! You spooked weakness away!",
    "👻 Haunter Haunt! You haunted every rep!",
    "👻 Gengar Shadow! You shadowed perfection!",
    "🐍 Onix Rock! You're unbreakable as stone!",
    "😴 Drowzee Sleep! You dreamed of victory!",
    "😴 Hypno Hypnosis! You mesmerized the competition!",
    "🦀 Krabby Crab! You pinched victory from defeat!",
    "🦀 Kingler King! You're the king of crustaceans!",
    "⚡ Voltorb Ball! You rolled to victory!",
    "⚡ Electrode Explosion! You exploded with energy!",
    "🥚 Exeggcute Egg! You're full of potential!",
    "🌴 Exeggutor Palm! You're tall and mighty!",
    "💀 Cubone Bone! You're tough to the core!",
    "💀 Marowak Warrior! You're a bone-wielding champion!",
    "🥋 Hitmonlee Kick! Your kicks were legendary!",
    "👊 Hitmonchan Punch! You packed a powerful punch!",
    "👅 Lickitung Lick! You tasted sweet victory!",
    "💨 Koffing Gas! You cleared the air of doubt!",
    "💨 Weezing Poison! You're toxic to weakness!",
    "🦏 Rhyhorn Charge! You charged toward greatness!",
    "🦏 Rhydon Drill! You drilled through every barrier!",
    "🌸 Chansey Heal! You healed all doubts about your power!",
    "🌿 Tangela Vine! You're tangled up in success!",
    "🦘 Kangaskhan Pouch! You're protective of your gains!",
    "🌊 Horsea Sea! You rode the waves of victory!",
    "🐉 Seadra Dragon! You're a sea dragon of strength!",
    "🐠 Goldeen Gold! You're worth your weight in gold!",
    "🐠 Seaking King! You're the king of the sea!",
    "⭐ Staryu Star! You're a shining star!",
    "⭐ Starmie Gem! You're a precious gem of power!",
    "🤡 Mr. Mime Mime! You performed flawlessly!",
    "🗡️ Scyther Slash! You cut through every challenge!",
    "👄 Jynx Kiss! You kissed victory on the lips!",
    "⚡ Electabuzz Buzz! You're buzzing with energy!",
    "🔥 Magmar Fire! You brought the heat of champions!",
    "🪲 Pinsir Pincer! You gripped victory tightly!",
    "🐂 Tauros Bull! You charged like a champion!",
    "🐟 Magikarp Splash! Even small efforts make waves!",
    "🐉 Gyarados Rage! You unleashed legendary fury!",
    "🌊 Lapras Gentle! You're gentle but incredibly strong!",
    "💧 Ditto Transform! You adapted perfectly!",
    "🦊 Eevee Evolution! You're full of potential!",
    "💧 Vaporeon Water! You flowed like liquid power!",
    "⚡ Jolteon Lightning! You struck like lightning!",
    "🔥 Flareon Fire! You burned bright with passion!",
    "🤖 Porygon Digital! You computed victory perfectly!",
    "🐚 Omanyte Ancient! You're timeless in your strength!",
    "🐚 Omastar Star! You're an ancient star of power!",
    "🦀 Kabuto Fossil! You're built to last!",
    "🦀 Kabutops Scythe! You cut through competition!",
    "🦅 Aerodactyl Prehistoric! You're ancient and powerful!",
    "😴 Snorlax Sleep! You're powerfully peaceful!",
    "🧊 Articuno Ice! You're cool under pressure!",
    "⚡ Zapdos Thunder! You brought divine lightning!",
    "🔥 Moltres Fire! You're a legendary flame!",
    "🐉 Dratini Dragon! You're a baby dragon with big dreams!",
    "🐉 Dragonair Air! You're graceful and powerful!",
    "🐉 Dragonite Dragon! You're a gentle giant of strength!",
    "🧠 Mewtwo Psychic! Your mental power is unmatched!",
    "✨ Mew Mythical! You're as rare and special as Mew!"
  ];
  
  // Return motivation for Pokemon ID (1-151), fallback for invalid IDs
  return motivations[pokemonId - 1] || "🏀 Legendary! You're absolutely incredible!";
};

const PokemonCollection: React.FC = () => {
  const { rewards, getRewardStats } = usePokemonRewards();
  const [selectedPokemon, setSelectedPokemon] = useState<any>(null);
  const [filter, setFilter] = useState<'all' | 'workout' | 'milestone' | 'streak'>('all');
  const [showAllPokemon, setShowAllPokemon] = useState(false);

  const stats = getRewardStats();

  const filteredRewards = rewards.filter(reward => {
    if (filter === 'all') return true;
    return reward.type === filter;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'workout': return <Zap className="h-4 w-4" />;
      case 'milestone': return <Trophy className="h-4 w-4" />;
      case 'streak': return <Award className="h-4 w-4" />;
      default: return <Star className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'workout': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'milestone': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'streak': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
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

      {/* Filter Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-1">
        <div className="flex space-x-1">
          {[
            { key: 'all', label: 'All Pokémon', icon: Star },
            { key: 'workout', label: 'Workout Rewards', icon: Zap },
            { key: 'milestone', label: 'Milestones', icon: Trophy },
            { key: 'streak', label: 'Streaks', icon: Award }
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setFilter(key as any)}
              className={`flex-1 flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                filter === key
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <Icon className="h-4 w-4 mr-2" />
              {label}
            </button>
          ))}
        </div>
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
        <>
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
              {(showAllPokemon ? filteredRewards : stats.recentRewards).map((reward, index) => (
                <div
                  key={`${reward.pokemon.id}-${reward.timestamp}-${index}`}
                  onClick={() => setSelectedPokemon(reward)}
                  className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-lg p-4 cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105"
                >
                  <div className="text-center">
                    <div className="text-4xl mb-2">
                      <AnimatedPokemon 
                        sprite={reward.pokemon.sprite}
                        animatedSprite={reward.pokemon.animatedSprite}
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
        </>
      )}

      {/* Pokemon Detail Modal */}
      {selectedPokemon && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
            <div className="text-center mb-6">
              <div className="text-8xl mb-4">
                <AnimatedPokemon 
                  sprite={selectedPokemon.pokemon.sprite}
                  animatedSprite={selectedPokemon.pokemon.animatedSprite}
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
                  {getMotivationForPokemon(selectedPokemon.pokemon.id)}
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