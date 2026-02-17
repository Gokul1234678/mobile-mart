import React, { useState } from "react";
import axiosInstance from "../axios_instance";
import { toast } from "react-toastify";
import { useNavigate, Link } from "react-router-dom";
import logo from "../assets/img/icons/logo.png";
import "../assets/styles/auth.css";

const ForgotPassword = () => {

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const submitHandler = async (e) => {
    e.preventDefault();

    if (!email) {
      toast.error("Please enter your email");
      return;
    }

    try {
      setLoading(true);

      const { data } = await axiosInstance.post(
        "/api/forgot-password",
        { email }
      );

      toast.success(data.message);

      // optional redirect
      // setTimeout(() => {
      //   navigate("/login");
      // }, 2500);

    } catch (error) {
      toast.error(
        error.response?.data?.message || "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">

      {/* Logo */}
      <div className="auth-logo">
        <img src={logo} alt="Mobile Mart" />
      </div>

      <div className="auth-card">

        <h3 className="text-center mb-2">Forgot Password</h3>
        <p className="text-muted text-center mb-4">
          Enter your email to receive reset link
        </p>

        <form onSubmit={submitHandler}>

          <input
            type="email"
            className="form-control auth-input mb-3"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <button
            type="submit"
            className="btn btn-primary w-100 auth-btn"
            disabled={loading}
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>

        </form>

        <div className="text-center mt-3">
          <Link to="/login">Back to Login</Link>
        </div>

      </div>
    </div>
  );
};

export default ForgotPassword;
