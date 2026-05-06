import React, { useEffect, useState } from "react";
import axiosInstance from "../../axios_instance";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

// =============================================
// Self-contained styles — matches admin theme
// Same design language as Products page
// =============================================
const styles = `

  /* ==========================================
     ANIMATIONS
  ========================================== */
  @keyframes orders-fadeUp {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  /* ==========================================
     PAGE WRAPPER
  ========================================== */
  .orders-admin-page {
    font-family: inherit;
    animation: orders-fadeUp 0.4s ease both;
  }

  /* ==========================================
     PAGE HEADER
  ========================================== */
  .orders-admin-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 20px;
    flex-wrap: wrap;
    gap: 12px;
  }

  .orders-admin-title {
    font-size: 2rem;
    font-weight: 600;
    color: #111;
    margin: 0;
  }

  /* ==========================================
     SUMMARY STRIP — total orders + revenue
  ========================================== */
  .orders-summary-strip {
    display: flex;
    gap: 16px;
    flex-wrap: wrap;
    margin-bottom: 20px;
  }

  /* Each summary pill */
  .orders-summary-pill {
    display: flex;
    align-items: center;
    gap: 10px;
    background: #fff;
    border-radius: 8px;
    padding: 14px 20px;
    box-shadow: 0 1px 4px rgba(0,0,0,0.08);
    border-left: 4px solid var(--pill-color, #ff5722); /* colored left bar */
    min-width: 180px;
  }

  .orders-summary-icon {
    font-size: 1.5rem;
  }

  .orders-summary-label {
    font-size: 0.82rem;
    font-weight: 600;
    color: #888;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    margin-bottom: 2px;
  }

  .orders-summary-value {
    font-size: 1.4rem;
    font-weight: 600;
    color: #111;
    line-height: 1;
  }

  /* ==========================================
     LOADING STATE
  ========================================== */
  .orders-loading {
    text-align: center;
    padding: 48px;
    font-size: 1rem;
    color: #888;
  }

  /* ==========================================
     TABLE WRAPPER
  ========================================== */
  .orders-table-card {
    background: #fff;
    border-radius: 6px;
    box-shadow: 0 1px 6px rgba(0,0,0,0.1);
    overflow: hidden;
    margin-bottom: 24px;
    overflow-x: auto; /* horizontal scroll on small screens */
  }

  /* ==========================================
     TABLE
  ========================================== */
  .orders-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 1.02rem;    /* increased */
    min-width: 700px; /* prevents squishing on mobile */
  }

  /* Dark navy header — matches Products table */
  .orders-table thead tr {
    background: #2b3643;
    color: #fff;
  }

  .orders-table th {
    padding: 15px 16px;
    font-size: 0.88rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    white-space: nowrap;
    border: none;
    text-align: left;
  }

  /* Center align specific columns */
  .orders-table th.center,
  .orders-table td.center {
    text-align: center;
  }

  .orders-table td {
    padding: 14px 16px;
    color: #222;
    border-bottom: 1px solid #eeeeee;
    vertical-align: middle;
    font-size: 1.02rem;
  }

  .orders-table tbody tr:last-child td {
    border-bottom: none;
  }

  /* Row hover */
  .orders-table tbody tr:hover {
    background: #f9f9f9;
  }

  /* Shortened order ID — monospace font */
  .orders-id {
    font-family: monospace;
    font-size: 0.92rem;
    color: #111;                 /* black ID */
    font-weight: 600;
    cursor: help;                /* shows full ID on hover via title attr */
  }

  /* User name */
  .orders-user {
    font-weight: 500;
    color: #111;
  }

  /* Order amount — black bold */
  .orders-amount {
    font-weight: 600;
    color: #111;
    font-size: 1.05rem;
  }

  /* Order date — muted */
  .orders-date {
    color: #666;
    font-size: 0.94rem;
    white-space: nowrap;
  }

  /* ==========================================
     STATUS BADGE
  ========================================== */
  .orders-status-badge {
    display: inline-block;
    padding: 5px 12px;
    border-radius: 4px;
    font-size: 0.82rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    white-space: nowrap;
  }

  .orders-status-badge.processing { background: #fff3cd; color: #856404; }
  .orders-status-badge.shipped    { background: #cfe2ff; color: #084298; }
  .orders-status-badge.delivered  { background: #d1e7dd; color: #0f5132; }
  .orders-status-badge.cancelled  { background: #f8d7da; color: #842029; }
  .orders-status-badge.pending    { background: #e2e3e5; color: #41464b; }

  /* ==========================================
     STATUS DROPDOWN
  ========================================== */
  .orders-status-select {
    width: 100%;
    padding: 6px 10px;
    border: 1.5px solid #ddd;
    border-radius: 4px;
    font-size: 0.92rem;
    font-family: inherit;
    color: #333;
    background: #fff;
    cursor: pointer;
    outline: none;
    margin-top: 8px;
    transition: border-color 0.2s;
  }

  .orders-status-select:focus {
    border-color: #ff5722;
  }

  /* Disabled when delivered — greyed out */
  .orders-status-select:disabled {
    background: #f5f5f5;
    color: #aaa;
    cursor: not-allowed;
  }

  /* ==========================================
     ACTION BUTTONS
  ========================================== */
  .orders-actions {
    display: flex;
    gap: 8px;
    align-items: center;
    justify-content: center;
    flex-wrap: wrap;
  }

  .orders-action-btn {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 7px 14px;
    border: none;
    border-radius: 4px;
    font-size: 0.9rem;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.15s, transform 0.1s;
    white-space: nowrap;
  }

  /* View — violet outlined style */
  .orders-action-btn.view {
    background: transparent;
    color: #6a0dad;
    border: 1.5px solid #6a0dad;
  }

  .orders-action-btn.view:hover {
    background: #6a0dad;
    color: #fff;
    transform: translateY(-1px);
  }

  /* Delete — red */
  .orders-action-btn.delete {
    background: #dc3545;
    color: #fff;
  }

  .orders-action-btn.delete:hover {
    background: #bb2d3b;
    transform: translateY(-1px);
  }

  /* ==========================================
     EMPTY STATE
  ========================================== */
  .orders-empty {
    text-align: center;
    padding: 48px 20px;
    color: #aaa;
  }

  .orders-empty-icon {
    font-size: 2.5rem;
    margin-bottom: 10px;
    opacity: 0.3;
  }

  .orders-empty p {
    font-size: 1rem;
    margin: 0;
  }

  /* ==========================================
     RESPONSIVE
  ========================================== */
  @media (max-width: 768px) {
    .orders-admin-title  { font-size: 1.6rem; }
    .orders-summary-pill { min-width: 140px; padding: 12px 14px; }
    .orders-summary-value { font-size: 1.1rem; }
    .orders-table td, .orders-table th { padding: 11px 12px; font-size: 0.88rem; }
  }

  @media (max-width: 480px) {
    .orders-summary-strip { flex-direction: column; }
    .orders-summary-pill  { min-width: unset; width: 100%; }
  }
`;

