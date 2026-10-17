# Login Troubleshooting Guide

## Issue: Login redirects back to login page

This usually indicates an authentication problem. Follow these steps to debug:

## Step 1: Check Backend Server

1. **Start the backend server:**
   ```bash
   cd backend
   npm run dev
   ```

2. **Verify the server is running:**
   - You should see: `Server running on port 5000`
   - Check: http://localhost:5000/api/v1/admin/dashboard

## Step 2: Set Up Database and Admin User

1. **Run database migrations:**
   ```bash
   cd backend
   npx sequelize-cli db:migrate
   ```

2. **Create admin user:**
   ```bash
   cd backend
   npx sequelize-cli db:seed --seed 20241201000004-create-admin-user.js
   ```

3. **Verify admin user was created:**
   - Check the console output for "Admin user created successfully"
   - Default credentials:
     - Email: `admin@findtheweb.com`
     - Password: the value configured in the server-side `ADMIN_PASSWORD`

## Step 3: Check Environment Variables

1. **Create `.env` file in root directory:**
   ```env
   VITE_API_URL=http://localhost:5000/api/v1
   ```

2. **Create `backend/.env` file:**
   ```env
   NODE_ENV=development
   PORT=5000
   JWT_SECRET=your-super-secret-jwt-key-here-make-it-long-and-random
   JWT_EXPIRES_IN=7d
   CLIENT_URL=http://localhost:3000
   ```

## Step 4: Test Backend API

Run the debug script to test the backend:

```bash
node debug-login.js
```

This will test:
- Backend connectivity
- Admin login functionality
- Response format

## Step 5: Check Frontend Console

1. **Open browser developer tools (F12)**
2. **Go to Console tab**
3. **Try logging in**
4. **Look for these debug messages:**
   - `🔐 Attempting login with:`
   - `📋 Login result:`
   - `✅ Login successful, redirecting...` or `❌ Login failed:`

## Step 6: Common Issues and Solutions

### Issue: "Cannot connect to server"
**Solution:** Backend server is not running
- Start backend: `cd backend && npm run dev`
- Check port 5000 is not in use

### Issue: "Invalid email or password"
**Solution:** Admin user doesn't exist
- Run the admin seeder: `cd backend && npx sequelize-cli db:seed --seed 20241201000004-create-admin-user.js`
- Use the admin email and password configured in the server environment.

### Issue: "Network error"
**Solution:** CORS or network configuration
- Check `VITE_API_URL` in frontend `.env`
- Verify backend is running on port 5000
- Check browser console for CORS errors

### Issue: Login succeeds but redirects back
**Solution:** Token verification failing
- Check JWT_SECRET is set in backend `.env`
- Clear browser localStorage
- Check token format in browser dev tools

## Step 7: Manual Database Check

If using SQLite, check the database directly:

```bash
cd backend
npx sequelize-cli db:seed:undo:all  # Remove all seeders
npx sequelize-cli db:seed:all       # Run all seeders
```

## Step 8: Reset Everything

If nothing works, reset the entire setup:

1. **Stop all servers**
2. **Delete database:**
   ```bash
   cd backend
   rm -f data/database.sqlite
   ```
3. **Recreate everything:**
   ```bash
   cd backend
   npx sequelize-cli db:migrate
   npx sequelize-cli db:seed:all
   ```
4. **Start servers:**
   ```bash
   # Terminal 1 - Backend
   cd backend && npm run dev
   
   # Terminal 2 - Frontend  
   npm run dev
   ```

## Debug Information

When reporting issues, include:
1. Backend console output
2. Frontend console output
3. Network tab in browser dev tools
4. Environment variables (without secrets)
5. Database status

## Quick Test Commands

```bash
# Test backend health
curl http://localhost:5000/api/v1/admin/dashboard

# Test admin login
curl -X POST http://localhost:5000/api/v1/auth/admin/login \
  -H "Content-Type: application/json" \
  -d '{"email":"YOUR_ADMIN_EMAIL","password":"YOUR_ADMIN_PASSWORD"}'
```
