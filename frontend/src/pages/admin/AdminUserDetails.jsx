import React, { useEffect, useState } from "react";
import axiosInstance from "../../axios_instance";
import { toast } from "react-toastify";
import { useParams, useNavigate } from "react-router-dom";

// =============================================
// Self-contained styles — matches admin theme
// Same design language as Orders + Products pages
// =============================================
const styles = `

  /* ==========================================
     ANIMATIONS
  ========================================== */
  @keyframes aud-fadeUp {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  /* ==========================================
     PAGE WRAPPER
  ========================================== */
  .aud-page {
    font-family: inherit;
    animation: aud-fadeUp 0.4s ease both;
  }

  /* ==========================================
     PAGE HEADER — back button + title
  ========================================== */
  .aud-header {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-bottom: 24px;
    padding-bottom: 16px;
    border-bottom: 2px solid #ff5722; /* orange underline */
  }

  /* Back button */
  .aud-back-btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 8px 16px;
    background: transparent;
    color: #555;
    border: 1.5px solid #ddd;
    border-radius: 5px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: border-color 0.2s, color 0.2s, background 0.2s;
    flex-shrink: 0;
  }

  .aud-back-btn:hover {
    border-color: #ff5722;
    color: #ff5722;
    background: #fff3ef;
  }

  .aud-title {
    font-size: 2.1rem;
    font-weight: 700;
    color: #111;
    margin: 0;
  }

  /* ==========================================
     USER PROFILE HERO — avatar + name + role badge
  ========================================== */
  .aud-hero {
    background: #2b3643;           /* navy — matches sidebar */
    border-radius: 6px;
    padding: 28px 28px;
    margin-bottom: 20px;
    display: flex;
    align-items: center;
    gap: 20px;
    flex-wrap: wrap;
    animation: aud-fadeUp 0.4s ease both;
    animation-delay: 0.05s;
  }

  /* Large circular avatar with user initial */
  .aud-avatar {
    width: 68px;
    height: 68px;
    border-radius: 50%;
    background: #ff5722;           /* orange avatar */
    color: #fff;
    font-size: 1.6rem;
    font-weight: 700;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    text-transform: uppercase;
    border: 3px solid rgba(255,255,255,0.2);
  }

  .aud-hero-info {
    flex: 1;
  }

  /* User name in hero */
  .aud-hero-name {
    font-size: 1.5rem;
    font-weight: 700;
    color: #fff;
    margin-bottom: 4px;
  }

  /* Email below name */
  .aud-hero-email {
    font-size: 1rem;
    color: rgba(255,255,255,0.55);
  }

  /* Role badge — admin = orange, user = grey */
  .aud-role-badge {
    display: inline-block;
    padding: 5px 14px;
    border-radius: 4px;
    font-size: 0.88rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-top: 8px;
  }

  .aud-role-badge.admin { background: #ff5722; color: #fff; }   /* orange for admin */
  .aud-role-badge.user  { background: rgba(255,255,255,0.15); color: #fff; } /* subtle for user */

  /* ==========================================
     TWO COLUMN GRID LAYOUT
     Left: basic info   Right: address info
  ========================================== */
  .aud-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
    align-items: start;
  }

  /* ==========================================
     INFO CARD
  ========================================== */
  .aud-card {
    background: #fff;
    border-radius: 6px;
    padding: 22px 24px;
    box-shadow: 0 1px 6px rgba(0,0,0,0.08);
    position: relative;
    overflow: hidden;
    transition: box-shadow 0.2s;
    animation: aud-fadeUp 0.45s ease both;
  }

  .aud-card:hover {
    box-shadow: 0 4px 16px rgba(0,0,0,0.12);
  }

  /* Orange → violet top bar on hover */
  .aud-card::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 3px;
    background: linear-gradient(90deg, #ff5722, #6a0dad);
    transform: scaleX(0);
    transform-origin: left;
    transition: transform 0.3s ease;
  }

  .aud-card:hover::before {
    transform: scaleX(1);          /* sweeps in from left on hover */
  }

  /* Card section title */
  .aud-card-title {
    font-size: 1.15rem;
    font-weight: 700;
    color: #111;
    margin: 0 0 18px;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .aud-card-title-icon {
    font-size: 1.1rem;
  }

  /* ==========================================
     INFO ROWS — label + value pairs
  ========================================== */
  .aud-info-row {
    display: flex;
    align-items: baseline;
    gap: 10px;
    padding: 9px 0;
    border-bottom: 1px solid #f5f5f5; /* subtle row divider */
    font-size: 1.02rem;
  }

  .aud-info-row:last-child {
    border-bottom: none;
    padding-bottom: 0;
  }

  /* Field label — muted and fixed width */
  .aud-info-label {
    font-weight: 600;
    color: #777;
    white-space: nowrap;
    flex-shrink: 0;
    min-width: 90px;               /* aligns all values */
    font-size: 0.96rem;
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  /* Field value */
  .aud-info-value {
    color: #111;
    font-weight: 500;
    font-size: 1.02rem;
    word-break: break-word;        /* long IDs or emails wrap properly */
  }

  /* User ID — monospace font */
  .aud-info-value.mono {
    font-family: monospace;
    font-size: 0.94rem;
    color: #444;
  }

  /* Role value color — admin green, user black */
  .aud-info-value.role-admin { color: #198754; font-weight: 700; }
  .aud-info-value.role-user  { color: #111;    font-weight: 600; }

  /* N/A placeholder — muted */
  .aud-info-value.na {
    color: #bbb;
    font-style: italic;
  }

  /* ==========================================
     LOADING / NOT FOUND STATE
  ========================================== */
  .aud-state {
    text-align: center;
    padding: 80px 20px;
    color: #aaa;
    font-size: 1.1rem;
  }

  .aud-state-icon {
    font-size: 2.5rem;
    margin-bottom: 12px;
    opacity: 0.25;
  }

  /* ==========================================
     RESPONSIVE — stack to single column on mobile
  ========================================== */
  @media (max-width: 700px) {
    .aud-grid   { grid-template-columns: 1fr; }
    .aud-title  { font-size: 1.7rem; }
    .aud-hero   { padding: 20px; }
    .aud-avatar { width: 54px; height: 54px; font-size: 1.3rem; }
  }

  @media (max-width: 480px) {
    .aud-card { padding: 16px; }
    .aud-info-label { min-width: 75px; }
  }
`;

