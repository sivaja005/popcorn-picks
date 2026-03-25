# MongoDB to Supabase Migration Guide

## Step 1: Create Database Tables in Supabase

1. Go to your **Supabase Dashboard**: https://app.supabase.com
2. Select your **popcorn-picks-db** project
3. Click **SQL Editor** (left sidebar)
4. Click **New query**
5. Copy and paste the contents of `backend/supabase-schema.sql`
6. Click **Run**

The tables should now be created! ✅

## Step 2: Environment Variables

Your `.env` file now has:
```
SUPABASE_URL=https://vkezkoijvzalwvglrpwi.supabase.co
SUPABASE_KEY=eyJhbGc...
JWT_SECRET=secret123
TMDB_KEY=...
OMDB_KEY=...
XMDB_KEY=...
```

## Step 3: What Changed in the Backend

### Old (MongoDB with Mongoose)
```javascript
const User = require("../models/User")
const user = new User({ username, email, password })
await user.save()
```

### New (PostgreSQL with Supabase)
```javascript
const User = require("../models/User")
const user = await User.create({ username, email, password })
```

**Files Updated:**
- ✅ `db.js` - Now uses Supabase instead of Mongoose
- ✅ `models/User.js` - Class-based methods for Supabase
- ✅ `models/Review.js` - Class-based methods for Supabase
- ✅ `routes/auth.js` - Updated to use new User model
- ✅ `routes/reviews.js` - Updated to use new Review model
- ✅ `routes/watchlist.js` - Now uses separate watchlist table
- ✅ `package.json` - Removed mongoose, added @supabase/supabase-js

## Step 4: Test Locally (Optional)

If you want to test locally before deploying:
```bash
cd backend
npm start
```

The server should start without MongoDB errors!

## Step 5: Deploy to Render

Your backend is now ready for Render deployment:
1. The code is compatible with Render
2. Environment variables are set in `.env`
3. Supabase credentials are configured
4. Just push to GitHub and deploy!

## Rollback to MongoDB (If Needed)

If you need to go back to MongoDB:
1. Revert the changes from Git history
2. Restore `MONGO_URI` in `.env`
3. Run `npm install mongoose`
4. Redeploy

---

**Next Steps:**
1. ✅ Create tables in Supabase (Step 1 above)
2. ✅ Push to GitHub
3. ✅ Deploy to Render

Good luck! 🚀
