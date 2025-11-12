const mariadb = require('mariadb');
require('dotenv').config();

async function runMigrations() {
  let conn;
  try {
    conn = await mariadb.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });

    console.log('Connected to MariaDB for migrations');

    // Create app_settings table (single-row settings)
    await conn.query(`
      CREATE TABLE IF NOT EXISTS app_settings (
        id TINYINT PRIMARY KEY DEFAULT 1,
        company_name VARCHAR(255),
        company_address TEXT,
        company_phone VARCHAR(50),
        company_email VARCHAR(255),
        company_website VARCHAR(255),
        logo_url VARCHAR(255),
        email_smtp_host VARCHAR(255),
        email_smtp_port INT,
        email_smtp_user VARCHAR(255),
        email_smtp_password VARCHAR(255),
        email_smtp_secure TINYINT(1) DEFAULT 1,
        gemini_api_key VARCHAR(255),
        gemini_model VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ app_settings table ensured');

    // Seed default row if not exists
    await conn.query(`
      INSERT IGNORE INTO app_settings (id, company_name, company_address, company_phone, company_email, company_website, gemini_model)
      VALUES (1, ?, ?, ?, ?, ?, ?)
    `, [
      process.env.COMPANY_NAME || null,
      process.env.COMPANY_ADDRESS || null,
      process.env.COMPANY_PHONE || null,
      process.env.COMPANY_EMAIL || null,
      process.env.COMPANY_WEBSITE || null,
      process.env.GEMINI_MODEL || 'gemini-1.5-flash'
    ]);

    // Add avatar_url column to users (if not exists)
    await conn.query(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url VARCHAR(255) NULL
    `);
    console.log('✅ users.avatar_url column ensured');

    console.log('\n🎉 Migrations completed successfully!');
  } catch (err) {
    console.error('❌ Migration error:', err);
    process.exit(1);
  } finally {
    if (conn) await conn.end();
  }
}

runMigrations();
