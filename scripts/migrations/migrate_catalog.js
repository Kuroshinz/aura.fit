const { Client } = require('pg');

const client = new Client({ 
  connectionString: "postgresql://postgres:nguyenthiennhan3062010@db.ojaqmtpjorszxwpkacus.supabase.co:5432/postgres" 
});

async function migrate() {
  await client.connect();
  try {
    console.log("Fetching from exercises_catalog...");
    const { rows: catalogRows } = await client.query('SELECT * FROM exercises_catalog');
    console.log(`Found ${catalogRows.length} exercises. Migrating to 'exercises' table...`);

    let successCount = 0;

    for (const ex of catalogRows) {
      // Build media_urls array
      const media_urls = [];
      if (ex.gif_url) media_urls.push(ex.gif_url);
      if (ex.image) media_urls.push(ex.image);

      // Build instructions array
      let instructions = [];
      if (ex.instructions_en) {
        try {
          instructions = JSON.parse(ex.instructions_en);
        } catch(e) {
          instructions = [ex.instructions_en];
        }
      }

      // Map muscle and equipment (standardize strings or use as-is)
      const muscle = ex.body_part || ex.muscle_group || 'Full Body';
      const equipment = ex.equipment || 'Bodyweight';
      const name = ex.name || 'Unknown';
      const difficulty = 'beginner'; // default
      const description = ex.target ? `Target: ${ex.target}` : null;

      const insertQuery = `
        INSERT INTO exercises (
          id, name, muscle_group, equipment, is_custom, created_by,
          description, instructions, media_urls, difficulty, created_at, target
        ) VALUES (
          $1, $2, $3, $4, $5, $6,
          $7, $8, $9, $10, $11, $12
        )
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          muscle_group = EXCLUDED.muscle_group,
          equipment = EXCLUDED.equipment,
          media_urls = EXCLUDED.media_urls,
          instructions = EXCLUDED.instructions
      `;

      const uuidId = "00000000-0000-0000-0000-" + ex.id.toString().padStart(12, '0');
      
      await client.query(insertQuery, [
        uuidId, name, muscle, equipment, false, null,
        description, JSON.stringify(instructions), JSON.stringify(media_urls), difficulty, ex.created_at || new Date().toISOString(), ex.target || null
      ]);
      
      successCount++;
      if (successCount % 100 === 0) console.log(`Migrated ${successCount}...`);
    }

    console.log("Migration complete!");
  } catch(e) { 
    console.error(e); 
  } finally {
    process.exit(0);
  }
}

migrate();
