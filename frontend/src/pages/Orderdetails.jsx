import React, { useEffect, useState, useRef, useCallback } from "react"; // core React hooks
import { useParams, useNavigate } from "react-router-dom"; // get :id from URL, navigate between pages
import axiosInstance from "../axios_instance"; // pre-configured axios with base URL
import { toast } from "react-toastify"; // show success/error notifications

// =============================================
// Self-contained styles — no external CSS file
// Matches app theme: orange (#ff5722) + violet (#6a0dad)
// =============================================
const styles = `
  :root {
   
  }

  /* ---- Animations ---- */

  /* Fade + slide up on page entry */
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to   { opacity: 1; }
  }

  /* Loader spinner */
  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  /* Breathing effect for loader text */
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50%       { opacity: 0.45; }
  }

  /* Shimmer sweep on buttons */
  @keyframes shimmer {
    0%   { background-position: -200% center; }
    100% { background-position: 200% center; }
  }

  /* Timeline dot pop-in */
  @keyframes dotPop {
    0%   { transform: scale(0); opacity: 0; }
    70%  { transform: scale(1.2); }
    100% { transform: scale(1); opacity: 1; }
  }

  /* ==========================================
     PAGE WRAPPER
  ========================================== */
  .od-page {
    min-height: 100vh;
    background: var(--page-bg);
    padding: 40px 20px 80px;
    font-family: inherit;
    color: var(--text-primary);
  }

  .od-inner {
    max-width: 860px;
    margin: 0 auto;
  }

  /* ==========================================
     PAGE HEADER — Back button + title
  ========================================== */
  .od-header {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-bottom: 32px;
    padding-bottom: 16px;
    border-bottom: 2px solid var(--orange);
    animation: fadeUp 0.4s ease both;
  }

  /* Back arrow button */
  .od-back-btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: none;
    border: 1.5px solid var(--border);
    border-radius: var(--radius-sm);
    padding: 7px 14px;
    font-size: 0.82rem;
    font-weight: 600;
    color: var(--text-secondary);
    cursor: pointer;
    transition: border-color var(--transition), color var(--transition), background var(--transition);
    flex-shrink: 0;
  }

  .od-back-btn:hover {
    border-color: var(--orange);
    color: var(--orange);
    background: var(--orange-light);
  }

  .od-title {
    font-size: 1.9rem;
    font-weight: 700;
    color: var(--text-primary);
    margin: 0;
    letter-spacing: -0.02em;
  }

  /* ==========================================
     LOADER STATE
  ========================================== */
  .od-loader {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 100px 20px;
    gap: 14px;
    animation: fadeIn 0.3s ease;
  }

  .od-spinner {
    width: 42px;
    height: 42px;
    border: 3px solid #f0ece5;
    border-top-color: var(--orange);
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  .od-loader p {
    font-size: 0.9rem;
    color: var(--text-muted);
    animation: pulse 1.4s ease infinite;
  }

  /* ==========================================
     ERROR STATE
  ========================================== */
  .od-error {
    text-align: center;
    padding: 80px 20px;
    animation: fadeUp 0.5s ease both;
  }

  .od-error-icon {
    font-size: 3rem;
    margin-bottom: 16px;
    opacity: 0.3;
  }

  .od-error h3 {
    font-size: 1.3rem;
    font-weight: 700;
    color: var(--text-primary);
    margin-bottom: 8px;
  }

  .od-error p {
    font-size: 0.9rem;
    color: var(--text-muted);
    margin-bottom: 24px;
  }

  /* ==========================================
     GRID LAYOUT — left column wider, right is summary
  ========================================== */
  .od-grid {
    display: grid;
    grid-template-columns: 1fr 300px;
    gap: 24px;
    align-items: start;
  }

  /* ==========================================
     CARD — shared card style
  ========================================== */
  .od-card {
    background: var(--card-bg);
    border-radius: var(--radius);
    padding: 24px;
    box-shadow: var(--shadow-sm);
    margin-bottom: 20px;
    animation: fadeUp 0.45s ease both;
    position: relative;
    overflow: hidden;
    transition: box-shadow var(--transition);
  }

  .od-card:hover {
    box-shadow: var(--shadow-md);
  }

  /* Animated orange→violet top bar on hover */
  .od-card::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 3px;
    background: linear-gradient(90deg, var(--orange), var(--violet));
    transform: scaleX(0);
    transform-origin: left;
    transition: transform 0.35s ease;
  }

  .od-card:hover::before {
    transform: scaleX(1);
  }

  /* Card section title */
  .od-card-title {
    font-size: 1rem;
    font-weight: 700;
    color: var(--text-primary);
    margin: 0 0 16px;
    display: flex;
    align-items: center;
    gap: 8px;
    letter-spacing: -0.01em;
  }

  /* Icon inside card title */
  .od-card-title svg {
    color: var(--orange);
    flex-shrink: 0;
  }

  .od-card hr {
    border: none;
    border-top: 1px solid var(--border);
    margin: 14px 0;
  }

  /* ==========================================
     ORDER META STRIP — ID, date, payment
  ========================================== */
  .od-meta-strip {
    display: flex;
    flex-wrap: wrap;
    gap: 24px;
    margin-bottom: 6px;
  }

  .od-meta-item {
    display: flex;
    flex-direction: column;
    gap: 3px;
  }

  .od-meta-label {
    font-size: 0.72rem;
    font-weight: 600;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 0.07em;
  }

  .od-meta-value {
    font-size: 0.92rem;
    font-weight: 600;
    color: var(--text-primary);
  }

  .od-meta-value.violet  { color: var(--violet); }
  .od-meta-value.green   { color: var(--green); }
  .od-meta-value.yellow  { color: var(--yellow); }
  .od-meta-value.red     { color: var(--red); }
  .od-meta-value.orange  { color: var(--orange); }

  /* ==========================================
     STATUS BADGE
  ========================================== */
  .od-status-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 5px 14px;
    border-radius: 20px;
    font-size: 0.78rem;
    font-weight: 700;
    letter-spacing: 0.05em;
    text-transform: uppercase;
  }

  .od-status-badge.pending    { background: var(--yellow-light); color: var(--yellow); border: 1px solid #fde68a; }
  .od-status-badge.processing { background: var(--orange-light); color: var(--orange); border: 1px solid #ffccbc; }
  .od-status-badge.delivered  { background: var(--green-light);  color: var(--green);  border: 1px solid #a5d6a7; }
  .od-status-badge.cancelled  { background: var(--red-light);    color: var(--red);    border: 1px solid #ffcdd2; }

  .od-status-dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: currentColor;
  }

  /* ==========================================
     ORDER TIMELINE
     Visual step tracker: Placed → Processing → Shipped → Delivered
  ========================================== */
  .od-timeline {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    position: relative;
    padding: 10px 0 4px;
    margin-top: 8px;
  }

  /* Horizontal connecting line behind dots */
  .od-timeline::before {
    content: '';
    position: absolute;
    top: 22px;
    left: 20px;
    right: 20px;
    height: 2px;
    background: var(--border);
    z-index: 0;
  }

  /* Filled progress line — animates from 0 to target width on mount */
  .od-timeline-progress {
    position: absolute;
    top: 22px;
    left: 20px;
    height: 2px;
    background: linear-gradient(90deg, var(--orange), var(--violet));
    z-index: 1;
    width: 0% !important;           /* start at 0 */
    transition: width 0.9s cubic-bezier(0.4, 0, 0.2, 1);
  }

  /* Class added via JS after short delay to trigger the draw */
  .od-timeline-progress.animate {
    width: var(--progress-target) !important;
  }

  /* Each step wrapper */
  .od-timeline-step {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    flex: 1;
    position: relative;
    z-index: 2;
  }

  /* Circular dot for each step */
  .od-timeline-dot {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 2px solid var(--border);
    background: var(--card-bg);
    transition: border-color var(--transition), background var(--transition);
  }

  /* Active step dot — filled orange */
  .od-timeline-dot.active {
    background: var(--orange);
    border-color: var(--orange);
    animation: dotPop 0.4s cubic-bezier(0.22, 1, 0.36, 1) both;
  }

  /* Completed step dot — green */
  .od-timeline-dot.done {
    background: var(--green);
    border-color: var(--green);
    animation: dotPop 0.4s cubic-bezier(0.22, 1, 0.36, 1) both;
  }

  /* Cancelled step — red */
  .od-timeline-dot.cancelled {
    background: var(--red);
    border-color: var(--red);
    animation: dotPop 0.4s cubic-bezier(0.22, 1, 0.36, 1) both;
  }

  .od-timeline-dot svg {
    color: #fff;
  }

  /* Step label below dot */
  .od-timeline-label {
    font-size: 0.7rem;
    font-weight: 600;
    color: var(--text-muted);
    text-align: center;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    line-height: 1.3;
  }

  .od-timeline-label.active { color: var(--orange); }
  .od-timeline-label.done   { color: var(--green); }
  .od-timeline-label.cancelled { color: var(--red); }

  /* ==========================================
     PRODUCT ITEMS LIST
  ========================================== */
  .od-item-row {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 12px 0;
    border-bottom: 1px solid var(--border);
  }

  .od-item-row:last-child {
    border-bottom: none;
    padding-bottom: 0;
  }

  /* Product image thumbnail */
  .od-item-img {
    width: 64px;
    height: 64px;
    object-fit: cover;
    border-radius: 8px;
    background: #f5f5f5;
    flex-shrink: 0;
  }

  .od-item-info {
    flex: 1;
    min-width: 0;
  }

  .od-item-name {
    font-size: 0.92rem;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 4px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .od-item-qty {
    font-size: 0.78rem;
    color: var(--text-muted);
    font-weight: 500;
  }

  .od-item-price {
    font-size: 0.95rem;
    font-weight: 700;
    color: var(--violet);
    white-space: nowrap;
    flex-shrink: 0;
  }

  /* ==========================================
     SHIPPING ADDRESS BLOCK
  ========================================== */
  .od-address-block p {
    font-size: 0.9rem;
    color: var(--text-secondary);
    margin-bottom: 6px;
    line-height: 1.6;
  }

  .od-address-block p strong {
    color: var(--text-primary);
    font-weight: 600;
  }

  /* ==========================================
     RIGHT COLUMN — Price Summary Card (sticky)
  ========================================== */
  .od-right {
    position: sticky;
    top: 30px;
    animation: fadeUp 0.5s ease both;
    animation-delay: 0.15s;
  }

  /* Price row: label (left) + value (right) */
  .od-price-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 0.88rem;
    color: var(--text-secondary);
    padding: 5px 0;
  }

  .od-price-row span:last-child {
    font-weight: 500;
    color: var(--text-primary);
  }

  /* Discount row in green */
  .od-price-row.discount span {
    color: var(--green);
    font-weight: 600;
  }

  /* Total row — bold and larger */
  .od-price-row.total {
    font-size: 1rem;
    font-weight: 700;
    padding: 8px 0 0;
  }

  .od-price-row.total span {
    color: var(--text-primary) !important;
    font-weight: 700 !important;
  }

  /* ==========================================
     CANCEL ORDER BUTTON
  ========================================== */
  .od-cancel-btn {
    width: 100%;
    margin-top: 16px;
    padding: 11px 16px;
    background: var(--red-light);
    color: var(--red);
    border: 1.5px solid #ffcdd2;
    border-radius: var(--radius-sm);
    font-size: 0.84rem;
    font-weight: 700;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 7px;
    transition: background var(--transition), color var(--transition), border-color var(--transition), transform 0.15s;
  }

  .od-cancel-btn:hover:not(:disabled) {
    background: var(--red);
    color: #fff;
    border-color: var(--red);
    transform: translateY(-1px);
  }

  .od-cancel-btn:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }

  /* ==========================================
     CONFIRM CANCEL MODAL OVERLAY
  ========================================== */
  .od-modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.45);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    animation: fadeIn 0.2s ease;
    padding: 20px;
  }

  .od-modal {
    background: var(--card-bg);
    border-radius: var(--radius);
    padding: 32px 28px;
    max-width: 380px;
    width: 100%;
    box-shadow: 0 20px 60px rgba(0,0,0,0.2);
    animation: fadeUp 0.3s ease both;
    text-align: center;
  }

  .od-modal-icon {
    font-size: 2.8rem;
    margin-bottom: 14px;
  }

  .od-modal h3 {
    font-size: 1.15rem;
    font-weight: 700;
    color: var(--text-primary);
    margin-bottom: 8px;
  }

  .od-modal p {
    font-size: 0.88rem;
    color: var(--text-secondary);
    margin-bottom: 24px;
    line-height: 1.6;
  }

  .od-modal-actions {
    display: flex;
    gap: 10px;
  }

  /* Keep order — outline style */
  .od-modal-keep {
    flex: 1;
    padding: 11px;
    background: transparent;
    border: 1.5px solid var(--border);
    border-radius: var(--radius-sm);
    font-size: 0.85rem;
    font-weight: 600;
    color: var(--text-secondary);
    cursor: pointer;
    transition: border-color var(--transition), color var(--transition);
  }

  .od-modal-keep:hover {
    border-color: var(--violet);
    color: var(--violet);
  }

  /* Confirm cancel — solid red */
  .od-modal-confirm {
    flex: 1;
    padding: 11px;
    background: var(--red);
    border: none;
    border-radius: var(--radius-sm);
    font-size: 0.85rem;
    font-weight: 700;
    color: #fff;
    cursor: pointer;
    transition: background var(--transition), transform 0.15s;
    box-shadow: 0 3px 10px rgba(229,57,53,0.3);
  }

  .od-modal-confirm:hover:not(:disabled) {
    background: #c62828;
    transform: translateY(-1px);
  }

  .od-modal-confirm:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  /* ==========================================
     RESPONSIVE BREAKPOINTS
  ========================================== */

  /* Tablet — stack grid to single column */
  @media (max-width: 760px) {
    .od-grid {
      grid-template-columns: 1fr;
    }
    .od-right {
      position: static; /* unstick on mobile */
    }
  }

  /* Large mobile */
  @media (max-width: 600px) {
    .od-title { font-size: 1.5rem; }
    .od-card  { padding: 16px; }
    .od-timeline-label { font-size: 0.62rem; }
  }

  /* Small mobile */
  @media (max-width: 400px) {
    .od-title { font-size: 1.25rem; }
    .od-meta-strip { gap: 14px; }
  }
`;

