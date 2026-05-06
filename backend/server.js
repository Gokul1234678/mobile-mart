const express = require('express');
const app = express()
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const cors = require("cors")
const bcrypt = require("bcrypt");//Password encryption (bcrypt)
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");

// Import upload middleware (Cloudinary + multer) 
const upload = require("./middleware/upload");


// Import Node's built-in crypto module (NO need to install)
const crypto = require("crypto");

// Import Nodemailer (for sending emails)
const nodemailer = require("nodemailer");

// Load config file
dotenv.config({ path: "./config/config.env" })

app.use(express.json())// to parse JSON body

// CORS configuration
app.use(
  cors({
    origin: "http://localhost:5173", // your frontend URL
    credentials: true,
  })
);

app.use(cookieParser());//This allows you to access cookies using req.cookies.

// 🛑 Handle uncaught exceptions (coding errors)
process.on("uncaughtException", (err) => {
  console.error(`❌ Uncaught Exception: ${err.message}`);
  console.log("Shutting down server due to uncaught exception...");
  process.exit(1);
});

// import razorpay
const Razorpay = require("razorpay");

// Create Razorpay instance using API keys from environment variables
// Key ID is public (can be used in frontend)
// Key Secret must always stay in backend
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
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


// 🙎🏻‍♂️ user Schema starts

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
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
    // http://localhost:5173/reset-password/34f9a8a0d92f5b47eaed23d9c2f01b

    //old one--> const resetUrl = `${req.protocol}://${req.get("host")}/api/reset-password/${resetToken}`;
    // http://localhost:5000/api/reset-password/34f9a8a0d92f5b47eaed23d9c2f01b


    // ------------------------------------------------------------
    // 5️⃣ Prepare email message
    // -----------------------------------------------------------
    const message = `
Hello ${user.name},

We received a request to reset your MobileMart account password.

This reset link will expire in 15 minutes.

To reset your password, click the link below:

${resetUrl}

If you did not request this, please ignore this email.
Your password will remain unchanged.

Thank you,
MobileMart Team
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
      name, email, password, phone, gender,
      role,
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
        email: user.email,
        role: user.role

      }
    })
  } catch (err) {
    res.status(500).json({
      success: false, message: err.message
    });
  }
});


// ✅ Logout API
app.get("/api/logout", isAuthenticatedUser, async function (req, res) {

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


// ✅ Get Logged-in User Details
app.get("/api/myprofile", isAuthenticatedUser, async (req, res) => {
  //                     🔐 ☝️ (Middleware → ensures user is logged in
  try {
    // console.log(req);
    // req.user is already set by isAuthenticatedUser middleware
    res.status(200).json({
      success: true,
      user: req.user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
  //   { ⭐ HOW THIS WORKS (VERY SIMPLE)

  // 1️⃣ User logs in
  //    → Backend creates JWT token
  //    → JWT token is stored in HTTP-only cookie

  // 2️⃣ User calls protected API
  //    → Example: GET /api/myprofile

  // 3️⃣ isAuthenticatedUser middleware runs
  //    → Reads token from request cookies
  //    → Verifies token using JWT secret
  //    → Decodes user ID from token
  //    → Fetches user from database
  //    → Attaches user data to req.user
  //      (password is already excluded)

  // 4️⃣ Controller sends response
  //    → Returns req.user
  // }  
});


// ✅ Change Password (Logged-in User)
app.put("/api/change-password", isAuthenticatedUser, async (req, res) => {
  //                     🔐 ☝️ (Middleware → ensures user is logged in

  //{ 🧠 HOW THIS API WORKS (VERY SIMPLE)
  // 1️⃣ User logs in
  //    → JWT token is created
  //    → Token is stored in HTTP-only cookie
  // 2️⃣ User calls protected API
  //    → POST /api/change-password
  // 3️⃣ isAuthenticatedUser middleware runs
  //    → Reads token from cookies
  //    → Verifies JWT token
  //    → Fetches user from database
  //    → Sets user data on req.user
  // 4️⃣ Backend logic (change password)
  //    → Compares old password with stored hashed password
  //    → Hashes the new password
  //    → Saves updated password in database
  //}


  try {
    const { oldPassword, newPassword } = req.body;
    // ------------------------------------------------------------
    // 1️⃣ Validate input
    // ------------------------------------------------------------
    if (!oldPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Old password and new password are required"
      });
    }
    // check password must be at least 6 characters
    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Old password and new password are required"
      })
    }

    // ------------------------------------------------------------
    // 2️⃣ Get user with password
    // req.user comes from isAuthenticatedUser middleware
    // But password is excluded → so fetch again with +password
    // ------------------------------------------------------------
    const user = await userModel
      .findById(req.user._id)
      .select("+password");

    // ------------------------------------------------------------
    // 3️⃣ Compare old password with stored password
    // ------------------------------------------------------------
    const isMatch = await bcrypt.compare(oldPassword, user.password);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Old password is incorrect"
      });
    }

    // ------------------------------------------------------------
    // 4️⃣ Set new password
    // bcrypt hashing happens automatically in pre-save middleware
    // ------------------------------------------------------------
    user.password = newPassword;

    await user.save();

    // ------------------------------------------------------------
    // 5️⃣ Success response
    // ------------------------------------------------------------
    res.status(200).json({
      success: true,
      message: "Password changed successfully"
    });





  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});


// ✅ UPDATE USER PROFILE (LOGGED-IN USER)
app.put("/api/update-profile", isAuthenticatedUser, async (req, res) => {
  //                     🔐 ☝️ (Middleware → ensures user is logged in

  // 🧠 HOW THIS API WORKS (SIMPLE)
  //     1️⃣ User logs in → token stored in cookie
  //     2️⃣ Calls /api/update-profile
  //     3️⃣ isAuthenticatedUser verifies token
  //     4️⃣ Only provided fields are updated
  //     5️⃣ Password is untouched
  //     6️⃣ Updated user is returned

  try {
    // ------------------------------------------------------------
    // 📥 1️⃣ Extract allowed fields from request body
    // ------------------------------------------------------------
    const {
      name,        // user's name
      phone,       // user's phone number
      gender,      // user's gender
      street,      // address street
      city,        // address city
      state,       // address state
      pincode      // address pincode
    } = req.body;

    // ------------------------------------------------------------
    // 🧱 2️⃣ Create an empty object to store update fields
    // ------------------------------------------------------------
    const updateData = {};

    // ------------------------------------------------------------
    // ✏️ 3️⃣ Add basic profile fields if they exist
    // ------------------------------------------------------------
    if (name) updateData.name = name;                 // update name
    if (phone) updateData.phone = phone;              // update phone
    if (gender) updateData.gender = gender.toLowerCase(); // normalize gender


    // ------------------------------------------------------------
    // 🏠 4️⃣ Handle address update (nested object)
    // ------------------------------------------------------------
    // Check if any address field is provided
    if (street || city || state || pincode) {

      // Create address object
      updateData.address = {};

      // Add individual address fields if present
      if (street) updateData.address.street = street;
      if (city) updateData.address.city = city;
      if (state) updateData.address.state = state;
      if (pincode) updateData.address.pincode = pincode;
    }

    // ------------------------------------------------------------
    // 💾 5️⃣ Update user document in database
    // ------------------------------------------------------------
    const updatedUser = await userModel.findByIdAndUpdate(
      req.user._id,       // logged-in user's ID (from JWT middleware)
      updateData,         // fields to update
      {
        new: true,        // return the updated document
        runValidators: true // apply schema validation rules
      }
    )
      .select("-password"); // exclude password from response


    // ------------------------------------------------------------
    // ✅ 6️⃣ Send success response
    // ------------------------------------------------------------
    res.status(200).json({
      success: true,                       // request success flag
      message: "Profile updated successfully", // success message
      user: updatedUser                   // updated user data
    });


  } catch (error) {
    // ------------------------------------------------------------
    // ❌ 7️⃣ Handle server errors
    // ------------------------------------------------------------
    res.status(500).json({
      success: false,                     // request failed
      message: error.message              // error reason
    });
  }
});



//🧑‍💼 USER MANAGEMENT (ADMIN) --> Admin Routes 

// ✅ Get All Users (🔐 ADMIN ONLY)
//                                                👇🛡️ Middleware → allow only admins
app.get("/api/admin/users", isAuthenticatedUser, isAdmin, async (req, res) => {
  //                     🔐 ☝️ (Middleware → ensures user is logged in
  // Purpose:
  // Show all registered users
  // Used in Admin Panel (Users List)
  try {
    const users = await userModel.find().select("-password");

    res.status(200).json({
      success: true,
      count: users.length,
      users
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }


});


// ✅ Get Single User by ID (🔐 ADMIN ONLY)
app.get("/api/admin/users/:id", isAuthenticatedUser, isAdmin, async (req, res) => {
  // Purpose:
  //     View user profile
  //     Debug issues
  try {
    const user = await userModel.findById(req.params.id).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Invalid user ID"
    });
  }

});


// ✅ UPDATE USER ROLE (🔐 ADMIN ONLY)
app.put("/api/admin/users/:id", isAuthenticatedUser, isAdmin, async (req, res) => {

  // Purpose:
  //   Promote user to admin
  //   Demote admin to user
  try {

    // ======================================================
    // ❌ PREVENT ADMIN FROM CHANGING OWN ROLE
    // ======================================================
    if (req.user._id.toString() === req.params.id) {
      return res.status(400).json({
        success: false,
        message: "You cannot change your own role"
      });
    }

    // ------------------------------------------------------------
    // 📥 1️⃣ Extract role from request body
    // ------------------------------------------------------------
    const { role } = req.body;

    // ------------------------------------------------------------
    // ❌ 2️⃣ Validate role value
    // ------------------------------------------------------------
    // Role must exist and be either "user" or "admin"
    if (!role || !["user", "admin"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Role must be either 'user' or 'admin'"
      });
    }

    // ------------------------------------------------------------
    // ❌ Validate user ID format (must be a valid MongoDB ObjectId)
    // ------------------------------------------------------------
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID"
      });
    }

    // ------------------------------------------------------------
    // 💾 3️⃣ Update user role in database
    // ------------------------------------------------------------
    const updatedUser = await userModel
      .findByIdAndUpdate(
        req.params.id,       // user ID from URL params
        { role },             // role to update
        {
          new: true,          // return updated user document
          runValidators: true // apply schema validation
        }
      )
      .select("-password");   // exclude password from response

    // ------------------------------------------------------------
    // ❌ 4️⃣ Handle user not found
    // ------------------------------------------------------------
    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // ------------------------------------------------------------
    // ✅ 5️⃣ Send success response
    // ------------------------------------------------------------
    res.status(200).json({
      success: true,                      // operation successful
      message: "User role updated successfully",
      user: updatedUser                                // updated user data
    });

  } catch (error) {
    // ------------------------------------------------------------
    // ❌ 6️⃣ Handle invalid ObjectId or server error
    // ------------------------------------------------------------
    res.status(500).json({
      success: false,
      message: error.message
    });
  }

}
);

// ✅ Delete User (🔐 ADMIN ONLY)
app.delete("/api/admin/users/:id", isAuthenticatedUser, isAdmin, async (req, res) => {
  try {

    // Important: You should NOT allow admins to delete their own account, otherwise they might accidentally delete themselves and lose admin access. So we check if the ID being deleted is the same as the logged-in admin's ID.
    if (req.user._id.toString() === req.params.id) {
      return res.status(400).json({
        success: false,
        message: "You cannot delete your own account"
      });
    }

    // Delete user by ID
    const user = await userModel.findByIdAndDelete(req.params.id);


    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "User deleted successfully"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Invalid user ID"
    });
  }
});



// 🙎🏻‍♂️ user Schema End



// 📦 PRODUCT MANAGEMENT APIs start
// Product Schema 
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
    default: function () {// ⭐ This is a dynamic default value based on quantity when this function runs, it checks the quantity and sets availability accordingly.
      return this.quantity > 0 ? "In Stock" : "Out of Stock";
    }
    //{ ==========================================
    // 📌 MONGOOSE DEFAULT FUNCTION — IMPORTANT NOTES
    // ==========================================

    // 1. Default function runs ONLY when document is CREATED
    //    - It executes during Product.create()
    //    - It does NOT run during update operations

    // 2. Default function will NOT run on UPDATE
    //    Example:
    //    product.quantity = 0;
    //    await product.save();
    //    ❌ availability will NOT auto update

    // 3. If you provide value manually, default will NOT run
    //    Example:
    //    availability: "Out of Stock"
    //    👉 Mongoose will use this value directly
    //    👉 default function is ignored

    // 4. IMPORTANT RULE:
    //    👉 Default runs ONLY when field is NOT provided

    // ==========================================
    // ⚠️ LIMITATION
    // ==========================================

    // - Default is a ONE-TIME execution (on creation only)
    // - It does NOT keep values in sync after updates}

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
  images:
    [
      {
        type: String,
        required: [true, "Please provide product image URL"],
        trim: true,
      }
    ],

  // ⭐ Reviews
  reviews: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true
      },
      name: String, // user name (snapshot)
      rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
      },
      comment: {
        type: String,
        required: true
      }
    }
  ],

  averageRating: {
    type: Number,
    default: 0
  },

  numOfReviews: {
    type: Number,
    default: 0
  }

}, { timestamps: true });//timestamps: true automatically adds and manages createdAt and updatedAt fields.
// { timestamps: true }  What fields does it add?
// Mongoose automatically adds two fields:
// createdAt
// updatedAt
// You do not write them yourself.



let productModel = mongoose.model("productsList", productSchema)
// --- API Routes ---


// ✔ isAuthenticatedUser = user must be logged in

// ✅ Get all products
// app.get("/api/products", isAuthenticatedUser,async (req, res) => {
app.get("/api/products", isAuthenticatedUser, async (req, res) => {
  try {
    const products = await productModel.find();

    res.status(200).json({
      success: true,
      count: products.length,
      products
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
});


// ✅ Get single product by its ID
// app.get("/api/product/:id", isAuthenticatedUser, async (req, res) => {
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

    // this is only for testing purpose to test loading state in frontend
    // await new Promise(resolve => setTimeout(resolve, 3000)); // Simulate delay for testing loading states

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


// Add a new single product(🔐 ADMIN ONLY) old code(not image upload code)
//                                                👇🛡️ Middleware → allow only admins 
// app.post("/api/product", isAuthenticatedUser, isAdmin, async (req, res) => {
//   //                     🔐 ☝️ (Middleware → ensures user is logged in
//   try {
//     const product = await productModel.create(req.body);

//     return res.status(201).json({
//       success: true,
//       message: "Product added successfully",
//       product
//     });

//   } catch (err) {
//     return res.status(400).json({
//       success: false,
//       message: err.message
//     });
//   }
// });
// ==========================================
// ✅🆕 ADD New Single PRODUCT (ADMIN ONLY + IMAGES)
// ==========================================
app.post("/api/product",
  isAuthenticatedUser, // 🔐 user must be logged in
  isAdmin,             // 🔐 only admin can add product
  upload.array("images", 5),// Upload multiple images (max 5)
  async (req, res) => {
    // what is api does?
    // 1. Checks if the user is logged in and is an admin
    // 2. Accepts product details from the frontend
    // 3. Uploads product images to Cloudinary
    // 4. Converts specifications from string to object
    // 5. Validates required fields
    // 6. Saves product data (including image URLs) in database
    // 7. Sends success response after product is created
    try {

      if (!req.files || req.files.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Please upload at least one image"
        });
      }
      // ==========================================
      // 🖼 GET IMAGE URLs FROM CLOUDINARY
      // ==========================================
      // req.files contains uploaded images info
      // file.path = Cloudinary URL
      const imageUrls = req.files.map(file => file.path);



      // ==========================================
      // 🧠 HANDLE SPECIFICATIONS (FORM-DATA → JSON)
      // ==========================================

      // Create an empty object to store specifications
      // (default = empty if user doesn't send anything)
      let specifications = {};

      // Check if frontend sent specifications field
      // In form-data, it comes as a STRING (not object)
      if (req.body.specifications) {

        try {
          // Convert string → actual JavaScript object
          // Example:
          // '{"Display":"6.8 inch"}' → { Display: "6.8 inch" }
          specifications = JSON.parse(req.body.specifications);

        } catch (err) {

          // ❌ If JSON format is wrong (invalid string)
          // Example:
          // '{Display: 6.8 inch}' ❌ (invalid JSON)
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
        name, brand, description, offerPrice,
        originalPrice, quantity } = req.body;

      // console.log(req.body);
      // ==========================================
      // ❌ VALIDATION
      // ==========================================
      if (!name || !brand || !originalPrice || !offerPrice || !quantity || !description) {
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


// ✅🆕 🧩 Add multiple products at once(🔐 ADMIN ONLY) old code
//                                                        👇🛡️ Middleware → allow only admins 
app.post("/api/products/upload-many", isAuthenticatedUser, isAdmin, async (req, res) => {
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
        success: false,
        message: "Product list is empty. Please provide at least one product.",
      });
    }
    // await productModel.deleteMany({});
    const savedProducts = await productModel.insertMany(productData);
    res.status(200).json({
      success: true,
      message: `${savedProducts.length} products uploaded successfully.`,
      data: savedProducts,
    });
  } catch (err) {
    console.error("❌ Error uploading products:", err.message);
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
});

// ✅📝 UPDATE PRODUCT BY ID (🔐 ADMIN ONLY)
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


// ✅🗑️ delete product by ID(🔐 ADMIN ONLY)
//                                                👇🛡️ Middleware → allow only admins  
app.delete("/api/product/:id", isAuthenticatedUser, isAdmin, async (req, res) => {
  //                          🔐 ☝️ (Middleware → ensures user is logged in

  try {
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

    const deletedProduct = await productModel.findByIdAndDelete(req.params.id);

    if (!deletedProduct) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Product deleted successfully",
      product: deletedProduct
    });

  } catch (err) {
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }
})

//  Search product API old search
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

// ✅ 🔍 ADVANCED SEARCH + FILTER + PAGINATION
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

  // 6️⃣ Filter by network (Not Now)
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
    /*
      👉 This filter handles BRAND selection from frontend
      👉 Supports SINGLE brand and MULTIPLE brands
      👉 Example frontend query:
         ?brand=Apple,Samsung
    
      Step-by-step:
      1️⃣ Check if brand filter exists in request
      2️⃣ Convert comma-separated string into array
      3️⃣ Use MongoDB $in operator to match ANY selected brand
      4️⃣ Use RegExp with "i" flag for case-insensitive matching
    */
    if (brand) {

      // Convert "Apple,Samsung" → ["Apple", "Samsung"]
      const brandArray = brand.split(",");

      // MongoDB query:
      // brand should match ANY value from brandArray
      filter.brand = {
        $in: brandArray.map(b => new RegExp(b, "i"))
        // "i" → case-insensitive
        // RegExp allows partial & flexible matching
      };
    }

    // ------------------------
    // ⚙️ 3. RAM filter
    // ------------------------
    /*
      👉 Handles RAM filter (example: 6GB, 8GB)
      👉 Frontend sends:
         ?ram=6GB,8GB
    
      Why $in?
      ❌ regex alone fails when multiple values are selected
      ✅ $in allows matching ANY selected RAM value
    */
    if (ram) {

      // Convert "6GB,8GB" → ["6GB", "8GB"]
      const ramArray = ram.split(",");

      // MongoDB nested field query
      filter["specifications.RAM"] = {
        $in: ramArray.map(r => new RegExp(r, "i"))
      };
    }

    // ------------------------
    // 💾 4. Storage filter
    // ------------------------
    /*
      👉 Filters products by internal storage
      👉 Example frontend query:
         ?storage=128GB,256GB
    
      Stored in MongoDB as:
      specifications.Storage
    */
    if (storage) {

      filter["specifications.Storage"] = {
        $in: storage
          .split(",")                 // "128GB,256GB" → ["128GB", "256GB"]
          .map(s => new RegExp(s, "i"))
      };
    }


    // ------------------------
    // 🔋 5. Battery filter
    // ------------------------
    /*
      👉 Filters products by battery capacity
      👉 Example frontend query:
         ?battery=5000mAh,4500mAh
    
      Why RegExp?
      ✔ Handles text-based values
      ✔ Case-insensitive matching
    */
    if (battery) {

      // Convert "5000mAh,4500mAh" → ["5000mAh", "4500mAh"]
      const batteryArray = battery.split(",");

      filter["specifications.Battery"] = {
        $in: batteryArray.map(b => new RegExp(b, "i"))
      };
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
      success: true,
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
    res.status(500).json({
      success: false,
      message: err.message
    });
  }

})


// ✅ ⭐ ADD OR UPDATE PRODUCT REVIEW (LOGGED-IN USER)
app.put("/api/products/:id/review", isAuthenticatedUser, async (req, res) => {

  // { 🧠 What this API DOES (Command Points)
  //   • Allows a logged-in user to add a product review
  //   • Prevents duplicate reviews by same user
  //   • Updates review if user already reviewed
  //   • Calculates average rating dynamically
  //   • Updates total review count
  //   • Saves review safely in product document

  // 🎯 Why this API is USED
  //   • Collect product feedback
  //   • Show star ratings on product page
  //   • Prevent fake multiple reviews
  //   • Maintain accurate average rating
  //   • Real e-commerce review behavior
  // }

  try {
    // ------------------------------------------------------------
    // 📥 1️⃣ Extract review data from request body
    // ------------------------------------------------------------
    const { rating, comment } = req.body;

    // ------------------------------------------------------------
    // ❌ 2️⃣ Validate required fields
    // ------------------------------------------------------------
    // → Both rating and comment are mandatory
    if (!rating || !comment) {
      return res.status(400).json({
        success: false,
        message: "Rating and comment are required"
      });
    }

    // ------------------------------------------------------------
    // 🔍 3️⃣ Find product by ID from URL
    // ------------------------------------------------------------
    const product = await productModel.findById(req.params.id);

    // ❌ If product does not exist
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }

    // console.log(req.user._id);
    // console.log(req.user._id.toString());
    // ------------------------------------------------------------
    // 🔎 4️⃣ Check if user has already reviewed this product
    // ------------------------------------------------------------
    // → Compare review.user with logged-in user ID
    const existingReview = product.reviews.find(
      r => r.user.toString() === req.user._id.toString()
    );


    // ------------------------------------------------------------
    // ✏️ 5️⃣ Update existing review OR add new review
    // ------------------------------------------------------------
    if (existingReview) {
      // ➤ User already reviewed → update rating & comment
      existingReview.rating = rating;
      existingReview.comment = comment;
    } else {
      // ➤ First time review → push new review object
      product.reviews.push({
        user: req.user._id,     // reviewer user ID
        name: req.user.name,    // snapshot of user name
        rating,                 // star rating
        comment                 // review text
      });
    }


    // ------------------------------------------------------------
    // 📊 6️⃣ Update review count and average rating
    // ------------------------------------------------------------
    // → Total number of reviews
    product.numOfReviews = product.reviews.length;

    // → Calculate average rating
    product.averageRating =
      product.reviews.reduce((acc, r) => acc + r.rating, 0) /
      product.reviews.length;

    // ------------------------------------------------------------
    // 💾 7️⃣ Save updated product document
    // ------------------------------------------------------------
    await product.save();

    // ------------------------------------------------------------
    // ✅ 8️⃣ Send success response
    // ------------------------------------------------------------
    res.status(200).json({
      success: true,
      message: "Review submitted successfully"
    });



  } catch (error) {
    // ------------------------------------------------------------
    // ❌ 9️⃣ Handle server or unexpected errors
    // ------------------------------------------------------------
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});


// ✅⭐ GET ALL REVIEWS FOR A PRODUCT by ID
app.get("/api/products/:id/reviews", async (req, res) => {
  //   {🧠 What this API DOES 
  // • Fetches all reviews for a specific product
  // • Returns average rating
  // • Returns total number of reviews
  // • Returns full reviews list
  // • Does NOT require user login

  // 🎯 Why this API is USED
  // • Show product reviews on product detail page
  // • Display average star rating
  // • Display number of reviewers
  // • Build trust using customer feedback
  //   }
  try {
    // ------------------------------------------------------------
    // 🔍 1️⃣ Find product by ID from URL
    // ------------------------------------------------------------
    // → req.params.id contains product ID
    // → select() limits returned fields to reviews & rating info
    const product = await productModel
      .findById(req.params.id)
      .select("reviews averageRating numOfReviews");

    // ------------------------------------------------------------
    // ❌ 2️⃣ Handle product not found
    // ------------------------------------------------------------
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }

    // ------------------------------------------------------------
    // ✅ 3️⃣ Send success response
    // ------------------------------------------------------------
    res.status(200).json({
      success: true,                 // request successful
      averageRating: product.averageRating, // avg star rating
      numOfReviews: product.numOfReviews,   // total reviews count
      reviews: product.reviews       // array of all reviews
    });

  } catch (error) {
    // ------------------------------------------------------------
    // ❌ 4️⃣ Handle invalid ObjectId or server error
    // ------------------------------------------------------------
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
}
);


// ✅⭐ DELETE REVIEW (🔐 ADMIN ONLY)
app.delete("/api/admin/products/:productId/reviews/:reviewId", isAuthenticatedUser, isAdmin, async (req, res) => {

  //     {🧠 What this API DOES (Command Points)
  // • Allows admin to delete a specific review
  // • Finds product using productId
  // • Finds review using reviewId
  // • Removes review from reviews array
  // • Recalculates average rating
  // • Updates total review count
  // • Saves updated product

  // 🎯 Why this API is USED
  // • Remove fake or abusive reviews
  // • Moderate user-generated content
  // • Maintain accurate product ratings
  // • Admin control over product reviews
  // • Real e-commerce moderation feature}

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


// 📦 PRODUCT MANAGEMENT APIs ends



// OrderSchema starts

const orderSchema = new mongoose.Schema({

  // 🔐 User who placed the order
  // ------------------------------------------------------------
  // 🔗 USER REFERENCE (Who placed the order)
  // ------------------------------------------------------------
  user: {//it is just field that can only store ObjectId (_id:Object(6943a635df0aec0e290fe9a3) of another document’s in this case we get this user id from req.user._id because of isAthenticated middleware  
    type: mongoose.Schema.Types.ObjectId,
    // → Stores only the MongoDB ObjectId of a user document

    ref: "user",
    // → Creates a relationship with the "user" collection
    // → Tells Mongoose: this ObjectId belongs to the User model

    required: [true, "User is required to place an order"]
    // → Order cannot be created without a user
  },

  // 📦 Order items
  orderItems: [
    {
      // ------------------------------------------------------------
      // 🔗 PRODUCT REFERENCE (Which product is ordered)
      // ------------------------------------------------------------
      product: {// we get this product id from frontend when user adds product to cart and then place order, we store that product id in orderItems array of order document and that product id is nothing but the _id:Object(6943a635df0aec0e290fe9a3) of that product document in products collection
        type: mongoose.Schema.Types.ObjectId,
        // → Stores only the MongoDB ObjectId of a product document

        ref: "product",
        // → Links this ObjectId to the Product model
        // → Enables population of product details later

        required: [true, "Product ID is required"]
        // → Order item must have a product
      },

      name: {
        type: String,
        required: [true, "Product name is required"]
      },
      price: {
        type: Number,
        required: [true, "Product price is required"]
      },
      quantity: {
        type: Number,
        required: [true, "Product quantity is required"]
      },
      image: {
        type: String,
        required: [true, "Product image is required"]
      }
    }
  ],

  // 🚚 Shipping address
  shippingAddress: {
    address: {
      type: String,
      required: [true, "Address is required"]
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
      required: [true, "Pincode is required"]
    }
  },

  // 💰 Price Breakdown
  itemsPrice: {
    type: Number,
    required: true
  },
  taxPrice: {
    type: Number,
    required: true
  },
  deliveryCharge: {
    type: Number,
    required: true
  },
  platformFee: {
    type: Number,
    required: true
  },

  // 💳 Payment method (COD(cash on delivery) or ONLINE(like card,upi))
  paymentMethod: {
    type: String,
    required: true,
    enum: ["COD", "ONLINE"]
  },

  // 💰 Total price
  totalPrice: {
    type: Number,
    required: [true, "Total price is required"],
    default: 0
  },

  // 💳 Payment status
  paymentStatus: {
    type: String,
    enum: ["pending", "paid"],
    default: "pending"
  },

  // 🚚 Order status
  orderStatus: {
    type: String,
    enum: ["processing", "shipped", "delivered", "cancelled"],
    default: "processing"
  },

  paidAt: Date,
  deliveredAt: Date

}, { timestamps: true });


const orderModel = mongoose.model("order", orderSchema);

// ✅ CREATE NEW ORDER (LOGGED-IN USER) + UPDATE PRODUCT STOCK
app.post("/api/orders", isAuthenticatedUser, async (req, res) => {
  try {
    // ------------------------------------------------------------
    // 📥 1️⃣ Extract order details from request body
    // ------------------------------------------------------------
    const {
      orderItems, shippingAddress, itemsPrice, taxPrice,
      deliveryCharge,
      platformFee,
      totalPrice,
      paymentMethod
    } = req.body;


    // ------------------------------------------------------------
    // ❌ 2️⃣ Validate order items
    // ------------------------------------------------------------
    // → Order must contain at least one product
    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Order items are required"
      });
    }

    // ------------------------------------------------------------
    // ❌ 3️⃣ Validate shipping address
    // ------------------------------------------------------------
    // → All address fields are mandatory
    if (
      !shippingAddress ||
      !shippingAddress.address ||
      !shippingAddress.city ||
      !shippingAddress.state ||
      !shippingAddress.pincode
    ) {
      return res.status(400).json({
        success: false,
        message: "Complete shipping address is required"
      });
    }

    // ------------------------------------------------------------
    // ❌ 4️⃣ Validate total price
    // ------------------------------------------------------------
    // → Total price must be greater than 0
    if (!totalPrice || totalPrice <= 0) {
      return res.status(400).json({
        success: false,
        message: "Total price must be greater than 0"
      });
    }


    // ------------------------------------------------------------
    // ❌ 5️⃣ Validate payment method
    // ------------------------------------------------------------
    if (!paymentMethod) {
      return res.status(400).json({
        success: false,
        message: "Payment method is required"
      });
    }

    // ------------------------------------------------------------
    // 📦 6 Check product stock & update quantity
    // ------------------------------------------------------------
    // → Loop through each ordered item
    for (let item of orderItems) {

      // Find product by ID
      const product = await productModel.findById(item.product);

      // ❌ If product does not exist
      if (!product) {
        return res.status(404).json({
          success: false,
          message: "Product not found"
        });
      }

      // ❌ If not enough stock
      if (product.quantity < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Not enough stock for ${product.name}`
        });
      }

      // ➖ Reduce product stock
      product.quantity -= item.quantity;

      // ❌ If stock becomes zero → mark as out of stock
      if (product.quantity === 0) {
        product.availability = "Out of Stock";
      }

      // 💾 Save updated product stock
      await product.save();
    }

    // ------------------------------------------------------------
    // 🧾 7 Create order document in database
    // ------------------------------------------------------------
    const order = await orderModel.create({
      user: req.user._id, //logged-in user ID from auth middleware
      orderItems, // array of ordered items with product ID, name, price, quantity
      shippingAddress,
      itemsPrice,
      taxPrice,
      deliveryCharge,
      platformFee,
      totalPrice,
      paymentMethod, //"COD" or "ONLINE"
      paymentStatus: paymentMethod === "COD" ? "pending" : "pending"
    });

    // ------------------------------------------------------------
    // ✅ 8 Send success response
    // ------------------------------------------------------------
    res.status(201).json({
      success: true,
      message: "Order placed successfully",
      order
    });

  } catch (error) {
    // ------------------------------------------------------------
    // ❌ 9️⃣ Handle server errors
    // ------------------------------------------------------------
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
}
);


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

