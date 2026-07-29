import { MUSCLE_GROUPS } from './muscle-groups';
import { EXERCISE_TYPES, EQUIPMENT, DIFFICULTY_LEVELS, type ExerciseMetadata } from './exercise-types';

export interface Exercise {
  id: string;
  name: string;
  muscleGroup: string;
  type: string;
  equipment: string;
  difficulty: string;
  metadata: ExerciseMetadata;
}

export const EXERCISES_DATABASE: Exercise[] = [
  // CHEST EXERCISES
  {
    id: 'barbell-bench-press',
    name: 'Barbell Bench Press',
    muscleGroup: MUSCLE_GROUPS.CHEST,
    type: EXERCISE_TYPES.COMPOUND,
    equipment: EQUIPMENT.BARBELL,
    difficulty: DIFFICULTY_LEVELS.INTERMEDIATE,
    metadata: {
      instructions: [
        'Lie flat on bench with feet planted firmly on floor',
        'Grip bar slightly wider than shoulder width',
        'Unrack bar and lower to mid-chest with control',
        'Press bar back up explosively to starting position',
      ],
      tips: [
        'Keep shoulder blades retracted throughout movement',
        'Maintain slight arch in lower back',
        'Touch chest lightly, don\'t bounce',
      ],
      commonMistakes: [
        'Lifting hips off the bench (Nâng mông khỏi ghế)',
        'Flaring elbows out to 90 degrees (Khuỷu tay loe ra quá nhiều)',
        'Bouncing the bar off the chest (Đập thanh đòn vào ngực)'
      ],
      musclesWorked: {
        primary: ['Pectoralis Major', 'Anterior Deltoid', 'Triceps'],
        secondary: ['Serratus Anterior', 'Core'],
      },
    },
  },
  {
    id: 'dumbbell-bench-press',
    name: 'Dumbbell Bench Press',
    muscleGroup: MUSCLE_GROUPS.CHEST,
    type: EXERCISE_TYPES.COMPOUND,
    equipment: EQUIPMENT.DUMBBELL,
    difficulty: DIFFICULTY_LEVELS.INTERMEDIATE,
    metadata: {
      instructions: [
        'Sit on bench with dumbbells resting on thighs',
        'Lie back while bringing dumbbells to chest level',
        'Press dumbbells up until arms are extended',
        'Lower with control to stretch position',
      ],
      tips: [
        'Allow dumbbells to move in natural arc',
        'Greater range of motion than barbell',
        'Dumbbells should touch at top',
      ],
      musclesWorked: {
        primary: ['Pectoralis Major', 'Anterior Deltoid', 'Triceps'],
        secondary: ['Stabilizers', 'Core'],
      },
    },
  },
  {
    id: 'incline-barbell-bench-press',
    name: 'Incline Barbell Bench Press',
    muscleGroup: MUSCLE_GROUPS.CHEST,
    type: EXERCISE_TYPES.COMPOUND,
    equipment: EQUIPMENT.BARBELL,
    difficulty: DIFFICULTY_LEVELS.INTERMEDIATE,
    metadata: {
      instructions: [
        'Set bench to 30-45 degree incline',
        'Grip bar slightly wider than shoulders',
        'Lower bar to upper chest',
        'Press back to starting position',
      ],
      tips: [
        'Focus on upper chest contraction',
        '30-45 degrees targets upper pecs optimally',
        'Don\'t let elbows flare excessively',
      ],
      musclesWorked: {
        primary: ['Upper Pectoralis Major', 'Anterior Deltoid', 'Triceps'],
        secondary: ['Middle Chest', 'Core'],
      },
    },
  },
  {
    id: 'dumbbell-fly',
    name: 'Dumbbell Fly',
    muscleGroup: MUSCLE_GROUPS.CHEST,
    type: EXERCISE_TYPES.ISOLATION,
    equipment: EQUIPMENT.DUMBBELL,
    difficulty: DIFFICULTY_LEVELS.BEGINNER,
    metadata: {
      instructions: [
        'Lie on flat bench with dumbbells above chest',
        'Lower dumbbells in wide arc with slight elbow bend',
        'Feel deep stretch in chest',
        'Bring dumbbells back together using chest muscles',
      ],
      tips: [
        'Maintain slight bend in elbows throughout',
        'Focus on stretch and contraction',
        'Don\'t go too heavy on this isolation move',
      ],
      musclesWorked: {
        primary: ['Pectoralis Major'],
        secondary: ['Anterior Deltoid'],
      },
    },
  },
  {
    id: 'push-up',
    name: 'Push-Up',
    muscleGroup: MUSCLE_GROUPS.CHEST,
    type: EXERCISE_TYPES.COMPOUND,
    equipment: EQUIPMENT.BODYWEIGHT,
    difficulty: DIFFICULTY_LEVELS.BEGINNER,
    metadata: {
      instructions: [
        'Start in plank position with hands shoulder-width apart',
        'Lower body until chest nearly touches floor',
        'Keep elbows at 45-degree angle',
        'Push back up to starting position',
      ],
      tips: [
        'Maintain straight line from head to heels',
        'Don\'t let hips sag',
        'Engage core throughout movement',
      ],
      musclesWorked: {
        primary: ['Pectoralis Major', 'Triceps', 'Anterior Deltoid'],
        secondary: ['Core', 'Serratus Anterior'],
      },
    },
  },

  // BACK EXERCISES
  {
    id: 'deadlift',
    name: 'Deadlift',
    muscleGroup: MUSCLE_GROUPS.BACK,
    type: EXERCISE_TYPES.COMPOUND,
    equipment: EQUIPMENT.BARBELL,
    difficulty: DIFFICULTY_LEVELS.ADVANCED,
    metadata: {
      instructions: [
        'Stand with feet hip-width apart, bar over mid-foot',
        'Grip bar just outside legs, hinge at hips',
        'Keep back neutral, chest up, shoulders back',
        'Drive through heels, extend hips and knees simultaneously',
        'Stand tall at top, then lower with control',
      ],
      tips: [
        'Keep bar close to body throughout',
        'Engage lats to protect lower back',
        'Master form before adding weight',
      ],
      musclesWorked: {
        primary: ['Erector Spinae', 'Glutes', 'Hamstrings', 'Trapezius'],
        secondary: ['Forearms', 'Core', 'Quadriceps'],
      },
    },
  },
  {
    id: 'pull-up',
    name: 'Pull-Up',
    muscleGroup: MUSCLE_GROUPS.BACK,
    type: EXERCISE_TYPES.COMPOUND,
    equipment: EQUIPMENT.BODYWEIGHT,
    difficulty: DIFFICULTY_LEVELS.INTERMEDIATE,
    metadata: {
      instructions: [
        'Hang from bar with hands slightly wider than shoulders',
        'Pull shoulder blades down and back',
        'Pull body up until chin clears bar',
        'Lower with control to full extension',
      ],
      tips: [
        'Avoid swinging or kipping',
        'Think about pulling elbows down',
        'Full range of motion for maximum gains',
      ],
      musclesWorked: {
        primary: ['Latissimus Dorsi', 'Biceps'],
        secondary: ['Rhomboids', 'Trapezius', 'Core'],
      },
    },
  },
  {
    id: 'barbell-row',
    name: 'Barbell Bent-Over Row',
    muscleGroup: MUSCLE_GROUPS.BACK,
    type: EXERCISE_TYPES.COMPOUND,
    equipment: EQUIPMENT.BARBELL,
    difficulty: DIFFICULTY_LEVELS.INTERMEDIATE,
    metadata: {
      instructions: [
        'Hinge forward at hips with slight knee bend',
        'Grip bar with hands shoulder-width apart',
        'Pull bar to lower chest/upper abdomen',
        'Squeeze shoulder blades together at top',
        'Lower with control',
      ],
      tips: [
        'Keep torso stable, avoid using momentum',
        'Pull with elbows, not just arms',
        'Maintain neutral spine',
      ],
      musclesWorked: {
        primary: ['Latissimus Dorsi', 'Rhomboids', 'Trapezius'],
        secondary: ['Biceps', 'Erector Spinae', 'Core'],
      },
    },
  },
  {
    id: 'lat-pulldown',
    name: 'Lat Pulldown',
    muscleGroup: MUSCLE_GROUPS.BACK,
    type: EXERCISE_TYPES.COMPOUND,
    equipment: EQUIPMENT.CABLE,
    difficulty: DIFFICULTY_LEVELS.BEGINNER,
    metadata: {
      instructions: [
        'Sit at machine with thighs secured under pad',
        'Grip bar slightly wider than shoulders',
        'Pull bar down to upper chest',
        'Squeeze lats at bottom',
        'Return to starting position with control',
      ],
      tips: [
        'Lean back slightly for optimal lat engagement',
        'Think about pulling elbows down and back',
        'Don\'t use excessive momentum',
      ],
      musclesWorked: {
        primary: ['Latissimus Dorsi'],
        secondary: ['Biceps', 'Rhomboids', 'Trapezius'],
      },
    },
  },

  // LEG EXERCISES
  {
    id: 'barbell-squat',
    name: 'Barbell Back Squat',
    muscleGroup: MUSCLE_GROUPS.LEGS,
    type: EXERCISE_TYPES.COMPOUND,
    equipment: EQUIPMENT.BARBELL,
    difficulty: DIFFICULTY_LEVELS.INTERMEDIATE,
    metadata: {
      instructions: [
        'Position bar on upper back/traps',
        'Stand with feet shoulder-width apart',
        'Descend by bending knees and hips',
        'Keep chest up and back straight',
        'Drive through heels to return to standing',
      ],
      tips: [
        'Knees should track over toes',
        'Aim for thighs parallel to ground',
        'Breathe and brace core before descent',
      ],
      musclesWorked: {
        primary: ['Quadriceps', 'Glutes', 'Hamstrings'],
        secondary: ['Core', 'Erector Spinae', 'Calves'],
      },
    },
  },
  {
    id: 'romanian-deadlift',
    name: 'Romanian Deadlift',
    muscleGroup: MUSCLE_GROUPS.LEGS,
    type: EXERCISE_TYPES.COMPOUND,
    equipment: EQUIPMENT.BARBELL,
    difficulty: DIFFICULTY_LEVELS.INTERMEDIATE,
    metadata: {
      instructions: [
        'Stand with feet hip-width, holding bar at thighs',
        'Hinge at hips while keeping legs relatively straight',
        'Lower bar along legs until hamstring stretch',
        'Drive hips forward to return to standing',
      ],
      tips: [
        'Focus on hip hinge, not squat movement',
        'Keep bar close to legs throughout',
        'Feel stretch in hamstrings',
      ],
      musclesWorked: {
        primary: ['Hamstrings', 'Glutes'],
        secondary: ['Erector Spinae', 'Forearms'],
      },
    },
  },
  {
    id: 'leg-press',
    name: 'Leg Press',
    muscleGroup: MUSCLE_GROUPS.LEGS,
    type: EXERCISE_TYPES.COMPOUND,
    equipment: EQUIPMENT.MACHINE,
    difficulty: DIFFICULTY_LEVELS.BEGINNER,
    metadata: {
      instructions: [
        'Sit in machine with back against pad',
        'Place feet shoulder-width on platform',
        'Release safety and lower platform with control',
        'Push through heels to extend legs',
        'Don\'t lock out knees at top',
      ],
      tips: [
        'Keep lower back pressed against pad',
        'Don\'t go so deep that hips round',
        'Vary foot position to target different areas',
      ],
      musclesWorked: {
        primary: ['Quadriceps', 'Glutes'],
        secondary: ['Hamstrings', 'Calves'],
      },
    },
  },
  {
    id: 'walking-lunge',
    name: 'Walking Lunge',
    muscleGroup: MUSCLE_GROUPS.LEGS,
    type: EXERCISE_TYPES.COMPOUND,
    equipment: EQUIPMENT.DUMBBELL,
    difficulty: DIFFICULTY_LEVELS.BEGINNER,
    metadata: {
      instructions: [
        'Stand holding dumbbells at sides',
        'Step forward into lunge position',
        'Lower back knee toward ground',
        'Push through front heel to step forward',
        'Alternate legs with each step',
      ],
      tips: [
        'Keep torso upright throughout',
        'Front knee should not pass toes',
        'Take controlled, deliberate steps',
      ],
      musclesWorked: {
        primary: ['Quadriceps', 'Glutes'],
        secondary: ['Hamstrings', 'Core', 'Calves'],
      },
    },
  },
  {
    id: 'leg-curl',
    name: 'Lying Leg Curl',
    muscleGroup: MUSCLE_GROUPS.LEGS,
    type: EXERCISE_TYPES.ISOLATION,
    equipment: EQUIPMENT.MACHINE,
    difficulty: DIFFICULTY_LEVELS.BEGINNER,
    metadata: {
      instructions: [
        'Lie face down on machine',
        'Position pad just above heels',
        'Curl legs up toward glutes',
        'Squeeze hamstrings at top',
        'Lower with control',
      ],
      tips: [
        'Don\'t lift hips off pad',
        'Control both up and down phases',
        'Avoid using momentum',
      ],
      musclesWorked: {
        primary: ['Hamstrings'],
        secondary: ['Calves', 'Glutes'],
      },
    },
  },

  // SHOULDER EXERCISES
  {
    id: 'overhead-press',
    name: 'Standing Overhead Press',
    muscleGroup: MUSCLE_GROUPS.SHOULDERS,
    type: EXERCISE_TYPES.COMPOUND,
    equipment: EQUIPMENT.BARBELL,
    difficulty: DIFFICULTY_LEVELS.INTERMEDIATE,
    metadata: {
      instructions: [
        'Stand with feet shoulder-width, bar at collarbone',
        'Brace core and glutes',
        'Press bar overhead in straight line',
        'Lock out arms at top',
        'Lower with control to starting position',
      ],
      tips: [
        'Move head back slightly to clear path of bar',
        'Keep core tight to prevent back arch',
        'Bar should travel in vertical line',
      ],
      musclesWorked: {
        primary: ['Anterior Deltoid', 'Lateral Deltoid'],
        secondary: ['Triceps', 'Upper Chest', 'Core'],
      },
    },
  },
  {
    id: 'dumbbell-shoulder-press',
    name: 'Seated Dumbbell Shoulder Press',
    muscleGroup: MUSCLE_GROUPS.SHOULDERS,
    type: EXERCISE_TYPES.COMPOUND,
    equipment: EQUIPMENT.DUMBBELL,
    difficulty: DIFFICULTY_LEVELS.BEGINNER,
    metadata: {
      instructions: [
        'Sit on bench with back support',
        'Hold dumbbells at shoulder height',
        'Press dumbbells overhead until arms extended',
        'Lower with control to starting position',
      ],
      tips: [
        'Keep core engaged throughout',
        'Dumbbells can touch at top',
        'Control the descent',
      ],
      musclesWorked: {
        primary: ['Anterior Deltoid', 'Lateral Deltoid'],
        secondary: ['Triceps', 'Upper Trapezius'],
      },
    },
  },
  {
    id: 'lateral-raise',
    name: 'Dumbbell Lateral Raise',
    muscleGroup: MUSCLE_GROUPS.SHOULDERS,
    type: EXERCISE_TYPES.ISOLATION,
    equipment: EQUIPMENT.DUMBBELL,
    difficulty: DIFFICULTY_LEVELS.BEGINNER,
    metadata: {
      instructions: [
        'Stand with dumbbells at sides',
        'Raise arms out to sides with slight bend in elbows',
        'Lift until arms parallel to ground',
        'Lower with control',
      ],
      tips: [
        'Lead with elbows, not hands',
        'Avoid swinging or using momentum',
        'Focus on lateral deltoid contraction',
      ],
      musclesWorked: {
        primary: ['Lateral Deltoid'],
        secondary: ['Anterior Deltoid', 'Trapezius'],
      },
    },
  },
  {
    id: 'face-pull',
    name: 'Cable Face Pull',
    muscleGroup: MUSCLE_GROUPS.SHOULDERS,
    type: EXERCISE_TYPES.ISOLATION,
    equipment: EQUIPMENT.CABLE,
    difficulty: DIFFICULTY_LEVELS.BEGINNER,
    metadata: {
      instructions: [
        'Attach rope to cable machine at upper position',
        'Pull rope toward face while separating hands',
        'Focus on rear delts and upper back',
        'Return with control',
      ],
      tips: [
        'Excellent for shoulder health',
        'Pull handles past ears',
        'Squeeze shoulder blades together',
      ],
      musclesWorked: {
        primary: ['Posterior Deltoid', 'Rhomboids'],
        secondary: ['Trapezius', 'Rotator Cuff'],
      },
    },
  },

  // ARM EXERCISES
  {
    id: 'barbell-curl',
    name: 'Barbell Curl',
    muscleGroup: MUSCLE_GROUPS.ARMS,
    type: EXERCISE_TYPES.ISOLATION,
    equipment: EQUIPMENT.BARBELL,
    difficulty: DIFFICULTY_LEVELS.BEGINNER,
    metadata: {
      instructions: [
        'Stand holding bar with underhand grip',
        'Keep elbows close to sides',
        'Curl bar up to shoulders',
        'Squeeze biceps at top',
        'Lower with control',
      ],
      tips: [
        'Don\'t swing or use momentum',
        'Keep upper arms stationary',
        'Full range of motion for best results',
      ],
      musclesWorked: {
        primary: ['Biceps Brachii'],
        secondary: ['Brachialis', 'Forearms'],
      },
    },
  },
  {
    id: 'dumbbell-curl',
    name: 'Alternating Dumbbell Curl',
    muscleGroup: MUSCLE_GROUPS.ARMS,
    type: EXERCISE_TYPES.ISOLATION,
    equipment: EQUIPMENT.DUMBBELL,
    difficulty: DIFFICULTY_LEVELS.BEGINNER,
    metadata: {
      instructions: [
        'Stand with dumbbells at sides',
        'Curl one dumbbell up while supinating wrist',
        'Squeeze bicep at top',
        'Lower and repeat with other arm',
      ],
      tips: [
        'Rotate palm up as you curl',
        'Keep elbow stationary',
        'Control both phases of movement',
      ],
      musclesWorked: {
        primary: ['Biceps Brachii'],
        secondary: ['Brachialis', 'Forearms'],
      },
    },
  },
  {
    id: 'hammer-curl',
    name: 'Hammer Curl',
    muscleGroup: MUSCLE_GROUPS.ARMS,
    type: EXERCISE_TYPES.ISOLATION,
    equipment: EQUIPMENT.DUMBBELL,
    difficulty: DIFFICULTY_LEVELS.BEGINNER,
    metadata: {
      instructions: [
        'Stand with dumbbells at sides, palms facing in',
        'Curl dumbbells up keeping neutral grip',
        'Squeeze at top',
        'Lower with control',
      ],
      tips: [
        'Thumbs should point up throughout',
        'Targets brachialis and forearms',
        'Can be done alternating or together',
      ],
      musclesWorked: {
        primary: ['Brachialis', 'Biceps Brachii'],
        secondary: ['Brachioradialis', 'Forearms'],
      },
    },
  },
  {
    id: 'tricep-dip',
    name: 'Tricep Dip',
    muscleGroup: MUSCLE_GROUPS.ARMS,
    type: EXERCISE_TYPES.COMPOUND,
    equipment: EQUIPMENT.BODYWEIGHT,
    difficulty: DIFFICULTY_LEVELS.INTERMEDIATE,
    metadata: {
      instructions: [
        'Grip parallel bars and support body weight',
        'Lean slightly forward',
        'Lower body by bending elbows',
        'Push back up to starting position',
      ],
      tips: [
        'Don\'t go too deep if shoulders hurt',
        'Keep elbows close to body',
        'Add weight when bodyweight becomes easy',
      ],
      musclesWorked: {
        primary: ['Triceps'],
        secondary: ['Chest', 'Anterior Deltoid'],
      },
    },
  },
  {
    id: 'tricep-pushdown',
    name: 'Cable Tricep Pushdown',
    muscleGroup: MUSCLE_GROUPS.ARMS,
    type: EXERCISE_TYPES.ISOLATION,
    equipment: EQUIPMENT.CABLE,
    difficulty: DIFFICULTY_LEVELS.BEGINNER,
    metadata: {
      instructions: [
        'Stand facing cable machine with rope or bar attachment',
        'Keep elbows at sides',
        'Push attachment down until arms fully extended',
        'Squeeze triceps at bottom',
        'Return with control',
      ],
      tips: [
        'Keep upper arms stationary',
        'Don\'t lean forward excessively',
        'Focus on tricep contraction',
      ],
      musclesWorked: {
        primary: ['Triceps'],
        secondary: [],
      },
    },
  },
  {
    id: 'skull-crusher',
    name: 'Lying Tricep Extension (Skull Crusher)',
    muscleGroup: MUSCLE_GROUPS.ARMS,
    type: EXERCISE_TYPES.ISOLATION,
    equipment: EQUIPMENT.BARBELL,
    difficulty: DIFFICULTY_LEVELS.INTERMEDIATE,
    metadata: {
      instructions: [
        'Lie on bench holding bar above chest',
        'Keep upper arms stationary',
        'Lower bar toward forehead by bending elbows',
        'Extend arms back to starting position',
      ],
      tips: [
        'Keep elbows from flaring out',
        'Control the descent carefully',
        'Can also use dumbbells or EZ bar',
      ],
      musclesWorked: {
        primary: ['Triceps'],
        secondary: [],
      },
    },
  },

  // CORE EXERCISES
  {
    id: 'plank',
    name: 'Front Plank',
    muscleGroup: MUSCLE_GROUPS.CORE,
    type: EXERCISE_TYPES.COMPOUND,
    equipment: EQUIPMENT.BODYWEIGHT,
    difficulty: DIFFICULTY_LEVELS.BEGINNER,
    metadata: {
      instructions: [
        'Position forearms on ground with elbows under shoulders',
        'Extend legs behind you',
        'Maintain straight line from head to heels',
        'Hold position while breathing steadily',
      ],
      tips: [
        'Don\'t let hips sag or pike up',
        'Squeeze glutes and core',
        'Focus on time under tension',
      ],
      musclesWorked: {
        primary: ['Rectus Abdominis', 'Transverse Abdominis'],
        secondary: ['Obliques', 'Shoulders', 'Glutes'],
      },
    },
  },
  {
    id: 'hanging-leg-raise',
    name: 'Hanging Leg Raise',
    muscleGroup: MUSCLE_GROUPS.CORE,
    type: EXERCISE_TYPES.COMPOUND,
    equipment: EQUIPMENT.BODYWEIGHT,
    difficulty: DIFFICULTY_LEVELS.ADVANCED,
    metadata: {
      instructions: [
        'Hang from pull-up bar with arms extended',
        'Keep legs together',
        'Raise legs to parallel or higher',
        'Lower with control',
      ],
      tips: [
        'Avoid swinging',
        'Focus on using abs, not hip flexors',
        'Can bend knees to make easier',
      ],
      musclesWorked: {
        primary: ['Rectus Abdominis', 'Hip Flexors'],
        secondary: ['Obliques', 'Forearms'],
      },
    },
  },
  {
    id: 'russian-twist',
    name: 'Russian Twist',
    muscleGroup: MUSCLE_GROUPS.CORE,
    type: EXERCISE_TYPES.ISOLATION,
    equipment: EQUIPMENT.BODYWEIGHT,
    difficulty: DIFFICULTY_LEVELS.BEGINNER,
    metadata: {
      instructions: [
        'Sit on floor with knees bent, feet elevated',
        'Lean back slightly while keeping back straight',
        'Rotate torso side to side',
        'Can hold weight for added resistance',
      ],
      tips: [
        'Move with control, not momentum',
        'Focus on oblique contraction',
        'Keep core engaged throughout',
      ],
      musclesWorked: {
        primary: ['Obliques'],
        secondary: ['Rectus Abdominis', 'Hip Flexors'],
      },
    },
  },
  {
    id: 'cable-crunch',
    name: 'Cable Crunch',
    muscleGroup: MUSCLE_GROUPS.CORE,
    type: EXERCISE_TYPES.ISOLATION,
    equipment: EQUIPMENT.CABLE,
    difficulty: DIFFICULTY_LEVELS.BEGINNER,
    metadata: {
      instructions: [
        'Kneel facing cable machine with rope attachment',
        'Hold rope behind head',
        'Crunch down by flexing spine',
        'Focus on contracting abs',
        'Return with control',
      ],
      tips: [
        'Think about bringing ribs to hips',
        'Don\'t pull with arms',
        'Maintain constant tension on abs',
      ],
      musclesWorked: {
        primary: ['Rectus Abdominis'],
        secondary: ['Obliques'],
      },
    },
  },

  // CARDIO EXERCISES
  {
    id: 'running',
    name: 'Running',
    muscleGroup: MUSCLE_GROUPS.FULL_BODY,
    type: EXERCISE_TYPES.CARDIO,
    equipment: EQUIPMENT.CARDIO_EQUIPMENT,
    difficulty: DIFFICULTY_LEVELS.BEGINNER,
    metadata: {
      instructions: [
        'Maintain upright posture',
        'Land mid-foot, not heel',
        'Keep arms at 90-degree angle',
        'Maintain steady breathing rhythm',
      ],
      tips: [
        'Start with shorter distances and build up',
        'Invest in proper running shoes',
        'Mix steady state with intervals',
      ],
      musclesWorked: {
        primary: ['Quadriceps', 'Hamstrings', 'Calves'],
        secondary: ['Glutes', 'Hip Flexors', 'Core'],
      },
    },
  },
  {
    id: 'cycling',
    name: 'Cycling',
    muscleGroup: MUSCLE_GROUPS.LEGS,
    type: EXERCISE_TYPES.CARDIO,
    equipment: EQUIPMENT.CARDIO_EQUIPMENT,
    difficulty: DIFFICULTY_LEVELS.BEGINNER,
    metadata: {
      instructions: [
        'Adjust seat height so leg almost fully extends',
        'Maintain proper posture on bike',
        'Use variety of resistance levels',
        'Keep cadence between 80-100 RPM',
      ],
      tips: [
        'Low impact on joints',
        'Great for active recovery',
        'Can do intervals or steady state',
      ],
      musclesWorked: {
        primary: ['Quadriceps', 'Hamstrings', 'Glutes'],
        secondary: ['Calves', 'Hip Flexors'],
      },
    },
  },
  {
    id: 'burpee',
    name: 'Burpee',
    muscleGroup: MUSCLE_GROUPS.FULL_BODY,
    type: EXERCISE_TYPES.PLYOMETRIC,
    equipment: EQUIPMENT.BODYWEIGHT,
    difficulty: DIFFICULTY_LEVELS.INTERMEDIATE,
    metadata: {
      instructions: [
        'Start standing',
        'Drop into squat and place hands on ground',
        'Jump feet back to plank position',
        'Perform push-up',
        'Jump feet back to squat',
        'Explode up with jump',
      ],
      tips: [
        'High-intensity full body movement',
        'Maintain form even when fatigued',
        'Modify by stepping instead of jumping',
      ],
      musclesWorked: {
        primary: ['Full Body'],
        secondary: [],
      },
    },
  },
  {
    id: 'jump-rope',
    name: 'Jump Rope',
    muscleGroup: MUSCLE_GROUPS.FULL_BODY,
    type: EXERCISE_TYPES.CARDIO,
    equipment: EQUIPMENT.OTHER,
    difficulty: DIFFICULTY_LEVELS.BEGINNER,
    metadata: {
      instructions: [
        'Hold rope handles at hip level',
        'Jump with both feet together',
        'Land softly on balls of feet',
        'Keep jumps low and controlled',
      ],
      tips: [
        'Excellent for coordination and cardio',
        'Rotate rope from wrists, not shoulders',
        'Start slow and build speed',
      ],
      musclesWorked: {
        primary: ['Calves', 'Shoulders'],
        secondary: ['Core', 'Forearms', 'Quadriceps'],
      },
    },
  },
];

export function getExercisesByMuscleGroup(muscleGroup: string): Exercise[] {
  return EXERCISES_DATABASE.filter((ex) => ex.muscleGroup === muscleGroup);
}

export function getExercisesByEquipment(equipment: string): Exercise[] {
  return EXERCISES_DATABASE.filter((ex) => ex.equipment === equipment);
}

export function getExercisesByDifficulty(difficulty: string): Exercise[] {
  return EXERCISES_DATABASE.filter((ex) => ex.difficulty === difficulty);
}

export function searchExercises(query: string): Exercise[] {
  const lowerQuery = query.toLowerCase();
  return EXERCISES_DATABASE.filter(
    (ex) =>
      ex.name.toLowerCase().includes(lowerQuery) ||
      ex.muscleGroup.toLowerCase().includes(lowerQuery) ||
      ex.equipment.toLowerCase().includes(lowerQuery)
  );
}
