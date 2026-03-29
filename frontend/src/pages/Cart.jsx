import React from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  removeFromCart,
  increaseQuantity,
  decreaseQuantity,
} from "../redux/cartSlice";
import Navbar from "../components/Navbar";
import { Link } from "react-router-dom";

import { useNavigate } from "react-router-dom";

import "../assets/styles/cart.css";


const Cart = () => {
  const dispatch = useDispatch();
  const { cartItems } = useSelector((state) => state.cart);

  const itemsPrice = cartItems.reduce(
    (acc, item) => acc + item.offerPrice * item.quantity,
    0
  );
  // MRP = original price before discount
  const mrpTotal = cartItems.reduce(
    (acc, item) => acc + (item.originalPrice || item.offerPrice) * item.quantity,
    0
  );
  const discountOnMRP = mrpTotal - itemsPrice;
  const taxPrice = itemsPrice * 0.05;
  const deliveryCharge = itemsPrice > 0 ? 100 : 0;
  const platformFee = itemsPrice > 0 ? 5 : 0;
  const totalPrice = itemsPrice + taxPrice + deliveryCharge + platformFee;


  const navigate = useNavigate();

  const { isAuthenticated } = useSelector((state) => state.user);

  const checkoutHandler = () => {
    if (cartItems.length === 0) {
      alert("Your cart is empty");
      return;
    }

    if (!isAuthenticated) {
      navigate("/login");
    } else {
      navigate("/checkout");
    }
  };
  return (
    <>
      {/* <style>{styles}</style> */}
      <Navbar />
      <div className="cart-root">
        <div className="cart-inner">
          {/* Header */}
          <div className="cart-header">
            <h1 className="cart-title">Your Cart</h1>
            {cartItems.length > 0 && (
              <span className="cart-count-badge">
                {cartItems.length} {cartItems.length === 1 ? "item" : "items"}
              </span>
            )}
          </div>

          {/* Empty State */}
          {cartItems.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🛒</div>
              <h2 className="empty-title">Nothing here yet</h2>
              <p className="empty-sub">Add items to your cart to see them here.</p>
              <Link to="/" className="shop-btn">Start Shopping</Link>
            </div>
          ) : (
            <div className="cart-layout">
              {/* Left: Items */}
              <div>
                {cartItems.map((item) => (
                  <div key={item._id} className="cart-item-card">
                    <img
                      src={item.images?.[0] || "/default-image.png"}
                      alt={item.name}
                      className="cart-item-img"
                    />
                    <div className="cart-item-body">
                      <p className="cart-item-name">{item.name}</p>
                      <p className="cart-item-status">
                        {item.availability || "In Stock"}
                      </p>
                      <div className="cart-item-row">
                        {/* Quantity */}
                        <div>
                          <div className="qty-control">
                            <button
                              className="qty-btn"
                              onClick={() => dispatch(decreaseQuantity(item._id))}
                              disabled={item.quantity <= 1}
                            >−</button>
                            <input
                              className="qty-value"
                              type="text"
                              value={item.quantity}
                              readOnly
                            />
                            <button
                              className="qty-btn"
                              onClick={() => dispatch(increaseQuantity(item._id))}
                              disabled={item.quantity >= item.stock}
                            >+</button>
                          </div>
                          {item.quantity >= item.stock && (
                            <div className="stock-warning">Max stock reached</div>
                          )}
                        </div>

                        {/* Price */}
                        <span className="item-price">
                          ₹ {(item.offerPrice * item.quantity).toFixed(2)}
                        </span>

                        {/* Remove */}
                        <button
                          className="remove-btn"
                          onClick={() => dispatch(removeFromCart(item._id))}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                            <path d="M10 11v6" />
                            <path d="M14 11v6" />
                            <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                          </svg>
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Right: Price Summary */}
              <div>
                <div className="price-card">
                  <p className="price-card-title">Order Summary</p>

                  <div className="price-row">
                    <span>MRP ({cartItems.length} items)</span>
                    <span>₹{mrpTotal.toFixed(2)}</span>
                  </div>
                  {discountOnMRP > 0 && (
                    <div className="price-row discount-row">
                      <span>Discount on MRP</span>
                      <span>− ₹{discountOnMRP.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="price-row">
                    <span>GST (5%)</span>
                    <span>₹{taxPrice.toFixed(2)}</span>
                  </div>
                  <div className="price-row">
                    <span>Delivery</span>
                    <span>₹{deliveryCharge}</span>
                  </div>
                  <div className="price-row">
                    <span>Platform fee</span>
                    <span>₹{platformFee}</span>
                  </div>

                  <hr className="price-divider" />

                  <div className="price-total-row">
                    <span className="total-label">Total</span>
                    <span className="total-amount">₹{totalPrice.toFixed(2)}</span>
                  </div>

                  {discountOnMRP > 0 && (
                    <div className="savings-banner">
                      🎉 You're saving ₹{discountOnMRP.toFixed(2)} on this order!
                    </div>
                  )}

                    {/* Checkout botton  */}
                  <button className="checkout-btn" onClick={checkoutHandler}>Proceed to Checkout</button>

                  <p className="secure-note">🔒 Secure & encrypted checkout</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Cart;