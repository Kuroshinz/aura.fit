require('dotenv').config({ path: require('fs').existsSync('.env') ? '.env' : require('fs').existsSync('python_backend/.env') ? 'python_backend/.env' : '.env.local' });
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

// Setup Postgres connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Update this path to where your dataset is located
const DATASET_PATH = 'D:/Download/exercises-dataset-main/exercises-dataset-main/data/exercises.json';

async function seedDatabase() {
  console.log(`Reading dataset from ${DATASET_PATH}...`);
  
  let rawData;
  try {
    rawData = fs.readFileSync(path.resolve(DATASET_PATH), 'utf-8');
  } catch (err) {
    console.error('Ã¢ÂÅ’ Failed to read the JSON file. Ensure the path is correct.');
    console.error(err.message);
    process.exit(1);
  }

  const exercises = JSON.parse(rawData);
  console.log(`Found ${exercises.length} exercises. Starting import...`);

  // Define the parameterized INSERT query
  const queryText = `
    INSERT INTO exercises_catalog (
      id, name, category, body_part, equipment, 
      instructions_en, instructions_es, instructions_it, instructions_tr, 
      instructions_ru, instructions_zh, instructions_hi, instructions_pl, instructions_ko, instructions_fr,
      muscle_group, secondary_muscles, target, image, gif_url, created_at
    ) 
    VALUES (
      $1, $2, $3, $4, $5, 
      $6, $7, $8, $9, 
      $10, $11, $12, $13, $14, $15,
      $16, $17, $18, $19, $20, $21
    )
    ON CONFLICT (id) DO NOTHING;
  `;

  let successCount = 0;
  let errorCount = 0;

  for (let i = 0; i < exercises.length; i++) {
    const ex = exercises[i];
    
    // Some JSON files structure instructions in a sub-object. We extract the raw string or join arrays.
    const getInstructions = (lang) => {
      if (!ex.instructions) return null;
      if (typeof ex.instructions[lang] === 'string') return ex.instructions[lang];
      if (Array.isArray(ex.instructions[lang])) return ex.instructions[lang].join(' ');
      return null;
    };

    const values = [
      ex.id,
      ex.name,
      ex.category || null,
      ex.body_part || null,
      ex.equipment || null,
      getInstructions('en'),
      getInstructions('es'),
      getInstructions('it'),
      getInstructions('tr'),
      getInstructions('ru'),
      getInstructions('zh'),
      getInstructions('hi'),
      getInstructions('pl'),
      getInstructions('ko'),
      getInstructions('fr'),
      ex.muscle_group || null,
      ex.secondary_muscles ? JSON.stringify(ex.secondary_muscles) : null,
      ex.target || null,
      ex.image || null,
      ex.gif_url || null,
      ex.created_at || new Date().toISOString()
    ];

    try {
      await pool.query(queryText, values);
      successCount++;
      
      // Print progress every 100 rows
      if (successCount % 100 === 0) {
        console.log(`Inserted ${successCount} / ${exercises.length} rows...`);
      }
    } catch (err) {
      if (errorCount === 0) {
         console.error('--- FIRST DB ERROR DETAILS ---');
         console.error(err);
         console.error('------------------------------');
      }
      console.error(`âŒ Error inserting exercise ID ${ex.id}: ${err.message}`);
      errorCount++;
    }
  }

  console.log('\nÃ¢Å“â€¦ Seeding Complete!');
  console.log(`Successfully inserted: ${successCount}`);
  if (errorCount > 0) console.log(`Failed insertions: ${errorCount}`);
  
  await pool.end();
}

seedDatabase();






