# FitTracker - Complete Fitness App 🏋️‍♂️

A comprehensive fitness tracking application built with React, TypeScript, and Tailwind CSS. Track your workouts, create exercise plans, monitor progress, and collect Pokémon rewards for your achievements!

## ✨ Features

### 🏋️ Workout Tracking

- **Real-time workout tracking** with timer and rest periods
- **Exercise database** with 50+ pre-loaded exercises
- **Set and rep tracking** with weight progression
- **Previous workout data** for reference and progression

### 📋 Exercise Planning

- **Custom workout plans** creation and management
- **Exercise categorization** (chest, back, legs, shoulders, arms, core, cardio)
- **Plan-based workouts** with guided routines
- **Estimated duration** calculations

### 📊 Statistics & Analytics

- **Comprehensive workout statistics** and progress tracking
- **Weekly activity charts** and trends
- **Strength progression** tracking for major lifts
- **Muscle group heatmaps** showing training balance
- **Achievement badges** for milestones

### 🎯 Skill Development

- **Custom skill trees** for fitness goals
- **Milestone tracking** with automatic progress updates
- **Legendary Pokémon skill trees** with themed challenges
- **Achievement system** with progress visualization

### 🏀 Pokémon Rewards System

- **151 unique Pokémon** from the original generation
- **Reward system** for completed workouts, milestones, and streaks
- **Pokémon collection** with detailed view and filtering
- **Motivational messages** specific to each Pokémon
- **Animated sprites** with fallback support

### 🎨 User Experience

- **Dark/Light theme** support with system preference detection
- **Responsive design** optimized for mobile and desktop
- **PWA support** with offline capabilities
- **Customizable dashboard** with widget management
- **Timer with wake lock** to keep screen active during workouts
- **Loading states and error handling** with graceful degradation
- **Data management** with export/import functionality

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/fittracker.git
   cd fittracker
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the development server:

   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:5173`

### Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Icons**: Lucide React
- **Build Tool**: Vite
- **Storage**: LocalStorage with error handling and safe operations
- **PWA**: Service Worker support
- **API**: PokéAPI for Pokémon data with caching and retry logic
- **Performance**: React.memo optimization, enhanced error boundaries

## 📱 Features in Detail

### Workout Tracker

- Start/pause/stop workout sessions
- Add exercises from comprehensive database
- Track sets, reps, weight, and duration
- Rest timer with customizable intervals
- Previous workout data for progression tracking

### Exercise Planner

- Create custom workout routines
- Organize exercises by muscle groups
- Set target sets, reps, and weights
- Estimate workout duration
- Start workouts directly from plans

### Statistics Dashboard

- Total workouts and training time
- Weekly activity visualization
- Strength progression charts
- Most popular exercises
- Achievement badges

### Skill Development System

- Create custom skill trees for fitness goals
- Set milestones with automatic tracking
- Legendary Pokémon-themed challenges
- Progress visualization and achievements

### Pokémon Collection

- Earn Pokémon through workout completion
- Milestone and streak rewards
- Complete Pokédex with 151 original Pokémon
- Detailed Pokémon information and stats
- Filter by reward type

## 🎮 Pokémon Reward System

The app features a unique gamification system where users earn Pokémon rewards for:

- **Workout Completion**: Random Pokémon for finishing workouts
- **Milestone Achievement**: Special rewards for reaching fitness goals
- **Streak Maintenance**: Bonus Pokémon for consistent training

Each Pokémon comes with:

- Unique motivational message
- Animated sprites when available
- Type information and Pokédex number
- Collection tracking and statistics

## 🏆 Achievement System

- **First Steps**: Complete your first workout
- **Week Warrior**: Maintain a 7-day streak
- **Dedicated Trainer**: Complete 10 workouts
- **Time Champion**: Train for 10+ hours total
- **Strength Milestones**: Achieve specific weight targets

## 🧬 Enhanced Evolution System

### Complete Generation Coverage
The evolution system now supports all Pokémon from Generation 1-9:

- **Generation 1-6**: Comprehensive fallback data for Pokémon IDs 1-66
- **Generation 7-9**: Extended support for Pokémon IDs 667-1025
- **Fallback System**: Robust offline functionality when API is unavailable
- **Evolution Chains**: Properly structured `evolvesTo` arrays for all generations

### Robust Type Determination
The evolution system uses actual Pokémon type data from the PokéAPI instead of fragile name-based heuristics:

- **API-First Approach**: Fetches real Pokémon type data (fire, water, grass, etc.)
- **Intelligent Mapping**: Maps Pokémon types to workout categories using a comprehensive mapping system
- **Smart Fallbacks**: Falls back to user's most common workout types when API data is unavailable
- **Error Resilience**: Gracefully handles API failures with multiple fallback strategies

### Realistic Evolution Requirements
Evolution requirements are now based on user activity patterns:

- **Dynamic Requirements**: 3-20 workouts based on user activity and evolution complexity
- **User-Adaptive**: Requirements scale with user's workout history
- **Type-Based**: Required workout types match the Pokémon's actual elemental types
- **Streak Bonuses**: Consistent workout streaks reduce evolution requirements

### Testing the Evolution System

#### Automated Testing
```bash
# Test the improved evolution system
npm run test:evolution-improvements

# Test Generation 7-9 Pokémon specifically
npm run test:gen7-9

# Test comprehensive evolution scenarios
npm run test:comprehensive

