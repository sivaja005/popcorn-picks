const { supabase } = require("../db")

class Review {
  // Create a new review
  static async create(reviewData) {
    const { tmdbId, userId, username, rating, reviewText } = reviewData

    const { data, error } = await supabase
      .from("reviews")
      .insert([
        {
          tmdb_id: tmdbId,
          user_id: userId,
          username,
          rating,
          review_text: reviewText
        }
      ])
      .select()

    if (error) throw error
    return data[0]
  }

  // Get all reviews for a movie
  static async getByTmdbId(tmdbId) {
    const { data, error } = await supabase
      .from("reviews")
      .select("*")
      .eq("tmdb_id", tmdbId)
      .order("created_at", { ascending: false })

    if (error) throw error
    return data || []
  }

  // Get all reviews by a user
  static async getByUserId(userId) {
    const { data, error } = await supabase
      .from("reviews")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    if (error) throw error
    return data || []
  }

  // Get a specific review
  static async findById(reviewId) {
    const { data, error } = await supabase
      .from("reviews")
      .select("*")
      .eq("id", reviewId)
      .single()

    if (error && error.code !== "PGRST116") throw error
    return data || null
  }

  // Delete a review
  static async deleteReview(reviewId) {
    const { error } = await supabase
      .from("reviews")
      .delete()
      .eq("id", reviewId)

    if (error) throw error
    return true
  }

  // Update a review
  static async updateReview(reviewId, updateData) {
    const { data, error } = await supabase
      .from("reviews")
      .update(updateData)
      .eq("id", reviewId)
      .select()

    if (error) throw error
    return data[0]
  }
}

module.exports = Review