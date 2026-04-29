import React, { useEffect, useState } from "react";
import axiosInstance from "../../axios_instance";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const Orders = () => {

  const [orders, setOrders] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // ==========================================
  // 📦 FETCH ALL ORDERS
  // ==========================================
  const fetchOrders = async () => {
    try {
      setLoading(true);

      const { data } = await axiosInstance.get("/api/admin/orders", {
        withCredentials: true
      });

      setOrders(data.orders);
      setTotalAmount(data.totalAmount);

    } catch (err) {
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // ==========================================
  // 🔄 UPDATE ORDER STATUS
  // ==========================================
  const updateStatus = async (id, status) => {
    try {
      await axiosInstance.put(`/api/admin/orders/${id}`,
        { orderStatus: status },
        { withCredentials: true }
      );

      toast.success("Order updated");
      fetchOrders(); // refresh list

    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    }
  };

  // ==========================================
  // 🗑 DELETE ORDER
  // ==========================================
  const deleteOrder = async (id) => {
    const confirmDelete = window.confirm("Are you sure?");

    if (!confirmDelete) return;

    try {
      await axiosInstance.delete(`/api/admin/orders/${id}`, {
        withCredentials: true
      });

      toast.success("Order deleted");
      fetchOrders();

    } catch (err) {
      toast.error("Delete failed");
    }
  };

  // ==========================================
  // 🎨 STATUS COLOR
  // ==========================================
  const getStatusColor = (status) => {
    if (status === "processing") return "orange";
    if (status === "shipped") return "blue";
    if (status === "delivered") return "green";
    if (status === "cancelled") return "red";
  };

  return (
    <div className="container mt-4">

      <h2>Admin Orders</h2>

      {/* 🔥 SUMMARY */}
      <div className="mb-3">
        <strong>Total Orders:</strong> {orders.length} <br />
        <strong>Total Revenue:</strong> ₹{totalAmount}
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="table-responsive">

          <table className="table table-bordered text-center">

            <thead>
              <tr>
                <th>ID</th>
                <th>User</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>

              {orders.map((order) => (

                <tr key={order._id}>

                  {/* ID */}
                  <td title={order._id} >{order._id.slice(-6)}</td>

                  {/* USER */}
                  <td>{order.user?.name}</td>

                  {/* PRICE */}
                  <td>₹{order.totalPrice}</td>

                  {/* STATUS */}
                  <td style={{ color: getStatusColor(order.orderStatus) }}>
                    {order.orderStatus}
                  </td>

                  {/* DATE */}
                  <td>
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>

                  {/* ACTIONS */}
                  <td>
                    <div style={{ display: "flex", gap: "6px", justifyContent: "center" }}>

                      {/* VIEW */}
                      <button
                        className="btn btn-sm btn-info"
                        onClick={() => navigate(`/admin/orders/${order._id}`)}
                      >
                        👁 View
                      </button>

                      {/* DELETE */}
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => deleteOrder(order._id)}
                      >
                        🗑 Delete
                      </button>

                    </div>

                    {/* STATUS DROPDOWN BELOW */}
                    <select
                      className="form-select form-select-sm mt-2"
                      value={order.orderStatus}
                      disabled={order.orderStatus === "delivered"}
                      onChange={(e) =>
                        updateStatus(order._id, e.target.value)
                      }
                    >
                      <option value="processing">Processing</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>

                </tr>
              ))}

            </tbody>

          </table>

        </div>
      )}
    </div>
  );
};

// export default Orders;