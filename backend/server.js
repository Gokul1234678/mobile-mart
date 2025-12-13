const express = require('express');
const app = express()
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const cors = require("cors")
const bcrypt = require("bcrypt");//Password encryption (bcrypt)
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");

// Import Node's built-in crypto module (NO need to install)
const crypto = require("crypto");

// Import Nodemailer (for sending emails)
const nodemailer = require("nodemailer");

// Load config file
dotenv.config({ path: "./config/config.env" })

app.use(express.json())// to parse JSON body
app.use(cors());
app.use(cookieParser());//This allows you to access cookies using req.cookies.

// 🛑 Handle uncaught exceptions (coding errors)
process.on("uncaughtException", (err) => {
  console.error(`❌ Uncaught Exception: ${err.message}`);
  console.log("Shutting down server due to uncaught exception...");
  process.exit(1);
});



// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected Successfully ✅'))
  .catch((err) => {
    console.log('MongoDB Connection Failed ❌', err);
    process.exit(1);  //stop server Because without DB, your API cannot work — better to stop the server.
  });

// app.get("/",(req,res)=>{
//     res.send("hello")
// })


// user Schema starts

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Name is required"]
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      "Please enter a valid email"
    ]
  },
  password: {
    type: String,
    required: [true, "Password is required"],
    minlength: [6, "Password must be at least 6 characters"],
    select: false //Password is hidden from all queries(Mongoose will NOT return the password field when you query the user.)
  },
  phone: {
    type: String,
    required: [true, "Phone number is required"],
    match: [/^[0-9]{10}$/, "Phone number must be 10 digits"]
  },
  gender: {
    type: String,
    enum: ["male", "female"],
    required: [true, "Gender is required"]
  },
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user"
    // ✔ All new users become user by default
    // ✔ You can manually mark one user as admin from MongoDB Atlas
  },

  address: {
    street: {
      type: String,
      required: [true, "Street is required"]
    },
    city: {
      type: String,
      required: [true, "City is required"]
    },
    state: {
      type: String,
      required: [true, "State is required"]
    },
    pincode: {
      type: String,
      required: [true, "Pin code is required"],
      match: [/^[0-9]{6}$/, "Pin code must be 6 digits"]
    }
  },
  // These values store the token and expiry time.
  resetPasswordToken: {
    type: String
  },
  resetPasswordExpire: {
    type: Date
  }

});

// ➤ Encrypt password before saving(Before saving, this middleware runs.)
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();//If the password is NOT changed, then skip hashing.
  //If we don't check this, MongoDB will hash the already hashed password again, causing login failures.

  this.password = await bcrypt.hash(this.password, 10)
  // This line hashes (encrypts) the password using bcrypt.

  next();
  // next() Tells Mongoose: Ok, I'm done. Continue saving the user.
  // Without next(), Mongoose would freeze and not save the document.

})


// Create method on User schema to generate password reset token
// This code creates a safe reset password token, saves a hashed version in the database, sets a 15-minute expiration, and returns the real token to send to the user's email.
// Simple Explanation of the Code
// 🔑 This function creates a password reset token when a user clicks “Forgot Password.”
userSchema.methods.getResetPasswordToken = function () {

  // {⭐ 3. What does .methods actually do? (Simple Explanation)

  // It means:

  // “Add this function to all user objects created from this schema.”

  // So later:

  // const user = await userModel.findOne({ email });
  // user.getResetPasswordToken();


  // This works because the function is added to that user object.
  // }




  // ------------------------------------------------------------
  // 1️⃣ GENERATE A RANDOM RESET TOKEN
  // ------------------------------------------------------------
  // Creates 20 bytes of random data (very secure)
  // Converts it into a hexadecimal string like: "89f6ab03e7a49c..."
  const resetToken = crypto.randomBytes(20).toString("hex");

  // ------------------------------------------------------------
  // 2️⃣ HASH THE RESET TOKEN AND STORE IN DATABASE
  // ------------------------------------------------------------
  // User should receive the PLAIN token via email,
  // but DB should store only the HASHED version for security.
  this.resetPasswordToken = crypto
    .createHash("sha256")       // Use sha256 hashing algorithm
    .update(resetToken)         // Hash the plain token
    .digest("hex");             // Convert hashed data to hex string

  // ------------------------------------------------------------
  // 3️⃣ SET TOKEN EXPIRATION TIME (15 minutes)
  // ------------------------------------------------------------
  // Date.now() = current time in milliseconds
  // 15 * 60 * 1000 = 15 minutes in milliseconds
  this.resetPasswordExpire = Date.now() + 15 * 60 * 1000;

  // ------------------------------------------------------------
  // 4️⃣ RETURN THE ORIGINAL NON-HASHED TOKEN
  // ------------------------------------------------------------
  // This token will be emailed to the user for resetting password
  return resetToken;
};


