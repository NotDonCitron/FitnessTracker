import { SkillTree } from '../types/skills';

export const LEGENDARY_SKILL_TREES: SkillTree[] = [
  // Mewtwo - Psychic Power (Strength Focus)
  {
    id: 'mewtwo-psychic-power',
    name: 'Mewtwo\'s Psychic Power',
    description: 'Channel the legendary psychic power of Mewtwo through strength training',
    category: 'strength',
    icon: '🧠',
    color: '#8B5CF6',
    milestones: [
      {
        id: 'mewtwo-1',
        title: 'Psychic Awakening',
        description: 'Begin your journey to legendary strength',
        targetValue: 10,
        currentValue: 0,
        unit: 'workouts',
        completed: false,
        category: 'strength'
      },
      {
        id: 'mewtwo-2',
        title: 'Mind Over Matter',
        description: 'Bench press your bodyweight like Mewtwo lifts objects with his mind',
        targetValue: 80,
        currentValue: 0,
        unit: 'weight',
        exerciseId: 'bench-press',
        completed: false,
        category: 'strength'
      },
      {
        id: 'mewtwo-3',
        title: 'Telekinetic Strength',
        description: 'Achieve 100 perfect push-ups with psychic focus',
        targetValue: 100,
        currentValue: 0,
        unit: 'reps',
        exerciseId: 'push-ups',
        completed: false,
        category: 'strength'
      },
      {
        id: 'mewtwo-4',
        title: 'Legendary Power',
        description: 'Deadlift 150kg - the weight of Mewtwo\'s psychic energy',
        targetValue: 150,
        currentValue: 0,
        unit: 'weight',
        exerciseId: 'deadlifts',
        completed: false,
        category: 'strength'
      }
    ],
    totalProgress: 0,
    createdDate: new Date().toISOString()
  },

  // Articuno - Ice Endurance
  {
    id: 'articuno-ice-endurance',
    name: 'Articuno\'s Ice Endurance',
    description: 'Master the legendary endurance of the ice bird Articuno',
    category: 'endurance',
    icon: '❄️',
    color: '#06B6D4',
    milestones: [
      {
        id: 'articuno-1',
        title: 'Frozen Focus',
        description: 'Hold a plank for 2 minutes like Articuno\'s icy patience',
        targetValue: 120,
        currentValue: 0,
        unit: 'time',
        exerciseId: 'plank',
        completed: false,
        category: 'endurance'
      },
      {
        id: 'articuno-2',
        title: 'Glacial Stamina',
        description: 'Complete 30 workouts with the persistence of eternal ice',
        targetValue: 30,
        currentValue: 0,
        unit: 'workouts',
        completed: false,
        category: 'endurance'
      },
      {
        id: 'articuno-3',
        title: 'Blizzard Cardio',
        description: 'Perform 500 jumping jacks like a fierce blizzard',
        targetValue: 500,
        currentValue: 0,
        unit: 'reps',
        exerciseId: 'jumping-jacks',
        completed: false,
        category: 'endurance'
      },
      {
        id: 'articuno-4',
        title: 'Legendary Flight',
        description: 'Train for 20 hours total - soar like the legendary ice bird',
        targetValue: 1200,
        currentValue: 0,
        unit: 'time',
        completed: false,
        category: 'endurance'
      }
    ],
    totalProgress: 0,
    createdDate: new Date().toISOString()
  },

  // Zapdos - Electric Speed
  {
    id: 'zapdos-electric-speed',
    name: 'Zapdos\'s Electric Speed',
    description: 'Harness the lightning-fast power of the legendary thunder bird',
    category: 'consistency',
    icon: '⚡',
    color: '#F59E0B',
    milestones: [
      {
        id: 'zapdos-1',
        title: 'Thunder Strike',
        description: 'Complete 7 consecutive workout days like lightning never stops',
        targetValue: 7,
        currentValue: 0,
        unit: 'workouts',
        completed: false,
        category: 'consistency'
      },
      {
        id: 'zapdos-2',
        title: 'Electric Burst',
        description: 'Perform 200 burpees with the explosive power of thunder',
        targetValue: 200,
        currentValue: 0,
        unit: 'reps',
        exerciseId: 'burpees',
        completed: false,
        category: 'consistency'
      },
      {
        id: 'zapdos-3',
        title: 'Lightning Consistency',
        description: 'Maintain a 21-day streak like Zapdos\'s eternal storm',
        targetValue: 21,
        currentValue: 0,
        unit: 'workouts',
        completed: false,
        category: 'consistency'
      },
      {
        id: 'zapdos-4',
        title: 'Legendary Storm',
        description: 'Complete 100 total workouts - become the storm itself',
        targetValue: 100,
        currentValue: 0,
        unit: 'workouts',
        completed: false,
        category: 'consistency'
      }
    ],
    totalProgress: 0,
    createdDate: new Date().toISOString()
  },

  // Moltres - Fire Flexibility
  {
    id: 'moltres-fire-flexibility',
    name: 'Moltres\'s Fire Flexibility',
    description: 'Embody the graceful flames and flexibility of the legendary fire bird',
    category: 'flexibility',
    icon: '🔥',
    color: '#EF4444',
    milestones: [
      {
        id: 'moltres-1',
        title: 'Flame Warm-up',
        description: 'Complete 15 core workouts to ignite your inner fire',
        targetValue: 15,
        currentValue: 0,
        unit: 'sets',
        completed: false,
        category: 'flexibility'
      },
      {
        id: 'moltres-2',
        title: 'Phoenix Rising',
        description: 'Hold plank for 3 minutes like Moltres soaring through flames',
        targetValue: 180,
        currentValue: 0,
        unit: 'time',
        exerciseId: 'plank',
        completed: false,
        category: 'flexibility'
      },
      {
        id: 'moltres-3',
        title: 'Burning Core',
        description: 'Complete 300 crunches with the intensity of eternal flame',
        targetValue: 300,
        currentValue: 0,
        unit: 'reps',
        exerciseId: 'crunches',
        completed: false,
        category: 'flexibility'
      },
      {
        id: 'moltres-4',
        title: 'Legendary Rebirth',
        description: 'Train consistently for 50 days - rise like a phoenix',
        targetValue: 50,
        currentValue: 0,
        unit: 'workouts',
        completed: false,
        category: 'flexibility'
      }
    ],
    totalProgress: 0,
    createdDate: new Date().toISOString()
  },

  // Lugia - Master of All Elements
  {
    id: 'lugia-master-guardian',
    name: 'Lugia\'s Master Guardian',
    description: 'Become the ultimate guardian like Lugia, master of sea and sky',
    category: 'custom',
    icon: '🌊',
    color: '#6366F1',
    milestones: [
      {
        id: 'lugia-1',
        title: 'Guardian\'s Foundation',
        description: 'Master the basics with 25 total workouts',
        targetValue: 25,
        currentValue: 0,
        unit: 'workouts',
        completed: false,
        category: 'custom'
      },
      {
        id: 'lugia-2',
        title: 'Aeroblast Power',
        description: 'Squat 120kg with the power of Lugia\'s signature move',
        targetValue: 120,
        currentValue: 0,
        unit: 'weight',
        exerciseId: 'squats',
        completed: false,
        category: 'custom'
      },
      {
        id: 'lugia-3',
        title: 'Ocean\'s Depth',
        description: 'Complete 500 total sets across all exercises',
        targetValue: 500,
        currentValue: 0,
        unit: 'sets',
        completed: false,
        category: 'custom'
      },
      {
        id: 'lugia-4',
        title: 'Legendary Guardian',
        description: 'Train for 30 total hours - protect your health like Lugia protects the seas',
        targetValue: 1800,
        currentValue: 0,
        unit: 'time',
        completed: false,
        category: 'custom'
      }
    ],
    totalProgress: 0,
    createdDate: new Date().toISOString()
  },

  // Ho-Oh - Phoenix Resurrection
  {
    id: 'ho-oh-phoenix-resurrection',
    name: 'Ho-Oh\'s Phoenix Resurrection',
    description: 'Rise from any setback stronger, embodying Ho-Oh\'s eternal rebirth',
    category: 'custom',
    icon: '🌅',
    color: '#F97316',
    milestones: [
      {
        id: 'ho-oh-1',
        title: 'Sacred Fire',
        description: 'Ignite your journey with 20 workouts',
        targetValue: 20,
        currentValue: 0,
        unit: 'workouts',
        completed: false,
        category: 'custom'
      },
      {
        id: 'ho-oh-2',
        title: 'Rainbow Wing',
        description: 'Complete all 7 exercise categories at least once',
        targetValue: 7,
        currentValue: 0,
        unit: 'custom',
        completed: false,
        category: 'custom'
      },
      {
        id: 'ho-oh-3',
        title: 'Eternal Flame',
        description: 'Maintain a 30-day workout streak like Ho-Oh\'s eternal flight',
        targetValue: 30,
        currentValue: 0,
        unit: 'workouts',
        completed: false,
        category: 'custom'
      },
      {
        id: 'ho-oh-4',
        title: 'Legendary Resurrection',
        description: 'Achieve 200kg deadlift - rise to legendary status',
        targetValue: 200,
        currentValue: 0,
        unit: 'weight',
        exerciseId: 'deadlifts',
        completed: false,
        category: 'custom'
      }
    ],
    totalProgress: 0,
    createdDate: new Date().toISOString()
  }
];