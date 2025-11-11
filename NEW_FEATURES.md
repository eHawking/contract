# New Features Guide - AEMCO Contract Builder

## 🎉 What's New

### Admin Features
1. **Settings Management** - Complete system configuration
2. **Company Logo Upload** - Customize branding
3. **Email Configuration** - SMTP settings for notifications
4. **Gemini AI Integration** - Auto-generate contract content
5. **Profile Management** - Update admin profile and photo

### Service Provider Features
1. **Profile Management** - Update personal information
2. **Profile Photo Upload** - Add profile picture
3. **Password Change** - Security management
4. **Company Details** - Manage company information

---

## 📋 Setup Instructions

### Step 1: Update Database Schema

Run this command on your server:

```bash
cd ~/workspace.ahmed-essa.com
node server/update-database.js
```

This will:
- Create `settings` table for system configuration
- Create `uploads` table for file tracking
- Add `profile_photo`, `phone`, and `address` columns to `users` table
- Insert default settings

### Step 2: Create Uploads Directory

```bash
mkdir -p ~/workspace.ahmed-essa.com/uploads
mkdir -p ~/workspace.ahmed-essa.com/uploads/profiles
chmod -R 755 ~/workspace.ahmed-essa.com/uploads
```

### Step 3: Restart Application

Via Plesk:
- Go to Node.js settings
- Click "Restart App"

Or manually:
```bash
pkill -f "node.*server/index.js"
cd ~/workspace.ahmed-essa.com
NODE_ENV=production node server/index.js &
```

---

## 🔧 Admin Features Guide

### 1. Settings Management

**Access:** Admin Dashboard → Settings

#### Company Details Tab
- Upload company logo (PNG, JPG, SVG up to 5MB)
- Edit company name, address, phone, email, website
- Changes reflect across the entire application

#### Email Settings Tab
Configure SMTP for sending email notifications:
- **SMTP Host:** Your mail server (e.g., mail.ahmed-essa.com)
- **SMTP Port:** Usually 587 for TLS or 465 for SSL
- **SMTP Username:** Email account username
- **SMTP Password:** Email account password
- **From Name:** Display name for sent emails
- **From Email:** Sender email address

