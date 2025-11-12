# AEMCO Contract Builder - Version 2.5

> Modern, professional contract management system with AI integration and dark mode

[![Status](https://img.shields.io/badge/status-production-success)](https://workspace.ahmed-essa.com)
[![Version](https://img.shields.io/badge/version-2.5-blue)](https://github.com/eHawking/contract.git)
[![License](https://img.shields.io/badge/license-proprietary-red)]()

---

## 🎨 What's New in v2.5

### ✨ Major Features

- **🌓 Dark Mode** - Beautiful light/dark theme with smooth transitions
- **👋 Welcome Screens** - Personalized greetings for admin and service providers
- **🎯 Modern UI/UX** - Professional design with smooth animations
- **📄 Contract Preview** - Preview, print, and share contracts before sending
- **♿ Accessibility** - Enhanced for all users, WCAG compliant

---

## 🚀 Quick Start

### For Server Deployment

```bash
# Clone repository
git clone https://github.com/eHawking/contract.git workspace.ahmed-essa.com
cd workspace.ahmed-essa.com

# Install dependencies
npm install
cd client && npm install && cd ..

# Configure environment
cp .env.example .env
nano .env  # Edit your database credentials

# Setup database
node server/setup-database.js
node server/update-database.js

# Build frontend
cd client && npm run build && cd ..

# Start application
NODE_ENV=production node server/index.js &
```

### Default Login

```
Admin Account:
Email: admin@ahmed-essa.com
Password: Admin@123456

⚠️ Change password after first login!
```

---

## 📦 Features

### For Administrators

- ✅ **Dashboard** - Overview of contracts and statistics
- ✅ **Contract Management** - Create, edit, send contracts
- ✅ **Template System** - Reusable contract templates
- ✅ **User Management** - Manage service providers
- ✅ **Settings** - Company details, email, AI configuration
- ✅ **Dark Mode** - Professional theme switching
- ✅ **Profile Management** - Update personal information and photo

### For Service Providers

- ✅ **Contract View** - Access assigned contracts
- ✅ **Digital Signing** - Sign contracts electronically
- ✅ **Progress Tracking** - Monitor contract status
- ✅ **Profile Management** - Update details and photo
- ✅ **Dark Mode** - Comfortable viewing experience

### AI Integration

- ✅ **Gemini AI** - Auto-generate contract content
- ✅ **Smart Templates** - AI-powered suggestions
- ✅ **Content Generation** - Quick contract creation

### UI/UX Highlights

- ✅ **Responsive Design** - Works on all devices
- ✅ **Smooth Animations** - Professional interactions
- ✅ **Intuitive Navigation** - Easy to use
- ✅ **Modern Components** - Beautiful and functional

---

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first styling
- **Zustand** - State management
- **Lucide React** - Modern icons
- **Sonner** - Toast notifications

### Backend
- **Node.js** - Runtime environment
- **Express** - Web framework
- **MariaDB** - Database
- **JWT** - Authentication
- **Multer** - File uploads
- **Gemini AI** - Content generation

---

## 📁 Project Structure

```
workspace.ahmed-essa.com/
├── client/                    # Frontend React application
│   ├── src/
│   │   ├── components/       # Reusable components
│   │   │   ├── Layout.jsx
│   │   │   ├── ThemeToggle.jsx
│   │   │   ├── WelcomeModal.jsx
│   │   │   └── ContractPreviewModal.jsx
│   │   ├── pages/            # Page components
│   │   │   ├── Login.jsx
│   │   │   ├── admin/
│   │   │   └── provider/
│   │   ├── store/            # State management
│   │   │   ├── useAuthStore.js
│   │   │   └── useThemeStore.js
│   │   ├── lib/              # Utilities
│   │   └── index.css         # Global styles
│   ├── public/               # Static assets
│   └── dist/                 # Build output
│
├── server/                    # Backend Node.js application
│   ├── routes/               # API routes
│   │   ├── auth.js
│   │   ├── contracts.js
│   │   ├── settings.js
│   │   └── profile.js
│   ├── middleware/           # Express middleware
│   ├── database.js           # Database connection
│   └── index.js              # Server entry point
│
├── uploads/                   # User uploaded files
│   ├── profiles/             # Profile photos
│   └── logos/                # Company logos
│
├── .env                       # Environment variables
├── .htaccess                 # Apache configuration
└── ecosystem.config.js       # PM2 configuration
```

---

## 🎨 Theme System

### Light Mode
- Clean, bright interface
- High contrast
- Professional appearance

### Dark Mode
- Easy on eyes
- Modern aesthetic
- Low-light friendly

### How It Works
- Click moon/sun icon to toggle
- Preference saved automatically
- Syncs across all pages
- Smooth transitions

---

## 🎯 Key Components

### 1. Layout Component
```jsx
// Sidebar navigation with theme toggle
- Logo and company name
- Navigation links
- User profile
- Theme toggle button
- Logout option
```

### 2. Welcome Modal
```jsx
// Personalized welcome screen
- Appears once per session
- Role-specific content
- Feature highlights
- Company branding
```

### 3. Contract Preview
```jsx
// Full contract preview with actions
- Preview before sending
- Print functionality
- Download PDF
- Share URL generation
- Edit option
```

### 4. Theme Toggle
```jsx
// Simple theme switcher
- Moon icon (light mode)
- Sun icon (dark mode)
- Instant switch
- Persistent preference
```

---

## 📱 Responsive Design

### Mobile (< 768px)
- Hamburger menu
- Full-screen navigation
- Touch-friendly buttons
- Optimized layouts

### Tablet (768px - 1024px)
- Adapted sidebar
- Two-column layouts
- Balanced spacing

### Desktop (> 1024px)
- Fixed sidebar
- Multi-column layouts
- Enhanced features
- Maximum efficiency

---

## 🔐 Security Features

- ✅ JWT authentication
- ✅ Password hashing (bcrypt)
- ✅ Role-based access control
- ✅ SQL injection prevention
- ✅ XSS protection
- ✅ CORS configuration
- ✅ Rate limiting
- ✅ Input validation
- ✅ Secure file uploads
- ✅ Audit logging

---

## 🚀 Deployment

### Prerequisites
- Node.js 16+
- MariaDB 10.6+
- Apache/Nginx
- PM2 (recommended)

### Steps
See [DEPLOY_GUIDE.md](DEPLOY_GUIDE.md) for detailed instructions.

Quick deploy:
```bash
git pull origin main
cd client && npm run build && cd ..
pm2 restart aemco-contracts
```

---

## 🐛 Troubleshooting

### Theme Not Working
- Clear browser cache
- Check localStorage
- Reload page

### Welcome Modal Issues
- Clear sessionStorage
- Logout and login again
- Check console errors

### Build Failures
```bash
cd client
rm -rf node_modules dist
npm install
npm run build
```

### Server Issues
```bash
# Check if running
ps aux | grep node

# Restart
pkill -f "node.*server"
NODE_ENV=production node server/index.js &
```

---

## 📚 Documentation

- **[DEPLOY_GUIDE.md](DEPLOY_GUIDE.md)** - Complete deployment guide
- **[.env.example](.env.example)** - Environment variables template
- **Component Files** - Inline documentation

---

## 🎓 Usage Examples

### Admin Workflow
1. Login with admin credentials
2. See welcome modal
3. Navigate to Contracts
4. Create new contract or use template
5. Preview before sending
6. Send to service provider

### Provider Workflow
1. Login with provider credentials
2. See welcome modal
3. View assigned contracts
4. Review contract details
5. Sign electronically

### Theme Usage
1. Click theme toggle (moon/sun)
2. Theme changes instantly
3. Preference saved
4. Applied across all pages

---

## 🔄 Updates & Maintenance

### Pull Latest Changes
```bash
git pull origin main
```

### Update Dependencies
```bash
npm update
cd client && npm update && cd ..
```

### Database Migrations
```bash
node server/update-database.js
```

---

## 📊 Version History

### v2.5 - November 2025 (Current)
- Dark mode theme system
- Welcome modals
- Modern UI/UX
- Contract preview
- Enhanced accessibility

### v2.0 - November 2025
- Admin settings
- Profile management
- Gemini AI integration
- File uploads

### v1.0 - Initial Release
- Contract management
- User authentication
- Template system
- Provider portal

---

## 📞 Support

### Contact
- **Email:** ahmed.Wasim@ahmed-essa.com
- **Company:** AHMED ESSA CONSTRUCTION & TRADING (AEMCO)
- **Address:** 6619, King Fahd Road, Dammam, 32243, Saudi Arabia
- **Phone:** +966 50 911 9859

### Repository
- **GitHub:** https://github.com/eHawking/contract.git
- **Branch:** main
- **Live Site:** https://workspace.ahmed-essa.com

---

## ✅ Status

- **Development:** ✅ Complete
- **Testing:** ✅ Complete
- **Deployment:** ✅ Ready
- **Production:** ✅ Live

---

## 📝 License

Proprietary - © 2025 AHMED ESSA CONSTRUCTION & TRADING (AEMCO)

All rights reserved. This software is proprietary and confidential.

---

**Built with ❤️ by the AEMCO Development Team**

*Last Updated: November 2025*
