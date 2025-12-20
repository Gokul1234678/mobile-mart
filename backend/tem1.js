// ✅ Get My Orders (Logged-in User)
app.get("/api/orders/my", isAuthenticatedUser, async (req, res) => {
  try {
    // ------------------------------------------------------------
    // 1️⃣ Find orders of logged-in user
    // ------------------------------------------------------------
    const orders = await orderModel
      .find({ user: req.user._id })
      .sort({ createdAt: -1 }); // latest orders first

    // ------------------------------------------------------------
    // 2️⃣ Success response
    // ------------------------------------------------------------
    res.status(200).json({
      success: true,
      count: orders.length,
      orders
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});
