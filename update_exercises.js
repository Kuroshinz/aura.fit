const fs = require('fs');
const path = 'd:/Nexus/src/app/(dashboard)/exercises/page.tsx';
let content = fs.readFileSync(path, 'utf8');

// Replace imports
content = content.replace(
  `import { SpatialCard } from '@/components/effects/spatial-card'`,
  `import { SpatialCard } from '@/components/effects/spatial-card'\nimport { createClient } from '@/lib/supabase/client'`
);

content = content.replace(
  `import { useState } from 'react'`,
  `import { useState, useEffect } from 'react'`
);

// Find the start of initialExercises and the end
const startIdx = content.indexOf('const initialExercises: ExerciseItem[] = [');
const endIdx = content.indexOf('export default function ExercisesPage() {');
if (startIdx !== -1 && endIdx !== -1) {
  content = content.substring(0, startIdx) + content.substring(endIdx);
}

// Modify ExercisesPage
content = content.replace(
  'const [exercisesList, setExercisesList] = useState<ExerciseItem[]>(initialExercises)',
  `const [exercisesList, setExercisesList] = useState<ExerciseItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchExercises = async () => {
      const { data, error } = await supabase.from('exercises_catalog').select('*').limit(1000)
      if (data && !error) {
        const formatted = data.map(ex => {
          let mappedMuscle = 'Core';
          const bp = (ex.body_part || '').toLowerCase();
          if (bp.includes('chest')) mappedMuscle = 'Chest';
          else if (bp.includes('back')) mappedMuscle = 'Back';
          else if (bp.includes('leg') || bp.includes('thigh') || bp.includes('calf')) mappedMuscle = 'Legs';
          else if (bp.includes('shoulder')) mappedMuscle = 'Shoulders';
          else if (bp.includes('arm') || bp.includes('bicep') || bp.includes('tricep') || bp.includes('lower arms') || bp.includes('upper arms')) mappedMuscle = 'Arms';
          
          let eq = 'Bodyweight';
          const exEq = (ex.equipment || '').toLowerCase();
          if (exEq.includes('barbell')) eq = 'Barbell';
          else if (exEq.includes('dumbbell')) eq = 'Dumbbell';
          else if (exEq.includes('cable')) eq = 'Cable';
          else if (exEq.includes('machine') || exEq.includes('leverage')) eq = 'Machine';
          
          return {
            id: ex.id,
            name: ex.name.toUpperCase(), // Match design style
            muscle: mappedMuscle,
            equipment: eq,
            isCustom: false
          };
        });
        setExercisesList(formatted);
      }
      setIsLoading(false);
    }
    fetchExercises()
  }, [])`
);

// Add loading state UI right before AnimatePresence
content = content.replace(
  '<AnimatePresence>',
  `{isLoading ? (
            <div className="col-span-full py-12 flex justify-center items-center">
              <div className="w-10 h-10 border-4 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <AnimatePresence>`
);

// We need to close the AnimatePresence ternary
content = content.replace(
  '          </AnimatePresence>',
  '          </AnimatePresence>\n          )}'
);

fs.writeFileSync(path, content, 'utf8');
console.log('File updated successfully!');
