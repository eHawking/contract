# AEMCO Contract Builder

Contract management system for AHMED ESSA CONSTRUCTION & TRADING (AEMCO).

## Features

- ✅ Admin dashboard for contract management
- ✅ Service provider portal
- ✅ Contract templates library
- ✅ Dynamic contract builder
- ✅ PDF generation
- ✅ User authentication & authorization
- ✅ Email notifications
- ✅ Audit trail

## Company Information

**AHMED ESSA CONSTRUCTION & TRADING (AEMCO)**
- Address: 6619, King Fahd Road, Dammam, 32243, Saudi Arabia
- Phone: +966 50 911 9859
- Email: ahmed.Wasim@ahmed-essa.com
- Website: ahmed-essa.com

## Tech Stack

- **Backend**: Node.js 24.11.0, Express.js
- **Database**: MariaDB 10.11.13
- **Frontend**: React, TailwindCSS, shadcn/ui
- **Server**: Plesk
- **Domain**: https://workspace.ahmed-essa.com

## Installation

1. Clone the repository
2. Copy `.env.example` to `.env` and configure your environment variables
3. Install dependencies:
   ```bash
   npm run install:all
   ```

4. Set up the database:
   ```bash
   node server/setup-database.js
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

## Production Deployment

1. Build the frontend:
   ```bash
   npm run build
   ```

2. Start the production server:
   ```bash
   npm start
   ```

## Default Admin Credentials

- Email: admin@ahmed-essa.com
- Password: Admin@123456

**⚠️ Important: Change the default admin password after first login!**

## Database Schema

- **users** - Admin and service provider accounts
- **contracts** - Contract records
- **templates** - Contract templates
- **contract_versions** - Version history
- **audit_logs** - Activity tracking

## API Endpoints

### Authentication
- POST `/api/auth/login` - User login
- POST `/api/auth/register` - Register service provider
- POST `/api/auth/logout` - User logout
- GET `/api/auth/me` - Get current user

### Contracts (Admin)
- GET `/api/contracts` - List all contracts
- POST `/api/contracts` - Create new contract
- GET `/api/contracts/:id` - Get contract details
- PUT `/api/contracts/:id` - Update contract
- DELETE `/api/contracts/:id` - Delete contract
- POST `/api/contracts/:id/send` - Send contract to provider

### Templates (Admin)
- GET `/api/templates` - List templates
- POST `/api/templates` - Create template
- PUT `/api/templates/:id` - Update template
- DELETE `/api/templates/:id` - Delete template

### Service Provider
- GET `/api/provider/contracts` - My contracts
- PUT `/api/provider/contracts/:id/sign` - Sign contract
- GET `/api/provider/contracts/:id/pdf` - Download PDF

## License

Proprietary - AHMED ESSA CONSTRUCTION & TRADING (AEMCO)
