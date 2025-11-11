# AEMCO Contract Builder

> Professional Contract Management System for AHMED ESSA CONSTRUCTION & TRADING

[![Node.js](https://img.shields.io/badge/Node.js-24.11.0-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18.2-blue.svg)](https://reactjs.org/)
[![MariaDB](https://img.shields.io/badge/MariaDB-10.11-blue.svg)](https://mariadb.org/)

## 🏢 Company Information

**AHMED ESSA CONSTRUCTION & TRADING (AEMCO)**  
6619, King Fahd Road, Dammam, 32243, Saudi Arabia  
📞 +966 50 911 9859  
📧 ahmed.Wasim@ahmed-essa.com  
🌐 ahmed-essa.com

## 🚀 Features

### Admin Portal
- 📊 Dashboard with statistics and analytics
- 📝 Contract management (create, edit, send, track)
- 📄 Contract template library
- 👥 Service provider management
- ⚙️ System settings and configuration
- 🎨 Company logo and branding customization
- 📧 Email configuration (SMTP)
- 🤖 AI-powered content generation (Google Gemini)
- 👤 Profile management with photo upload

### Service Provider Portal
- 📋 View assigned contracts
- ✍️ Digital contract signing
- 📥 Download contracts as PDF
- 👤 Profile management
- 🔔 Contract status tracking

### AI Features (NEW! v2.0)
- 🤖 Auto-generate contract content using Google Gemini AI
- ✨ Intelligent template suggestions
- 📝 Professional clause generation
- 🎯 Context-aware content creation

## 🛠️ Tech Stack

### Backend
- Node.js 24.11.0
- Express.js
- MariaDB 10.11.13
- JWT Authentication
- Multer (file uploads)
- Google Gemini AI

### Frontend
- React 18.2
- Vite
- TailwindCSS
- Zustand (state management)
- React Router
- Axios
- Lucide Icons

## 📦 Installation

### Prerequisites
- Node.js 24.11.0 or higher
- MariaDB 10.11.13 or higher
- npm or yarn

### Quick Start

```bash
# Clone repository
git clone https://github.com/eHawking/contract.git
cd contract

# Install dependencies
npm install
cd client && npm install && cd ..

# Setup environment
cp .env.example .env
# Edit .env with your database credentials

# Setup database
node server/setup-database.js

# Build frontend
cd client && npm run build && cd ..

# Start production server
NODE_ENV=production node server/index.js
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# Server
PORT=3000
NODE_ENV=production

# Database
DB_HOST=localhost
DB_PORT=3306
DB_NAME=aemco_contracts
DB_USER=your_db_user
DB_PASSWORD=your_db_password

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this

# Client URL
CLIENT_URL=https://workspace.ahmed-essa.com
```

### Default Admin Credentials

```
Email: admin@ahmed-essa.com
Password: Admin@123456
```

⚠️ **IMPORTANT:** Change the default password after first login!

## 🌐 Deployment

### Plesk Server

Detailed deployment guide available in `PLESK_SETUP.md`

Quick deployment:

```bash
# Pull from GitHub
git clone https://github.com/eHawking/contract.git workspace.ahmed-essa.com
cd workspace.ahmed-essa.com

# Run automated setup
bash fix-all.sh

# Or manual setup
npm install
cd client && npm install && npm run build && cd ..
node server/setup-database.js
NODE_ENV=production node server/index.js
```

### New Features Deployment (v2.0)

```bash
cd workspace.ahmed-essa.com
git pull
bash deploy-new-features.sh
```

## 📚 Documentation

- **[QUICK_START.md](QUICK_START.md)** - Quick start guide for development
- **[DEPLOYMENT.md](DEPLOYMENT.md)** - Complete deployment guide
- **[PLESK_SETUP.md](PLESK_SETUP.md)** - Plesk-specific setup instructions
- **[NEW_FEATURES.md](NEW_FEATURES.md)** - New features guide (v2.0)
- **[PROJECT_SUMMARY.md](PROJECT_SUMMARY.md)** - Comprehensive project overview

## 🗄️ Database Schema

### Tables
- `users` - Admin and service provider accounts
- `contracts` - Contract records
- `contract_templates` - Reusable contract templates
- `contract_versions` - Contract version history
- `audit_logs` - System audit trail
- `settings` - System configuration (v2.0)
- `uploads` - File upload tracking (v2.0)

## 🔐 Security Features

- ✅ JWT-based authentication
- ✅ Password hashing (bcrypt)
- ✅ Role-based access control
- ✅ Rate limiting
- ✅ CORS protection
- ✅ Helmet security headers
- ✅ SQL injection prevention
- ✅ Input validation
- ✅ Secure file uploads

## 🆕 What's New in v2.0

- ✨ **Admin Settings Management** - Configure system settings
- 🎨 **Company Logo Upload** - Customize branding
- 📧 **Email Configuration** - SMTP settings
- 🤖 **Gemini AI Integration** - Auto-generate contract content
- 👤 **Enhanced Profile Management** - Photos and detailed info
- 🔒 **Password Management** - User-controlled password changes

## 📸 Screenshots

### Admin Dashboard
Comprehensive overview with statistics and recent contracts.

### Contract Management
Create, edit, and manage contracts with version control.

### Settings Panel (v2.0)
Configure company details, email, and AI settings.

## 🤝 Contributing

This is a private project for AEMCO. For any modifications or support:

Contact: ahmed.Wasim@ahmed-essa.com

## 📄 License

Proprietary - © 2024 AHMED ESSA CONSTRUCTION & TRADING (AEMCO)  
All Rights Reserved

## 🐛 Troubleshooting

### Common Issues

**White screen after deployment:**
- Run `bash fix-plesk-live.sh`
- Check `PLESK_LIVE_FIX.md`

**Database connection errors:**
- Verify `.env` credentials
- Check MariaDB is running
- Run `node server/setup-database.js`

**File upload errors:**
- Create uploads directory: `mkdir -p uploads/profiles`
- Set permissions: `chmod -R 755 uploads`

## 📞 Support

For technical support or questions:

**Email:** ahmed.Wasim@ahmed-essa.com  
**Phone:** +966 50 911 9859  
**Website:** https://ahmed-essa.com

---

**Made with ❤️ for AHMED ESSA CONSTRUCTION & TRADING**