// =============================================
// HELPERS
// =============================================

// Format ISO date string → "20 Jan 2025"
const formatDate = (dateStr) => {
  if (!dateStr) return "—";          // return dash if no date provided
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",               // e.g. "20 Jan 2025"
  });
};

// Map orderStatus → CSS class
const getStatusCls = (status) => {
  const s = status?.toLowerCase();        // normalize to lowercase for safe comparison
  if (s === "delivered")  return "delivered";
  if (s === "processing") return "processing";
  if (s === "cancelled")  return "cancelled";
  return "pending";                       // default fallback
};

// =============================================
// TIMELINE CONFIG
// Maps each status to how far the progress bar fills
// and which steps are "done" / "active" / pending
// =============================================
const TIMELINE_STEPS = [
  { key: "placed",     label: "Order\nPlaced"  },
  { key: "processing", label: "Processing"     },
  { key: "shipped",    label: "Shipped"        },
  { key: "delivered",  label: "Delivered"      },
];

// Returns step state: "done" | "active" | "cancelled" | ""
const getStepState = (stepKey, orderStatus) => {
  if (orderStatus === "cancelled") {
    // Only "Order Placed" step shows as done; all others show cancelled X
    return stepKey === "placed" ? "done" : "cancelled";
  }
  const order = ["placed", "processing", "shipped", "delivered"]; // step order
  const currentIdx = order.indexOf(orderStatus?.toLowerCase()) ?? 0; // index of current status
  const stepIdx    = order.indexOf(stepKey);                         // index of this step
  if (stepIdx < currentIdx)  return "done";    // step is behind current → completed
  if (stepIdx === currentIdx) return "active"; // step matches current → in progress
  return "";                                   // step is ahead → not reached yet
};

