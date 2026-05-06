app.put("/api/product/:id", isAuthenticatedUser, isAdmin, async (req, res) => {
  //                     🔐 ☝️ (Middleware → ensures user is logged in

  try {
    // ------------------------------------------------------------
    // 🔍 1️⃣ Validate product ID format
    // ------------------------------------------------------------
    // → Prevents MongoDB CastError
    // → Checks if ID is a valid MongoDB ObjectId
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
    // 💾 2️⃣ Update product in database
    // ------------------------------------------------------------
    // → req.params.id = product ID from URL
    // → req.body = fields to update
    // → new: true → return updated document
    // → runValidators: true → apply schema validation
    const updatedProduct = await productModel.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    // ------------------------------------------------------------
    // ❌ 3️⃣ Handle product not found
    // ------------------------------------------------------------
    if (!updatedProduct) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }

    // ------------------------------------------------------------
    // ✅ 4️⃣ Send success response
    // ------------------------------------------------------------
    return res.status(200).json({
      success: true,
      message: "Product updated successfully",
      product: updatedProduct
    });

  } catch (err) {
    // ------------------------------------------------------------
    // ❌ 5️⃣ Handle server or validation errors
    // ------------------------------------------------------------
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }
}
);