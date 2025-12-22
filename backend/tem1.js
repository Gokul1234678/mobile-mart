// ✅ Get single product by its ID
app.get("/api/product/:id", isAuthenticatedUser, async (req, res) => {
  try {
    // ------------------------------------------------------------
    // 1️⃣ Validate MongoDB ObjectId
    // ------------------------------------------------------------
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID"
      });
    }
 // mongoose.Types.ObjectId.isValid(...)
  //   This function checks:
  //       “Does this string look like a real MongoDB ObjectId?”
  //       Rules of a valid ObjectId:
  //        Exactly 24 characters
  //        Hexadecimal characters only (0-9 and a-f)

    // ------------------------------------------------------------
    // 2️⃣ Find product by ID
    // ------------------------------------------------------------
    const product = await productModel.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }

    // ------------------------------------------------------------
    // 3️⃣ Success response
    // ------------------------------------------------------------
    res.status(200).json({
      success: true,
      product
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
});