// ✅ CANCEL ORDER (LOGGED-IN USER) + RESTORE PRODUCT STOCK
app.put("/api/orders/:id/cancel", isAuthenticatedUser, async (req, res) => {
  try {
    // ------------------------------------------------------------
    // 🔍 1️⃣ Find order using order ID from URL
    // ------------------------------------------------------------
    const order = await orderModel.findById(req.params.id);

    // ❌ If order does not exist
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    // ------------------------------------------------------------
    // 🔐 2️⃣ Check order ownership
    // ------------------------------------------------------------
    // → Only the user who placed the order can cancel it
    // → Compare order.user with logged-in req.user._id
    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to cancel this order"
      });
    }

    // ------------------------------------------------------------
    // ❌ 3️⃣ Prevent cancelling delivered orders
    // ------------------------------------------------------------
    // → Once delivered, order cannot be cancelled
    if (order.orderStatus === "delivered") {
      return res.status(400).json({
        success: false,
        message: "Delivered orders cannot be cancelled"
      });
    }

    // ------------------------------------------------------------
    // ❌ 4️⃣ Prevent duplicate cancellation
    // ------------------------------------------------------------
    // → Avoid cancelling the same order multiple times
    if (order.orderStatus === "cancelled") {
      return res.status(400).json({
        success: false,
        message: "Order is already cancelled"
      });
    }

    // ------------------------------------------------------------
    // 📦 5️⃣ Restore product stock
    // ------------------------------------------------------------
    // → Loop through each ordered item
    // → Increase product quantity back
    for (let item of order.orderItems) {

      // Find product by product ID
      const product = await productModel.findById(item.product);

      if (product) {
        // Restore quantity
        product.quantity += item.quantity;

        // Update availability status
        if (product.quantity > 0) {
          product.availability = "In Stock";
        }

        // Save updated product
        await product.save();
      }
    }

    // ------------------------------------------------------------
    // 🔄 6️⃣ Update order status to "cancelled"
    // ------------------------------------------------------------
    order.orderStatus = "cancelled";
    await order.save();

    // ------------------------------------------------------------
    // ✅ 7️⃣ Send success response
    // ------------------------------------------------------------
    res.status(200).json({
      success: true,
      message: "Order cancelled successfully and stock restored",
      order
    });

  } catch (error) {
    // ------------------------------------------------------------
    // ❌ 8️⃣ Handle invalid ID or server error
    // ------------------------------------------------------------
    res.status(500).json({
      success: false,
      message: "Invalid order ID"
    });
  }
}
);


