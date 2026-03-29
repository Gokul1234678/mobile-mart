import { useSelector, useDispatch } from "react-redux";
import { logoutUser } from "../redux/userSlice";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import logo from "../assets/img/icons/logo.png";

// =============================================
// Self-contained navbar styles
// White bar with orange/violet accent theme
// =============================================
const navbarStyles = `

  /* ==========================================
     ADMIN NAVBAR
  ========================================== */
  .admin-navbar {
    height: 62px;
    background: #ffffff;
    border-bottom: 1px solid #ebebeb;   /* subtle bottom divider */
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 24px;
    gap: 16px;
    position: sticky;                   /* stays at top while scrolling */
    top: 0;
    z-index: 100;
    box-shadow: 0 1px 4px rgba(0,0,0,0.05);
  }

  /* ==========================================
     LEFT SECTION — hamburger + logo + title
  ========================================== */
  .admin-navbar-left {
    display: flex;
    align-items: center;
    gap: 14px;
    flex-shrink: 0;
  }

  /* Hamburger menu button — visible on mobile only */
  .admin-hamburger {
    display: none;                      /* hidden on desktop */
    background: none;
    border: 1.5px solid #e0e0e0;
    border-radius: 6px;
    width: 36px;
    height: 36px;
    cursor: pointer;
    align-items: center;
    justify-content: center;
    font-size: 1.1rem;
    color: #333;
    transition: background 0.2s, border-color 0.2s;
    flex-shrink: 0;
  }

  .admin-hamburger:hover {
    background: #f5f5f5;
    border-color: #bbb;
  }

  /* Logo image */
  .admin-navbar-logo {
    height: 36px;
    width: auto;
    border-radius: 6px;
    object-fit: contain;
  }

  /* "Admin" label next to logo */
  .admin-navbar-title {
    font-size: 1rem;
    font-weight: 700;
    color: #111;
    margin: 0;
    letter-spacing: -0.01em;
    white-space: nowrap;
  }

  /* ==========================================
     CENTER SECTION — search bar
  ========================================== */
  .admin-navbar-search {
    flex: 1;
    max-width: 380px;
    position: relative;
  }

  /* Search icon inside input */
  .admin-search-icon {
    position: absolute;
    left: 12px;
    top: 50%;
    transform: translateY(-50%);
    color: #aaa;
    font-size: 0.9rem;
    pointer-events: none; /* don't block clicks on input */
  }

  .admin-search-input {
    width: 100%;
    padding: 8px 14px 8px 36px; /* left padding for icon */
    border: 1.5px solid #e8e8e8;
    border-radius: 20px;
    font-size: 0.88rem;
    font-family: inherit;
    color: #333;
    background: #f9f9f9;
    outline: none;
    transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
    box-sizing: border-box;
  }

  /* Focus: orange border + soft glow */
  .admin-search-input:focus {
    border-color: #ff5722;
    background: #fff;
    box-shadow: 0 0 0 3px rgba(255,87,34,0.1);
  }

  .admin-search-input::placeholder {
    color: #bbb;
  }

  /* ==========================================
     RIGHT SECTION — user name + logout
  ========================================== */
  .admin-navbar-right {
    display: flex;
    align-items: center;
    gap: 14px;
    flex-shrink: 0;
  }

  /* User avatar circle with initials */
  .admin-user-avatar {
    width: 34px;
    height: 34px;
    border-radius: 50%;
    background: #6a0dad;              /* violet */
    color: #fff;
    font-size: 0.82rem;
    font-weight: 700;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  /* User name text — hidden on small screens */
  .admin-user-name {
    font-size: 0.88rem;
    font-weight: 600;
    color: #333;
    white-space: nowrap;
  }

  /* Logout button — red outlined */
  .admin-logout-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 7px 16px;
    background: #fff5f5;              /* light red bg */
    color: #e53935;                   /* red text */
    border: 1.5px solid #ffcdd2;      /* soft red border */
    border-radius: 8px;
    font-size: 0.82rem;
    font-weight: 700;
    letter-spacing: 0.03em;
    cursor: pointer;
    transition: background 0.2s, color 0.2s, border-color 0.2s, transform 0.15s;
    white-space: nowrap;
  }

  /* Hover: fill red */
  .admin-logout-btn:hover {
    background: #e53935;
    color: #fff;
    border-color: #e53935;
    transform: translateY(-1px);
  }

  /* ==========================================
     RESPONSIVE
  ========================================== */
  @media (max-width: 768px) {

    /* Show hamburger on mobile */
    .admin-hamburger {
      display: flex;
    }

    /* Reduce navbar padding */
    .admin-navbar {
      padding: 0 14px;
      gap: 10px;
    }

    /* Hide search on very small screens */
    .admin-navbar-search {
      display: none;
    }

    /* Hide user name text — keep avatar + button */
    .admin-user-name {
      display: none;
    }

    /* Smaller logout button on mobile */
    .admin-logout-btn {
      padding: 6px 10px;
      font-size: 0.78rem;
    }
  }

  @media (max-width: 400px) {
    /* Hide logo title on very small screens */
    .admin-navbar-title {
      display: none;
    }
  }
`;

// =============================================
// COMPONENT
// Props:
//   onMenuToggle — function, opens/closes sidebar on mobile
// =============================================
const AdminNavbar = ({ onMenuToggle }) => {

  const { user }   = useSelector((state) => state.user);
  const dispatch   = useDispatch();
  const navigate   = useNavigate();

  const [search, setSearch] = useState(""); // search input value

  // ==========================================
  // LOGOUT HANDLER
  // Dispatches logout action then redirects to login
  // ==========================================
  const logoutHandler = async () => {
    await dispatch(logoutUser());
    navigate("/login");
  };

  // ==========================================
  // SEARCH HANDLER
  // Navigates to search page on form submit
  // ==========================================
  const handleSearch = (e) => {
    e.preventDefault();              // prevent page reload
    navigate(`/search`);
    // later → navigate(`/admin/products?keyword=${search}`)
  };

  // Get first letter of user's name for avatar initials
  const initials = user?.name?.charAt(0) || "A";

  return (
    <>
      <style>{navbarStyles}</style>

      <header className="admin-navbar">

        {/* ── LEFT: Hamburger (mobile) + Logo + Title ── */}
        <div className="admin-navbar-left">

          {/* Hamburger — calls parent toggle to open sidebar */}
          <button className="admin-hamburger" onClick={onMenuToggle}>
            ☰
          </button>

          {/* App logo */}
          <img src={logo} alt="Mobile Mart" className="admin-navbar-logo" />

          {/* Page label */}
          <h5 className="admin-navbar-title">Admin</h5>

        </div>

        {/* ── CENTER: Search Bar ── */}
        <form className="admin-navbar-search" onSubmit={handleSearch}>
          <span className="admin-search-icon">🔍</span>
          <input
            type="text"
            className="admin-search-input"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onClick={() => navigate("/search")} // clicking navigates to search page
          />
        </form>

        {/* ── RIGHT: User Info + Logout ── */}
        <div className="admin-navbar-right">

          {/* Violet avatar circle with user's initial */}
          <div className="admin-user-avatar">{initials}</div>

          {/* User's full name — hidden on mobile */}
          <span className="admin-user-name">{user?.name}</span>

          {/* Logout button */}
          <button className="admin-logout-btn" onClick={logoutHandler}>
            <span>⏻</span>
            Logout
          </button>

        </div>

      </header>
    </>
  );
};

export default AdminNavbar;