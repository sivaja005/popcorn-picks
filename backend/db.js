const { createClient } = require("@supabase/supabase-js")
const path = require("path")

require("dotenv").config({ path: path.join(__dirname, ".env") })

// Supabase connection
const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_KEY

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("ERROR: SUPABASE_URL and SUPABASE_KEY are not set in .env")
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

// Initialize database connection
async function connectDb() {
  try {
    // Test connection by querying users table
    const { error } = await supabase.from('users').select('count', { count: 'exact', head: true })
    
    if (error && error.code !== 'PGRST116') {
      // PGRST116 means table doesn't exist yet, which is fine on first run
      throw error
    }
    
    console.log("✓ Supabase connected successfully")
    return true
  } catch (err) {
    console.error("✗ Supabase connection error:", err.message)
    process.exit(1)
  }
}

module.exports = {
  supabase,
  connectDb
}
