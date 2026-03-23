import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../axios_instance";
import Navbar from "../components/Navbar";

// css for this page
const styles = `
  :root {
   
  }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to   { opacity: 1; }
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50%       { opacity: 0.45; }
  }

  @keyframes shimmer {
    0%   { background-position: -200% center; }
    100% { background-position: 200% center; }
  }

  /* ---- Page ---- */
  .orders-page {
    min-height: 100vh;
    background: var(--page-bg);
    padding: 40px 20px 80px;
    font-family: inherit;
    color: var(--text-primary);
  }

  .orders-inner {
    max-width: 860px;
    margin: 0 auto;
  }

  /* ---- Header ---- */
  .orders-header {
    display: flex;
    align-items: baseline;
    gap: 14px;
    margin-bottom: 32px;
    padding-bottom: 16px;
    border-bottom: 2px solid var(--orange);
    animation: fadeUp 0.4s ease both;
  }

  .orders-title {
    font-size: 2.2rem;
    font-weight: 700;
    color: var(--text-primary);
    margin: 0;
    letter-spacing: -0.02em;
  }

  .orders-count-badge {
    background: var(--orange);
    color: #fff;
    font-size: 0.72rem;
    font-weight: 700;
    letter-spacing: 0.06em;
    padding: 3px 10px;
    border-radius: 20px;
    text-transform: uppercase;
  }

  /* ---- Loader ---- */
  .orders-loader {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 80px 20px;
    gap: 14px;
    animation: fadeIn 0.3s ease;
  }

  .orders-spinner {
    width: 40px;
    height: 40px;
    border: 3px solid #f0ece5;
    border-top-color: var(--orange);
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  .orders-loader p {
    font-size: 0.9rem;
    color: var(--text-muted);
    animation: pulse 1.4s ease infinite;
  }

  /* ---- Empty State ---- */
  .orders-empty {
    text-align: center;
    padding: 80px 20px;
    animation: fadeUp 0.5s ease both;
  }

  .orders-empty-icon {
    font-size: 3.5rem;
    margin-bottom: 16px;
    opacity: 0.2;
  }

  .orders-empty h3 {
    font-size: 1.4rem;
    font-weight: 700;
    color: var(--text-primary);
    margin-bottom: 8px;
  }

  .orders-empty p {
    font-size: 0.9rem;
    color: var(--text-muted);
    margin-bottom: 28px;
  }

  .orders-shop-btn {
    display: inline-block;
    padding: 12px 32px;
    background: var(--orange);
    color: #fff;
    border: none;
    border-radius: var(--radius-sm);
    font-size: 0.85rem;
    font-weight: 700;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    cursor: pointer;
    transition: background var(--transition), transform 0.15s;
    box-shadow: 0 4px 14px rgba(255,87,34,0.3);
  }

  .orders-shop-btn:hover {
    background: var(--violet);
    transform: translateY(-1px);
  }

  /* ---- Order Card ---- */
  .order-card {
    background: var(--card-bg);
    border-radius: var(--radius);
    padding: 22px 24px;
    margin-bottom: 16px;
    box-shadow: var(--shadow-sm);
    border-left: 3px solid transparent;
    transition: box-shadow var(--transition), transform var(--transition), border-color var(--transition);
    animation: fadeUp 0.4s ease both;
  }

  .order-card:hover {
    box-shadow: var(--shadow-md);
    transform: translateY(-2px);
    border-left-color: var(--orange);
  }

  /* ---- Card Top Row ---- */
  .order-card-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    flex-wrap: wrap;
    margin-bottom: 16px;
  }

  .order-id-block {}

  .order-id-label {
    font-size: 0.78rem;
    font-weight: 600;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 0.07em;
    margin-bottom: 2px;
  }

  .order-id-value {
    font-size: 0.9rem;
    font-weight: 700;
    color: var(--violet);
    word-break: break-all;
  }

  /* ---- Status Badge ---- */
  .status-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 5px 12px;
    border-radius: 20px;
    font-size: 0.82rem;
    font-weight: 700;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    flex-shrink: 0;
  }

  .status-badge.pending {
    background: var(--yellow-light);
    color: var(--yellow);
    border: 1px solid #fde68a;
  }

  .status-badge.processing {
    background: var(--orange-light);
    color: var(--orange);
    border: 1px solid #ffccbc;
  }

  .status-badge.delivered {
    background: var(--green-light);
    color: var(--green);
    border: 1px solid #a5d6a7;
  }

  .status-badge.cancelled {
    background: var(--red-light);
    color: var(--red);
    border: 1px solid #ffcdd2;
  }

  .status-dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: currentColor;
    flex-shrink: 0;
  }

  /* ---- Card Meta Row ---- */
  .order-card-meta {
    display: flex;
    align-items: center;
    gap: 36px;
    flex-wrap: wrap;
    padding: 16px 0;
    border-top: 1px solid var(--border);
    border-bottom: 1px solid var(--border);
    margin-bottom: 16px;
  }

  .order-meta-item {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .order-meta-label {
    font-size: 0.78rem;
    color: var(--text-muted);
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }

  .order-meta-value {
    font-size: 1rem;
    font-weight: 600;
    color: var(--text-primary);
  }

  .order-meta-value.price {
    color: var(--violet);
    font-size: 1.1rem;
    font-weight: 700;
  }

  .order-meta-value.payment-cod {
    color: var(--yellow);
  }

  .order-meta-value.payment-online {
    color: var(--green);
  }

  .order-meta-value.pstatus-paid {
    color: var(--green);
    font-weight: 700;
  }

  .order-meta-value.pstatus-pending {
    color: var(--yellow);
    font-weight: 700;
  }

  .order-meta-value.pstatus-failed {
    color: var(--red);
    font-weight: 700;
  }

  /* ---- Items Preview ---- */
  .order-items-preview {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    margin-bottom: 16px;
  }

  .order-item-chip {
    background: #f5f5f5;
    border-radius: 6px;
    padding: 4px 10px;
    font-size: 0.85rem;
    color: var(--text-secondary);
    font-weight: 500;
    white-space: nowrap;
    max-width: 200px;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .order-item-chip span {
    color: var(--text-muted);
    margin-left: 3px;
  }

  /* ---- View Details Button ---- */
  .view-details-btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 9px 20px;
    background: var(--orange);
    color: #fff;
    border: none;
    border-radius: var(--radius-sm);
    font-size: 0.88rem;
    font-weight: 700;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    transition: background var(--transition), transform 0.15s, box-shadow var(--transition);
    box-shadow: 0 3px 10px rgba(255,87,34,0.3);
  }

  .view-details-btn::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(
      105deg,
      transparent 40%,
      rgba(255,255,255,0.2) 50%,
      transparent 60%
    );
    background-size: 200% auto;
    animation: shimmer 2.4s linear infinite;
  }

  .view-details-btn:hover {
    background: var(--violet);
    transform: translateY(-1px);
    box-shadow: 0 5px 16px rgba(106,13,173,0.4);
  }

  .view-details-btn svg {
    transition: transform var(--transition);
  }

  .view-details-btn:hover svg {
    transform: translateX(3px);
  }

  /* ---- Responsive ---- */
  @media (max-width: 600px) {
    .orders-title { font-size: 1.6rem; }
    .order-card { padding: 16px; }
    .order-card-meta { gap: 14px; }
    .order-card-top { gap: 8px; }
  }

  @media (max-width: 400px) {
    .orders-title { font-size: 1.35rem; }
    .order-meta-value { font-size: 0.85rem; }
  }
`;