// 📧 Email sending function (options = { email, subject, message })
const sendEmail = async (options) => {

  // ------------------------------------------------------------
  // 1️⃣ CREATE EMAIL TRANSPORTER
  // ------------------------------------------------------------
  // This creates a connection to your SMTP server.
  // You must define SMTP_HOST, SMTP_PORT, SMTP_EMAIL, SMTP_PASSWORD in .env file.
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,     // e.g., smtp.gmail.com
    port: process.env.SMTP_PORT,     // e.g., 587 or 465
    auth: {
      user: process.env.SMTP_EMAIL,  // your email address
      pass: process.env.SMTP_PASSWORD // your SMTP or App password
    }
  });

  // ------------------------------------------------------------
  // 2️⃣ DEFINE EMAIL DETAILS
  // ------------------------------------------------------------
  // What email to send? To whom? What subject? What message?
  const message = {
    from: `${process.env.SMTP_FROM_NAME} <${process.env.SMTP_FROM_EMAIL}>`,     // Sender name + email
    to: options.email,               // Receiver email
    subject: options.subject,        // Email subject line
    text: options.message            // Plain text message body
    // You can also use html: options.message if sending HTML email
  };

  // ------------------------------------------------------------
  // 3️⃣ SEND EMAIL USING TRANSPORTER
  // ------------------------------------------------------------
  // transporter.sendMail() will send the actual email.
  // It returns a promise, so we await it.
  await transporter.sendMail(message);
};

// MODEL CREATION (AFTER METHOD)
let userModel = mongoose.model("user", userSchema);


// ✅ Forgot Password api
app.post("/api/forgot-password", async (req, res) => {
  let user; //let user; created BEFORE try block Now catch block ALWAYS has access to user  
  try {
    // ------------------------------------------------------------
    // 1️⃣ Extract user email from request body
    // ------------------------------------------------------------
    const { email } = req.body;

    // If email is missing → return error
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Please provide email"
      });
    }

    // ------------------------------------------------------------
    // 2️⃣ Check if user exists in database using email
    // ------------------------------------------------------------

     user = await userModel.findOne({ email });

    // If no user found → return error
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found with this email"
      });
    }

    // ------------------------------------------------------------
    // 3️⃣ Generate Reset Password Token
    // ------------------------------------------------------------
    // This calls the method we created in the User model
    // It generates a random token, hashes it, and sets expiry time
    const resetToken = user.getResetPasswordToken();

    // Save user WITHOUT validation (because we only added token fields)
    await user.save({ validateBeforeSave: false });

    // ------------------------------------------------------------
    // 4️⃣ Create Reset URL (works for localhost & production)
    // ------------------------------------------------------------
    const resetUrl = `${req.protocol}://${req.get("host")}/api/reset-password/${resetToken}`;
    // http://localhost:5000/api/reset-password/34f9a8a0d92f5b47eaed23d9c2f01b


    // ------------------------------------------------------------
    // 5️⃣ Prepare email message
    // ------------------------------------------------------------
    const message = `
You requested a password reset.

Click the link below to reset your password:

${resetUrl}

If you did not request this, please ignore this email.
`;


    // ------------------------------------------------------------
    // 6️⃣ Send email using sendEmail() function we created above
    // ------------------------------------------------------------
    await sendEmail({
      email: user.email,
      subject: "MobileMart Password Reset",
      message
    });

    // ------------------------------------------------------------
    // 7️⃣ Success Response
    // ------------------------------------------------------------
    return res.status(200).json({
      success: true,
      message: "Password reset link sent to email!",
      resetUrl  // 🔥 For testing only — remove in production
    });




  } catch (error) {

    // ------------------------------------------------------------
    // ⚠️ Important: If sending email fails → reset token must be cleared
    // ------------------------------------------------------------
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({ validateBeforeSave: false });

    // ------------------------------------------------------------
    // 8️⃣ Handle server errors
    // ------------------------------------------------------------
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// ✅ Reset Password API.
app.post("/api/reset-password/:token", async (req, res) => {
  try {
    // ------------------------------------------------------------
    // 1️⃣ Hash the token received from the URL
    // ------------------------------------------------------------
    const resetPasswordToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");

    // ------------------------------------------------------------
    // 2️⃣ Find user with this token AND check expiry time
    // ------------------------------------------------------------
    const user = await userModel.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() } // token must still be valid
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired password reset token"
      });
    }

    // ------------------------------------------------------------
    // 3️⃣ Get new password from request body
    // ------------------------------------------------------------
    const { newPassword } = req.body;

    if (!newPassword) {
      return res.status(400).json({
        success: false,
        message: "Please provide new password"
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters"
      });
    }

    // ------------------------------------------------------------
    // 4️⃣ Set new password (bcrypt will hash it automatically)
    // ------------------------------------------------------------
    user.password = newPassword;

    // ------------------------------------------------------------
    // 5️⃣ Remove reset token & expiry
    // ------------------------------------------------------------
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    // ------------------------------------------------------------
    // 6️⃣ Save updated user (pre-save middleware will hash password)
    // ------------------------------------------------------------
    await user.save();

    // ------------------------------------------------------------
    // 7️⃣ Success response
    // ------------------------------------------------------------
    res.status(200).json({
      success: true,
      message: "Password reset successful! You can now log in."
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});



