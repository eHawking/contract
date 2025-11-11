# AEMCO Contract Builder - Project Summary

## 📋 Project Overview

**Client:** AHMED ESSA CONSTRUCTION & TRADING (AEMCO)  
**Project:** Contract Builder Web Application  
**Domain:** https://workspace.ahmed-essa.com  
**Company Address:** 6619, King Fahd Road, Dammam, 32243, Saudi Arabia  
**Contact:** +966 50 911 9859 | ahmed.Wasim@ahmed-essa.com

## 🎯 Project Objectives

Create a comprehensive contract management system that allows AEMCO to:
- Create and manage contracts with service providers
- Use pre-built contract templates
- Send contracts to providers for electronic signature
- Track contract status and history
- Manage service provider accounts

## 🏗️ Technical Architecture

### Backend Stack
- **Runtime:** Node.js 24.11.0
- **Framework:** Express.js
- **Database:** MariaDB 10.11.13
- **Authentication:** JWT (JSON Web Tokens)
- **Security:** bcryptjs, helmet, express-rate-limit
- **Validation:** express-validator, joi

### Frontend Stack
- **Framework:** React 18
- **Build Tool:** Vite
- **Routing:** React Router v6
- **Styling:** TailwindCSS
- **Icons:** Lucide React
- **HTTP Client:** Axios
- **State Management:** Zustand
- **Notifications:** Sonner

### Server Environment
- **Hosting:** Plesk
- **Web Server:** Apache/Nginx
- **Process Manager:** PM2 (recommended)
- **SSL:** HTTPS enabled

## 📊 Database Schema

### Tables Created

1. **users** - Admin and service provider accounts
   - Stores user credentials, company info, status
   - Roles: admin, provider

2. **contract_templates** - Reusable contract templates
   - Template content with placeholders
   - Categories and descriptions
   - Active/inactive status

3. **contracts** - Main contract records
   - Contract details, content, amounts
   - Status tracking (draft, sent, signed, active, etc.)
   - Links to providers and templates
   - Signature information

4. **contract_versions** - Version history
   - Tracks all changes to contracts
   - Audit trail for modifications

5. **audit_logs** - System activity logs
   - User actions tracking
   - IP addresses and timestamps
   - Entity changes

## 🔐 Security Features

- **Password Hashing:** bcrypt with 10 salt rounds
- **JWT Authentication:** Secure token-based auth
- **Role-Based Access Control:** Admin vs Provider permissions
- **Rate Limiting:** API request throttling
- **Security Headers:** Helmet.js configuration
- **SQL Injection Protection:** Parameterized queries
- **XSS Protection:** Input validation and sanitization
- **HTTPS Enforcement:** SSL/TLS encryption

## ✨ Key Features

### Administrator Features

1. **Dashboard**
   - Overview statistics
   - Recent contracts
   - Quick actions

2. **Contract Management**
   - Create contracts from scratch or templates
   - Edit contract details and content
   - Send contracts to providers
   - Track signatures and status
   - Version history

3. **Template Management**
   - Create reusable templates
   - HTML content support
   - Variable placeholders
   - Category organization

4. **User Management**
   - Add service providers
   - Approve pending registrations
   - Activate/deactivate accounts
   - Reset passwords

### Service Provider Features

1. **Dashboard**
   - Contract statistics
   - Total contract value
   - Pending actions

2. **Contract Portal**
   - View assigned contracts
   - Review contract details
   - Electronic signature
   - Reject with reason
   - Download contracts

3. **Account Management**
   - Update profile
   - Change password

### Contract Templates Included

1. **Service Provider Agreement**
   - Standard service contract
   - Customizable scope and terms

2. **Subcontractor Agreement**
   - Construction-specific contract
   - Project details and scope

3. **Supply Agreement**
   - Material and equipment supply
   - Delivery schedules

## 📁 Project Structure

```
aemco-contract-builder/
├── server/                    # Backend application
│   ├── index.js              # Main server entry point
│   ├── database.js           # Database configuration
│   ├── setup-database.js     # Database initialization script
│   ├── routes/               # API route handlers
│   │   ├── auth.js          # Authentication routes
│   │   ├── contracts.js     # Contract management (admin)
│   │   ├── templates.js     # Template management (admin)
│   │   ├── users.js         # User management (admin)
│   │   └── provider.js      # Provider portal routes
│   └── middleware/           # Express middleware
│       ├── auth.js          # JWT authentication
│       ├── audit.js         # Audit logging
│       └── validator.js     # Request validation
│
├── client/                   # Frontend application
│   ├── src/
│   │   ├── main.jsx         # React entry point
│   │   ├── App.jsx          # Main app component
│   │   ├── index.css        # Global styles
│   │   ├── components/      # Reusable components
│   │   │   ├── Layout.jsx   # Main layout with sidebar
│   │   │   └── StatusBadge.jsx
│   │   ├── pages/           # Page components
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── admin/       # Admin pages
│   │   │   │   ├── Dashboard.jsx
│   │   │   │   ├── Contracts.jsx
│   │   │   │   ├── ContractForm.jsx
│   │   │   │   ├── Templates.jsx
│   │   │   │   ├── TemplateForm.jsx
│   │   │   │   ├── Users.jsx
│   │   │   │   └── UserForm.jsx
│   │   │   └── provider/    # Provider pages
│   │   │       ├── Dashboard.jsx
│   │   │       ├── Contracts.jsx
│   │   │       └── ContractView.jsx
│   │   ├── lib/
│   │   │   └── api.js       # API client
│   │   └── store/
│   │       └── useAuthStore.js  # Auth state management
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── postcss.config.js
│
├── logs/                     # Application logs (created at runtime)
├── .env                      # Environment configuration (gitignored)
├── .env.example             # Environment template
├── .gitignore               # Git ignore rules
├── .htaccess                # Apache configuration
├── ecosystem.config.js      # PM2 configuration
├── package.json             # Backend dependencies
├── README.md                # Project documentation
├── QUICK_START.md           # Quick start guide
├── DEPLOYMENT.md            # Deployment instructions
├── setup.bat                # Windows setup script
└── start-production.bat     # Windows production start script
```

