import React, { useEffect, useState } from 'react';
import { X, Star, Trophy } from 'lucide-react';
import { PokemonReward as IPokemonReward } from '../types/pokemon';
import AnimatedPokemon from './AnimatedPokemon';

// Pokémon-specific motivational messages (151 unique messages for each Pokémon ID)
const POKEMON_MOTIVATIONS: Record<number, string> = {
  1: "🌱 Bulbasaur Power! You planted the seeds of greatness!",
  2: "🌿 Ivysaur Energy! You're growing stronger every day!",
  3: "🌺 Venusaur Might! You've blossomed into a champion!",
  4: "🔥 Charmander Spirit! Your passion burns bright!",
  5: "🔥 Charmeleon Force! You're heating up the competition!",
  6: "🐉 Charizard Roar! You soared to legendary heights!",
  7: "💧 Squirtle Squad! You made waves in the gym!",
  8: "🌊 Wartortle Flow! You're riding the current to success!",
  9: "💪 Blastoise Cannon! You blasted through every limit!",
  10: "🐛 Caterpie Crawl! Small steps lead to big transformations!",
  11: "🛡️ Metapod Shell! You're hardening your resolve!",
  12: "🦋 Butterfree Flight! You've transformed beautifully!",
  13: "🐝 Weedle Sting! You packed a powerful punch!",
  14: "⚡ Kakuna Shock! You're ready to emerge stronger!",
  15: "🐝 Beedrill Buzz! You struck with precision and power!",
  16: "🐦 Pidgey Soar! You're taking flight to new heights!",
  17: "🦅 Pidgeotto Glide! You're cruising toward victory!",
  18: "🏆 Pidgeot Majesty! You rule the skies of fitness!",
  19: "🐭 Rattata Speed! Quick and nimble, that's your style!",
  20: "⚡ Raticate Rush! You gnawed through every challenge!",
  21: "🐦 Spearow Strike! Small but mighty, just like you!",
  22: "🦅 Fearow Dive! You swooped down on success!",
  23: "🐍 Ekans Coil! You wrapped up that workout perfectly!",
  24: "🐍 Arbok Intimidate! You struck fear into weakness!",
  25: "⚡ Pikachu Power! You're absolutely electrifying!",
  26: "⚡ Raichu Thunder! You shocked everyone with your strength!",
  27: "🏜️ Sandshrew Dig! You burrowed deep for those gains!",
  28: "🏜️ Sandslash Slash! You cut through every obstacle!",
  29: "💜 Nidoran♀ Grace! Elegant power in every movement!",
  30: "💜 Nidorina Pride! You're growing into greatness!",
  31: "👑 Nidoqueen Royalty! You reign supreme in the gym!",
  32: "💙 Nidoran♂ Courage! Brave heart, strong body!",
  33: "💙 Nidorino Charge! You rushed toward victory!",
  34: "👑 Nidoking Dominance! You ruled that workout!",
  35: "🌟 Clefairy Magic! You made the impossible look easy!",
  36: "✨ Clefable Wonder! Your performance was magical!",
  37: "🦊 Vulpix Charm! Six tails of pure determination!",
  38: "🔥 Ninetales Mystique! Nine tails of legendary power!",
  39: "🎵 Jigglypuff Song! You put weakness to sleep!",
  40: "🎤 Wigglytuff Melody! Your rhythm was perfect!",
  41: "🦇 Zubat Flight! You navigated through the darkness!",
  42: "🦇 Golbat Swoop! You dove into excellence!",
  43: "🌸 Oddish Bloom! You're growing beautifully!",
  44: "🌺 Gloom Fragrance! Sweet success follows you!",
  45: "🌻 Vileplume Petal! You blossomed magnificently!",
  46: "🍄 Paras Spore! You spread excellence everywhere!",
  47: "🍄 Parasect Control! You mastered every movement!",
  48: "👁️ Venonat Vision! You saw through to victory!",
  49: "🦋 Venomoth Flutter! You danced through that workout!",
  50: "🕳️ Diglett Tunnel! You dug deep for those gains!",
  51: "⚡ Dugtrio Triple! Three times the power, three times the gains!",
  52: "🐱 Meowth Scratch! You clawed your way to success!",
  53: "😸 Persian Elegance! Graceful power in every rep!",
  54: "🦆 Psyduck Confusion! Even confused, you still won!",
  55: "🦆 Golduck Psychic! Your mental strength is incredible!",
  56: "🐵 Mankey Rage! You channeled anger into power!",
  57: "🦍 Primeape Fury! Your intensity was unmatched!",
  58: "🐕 Growlithe Loyalty! Faithful to your fitness goals!",
  59: "🔥 Arcanine Legendary! You ran with legendary speed!",
  60: "🌀 Poliwag Swirl! You spun your way to success!",
  61: "💪 Poliwhirl Muscle! You flexed your way to victory!",
  62: "🥊 Poliwrath Fighter! You punched through every limit!",
  63: "🔮 Abra Teleport! You appeared at the finish line!",
  64: "🧠 Kadabra Spoon! You bent reality with your will!",
  65: "✨ Alakazam Genius! Your intelligence powered through!",
  66: "💪 Machop Strength! Small but mighty, just like you!",
  67: "🏋️ Machoke Power! You're getting stronger every day!",
  68: "🏆 Machamp Champion! Four arms of pure determination!",
  69: "🌱 Bellsprout Vine! You reached for new heights!",
  70: "🌿 Weepinbell Trap! You caught success in your grasp!",
  71: "🌺 Victreebel Bite! You devoured that workout!",
  72: "🌊 Tentacool Float! You flowed through with grace!",
  73: "🦑 Tentacruel Wrap! You embraced every challenge!",
  74: "🗿 Geodude Rock! You're solid as a rock!",
  75: "⛰️ Graveler Roll! You rolled over every obstacle!",
  76: "🏔️ Golem Explosion! You blasted through barriers!",
  77: "🐴 Ponyta Gallop! You raced toward greatness!",
  78: "🔥 Rapidash Flame! You blazed a trail to victory!",
  79: "🐌 Slowpoke Pace! Slow and steady wins the race!",
  80: "🧠 Slowbro Wisdom! Smart training pays off!",
  81: "🧲 Magnemite Attract! You drew success to yourself!",
  82: "⚡ Magneton Force! Triple the magnetic personality!",
  83: "🦆 Farfetch'd Leek! You're one in a million!",
  84: "🐦 Doduo Double! Two heads are better than one!",
  85: "🏃 Dodrio Triple! You ran circles around the competition!",
  86: "🦭 Seel Swim! You dove into excellence!",
  87: "❄️ Dewgong Ice! You kept your cool under pressure!",
  88: "💜 Grimer Sludge! You turned mess into success!",
  89: "💜 Muk Toxic! Your determination is infectious!",
  90: "🐚 Shellder Clamp! You held tight to your goals!",
  91: "❄️ Cloyster Spike! You pierced through every barrier!",
  92: "👻 Gastly Haunt! You spooked weakness away!",
  93: "👻 Haunter Lick! You tasted sweet victory!",
  94: "👻 Gengar Shadow! You emerged from the shadows victorious!",
  95: "🐍 Onix Tunnel! You carved a path to success!",
  96: "😴 Drowzee Hypnosis! You put doubt to sleep!",
  97: "🔮 Hypno Pendulum! You swung toward victory!",
  98: "🦀 Krabby Pinch! You grabbed hold of greatness!",
  99: "🦀 Kingler Claw! You crushed the competition!",
  100: "⚡ Voltorb Spark! You're full of electric energy!",
  101: "💥 Electrode Boom! You exploded with power!",
  102: "🥚 Exeggcute Hatch! You're ready to break out!",
  103: "🌴 Exeggutor Tall! You stand head and shoulders above!",
  104: "💀 Cubone Bone! You've got backbone and determination!",
  105: "💀 Marowak Spirit! You honor your training ancestors!",
  106: "🦵 Hitmonlee Kick! You kicked butt in that workout!",
  107: "👊 Hitmonchan Punch! You packed a powerful punch!",
  108: "👅 Lickitung Lick! You tasted sweet success!",
  109: "💨 Koffing Gas! You're full of explosive energy!",
  110: "☠️ Weezing Poison! Your dedication is toxic to weakness!",
  111: "🦏 Rhyhorn Charge! You bulldozed through barriers!",
  112: "💎 Rhydon Drill! You pierced through every limit!",
  113: "💖 Chansey Heal! You're spreading positive energy!",
  114: "🌿 Tangela Vine! You're all tangled up in success!",
  115: "🦘 Kangaskhan Pouch! You're carrying victory with you!",
  116: "🌊 Horsea Current! You rode the wave to success!",
  117: "🐉 Seadra Dragon! You're evolving into greatness!",
  118: "🐠 Goldeen Beauty! You're swimming in style!",
  119: "👑 Seaking Royal! You rule the fitness waters!",
  120: "⭐ Staryu Star! You're shining bright tonight!",
  121: "💎 Starmie Gem! You're a precious treasure!",
  122: "🎭 Mr. Mime Barrier! Nothing can stop your progress!",
  123: "⚔️ Scyther Slash! You cut through every challenge!",
  124: "💋 Jynx Kiss! You sealed the deal on success!",
  125: "⚡ Electabuzz Shock! You're absolutely electrifying!",
  126: "🔥 Magmar Flame! You're burning with determination!",
  127: "🪲 Pinsir Grip! You've got a hold on greatness!",
  128: "🐂 Tauros Charge! You bulldozed through that workout!",
  129: "🐟 Magikarp Splash! Even splashing leads to evolution!",
  130: "🐉 Gyarados Rage! You transformed into a beast!",
  131: "🚢 Lapras Ferry! You carried yourself to victory!",
  132: "🔄 Ditto Transform! You adapted and overcame!",
  133: "🦊 Eevee Potential! You're full of possibilities!",
  134: "💧 Vaporeon Flow! You flowed like water to success!",
  135: "⚡ Jolteon Speed! Lightning fast and powerful!",
  136: "🔥 Flareon Heat! You brought the fire today!",
  137: "🤖 Porygon Digital! You computed your way to victory!",
  138: "🐚 Omanyte Fossil! Ancient power, modern gains!",
  139: "🌀 Omastar Spiral! You spiraled up to success!",
  140: "🦀 Kabuto Shell! You're tough as your shell!",
  141: "⚔️ Kabutops Blade! You sliced through every obstacle!",
  142: "🦅 Aerodactyl Soar! You flew to prehistoric heights!",
  143: "😴 Snorlax Rest! Even resting, you're still winning!",
  144: "❄️ Articuno Ice! You're cool under pressure!",
  145: "⚡ Zapdos Thunder! You struck with legendary power!",
  146: "🔥 Moltres Fire! You burned bright like a legend!",
  147: "🐉 Dratini Dragon! You're growing into something amazing!",
  148: "🐉 Dragonair Mystique! You're gracefully powerful!",
  149: "🐉 Dragonite Gentle! Gentle giant with incredible strength!",
  150: "🧠 Mewtwo Psychic! Your mental power is unmatched!",
  151: "✨ Mew Mythical! You're as rare and special as Mew!"
};

