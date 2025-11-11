const mariadb = require('mariadb');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function setupDatabase() {
  let conn;
  
  try {
    // Connect without database first
    conn = await mariadb.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD
    });

    console.log('Connected to MariaDB');

    // Create database if not exists
    await conn.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME}`);
    console.log(`✅ Database '${process.env.DB_NAME}' created or already exists`);

    await conn.query(`USE ${process.env.DB_NAME}`);

    // Create users table
    await conn.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        role ENUM('admin', 'provider') NOT NULL DEFAULT 'provider',
        company_name VARCHAR(255),
        phone VARCHAR(50),
        address TEXT,
        commercial_registration VARCHAR(100),
        status ENUM('active', 'inactive', 'pending') DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        last_login TIMESTAMP NULL,
        INDEX idx_email (email),
        INDEX idx_role (role),
        INDEX idx_status (status)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ Users table created');

    // Create contract_templates table
    await conn.query(`
      CREATE TABLE IF NOT EXISTS contract_templates (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        category VARCHAR(100),
        content LONGTEXT NOT NULL,
        fields JSON,
        status ENUM('active', 'inactive') DEFAULT 'active',
        created_by INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
        INDEX idx_category (category),
        INDEX idx_status (status)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ Contract templates table created');

    // Create contracts table
    await conn.query(`
      CREATE TABLE IF NOT EXISTS contracts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        contract_number VARCHAR(100) UNIQUE NOT NULL,
        template_id INT,
        provider_id INT NOT NULL,
        title VARCHAR(255) NOT NULL,
        content LONGTEXT NOT NULL,
        start_date DATE,
        end_date DATE,
        amount DECIMAL(15, 2),
        currency VARCHAR(10) DEFAULT 'SAR',
        status ENUM('draft', 'sent', 'signed', 'active', 'completed', 'cancelled') DEFAULT 'draft',
        signed_by_provider BOOLEAN DEFAULT FALSE,
        signed_at TIMESTAMP NULL,
        provider_signature TEXT,
        notes TEXT,
        metadata JSON,
        created_by INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (template_id) REFERENCES contract_templates(id) ON DELETE SET NULL,
        FOREIGN KEY (provider_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
        INDEX idx_contract_number (contract_number),
        INDEX idx_provider (provider_id),
        INDEX idx_status (status),
        INDEX idx_dates (start_date, end_date)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ Contracts table created');

    // Create contract_versions table (for tracking changes)
    await conn.query(`
      CREATE TABLE IF NOT EXISTS contract_versions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        contract_id INT NOT NULL,
        version_number INT NOT NULL,
        content LONGTEXT NOT NULL,
        changed_by INT,
        change_notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (contract_id) REFERENCES contracts(id) ON DELETE CASCADE,
        FOREIGN KEY (changed_by) REFERENCES users(id) ON DELETE SET NULL,
        INDEX idx_contract (contract_id),
        UNIQUE KEY unique_version (contract_id, version_number)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ Contract versions table created');

    // Create audit_logs table
    await conn.query(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT,
        action VARCHAR(100) NOT NULL,
        entity_type VARCHAR(50),
        entity_id INT,
        details JSON,
        ip_address VARCHAR(45),
        user_agent TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
        INDEX idx_user (user_id),
        INDEX idx_entity (entity_type, entity_id),
        INDEX idx_created (created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ Audit logs table created');

    // Create default admin user
    const adminPassword = await bcrypt.hash('Admin@123456', 10);
    await conn.query(`
      INSERT IGNORE INTO users (email, password, name, role, company_name, phone, address)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [
      'admin@ahmed-essa.com',
      adminPassword,
      'System Administrator',
      'admin',
      'AHMED ESSA CONSTRUCTION & TRADING (AEMCO)',
      '+966 50 911 9859',
      '6619, King Fahd Road, Dammam, 32243, Saudi Arabia'
    ]);
    console.log('✅ Default admin user created');

    // Insert sample contract templates
    await conn.query(`
      INSERT IGNORE INTO contract_templates (id, name, description, category, content, fields, status)
      VALUES 
      (1, 'Service Provider Agreement', 'Standard service provider contract template', 'Service', 
       '<h1>SERVICE PROVIDER AGREEMENT</h1>
       <p>This Service Provider Agreement is entered into on {{contract_date}} between:</p>
       <p><strong>AHMED ESSA CONSTRUCTION & TRADING (AEMCO)</strong><br/>
       6619, King Fahd Road, Dammam, 32243, Saudi Arabia<br/>
       Phone: +966 50 911 9859<br/>
       Email: ahmed.Wasim@ahmed-essa.com</p>
       <p>And</p>
       <p><strong>{{provider_name}}</strong><br/>
       {{provider_address}}<br/>
       Phone: {{provider_phone}}<br/>
       Email: {{provider_email}}<br/>
       C.R. No: {{provider_cr}}</p>
       <h2>1. SCOPE OF SERVICES</h2>
       <p>{{scope_of_services}}</p>
       <h2>2. CONTRACT PERIOD</h2>
       <p>From: {{start_date}} To: {{end_date}}</p>
       <h2>3. PAYMENT TERMS</h2>
       <p>Total Amount: {{amount}} SAR</p>
       <p>{{payment_terms}}</p>
       <h2>4. TERMS AND CONDITIONS</h2>
       <p>{{terms_and_conditions}}</p>',
       JSON_OBJECT("fields", JSON_ARRAY("provider_name", "provider_address", "provider_phone", "provider_email", "provider_cr", "scope_of_services", "start_date", "end_date", "amount", "payment_terms", "terms_and_conditions")),
       'active'),
      (2, 'Subcontractor Agreement', 'Construction subcontractor agreement', 'Construction',
       '<h1>SUBCONTRACTOR AGREEMENT</h1>
       <p>This Subcontractor Agreement is made on {{contract_date}} between:</p>
       <p><strong>AHMED ESSA CONSTRUCTION & TRADING (AEMCO)</strong><br/>
       6619, King Fahd Road, Dammam, 32243, Saudi Arabia</p>
       <p>And</p>
       <p><strong>{{subcontractor_name}}</strong><br/>
       {{subcontractor_address}}</p>
       <h2>PROJECT DETAILS</h2>
       <p>Project Name: {{project_name}}<br/>
       Project Location: {{project_location}}</p>
       <h2>SCOPE OF WORK</h2>
       <p>{{scope_of_work}}</p>
       <h2>CONTRACT VALUE</h2>
       <p>{{contract_value}} SAR</p>',
       JSON_OBJECT("fields", JSON_ARRAY("subcontractor_name", "subcontractor_address", "project_name", "project_location", "scope_of_work", "contract_value")),
       'active'),
      (3, 'Supply Agreement', 'Material and equipment supply agreement', 'Supply',
       '<h1>SUPPLY AGREEMENT</h1>
       <p>Date: {{contract_date}}</p>
       <p><strong>Supplier:</strong> {{supplier_name}}<br/>
       {{supplier_details}}</p>
       <h2>MATERIALS TO BE SUPPLIED</h2>
       <p>{{materials_description}}</p>
       <h2>DELIVERY SCHEDULE</h2>
       <p>{{delivery_schedule}}</p>
       <h2>PRICING</h2>
       <p>Total Value: {{total_value}} SAR</p>',
       JSON_OBJECT("fields", JSON_ARRAY("supplier_name", "supplier_details", "materials_description", "delivery_schedule", "total_value")),
       'active')
    `);
    console.log('✅ Sample contract templates created');

    console.log('\n🎉 Database setup completed successfully!\n');
    console.log('Default Admin Credentials:');
    console.log('Email: admin@ahmed-essa.com');
    console.log('Password: Admin@123456');
    console.log('\n⚠️  Please change the default password after first login!\n');

  } catch (err) {
    console.error('❌ Error setting up database:', err);
    throw err;
  } finally {
    if (conn) await conn.end();
  }
}

// Run setup
setupDatabase()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
