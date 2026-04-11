// Import cloudinary (v2 version)
const cloudinary = require("cloudinary").v2;

// Load environment variables
const dotenv = require('dotenv');
dotenv.config({ path: './config/config.env' });// Load env variables from config.env file

// ==========================================
// CONFIGURE CLOUDINARY
// ==========================================
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME, // your cloud name
  api_key: process.env.CLOUDINARY_API_KEY, // API key
  api_secret: process.env.CLOUDINARY_API_SECRET // API secret
});

// Export cloudinary instance
module.exports = cloudinary;