// ✅ GET SINGLE ORDER (USER / 🔐ADMIN)
app.get("/api/orders/:id", isAuthenticatedUser, async (req, res) => {
  // 🔐 Middleware → ensure user is logged in
  // ❌ When will this API reject the request?
  //         User not logged in
  //         Order ID does not exist
  //         User is not owner AND not admin
  //         Invalid order ID
  try {
    // ------------------------------------------------------------
    // 🔍 1️⃣ Find order by ID
    // ------------------------------------------------------------
    // → req.params.id contains the order ID from URL
    // → populate("user") fetches user details using ObjectId + ref
    // → only "name" and "email" are returned
    const order = await orderModel
      .findById(req.params.id)
      .populate("user", "name email");

    // ------------------------------------------------------------
    // ❌ 2️⃣ If order does not exist
    // ------------------------------------------------------------
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    // ------------------------------------------------------------
    // 🔐 3️⃣ Authorization check
    // ------------------------------------------------------------
    // → Normal user can view ONLY their own order
    // → Admin can view ANY order
    // → Compare order.user._id with logged-in req.user._id
    if (
      order.user._id.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to view this order"
      });
    }

    // ------------------------------------------------------------
    // ✅ 4️⃣ Send success response
    // ------------------------------------------------------------
    res.status(200).json({
      success: true,
      order // full order details (with populated user)
    });

  } catch (error) {
    // ------------------------------------------------------------
    // ❌ 5️⃣ Handle invalid ObjectId or server error
    // ------------------------------------------------------------
    res.status(500).json({
      success: false,
      message: "Invalid order ID"
    });
  }
}
);

