import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axiosInstance from "../../axios_instance";
import { toast } from "react-toastify";

/* ─── Styles ─────────────────────────────────────────────────── */
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;600&family=DM+Sans:wght@400;500;600&display=swap');

  .aod-root {
    font-family: 'DM Sans', sans-serif;
    background: #f4f3ef;
    min-height: 100vh;
    padding: 40px 20px 80px;
    color: #1a1a1a;
  }

  .aod-container {
    max-width: 760px;
    margin: 0 auto;
  }

  /* ── Header ── */
  .aod-header {
    display: flex;
    align-items: baseline;
    gap: 14px;
    margin-bottom: 32px;
  }

  .aod-header h2 {
    font-size: 26px;
    font-weight: 600;
    letter-spacing: -0.5px;
    margin: 0;
  }

  .aod-header .aod-order-id {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 12px;
    color: #888;
    background: #e8e6e0;
    padding: 3px 9px;
    border-radius: 4px;
    letter-spacing: 0.3px;
  }

  /* ── Card ── */
  .aod-card {
    background: #ffffff;
    border: 1.5px solid #e2e0d8;
    border-radius: 12px;
    padding: 24px 28px;
    margin-bottom: 16px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.04);
    animation: aod-fadeUp 0.35s ease both;
  }

  .aod-card:nth-child(2) { animation-delay: 0.05s; }
  .aod-card:nth-child(3) { animation-delay: 0.10s; }
  .aod-card:nth-child(4) { animation-delay: 0.15s; }
  .aod-card:nth-child(5) { animation-delay: 0.20s; }
  .aod-card:nth-child(6) { animation-delay: 0.25s; }

  @keyframes aod-fadeUp {
    from { opacity: 0; transform: translateY(10px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .aod-card-title {
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 1.2px;
    color: #999;
    margin: 0 0 16px;
    padding-bottom: 12px;
    border-bottom: 1px solid #eeece6;
  }

  /* ── Field rows ── */
  .aod-row {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    padding: 7px 0;
    border-bottom: 1px dashed #f0ede7;
    font-size: 14.5px;
    line-height: 1.5;
  }

  .aod-row:last-child { border-bottom: none; }

  .aod-label {
    color: #777;
    font-size: 13px;
    font-weight: 500;
    min-width: 140px;
    flex-shrink: 0;
  }

  .aod-value {
    color: #1a1a1a;
    font-weight: 500;
    text-align: right;
    word-break: break-word;
  }

  .aod-value.mono {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 12.5px;
    color: #555;
  }

  /* ── Status Badge ── */
  .aod-badge {
    display: inline-block;
    font-size: 11.5px;
    font-weight: 600;
    text-transform: capitalize;
    letter-spacing: 0.4px;
    padding: 3px 10px;
    border-radius: 20px;
  }

  .aod-badge.processing { background: #fff3e0; color: #e65100; }
  .aod-badge.shipped    { background: #e3f2fd; color: #1565c0; }
  .aod-badge.delivered  { background: #e8f5e9; color: #2e7d32; }
  .aod-badge.cancelled  { background: #fce4ec; color: #b71c1c; }
  .aod-badge.paid       { background: #e8f5e9; color: #2e7d32; }
  .aod-badge.unpaid     { background: #fce4ec; color: #b71c1c; }
  .aod-badge.pending    { background: #fff3e0; color: #e65100; }

  /* ── Order Items ── */
  .aod-item {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 14px 0;
    border-bottom: 1px solid #f0ede7;
  }

  .aod-item:last-child { border-bottom: none; }

  .aod-item img {
    width: 64px;
    height: 64px;
    object-fit: cover;
    border-radius: 8px;
    border: 1px solid #e2e0d8;
    flex-shrink: 0;
    background: #f4f3ef;
  }

  .aod-item-info {
    flex: 1;
    min-width: 0;
  }

  .aod-item-name {
    font-size: 14.5px;
    font-weight: 600;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    margin: 0 0 4px;
  }

  .aod-item-meta {
    font-size: 13px;
    color: #888;
    margin: 0;
  }

  .aod-item-price {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 14px;
    font-weight: 600;
    color: #1a1a1a;
    white-space: nowrap;
  }

  /* ── Price Summary ── */
  .aod-price-row {
    display: flex;
    justify-content: space-between;
    font-size: 14px;
    padding: 7px 0;
    color: #555;
    border-bottom: 1px dashed #f0ede7;
  }

  .aod-price-row.total {
    border-bottom: none;
    border-top: 1.5px solid #1a1a1a;
    margin-top: 8px;
    padding-top: 14px;
    font-size: 16px;
    font-weight: 600;
    color: #1a1a1a;
  }

  .aod-price-row span:last-child {
    font-family: 'IBM Plex Mono', monospace;
    font-weight: 600;
  }

  /* ── States ── */
  .aod-state {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 240px;
    font-size: 15px;
    color: #aaa;
    font-style: italic;
  }

  .aod-spinner {
    width: 28px;
    height: 28px;
    border: 3px solid #e2e0d8;
    border-top-color: #1a1a1a;
    border-radius: 50%;
    animation: aod-spin 0.7s linear infinite;
    margin-right: 12px;
  }

  @keyframes aod-spin {
    to { transform: rotate(360deg); }
  }
`;

/* ─── Helpers ────────────────────────────────────────────────── */
// Returns CSS class for status badges based on the status value
const badgeClass = (status) =>
  `aod-badge ${status?.toLowerCase() || ""}`;// Formats a date string into a readable format

const fmt = (dateStr) =>
  new Date(dateStr).toLocaleString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });

/* ─── Component ──────────────────────────────────────────────── */
const AdminOrderDetails = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const { data } = await axiosInstance.get(`/api/orders/${id}`, {
        withCredentials: true,
      });
      setOrder(data.order);
    } catch {
      toast.error("Failed to load order");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrder(); }, [id]);

  if (loading)
    return (
      <>
        <style>{styles}</style>
        <div className="aod-root">
          <div className="aod-state">
            <div className="aod-spinner" /> Loading order…
          </div>
        </div>
      </>
    );

  if (!order)
    return (
      <>
        <style>{styles}</style>
        <div className="aod-root">
          <div className="aod-state">Order not found.</div>
        </div>
      </>
    );

  return (
    <>
      <style>{styles}</style>

      <div className="aod-root">
        <div className="aod-container">

          {/* Header */}
          <div className="aod-header">
            <h2>Order Details</h2>
            <span className="aod-order-id">#{order._id?.slice(-8).toUpperCase()}</span>
          </div>

          {/* Customer */}
          <div className="aod-card">
            <p className="aod-card-title">Customer</p>
            <div className="aod-row">
              <span className="aod-label">Name</span>
              <span className="aod-value">{order.user?.name}</span>
            </div>
            <div className="aod-row">
              <span className="aod-label">Email</span>
              <span className="aod-value">{order.user?.email}</span>
            </div>
          </div>

          {/* Order Info */}
          <div className="aod-card">
            <p className="aod-card-title">Order Info</p>
            <div className="aod-row">
              <span className="aod-label">Order ID</span>
              <span className="aod-value mono">{order._id}</span>
            </div>
            <div className="aod-row">
              <span className="aod-label">Order Status</span>
              <span className={badgeClass(order.orderStatus)}>
                {order.orderStatus}
              </span>
            </div>
            <div className="aod-row">
              <span className="aod-label">Payment Status</span>
              <span className={badgeClass(order.paymentStatus)}>
                {order.paymentStatus}
              </span>
            </div>
            <div className="aod-row">
              <span className="aod-label">Payment Method</span>
              <span className="aod-value">{order.paymentMethod}</span>
            </div>
            <div className="aod-row">
              <span className="aod-label">Placed On</span>
              <span className="aod-value">{fmt(order.createdAt)}</span>
            </div>
            {order.deliveredAt && (
              <div className="aod-row">
                <span className="aod-label">Delivered At</span>
                <span className="aod-value">{fmt(order.deliveredAt)}</span>
              </div>
            )}
          </div>

          {/* Shipping */}
          <div className="aod-card">
            <p className="aod-card-title">Shipping Info</p>
            <div className="aod-row">
              <span className="aod-label">Address</span>
              <span className="aod-value">{order.shippingAddress?.address}</span>
            </div>
            <div className="aod-row">
              <span className="aod-label">City</span>
              <span className="aod-value">{order.shippingAddress?.city}</span>
            </div>
            <div className="aod-row">
              <span className="aod-label">State</span>
              <span className="aod-value">{order.shippingAddress?.state}</span>
            </div>
            <div className="aod-row">
              <span className="aod-label">Pincode</span>
              <span className="aod-value">{order.shippingAddress?.pincode}</span>
            </div>
          </div>

          {/* Items */}
          <div className="aod-card">
            <p className="aod-card-title">Order Items</p>
            {order.orderItems.map((item, i) => (
              <div className="aod-item" key={i}>
                <img src={item.image} alt={item.name} />
                <div className="aod-item-info">
                  <p className="aod-item-name">{item.name}</p>
                  <p className="aod-item-meta">Qty: {item.quantity}</p>
                </div>
                <span className="aod-item-price">₹{item.price.toLocaleString("en-IN")}</span>
              </div>
            ))}
          </div>

          {/* Price Summary */}
          <div className="aod-card">
            <p className="aod-card-title">Price Summary</p>
            <div className="aod-price-row">
              <span>Items Price</span>
              <span>₹{order.itemsPrice?.toLocaleString("en-IN")}</span>
            </div>
            <div className="aod-price-row">
              <span>Tax</span>
              <span>₹{order.taxPrice?.toLocaleString("en-IN", { maximumFractionDigits: 2 })}</span>
            </div>
            <div className="aod-price-row">
              <span>Delivery Charge</span>
              <span>₹{order.deliveryCharge?.toLocaleString("en-IN")}</span>
            </div>
            <div className="aod-price-row">
              <span>Platform Fee</span>
              <span>₹{order.platformFee?.toLocaleString("en-IN")}</span>
            </div>
            <div className="aod-price-row total">
              <span>Total</span>
              <span>₹{order.totalPrice?.toLocaleString("en-IN", { maximumFractionDigits: 2 })}</span>
            </div>
          </div>

        </div>
      </div>
    </>
  );
};

export default AdminOrderDetails;