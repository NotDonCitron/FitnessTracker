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
- **Storage**: LocalStorage for data persistence
- **PWA**: Service Worker support
- **API**: PokéAPI for Pokémon data

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
```
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

---

**Built with ❤️ for fitness enthusiasts and Pokémon fans!**

*Start your fitness journey today and catch 'em all!* 🏀✨