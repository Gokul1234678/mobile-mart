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
      message: "Invalid user ID"
    });
  }

}
);

// ✅ Delete User (🔐 ADMIN ONLY)
app.delete("/api/admin/users/:id", isAuthenticatedUser, isAdmin, async (req, res) => {
  try {
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


// ✅🆕 Add a new single product(🔐 ADMIN ONLY)
//                                                👇🛡️ Middleware → allow only admins 
app.post("/api/product", isAuthenticatedUser, isAdmin, async (req, res) => {
  //                     🔐 ☝️ (Middleware → ensures user is logged in
  try {
    const product = await productModel.create(req.body);

    return res.status(201).json({
      success: true,
      message: "Product added successfully",
      product
    });

  } catch (err) {
    return res.status(400).json({ 
      success: false,
      message: err.message });
  }
});

// ✅🆕 🧩 Add multiple products at once(🔐 ADMIN ONLY)
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
      message: err.message });
  }
});

// ✅📝 UPDATE PRODUCT BY ID (🔐 ADMIN ONLY)
//                                                👇🛡️ Middleware → allow only admins 
app.put("/api/product/:id", isAuthenticatedUser, isAdmin,async (req, res) => {
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


// ✅🗑️ delete product by ID(🔐 ADMIN ONLY)
//                                                👇🛡️ Middleware → allow only admins  
app.delete("/api/product/:id", isAuthenticatedUser, isAdmin, async (req, res) => {
  //                          🔐 ☝️ (Middleware → ensures user is logged in

  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ 
        success: false,
        message: "Invalid product ID" });
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
        message: "Product not found" });
    }

    res.status(200).json({
      success: true,
      message: "Product deleted successfully",
      product: deletedProduct
    });

  } catch (err) {
    return res.status(400).json({
      success: false,
       message: err.message });
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

// ✅🔍 ADVANCED SEARCH + FILTER + PAGINATION
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
      message: err.message });
  }

})

// 📦 PRODUCT MANAGEMENT APIs ends



// orderSchema starts

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
      product: {
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
app.post("/api/orders",isAuthenticatedUser,async (req, res) => {
    try {
      // ------------------------------------------------------------
      // 📥 1️⃣ Extract order details from request body
      // ------------------------------------------------------------
      const { orderItems, shippingAddress, totalPrice } = req.body;

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
      // 📦 5️⃣ Check product stock & update quantity
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
      // 🧾 6️⃣ Create order document in database
      // ------------------------------------------------------------
      const order = await orderModel.create({
        user: req.user._id,        // logged-in user ID
        orderItems,                // ordered products
        shippingAddress,           // delivery address
        totalPrice                 // total order amount
      });

      // ------------------------------------------------------------
      // ✅ 7️⃣ Send success response
      // ------------------------------------------------------------
      res.status(201).json({
        success: true,
        message: "Order placed successfully",
        order
      });

    } catch (error) {
      // ------------------------------------------------------------
      // ❌ 8️⃣ Handle server errors
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


// ✅ GET SINGLE ORDER (USER / ADMIN)
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


// ✅ Get All Orders (Admin)
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


// ✅ Update Order Status (Admin)
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
    if (order.orderStatus === "delivered") {
      return res.status(400).json({
        success: false,
        message: "Order has already been delivered and cannot be updated"
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