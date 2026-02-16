import React from 'react'
import { useState } from 'react';
import { useDispatch } from "react-redux";
import { logoutUser } from "../redux/userSlice";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";

// ✅ import your image assets (place them in src/assets/img)
import logo from "../assets/img/icons/logo.png";
import searchIcon from "../assets/img/icons/search.png";
import loginIcon from "../assets/img/icons/log in.png";
import userIcon from "../assets/img/icons/user.png";
import parcelIcon from "../assets/img/icons/parcel.png";
import cartIcon from "../assets/img/icons/cart2.png";
import logout3 from "../assets/img/icons/logout 3.png";
import logoutIcon from "../assets/img/icons/logout.png";
import shoppingCart from "../assets/img/icons/shopping-cart.png";
import { useNavigate, Link } from "react-router-dom";

import MyProfile from '../pages/MyProfile';
import "../assets/styles/navbar.css"


const Navbar = () => {

  const dispatch = useDispatch();
  const navigate = useNavigate();
  // 🔥 LOGOUT LOADING STATE
  const [logoutLoading, setLogoutLoading] = useState(false);

  const {user, isAuthenticated} = useSelector((state) => state.user);

// console.log(isAuthenticated);


  const logoutHandler = async () => {
    setLogoutLoading(true);

    try {
      await dispatch(logoutUser()).unwrap();
      toast.success("Logged out successfully");
    } catch (err) {
      // Backend failed, but frontend logout still happens
      console.warn("Logout API failed:", err);
      toast.warning("Logged out locally");
    } finally {
      setLogoutLoading(false);
      navigate("/login");
    }
  };


  return (
    <>
     

      <nav className="navbar navbar-expand-lg" style={{ "backgroundColor": "var(--voilet)" }}>
        <div className="container-fluid ms-lg-2 me-lg-2">
          {/* Brand Logo */}
          <Link className="navbar-brand" to="/">
            <img
              src={logo}
              className="cus-logo img-fluid"
              alt="MobileMart Logo"
              width="180"
              style={{ borderRadius: "10px" }}
            />
          </Link>


          {/* Toggler button for mobile */}
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarSupportedContent"
            aria-controls="navbarSupportedContent"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <i className="fa-solid fa-bars" style={{ color: "#fff", fontSize: "40px" }}></i>
          </button>

          {/* Navbar links */}
          <div className="collapse navbar-collapse" id="navbarSupportedContent">
            <ul className="nav navbar-nav ms-auto text-start align-items-lg-center align-items-md-stretch">

              {/* Search icon (visible only on large screen) */}
              <li className="nav-item me-1 d-none d-lg-flex">
                <Link to="/search" className="nav-link d-flex align-items-center">
                  <img className="img-fluid" src={searchIcon} alt="Search" style={{ width: "2.5rem" }} />
                </Link>
              </li>

              {/* 🔍 Mobile Search (inside menu, no input box) */}
              <li
                className="nav-item d-lg-none border-bottom responsive-border py-2"
                onClick={() => navigate("/search")}
                style={{ cursor: "pointer" }}
              >
                <div className="nav-link d-flex align-items-center">
                  <i className="fa-solid fa-magnifying-glass me-2" style={{ fontSize: "1.2em" }}></i>
                  Search
                </div>
              </li>

              {/* Main navigation links */}
              <li className="nav-item me-3 border-bottom responsive-border py-2 products">
                <a href="#products" className="nav-link text-white">
                  Products
                </a>
              </li>

              <li className="nav-item me-3 border-bottom responsive-border py-2 contact">
                <a href="#contact" className="nav-link text-white">
                  Contact Us
                </a>
              </li>

              <li className="nav-item border-bottom responsive-border py-2 about">
                <a href="#footer" className="nav-link text-white">
                  About
                </a>
              </li>

              {/* Mobile view: My profile, orders, cart, logout */}
              <li className="nav-item d-lg-none border-bottom responsive-border py-2">
                <Link to="/account-settings" className="nav-link">
                  My Profile
                </Link>
              </li>

              <li className="nav-item d-lg-none border-bottom responsive-border py-2">
                <Link to="/my-orders" className="nav-link">
                  My Orders
                </Link>
              </li>

              <li className="nav-item d-lg-none border-bottom responsive-border py-2">
                <Link to="/cart" className="nav-link">
                  My Cart
                </Link>
              </li>

              <li className="nav-item text-center d-lg-none border-bottom responsive-border py-2">
                <button onClick={logoutHandler} disabled={logoutLoading} className="nav-link fw-bold bg-white rounded-3 border-0 w-100" style={{ color: "red" }}>
                  <img src={logout3} alt="logout" /> {logoutLoading ? "Logging out..." : "Log out"}
                </button>
              </li>

              {/* Desktop view dropdown */}
              <li className="nav-item dropdown d-none d-lg-flex ms-2">
                <img src={loginIcon} alt="User Icon" style={{ width: "2.5rem", height: "2.5rem" }} />
                <a
                  className="nav-link dropdown-toggle text-white"
                  href="#"
                  role="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  
                  {user?.name || "User"}

                </a>

                <ul className="dropdown-menu">
                  <li className="d-flex align-items-center justify-content-between ps-2">
                    <img src={userIcon} alt="Profile" />
                    <Link className="dropdown-item" to="/profile">
                      My Profile
                    </Link>
                  </li>

                  <li><hr className="dropdown-divider" /></li>

                  <li className="d-flex align-items-center justify-content-between ps-2">
                    <img src={parcelIcon} alt="Orders" />
                    <Link className="dropdown-item" to="/my-orders">
                      My Orders
                    </Link>
                  </li>

                  <li><hr className="dropdown-divider" /></li>

                  <li className="d-flex align-items-center justify-content-between ps-2">
                    <img src={cartIcon} alt="Cart" />
                    <Link className="dropdown-item" to="/cart">
                      My Cart
                    </Link>
                  </li>

                  <li><hr className="dropdown-divider" /></li>

                  <li className="d-flex align-items-center justify-content-between ps-2">
                    <img src={logout3} alt="Logout" />
                    <button onClick={logoutHandler} disabled={logoutLoading} className="dropdown-item text-danger border-0 bg-transparent">
                      {logoutLoading ? "Logging out..." : "Log out"}
                    </button>
                  </li>
                </ul>
              </li>
              {/* Cart & logout icons for desktop */}
              <li className="nav-item ms-2 d-none d-lg-flex">
                <Link to="/cart" className="nav-link d-flex align-items-center">
                  <img src={shoppingCart} alt="Cart" style={{ width: "2.5rem" }} />
                </Link>
              </li>

              {/* logout btn */}
              <li className="nav-item ms-2 d-none d-lg-flex">
                <button onClick={logoutHandler} disabled={logoutLoading} className="nav-link d-flex align-items-center border-0 bg-transparent">
                  <img src={logoutIcon} alt="Logout" style={{ width: "2.6rem" }} />
                </button>
              </li>

            </ul>

          </div>
        </div>

      </nav>
    </>
  )
}

export default Navbar