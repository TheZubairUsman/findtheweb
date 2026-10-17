# FindTheWeb - Admin-Only Authentication System

## Overview

FindTheWeb has been refactored to use a simplified admin-only authentication system. All user account features have been removed, and the platform now operates with a single admin authentication approach using email and password only.

## Key Changes Made

### Frontend Changes
- ✅ Removed all user registration, login, and profile pages
- ✅ Created new `AdminLogin.jsx` component for admin authentication
- ✅ Updated `App.jsx` routing to remove user auth routes
- ✅ Simplified `ProtectedRoute.jsx` to admin-only access
- ✅ Updated `AdminDashboard.jsx` to remove user-related functionality
- ✅ Modified `WebsiteManager.jsx` to use admin token authentication
- ✅ Updated `useAuth.jsx` hook for admin-only authentication

### Backend Changes
- ✅ Created new `Admin.js` model with simplified authentication
- ✅ Removed complex `User.js` model
- ✅ Updated `index.js` with admin-only authentication middleware
- ✅ Simplified API endpoints to require admin authentication
- ✅ Added database initialization with default admin account

## Admin Credentials

**Default Admin Account:**
- Email: `admin@findtheweb.com`
- Password: set only through the server-side `ADMIN_PASSWORD` environment variable

⚠️ **Important:** Use a unique long password and store it only in the server environment.

## Getting Started

### 1. Backend Setup

```bash
cd backend
npm install
npm run dev
```

The backend will:
- Initialize the database automatically
- Create the default admin account if it doesn't exist
- Start the API server on port 5000

### 2. Frontend Setup

```bash
npm install
npm run dev
```

The frontend will start on port 3000.

### 3. Admin Access

1. Navigate to `http://localhost:3000/admin/login`
2. Use the default credentials above
3. Access the admin dashboard at `http://localhost:3000/admin`

## Admin Features

### Admin Dashboard
- Website statistics and analytics
- Recent activity overview
- Quick access to management tools
- Logout functionality

### Website Management
- Add, edit, and delete websites
- Tier management (Standard, Premium, Enterprise)
- Status management (Active, Inactive, Pending)
- Bulk operations support
- Search and filtering capabilities

### Authentication Features
- Secure JWT token-based authentication
- Login attempt tracking and account locking
- Password hashing with bcrypt
- Token refresh functionality
- Session management

## API Endpoints

### Authentication
- `POST /api/v1/auth/admin/login` - Admin login
- `POST /api/v1/auth/admin/refresh` - Token refresh

### Websites (Admin Protected)
- `GET /api/v1/websites` - List all websites
- `GET /api/v1/websites/:id` - Get specific website
- `POST /api/v1/websites` - Create new website
- `PUT /api/v1/websites/:id` - Update website
- `DELETE /api/v1/websites/:id` - Delete website

### Admin Stats
- `GET /api/v1/admin/stats` - Dashboard statistics

## Database Schema

### Admin Model
```javascript
{
  id: UUID (Primary Key),
  email: String (Unique),
  password: String (Hashed),
  name: String,
  lastLogin: Date,
  loginAttempts: Integer,
  lockUntil: Date,
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

## Security Features

### Password Security
- Passwords hashed using bcrypt with salt rounds of 12
- Minimum password requirements enforced

### Account Protection
- Login attempt tracking
- Account locking after 5 failed attempts
- 2-hour lockout period for security

### Token Security
- JWT tokens with configurable expiration
- Secure token storage in localStorage
- Automatic token refresh capability

## Environment Variables

Create a `.env` file in the backend directory:

```env
JWT_SECRET=your-super-secure-jwt-secret-key
JWT_EXPIRES_IN=24h
NODE_ENV=development
```

## File Structure Changes

### Removed Files
- `src/pages/auth/Login.jsx` (old user login)
- `src/pages/auth/Register.jsx` (user registration)
- `src/pages/auth/Profile.jsx` (user profile)
- `backend/src/models/User.js` (complex user model)

### New Files
- `src/pages/AdminLogin.jsx` (admin login)
- `backend/src/models/Admin.js` (simplified admin model)
- `ADMIN_SETUP.md` (this documentation)

### Modified Files
- `src/App.jsx` - Updated routing
- `src/hooks/useAuth.jsx` - Admin-only authentication
- `src/components/ProtectedRoute.jsx` - Admin access only
- `src/components/admin/AdminDashboard.jsx` - Simplified dashboard
- `src/components/admin/WebsiteManager.jsx` - Admin token usage
- `backend/src/index.js` - Admin authentication system

## Troubleshooting

### Backend Issues
- Ensure PostgreSQL/SQLite database is accessible
- Check that all dependencies are installed
- Verify environment variables are set correctly

### Frontend Issues
- Clear localStorage if experiencing auth issues
- Ensure backend is running on port 5000
- Check browser console for API errors

### Authentication Issues
- Use correct admin credentials
- Check if account is locked due to failed attempts
- Verify JWT token is being stored properly

## Production Deployment

### Security Checklist
- [ ] Change default admin password
- [ ] Set strong JWT_SECRET in environment
- [ ] Use HTTPS in production
- [ ] Configure proper CORS settings
- [ ] Set up database backups
- [ ] Monitor login attempts and security logs

### Environment Setup
- Set `NODE_ENV=production`
- Configure production database
- Set secure JWT secret
- Enable HTTPS
- Configure proper logging

## Support

For issues or questions regarding the admin authentication system:
1. Check the troubleshooting section above
2. Review the browser console and server logs
3. Ensure all dependencies are properly installed
4. Verify database connectivity

---

**Note:** This system is designed for single-admin use. For multi-admin scenarios, additional features like role management and admin user creation would need to be implemented.
