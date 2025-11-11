# Quick Start Guide - AEMCO Contract Builder

## 🚀 Installation (Development)

### Prerequisites
- Node.js 24.11.0
- MariaDB 10.11.13

### 1. Clone & Install
```bash
# Install all dependencies
npm run install:all
```

### 2. Configure Environment
```bash
# Copy example env file
cp .env.example .env

# Edit .env with your database credentials
# Minimum required:
# DB_HOST=localhost
# DB_USER=your_user
# DB_PASSWORD=your_password
# DB_NAME=aemco_contracts
# JWT_SECRET=your_secret_key_min_32_characters
```

### 3. Setup Database
```bash
node server/setup-database.js
```

### 4. Start Development Server
```bash
npm run dev
```

This starts:
- Backend API: http://localhost:3000
- Frontend: http://localhost:5173

## 📋 Default Login

**Admin Account:**
- Email: `admin@ahmed-essa.com`
- Password: `Admin@123456`

⚠️ **Change password after first login!**

## 🎯 Key Features

### For Administrators:
1. **Dashboard** - Overview of all contracts and providers
2. **Contract Management** - Create, edit, send contracts
3. **Templates** - Pre-built contract templates
4. **Service Providers** - Manage provider accounts

### For Service Providers:
1. **Dashboard** - View contract statistics
2. **My Contracts** - View assigned contracts
3. **Sign Contracts** - Electronically sign contracts
4. **Download** - Download contract PDFs

## 📝 Usage Workflow

### Creating a Contract

1. **Login as Admin**
2. Go to **Contracts** → **Create Contract**
3. Select **Service Provider**
4. Choose a **Template** (optional)
5. Fill in **Contract Details**
6. Add **Contract Content** (HTML supported)
7. **Save as Draft** or **Save & Send**

### Service Provider Signs Contract

1. **Provider receives contract**
2. Provider **logs in**
3. Views **contract details**
4. **Signs contract** electronically
5. Can **download PDF** copy

### Using Templates

1. Go to **Templates** → **Create Template**
2. Enter **template name** and **description**
3. Add **template content** with placeholders:
   - `{{provider_name}}`
   - `{{amount}}`
   - `{{start_date}}`
   - `{{end_date}}`
   - etc.
4. **Save template**
5. Use when creating contracts

## 🗂️ Project Structure

```
aemco-contract-builder/
├── server/               # Backend
│   ├── index.js         # Main server file
│   ├── database.js      # Database connection
│   ├── routes/          # API routes
│   │   ├── auth.js
│   │   ├── contracts.js
│   │   ├── templates.js
│   │   ├── users.js
│   │   └── provider.js
│   └── middleware/      # Auth & validation
│
├── client/              # Frontend
│   ├── src/
│   │   ├── pages/      # Page components
│   │   │   ├── admin/  # Admin pages
│   │   │   └── provider/ # Provider pages
│   │   ├── components/ # Reusable components
│   │   ├── lib/        # API client
│   │   └── store/      # State management
│   └── dist/           # Built files
│
├── .env                # Environment config
└── package.json        # Dependencies
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Register provider
- `GET /api/auth/me` - Current user

### Admin - Contracts
- `GET /api/contracts` - List contracts
- `POST /api/contracts` - Create contract
- `PUT /api/contracts/:id` - Update contract
- `POST /api/contracts/:id/send` - Send to provider

### Admin - Templates
- `GET /api/templates` - List templates
- `POST /api/templates` - Create template
- `PUT /api/templates/:id` - Update template

### Provider
- `GET /api/provider/contracts` - My contracts
- `POST /api/provider/contracts/:id/sign` - Sign contract
- `GET /api/provider/dashboard/stats` - Statistics

## 🛠️ Development Commands

```bash
# Start development
npm run dev

# Start backend only
npm run server

# Start frontend only
npm run client

# Build for production
npm run build

# Start production server
npm start
```

## 🐛 Troubleshooting

### Database Connection Failed
- Check MariaDB is running
- Verify credentials in `.env`
- Ensure database exists

### Port Already in Use
```bash
# Kill process on port 3000
npx kill-port 3000

# Or use different port in .env
PORT=3001
```

### Frontend Not Loading
```bash
# Clear and rebuild
cd client
rm -rf node_modules dist
npm install
npm run build
```

## 📞 Support

**AHMED ESSA CONSTRUCTION & TRADING (AEMCO)**
- Address: 6619, King Fahd Road, Dammam, 32243, Saudi Arabia
- Phone: +966 50 911 9859
- Email: ahmed.Wasim@ahmed-essa.com
- Website: ahmed-essa.com
