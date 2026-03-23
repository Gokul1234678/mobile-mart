// ==========================================
// 📦 USER ORDERS PAGE
// ==========================================

// React hooks
import { useEffect, useState } from "react";

// Axios instance for API calls
import axiosInstance from "../axios_instance";

// Toast for notifications
import { toast } from "react-toastify";

// Navigation
import { useNavigate } from "react-router-dom";

// Optional: Loader component (your dynamic loader)
// import Loader from "../components/Loader";

const Orders = () => {

  // ------------------------------------------
  // 🧠 STATE MANAGEMENT
  // ------------------------------------------

  // Store orders from backend
  const [orders, setOrders] = useState([]);

  // Loading state
  const [loading, setLoading] = useState(true);

  // Navigation
  const navigate = useNavigate();

  // ------------------------------------------
  // 📡 FETCH USER ORDERS
  // ------------------------------------------
  const fetchOrders = async () => {
    try {

      // Call backend API
      const { data } = await axiosInstance.get(
        "/api/orders/my",
        { withCredentials: true }
      );

      // Store orders in state
      setOrders(data.orders);

    } catch (error) {

      // Show error message
      toast.error(
        error.response?.data?.message || "Failed to load orders"
      );

    } finally {

      // Stop loader
      setLoading(false);
    }
  };

  // ------------------------------------------
  // 🔁 RUN ON PAGE LOAD
  // ------------------------------------------
  useEffect(() => {
    fetchOrders();
  }, []);

  // ------------------------------------------
  // 🎨 UI RENDER
  // ------------------------------------------
  return (
    <div className="container py-4">

      {/* 🔄 LOADER */}
      {/* {loading && <Loader type="loading" fullscreen />} */}
      {loading && <h1>Loading...</h1>}

      {/* 🧾 PAGE TITLE */}
      <h2 className="fw-bold mb-4">My Orders</h2>

      {/* ❌ NO ORDERS */}
      {!loading && orders.length === 0 && (
        <p>No orders found</p>
      )}

      {/* 📦 ORDER LIST */}
      {!loading && orders.map((order) => (

        <div
          key={order._id}
          className="card mb-3 p-3 shadow-sm"
          style={{ cursor: "pointer" }}
          onClick={() => navigate(`/orders/${order._id}`)}
        >

          {/* 🧾 ORDER HEADER */}
          <div className="d-flex justify-content-between">

            {/* 🆔 ORDER ID */}
            <p className="mb-1 fw-bold">
              Order ID: {order._id}
            </p>

            {/* 📦 STATUS */}
            <span
              className={`badge ${
                order.orderStatus === "Delivered"
                  ? "bg-success"
                  : order.orderStatus === "Cancelled"
                  ? "bg-danger"
                  : "bg-warning text-dark"
              }`}
            >
              {order.orderStatus || "Processing"}
            </span>
          </div>

          {/* 📅 DATE */}
          <p className="text-muted mb-1">
            {new Date(order.createdAt).toLocaleString()}
          </p>

          {/* 💰 PRICE */}
          <p className="fw-bold text-success mb-1">
            ₹{order.totalPrice}
          </p>

          {/* 📦 ITEMS COUNT */}
          <p className="mb-0">
            {order.orderItems.length} item(s)
          </p>

        </div>
      ))}

    </div>
  );
};

export default Orders;