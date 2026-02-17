// React core hooks
// useState → manage form input state
// useEffect → run side effects (redirects, toasts)
import React, { useState, useEffect } from "react";

// Redux hooks
// useDispatch → send actions to Redux store
// useSelector → read data from Redux store
import { useDispatch, useSelector } from "react-redux";

// Async login action from userSlice
import { loginUser } from "../redux/userSlice";

// React Router hook for navigation
import { Link, useNavigate } from "react-router-dom";

// Toast notifications
import { toast, ToastContainer } from "react-toastify";

// SEO management for React
import { Helmet } from "react-helmet-async";

// Page-specific styles
import "../assets/styles/loginPage.css";

// Logo image
import logo from "../assets/img/icons/logo.png";


const Login = () => {
  /* ======================================================
     🧠 HOOK INITIALIZATION
     ====================================================== */

  // Used to dispatch Redux actions(functions)
  const dispatch = useDispatch();

  // Used to redirect user after successful login
  const navigate = useNavigate();

  /*
    Extract required values from Redux store
    state.user comes from userSlice reducer
  */
  const { loading, error, isAuthenticated } = useSelector(
    (state) => state.user
  );

  /* ======================================================
     📄 LOCAL STATE (FORM INPUTS)
     ====================================================== */

  // Email input state
  const [email, setEmail] = useState("");
  // console.log(email);

  // Password input state
  const [password, setPassword] = useState("");

  /* ======================================================
     🔁 SIDE EFFECTS
     ====================================================== */

  /*
    Redirect user after successful login
    Runs whenever isAuthenticated changes
  */
  useEffect(() => {
    if (isAuthenticated) {
      toast.success("Login successful 🎉"); // success message
      navigate("/"); // redirect to home page
    }
  }, [isAuthenticated, navigate]);

  /*
    Show error toast if login fails
    Runs whenever error value changes
  */
  useEffect(() => {
    if (error) {
      toast.error(error); // backend error message
    }
  }, [error]);

  /* ======================================================
     📤 FORM SUBMIT HANDLER
     ====================================================== */

  const submitHandler = (e) => {
    e.preventDefault(); // prevent page refresh

    // ✅ FRONTEND VALIDATION
    if (!email || !password) {
      toast.error("Email and password are required");
      return;
    }

    // Simple email format check
    if (!email.includes("@")) {
      toast.error("Please enter a valid email");
      return;
    }


    /*
      Dispatch Redux async action
      This triggers:
      - loginUser.pending
      - loginUser.fulfilled OR rejected
    */
    dispatch(loginUser({ email, password }));
  };

  /* ======================================================
     🎨 UI RENDER
     ====================================================== */

  return (
    <>
      <div className="body-con">
        {/* ================= SEO ================= */}
        <Helmet>
          <title>Login | Mobile Mart</title>
          <meta
            name="description"
            content="Login to Mobile Mart to explore the best smartphone deals."
          />
        </Helmet>

        <ToastContainer
          position="top-center"
          autoClose={3000}
          hideProgressBar={false}
        />
        {/* showing eorror if password or email is incorrect */}
        {/* {
        error && (
          <p className="text-danger text-center mt-2 fa-2">
            {error}
          </p>
        )
      } */}
        {/* ================= LOGIN CONTAINER ================= */}
        <div className="login-container text-center">

          {/* LOGO */}
          <div className="cus-logo login-logo mb-3">
            <img src={logo} alt="Mobile Mart" />
          </div>

          {/* HEADING */}
          <h2 className="fw-bold title-welcome">Welcome Back!</h2>
          <p className="text-muted">Find the Perfect Fit for Your Pocket</p>

          {/* ================= LOGIN FORM ================= */}
          <form onSubmit={submitHandler}>

            {/* EMAIL INPUT */}
            <div className="input-group mb-3">
              <span className="input-group-text bg-light">
                <i className="fas fa-envelope"></i>
              </span>
              <input
                type="email"
                className="form-control"
                placeholder="Enter The Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)} // update state
                required
              />
            </div>

            {/* PASSWORD INPUT */}
            <div className="input-group mb-2">
              <span className="input-group-text bg-light">
                <i className="fas fa-lock"></i>
              </span>
              <input
                type="password"
                className="form-control"
                placeholder="Enter The Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)} // update state
                required
              />
            </div>

            {/* FORGOT PASSWORD LINK */}

            <Link to="/forgot-password" className="text-primary forgot-password">
              Forgot Password?
            </Link>


            {/* SUBMIT BUTTON */}
            <button
              type="submit"
              className="login-btn  w-100 mt-3"
              disabled={loading} // disable while API call is running
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          {/* REGISTER LINK */}
          <p className="mt-4">
            Don’t have an account? <Link to="/register">Register</Link>
          </p>
        </div>
      </div>
    </>
  );
};

export default Login;
