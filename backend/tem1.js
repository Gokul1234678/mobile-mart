app.put(
  "/api/admin/users/:id",
  isAuthenticatedUser,
  isAdmin,
  async (req, res) => {

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

      // ======================================================
      // 📥 EXTRACT ROLE
      // ======================================================
      const { role } = req.body;

      // ======================================================
      // ❌ VALIDATE ROLE
      // ======================================================
      if (!role || !["user", "admin"].includes(role)) {
        return res.status(400).json({
          success: false,
          message: "Role must be either 'user' or 'admin'"
        });
      }

      // ======================================================
      // 💾 UPDATE USER ROLE
      // ======================================================
      const updatedUser = await userModel
        .findByIdAndUpdate(
          req.params.id,
          { role },
          {
            new: true,
            runValidators: true
          }
        )
        .select("-password");

      // ======================================================
      // ❌ USER NOT FOUND
      // ======================================================
      if (!updatedUser) {
        return res.status(404).json({
          success: false,
          message: "User not found"
        });
      }

      // ======================================================
      // ✅ SUCCESS RESPONSE
      // ======================================================
      res.status(200).json({
        success: true,
        message: "User role updated successfully",
        user: updatedUser
      });

    } catch (error) {

      // ======================================================
      // ❌ ERROR HANDLING
      // ======================================================
      res.status(500).json({
        success: false,
        message: "Invalid user ID"
      });
    }
  }
);