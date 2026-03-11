import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../axios_instance";
import { clearCart } from "../redux/cartSlice";
import { toast } from "react-toastify";

import logo from "../assets/img/icons/logo.png";

import "../assets/styles/checkout.css";

// Redux action to load full user profile
import { loadUser } from "../redux/userSlice";

const Checkout = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [placingOrder, setPlacingOrder] = useState(false);

  // ==========================================
  // Load full user details when checkout loads
  // ==========================================
  useEffect(() => {
    dispatch(loadUser());
  }, [dispatch]);

  // ==========================================
  // Get data from Redux
  // ==========================================
  const { user, loading } = useSelector((state) => state.user);
  const { cartItems } = useSelector((state) => state.cart);

  const [paymentMethod, setPaymentMethod] = useState("COD");



  // ==========================================
  // Redirect to cart if checkout opened with empty cart
  // useEffect should be top level before any early returns to ensure it runs on every render and can handle cases where cart becomes empty after loading user data
  // ==========================================
  useEffect(() => {
    if (!loading && cartItems.length === 0) {
      navigate("/cart");
    }
  }, [cartItems, loading, navigate]);

  // ==========================================
  // Calculate totals
  // ==========================================
  const itemsPrice = cartItems.reduce(
    (acc, item) => acc + item.offerPrice * item.quantity,
    0
  );

  const taxPrice = itemsPrice * 0.05;
  const deliveryCharge = itemsPrice > 0 ? 100 : 0;
  const platformFee = itemsPrice > 0 ? 5 : 0;

  const totalPrice =
    itemsPrice + taxPrice + deliveryCharge + platformFee;

  // ==========================================
  // Handle Place Order
  // ==========================================
  // ==========================================
  // Handle Place Order (COD Flow)
  // ==========================================
  const placeOrderHandler = async () => {
    try {
      // Prevent double click
      if (placingOrder) return;

      // Validate address
      if (!user?.address?.street) {
        toast.error("Please complete your shipping address");
        navigate("/profile");
        return;
      }

      setPlacingOrder(true);

      // Prepare order data
      const orderData = {
        orderItems: cartItems.map((item) => ({
          product: item._id,
          name: item.name,
          price: item.offerPrice,
          quantity: item.quantity,
          image: item.images?.[0]
        })),
        shippingAddress: {
          address: user.address.street,
          city: user.address.city,
          state: user.address.state,
          pincode: user.address.pincode
        },
        itemsPrice,
        taxPrice,
        deliveryCharge,
        platformFee,
        totalPrice,
        paymentMethod
      };
      // console.log("Order Data:", orderData);

      // Send order to backend
      const { data } = await axiosInstance.post(
        "/api/orders",
        orderData,
        { withCredentials: true }
      );

      toast.success(data.message);

      // Clear cart after success
      dispatch(clearCart());

      // Navigate to success page
      // Adding a slight delay to ensure the success toast is visible before navigation
      setTimeout(() => {
        navigate(`/order-success/${data.order._id}`);
      }, 1200);

    } catch (error) {
      toast.error(
        error.response?.data?.message || "Order failed"
      );
    } finally {
      setPlacingOrder(false);
    }
  };

  // ==========================================
  // If user data is loading
  // ==========================================
  if (loading) {
    return (
      <div className="checkout-loader">
        <div className="spinner"></div>
        <p>Loading checkout...</p>
      </div>
    );
  }

  return (
    <>

  
      {/*  Checkout Navbar (Logo Only) */}
      <div className="checkout-navbar">
        <img
          src={logo}
          alt="MobileMart"
          className="checkout-logo"
          onClick={() => navigate("/")}
        />
      </div>

      {/* checkout container */}
      <div className="checkout-container">
        <h2 className="checkout-title">Checkout</h2>

        <div className="checkout-grid">

          {/* ================= LEFT SECTION ================= */}
          <div className="checkout-left">

            {/* Shipping Address */}
            <div className="checkout-card">
              <h5>Shipping Address</h5>
              <hr />

              <p><strong>Name:</strong> {user?.name}</p>
              <p><strong>Phone:</strong> {user?.phone || "Not Added"}</p>
              <p>
                <strong>Address:</strong>{" "}
                {user?.address?.street || "Not Added"},{" "}
                {user?.address?.city || ""},{" "}
                {user?.address?.state || ""}{" "}
                {user?.address?.pincode || ""}
              </p>
            </div>

            {/* Payment Method */}
            <div className="checkout-card">
              <h5>Select Payment Method</h5>
              <hr />

              <label className="payment-option">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="COD"
                  checked={paymentMethod === "COD"}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
                Cash on Delivery
              </label>

              <label className="payment-option">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="ONLINE"
                  checked={paymentMethod === "ONLINE"}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
                Online Payment (UPI / Card)
              </label>
            </div>

          </div>

          {/* ================= RIGHT SECTION ================= */}
          <div className="checkout-right">

            <div className="checkout-card">
              <h5>Order Summary</h5>
              <hr />

              {cartItems.map((item) => (
                <div
                  key={item._id}
                  className="summary-row"
                >
                  <span>
                    {item.name} x {item.quantity}
                  </span>
                  <span>
                    ₹{(item.offerPrice * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}

              <hr />

              <div className="summary-row">
                <span>Items Price</span>
                <span>₹{itemsPrice.toFixed(2)}</span>
              </div>

              <div className="summary-row">
                <span>Tax (5%)</span>
                <span>₹{taxPrice.toFixed(2)}</span>
              </div>

              <div className="summary-row">
                <span>Delivery</span>
                <span>₹{deliveryCharge}</span>
              </div>

              <div className="summary-row">
                <span>Platform Fee</span>
                <span>₹{platformFee}</span>
              </div>

              <hr />

              <div className="summary-row total-row">
                <span>Total</span>
                <span>₹{totalPrice.toFixed(2)}</span>
              </div>

              {/* <button
              className="place-order-btn"
              onClick={placeOrderHandler}
              disabled={placingOrder}
            >
              {placingOrder ? "Placing Order..." : "Place Order"}
            </button> */}

              <div className="checkout-actions">

                <button
                  className="back-cart-btn"
                  onClick={() => navigate("/cart")}
                >
                  Cancel Order
                </button>

                <button
                  className="place-order-btn"
                  onClick={placeOrderHandler}
                  disabled={placingOrder}
                >
                  {placingOrder ? "Placing Order..." : "Place Order"}
                </button>

              </div>

            </div>

          </div>
        </div>
      </div>
    </>
  );
};

export default Checkout;