// ==========================================
// 🧠 Helper Function: Format Date
// ==========================================
const formatDate = (dateStr) => {

  // Convert string → Date object
  const d = new Date(dateStr);

  // Format date in Indian style (DD Mon YYYY)
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};


// ==========================================
// 🧠 Helper Function: Status Config
// ==========================================
const getStatusConfig = (status) => {

  // Convert status to lowercase (safe comparison)
  const s = status?.toLowerCase();

  // Return class + label based on status
  if (s === "delivered") return { cls: "delivered", label: "Delivered" };
  if (s === "processing") return { cls: "processing", label: "Processing" };
  if (s === "cancelled") return { cls: "cancelled", label: "Cancelled" };

  // Default fallback
  return { cls: "pending", label: "Pending" };
};


// ==========================================
// 📦 MAIN COMPONENT: MyOrders
// ==========================================
const MyOrders = () => {

  // React Router navigation
  const navigate = useNavigate();

  // 🧠 Store orders list
  const [orders, setOrders] = useState([]);

  // 🔄 Loading state
  const [loading, setLoading] = useState(true);

  // ❌ Error state
  const [error, setError] = useState(null);


  // ==========================================
  // 📡 FETCH ORDERS FROM BACKEND
  // ==========================================
  useEffect(() => {

    const fetchOrders = async () => {
      try {

        // API call to get logged-in user's orders
        const { data } = await axiosInstance.get("/api/orders/my", {
          withCredentials: true, // send cookies for authentication
        });

        // Save orders in state
        setOrders(data.orders);

      } catch (err) {

        // Store error message
        setError(err.response?.data?.message || "Failed to load orders");

      } finally {

        // Stop loader in both success & error
        setLoading(false);
      }
    };

    // Call function on component mount
    fetchOrders();

  }, []); // empty dependency → runs once


  // ==========================================
  // 🎨 UI RENDER
  // ==========================================
  return (
    <>
      {/* Inline CSS styles */}
      <style>{styles}</style>

      <Navbar />
      <div className="orders-page">
        <div className="orders-inner">

          {/* ========================================== */}
          {/* 🧾 HEADER */}
          {/* ========================================== */}
          <div className="orders-header">
            <h1 className="orders-title">My Orders</h1>

            {/* Show total order count */}
            {!loading && orders.length > 0 && (
              <span className="orders-count-badge">
                {orders.length} {orders.length === 1 ? "order" : "orders"}
              </span>
            )}
          </div>


          {/* ========================================== */}
          {/* 🔄 LOADING STATE */}
          {/* ========================================== */}
          {loading && (
            <div className="orders-loader">
              <div className="orders-spinner" />
              <p>Loading your orders...</p>
            </div>
          )}


          {/* ========================================== */}
          {/* ❌ ERROR STATE */}
          {/* ========================================== */}
          {!loading && error && (
            <div className="orders-empty">
              <div className="orders-empty-icon">⚠️</div>
              <h3>Something went wrong</h3>
              <p>{error}</p>

              {/* Retry button reloads page */}
              <button
                className="orders-shop-btn"
                onClick={() => window.location.reload()}
              >
                Retry
              </button>
            </div>
          )}


          {/* ========================================== */}
          {/* 📭 EMPTY STATE */}
          {/* ========================================== */}
          {!loading && !error && orders.length === 0 && (
            <div className="orders-empty">
              <div className="orders-empty-icon">📦</div>
              <h3>No orders yet</h3>
              <p>Looks like you haven't placed any orders yet.</p>

              {/* Navigate to home */}
              <button
                className="orders-shop-btn"
                onClick={() => navigate("/")}
              >
                Start Shopping
              </button>
            </div>
          )}


          {/* ========================================== */}
          {/* 📦 ORDERS LIST */}
          {/* ========================================== */}
          {!loading && !error && orders.map((order, index) => {

            // Get status config (color + label)
            const status = getStatusConfig(order.orderStatus);

            return (
              <div
                key={order._id}
                className="order-card"

                // Animation delay for stagger effect
                style={{ animationDelay: `${index * 0.07}s` }}
              >

                {/* ========================================== */}
                {/* 🔝 TOP ROW: ORDER ID + STATUS */}
                {/* ========================================== */}
                <div className="order-card-top">

                  <div className="order-id-block">
                    <div className="order-id-label">Order ID</div>
                    <div className="order-id-value">{order._id}</div>
                  </div>

                  {/* Status badge */}
                  <span className={`status-badge ${status.cls}`}>
                    <span className="status-dot" />
                    {status.label}
                  </span>

                </div>


                {/* ========================================== */}
                {/* 📊 META DETAILS */}
                {/* ========================================== */}
                <div className="order-card-meta">

                  {/* Order Date */}
                  <div className="order-meta-item">
                    <span className="order-meta-label">Order Date</span>
                    <span className="order-meta-value">
                      {formatDate(order.createdAt)}
                    </span>
                  </div>

                  {/* Total Price */}
                  <div className="order-meta-item">
                    <span className="order-meta-label">Total</span>
                    <span className="order-meta-value price">
                      ₹{order.totalPrice?.toFixed(2)}
                    </span>
                  </div>

                  {/* Payment Method */}
                  <div className="order-meta-item">
                    <span className="order-meta-label">Payment</span>
                    <span
                      className={`order-meta-value payment-${order.paymentMethod?.toLowerCase()}`}
                    >
                      {order.paymentMethod === "COD"
                        ? "Cash on Delivery"
                        : "Online"}
                    </span>
                  </div>

                  {/* Items Count */}
                  <div className="order-meta-item">
                    <span className="order-meta-label">Items</span>
                    <span className="order-meta-value">
                      {order.orderItems?.length}
                    </span>
                  </div>

                  {/* Payment Status */}
                  <div className="order-meta-item">
                    <span className="order-meta-label">Payment Status</span>
                    <span
                      className={`order-meta-value pstatus-${order.paymentStatus?.toLowerCase()}`}
                    >
                      {order.paymentStatus
                        ? order.paymentStatus.charAt(0).toUpperCase() +
                          order.paymentStatus.slice(1)
                        : "Pending"}
                    </span>
                  </div>

                </div>


                {/* ========================================== */}
                {/* 🧾 ITEMS PREVIEW */}
                {/* ========================================== */}
                <div className="order-items-preview">

                  {/* Show first 3 items */}
                  {order.orderItems?.slice(0, 3).map((item, i) => (
                    <div key={i} className="order-item-chip">
                      {item.name} <span>×{item.quantity}</span>
                    </div>
                  ))}

                  {/* Show "+ more" if extra items */}
                  {order.orderItems?.length > 3 && (
                    <div className="order-item-chip">
                      +{order.orderItems.length - 3} more
                    </div>
                  )}

                </div>


                {/* ========================================== */}
                {/* 🔍 VIEW DETAILS BUTTON */}
                {/* ========================================== */}
                <button
                  className="view-details-btn"

                  // Navigate to order details page
                  onClick={() => navigate(`/orders/${order._id}`)}
                >
                  View Details

                  {/* Arrow Icon */}
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="9 18 15 12 9 6" />
                  </svg>

                </button>

              </div>
            );
          })}

        </div>
      </div>
    </>
  );
};

export default MyOrders;