const fs = require('fs');
const path = require('path');

const datasetPath = 'D:\\Download\\exercises-dataset-main\\exercises-dataset-main';
const dataFile = path.join(datasetPath, 'data', 'exercises.json');
const publicExercisesDir = path.join(__dirname, 'public', 'exercises');
const dbFile = path.join(__dirname, 'src', 'data', 'exercises-dataset-imported.ts');

if (!fs.existsSync(dataFile)) {
  console.error(`Cannot find data file at ${dataFile}`);
  process.exit(1);
}

// 1. Read JSON
console.log('Loading dataset...');
const rawData = fs.readFileSync(dataFile, 'utf8');
const exercises = JSON.parse(rawData);

console.log(`Found ${exercises.length} exercises. Processing...`);

// 2. Ensure public/exercises exists
fs.mkdirSync(path.join(publicExercisesDir, 'images'), { recursive: true });
fs.mkdirSync(path.join(publicExercisesDir, 'videos'), { recursive: true });

// 3. Map and format
const mapped = exercises.map(ex => {
  // Try to safely extract english instructions, if available
  let instructions = [];
  if (ex.instruction_steps && ex.instruction_steps.en) {
    instructions = ex.instruction_steps.en;
  } else if (Array.isArray(ex.instructions)) {
    instructions = ex.instructions;
  }

  // Optional: copy files (we won't block on this to save script execution time, just log it or rely on user copying later if needed, but doing it now)
  // Let's just output the paths assuming the user copies the folders
  
  return {
    id: ex.id || ex.media_id || ex.name.toLowerCase().replace(/\s+/g, '-'),
    name: ex.name,
    muscleGroup: ex.bodyPart || ex.target,
    equipment: ex.equipment,
    difficulty: 'Intermediate', // default fallback
    metadata: {
      instructions: instructions,
      thumbnailUrl: ex.image ? `/exercises/${ex.image}` : undefined,
      videoUrl: ex.gif_url ? `/exercises/${ex.gif_url}` : undefined,
      musclesWorked: {
        primary: [ex.target].filter(Boolean),
        secondary: [ex.secondaryMuscles].flat().filter(Boolean)
      }
    }
  };
});

// 4. Write TS file
const tsContent = `// Auto-generated from imported dataset
import { Exercise } from './exercises-database';

export const IMPORTED_EXERCISES: Exercise[] = ${JSON.stringify(mapped, null, 2)};
`;

fs.writeFileSync(dbFile, tsContent, 'utf8');
console.log(`Successfully generated ${dbFile}`);
console.log(`\nIMPORTANT: Please copy the 'images' and 'videos' folders from your dataset to:`);
console.log(publicExercisesDir);
