const express = require("express")
const router = express.Router()

const auth = require("../middleware/authMiddleware")
const Review = require("../models/Review")
const User = require("../models/User")
const { supabase } = require("../db")

// ADD / UPDATE REVIEW
router.post("/add", auth, async (req, res) => {
  try {
    const { tmdbId, rating, reviewText } = req.body

    if (!tmdbId || !reviewText) {
      return res.status(400).json({ message: "Missing required fields" })
    }

    // Get user for username
    const user = await User.findById(req.user.id)
    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    // Check if review already exists
    const { data: existing, error: checkError } = await supabase
      .from("reviews")
      .select("*")
      .eq("tmdb_id", Number(tmdbId))
      .eq("user_id", req.user.id)
      .single()

    if (existing) {
      // Update existing review
      const { data: updated, error: updateError } = await supabase
        .from("reviews")
        .update({
          rating,
          review_text: reviewText,
          created_at: new Date().toISOString()
        })
        .eq("id", existing.id)
        .select()

      if (updateError) throw updateError
      return res.json({ message: "Review updated" })
    }

    // Create new review
    const newReview = await Review.create({
      tmdbId: Number(tmdbId),
      userId: req.user.id,
      username: user.username,
      rating,
      reviewText
    })

    res.json({ message: "Review added" })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: "Server error" })
  }
})

// GET REVIEWS
router.get("/:tmdbId", async (req, res) => {
  try {
    const reviews = await Review.getByTmdbId(Number(req.params.tmdbId))
    res.json(reviews)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: "Server error" })
  }
})

module.exports = router