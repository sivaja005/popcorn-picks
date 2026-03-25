const express = require("express")
const User = require("../models/User")
const auth = require("../middleware/authMiddleware")
const jwt = require("jsonwebtoken")

const router = express.Router()

const isValidEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return re.test(email)
}

// Register a new user
router.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body

    if (!username || !email || !password) {
      return res.status(400).json({ message: "Please provide all fields" })
    }

    // Validate email format
    if (!isValidEmail(email)) {
      return res.status(400).json({ message: "Please provide a valid email address" })
    }

    // Check if email already exists
    const existing = await User.findByEmail(email)
    if (existing) {
      return res.status(400).json({ message: "Email already in use" })
    }

    // Create new user
    const user = await User.create({
      username,
      email: email.toLowerCase(),
      password,
      profilePic: ""
    })

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    )

    res.json({ token, username: user.username })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: "Server error" })
  }
})

// Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ message: "Please provide all fields" })
    }

    // Validate email format
    if (!isValidEmail(email)) {
      return res.status(400).json({ message: "Please provide a valid email address" })
    }

    // Find user by email
    const user = await User.findByEmail(email)

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" })
    }

    // Check password
    const isMatch = await User.verifyPassword(password, user.password)
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" })
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    )

    res.json({ token, username: user.username })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: "Server error" })
  }
})

// Get current user profile
router.get("/me", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
    if (!user) return res.status(404).json({ message: "User not found" })
    
    res.json({
      username: user.username,
      email: user.email,
      profilePic: user.profile_pic
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: "Server error" })
  }
})

// Update profile info (username + profile picture)
router.put("/me", auth, async (req, res) => {
  try {
    const { username, profilePic } = req.body

    const user = await User.findById(req.user.id)
    if (!user) return res.status(404).json({ message: "User not found" })

    const updateData = {}
    if (username) updateData.username = username
    if (typeof profilePic === "string") updateData.profile_pic = profilePic

    const updated = await User.updateProfile(req.user.id, updateData)

    res.json({ username: updated.username, profilePic: updated.profile_pic })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: "Server error" })
  }
})

// Change password
router.post("/change-password", auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Please provide both current and new passwords" })
    }

    const user = await User.findById(req.user.id)
    if (!user) return res.status(404).json({ message: "User not found" })

    const isMatch = await User.verifyPassword(currentPassword, user.password)
    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect" })
    }

    const bcrypt = require("bcryptjs")
    const hashedPassword = await bcrypt.hash(newPassword, 10)
    
    await User.updateProfile(req.user.id, { password: hashedPassword })

    res.json({ message: "Password updated" })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: "Server error" })
  }
})

// Delete account
router.delete("/delete", auth, async (req, res) => {
  try {
    const { supabase } = require("../db")
    
    // Delete user and all related data (cascades automatically)
    const { error } = await supabase
      .from("users")
      .delete()
      .eq("id", req.user.id)

    if (error) throw error
    
    res.json({ message: "Account deleted" })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: "Server error" })
  }
})

module.exports = router
