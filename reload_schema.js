const { Client } = require('pg');
const c = new Client({
  connectionString: 'postgresql://postgres:nguyenthiennhan3062010@db.ojaqmtpjorszxwpkacus.supabase.co:5432/postgres'
});
c.connect()
  .then(() => c.query("NOTIFY pgrst, 'reload schema'"))
  .then(() => {
    console.log('Schema reloaded!');
    process.exit(0);
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