// =============================================
// SVG ICONS — inline, no library needed
// =============================================

/* Eye icon for View button */
// it is used instead of emoji to maintain consistent size and alignment with Delete button text. The emoji was slightly larger and caused the button height to increase, making the UI look uneven. The SVG icon can be sized and styled to match the Delete button text perfectly, creating a more polished and cohesive design. */
const IconView = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.5"
    strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);

/* Trash icon for Delete button */
const IconDelete = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.5"
    strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/>
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
    <path d="M10 11v6"/><path d="M14 11v6"/>
    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
  </svg>
);

// =============================================
// MAIN COMPONENT
// =============================================
const Orders = () => {
  // ==========================================
  // STATE
  // ==========================================
  const [orders,      setOrders]      = useState([]);  // all admin orders
  const [totalAmount, setTotalAmount] = useState(0);   // total revenue across orders
  const [loading,     setLoading]     = useState(false); // fetch loading state

  const navigate = useNavigate();// for navigating to order detail page

  // ==========================================
  // FETCH ALL ORDERS
  // GET /api/admin/orders — admin only route
  // ==========================================
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const { data } = await axiosInstance.get("/api/admin/orders", {
        withCredentials: true // include cookies for auth
      });
      setOrders(data.orders);// set orders list
      setTotalAmount(data.totalAmount); // set total revenue
    } catch (err) {
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  // Run on render to load orders list
  useEffect(() => {
    fetchOrders();
  }, []);

  // ==========================================
  // UPDATE ORDER STATUS
  // PUT /api/admin/orders/:id
  // Refreshes list after update
  // ==========================================
  const updateStatus = async (id, status) => {
    try {
      await axiosInstance.put(`/api/admin/orders/${id}`,
        { orderStatus: status },// request body with new status
        { withCredentials: true } // include cookies for auth
      );
      toast.success("Order updated");

      fetchOrders(); // refresh to show updated status
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    }
  };

  // ==========================================
  // DELETE ORDER
  // DELETE /api/admin/orders/:id
  // ==========================================
  const deleteOrder = async (id) => {
    const confirmDelete = window.confirm("Are you sure?");// simple confirmation dialog
    if (!confirmDelete) return;// if user cancels, do nothing

    try {
      // Make API call to delete order, then refresh list after deletion
      await axiosInstance.delete(`/api/admin/orders/${id}`, {
        withCredentials: true// include cookies for auth
      });
      toast.success("Order deleted");

      fetchOrders(); // refresh list after deletion
    } catch (err) {
      toast.error("Delete failed");
    }
  };

  // ==========================================
  // STATUS BADGE CLASS
  // Maps orderStatus string to CSS class name
  // ==========================================
  const getStatusCls = (status) => {// it is for assigning CSS classes to the status badge based on the order status. Each status (like "processing", "shipped", etc.) has a corresponding CSS class that applies specific colors and styles to the badge. This function takes the orderStatus string, converts it to lowercase, and returns the appropriate class name for styling the badge in the UI. If the status doesn't match any known values, it defaults to "pending".
    const map = {
      processing: "processing",
      shipped:    "shipped",
      delivered:  "delivered",
      cancelled:  "cancelled",
      pending:    "pending",
    };
    return map[status?.toLowerCase()] || "pending"; // fallback to pending
  };

  // ==========================================
  // RENDER
  // ==========================================
  return (
    <>
      <style>{styles}</style>
      <div className="orders-admin-page">
        
        {/*PAGE HEADER*/}
        <div className="orders-admin-header">
          <h2 className="orders-admin-title">Admin Orders</h2>
        </div>

        {/* ==========================================
            SUMMARY STRIP — total orders + revenue
        ========================================== */}
        <div className="orders-summary-strip">

          {/* Total orders pill — orange left bar */}
          <div className="orders-summary-pill" style={{ "--pill-color": "#ff5722" }}>
            <span className="orders-summary-icon">🧾</span>
            <div>
              <div className="orders-summary-label">Total Orders</div>
              <div className="orders-summary-value">{orders.length}</div>
            </div>
          </div>

          {/* Total revenue pill — green left bar */}
          <div className="orders-summary-pill" style={{ "--pill-color": "#198754" }}>
            <span className="orders-summary-icon">💰</span>
            <div>
              <div className="orders-summary-label">Total Revenue</div>
              <div className="orders-summary-value">₹{totalAmount}</div>
            </div>
          </div>

        </div>

        {/* ==========================================
            LOADING STATE
        ========================================== */}
        {loading ? (
          <div className="orders-loading">Loading orders...</div>
        ) : (

          /* ==========================================
              ORDERS TABLE
          ========================================== */
          <div className="orders-table-card">
            <table className="orders-table">

              {/* Table header — navy background */}
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>User</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th className="center">Actions</th>
                </tr>
              </thead>

              <tbody>
                {orders.length === 0 ? (
                  /* Empty state */
                  <tr>
                    <td colSpan="6">
                      <div className="orders-empty">
                        <div className="orders-empty-icon">🧾</div>
                        <p>No orders found</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  orders.map((order) => (
                    <tr key={order._id}>

                      {/* ---- Order ID — last 6 chars, full ID on hover ---- */}
                      <td>
                        <span className="orders-id" title={order._id}>
                          #{order._id.slice(-6).toUpperCase()}
                        </span>
                      </td>

                      {/* ---- Customer name ---- */}
                      <td>
                        <span className="orders-user">{order.user?.name || "—"}</span>
                      </td>

                      {/* ---- Total price — black bold ---- */}
                      <td>
                        <span className="orders-amount">₹{order.totalPrice}</span>
                      </td>

                      {/* ---- Status badge + dropdown to change status ---- */}
                      <td>
                        {/* Badge shows current status with color */}
                        <span className={`orders-status-badge ${getStatusCls(order.orderStatus)}`}>
                          {order.orderStatus}
                        </span>

                        {/* Dropdown to update status — disabled when delivered */}
                        <select
                          className="orders-status-select"
                          value={order.orderStatus}
                          disabled={order.orderStatus === "delivered"} // can't change once delivered
                          onChange={(e) => updateStatus(order._id, e.target.value)}
                        >
                          <option value="processing">Processing</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>

                      {/* ---- Order date ---- */}
                      <td>
                        <span className="orders-date">
                          {new Date(order.createdAt).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      </td>

                      {/* ---- Action buttons: View + Delete ---- */}
                      <td className="center">
                        <div className="orders-actions">

                          {/* View — navigates to order detail page */}
                          <button
                            className="orders-action-btn view"
                            onClick={() => navigate(`/admin/orders/${order._id}`)}
                          >
                            <IconView />
                            View
                          </button>

                          {/* Delete — confirms then removes order */}
                          <button
                            className="orders-action-btn delete"
                            onClick={() => deleteOrder(order._id)}
                          >
                            <IconDelete />
                            Delete
                          </button>

                        </div>
                      </td>

                    </tr>
                  ))
                )}
              </tbody>

            </table>
          </div>
        )}

      </div>
    </>
  );
};

export default Orders;