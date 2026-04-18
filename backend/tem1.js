// ==========================================================
// 🛒 UPDATE PRODUCT API (ADMIN ONLY)
// ==========================================================
app.put("/api/product/:id",
  isAuthenticatedUser, // 🔐 User must be logged in
  isAdmin,             // 🔐 Only admin can update product
  upload.array("images", 5), // 🖼 Accept multiple images (max 5)
  async (req, res) => {
    // This API updates an existing product including:
    // ✔ Basic details (name, price, etc.)
    // ✔ Specifications (JSON handling)
    // ✔ Images (replace old images if new uploaded)
    // ==========================================================
    // 1️⃣ Checks if the product ID is valid
    // 2️⃣ Finds the product from the database
    // 3️⃣ Gets updated data from request body
    // 4️⃣ Validates input fields (price, quantity, description, etc.)
    // 5️⃣ Converts specifications from string → object (if needed)
    // 6️⃣ Ensures all required specifications are present
    // 7️⃣ Updates only the fields provided (keeps old values if not sent)
    // 8️⃣ If new images are uploaded:
    //     → replaces old images with new ones
    // 9️⃣ Saves updated product in database
    // 🔟 Sends success response with updated product
    // ❌ Handles errors (invalid ID, bad data, server error)


    try {

      // ------------------------------------------------------------
      // 🔍 1️⃣ Validate product ID format
      // ------------------------------------------------------------
      // → Prevents MongoDB CastError
      // → Checks if ID is a valid MongoDB ObjectId
      // Prevent invalid MongoDB ObjectId error
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


      // ======================================================
      // 📦 2️⃣ FIND PRODUCT IN DATABASE
      // ======================================================
      const product = await productModel.findById(req.params.id);

      if (!product) {// ❌ Product not found
        return res.status(404).json({
          success: false,
          message: "Product not found"
        });
      }

      // ======================================================
      // 📥 3️⃣ EXTRACT DATA FROM REQUEST BODY
      // ======================================================
      const {
        name,
        brand,
        originalPrice,
        offerPrice,
        quantity,
        description
      } = req.body;

      // ======================================================
      // ❌ 4️⃣ BASIC VALIDATIONS
      // ======================================================

      // If provided → validate (not required for partial update)
      if (name && name.trim().length < 2) {
        return res.status(400).json({
          success: false,
          message: "Product name must be at least 2 characters"
        });
      }

      if (brand && brand.trim().length < 2) {
        return res.status(400).json({
          success: false,
          message: "Brand must be at least 2 characters"
        });
      }

      if (originalPrice && originalPrice <= 0) {
        return res.status(400).json({
          success: false,
          message: "Original price must be greater than 0"
        });
      }

      if (offerPrice && offerPrice <= 0) {
        return res.status(400).json({
          success: false,
          message: "Offer price must be greater than 0"
        });
      }

      // Offer price should not exceed original price
      if (
        originalPrice &&
        offerPrice &&
        Number(offerPrice) > Number(originalPrice)
      ) {
        return res.status(400).json({
          success: false,
          message: "Offer price cannot be greater than original price"
        });
      }
      // Quantity cannot be negative
      if (quantity && quantity < 0) {
        return res.status(400).json({
          success: false,
          message: "Quantity cannot be negative"
        });
      }
      // Description should be at least 10 characters if provided
      if (description && description.trim().length < 10) {
        return res.status(400).json({
          success: false,
          message: "Description must be at least 10 characters"
        });
      }

      // ======================================================
      // 🧠 5️⃣ HANDLE SPECIFICATIONS (STRING → OBJECT)
      // ======================================================
      let specifications = {};

      if (req.body.specifications) {
        try {
          // If specifications is a string (from form-data) → parse it
          specifications =
            typeof req.body.specifications === "string"
              ? JSON.parse(req.body.specifications)
              : req.body.specifications;
          // ❌ Validate required specification fields
          if (
            !specifications.Display ||
            !specifications.Processor ||
            !specifications.Camera ||
            !specifications.Battery ||
            !specifications.Storage ||
            !specifications.RAM
          ) {
            return res.status(400).json({
              success: false,
              message: "All specifications are required"
            });
          }

        } catch (err) {
          return res.status(400).json({
            success: false,
            message: "Invalid specifications format"
          });
        }
      }

      // ======================================================
      // ✏️ 6️⃣ UPDATE PRODUCT FIELDS (SAFE UPDATE)
      // ======================================================
      // Use ?? so if field not sent → keep old value

      product.name = name ?? product.name;
      product.brand = brand ?? product.brand;
      product.originalPrice = originalPrice ?? product.originalPrice;
      product.offerPrice = offerPrice ?? product.offerPrice;
      product.quantity = quantity ?? product.quantity;
      product.description = description ?? product.description;

      // Update specifications if provided
      if (Object.keys(specifications).length > 0) {
        product.specifications = specifications;
      }

      // ======================================================
      // 🖼 7️⃣ HANDLE IMAGE UPDATE (MERGE LOGIC)
      // ======================================================

      // 1️⃣ Get images user kept (after removing in UI)
      let oldImages = [];

      if (req.body.oldImages) {
        try {
          oldImages = JSON.parse(req.body.oldImages);
        } catch {
          oldImages = [];
        }
      }

      // 2️⃣ Get newly uploaded images
      let newImages = [];

      if (req.files && req.files.length > 0) {
        newImages = req.files.map(file => file.path);
      }

      // 3️⃣ Final images = what user wants
      product.images = [...oldImages, ...newImages];

      // ======================================================
      // 💾 8️⃣ SAVE UPDATED PRODUCT
      // ======================================================
      await product.save();

      // ======================================================
      // ✅ 9️⃣ SUCCESS RESPONSE
      // ======================================================
      return res.status(200).json({
        success: true,
        message: "Product updated successfully",
        product
      });

    } catch (err) {

      // ======================================================
      // ❌ 🔥 ERROR HANDLING
      // ======================================================
      return res.status(500).json({
        success: false,
        message: err.message
      });
    }
  }
);