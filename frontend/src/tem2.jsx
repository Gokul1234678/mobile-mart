{/* Quantity Selector */}
<div className="d-flex align-items-center gap-3 mb-3 quantity-wrapper">
  <button
    className="qty-btn qty-decrease"
    onClick={decreaseQty}
  >
    −
  </button>

  <span className="qty-value">{qty}</span>

  <button
    className="qty-btn qty-increase"
    onClick={increaseQty}
  >
    +
  </button>
</div>