// ⭐ isAuthenticatedUser Middleware
// This middleware checks if the user is logged in (token present + valid)

const isAuthenticatedUser = async (req, res, next) => {
  try {
    // 1️⃣ Get token from cookies
    // Token is stored in cookie named "token" during login
    let token = req.cookies.token;

    // If no token exists → user is not logged in
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not authorized, no token found ,login first to access this api"
      });
    }

    // 2️⃣ Verify token using JWT_SECRET
    // If token expired or fake → verify() throws an error
    let decoded = jwt.verify(token, process.env.JWT_SECRET)
    // decoded = { id: 'userID123', iat: 1234, exp: 5678 }
    // If token is real → return decoded data
    // If token is fake/expired → throw error 

    // console.log(decoded);

    // 3️⃣ Find user in DB using decoded.id
    // We exclude password (‘-password’) for safety
    req.user = await userModel.findById(decoded.id).select("-password")

    // If user deleted from DB but token still valid
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "User not found"
      });
    }

    // 4️⃣ User is authenticated → allow route to continue
    next();
  } catch (err) {
    // Token expired OR invalid
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token"
    });
  }
}

// isAdmin Middleware
// This function checks if the logged-in user is an admin.
// If user is NOT admin → ❌ block access
// If user is admin → ✅ allow the request to continue
const isAdmin = (req, res, next) => {
  // req.user was added by isAuthenticatedUser middleware
  if (req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Access denied! Admins only."
    });
  }
  next();
  // ✔ All new users become user by default
  // ✔ You can manually mark one user as admin from MongoDB Atlas
};

// ✅ register api
app.post("/api/register", async (req, res) => {

  try {
    let {
      name, email, password, phone, gender, role,
      street, city, state, pincode } = req.body;

    // Check if user already exists
    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email already registered"
      });
    }

    if (gender) {
      gender = gender.toLowerCase();
      // Before saving, you make gender lowercase.
      // This avoids enum error like: "Male" is not valid for enum ["male","female"]"
    }

    const savedUser = await userModel.create({
      name,
      email,
      password,
      phone,
      gender,
      role,
      address: { street, city, state, pincode }
    });

    res.status(201).json({
      success: true,
      message: "Account created successfully!",
      userId: savedUser._id
    })
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message
    });
  }

});


// ✅ Login api
app.post("/api/login", async (req, res) => {
  try {
    let { email, password } = req.body;

    // 1. Check if fields are provided
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required"
      });
    }
    // 2. Check if user exists
    let user = await userModel.findOne({ email }).select("+password");
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    // 3. Compare entered password with hashed password
    let isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // 4. Generate JWT token
    const token = jwt.sign(
      { id: user._id },                  // payload
      process.env.JWT_SECRET,           // secret key
      { expiresIn: process.env.JWT_EXPIRE } // expiry time
    );

    // 5. Set cookie
    res.cookie("token", token, {
      httpOnly: true,
      // secure: false,
      // sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000//After 7 days → cookie automatically expires → user logged out.
    })

    // 6. Success response
    res.status(200).json({
      success: true,
      message: "Login successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    })
  } catch (err) {
    res.status(500).json({
      success: false, message: err.message
    });
  }
});


// ✅ Logout API
app.get("/api/logout", isAuthenticatedUser, (req, res) => {
  // Remove token from cookies by setting it to null & expiring immediately
  res.cookie("token", null, {
    httpOnly: true,
    expires: new Date(0) // Cookie expires immediately
  });

  return res.status(200).json({
    success: true,
    message: "Logout successful! Token removed."
  });
});






// user Schema end




