// Import multer
const multer = require("multer");

// Import CloudinaryStorage
const { CloudinaryStorage } = require("multer-storage-cloudinary");

// Import cloudinary config
const cloudinary = require("../config/cloudinary");

// ==========================================
// CREATE CLOUDINARY STORAGE
// ==========================================
const storage = new CloudinaryStorage({

  // Cloudinary instance
  cloudinary: cloudinary,

  // Upload settings
  params: {
    folder: "mobile-mart", // folder name in cloudinary

    // Allowed image formats
    allowed_formats: ["jpg", "png", "jpeg", "webp"]
  }
});

// ==========================================
// CREATE MULTER INSTANCE
// ==========================================
const upload = multer({
  storage: storage
});

// Export upload middleware
module.exports = upload;