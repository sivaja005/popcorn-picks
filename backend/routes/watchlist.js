const express = require("express")
const router = express.Router()

const auth = require("../middleware/authMiddleware")
const User = require("../models/User")
const { supabase } = require("../db")

// GET WATCHLIST
router.get("/", auth, async (req, res) => {
  try {
    const { data: watchlist, error } = await supabase
      .from("watchlist")
      .select("*")
      .eq("user_id", req.user.id)
      .order("created_at", { ascending: false })

    if (error) throw error
    return res.json(watchlist || [])
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: "Server error" })
  }
})

// ADD MOVIE
router.post("/add", auth, async (req, res) => {
  try {
    const { tmdbId, title, poster } = req.body
    
    if (!tmdbId || !title) {
      return res.status(400).json({ message: "Missing required fields" })
    }

    // Check if already exists
    const { data: exists, error: checkError } = await supabase
      .from("watchlist")
      .select("id")
      .eq("user_id", req.user.id)
      .eq("tmdb_id", tmdbId)
      .single()

    if (exists) {
      return res.json({ message: "Already added" })
    }

    const { data, error } = await supabase
      .from("watchlist")
      .insert([
        {
          user_id: req.user.id,
          tmdb_id: tmdbId,
          title,
          poster: poster || null,
          watched: false
        }
      ])
      .select()

    if (error) throw error
    res.json({ message: "Added to watchlist" })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: "Server error" })
  }
})

// TOGGLE WATCHED STATUS
router.post("/watched/:tmdbId", auth, async (req, res) => {
  try {
    const tmdbId = Number(req.params.tmdbId)

    // Get current watched status
    const { data: movie, error: getError } = await supabase
      .from("watchlist")
      .select("watched")
      .eq("user_id", req.user.id)
      .eq("tmdb_id", tmdbId)
      .single()

    if (getError || !movie) {
      return res.status(404).json({ message: "Movie not in watchlist" })
    }

    // Toggle watched status
    const { data: updated, error: updateError } = await supabase
      .from("watchlist")
      .update({ watched: !movie.watched })
      .eq("user_id", req.user.id)
      .eq("tmdb_id", tmdbId)
      .select()

    if (updateError) throw updateError
    res.json({ watched: updated[0].watched })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: "Server error" })
  }
})

// REMOVE MOVIE
router.delete("/remove/:tmdbId", auth, async (req, res) => {
  try {
    const tmdbId = Number(req.params.tmdbId)

    const { error } = await supabase
      .from("watchlist")
      .delete()
      .eq("user_id", req.user.id)
      .eq("tmdb_id", tmdbId)

    if (error) throw error
    res.json({ message: "Removed from watchlist" })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: "Server error" })
  }
})

module.exports = router