import { useEffect, useState } from "react";
import axiosInstance from "../../axios_instance";
import { toast } from "react-toastify";
import VideoLoader from "../../components/VideoLoader";

// =============================================
// Self-contained dashboard styles
// Matches admin theme: navy sidebar + orange/violet accents
// =============================================
const styles = `

  /* ==========================================
     ANIMATIONS
  ========================================== */

  /* Slide up + fade in — used on cards */
  @keyframes dash-fadeUp {
    from { opacity: 0; transform: translateY(18px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  /* Count-up shimmer on card values */
  @keyframes dash-shimmer {
    0%   { background-position: -200% center; }
    100% { background-position: 200% center; }
  }

  /* ==========================================
     PAGE WRAPPER
  ========================================== */
  .dash-page {
    font-family: inherit;
    padding: 4px 0;
  }

  /* ==========================================
     PAGE HEADER
  ========================================== */
  .dash-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 28px;
    flex-wrap: wrap;
    gap: 10px;
    animation: dash-fadeUp 0.4s ease both;
  }

  .dash-title {
    font-size: 1.7rem;
    font-weight: 700;
    color: #111;
    margin: 0;
    letter-spacing: -0.02em;
  }

  /* Subtitle — "Welcome back, Admin" */
  .dash-subtitle {
    font-size: 0.85rem;
    color: #888;
    margin: 4px 0 0;
  }

  /* Live badge on the right */
  .dash-live-badge {
    display: flex;
    align-items: center;
    gap: 6px;
    background: #e8f5e9;
    color: #2e7d32;
    border: 1px solid #a5d6a7;
    border-radius: 20px;
    padding: 5px 12px;
    font-size: 0.75rem;
    font-weight: 700;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  /* Pulsing green dot inside badge */
  .dash-live-dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: #4caf50;
    animation: dash-pulse 1.6s ease infinite;
  }

  @keyframes dash-pulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50%       { opacity: 0.5; transform: scale(0.8); }
  }

  /* ==========================================
     STAT CARDS GRID
     5 cards, 3 per row on medium, 1 per row on mobile
  ========================================== */
  .dash-cards-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 20px;
    margin-bottom: 32px;
  }

  /* ==========================================
     INDIVIDUAL STAT CARD
  ========================================== */
  .dash-card {
    border-radius: 14px;
    padding: 22px 20px;
    color: #fff;
    position: relative;
    overflow: hidden;          /* clip decorative circle */
    box-shadow: 0 4px 16px rgba(0,0,0,0.13);
    animation: dash-fadeUp 0.45s ease both;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
    cursor: default;
  }

  /* Lift on hover */
  .dash-card:hover {
    transform: translateY(-4px) scale(1.02);
    box-shadow: 0 10px 28px rgba(0,0,0,0.18);
  }

  /* Large decorative circle in top-right of card */
  .dash-card::before {
    content: '';
    position: absolute;
    top: -20px;
    right: -20px;
    width: 90px;
    height: 90px;
    border-radius: 50%;
    background: rgba(255,255,255,0.12); /* translucent white circle */
    pointer-events: none;
  }

  /* Smaller second circle */
  .dash-card::after {
    content: '';
    position: absolute;
    bottom: -15px;
    right: 30px;
    width: 50px;
    height: 50px;
    border-radius: 50%;
    background: rgba(255,255,255,0.08);
    pointer-events: none;
  }

  /* Icon row at top of card */
  .dash-card-icon {
    font-size: 1.8rem;
    margin-bottom: 12px;
    display: block;
    filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2));
  }

  /* Card label e.g. "Total Products" */
  .dash-card-label {
    font-size: 0.78rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.07em;
    opacity: 0.85;
    margin-bottom: 6px;
  }

  /* Big number value */
  .dash-card-value {
    font-size: 2rem;
    font-weight: 800;
    letter-spacing: -0.02em;
    line-height: 1;
  }

  /* Staggered animation delays — each card fades in slightly after the previous */
  .dash-card:nth-child(1) { animation-delay: 0.05s; }
  .dash-card:nth-child(2) { animation-delay: 0.10s; }
  .dash-card:nth-child(3) { animation-delay: 0.15s; }
  .dash-card:nth-child(4) { animation-delay: 0.20s; }
  .dash-card:nth-child(5) { animation-delay: 0.25s; }

  /* ==========================================
     QUICK INFO ROW — below cards
  ========================================== */
  .dash-info-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
    animation: dash-fadeUp 0.5s ease both;
    animation-delay: 0.3s;
  }

  .dash-info-card {
    background: #fff;
    border-radius: 14px;
    padding: 22px;
    box-shadow: 0 1px 4px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.04);
    transition: box-shadow 0.2s;
  }

  .dash-info-card:hover {
    box-shadow: 0 6px 20px rgba(0,0,0,0.1);
  }

  .dash-info-title {
    font-size: 0.8rem;
    font-weight: 700;
    color: #999;
    text-transform: uppercase;
    letter-spacing: 0.07em;
    margin-bottom: 14px;
    display: flex;
    align-items: center;
    gap: 6px;
  }

  /* Colored accent dot next to info card title */
  .dash-info-title-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    flex-shrink: 0;
  }

  .dash-metric-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 0;
    border-bottom: 1px solid #f5f5f5;
    font-size: 0.88rem;
  }

  .dash-metric-row:last-child {
    border-bottom: none;
  }

  .dash-metric-label {
    color: #555;
    font-weight: 500;
  }

  .dash-metric-value {
    font-weight: 700;
    color: #111;
  }

  /* ==========================================
     RESPONSIVE
  ========================================== */
  @media (max-width: 600px) {
    .dash-title     { font-size: 1.4rem; }
    .dash-card-value { font-size: 1.6rem; }
    .dash-cards-grid { grid-template-columns: 1fr 1fr; gap: 12px; }
    .dash-info-row   { grid-template-columns: 1fr; }
    .dash-card       { padding: 16px; }
  }

  @media (max-width: 380px) {
    .dash-cards-grid { grid-template-columns: 1fr; }
  }
`;

