// Import upload middleware (Cloudinary + multer)
const upload = require("../middleware/upload");

// ==========================================
// ✅🆕 ADD PRODUCT (ADMIN ONLY + IMAGES)
// ==========================================
app.post(
  "/api/product",

  isAuthenticatedUser, // 🔐 user must be logged in
  isAdmin,             // 🔐 only admin can add product
  upload.array("images", 5),// Upload multiple images (max 5)
  async (req, res) => {
    try {
      // ==========================================
      // 🖼 GET IMAGE URLs FROM CLOUDINARY
      // ==========================================
      // req.files contains uploaded images info
      // file.path = Cloudinary URL
      const imageUrls = req.files.map(file => file.path);

      let specifications = {};

      if (req.body.specifications) {
        try {
          specifications = JSON.parse(req.body.specifications);
        } catch (err) {
          return res.status(400).json({
            success: false,
            message: "Invalid specifications format"
          });
        }
      }
      // ==========================================
      // 📥 EXTRACT DATA FROM BODY
      // ==========================================
      const {
        name,
        description,
        offerPrice,
        originalPrice,
        category,
        quantity
      } = req.body;

      // ==========================================
      // ❌ VALIDATION
      // ==========================================
      if (!name || !offerPrice || !category || !quantity) {
        return res.status(400).json({
          success: false,
          message: "Please fill all required fields"
        });
      }

      // ==========================================
      // 🧾 CREATE PRODUCT IN DATABASE
      // ==========================================
      const product = await productModel.create({
        name,
        brand,
        description,
        offerPrice,
        originalPrice,
        category,
        quantity,
        specifications, // ✅ parsed JSON
        images: imageUrls // ✅ array of image URLs from Cloudinary
      });


      // ==========================================
      // ✅ SUCCESS RESPONSE
      // ==========================================
      return res.status(201).json({
        success: true,
        message: "Product added successfully",
        product
      });

    } catch (err) {

      // ==========================================
      // ❌ ERROR HANDLING
      // ==========================================
      return res.status(500).json({
        success: false,
        message: err.message
      });
    }
  }
);