<div className="col-12">
  <div className="search-product-card">

    {/* LEFT: IMAGE */}
    <div className="search-product-image">
      <img
        src={product.images?.[0]}
        alt={product.name}
        onClick={() => navigate(`/product/${product._id}`)}
      />
    </div>

    {/* RIGHT: DETAILS */}
    <div className="search-product-details">

      <h5
        className="product-title"
        onClick={() => navigate(`/product/${product._id}`)}
      >
        {product.name}
      </h5>

      {/* ⭐ Rating */}
      {product.quantity === 0 ? (
        <span className="badge bg-danger">Out of stock</span>
      ) : (
        <div className="rating-row">
          <RatingStars rating={product.averageRating} />
          <span className="review-count">
            ({product.numOfReviews})
          </span>
        </div>
      )}

      {/* Availability */}
      <p
        className={`availability ${
          product.quantity > 0 ? "in-stock" : "out-stock"
        }`}
      >
        {product.quantity > 0 ? "In stock" : "Out of stock"}
      </p>

      {/* Price */}
      <h4 className="price">₹ {product.offerPrice}</h4>

      {/* Button */}
      <button
        className="btn btn-cart"
        disabled={product.quantity === 0}
        onClick={() => console.log("Add to cart", product._id)}
      >
        <i className="bi bi-cart me-1"></i> Add Cart
      </button>
    </div>
  </div>
</div>