const getMotivationForPokemon = (pokemonId: number): string => {
  return POKEMON_MOTIVATIONS[pokemonId] || "🎉 Awesome! Really Big Dick-Dick-Energie Right Here!";
};

// Fallback motivations for non-original 151 Pokémon
const FALLBACK_MOTIVATIONS = [
  "🎉 Awesome! Really Big Dick-Dick-Energie Right Here!",
  "💪 Beast Mode Activated! Your gains are legendary!",
  "🔥 Absolute Unit! You're crushing those fitness goals!",
  "⚡ Thunder Power! Your dedication is electrifying!",
  "🏆 Champion Energy! You're unstoppable today!",
  "🚀 Rocket Fuel! Your workout was out of this world!",
  "💎 Diamond Strength! You're harder than diamonds!",
  "🌟 Star Power! You're shining brighter than ever!",
  "🦁 Lion Heart! Your courage in the gym is inspiring!",
  "🔥 Fire Force! You're burning through those limits!"
];

const getRandomFallbackMotivation = () => {
  return FALLBACK_MOTIVATIONS[Math.floor(Math.random() * FALLBACK_MOTIVATIONS.length)];
};

interface PokemonRewardProps {
  reward: IPokemonReward;
  onDismiss: () => void;
}

const PokemonReward: React.FC<PokemonRewardProps> = ({ reward, onDismiss }) => {
  console.log('🎊 [DEBUG] PokemonReward component rendering with reward:', reward);
  const [isVisible, setIsVisible] = useState(false);
  const [showFireworks, setShowFireworks] = useState(false);
  const [showContent, setShowContent] = useState(false);
  const [motivation, setMotivation] = useState('');

  useEffect(() => {
    console.log('🎨 [DEBUG] PokemonReward useEffect: Starting animations');
    // Get motivation specific to this Pokémon
    const pokemonMotivation = getMotivationForPokemon(reward.pokemon.id);
    setMotivation(pokemonMotivation);
    
    // Animate in
    setTimeout(() => {
      console.log('👁️ [DEBUG] Setting isVisible and showContent to true');
      setIsVisible(true);
      setShowContent(true);
    }, 100);
    
    // Show fireworks effect
    setTimeout(() => setShowFireworks(true), 800);
    
    // Hide fireworks after animation
    setTimeout(() => setShowFireworks(false), 3000);
  }, []);

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
      >
        {/* Reward Card */}
        <div 
          className={`bg-gradient-to-b from-white to-blue-50 rounded-2xl p-8 max-w-sm w-full text-center relative transform transition-all duration-700 shadow-2xl border-4 border-yellow-300 ${
            isVisible ? 'scale-100 rotate-0 translate-y-0' : 'scale-75 rotate-12 translate-y-10'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            onClick={onDismiss}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors z-10 bg-white rounded-full w-8 h-8 flex items-center justify-center shadow-md"
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
          <h2 className="text-2xl font-bold text-gray-900 mb-3 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {reward.reason}
          </h2>
          <p className="text-gray-700 mb-8 text-lg font-medium">A wild Pokémon appeared!</p>

          {/* Pokemon Display */}
          <div className="relative mb-6">
            {/* Pokémon Platform */}
            <div className="w-36 h-36 mx-auto mb-6 relative bg-gradient-to-b from-blue-100 to-blue-200 rounded-full flex items-center justify-center shadow-inner">
              {showContent && (
                <AnimatedPokemon
                  sprite={reward.pokemon.sprite}
                  animatedSprite={reward.pokemon.animatedSprite}
                  name={reward.pokemon.name}
                  size="large"
                  animationType="bounce"
                  className="transform scale-110"
                />
              )}
              
              {/* Sparkle effects around Pokemon */}
              {showFireworks && (
                <div className="absolute inset-0 pointer-events-none overflow-visible">
                  {[...Array(8)].map((_, i) => (
                    <div
                      key={i}
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
                  style={{ backgroundColor: getTypeColor(reward.pokemon.type1) }}
                >
                  {reward.pokemon.type1}
                </span>
                {reward.pokemon.type2 && (
                  <span 
                    className="px-3 py-1 rounded-full text-white text-sm font-medium"
                    style={{ backgroundColor: getTypeColor(reward.pokemon.type2) }}
                  >
                    {reward.pokemon.type2}
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
      </div>

      {/* Confetti Effect */}
      {showFireworks && (
        <div className="fixed inset-0 pointer-events-none z-40 overflow-hidden">
          {[...Array(30)].map((_, i) => (
            <div
              key={i}
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
};

export default PokemonReward;