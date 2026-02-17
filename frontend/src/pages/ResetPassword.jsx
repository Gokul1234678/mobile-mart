import React, { useState } from "react";
import axiosInstance from "../axios_instance";
import { useParams, useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import logo from "../assets/img/icons/logo.png";
import "../assets/styles/auth.css";

const ResetPassword = () => {

  // ==============================================
  // 🔹 Get reset token from URL
  // Example: /reset-password/abc123
  // ==============================================
  const { token } = useParams();

  const navigate = useNavigate();

  // ==============================================
  // 🔹 State management
  // ==============================================
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // ==============================================
  // 🔹 Submit Handler
  // ==============================================
  const submitHandler = async (e) => {
    e.preventDefault();

    // Validate password length
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    // Check confirm password
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      setLoading(true);

      const { data } = await axiosInstance.post(
        `/api/reset-password/${token}`,
        { newPassword }
      );

      toast.success(data.message);

      // Redirect to login after success
      setTimeout(() => {
        navigate("/login");
      }, 2000);

    } catch (error) {
      toast.error(
        error.response?.data?.message || "Invalid or expired token"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">

      {/* ================= Logo ================= */}
      <div className="auth-logo">
        <img src={logo} alt="Mobile Mart" />
      </div>

      {/* ================= Card ================= */}
      <div className="auth-card">

        <h3 className="text-center mb-2">Reset Password</h3>
        <p className="text-muted text-center mb-4">
          Enter your new password below
        </p>

        <form onSubmit={submitHandler}>

          {/* 🔐 New Password */}
          <div className="input-group mb-3">
            <input
              type={showPassword ? "text" : "password"}
              className="form-control auth-input"
              placeholder="Enter new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />

            <span
              className="input-group-text cursor-pointer"
              onClick={() => setShowPassword(!showPassword)}
            >
              <i className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"}`}></i>
            </span>
          </div>

          {/* 🔐 Confirm Password */}
          <div className="input-group mb-4">
            <input
              type={showConfirmPassword ? "text" : "password"}
              className="form-control auth-input "
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />

            <span
              className="input-group-text cursor-pointer"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              <i className={`bi ${showConfirmPassword ? "bi-eye-slash" : "bi-eye"}`}></i>
            </span>
          </div>

          <button
            type="submit"
            className="btn btn-success w-100 auth-btn"
            disabled={loading}
          >
            {loading ? "Updating..." : "Reset Password"}
          </button>
        </form>

        <div className="text-center mt-3">
          <Link to="/login">Back to Login</Link>
        </div>

      </div>
    </div>
  );
};

export default ResetPassword;
