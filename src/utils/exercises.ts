import { Exercise } from '../types/workout';

export const EXERCISE_DATABASE: Exercise[] = [
  // Chest
  {
    id: 'push-ups',
    name: 'Push-ups',
    category: 'chest',
    muscleGroups: ['chest', 'shoulders', 'triceps'],
    icon: '💪',
    instructions: [
      'Start in plank position with hands slightly wider than shoulders',
      'Lower your body until chest nearly touches floor',
      'Push back up to starting position',
      'Keep core tight throughout movement'
    ]
  },
  {
    id: 'bench-press',
    name: 'Bench Press',
    category: 'chest',
    muscleGroups: ['chest', 'shoulders', 'triceps'],
    equipment: 'Barbell, Bench',
    icon: '🏋️',
    instructions: [
      'Lie on bench with feet flat on floor',
      'Grip bar slightly wider than shoulders',
      'Lower bar to chest with control',
      'Press bar back to starting position'
    ]
  },
  {
    id: 'incline-bench-press',
    name: 'Schrägbankdrücken',
    category: 'chest',
    muscleGroups: ['chest', 'shoulders', 'triceps'],
    equipment: 'Barbell, Dumbbells, Incline Bench',
    icon: '🏋️',
    instructions: [
      'Set bench to 30-45 degree incline',
      'Lie back with feet flat on floor',
      'Grip bar slightly wider than shoulders',
      'Lower bar to upper chest with control',
      'Press bar back to starting position'
    ]
  },
  {
    id: 'chest-press',
    name: 'Brustpresse',
    category: 'chest',
    muscleGroups: ['chest', 'triceps', 'shoulders'],
    equipment: 'Machine',
    icon: '🏋️',
    instructions: [
      'Adjust seat height so handles are at chest level',
      'Grip handles with palms facing down',
      'Press handles forward until arms are extended',
      'Return to starting position with control'
    ]
  },
  {
    id: 'dumbbell-flyes',
    name: 'Dumbbell Flyes',
    category: 'chest',
    muscleGroups: ['chest', 'shoulders'],
    equipment: 'Dumbbells, Bench',
    icon: '🦅',
    instructions: [
      'Lie on bench holding dumbbells above chest',
      'Lower weights in wide arc until chest stretch',
      'Bring weights back together above chest',
      'Keep slight bend in elbows throughout'
    ]
  },

  // Back
  {
    id: 'pull-ups',
    name: 'Pull-ups',
    category: 'back',
    muscleGroups: ['back', 'biceps'],
    equipment: 'Pull-up bar',
    icon: '🆙',
    instructions: [
      'Hang from bar with overhand grip',
      'Pull body up until chin over bar',
      'Lower with control to full extension',
      'Keep core engaged'
    ]
  },
  {
    id: 'deadlifts',
    name: 'Deadlifts',
    category: 'back',
    muscleGroups: ['back', 'glutes', 'hamstrings'],
    equipment: 'Barbell',
    icon: '⚰️',
    instructions: [
      'Stand with feet hip-width apart',
      'Bend at hips and knees to grip bar',
      'Lift by extending hips and knees',
      'Keep bar close to body throughout'
    ]
  },
  {
    id: 'bent-over-rows',
    name: 'Bent-over Rows',
    category: 'back',
    muscleGroups: ['back', 'biceps'],
    equipment: 'Barbell or Dumbbells',
    icon: '🚣',
    instructions: [
      'Bend forward at hips with slight knee bend',
      'Hold weight with arms extended',
      'Pull weight to lower chest/upper abdomen',
      'Lower with control'
    ]
  },
  {
    id: 'rowing',
    name: 'Rudern',
    category: 'back',
    muscleGroups: ['back', 'biceps'],
    equipment: 'Cable Machine, Dumbbells',
    icon: '🚣',
    instructions: [
      'Sit with knees slightly bent',
      'Grip handle with arms extended',
      'Pull handle to lower chest',
      'Squeeze shoulder blades together',
      'Return to starting position with control'
    ]
  },
  {
    id: 'pullover',
    name: 'Pullover',
    category: 'back',
    muscleGroups: ['back', 'chest'],
    equipment: 'Dumbbell, Barbell',
    icon: '🧘',
    instructions: [
      'Lie on bench holding weight above chest',
      'Lower weight behind head in arc motion',
      'Feel stretch in chest and lats',
      'Return to starting position'
    ]
  },
  {
    id: 'dumbbell-shrugs',
    name: 'Kurzhantel Shrugs',
    category: 'back',
    muscleGroups: ['traps'],
    equipment: 'Dumbbells',
    icon: '🤷',
    instructions: [
      'Stand with dumbbells at sides',
      'Shrug shoulders up toward ears',
      'Hold briefly at top',
      'Lower shoulders back down'
    ]
  },

  // Legs
  {
    id: 'squats',
    name: 'Squats',
    category: 'legs',
    muscleGroups: ['quadriceps', 'glutes', 'hamstrings'],
    icon: '🦵',
    instructions: [
      'Stand with feet shoulder-width apart',
      'Lower body by bending knees and hips',
      'Descend until thighs parallel to floor',
      'Return to starting position'
    ]
  },
  {
    id: 'goblet-squats',
    name: 'Goblet Squats',
    category: 'legs',
    muscleGroups: ['quadriceps', 'glutes', 'hamstrings'],
    equipment: 'Dumbbell, Kettlebell',
    icon: '🦵',
    instructions: [
      'Hold weight at chest level',
      'Stand with feet shoulder-width apart',
      'Squat down keeping chest up',
      'Return to starting position'
    ]
  },
  {
    id: 'romanian-deadlifts',
    name: 'Romanian Deadlifts',
    category: 'legs',
    muscleGroups: ['hamstrings', 'glutes', 'lower-back'],
    equipment: 'Barbell, Dumbbells',
    icon: '⚰️',
    instructions: [
      'Stand with feet hip-width apart',
      'Hold weight with overhand grip',
      'Hinge at hips, lowering weight',
      'Keep knees slightly bent',
      'Return to starting position'
    ]
  },
  {
    id: 'lunges',
    name: 'Lunges',
    category: 'legs',
    muscleGroups: ['quadriceps', 'glutes', 'hamstrings'],
    icon: '🤸',
    instructions: [
      'Step forward with one leg',
      'Lower hips until both knees at 90 degrees',
      'Push back to starting position',
      'Alternate legs or complete all reps one side'
    ]
  },
  {
    id: 'calf-raises',
    name: 'Calf Raises',
    category: 'legs',
    muscleGroups: ['calves'],
    icon: '🦵',
    instructions: [
      'Stand with balls of feet on raised surface',
      'Lower heels below platform level',
      'Raise up onto toes as high as possible',
      'Lower with control'
    ]
  },
  {
    id: 'wadenheben',
    name: 'Wadenheben',
    category: 'legs',
    muscleGroups: ['calves'],
    equipment: 'Dumbbells, Machine',
    icon: '🦵',
    instructions: [
      'Stand with balls of feet on platform',
      'Hold weights for resistance',
      'Raise up onto toes as high as possible',
      'Lower heels below platform level',
      'Repeat for desired reps'
    ]
  },

  // Shoulders
  {
    id: 'overhead-press',
    name: 'Überkopfdrücken',
    category: 'shoulders',
    muscleGroups: ['shoulders', 'triceps'],
    equipment: 'Barbell, Dumbbells',
    icon: '⬆️',
    instructions: [
      'Stand with feet shoulder-width apart',
      'Hold weight at shoulder level',
      'Press weight overhead until arms extended',
      'Lower back to starting position'
    ]
  },
  {
    id: 'shoulder-press',
    name: 'Schulterdrücken',
    category: 'shoulders',
    muscleGroups: ['shoulders', 'triceps'],
    equipment: 'Machine, Dumbbells',
    icon: '⬆️',
    instructions: [
      'Sit with back supported',
      'Grip handles at shoulder level',
      'Press handles overhead',
      'Lower with control'
    ]
  },
  {
    id: 'lateral-raises',
    name: 'Lateral Raises',
    category: 'shoulders',
    muscleGroups: ['shoulders'],
    equipment: 'Dumbbells',
    icon: '↔️',
    instructions: [
      'Stand with dumbbells at sides',
      'Raise arms out to sides',
      'Lift to shoulder height',
      'Lower with control'
    ]
  },
  {
    id: 'front-raises',
    name: 'Front Raises',
    category: 'shoulders',
    muscleGroups: ['shoulders'],
    equipment: 'Dumbbells, Cable',
    icon: '⬆️',
    instructions: [
      'Stand with weight in front of thighs',
      'Raise weight forward to shoulder height',
      'Keep arms straight',
      'Lower with control'
    ]
  },
  {
    id: 'rear-delt-flys',
    name: 'Rear Delt Flys',
    category: 'shoulders',
    muscleGroups: ['shoulders', 'back'],
    equipment: 'Dumbbells, Machine',
    icon: '🦅',
    instructions: [
      'Bend forward at hips',
      'Hold weights with arms extended',
      'Raise arms out to sides',
      'Squeeze shoulder blades together',
      'Lower with control'
    ]
  },

  // Arms
  {
    id: 'bicep-curls',
    name: 'Bicep Curls',
    category: 'arms',
    muscleGroups: ['biceps'],
    equipment: 'Dumbbells',
    icon: '💪',
    instructions: [
      'Stand with weights at sides, palms facing forward',
      'Curl weights toward shoulders',
      'Squeeze biceps at top',
      'Lower with control'
    ]
  },
  {
    id: 'hammer-curls',
    name: 'Hammer Curls',
    category: 'arms',
    muscleGroups: ['biceps', 'forearms'],
    equipment: 'Dumbbells',
    icon: '💪',
    instructions: [
      'Stand with dumbbells at sides',
      'Keep palms facing each other',
      'Curl weights toward shoulders',
      'Lower with control'
    ]
  },
  {
    id: 'biceps-iso-curls',
    name: 'Biceps Iso Curls',
    category: 'arms',
    muscleGroups: ['biceps'],
    equipment: 'Dumbbells, Machine',
    icon: '💪',
    instructions: [
      'Isolate one arm at a time',
      'Support elbow on bench or thigh',
      'Curl weight toward shoulder',
      'Focus on bicep contraction'
    ]
  },
  {
    id: 'tricep-dips',
    name: 'Tricep Dips',
    category: 'arms',
    muscleGroups: ['triceps'],
    equipment: 'Chair or Bench',
    icon: '💺',
    instructions: [
      'Sit on edge of bench, hands beside hips',
      'Slide forward off bench, supporting with arms',
      'Lower body by bending elbows',
      'Push back up to starting position'
    ]
  },
  {
    id: 'overhead-triceps-extension',
    name: 'Trizepsdrücken über Kopf',
    category: 'arms',
    muscleGroups: ['triceps'],
    equipment: 'Dumbbells, Cable',
    icon: '💪',
    instructions: [
      'Hold weight overhead with both hands',
      'Lower weight behind head',
      'Keep elbows stationary',
      'Extend arms back to starting position'
    ]
  },
  {
    id: 'triceps-kickbacks',
    name: 'Kickbacks',
    category: 'arms',
    muscleGroups: ['triceps'],
    equipment: 'Dumbbells, Cable',
    icon: '💪',
    instructions: [
      'Bend forward at hips',
      'Keep upper arm parallel to floor',
      'Extend forearm backward',
      'Squeeze triceps at top'
    ]
  },
  {
    id: 'dips',
    name: 'Dips',
    category: 'arms',
    muscleGroups: ['triceps', 'chest', 'shoulders'],
    equipment: 'Parallel Bars, Bench',
    icon: '🤸',
    instructions: [
      'Support body on parallel bars',
      'Lower body by bending elbows',
      'Descend until shoulders below elbows',
      'Push back up to starting position'
    ]
  },

  // Core
  {
    id: 'plank',
    name: 'Plank',
    category: 'core',
    muscleGroups: ['core', 'shoulders'],
    icon: '🏗️',
    instructions: [
      'Start in push-up position',
      'Lower to forearms, keeping body straight',
      'Hold position with core tight',
      'Breathe normally throughout'
    ]
  },
  {
    id: 'crunches',
    name: 'Crunches',
    category: 'core',
    muscleGroups: ['core'],
    icon: '🔄',
    instructions: [
      'Lie on back with knees bent',
      'Place hands behind head lightly',
      'Lift shoulders off ground',
      'Lower with control'
    ]
  },

  // Cardio
  {
    id: 'jumping-jacks',
    name: 'Jumping Jacks',
    category: 'cardio',
    muscleGroups: ['full-body'],
    icon: '🤸',
    instructions: [
      'Stand with feet together, arms at sides',
      'Jump while spreading legs and raising arms overhead',
      'Jump back to starting position',
      'Maintain steady rhythm'
    ]
  },
  {
    id: 'burpees',
    name: 'Burpees',
    category: 'cardio',
    muscleGroups: ['full-body'],
    icon: '🏃',
    instructions: [
      'Start standing, then squat down',
      'Place hands on ground, jump feet back to plank',
      'Do a push-up, then jump feet back to squat',
      'Jump up with arms overhead'
    ]
  }
];

export const getExercisesByCategory = (category: Exercise['category']) => {
  return EXERCISE_DATABASE.filter(exercise => exercise.category === category);
};

export const getExerciseById = (id: string) => {
  return EXERCISE_DATABASE.find(exercise => exercise.id === id);
};

export const searchExercises = (query: string) => {
  const lowerQuery = query.toLowerCase();
  return EXERCISE_DATABASE.filter(exercise => 
    exercise.name.toLowerCase().includes(lowerQuery) ||
    exercise.muscleGroups.some(muscle => muscle.toLowerCase().includes(lowerQuery))
  );
};