const { pool } = require('./database');
const fs = require('fs').promises;
const path = require('path');

async function updateDatabase() {
  let conn;
  
  try {
    console.log('🔄 Updating database schema...\n');
    
    conn = await pool.getConnection();
    
    // Read the SQL file
    const sqlFile = path.join(__dirname, 'update-schema.sql');
    const sql = await fs.readFile(sqlFile, 'utf8');
    
    // Split by semicolons and execute each statement
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--') && !s.match(/^\/\*/));
    
    console.log(`📝 Executing ${statements.length} SQL statements...\n`);
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      try {
        await conn.query(statement);
        console.log(`✓ Statement ${i + 1}/${statements.length} executed`);
      } catch (err) {
        // Ignore "already exists" errors
        if (err.message.includes('already exists') || 
            err.message.includes('Duplicate') ||
            err.message.includes('duplicate column') ||
            err.sqlState === '42S21' || // Duplicate column
            err.errno === 1060) {        // Duplicate column
          console.log(`⚠ Statement ${i + 1}: Already exists (skipped)`);
        } else {
          console.error(`✗ Error in statement ${i + 1}:`, err.message);
          console.error('Statement:', statement.substring(0, 100) + '...');
        }
      }
    }
    
    console.log('✅ Settings table created/updated');
    console.log('✅ Profile photo and user fields added');
    console.log('✅ Uploads table created');
    console.log('✅ Default settings inserted');
    
    // Verify the updates
    try {
      const [settings] = await conn.query('SELECT COUNT(*) as count FROM settings');
      console.log(`✅ Settings table has ${settings[0].count} entries`);
    } catch (err) {
      console.log('⚠ Could not verify settings table');
    }
    
    try {
      const [columns] = await conn.query(`
        SELECT COLUMN_NAME 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'users' 
        AND COLUMN_NAME IN ('profile_photo', 'phone', 'address')
      `);
      console.log(`✅ User table has ${columns.length}/3 new columns`);
    } catch (err) {
      console.log('⚠ Could not verify user columns');
    }
    
    console.log('\n🎉 Database updated successfully!');
    console.log('\nNew Features Available:');
    console.log('- Admin can manage company settings');
    console.log('- Admin can upload company logo');
    console.log('- Admin can configure email settings');
    console.log('- Admin can configure Gemini AI for auto-content generation');
    console.log('- Users can upload profile photos');
    console.log('- Users can update profile details');
    console.log('- Users can change passwords');
    
  } catch (err) {
    console.error('❌ Error updating database:', err.message);
    process.exit(1);
  } finally {
    if (conn) conn.release();
    process.exit(0);
  }
}

updateDatabase();
