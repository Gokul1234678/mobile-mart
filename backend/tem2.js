// 📧 Email sending function (options = { email, subject, message })
const sendEmail = async (options) => {

  // ------------------------------------------------------------
  // 1️⃣ CREATE EMAIL TRANSPORTER
  // ------------------------------------------------------------
  // This creates a connection to your SMTP server.
  // You must define SMTP_HOST, SMTP_PORT, SMTP_EMAIL, SMTP_PASSWORD in .env file.
  // const transporter = nodemailer.createTransport({
  //   host: process.env.SMTP_HOST,     // e.g., smtp.gmail.com
  //   // port: process.env.SMTP_PORT,     // e.g., 587 or 465 it is used for secure connection
  //   // secure: false, // false for 587, true for 465 it is used for secure connection
  //   port: 465,     // e.g., 587 or 465 it is used for secure connection
  //   secure: true, // false for 587, true for 465 it is used for secure connection
  //   requireTLS: true,  // Use TLS encryption why? Because it encrypts the email during transmission, making it more secure and preventing interception by attackers.
  //   auth: {
  //     user: process.env.SMTP_EMAIL,  // your email address
  //     pass: process.env.SMTP_PASSWORD // your SMTP or App password
  //   }
  // });
  // const transporter = nodemailer.createTransport({
  //   service: "gmail",        // ← handles host/port/secure automatically
  //   auth: {
  //     user: process.env.SMTP_EMAIL,
  //     pass: process.env.SMTP_PASSWORD
  //   }
  // });
  console.log(
    "PASSWORD LENGTH:",
    process.env.SMTP_PASSWORD?.length
  );
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.SMTP_EMAIL,
      pass: process.env.SMTP_PASSWORD
    },
    tls: {
      rejectUnauthorized: false
    }
  });

  await transporter.verify();
  console.log("SMTP Connected Successfully");


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


    // 🔍 TEMP DEBUG — remove after fixing
    console.log("EMAIL CONFIG:", {
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      user: process.env.SMTP_EMAIL,
      passExists: !!process.env.SMTP_PASSWORD,
      frontendUrl: process.env.FRONTEND_URL
    });


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
      message: "Password reset link sent to email!"
      // resetUrl   🔥 For testing only — remove in production
    });




  } catch (error) {

    // ------------------------------------------------------------
    // ⚠️ Important: If sending email fails → reset token must be cleared
    // ------------------------------------------------------------
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({ validateBeforeSave: false });
    console.error("FULL EMAIL ERROR:", {
      message: error.message,
      code: error.code,
      response: error.response,
      responseCode: error.responseCode
    });
    // ------------------------------------------------------------
    // 8️⃣ Handle server errors
    // ------------------------------------------------------------
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
});