// ✅ Get All Orders (🔐 Admin)
app.get("/api/admin/orders", isAuthenticatedUser, isAdmin, async (req, res) => {
  try {
    // ------------------------------------------------------------
    // 1️⃣ Fetch all orders with user details
    // ------------------------------------------------------------
    const orders = await orderModel
      .find()
      .populate("user", "name email")
      .sort({ createdAt: -1 }); // latest orders first

    let totalAmount = 0;
    orders.forEach((i) => {
      totalAmount = totalAmount + i.totalPrice
    })
    // ------------------------------------------------------------
    // 2️⃣ Success response
    // ------------------------------------------------------------
    res.status(200).json({
      success: true,
      count: orders.length,
      totalAmount,
      orders
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});


// ✅ Update Order Status (🔐 Admin)
app.put("/api/admin/orders/:id", isAuthenticatedUser, isAdmin, async (req, res) => {
  // {What this API does (Simple)

  //     1️⃣ Only admin can use this API
  //     → Normal users are blocked.

  //     2️⃣ Admin sends new order status
  //     → Example: processing, shipped, delivered, cancelled.

  //     3️⃣ Checks if the status is valid
  //     → Blocks wrong values.

  //     4️⃣ Finds the order by ID
  //     → If order not found → error.

  //     5️⃣ Stops changes if order is already delivered
  //     → Delivered orders cannot be changed.

  //     6️⃣ Updates the order status
  //     → Saves new status in database.

  //     7️⃣ Adds delivery date when delivered
  //     → Sets deliveredAt automatically.

  //     8️⃣ Returns updated order
  //     → Admin sees latest order details.
  // }

  try {
    const { orderStatus } = req.body;

    // ------------------------------------------------------------
    // 1️⃣ Validate order status
    // ------------------------------------------------------------
    const validStatuses = ["processing", "shipped", "delivered", "cancelled"];
    if (!orderStatus || !validStatuses.includes(orderStatus)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order status"
      });
    }

    // ------------------------------------------------------------
    // 2️⃣ Find order by ID
    // ------------------------------------------------------------
    const order = await orderModel.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    // ------------------------------------------------------------
    // 3️⃣ Prevent updating delivered orders
    // ------------------------------------------------------------
    if (order.orderStatus === "delivered" || order.orderStatus === "cancelled") {
      return res.status(400).json({
        success: false,
        message: "Order cannot be updated as it is already delivered or cancelled"
      });
    }

    // ------------------------------------------------------------
    // 4️⃣ Update order status
    // ------------------------------------------------------------
    order.orderStatus = orderStatus;

    if (orderStatus === "delivered") {
      order.deliveredAt = Date.now();
    }

    await order.save();

    // ------------------------------------------------------------
    // 5️⃣ Success response
    // ------------------------------------------------------------
    res.status(200).json({
      success: true,
      message: "Order status updated successfully",
      order
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Invalid order ID"
    });
  }
});


// ✅ DELETE ORDER (🔐 ADMIN ONLY)
app.delete("/api/admin/orders/:id", isAuthenticatedUser, isAdmin, async (req, res) => {
  // {What this API DOES
  //   • Allows ADMIN to delete an order
  //   • Finds the order by ID
  //   • If order is NOT delivered:
  //       → restores product stock
  //   • Deletes the order from database
  //   • Sends success response

  // What this API DOES
  //   • Allows ADMIN to delete an order
  //   • Finds the order by ID
  //   • If order is NOT delivered:
  //       → restores product stock
  //   • Deletes the order from database
  //   • Sends success response
  // }

  try {
    // ------------------------------------------------------------
    // 🔍 1️⃣ Find order using order ID from URL
    // ------------------------------------------------------------
    const order = await orderModel.findById(req.params.id);

    // ❌ If order does not exist
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    // ------------------------------------------------------------
    // 📦 2️⃣ Restore product stock (ONLY if not delivered)
    // ------------------------------------------------------------
    // → If order is already delivered, stock should NOT be restored
    if (order.orderStatus !== "delivered") {

      // Loop through each ordered item
      for (let item of order.orderItems) {

        // Find product related to this order item
        const product = await productModel.findById(item.product);

        if (product) {
          // Increase product quantity back
          product.quantity += item.quantity;

          // Update availability if stock is available
          if (product.quantity > 0) {
            product.availability = "In Stock";
          }

          // Save updated product stock
          await product.save();
        }
      }
    }
    // ------------------------------------------------------------
    // 🗑️ 3️⃣ Delete the order from database
    // ------------------------------------------------------------
    await order.deleteOne();

    // ------------------------------------------------------------
    //  4️⃣ Send success response
    // ------------------------------------------------------------
    res.status(200).json({
      success: true,
      message: "Order deleted successfully"
    });


  } catch (error) {
    // ------------------------------------------------------------
    // ❌ 5️⃣ Handle invalid ID or server error
    // ------------------------------------------------------------
    res.status(500).json({
      success: false,
      message: "Invalid order ID"
    });
  }
});


// Admin Routes 
// ✅ dashboard stats for admin API 
app.get("/api/admin/dashboard", isAuthenticatedUser, isAdmin, async (req, res) => {
  // what this api does?
  // it calculates and returns important statistics for the admin dashboard, such as total number of products, total orders, total users, total revenue generated from orders, and count of out-of-stock products. This helps the admin to get a quick overview of the business performance and inventory status.
  try {

    // 📊 Get counts for Totalproducts, Totalorders, Totalusers
    const totalProducts = await productModel.countDocuments();

    const totalOrders = await orderModel.countDocuments();

    const totalUsers = await userModel.countDocuments();

    // 💰 Calculate total revenue
    const orders = await orderModel.find();
    const totalRevenue = orders.reduce(
      (acc, order) => acc + order.totalPrice,
      0
    );

    // ❌ Out of stock products
    const outOfStock = await productModel.countDocuments({
      quantity: 0
    });

    res.status(200).json({
      success: true,
      totalProducts,
      totalOrders,
      totalUsers,
      totalRevenue,
      outOfStock
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});


// API route to create a Razorpay order
// This route is protected by isAuthenticatedUser middleware
// Only logged-in users can create a payment order
app.post("/api/payment/create-order", isAuthenticatedUser, async (req, res) => {
  // { what this API does
  //   Purpose:
  //     - Create Razorpay order before payment

  //   Steps:
  //     - Receive amount from frontend
  //     - Convert amount to paise (amount * 100)
  //     - Call razorpay.orders.create()
  //     - Get order_id from Razorpay
  //     - Send order_id back to frontend

  //   Meaning:
  //     - "Prepare payment in Razorpay"
  // }

  try {

    // Get amount from frontend request body
    // Example: if product price is 500
    const { amount } = req.body;

    // Razorpay requires amount in paise (smallest currency unit)
    // 1 INR = 100 paise
    const options = {
      amount: amount * 100, // Convert rupees to paise
      currency: "INR", // Currency type
      receipt: "receipt_" + Date.now() // Unique receipt ID for this order
    };

    // Create order in Razorpay server using Razorpay instance 
    const order = await razorpay.orders.create(options);

    // Send order details back to frontend
    // Frontend will use this order id to open Razorpay checkout
    res.status(200).json({
      success: true,
      order
    });

  } catch (error) {

    // Handle errors if order creation fails
    res.status(500).json({
      success: false,
      message: error.message
    });

  }

});


// API to verify Razorpay payment after successful transaction
app.post("/api/payment/verify-payment", isAuthenticatedUser, async (req, res) => {

  //{what this API does
  //   Purpose:
  //     - Verify payment is real (security)

  //   Steps:
  //     - Receive:
  //       razorpay_order_id
  //       razorpay_payment_id
  //       razorpay_signature
  //     - Create string:
  //       order_id + "|" + payment_id
  //     - Generate signature using secret key (HMAC SHA256)
  //     - Compare:
  //       generatedSignature === razorpay_signature

  //   Result:
  //     - If match → payment valid
  //     - If not → payment fake

  //   Meaning:
  //     - "Check payment is genuine"
  //}

  try {

    // Get payment details sent from frontend after payment success
    const {
      razorpay_order_id,     // Order ID generated by Razorpay
      razorpay_payment_id,   // Payment ID generated after payment success
      razorpay_signature     // Signature sent by Razorpay for verification
    } = req.body;

    // Create the data string used to generate signature
    // Format required by Razorpay: order_id|payment_id
    const body = razorpay_order_id + "|" + razorpay_payment_id;

    // Generate expected signature using Razorpay secret key
    // This ensures the payment response is really from Razorpay
    // what this does is it takes the body string and encrypts it using HMAC SHA256 algorithm with our Razorpay secret key, then converts the encrypted data to hexadecimal format which is the expected signature
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET) // encryption algorithm + secret key
      .update(body.toString()) // add order and payment data
      .digest("hex"); // convert to hexadecimal format

    // Compare generated signature with Razorpay signature
    if (expectedSignature === razorpay_signature) {

      // If both signatures match → payment is valid
      res.status(200).json({
        success: true,
        message: "Payment verified successfully"
      });

    } else {

      // If signatures do not match → payment is invalid or tampered
      res.status(400).json({
        success: false,
        message: "Invalid payment signature"
      });

    }

  } catch (error) {

    // Handle server errors
    res.status(500).json({
      success: false,
      message: error.message
    });

  }

});



// ==========================================
// TEST ROUTE: UPLOAD IMAGES
// ==========================================
// app.post("/api/upload-test",
//   // upload multiple images (max 5)
//   upload.array("images", 5),
//   async (req, res) => {
//     try {
//       // req.files contains uploaded files info
//       // each file has path (Cloudinary URL)
// // console.log("hii")
//       const imageUrls = req.files.map(file => file.path);

//       res.status(200).json({
//         success: true,
//         images: imageUrls
//       });

//     } catch (error) {
//       res.status(500).json({
//         success: false,
//         message: error.message
//       });
//     }
//   }
// );

// --- Server Start ---
const PORT = process.env.PORT || 8000;
const server = app.listen(PORT, () => {
  // let d = Date.now()
  console.log(`Server running on port ${PORT} `)
});

// 🛑 Handle unhandled promise rejections (DB errors, async fails)
process.on("unhandledRejection", (err) => {
  console.error(`❌ Unhandled Rejection: ${err.message}`);
  console.log("Shutting down server due to unhandled promise rejection...");

  server.close(() => {
    process.exit(1);
  });
});