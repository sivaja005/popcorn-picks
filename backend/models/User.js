const { supabase } = require("../db")
const bcrypt = require("bcryptjs")

class User {
  // Create a new user
  static async create(userData) {
    const { username, email, password, profilePic = "" } = userData

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    const { data, error } = await supabase
      .from("users")
      .insert([
        {
          username,
          email: email.toLowerCase(),
          password: hashedPassword,
          profile_pic: profilePic
        }
      ])
      .select()

    if (error) throw error
    return data[0]
  }

  // Find user by email
  static async findByEmail(email) {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("email", email.toLowerCase())
      .single()

    if (error && error.code !== "PGRST116") throw error
    return data || null
  }

  // Find user by ID
  static async findById(id) {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", id)
      .single()

    if (error && error.code !== "PGRST116") throw error
    return data || null
  }

  // Find user by username
  static async findByUsername(username) {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("username", username)
      .single()

    if (error && error.code !== "PGRST116") throw error
    return data || null
  }

  // Update user profile
  static async updateProfile(id, updateData) {
    const { data, error } = await supabase
      .from("users")
      .update(updateData)
      .eq("id", id)
      .select()

    if (error) throw error
    return data[0]
  }

  // Verify password
  static async verifyPassword(inputPassword, hashedPassword) {
    return await bcrypt.compare(inputPassword, hashedPassword)
  }

  // Get user with watchlist
  static async getUserWithWatchlist(userId) {
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .single()

    if (userError) throw userError

    const { data: watchlist, error: watchlistError } = await supabase
      .from("watchlist")
      .select("*")
      .eq("user_id", userId)

    if (watchlistError) throw watchlistError

    return {
      ...user,
      watchlist: watchlist || []
    }
  }
}

module.exports = User