// Progress bar width % based on order status
const getProgressWidth = (orderStatus) => {
  // Maps each status to how far the progress bar should fill (left to right)
  const map = { placed: "0%", processing: "33%", shipped: "66%", delivered: "100%", cancelled: "5%" };
  return map[orderStatus?.toLowerCase()] ?? "0%"; // fallback to 0% if status unknown
};

// =============================================
// SVG ICON COMPONENTS — inline, no library needed
// =============================================
const IconCheck    = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>;
const IconX        = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const IconClock    = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
const IconTruck    = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>;
const IconPackage  = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="16.5" y1="9.4" x2="7.5" y2="4.21"/><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>;
const IconMap      = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>;
const IconReceipt  = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>;
const IconBack     = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>;
const IconCancel   = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>;

// =============================================
// MAIN COMPONENT
// =============================================
const OrderDetails = () => {
  const { id }     = useParams();   // order ID from URL → /orders/:id
  const navigate   = useNavigate();

  // ==========================================
  // LOCAL STATE
  // ==========================================
  const [order,       setOrder]       = useState(null);   // full order object
  const [loading,     setLoading]     = useState(true);   // page loading state
  const [error,       setError]       = useState(null);   // fetch error message
  const [showModal,   setShowModal]   = useState(false);  // confirm cancel modal toggle
  const [cancelling,  setCancelling]  = useState(false);  // cancel API in progress

  // ==========================================
  // FETCH ORDER DETAILS ON MOUNT
  // GET /api/orders/my — filter by ID on frontend
  // (use this if you don't have a single order endpoint)
  // ==========================================
  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const { data } = await axiosInstance.get("/api/orders/my", {
          withCredentials: true,
        });
        // Find the specific order from the list by ID
        const found = data.orders.find((o) => o._id === id);
        if (!found) throw new Error("Order not found");
        setOrder(found);
      } catch (err) {
        setError(err.response?.data?.message || err.message || "Failed to load order");
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  // ==========================================
  // CANCEL ORDER HANDLER
  // PUT /api/orders/:id/cancel
  // On success → update local state + close modal
  // ==========================================
  const handleCancelOrder = async () => {
    try {
      setCancelling(true);  // disable button to prevent double click
      const { data } = await axiosInstance.put(
        `/api/orders/${id}/cancel`,  // PUT /api/orders/:id/cancel
        {},                          // no body needed
        { withCredentials: true }    // send auth cookie
      );
      toast.success(data.message || "Order cancelled successfully");

      // Update local state instantly — no need to re-fetch from API
      setOrder((prev) => ({ ...prev, orderStatus: "cancelled" }));
      setShowModal(false); // close the confirm modal
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to cancel order");
    } finally {
      setCancelling(false);
    }
  };

  // ==========================================
  // REF — timeline progress bar DOM element
  // ==========================================
  const progressRef = useRef(null);

  // ==========================================
  // this function is used for animating price values from 0 to target
  // HOOK: useCountUp
  // Animates a number from 0 → target over ~1s
  // Returns current display value as string
  // ==========================================
  const useCountUp = (target, active) => {
    const [display, setDisplay] = useState(0);
    useEffect(() => {
      if (!active || !target) return;
      let start = null;
      const duration = 900;              // total animation duration in ms
      const from = 0;                    // always count up from zero
      const to = parseFloat(target);     // parse target to float in case it's a string
      const step = (timestamp) => {
        if (!start) start = timestamp;   // capture start time on first frame
        const elapsed = timestamp - start;
        const progress = Math.min(elapsed / duration, 1); // 0 → 1, capped at 1
        // Ease out cubic → fast start, slow finish (feels natural)
        const eased = 1 - Math.pow(1 - progress, 3);
        setDisplay(from + (to - from) * eased); // interpolate between 0 and target
        if (progress < 1) requestAnimationFrame(step); // keep looping until done
      };
      requestAnimationFrame(step); // kick off the animation loop
    }, [target, active]);
    return display.toFixed(2);
  };

  // ==========================================
  // DERIVED VALUES (only when order is loaded)
  // ==========================================
  const statusCls      = order ? getStatusCls(order.orderStatus) : "";           // CSS class for badge color
  const canCancel      = order && !["cancelled", "delivered"].includes(order.orderStatus?.toLowerCase()); // hide cancel btn if already done
  const progressWidth  = order ? getProgressWidth(order.orderStatus) : "0%";       // timeline bar target width

  // Animated price values — all count up from 0 when order loads
  const animItemsPrice    = useCountUp(order?.itemsPrice,     !!order);
  const animTaxPrice      = useCountUp(order?.taxPrice,       !!order);
  const animDelivery      = useCountUp(order?.deliveryCharge, !!order);
  const animPlatformFee   = useCountUp(order?.platformFee,    !!order);
  const animTotalPrice    = useCountUp(order?.totalPrice,     !!order);

  // ==========================================
  // EFFECT: Trigger timeline bar draw after mount
  // Short delay so the CSS transition fires visibly
  // ==========================================
  useEffect(() => {
    if (!order || !progressRef.current) return; // wait until order + DOM are ready
    // Pass target width as a CSS variable directly on the element
    progressRef.current.style.setProperty("--progress-target", progressWidth);
    // 300ms delay → gives browser time to paint the 0% state before animating
    const timer = setTimeout(() => {
      progressRef.current?.classList.add("animate"); // triggers CSS transition
    }, 300);
    return () => clearTimeout(timer); // cleanup on unmount
  }, [order, progressWidth]);

  // ==========================================
  // RENDER — Loading state
  // ==========================================
  if (loading) {
    return (
      <>
        <style>{styles}</style>
        <div className="od-page">
          <div className="od-loader">
            <div className="od-spinner" />
            <p>Loading order details...</p>
          </div>
        </div>
      </>
    );
  }

  // ==========================================
  // RENDER — Error state
  // ==========================================
  if (error || !order) {
    return (
      <>
        <style>{styles}</style>
        <div className="od-page">
          <div className="od-inner">
            <div className="od-error">
              <div className="od-error-icon">📦</div>
              <h3>Order not found</h3>
              <p>{error || "This order doesn't exist or you don't have access."}</p>
              <button className="od-back-btn" onClick={() => navigate("/orders")}>
                <IconBack /> Back to Orders
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  // ==========================================
  // RENDER — Order Details
  // ==========================================
  return (
    <>
      <style>{styles}</style>

      {/* ==========================================
          CONFIRM CANCEL MODAL
          Shown when user clicks "Cancel Order"
      ========================================== */}
      {showModal && (
        <div className="od-modal-overlay" onClick={() => setShowModal(false)}> {/* click outside modal to close */}
          <div className="od-modal" onClick={(e) => e.stopPropagation()}> {/* stop click from bubbling to overlay */}
            <div className="od-modal-icon">🚫</div>
            <h3>Cancel this order?</h3>
            <p>
              This will cancel your order and restore product stock.
              This action cannot be undone.
            </p>
            <div className="od-modal-actions">
              {/* Keep order — dismiss modal */}
              <button className="od-modal-keep" onClick={() => setShowModal(false)}>
                Keep Order
              </button>
              {/* Confirm cancel — calls API */}
              <button
                className="od-modal-confirm"
                onClick={handleCancelOrder}
                disabled={cancelling}
              >
                {cancelling ? "Cancelling..." : "Yes, Cancel"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="od-page">
        <div className="od-inner">

          {/* ==========================================
              PAGE HEADER — Back button + title
          ========================================== */}
          <div className="od-header">
            <button className="od-back-btn" onClick={() => navigate("/orders")}>
              <IconBack /> Orders
            </button>
            <h1 className="od-title">Order Details</h1>
          </div>

          <div className="od-grid">

            {/* ==========================================
                LEFT COLUMN
            ========================================== */}
            <div>

              {/* ---- Card 1: Order Overview ---- */}
              <div className="od-card" style={{ animationDelay: "0.05s" }}>
                {/* Order ID + status in one row */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", marginBottom: "18px" }}>
                  <div>
                    <div className="od-meta-label">Order ID</div>
                    <div className="od-meta-value violet" style={{ fontSize: "0.88rem", marginTop: "3px" }}>{order._id}</div>
                  </div>
                  {/* Color-coded status badge */}
                  <span className={`od-status-badge ${statusCls}`}>
                    <span className="od-status-dot" />
                    {order.orderStatus?.charAt(0).toUpperCase() + order.orderStatus?.slice(1) || "Pending"}
                  </span>
                </div>

                {/* Meta: date, payment method, payment status */}
                <div className="od-meta-strip">
                  <div className="od-meta-item">
                    <span className="od-meta-label">Order Date</span>
                    <span className="od-meta-value">{formatDate(order.createdAt)}</span>
                  </div>
                  <div className="od-meta-item">
                    <span className="od-meta-label">Payment</span>
                    <span className={`od-meta-value ${order.paymentMethod === "COD" ? "yellow" : "green"}`}>
                      {order.paymentMethod === "COD" ? "Cash on Delivery" : "Online"}
                    </span>
                  </div>
                  <div className="od-meta-item">
                    <span className="od-meta-label">Payment Status</span>
                    <span className={`od-meta-value ${order.paymentStatus === "paid" ? "green" : order.paymentStatus === "failed" ? "red" : "yellow"}`}>
                      {/* Capitalize first letter */}
                      {order.paymentStatus
                        ? order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)
                        : "Pending"}
                    </span>
                  </div>
                </div>

                {/* ---- ORDER TIMELINE ---- */}
                <div style={{ marginTop: "22px" }}>
                  <div className="od-meta-label" style={{ marginBottom: "10px" }}>Order Progress</div>
                  <div className="od-timeline">
                    {/* Background line */}
                    {/* Filled progress line — draws left→right on mount via ref + CSS class */}
                    <div className="od-timeline-progress" ref={progressRef} />

                    {/* Loop through 4 steps: Placed, Processing, Shipped, Delivered */}
                    {TIMELINE_STEPS.map((step) => {
                      const state = getStepState(step.key, order.orderStatus); // "done" | "active" | "cancelled" | ""
                      return (
                        <div key={step.key} className="od-timeline-step">
                          {/* Dot icon — changes based on step state */}
                          <div className={`od-timeline-dot ${state}`}>
                            {state === "done"      && <IconCheck />}
                            {state === "active"    && <IconClock />}
                            {state === "cancelled" && <IconX />}
                          </div>
                          {/* Step label — colored by state */}
                          <div className={`od-timeline-label ${state}`}>
                            {step.label}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* ---- Card 2: Ordered Items ---- */}
              <div className="od-card" style={{ animationDelay: "0.1s" }}>
                <div className="od-card-title">
                  <IconPackage />
                  Items Ordered ({order.orderItems?.length})
                </div>

                {/* One row per product */}
                {order.orderItems?.map((item, i) => (
                  <div key={i} className="od-item-row">
                    {/* Product image */}
                    <img
                      src={item.image || "/default-image.png"}
                      alt={item.name}
                      className="od-item-img"
                    />
                    <div className="od-item-info">
                      <div className="od-item-name">{item.name}</div>
                      <div className="od-item-qty">Qty: {item.quantity}</div>
                    </div>
                    {/* Line total = unit price × qty ordered */}
                    <div className="od-item-price">
                      ₹{(item.price * item.quantity).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>

              {/* ---- Card 3: Shipping Address ---- */}
              <div className="od-card" style={{ animationDelay: "0.15s" }}>
                <div className="od-card-title">
                  <IconMap />
                  Shipping Address
                </div>
                <div className="od-address-block">
                  <p><strong>Address:</strong> {order.shippingAddress?.address}</p>
                  <p><strong>City:</strong> {order.shippingAddress?.city}</p>
                  <p><strong>State:</strong> {order.shippingAddress?.state}</p>
                  <p><strong>Pincode:</strong> {order.shippingAddress?.pincode}</p>
                </div>
              </div>

            </div>

            {/* ==========================================
                RIGHT COLUMN — Price Summary + Cancel
            ========================================== */}
            <div className="od-right">
              <div className="od-card">
                <div className="od-card-title">
                  <IconReceipt />
                  Price Summary
                </div>

                {/* Items subtotal */}
                <div className="od-price-row">
                  <span>Items Price</span>
                  <span>₹{animItemsPrice}</span>
                </div>

                {/* GST */}
                <div className="od-price-row">
                  <span>GST (5%)</span>
                  <span>₹{animTaxPrice}</span>
                </div>

                {/* Delivery charge */}
                <div className="od-price-row">
                  <span>Delivery</span>
                  <span>₹{animDelivery}</span>
                </div>

                {/* Platform fee */}
                <div className="od-price-row">
                  <span>Platform Fee</span>
                  <span>₹{animPlatformFee}</span>
                </div>

                <hr style={{ border: "none", borderTop: "1px solid var(--border)", margin: "12px 0" }} />

                {/* Grand total */}
                <div className="od-price-row total">
                  <span>Total</span>
                  <span>₹{animTotalPrice}</span>
                </div>

                {/* ---- Cancel Order Button ----
                    Only shown if order is not delivered or already cancelled */}
                {/* Only render cancel button if order is still cancellable */}
                {canCancel && (
                  <button
                    className="od-cancel-btn"
                    onClick={() => setShowModal(true)} // opens confirm modal instead of cancelling directly
                    disabled={cancelling}              // disable while API call is in progress
                  >
                    <IconCancel />
                    Cancel Order
                  </button>
                )}

                {/* Show message if order is already cancelled */}
                {order.orderStatus?.toLowerCase() === "cancelled" && (
                  <div style={{
                    marginTop: "14px",
                    padding: "10px 14px",
                    background: "var(--red-light)",
                    border: "1px solid #ffcdd2",
                    borderRadius: "var(--radius-sm)",
                    fontSize: "0.82rem",
                    color: "var(--red)",
                    fontWeight: "600",
                    textAlign: "center"
                  }}>
                    🚫 This order has been cancelled
                  </div>
                )}

              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
};

export default OrderDetails;