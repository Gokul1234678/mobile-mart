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
  // 🛒 Handle Place Order Function
  // ==========================================
  const placeOrderHandler = async () => {
    try {

      // ------------------------------------------
      // 🚫 Prevent double click / multiple requests
      // If user clicks button multiple times, stop it
      // ------------------------------------------
      if (placingOrder) return;

      // ------------------------------------------
      // 📍 Validate shipping address
      // Using optional chaining to safely check nested data
      // If address is missing → redirect to profile
      // ------------------------------------------
      if (!user?.address?.street) {
        toast.error("Please complete your shipping address"); // show error message
        navigate("/profile"); // redirect user to update address
        return; // stop execution
      }

      // ------------------------------------------
      // 🔄 Set loading state (used to disable button / show loader)
      // ------------------------------------------
      setPlacingOrder(true);

      // ------------------------------------------
      // 📦 Prepare order data (this will be sent to backend)
      // ------------------------------------------
      const orderData = {

        // 🛒 Map cart items into required format
        orderItems: cartItems.map((item) => ({
          product: item._id,        // product ID (important for backend)
          name: item.name,          // product name
          price: item.offerPrice,   // price at time of order
          quantity: item.quantity,  // quantity selected
          image: item.images?.[0]   // first image (optional chaining)
        })),

        // 🚚 Shipping address
        shippingAddress: {
          address: user.address.street,
          city: user.address.city,
          state: user.address.state,
          pincode: user.address.pincode
        },

        // 💰 Price breakdown
        itemsPrice,     // total product price
        taxPrice,       // tax amount
        deliveryCharge, // delivery fee
        platformFee,    // extra fee
        totalPrice,     // final amount

        // 💳 Selected payment method (COD / ONLINE)
        paymentMethod
      };

      // ==========================================
      // 💵 CASH ON DELIVERY (COD)
      // Click Order → Send order → Save in DB → Clear cart → Success page
      // ==========================================
      if (paymentMethod === "COD") {

        // {  COD FLOW (Cash on Delivery)

        //           User clicks Place Order
        //           ↓
        //           Frontend calls /api/orders
        //           ↓
        //           Backend:
        //             - create order
        //             - reduce stock
        //           ↓
        //           Cart cleared
        //           ↓
        //           Redirect to success page

        //           Summary:
        //           Order → Payment later
        // }
        // ------------------------------------------
        // 📡 Send order data directly to backend
        // ------------------------------------------
        const { data } = await axiosInstance.post(
          "/api/orders",
          orderData,
          { withCredentials: true } // send cookies (auth)
        );

        // ------------------------------------------
        // ✅ Show success message from backend
        // ------------------------------------------
        toast.success(data.message);

        // ------------------------------------------
        // 🧹 Clear cart after successful order
        // ------------------------------------------
        dispatch(clearCart());

        // ------------------------------------------
        // 🔀 Redirect to order success page
        // small delay for better UX
        // ------------------------------------------
        setTimeout(() => {
          navigate(`/order-success/${data.order._id}`);
        }, 1200);
      }

      // ==========================================
      // 💳 ONLINE PAYMENT (RAZORPAY)
      // ==========================================
      else {

        //{
        //       ONLINE PAYMENT FLOW (Razorpay)
        //       User clicks Place Order
        //           ↓
        //           Call /api/payment/create-order
        //           ↓
        //           Backend creates Razorpay order
        //           ↓
        //           Frontend opens Razorpay popup
        //           ↓
        //           User pays
        //           ↓
        //           Razorpay returns payment data
        //           ↓
        //           Call /api/payment/verify-payment
        //           ↓
        //           Backend verifies payment
        //           ↓
        //           If valid:
        //             - create order
        //             - reduce stock
        //           ↓
        //           Cart cleared
        //           ↓
        //           Success page

        //           Summary:
        //           Payment → Verify → Order  
        //}


        // ------------------------------------------
        // 📡 Step 1: Create order in backend
        // Backend talks to Razorpay using SECRET KEY
        // ------------------------------------------
        const { data } = await axiosInstance.post(
          "/api/payment/create-order",
          { amount: totalPrice }, // send total amount
          { withCredentials: true } // send cookies for auth
        );

        // ------------------------------------------
        // ⚙️ Razorpay Checkout Options
        // ------------------------------------------
        // This configures the Razorpay popup.
        const options = {

          // 🔑 Rozorpay Public key from environment variables and it is used to identify the merchant
          key: import.meta.env.VITE_RAZORPAY_KEY_ID,

          // 💰 Amount and currency (must match backend)
          amount: data.order.amount,
          currency: data.order.currency,

          // 🏷 Branding
          name: "Mobile Mart",
          description: "Order Payment",

          // 🆔 Razorpay order ID (VERY IMPORTANT)
          // this links the payment to the specific order created in Razorpay server and is used for verification later
          order_id: data.order.id,

          // 💳 Enable payment methods it allows user to choose their preferred payment option
          method: {
            upi: true,
            card: true,
            netbanking: true,
            wallet: true
          },

          // 👤 Auto-fill user details
          prefill: {
            name: user?.name,
            email: user?.email,
            contact: user?.phone || ""
          },

          // ------------------------------------------
          // 🎯 Step 2: Handle successful payment
          // After payment is completed, Razorpay will call this handler function with payment details
          // ------------------------------------------
          handler: async function (response) {
            // response contains razorpay_payment_id, razorpay_order_id, razorpay_signature which are needed for verification

            // ------------------------------------------
            // 🔐 Step 3: Verify payment on backend
            // (VERY IMPORTANT for security)
            // ------------------------------------------
            const verify = await axiosInstance.post(
              "/api/payment/verify-payment",
              {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature
              },
              { withCredentials: true }
            );

            // ------------------------------------------
            // ✅ If payment verified successfully
            // ------------------------------------------
            if (verify.data.success) {

              // 📦 Step 4: Create order in DB
              const orderRes = await axiosInstance.post(
                "/api/orders",
                orderData,
                { withCredentials: true }
              );

              toast.success("Payment successful!");
              dispatch(clearCart());

              // 🔀 Navigate to success page with delay
              setTimeout(() => {
                navigate(`/order-success/${orderRes.data.order._id}`);
              }, 1200);

            }  
            else {

              // ❌ Payment verification failed
              toast.error("Payment verification failed");
            }
        },

          // 🎨 UI theme
          theme: {
            color: "#198754"
          }
      };

      // ------------------------------------------
      // 🚀 Step 5: this line Open Razorpay Checkout popup
      // ------------------------------------------
      const rzp = new window.Razorpay(options); // this creates a new Razorpay instance with the configured options
      rzp.open();// this forces the Razorpay checkout to open immediately after configuration. The user will see the payment options and can complete the transaction.
    }

    } catch (error) {

    // ------------------------------------------
    // ❌ Global error handling
    // ------------------------------------------
    toast.error(error.response?.data?.message || "Order failed");

  } finally {

    // ------------------------------------------
    // 🔄 Reset loading state
    // ------------------------------------------
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