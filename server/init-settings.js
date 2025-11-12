const { pool } = require('./database');

const defaultSettings = [
  { key: 'company_name', value: 'AHMED ESSA CONSTRUCTION & TRADING (AEMCO)', type: 'text' },
  { key: 'company_address', value: '6619, King Fahd Road, Dammam, 32243, Saudi Arabia', type: 'text' },
  { key: 'company_phone', value: '+966 50 911 9859', type: 'text' },
  { key: 'company_email', value: 'ahmed.Wasim@ahmed-essa.com', type: 'text' },
  { key: 'company_website', value: 'www.ahmed-essa.com', type: 'text' },
  { key: 'company_logo', value: '', type: 'text' },
  
  { key: 'smtp_host', value: '', type: 'text' },
  { key: 'smtp_port', value: '587', type: 'text' },
  { key: 'smtp_user', value: '', type: 'text' },
  { key: 'smtp_password', value: '', type: 'password' },
  { key: 'smtp_from_name', value: 'AEMCO Contract Builder', type: 'text' },
  { key: 'smtp_from_email', value: 'noreply@ahmed-essa.com', type: 'text' },
  
  { key: 'ai_enabled', value: 'false', type: 'boolean' },
  { key: 'gemini_api_key', value: '', type: 'password' },
  { key: 'gemini_model', value: 'gemini-1.5-pro-latest', type: 'text' }
];

async function initSettings() {
  try {
    console.log('🔧 Initializing settings...');
    
    for (const setting of defaultSettings) {
      // Check if setting exists
      const [existing] = await pool.query(
        'SELECT setting_key FROM settings WHERE setting_key = ?',
        [setting.key]
      );
      
      if (existing.length === 0) {
        // Insert new setting
        await pool.query(
          'INSERT INTO settings (setting_key, setting_value, setting_type) VALUES (?, ?, ?)',
          [setting.key, setting.value, setting.type]
        );
        console.log(`  ✅ Added setting: ${setting.key}`);
      } else {
        console.log(`  ⏭️  Setting exists: ${setting.key}`);
      }
    }
    
    console.log('✅ Settings initialization complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error initializing settings:', error);
    process.exit(1);
  }
}

initSettings();
