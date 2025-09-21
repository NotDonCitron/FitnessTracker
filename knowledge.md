# FitnessTracker Knowledge

## Project Overview

A comprehensive fitness tracking application built with React, TypeScript, and Tailwind CSS. The app combines fitness tracking with Pokemon rewards to gamify the exercise experience.

## Key Features

- Workout tracking with exercise logging
- Pokemon reward system based on achievements
- Evolution mechanics tied to fitness milestones
- Statistics and progress visualization
- Skills development system
- Timer functionality for workouts

## Architecture

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **State Management**: React hooks (custom hooks pattern)
- **Testing**: Jest with React Testing Library
- **Icons**: Lucide React

## Development

- Start dev server: `npm run dev` (runs on port 5173)
- Build: `npm run build`
- Test: `npm test`
- Lint: `npm run lint`

## Key Components

- **App.tsx**: Main app component with navigation and state coordination
- **WorkoutTracker**: Exercise logging and tracking
- **PokemonCollection**: Pokemon rewards and evolution system
- **Statistics**: Progress visualization
- **Dashboard**: Main overview screen

## Important Files

- **src/hooks/**: Custom hooks for workouts, pokemon, skills, achievements
- **src/utils/**: Helper utilities for storage, API, sprites
- **src/types/**: TypeScript type definitions
- **src/data/**: Static data like pokemon motivations

## Development Notes

- The app uses local storage for persistence
- Pokemon sprites are fetched from external APIs with fallback handling
- Evolution system is complex with multiple trigger conditions
- Debug logging is enabled throughout for development