// =============================================
// HELPER — display value or N/A span
// =============================================
const Val = ({ value, mono }) => {
  if (!value) return <span className="aud-info-value na">N/A</span>;
  return <span className={`aud-info-value${mono ? " mono" : ""}`}>{value}</span>;
};

// =============================================
// MAIN COMPONENT
// =============================================
const AdminUserDetails = () => {

  const navigate  = useNavigate();
  const { id }    = useParams(); // user ID from URL → /admin/users/:id

  // ==========================================
  // STATE
  // ==========================================
  const [user,    setUser]    = useState(null);  // user object from API
  const [loading, setLoading] = useState(false); // fetch loading state

  // ==========================================
  // FETCH SINGLE USER
  // GET /api/admin/users/:id
  // ==========================================
  const fetchUser = async () => {
    try {
      setLoading(true);
      const { data } = await axiosInstance.get(
        `/api/admin/users/${id}`,
        { withCredentials: true } // send auth cookie
      );
      setUser(data.user);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load user");
    } finally {
      setLoading(false);
    }
  };

  // Run when component mounts or ID changes
  useEffect(() => {
    fetchUser();
  }, [id]);

  // ==========================================
  // LOADING STATE
  // ==========================================
  if (loading) {
    return (
      <>
        <style>{styles}</style>
        <div className="aud-state">
          <div className="aud-state-icon">👤</div>
          <div>Loading user...</div>
        </div>
      </>
    );
  }

  // ==========================================
  // USER NOT FOUND
  // ==========================================
  if (!user) {
    return (
      <>
        <style>{styles}</style>
        <div className="aud-state">
          <div className="aud-state-icon">❌</div>
          <div>User not found</div>
        </div>
      </>
    );
  }

  // ==========================================
  // RENDER
  // ==========================================
  return (
    <>
      <style>{styles}</style>
      <div className="aud-page">

        {/* ==========================================
            PAGE HEADER — back button + title
        ========================================== */}
        <div className="aud-header">
          <button className="aud-back-btn" onClick={() => navigate(-1)}>
            🡨 Users
          </button>
          <h2 className="aud-title">User Details</h2>
        </div>

        {/* ==========================================
            USER HERO — navy card with avatar + name
        ========================================== */}
        <div className="aud-hero">
          {/* Avatar circle with first letter of user name */}
          <div className="aud-avatar">
            {user.name?.charAt(0) || "U"}
          </div>
          <div className="aud-hero-info">
            <div className="aud-hero-name">{user.name}</div>
            <div className="aud-hero-email">{user.email}</div>
            {/* Role badge — orange for admin, grey for user */}
            <span className={`aud-role-badge ${user.role}`}>
              {user.role}
            </span>
          </div>
        </div>

        {/* ==========================================
            TWO COLUMN INFO GRID
        ========================================== */}
        <div className="aud-grid">

          {/* ---- Left: Basic Information ---- */}
          <div className="aud-card" style={{ animationDelay: "0.1s" }}>
            <div className="aud-card-title">
              <span className="aud-card-title-icon">🪪</span>
              Basic Information
            </div>

            {/* User ID — full MongoDB ID in monospace */}
            <div className="aud-info-row">
              <span className="aud-info-label">User ID</span>
              <Val value={user._id} mono />
            </div>

            <div className="aud-info-row">
              <span className="aud-info-label">Name</span>
              <Val value={user.name} />
            </div>

            <div className="aud-info-row">
              <span className="aud-info-label">Email</span>
              <Val value={user.email} />
            </div>

            <div className="aud-info-row">
              <span className="aud-info-label">Phone</span>
              <Val value={user.phone} />
            </div>

            <div className="aud-info-row">
              <span className="aud-info-label">Gender</span>
              <Val value={user.gender} />
            </div>

            {/* Role — green for admin, black for user */}
            <div className="aud-info-row">
              <span className="aud-info-label">Role</span>
              <span className={`aud-info-value role-${user.role}`}>
                {user.role}
              </span>
            </div>

          </div>

          {/* ---- Right: Address Information ---- */}
          <div className="aud-card" style={{ animationDelay: "0.15s" }}>
            <div className="aud-card-title">
              <span className="aud-card-title-icon">📍</span>
              Address Information
            </div>

            <div className="aud-info-row">
              <span className="aud-info-label">Street</span>
              <Val value={user.address?.street} />
            </div>

            <div className="aud-info-row">
              <span className="aud-info-label">City</span>
              <Val value={user.address?.city} />
            </div>

            <div className="aud-info-row">
              <span className="aud-info-label">State</span>
              <Val value={user.address?.state} />
            </div>

            <div className="aud-info-row">
              <span className="aud-info-label">Pincode</span>
              <Val value={user.address?.pincode} />
            </div>

          </div>

        </div>
      </div>
    </>
  );
};

export default AdminUserDetails;