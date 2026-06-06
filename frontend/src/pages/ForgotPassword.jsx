import React, { useState } from "react";
import axiosInstance from "../axios_instance";
import { toast } from "react-toastify";
import { useNavigate, Link } from "react-router-dom";
import logo from "../assets/img/icons/logo.png";
import "../assets/styles/auth.css";

const ForgotPassword = () => {

  // Set page title on mount
  document.title = "Forget Password | Mobile Mart";

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

      // toast.success(data.message);
      // why this toast is not showing? Because in server.js, we are sending the same message for both success and error cases ("Test email sent successfully"), so the frontend always receives a success message even when email sending fails. To fix this, we need to send different messages for success and error cases in server.js. For example, in the catch block of the forgot-password route, we can send a different error message like "Failed to send reset link. Please try again later." This way, the frontend can show the appropriate toast notification based on the response from the backend.
      toast.success(
        "Reset link sent successfully. Please check your email."
      );

      setEmail("");

      // optional redirect
      // why redirect after 2.5 seconds? Because we want to give the user some time to read the success message before navigating them back to the login page. If we navigate immediately, they might miss the toast notification. By adding a short delay, we ensure that they see the confirmation that the reset link was sent before being redirected to the login page.
      setTimeout(() => {
        navigate("/login");
      }, 2500);

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
          <button
  onClick={() =>
    toast.success("Toast is working")
  }
>
  Test Toast
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
