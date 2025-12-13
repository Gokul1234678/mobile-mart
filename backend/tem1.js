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
