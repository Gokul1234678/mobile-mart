import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { logoutUser } from "../redux/userSlice";
import { toast, ToastContainer } from "react-toastify";
import { useNavigate, Link } from "react-router-dom";

// Images
import logo from "../assets/img/icons/logo.png";
import searchIcon from "../assets/img/icons/search.png";
import loginIcon from "../assets/img/icons/log in.png";
import userIcon from "../assets/img/icons/user.png";
import parcelIcon from "../assets/img/icons/parcel.png";
import cartIcon from "../assets/img/icons/cart2.png";
import logout3 from "../assets/img/icons/logout 3.png";
import logoutIcon from "../assets/img/icons/logout.png";
import shoppingCart from "../assets/img/icons/shopping-cart.png";

import "../assets/styles/navbar.css";
import "react-toastify/dist/ReactToastify.css";

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // 🔥 LOGOUT LOADING STATE
  const [logoutLoading, setLogoutLoading] = useState(false);

  const logoutHandler = async () => {
    setLogoutLoading(true);

    try {
      await dispatch(logoutUser()).unwrap();
      toast.success("Logged out successfully");
    } catch (err) {
      console.warn("Logout API failed:", err);
      toast.warning("Logged out locally");
    } finally {
      setLogoutLoading(false);
      navigate("/login");
    }
  };

  return (
    <>
      {/* ✅ REQUIRED for toast to show */}
      <ToastContainer position="top-right" autoClose={3000} />

      <nav className="navbar navbar-expand-lg" style={{ backgroundColor: "var(--voilet)" }}>
        <div className="container-fluid ms-lg-2 me-lg-2">

          {/* Brand Logo */}
          <Link className="navbar-brand" to="/">
            <img src={logo} className="cus-logo img-fluid" alt="MobileMart Logo" width="180" />
          </Link>

          {/* Toggler */}
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarSupportedContent"
          >
            <i className="fa-solid fa-bars" style={{ color: "#fff", fontSize: "40px" }}></i>
          </button>

          <div className="collapse navbar-collapse" id="navbarSupportedContent">
            <ul className="nav navbar-nav ms-auto align-items-lg-center">

              {/* Desktop Search */}
              <li className="nav-item d-none d-lg-flex">
                <Link to="/search" className="nav-link">
                  <img src={searchIcon} alt="Search" width="40" />
                </Link>
              </li>

              {/* Mobile Search */}
              <li
                className="nav-item d-lg-none py-2"
                onClick={() => navigate("/search")}
                style={{ cursor: "pointer" }}
              >
                <span className="nav-link">Search</span>
              </li>

              {/* Dropdown (Desktop) */}
              <li className="nav-item dropdown d-none d-lg-flex ms-2">
                <img src={loginIcon} alt="User" width="40" />
                <a className="nav-link dropdown-toggle text-white" data-bs-toggle="dropdown">
                  Gokul Selvan
                </a>

                <ul className="dropdown-menu">
                  <li>
                    <Link className="dropdown-item" to="/account-settings">My Profile</Link>
                  </li>
                  <li>
                    <Link className="dropdown-item" to="/my-orders">My Orders</Link>
                  </li>
                  <li>
                    <Link className="dropdown-item" to="/cart">My Cart</Link>
                  </li>
                  <li><hr className="dropdown-divider" /></li>

                  <li>
                    <button
                      className="dropdown-item text-danger"
                      onClick={logoutHandler}
                      disabled={logoutLoading}
                    >
                      {logoutLoading ? "Logging out..." : "Log Out"}
                    </button>
                  </li>
                </ul>
              </li>

              {/* Mobile Logout */}
              <li className="nav-item d-lg-none text-center py-2">
                <button
                  onClick={logoutHandler}
                  className="nav-link fw-bold bg-white rounded-3 border-0 w-100"
                  disabled={logoutLoading}
                  style={{ color: "red" }}
                >
                  {logoutLoading ? "Logging out..." : "Log out"}
                </button>
              </li>

              {/* Desktop Cart */}
              <li className="nav-item d-none d-lg-flex">
                <Link to="/cart" className="nav-link">
                  <img src={shoppingCart} alt="Cart" width="40" />
                </Link>
              </li>

              {/* Desktop Logout Icon */}
              <li className="nav-item d-none d-lg-flex">
                <button
                  onClick={logoutHandler}
                  className="nav-link border-0 bg-transparent"
                  disabled={logoutLoading}
                >
                  <img src={logoutIcon} alt="Logout" width="42" />
                </button>
              </li>

            </ul>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar;
