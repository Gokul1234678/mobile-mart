import React from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  removeFromCart,
  increaseQuantity,
  decreaseQuantity,
} from "../redux/cartSlice";
import { Link } from "react-router-dom";
import "../assets/styles/cart.css";

const Cart = () => {
  const dispatch = useDispatch();

  // =====================================
  // Get cart items from Redux store
  // =====================================
  const { cartItems } = useSelector((state) => state.cart);

  // =====================================
  // Calculate pricing details
  // =====================================
  const itemsPrice = cartItems.reduce(
    (acc, item) => acc + item.offerPrice * item.quantity,
    0
  );

  const taxPrice = itemsPrice * 0.05;
  const deliveryCharge = itemsPrice > 0 ? 100 : 0;
  const platformFee = itemsPrice > 0 ? 5 : 0;

  const totalPrice =
    itemsPrice + taxPrice + deliveryCharge + platformFee;

  return (
    <div className="container py-4">
      <h1 className="mb-4 fw-bold">Cart Items</h1>

      {/* =====================================
          EMPTY CART UI
      ===================================== */}
      {cartItems.length === 0 ? (
        <div className="text-center">
          <h4>Your cart is empty</h4>
          <Link to="/" className="btn btn-primary mt-3">
            Go Shopping
          </Link>
        </div>
      ) : (
        <>
          {/* =====================================
              CART ITEMS LIST
          ===================================== */}
          {cartItems.map((item) => (
            <div
              key={item._id} // ✅ Unique key required for React list rendering
              className="col-12 cart-item d-flex justify-content-between align-items-center border p-3 rounded mb-3"
            >
              {/* ================= LEFT SECTION ================= */}
              <div className="d-flex align-items-center">
                <img
                  src={item.images?.[0] || "/default-image.png"}
                  alt={item.name}
                  width="120"
                />

                <div className="ms-3">
                  <p className="mb-1 h5">{item.name}</p>

                  <p className="mt-2 mb-2 text-success">
                    {item.availability || "In Stock"}
                  </p>

                  <button
                    className="btn btn-outline-danger btn-sm"
                    onClick={() =>
                      dispatch(removeFromCart(item._id))
                    }
                  >
                    Remove
                  </button>
                </div>
              </div>

              {/* ================= QUANTITY SECTION ================= */}
              <div className="d-flex flex-column align-items-center">
                <h6 className="mb-2">Quantity</h6>

                <div className="quantity-control d-flex align-items-center gap-2">

                  {/* DECREASE BUTTON */}
                  <button
                    className="btn btn-sm btn-outline-secondary"
                    onClick={() =>
                      dispatch(decreaseQuantity(item._id))
                    }
                    disabled={item.quantity <= 1}  // ✅ Disable if quantity = 1
                  >
                    -
                  </button>

                  {/* QUANTITY INPUT */}
                  <input
                    type="text"
                    className="form-control form-control-sm text-center"
                    value={item.quantity}
                    readOnly
                    style={{ width: "60px" }}
                  />

                  {/* INCREASE BUTTON */}
                  <button
                    className={`btn btn-sm ${
                      item.quantity >= item.stock
                        ? "btn-secondary"
                        : "btn-outline-secondary"
                    }`}
                    onClick={() =>
                      dispatch(increaseQuantity(item._id)) 
                    }
                    disabled={item.quantity >= item.stock} // ✅ Disable when stock reached
                  >
                    +
                  </button>
                </div>

                {/* STOCK WARNING */}
                {item.quantity >= item.stock && (
                  <small className="text-danger mt-2">
                    Maximum stock reached
                  </small>
                )}
              </div>

              {/* ================= PRICE SECTION ================= */}
              <div className="text-center">
                <h6 className="mb-2">Price</h6>
                <p className="fw-bold">
                  ₹
                  {(item.offerPrice * item.quantity).toFixed(2)}
                </p>
              </div>
            </div>
          ))}

          {/* =====================================
              PRICE DETAILS SECTION
          ===================================== */}
          <h5 className="mt-4 mb-3">Price Details</h5>

          <div className="border p-3 rounded price-details">
            <div className="d-flex justify-content-between">
              <p>Price ({cartItems.length} items)</p>
              <p>₹{itemsPrice.toFixed(2)}</p>
            </div>

            <div className="d-flex justify-content-between">
              <p>Tax (5%)</p>
              <p>₹{taxPrice.toFixed(2)}</p>
            </div>

            <div className="d-flex justify-content-between">
              <p>Delivery Charges</p>
              <p>₹{deliveryCharge}</p>
            </div>

            <div className="d-flex justify-content-between">
              <p>Platform Fee</p>
              <p>₹{platformFee}</p>
            </div>

            <hr />

            <div className="d-flex justify-content-between fw-bold">
              <p>Total Amount</p>
              <p>₹{totalPrice.toFixed(2)}</p>
            </div>
          </div>

          {/* =====================================
              CHECKOUT BUTTON
          ===================================== */}
          <div className="text-center mt-4">
            <button className="btn btn-success btn-lg w-50">
              Checkout
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default Cart;