## 🚀 Deployment Instructions

### Quick Deploy (Production)

1. **Upload files** to https://workspace.ahmed-essa.com
2. **Configure `.env`** with database credentials
3. **Run setup:**
   ```bash
   npm install
   cd client && npm install && npm run build && cd ..
   node server/setup-database.js
   ```
4. **Start application:**
   ```bash
   pm2 start ecosystem.config.js
   ```

See `DEPLOYMENT.md` for detailed instructions.

## 🔑 Default Credentials

**Admin Account:**
- Email: `admin@ahmed-essa.com`
- Password: `Admin@123456`

⚠️ **CRITICAL:** Change password immediately after first login!

## 📊 API Documentation

### Authentication Endpoints
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - Register service provider
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user
- `POST /api/auth/change-password` - Change password

### Admin - Contract Endpoints
- `GET /api/contracts` - List all contracts
- `GET /api/contracts/:id` - Get contract by ID
- `POST /api/contracts` - Create new contract
- `PUT /api/contracts/:id` - Update contract
- `DELETE /api/contracts/:id` - Delete contract
- `POST /api/contracts/:id/send` - Send contract to provider

### Admin - Template Endpoints
- `GET /api/templates` - List all templates
- `GET /api/templates/:id` - Get template by ID
- `POST /api/templates` - Create new template
- `PUT /api/templates/:id` - Update template
- `DELETE /api/templates/:id` - Delete template

### Admin - User Endpoints
- `GET /api/users` - List all users
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create new user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user
- `POST /api/users/:id/approve` - Approve pending user
- `POST /api/users/:id/reset-password` - Reset password

### Provider Endpoints
- `GET /api/provider/contracts` - Get my contracts
- `GET /api/provider/contracts/:id` - Get contract details
- `POST /api/provider/contracts/:id/sign` - Sign contract
- `POST /api/provider/contracts/:id/reject` - Reject contract
- `GET /api/provider/contracts/:id/pdf` - Download PDF
- `GET /api/provider/dashboard/stats` - Get statistics

## 🎨 UI/UX Features

- **Responsive Design:** Works on desktop, tablet, and mobile
- **Modern Interface:** Clean, professional design
- **Intuitive Navigation:** Sidebar navigation with icons
- **Status Indicators:** Color-coded badges for contract status
- **Real-time Feedback:** Toast notifications for actions
- **Form Validation:** Client and server-side validation
- **Loading States:** Loading indicators for async operations
- **Error Handling:** User-friendly error messages

## 🔧 Maintenance & Updates

### Regular Tasks
- **Database Backups:** Daily automated backups recommended
- **Log Rotation:** Monitor and rotate log files
- **Security Updates:** Keep dependencies updated
- **Password Changes:** Enforce periodic password changes

### Monitoring
- **Application Logs:** `logs/combined.log`
- **Error Logs:** `logs/err.log`
- **PM2 Monitoring:** `pm2 monit`
- **Database Performance:** Monitor query performance

## 📈 Future Enhancements (Optional)

1. **PDF Generation:** Proper PDF export with pdf-lib
2. **Email Notifications:** Send emails on contract actions
3. **Multi-language Support:** Arabic/English
4. **Advanced Reporting:** Contract analytics and reports
5. **Digital Signatures:** Integration with e-signature services
6. **Document Attachments:** Upload supporting documents
7. **Contract Reminders:** Expiry notifications
8. **Mobile App:** Native mobile application

## 📞 Support & Contact

**AHMED ESSA CONSTRUCTION & TRADING (AEMCO)**
- Website: ahmed-essa.com
- Email: ahmed.Wasim@ahmed-essa.com
- Phone: +966 50 911 9859
- Address: 6619, King Fahd Road, Dammam, 32243, Saudi Arabia

## 📄 License

Proprietary - All rights reserved by AHMED ESSA CONSTRUCTION & TRADING (AEMCO)

---

**Project Completed:** 2024
**Technology Stack:** Node.js, React, MariaDB
**Deployment:** Plesk, https://workspace.ahmed-essa.com
