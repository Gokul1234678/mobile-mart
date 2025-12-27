// ⭐ DELETE REVIEW (ADMIN ONLY)
app.delete(
  "/api/admin/products/:productId/reviews/:reviewId",
  // 🔐 Middleware → ensure user is logged in
  isAuthenticatedUser,
  // 🛡️ Middleware → allow only admin users
  isAdmin,
  // 🎯 Controller logic
  async (req, res) => {
    try {
      // ------------------------------------------------------------
      // 📥 1️⃣ Extract productId and reviewId from URL params
      // ------------------------------------------------------------
      const { productId, reviewId } = req.params;

      // ------------------------------------------------------------
      // 🔍 2️⃣ Find product by productId
      // ------------------------------------------------------------
      const product = await productModel.findById(productId);

      // ❌ If product does not exist
      if (!product) {
        return res.status(404).json({
          success: false,
          message: "Product not found"
        });
      }

      // ------------------------------------------------------------
      // 🔎 3️⃣ Find index of the review inside product.reviews array
      // ------------------------------------------------------------
      // → Compare each review _id with reviewId from URL
      const reviewIndex = product.reviews.findIndex(
        (r) => r._id.toString() === reviewId
      );

      // ❌ If review not found
      if (reviewIndex === -1) {
        return res.status(404).json({
          success: false,
          message: "Review not found"
        });
      }

      // ------------------------------------------------------------
      // 🗑️ 4️⃣ Remove the review from reviews array
      // ------------------------------------------------------------
      // → splice removes exactly one review at the found index
      product.reviews.splice(reviewIndex, 1);

      // ------------------------------------------------------------
      // 📊 5️⃣ Update review count and average rating
      // ------------------------------------------------------------
      // → Update total review count
      product.numOfReviews = product.reviews.length;

      // → Recalculate average rating
      // → If no reviews left, set rating to 0
      product.averageRating =
        product.reviews.length === 0
          ? 0
          : product.reviews.reduce((acc, r) => acc + r.rating, 0) /
            product.reviews.length;

      // ------------------------------------------------------------
      // 💾 6️⃣ Save updated product document
      // ------------------------------------------------------------
      await product.save();

      // ------------------------------------------------------------
      // ✅ 7️⃣ Send success response
      // ------------------------------------------------------------
      res.status(200).json({
        success: true,
        message: "Review deleted successfully"
      });

    } catch (error) {
      // ------------------------------------------------------------
      // ❌ 8️⃣ Handle server or unexpected errors
      // ------------------------------------------------------------
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
);