#### AI Settings Tab
Enable AI-powered content generation:
- **Enable AI Features:** Toggle AI functionality
- **Gemini API Key:** Get from [Google AI Studio](https://makersuite.google.com/app/apikey)
- **Model Selection:**
  - Gemini 1.5 Pro (Latest) - Best quality
  - Gemini 1.5 Flash (Latest) - Faster responses
  - Gemini Pro - Standard model

**How AI Works:**
- Automatically generate contract content based on details
- Fill templates with relevant clauses
- Suggest professional contract language
- Generate content for specific contract types

**Example Prompt:**
```
Generate a professional service provider agreement for construction services,
including scope of work, payment terms, and termination clauses.
```

### 2. Profile Management

**Access:** Admin Dashboard → Profile

- Upload profile photo (JPG, PNG up to 2MB)
- Update name, email, phone, address
- Change password
- All changes saved securely

---

## 👤 Service Provider Features Guide

### 1. Profile Management

**Access:** Provider Dashboard → Profile

#### Profile Information
- Upload profile photo
- Update personal details:
  - Full name
  - Email address
  - Phone number
  - Personal address
  - Company name
  - Company address

#### Change Password
- Enter current password
- Set new password (minimum 8 characters)
- Confirm new password
- Secure password hashing

---

## 🤖 Using Gemini AI for Content Generation

### Setup Gemini API

1. **Get API Key:**
   - Visit https://makersuite.google.com/app/apikey
   - Sign in with Google account
   - Create new API key
   - Copy the key

2. **Configure in Settings:**
   - Go to Admin → Settings → AI Settings
   - Paste API key
   - Select preferred model
   - Enable AI features

### Generate Contract Content

When creating/editing contracts or templates:

1. **Auto-Generate Button** will appear if AI is enabled
2. Click to open AI prompt dialog
3. Describe what content you need:
   ```
   Create a subcontractor agreement for HVAC installation work,
   including warranty terms and safety requirements.
   ```
4. AI generates professional content
5. Review and edit as needed
6. Insert into contract/template

### Best Practices for AI Prompts

**Good Prompts:**
- "Generate payment terms for a construction contract with 30% upfront, 50% on milestone completion, and 20% on project completion"
- "Create a termination clause that allows either party to terminate with 30 days notice"
- "Write a scope of work section for electrical installation in a commercial building"

**Tips:**
- Be specific about requirements
- Mention relevant details (amounts, timelines, etc.)
- Review and customize AI-generated content
- Ensure compliance with local laws

---

## 📸 File Upload Guidelines

### Company Logo
- **Formats:** PNG, JPG, SVG, GIF
- **Max Size:** 5 MB
- **Recommended:** 400x400px, transparent background
- **Used in:** Headers, emails, PDFs

### Profile Photos
- **Formats:** JPG, JPEG, PNG
- **Max Size:** 2 MB
- **Recommended:** Square ratio, minimum 200x200px
- **Display:** Circular crop

---

## 🔐 Security Features

### Password Requirements
- Minimum 8 characters
- Recommended: Mix of letters, numbers, symbols
- Hashed using bcrypt
- Must change default admin password

### File Upload Security
- File type validation
- Size limits enforced
- Unique filenames
- Secure storage location

### Access Control
- Admin-only access to Settings
- Users can only modify their own profiles
- Role-based permissions

---

## 🌐 API Endpoints (New)

### Settings API
```
GET    /api/settings              - Get all settings (admin only)
GET    /api/settings/public       - Get public settings
PUT    /api/settings              - Update settings (admin only)
POST   /api/settings/upload-logo  - Upload company logo
POST   /api/settings/ai/generate-content - Generate AI content
```

### Profile API
```
GET    /api/profile               - Get current user profile
PUT    /api/profile               - Update profile
POST   /api/profile/change-password - Change password
POST   /api/profile/upload-photo  - Upload profile photo
DELETE /api/profile/photo         - Delete profile photo
```

---

## 📊 Database Schema Updates

### New Tables

#### `settings`
```sql
- id (INT, PK, AUTO_INCREMENT)
- setting_key (VARCHAR, UNIQUE)
- setting_value (TEXT)
- setting_type (VARCHAR) - text, file, password, boolean, number
- updated_by (INT, FK to users)
- updated_at (TIMESTAMP)
```

#### `uploads`
```sql
- id (INT, PK, AUTO_INCREMENT)
- file_name (VARCHAR)
- file_path (VARCHAR)
- file_type (VARCHAR)
- file_size (INT)
- uploaded_by (INT, FK to users)
- upload_type (VARCHAR) - logo, profile_photo, document
- created_at (TIMESTAMP)
```

### Updated Tables

#### `users`
```sql
- profile_photo (VARCHAR) - NEW
- phone (VARCHAR) - NEW
- address (TEXT) - NEW
```

---

## 🎨 Frontend Pages (New)

### Admin Pages
- **/admin/settings** - System settings management
- **/admin/profile** - Admin profile page

### Provider Pages
- **/provider/profile** - Provider profile page

### Shared Components
- Profile photo upload component
- Password change form
- AI content generator dialog

---

## 🚀 Deployment Checklist

- [ ] Run `node server/update-database.js`
- [ ] Create uploads directories with correct permissions
- [ ] Upload new server files
- [ ] Rebuild frontend: `cd client && npm run build`
- [ ] Restart Node.js application
- [ ] Test Settings page (upload logo)
- [ ] Test Profile page (upload photo)
- [ ] Configure Gemini API key (if using AI)
- [ ] Test AI content generation
- [ ] Update email SMTP settings
- [ ] Change default admin password

---

## 🔍 Troubleshooting

### File Upload Issues

**Problem:** "Failed to upload file"
- Check uploads directory exists
- Verify permissions: `chmod -R 755 uploads`
- Check file size and format

**Problem:** Uploaded images not displaying
- Verify `/uploads` path is served by server
- Check file paths in database
- Ensure images are in correct folder

### AI Generation Issues

**Problem:** "Gemini API key not configured"
- Go to Settings → AI Settings
- Enter valid API key
- Enable AI features

**Problem:** "Failed to generate content"
- Check API key is correct
- Verify internet connection
- Check Gemini API quota/limits

### Settings Not Saving

**Problem:** Settings don't persist
- Check database connection
- Verify admin permissions
- Check browser console for errors

---

## 💡 Usage Examples

### Example 1: Customizing Company Branding

1. Login as admin
2. Go to Settings → Company Details
3. Upload logo (400x400px PNG with transparent background)
4. Update company name, address, contact details
5. Save changes
6. Logo now appears in contracts and emails

### Example 2: Generating Contract Content with AI

1. Enable AI in Settings
2. Create/edit a contract
3. Click "Generate with AI" button
4. Enter prompt: "Create warranty terms for construction work, 1 year warranty on workmanship, 2 years on materials"
5. Review generated content
6. Insert into contract

### Example 3: Provider Updates Profile

1. Provider logs in
2. Goes to Profile
3. Uploads profile photo
4. Updates company address and phone
5. Saves changes
6. Information visible on signed contracts

---

## 📞 Support

For questions or issues:
- Email: ahmed.Wasim@ahmed-essa.com
- Phone: +966 50 911 9859

---

## 📝 Changelog

### Version 2.0 - New Features
- ✅ Admin settings management
- ✅ Company logo upload
- ✅ Email configuration
- ✅ Gemini AI integration
- ✅ Profile management for all users
- ✅ Profile photo uploads
- ✅ Password change functionality
- ✅ Enhanced user experience

---

**AHMED ESSA CONSTRUCTION & TRADING (AEMCO)**  
Contract Builder Application  
© 2024 All Rights Reserved