// Product Schema start
const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please enter the product name"],
    trim: true,
  },
  brand: {
    type: String,
    required: [true, "Please enter the brand name"],
    trim: true,
  },
  originalPrice: {
    type: Number,
    required: [true, "Please enter the original price"],
  },
  offerPrice: {
    type: Number,
    required: [true, "Please enter the offer price"],
  },
  quantity: {
    type: Number,
    required: [true, "Please enter available quantity"],
    default: 10 // ✅ You can set a default for testing
  },
  availability: {
    type: String,
    default: function () {
      return this.quantity > 0 ? "In Stock" : "Out of Stock";
    }
  }
  ,
  specifications: {
    Display: { type: String, trim: true },
    Processor: { type: String, trim: true },
    Camera: { type: String, trim: true },
    Battery: { type: String, trim: true },
    Storage: { type: String, trim: true },
    RAM: { type: String, trim: true },
  },
  description: {
    type: String,
    required: [true, "Please enter a description"],
    trim: true,
  },
  image: {
    type: String,
    required: [true, "Please provide product image URL"],
    trim: true,
  },
});

let productModel = mongoose.model("productsList", productSchema)
// --- API Routes ---


// ✔ isAuthenticatedUser = user must be logged in
// ✔ isAdmin = user must be admin
// ✅ Get all products
app.get("/api/products", isAuthenticatedUser, isAdmin, async (req, res) => {
  try {
    let allProducts = await productModel.find();
    res.json(allProducts)
  }
  catch (err) {
    res.status(500).json({ message: err.message });

  }
})

// ✅ Get single product by its ID
app.get("/api/product/:id", isAuthenticatedUser, isAdmin, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid product ID" });
    }
    let product = await productModel.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(product);
  }
  catch (err) {
    res.status(500).json({ message: err.message });
  }

})

// 🆕 Add a new single product
app.post("/api/product", async (req, res) => {
  try {
    const product = await productModel.create(req.body);

    return res.status(201).json({
      message: "Product added successfully",
      product
    });

  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
});

// 🆕 🧩 Add multiple products at once
app.post("/api/products/upload-many", async (req, res) => {
  try {
    const productData = req.body; // expecting an array of products
    if (!Array.isArray(productData)) {
      return res.status(400).json({
        message: "Invalid data format. Expected an array of products.",
      });
    }

    // Validate at least one product
    if (productData.length === 0) {
      return res.status(400).json({
        message: "Product list is empty. Please provide at least one product.",
      });
    }
    // await productModel.deleteMany({});
    const savedProducts = await productModel.insertMany(productData);
    res.status(200).json({
      message: `${savedProducts.length} products uploaded successfully.`,
      data: savedProducts,
    });
  } catch (err) {
    console.error("❌ Error uploading products:", err.message);
    res.status(400).json({ message: err.message });
  }
});

// 📝 Update product by ID 
app.put("/api/product/:id", async (req, res) => {

  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid product ID" });
    }
    let updatedProduct = await productModel.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,           // return updated document
        runValidators: true  // validate data before updating
      }
    );
    if (!updatedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    return res.status(200).json({
      message: "Product updated successfully",
      product: updatedProduct
    });

  } catch (err) {
    return res.status(400).json({ message: err.message });
  }


})

// 🗑️ delete product by ID 
app.delete("/api/product/:id", async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid product ID" });
    }
    const deletedProduct = await productModel.findByIdAndDelete(req.params.id);

    if (!deletedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json({
      message: "Product deleted successfully",
      product: deletedProduct
    });

  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
})

// 🔍 Search product API old search
// app.get("/api/products/search", async (req, res) => {

//   // {🎯 What This Search API Covers
//   // ✔ Search by name
//   // ✔ Search by description
//   // ✔ Search inside specifications fields
//   // ✔ Case insensitive (iphone = iPhone = IPHONE)
//   // ✔ Works even if search is incomplete (ipho, a1, 128, amoled)}
//   try {
//     let query = req.query.q;

//     if (!query) {
//       return res.status(400).json({ message: "Search query is required" });
//     }
//     // Case-insensitive search
//     let found_Products = await productModel.find({
//       $or: [
//         { name: { $regex: query, $options: "i" } },
//         { description: { $regex: query, $options: "i" } },
//         { "specifications.Display": { $regex: query, $options: "i" } },
//         { "specifications.Processor": { $regex: query, $options: "i" } },
//         { "specifications.Camera": { $regex: query, $options: "i" } },
//         { "specifications.RAM": { $regex: query, $options: "i" } },
//         { "specifications.Storage": { $regex: query, $options: "i" } }
//       ]
//     });

//     res.status(200).json(found_Products);

