// React
import React, { useState } from "react";

// Router
import { useNavigate } from "react-router-dom";

// API
import axiosInstance from "../axios_instance";

// SEO
import { Helmet } from "react-helmet-async";

// Toast
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Styles
import "../assets/styles/register.css";

const Register = () => {
  const navigate = useNavigate();

  // -----------------------------
  // STATE
  // -----------------------------
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    gender: "",
    street: "",
    city: "",
    state: "",
    pincode: "",
  });

  // -----------------------------
  // HANDLE CHANGE
  // -----------------------------
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // -----------------------------
  // SUBMIT
  // -----------------------------
  const submitHandler = async (e) => {
    e.preventDefault();

    // 🔴 Validation
    // if (!formData.name!formData.email!formData.password) {
    //   toast.error("Name, Email and Password are required");
    //   return;
    // }

    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      setLoading(true);

      const res = await axiosInstance.post("/api/register", {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        gender: formData.gender,
        street: formData.street,
        city: formData.city,
        state: formData.state,
        pincode: formData.pincode,
      });

      toast.success(res.data.message || "Account created successfully");

      setTimeout(() => {
        navigate("/login");
      }, 2000);

    } catch (err) {
      toast.error(
        err.response?.data?.message || "Registration failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* ================= SEO ================= */}
      <Helmet>
        <title>Register | Mobile Mart</title>
        <meta
          name="description"
          content="Create a new account on Mobile Mart"
        />
      </Helmet>

      <ToastContainer position="top-right" autoClose={3000} />

      {/* ================= REGISTER UI ================= */}
      <div className="container register-page">
        <div className="register-card text-center">

          {/* LOGO */}
          <div className="cus-logo d-flex justify-content-start mb-3">
            <img src="/logo.png" alt="Mobile Mart" />
          </div>

          {/* HEADING */}
          <h2 className="fw-bold">Create Account</h2>
          <p className="text-muted mb-4">
            Find the Perfect Fit for Your Pocket
          </p>

          {/* FORM */}
          <form onSubmit={submitHandler}>

            {/* NAME */}
            <input
              type="text"
              className="form-control mb-3"
              placeholder="Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
            />

            {/* EMAIL */}
            <input
              type="email"
              className="form-control mb-3"
              placeholder="Email"
              name="email"
              value={formData.email}
              onChange={handleChange}
            />

            {/* PASSWORD */}
            <input
              type="password"
              className="form-control mb-3"
              placeholder="Password"
              name="password"
              value={formData.password}
              onChange={handleChange}
            />
            {/* CONFIRM PASSWORD */}
            <input
              type="password"
              className="form-control mb-4"
              placeholder="Confirm Password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
            />

            {/* ADDRESS LABEL */}
            <label className="form-label fw-bold my-3 text-start w-100">
              Add Address Details:
            </label>

            {/* STREET */}
            <textarea
              className="form-control mb-3"
              rows="2"
              placeholder="Enter Street Address"
              name="street"
              value={formData.street}
              onChange={handleChange}
            />

            {/* CITY / STATE / PIN */}
            <div className="row mb-4">
              <div className="col-md-4 mb-2">
                <input
                  type="text"
                  className="form-control"
                  placeholder="City"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                />
              </div>

              <div className="col-md-4 mb-2">
                <input
                  type="text"
                  className="form-control"
                  placeholder="State"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                />
              </div>

              <div className="col-md-4">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Pin Code"
                  name="pincode"
                  value={formData.pincode}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* SUBMIT */}
            <button
              type="submit"
              className="btn btn-custom w-100"
              disabled={loading}
            >
              {loading ? "Creating Account..." : "Create Account"}
            </button>
          </form>

          {/* LOGIN LINK */}
          <div className="login-text mt-3">
            Already have an account?{" "}
            <a href="/login">Login</a>
          </div>
        </div>
      </div>
    </>
  );
};

// export default Register;