// =============================================
// STAT CARD COMPONENT
// Props: title, value, color (bg), icon, delay
// =============================================
const Card = ({ title, value, color, icon }) => (
  <div className="dash-card" style={{ background: color }}>
    {/* Emoji icon at top */}
    <span className="dash-card-icon">{icon}</span>
    {/* Label e.g. "Total Products" */}
    <div className="dash-card-label">{title}</div>
    {/* Big number value */}
    <div className="dash-card-value">{value}</div>
  </div>
);

// =============================================
// MAIN COMPONENT
// =============================================
const Dashboard = () => {

  // ==========================================
  // STATE
  // ==========================================
  const [data,    setData]    = useState(null);  // dashboard stats from API
  const [loading, setLoading] = useState(true);  // show loader while fetching

  // ==========================================
  // FETCH DASHBOARD DATA ON MOUNT
  // GET /api/admin/dashboard
  // ==========================================
  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const { data } = await axiosInstance.get(
          "/api/admin/dashboard",
          { withCredentials: true } // include cookies for auth
        );
        setData(data);
      } catch (err) {
        toast.error("Failed to load dashboard");
      } finally {
        setLoading(false); // hide loader regardless of result
      }
    };

    fetchDashboard();
  }, []); // empty dependency → run once on mount

  // ==========================================
  // LOADING STATE
  // ==========================================
  if (loading) {
    return <VideoLoader />;
  }

  // ==========================================
  // RENDER
  // ==========================================
  return (
    <>
      <style>{styles}</style>
      <div className="dash-page">

        {/* ==========================================
            PAGE HEADER
        ========================================== */}
        <div className="dash-header">
          <div>
            <h2 className="dash-title">Dashboard</h2>
            <p className="dash-subtitle">Welcome back, Admin 👋</p>
          </div>
          {/* Live indicator badge */}
          <div className="dash-live-badge">
            <span className="dash-live-dot" />
            Live
          </div>
        </div>

        {/* ==========================================
            STAT CARDS — 5 key metrics
        ========================================== */}
        <div className="dash-cards-grid">

          <Card
            title="Total Products"
            value={data.totalProducts}
            color="#6f42c1"       /* violet */
            icon="📦"
          />

          <Card
            title="Total Orders"
            value={data.totalOrders}
            color="#0d6efd"       /* blue */
            icon="🧾"
          />

          <Card
            title="Total Users"
            value={data.totalUsers}
            color="#198754"       /* green */
            icon="👥"
          />

          <Card
            title="Total Revenue"
            value={`₹${data.totalRevenue.toFixed(2)}`}
            color="#ff5722"       /* orange — matches app theme */
            icon="💰"
          />

          <Card
            title="Out of Stock"
            value={data.outOfStock}
            color="#dc3545"       /* red — warning color */
            icon="⚠️"
          />

        </div>

        {/* ==========================================
            QUICK INFO ROW — summary breakdown
        ========================================== */}
        <div className="dash-info-row">

          {/* Left info card — order/revenue summary */}
          <div className="dash-info-card">
            <div className="dash-info-title">
              <span className="dash-info-title-dot" style={{ background: "#0d6efd" }} />
              Order Summary
            </div>
            <div className="dash-metric-row">
              <span className="dash-metric-label">Total Orders</span>
              <span className="dash-metric-value">{data.totalOrders}</span>
            </div>
            <div className="dash-metric-row">
              <span className="dash-metric-label">Total Revenue</span>
              <span className="dash-metric-value">₹{data.totalRevenue.toFixed(2)}</span>
            </div>
            <div className="dash-metric-row">
              <span className="dash-metric-label">Avg. Order Value</span>
              {/* Avg = revenue ÷ orders, safe division to avoid NaN */}
              <span className="dash-metric-value">
                ₹{data.totalOrders > 0
                  ? (data.totalRevenue / data.totalOrders).toFixed(2)
                  : "0.00"}
              </span>
            </div>
          </div>

          {/* Right info card — inventory summary */}
          <div className="dash-info-card">
            <div className="dash-info-title">
              <span className="dash-info-title-dot" style={{ background: "#6f42c1" }} />
              Inventory Summary
            </div>
            <div className="dash-metric-row">
              <span className="dash-metric-label">Total Products</span>
              <span className="dash-metric-value">{data.totalProducts}</span>
            </div>
            <div className="dash-metric-row">
              <span className="dash-metric-label">Out of Stock</span>
              {/* Red color for out-of-stock warning */}
              <span className="dash-metric-value" style={{ color: "#dc3545" }}>
                {data.outOfStock}
              </span>
            </div>
            <div className="dash-metric-row">
              <span className="dash-metric-label">In Stock</span>
              {/* In stock = total - out of stock */}
              <span className="dash-metric-value" style={{ color: "#198754" }}>
                {data.totalProducts - data.outOfStock}
              </span>
            </div>
          </div>

        </div>

      </div>
    </>
  );
};

export default Dashboard;