# Test basic evolution functionality
npm run test:e2e

# Generate additional evolution data
npm run generate:evolution-data
```

#### Manual Testing with TestEvolutionButton
In development mode, use the "Test Evolution" button to:

- Scan for evolvable Pokémon in your collection
- Test the robust type determination system
- Verify realistic evolution requirements (3-20 workouts, not 999)
- Test fallback mechanisms when API fails

#### Evolution Type Mapping
The system maps Pokémon types to workout categories:

| Pokémon Type | Workout Categories | Example |
|-------------|-------------------|---------|
| Fire | Cardio, Strength | Charmander → Running, Weight Training |
| Water | Cardio, Flexibility | Squirtle → Swimming, Stretching |
| Grass | Flexibility, Balance | Bulbasaur → Yoga, Balance Training |
| Electric | Cardio, Speed | Pikachu → HIIT, Sprint Training |
| Fighting | Strength, Power | Machop → Powerlifting, Boxing |
| Psychic | Balance, Flexibility | Abra → Meditation, Yoga |
| Normal | General, Endurance | Eevee → General Fitness |

#### Troubleshooting Evolution Issues
- **Pokémon Won't Evolve**: Check that you've completed the required workout types
- **High Requirements**: Evolution requirements adapt to your activity level (3-20 workouts)
- **API Errors**: The system automatically falls back to local data
- **Type Mismatches**: Verify your workout categories match the Pokémon's elemental types
- **Final Form Pokémon**: Some Pokémon are already at their final evolution stage

#### Technical Implementation
**Key Features**
- Async Evolution Engine: Handles API calls and fallback data seamlessly
- Type Determination: Uses actual Pokémon API data with intelligent fallbacks
- Realistic Requirements: Dynamic calculation based on user activity patterns
- Comprehensive Testing: Full test suite covering all generations and edge cases
- Error Handling: Robust fallback systems for offline functionality

**Architecture**
- `useEvolutionEngine.ts`: Core evolution logic with robust type determination
- `evolutionDataSources.ts`: Comprehensive fallback data for all generations
- `TestEvolutionButton.tsx`: Development testing interface
- Comprehensive test suite for validation and debugging

The evolution system now provides a reliable, user-friendly experience that adapts to individual workout patterns while maintaining the gamification elements that motivate fitness activities.

## 💾 Data Management

- **Export/Import**: Backup and restore all your data
- **Data Safety**: Robust localStorage handling with error recovery
- **Cross-Platform**: JSON-based backups compatible with any device
- **Selective Import**: Choose what data to import from backups

## 📊 Data Management

All data is stored locally using browser LocalStorage:

- Workout history and statistics
- Custom workout plans
- Skill trees and milestones
- Pokémon collection
- User preferences and settings

## 🎨 Customization

- **Dashboard Layout**: Customize widget arrangement
- **Theme Selection**: Light/dark mode with system preference
- **Exercise Database**: Extensible exercise library
- **Skill Trees**: Create custom fitness goals and challenges

## 🔧 Development

### Project Structure

```bash
src/
├── components/          # React components
├── contexts/           # React contexts (Theme)
├── hooks/              # Custom React hooks
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
├── data/               # Static data (legendary skills)
└── main.tsx           # Application entry point
```

### Key Components

- `WorkoutTracker`: Main workout interface
- `ExercisePlanner`: Workout plan creation
- `Statistics`: Progress visualization
- `SkillDevelopment`: Goal tracking system
- `PokemonCollection`: Reward system interface

### Custom Hooks

- `useWorkouts`: Workout data management
- `useSkills`: Skill tree functionality
- `usePokemonRewards`: Reward system logic
- `useTimer`: Workout and rest timers

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **PokéAPI** for Pokémon data and sprites
- **Lucide** for beautiful icons
- **Tailwind CSS** for styling system
- **React** and **TypeScript** for the development framework

## 🐛 Known Issues

- Pokémon sprites may occasionally fail to load due to API limitations
- LocalStorage has size limitations for very large datasets
- PWA features require HTTPS in production

## 🔮 Future Enhancements

- [ ] Cloud data synchronization
- [ ] Social features and leaderboards
- [ ] Advanced analytics and insights
- [ ] Custom exercise creation
- [ ] Nutrition tracking integration
- [ ] Wearable device integration

## ✨ Recent Updates

### Version 1.2.0 - Enhanced Evolution System

- **Complete Generation Coverage**: Extended support for Generation 7-9 Pokémon (IDs 67-1025)
- **Robust Type Determination**: Replaced fragile name-based heuristics with actual Pokémon API data
- **Realistic Evolution Requirements**: Dynamic requirements (3-20 workouts) based on user activity
- **Comprehensive Testing**: Full test suite for evolution system validation
- **Improved Fallback System**: Enhanced offline functionality with local evolution data
- **Performance Optimization**: Async evolution engine with intelligent caching

### Version 1.1.0

- **Data Management**: Added export/import functionality for backups
- **Performance Improvements**: React.memo optimization and enhanced caching
- **Error Handling**: Robust error boundaries and graceful degradation
- **Code Quality**: Removed debug logging, refactored duplicate code, improved TypeScript types
- **UI/UX**: Better loading states and error messages

---

**Built with ❤️ for fitness enthusiasts and Pokémon fans!**

*Start your fitness journey today and catch 'em all!* 🏀✨
