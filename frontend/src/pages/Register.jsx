// React
import React, { useState } from "react";

// Router
import { Link, useNavigate } from "react-router-dom";

// API
import axiosInstance from "../axios_instance";

// SEO
import { Helmet } from "react-helmet-async";

// Toast
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Styles
import "../assets/styles/register.css";

// Logo image
import logo from "../assets/img/icons/logo.png";

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
        phone: "",
        gender: "",
        street: "",
        city: "",
        state: "",
        pincode: "",
    });

    // -----------------------------
    // HANDLE INPUT CHANGE
    // -----------------------------
    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    // -----------------------------
    // SUBMIT HANDLER
    // -----------------------------
    const submitHandler = async (e) => {
        e.preventDefault();

        // 🔴 Basic validation
        if (!formData.name || !formData.email || !formData.password) {
            toast.error("Please fill all required fields");
            return;
        }

        // 🔴 Password length validation
        if (formData.password.length < 6) {
            toast.error("Password must be at least 6 characters");
            return;
        }

        // 🔴 Confirm Password validation
        if (formData.password !== formData.confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }

        // Even with required, always add JS validation:
        // Why?
        // Mobile browsers sometimes behave weird
        // Future UI changes won’t break validation

        if (!formData.gender) {
            toast.error("Please select gender");
            return;
        }
        if (!formData.phone) {
            toast.error("Phone number is required");
            return;
        }
        // remaining fields like(address,state,pin code) will be validated at backend or requiered attribute in form

        try {
            setLoading(true);

            // const res = await axiosInstance.post("/api/register", formData);

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

            toast.success(res.data.message || "Account created successfully!");

            // Redirect to login after success
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

    // console.log(formData);

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


            {/* ================= REGISTER PAGE ================= */}
            <div className="resgister-body">
                <div className="resgister-container">
                    <ToastContainer position="top-right" autoClose={6000} />
                    <div className="container">
                        {/* Header  */}
                        <div className="header mb-2 justify-content-center">
                            Welcome To
                            <img src={logo} alt="Brand Logo" />
                        </div>

                        <div className="sub-header my-5">
                            <p className="h1" style={{ color: "var(--voilet)" }}>Create an Account</p>
                            <p className="h5"> Find the Perfect Fit for Your Pocket</p>
                        </div>

                        {/* <!-- Form --> */}
                        <form onSubmit={submitHandler}>
                            {/* <!-- Name & Email --> */}
                            <div className="row mb-3">

                                {/* name */}
                                <div className="col-md-6 mb-2 mb-md-0">
                                    <div className="input-group">
                                        <span className="input-group-text"><i className="fas fa-user"></i></span>
                                        <input type="text" className="form-control" placeholder="Enter The Name"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>

                                {/* Email */}
                                <div className="col-md-6">
                                    <div className="input-group">
                                        <span className="input-group-text"><i className="fas fa-envelope"></i></span>
                                        <input type="email" className="form-control" placeholder="Enter The Email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* <!-- Password & Confirm Password --> */}
                            <div className="row mb-3">
                                <div className="col-md-6 mb-2 mb-md-0">
                                    <div className="input-group">
                                        <span className="input-group-text"><i className="fas fa-lock"></i></span>
                                        <input type="password" className="form-control" placeholder="Password"
                                            name="password"
                                            value={formData.password}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="input-group">
                                        <span className="input-group-text"><i className="fas fa-lock"></i></span>
                                        <input type="password" className="form-control" placeholder="Confirm Password"
                                            name="confirmPassword"
                                            value={formData.confirmPassword}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* <!-- Phone Number & Gender start--> */}
                            <div className="row mb-3">
                                {/* Phone Number */}
                                <div className="col-md-6 mb-2 mb-md-0">
                                    <div className="input-group">
                                        <span className="input-group-text"><i className="fas fa-phone"></i></span>
                                        <input type="text" className="form-control" placeholder="Phone Number"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Gender */}

                                <div className="col-md-6 my-md-2 my-3">
                                    <label className="form-check-label me-3 fw-bold">
                                        Gender:
                                    </label>

                                    <div className="form-check form-check-inline">
                                        <input
                                            className="form-check-input"
                                            type="radio"
                                            name="gender"
                                            id="male"
                                            value="male"
                                            checked={formData.gender === "male"}
                                            onChange={handleChange}
                                        />
                                        <label className="form-check-label" htmlFor="male">
                                            Male
                                        </label>
                                    </div>

                                    <div className="form-check form-check-inline">
                                        <input
                                            className="form-check-input"
                                            type="radio"
                                            name="gender"
                                            id="female"
                                            value="female"
                                            checked={formData.gender === "female"}
                                            onChange={handleChange}
                                        />
                                        <label className="form-check-label" htmlFor="female">
                                            Female
                                        </label>
                                    </div>
                                </div>

                            </div>
                            {/* <!-- Phone Number & Gender end --> */}

                            {/* <!-- Address Details --> */}
                            <label className="form-label fw-bold my-3">Add Address Details:</label>
                            <textarea className="form-control mb-3" rows="2" placeholder="Enter Street Address"
                                name="street"
                                value={formData.street}
                                onChange={handleChange}
                                required
                            ></textarea>

                            <div className="row mb-4 ">
                                {/* city */}
                                <div className="col-md-4 mb-2 mb-md-0">
                                    <input type="text" className="form-control" placeholder="City"
                                        name="city"
                                        value={formData.city}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                {/* state */}
                                <div className="col-md-4 mb-2 mb-md-0">
                                    <input type="text" className="form-control" placeholder="State"
                                        name="state"
                                        value={formData.state}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                {/* Pin Code */}
                                <div className="col-md-4">
                                    <input type="text" className="form-control" placeholder="Pin Code"
                                        name="pincode"
                                        value={formData.pinCode}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>

                            {/* <!-- Submit Button --> */}
                            <button type="submit" className="btn btn-custom btn-success w-100 py-2"
                                disabled={loading}
                            >{loading ? "Creating Account..." : "Create Account"}</button>
                        </form>

                        {/* <!-- Login Text --> */}
                        <div className="login-text">
                            Already have an account? <Link to="/login">Login</Link>
                        </div>
                    </div>

                </div>
            </div>




        </>
    );
};

export default Register;