//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }

// })

// 🔍 ADVANCED SEARCH + FILTER + PAGINATION
app.get("/api/products/advanced-search", async (req, res) => {

  // {What this Advanced API Can Do:


  // 1️⃣ Search products
  // By name or description.

  // 2️⃣ Filter by brand
  // (Apple, Samsung, Redmi…)

  // 3️⃣ Filter by RAM
  // (4GB, 6GB, 8GB…)

  // 4️⃣ Filter by storage
  // (64GB, 128GB, 256GB…)

  // 5️⃣ Filter by battery
  // (5000mAh, 4500mAh…)

  // 6️⃣ Filter by network
  // (5G, 4G…)

  // 7️⃣ Filter by price range
  // (minPrice to maxPrice)

  // 8️⃣ Use multiple filters together
  // Example: brand + RAM + price.

  // 9️⃣ Use search + filters together
  // Example: q=iphone + ram=8GB

  // 🔟 Pagination
  // Show products page-wise (page 1, page 2…).

  // 1️⃣1️⃣ Shows total results
  // Example: 42 products found.

  // 1️⃣2️⃣ Shows total pages
  // Example: 5 pages total.

  // 1️⃣3️⃣ Returns products only for the selected page
  // (Not all at once).
  // }

  try {
    let {
      q,
      brand,
      ram,
      storage,
      battery,
      // network,
      minPrice,
      maxPrice,
      page = 1,
      limit = 10
    } = req.query;


    let filter = {};

    // ------------------------
    // 🔍 1. Search (name OR description)
    // ------------------------

    if (q) {
      filter.$or = [
        { name: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: "i" } }

      ]
    }
    // ------------------------
    // 🏷️ 2. Brand filter
    // ------------------------
    if (brand) {
      filter.brand = { $regex: brand, $options: "i" };
    }

    // ------------------------
    // ⚙ 3. RAM filter
    // ------------------------
    if (ram) {
      filter["specifications.RAM"] = { $regex: ram, $options: "i" }
    }

    // ------------------------
    // 💾 4. Storage filter
    // ------------------------
    if (storage) {
      filter["specifications.Storage"] = { $regex: storage, $options: "i" };
    }

    // ------------------------
    // 🔋 5. Battery filter
    // ------------------------
    if (battery) {
      filter["specifications.Battery"] = { $regex: battery, $options: "i" };
    }

    // ------------------------
    // 🌐 6. Network filter (5G, 4G)
    // ------------------------
    // if (network) {
    //   filter["specifications.Network"] = { $regex: network, $options: "i" };
    // }

    // ------------------------
    // 💰 7. Price Range filter
    // ------------------------
    if (minPrice || maxPrice) {
      filter.offerPrice = {};
      if (minPrice) filter.offerPrice.$gte = Number(minPrice);
      if (maxPrice) filter.offerPrice.$lte = Number(maxPrice);
    }

    // ------------------------
    // 📄 Pagination
    // ------------------------
    page = Number(page);
    limit = Number(limit);
    let skip = (page - 1) * limit;

    // console.log(filter);


    // 📌 Count how many products match the filter (search + filters)
    let totalCountMatched = await productModel.countDocuments(filter);
    //Counts all matching products, NOT just the products on the current page.
    // Example: If 42 products match the filter → totalCountMatched = 42


    // 📌 Find products based on filter + apply pagination
    let found_Products = await productModel.find(filter)
      .skip(skip)       // Skip products for previous pages
      .limit(limit);    // Limit how many products to show on this page

    // console.log("tot",found_Products.length);


    // 📌 Send paginated response back to the frontend
    res.status(200).json({

      // 🔢 Current page number (from ?page=1)
      page,

      // 📦 Number of products per page (from ?limit=10)
      limit,

      // 🧮 Total number of matched results
      totalProductsFound: totalCountMatched,

      // 📄 Total pages needed = total results / limit
      totalPages: Math.ceil(totalCountMatched / limit),

      // 📑 Products for the current page
      products: found_Products
    });


  } catch (err) {
    res.status(500).json({ message: err.message });
  }

})
// Products Schema ends
















// --- Server Start ---
const PORT = process.env.PORT || 8000;
const server = app.listen(PORT, () => {
  let d = Date.now()
  console.log(`Server running on port ${PORT} at ${d}`)
});

// 🛑 Handle unhandled promise rejections (DB errors, async fails)
process.on("unhandledRejection", (err) => {
  console.error(`❌ Unhandled Rejection: ${err.message}`);
  console.log("Shutting down server due to unhandled promise rejection...");

  server.close(() => {
    process.exit(1);
  });
});