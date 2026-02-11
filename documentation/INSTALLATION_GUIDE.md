# BarberApp - Installation & Setup Guide

## 🚀 Complete Setup in 30 Minutes

Follow these steps exactly to get your app running.

---

## STEP 1: Prerequisites (5 minutes)

Make sure you have installed:

- [x] Node.js (v18 or later)
- [x] npm or yarn
- [x] Expo Go app on your phone (iOS/Android)
- [x] A Supabase account (free at supabase.com)

Check your versions:
```bash
node --version  # Should be v18 or higher
npm --version   # Should be 8 or higher
```

---

## STEP 2: Project Setup (5 minutes)

### 2.1 Create Project Directory

```bash
# Create and enter project folder
mkdir barberapp
cd barberapp
```

### 2.2 Copy All Code Files

Copy all the files from the code package into your `barberapp` folder.

Your folder structure should look like:
```
barberapp/
├── package.json
├── tsconfig.json
├── app.json
├── .env.example
├── supabase-setup.sql
├── README.md
└── src/
    ├── components/
    ├── screens/
    ├── navigation/
    ├── services/
    ├── store/
    └── types/
```

### 2.3 Install Dependencies

```bash
npm install
```

This will install all required packages (~2-3 minutes).

---

## STEP 3: Supabase Setup (10 minutes)

### 3.1 Create Supabase Project

1. Go to https://supabase.com
2. Click "New Project"
3. Choose:
   - Name: "BarberApp"
   - Database Password: (save this!)
   - Region: Closest to you
   - Plan: Free
4. Wait for project to be created (~2 minutes)

### 3.2 Run Database Setup

1. In your Supabase project, click "SQL Editor" in the left sidebar
2. Click "New Query"
3. Open the file `supabase-setup.sql` from your project
4. Copy the ENTIRE content
5. Paste into Supabase SQL Editor
6. Click "Run" button (bottom right)
7. Wait for "Success" message

### 3.3 Verify Database

1. Click "Table Editor" in left sidebar
2. You should see these tables:
   - users
   - barbershops
   - employees
   - services
   - clients
   - appointments

If you see all 6 tables ✅ Success!

### 3.4 Get API Credentials

1. Click "Settings" (gear icon) → "API"
2. You'll see two important values:
   - **Project URL** (looks like: https://xxx.supabase.co)
   - **anon public key** (long string starting with "eyJ...")
3. Keep this tab open - you'll need these next!

---

## STEP 4: Environment Configuration (2 minutes)

### 4.1 Create .env File

```bash
# In your project root
cp .env.example .env
```

### 4.2 Add Your Credentials

Open `.env` file and replace with your actual values:

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-actual-anon-key-here
```

⚠️ **IMPORTANT**: 
- Don't include quotes around the values
- Make sure there are no spaces
- Use YOUR actual values from Supabase

---

## STEP 5: Start the App (3 minutes)

### 5.1 Start Development Server

```bash
npx expo start
```

You should see:
```
› Metro waiting on exp://192.168.x.x:8081
› Scan the QR code above with Expo Go (Android) or the Camera app (iOS)
```

### 5.2 Run on Your Phone

**Android:**
1. Open "Expo Go" app
2. Tap "Scan QR Code"
3. Point camera at QR code in terminal
4. Wait for app to load

**iOS:**
1. Open Camera app
2. Point at QR code in terminal
3. Tap notification to open in Expo Go
4. Wait for app to load

First load takes ~30-60 seconds. Be patient!

---

## STEP 6: Test the App (5 minutes)

### 6.1 Create Your First Account

1. App opens to Login screen
2. Tap "Create Account"
3. Fill in:
   - Name: Your name
   - Email: your@email.com
   - Password: at least 6 characters
   - Role: Choose "Owner" (to create barbershops)
4. Tap "Create Account"

### 6.2 Success!

If you see "Welcome [Your Name]!" screen → ✅ **IT WORKS!**

---

## 🎯 What to Do Next

Now you have a working app! Here's what you can build:

### As Owner:
- Create your barbershop
- Add services (haircut, beard trim, etc.)
- Add employees (barbers)
- Manage appointments

### As Barber:
- View your daily agenda
- Manage your appointments
- Update appointment status

### As Client:
- Search for barbershops
- Book appointments
- View your upcoming appointments

---

## 🐛 Troubleshooting

### "Missing Supabase environment variables"
→ Check your `.env` file:
  - Does it exist in project root?
  - Does it have the correct values?
  - No quotes around values?

**Fix:**
```bash
# Recreate .env file
rm .env
cp .env.example .env
# Then add your actual credentials
```

### "Could not connect to Supabase"
→ Verify your Supabase credentials:
  - Go to Supabase → Settings → API
  - Copy URL and key again
  - Make sure they match .env file exactly

### "Policy violation" or "Permission denied"
→ Database wasn't set up correctly:
  - Go back to Supabase SQL Editor
  - Run `supabase-setup.sql` again completely

### App won't start / Metro bundler error
→ Clear cache and reinstall:
```bash
# Stop the server (Ctrl+C)
rm -rf node_modules
npm install
npx expo start -c
```

### "Network request failed" on phone
→ Make sure phone and computer are on same WiFi network

### TypeScript errors
→ Restart TypeScript server:
```bash
# If using VSCode:
# Press Cmd+Shift+P (Mac) or Ctrl+Shift+P (Windows)
# Type: "Restart TS Server"
# Press Enter
```

---

## 📱 Testing on Different Devices

### Web (for quick testing)
```bash
npx expo start --web
```

Opens in your browser at http://localhost:19006

### iOS Simulator (Mac only)
```bash
npx expo start --ios
```

Requires Xcode installed.

### Android Emulator
```bash
npx expo start --android
```

Requires Android Studio installed.

**Recommendation**: Stick with Expo Go on your phone for easiest development!

---

## ✅ Setup Checklist

Before considering setup "complete", verify:

- [ ] Node.js and npm installed
- [ ] Project created and dependencies installed
- [ ] Supabase project created
- [ ] Database tables created (6 tables visible)
- [ ] .env file created with correct credentials
- [ ] App starts without errors
- [ ] Can create account
- [ ] Welcome screen shows after signup

If all checked ✅ → You're ready to build features!

---

## 🎉 Congratulations!

You now have:
- ✅ Complete backend (database + API)
- ✅ Authentication working
- ✅ App running on your phone
- ✅ Foundation for all features

**Total setup time**: ~30 minutes
**Lines of code ready**: ~5,000+
**Features ready to build**: All of them!

---

## 🚀 Next Steps

Choose what to build next:

### Option 1: Build Owner Features
- Create barbershop form
- Service management
- Employee management
- Agenda view

### Option 2: Build Client Features  
- Search barbershops
- Book appointments
- View my appointments

### Option 3: Build Barber Features
- View my schedule
- Manage my appointments

Tell me which you want and I'll give you the exact screens to create!

---

## 📞 Need Help?

If stuck:
1. Re-read the error message carefully
2. Check Supabase logs (Database → Logs)
3. Verify .env file
4. Try the troubleshooting steps above
5. Start fresh if needed (it's only 30 minutes!)

Remember: Every developer encounters setup issues. It's normal! 💪
