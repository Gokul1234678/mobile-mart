// React hooks for state management and lifecycle
import React, { useState, useEffect } from "react";

// Product section styles
import "../assets/styles/product.css";

// Axios instance with base URL & interceptors
import axiosInstance from "../axios_instance";

// Fallback image when product image fails to load
import placeholderImage from "../assets/img/tem.jfif";

// Star rating component
import RatingStars from "./RatingStars";

// Skeleton loader component
import ProductSkeleton from "../components/ProductSkeleton";

// to display toast notifications
import { toast } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";

// Navigation hook from react-router-dom
import { useNavigate } from "react-router-dom";

// Pagination component used for product listing pages
import Pagination from "react-js-pagination";

import { useDispatch } from "react-redux";
import { addToCart } from "../redux/cartSlice";

// =============================================
// Self-contained styles — matches app theme
// Orange (#ff5722) + Violet (#6a0dad)
// =============================================
const styles = `

  /* ==========================================
     ANIMATIONS
  ========================================== */

  /* Card slide up on entry */
  @keyframes ps-fadeUp {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  /* Image zoom on hover */
  @keyframes ps-imgZoom {
    from { transform: scale(1); }
    to   { transform: scale(1.08); }
  }

  /* Shimmer on button */
  @keyframes ps-shimmer {
    0%   { background-position: -200% center; }
    100% { background-position: 200% center; }
  }

  /* ==========================================
     SHIMMER SKELETON
  ========================================== */

  /* Main shimmer wave — sweeps left to right */
  @keyframes ps-skeleton-shimmer {
    0%   { background-position: -600px 0; }
    100% { background-position: 600px 0; }
  }

  /* Skeleton card fade in */
  @keyframes ps-skeleton-appear {
    from { opacity: 0; transform: translateY(10px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  /* Skeleton card wrapper — matches real card dimensions */
  .ps-skeleton-card {
    background: rgba(255,255,255,0.18);
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 4px 20px rgba(0,0,0,0.1);
    animation: ps-skeleton-appear 0.4s ease both;
  }

  /* Stagger skeleton card appearances */
  .ps-skeleton-card:nth-child(1) { animation-delay: 0.00s; }
  .ps-skeleton-card:nth-child(2) { animation-delay: 0.06s; }
  .ps-skeleton-card:nth-child(3) { animation-delay: 0.12s; }
  .ps-skeleton-card:nth-child(4) { animation-delay: 0.18s; }
  .ps-skeleton-card:nth-child(5) { animation-delay: 0.24s; }
  .ps-skeleton-card:nth-child(6) { animation-delay: 0.30s; }

  /* Base shimmer block — every skeleton element uses this */
  .ps-skeleton-block {
    background: linear-gradient(
      90deg,
      rgba(255,255,255,0.08) 0%,
      rgba(255,255,255,0.08) 30%,
      rgba(255,255,255,0.35) 50%,   /* bright hot spot in middle */
      rgba(255,255,255,0.08) 70%,
      rgba(255,255,255,0.08) 100%
    );
    background-size: 1200px 100%;   /* wider than element = slow smooth sweep */
    animation: ps-skeleton-shimmer 1.6s ease-in-out infinite;
    border-radius: 6px;
  }

  /* Stagger the shimmer timing per block so they don't pulse in sync */
  .ps-skeleton-title   { animation-delay: 0.0s; }
  .ps-skeleton-title-2 { animation-delay: 0.1s; }
  .ps-skeleton-rating  { animation-delay: 0.2s; }
  .ps-skeleton-price   { animation-delay: 0.15s; }
  .ps-skeleton-btn     { animation-delay: 0.25s; }

  /* Image placeholder — taller, no radius (fills card top) */
  .ps-skeleton-img {
    height: 180px;
    border-radius: 0;
    margin-bottom: 0;
  }

  /* Body padding area */
  .ps-skeleton-body {
    padding: 14px 14px 16px;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  /* Product name — 2 lines */
  .ps-skeleton-title {
    height: 15px;
    width: 88%;
  }

  .ps-skeleton-title-2 {
    height: 15px;
    width: 62%;
  }

  /* Star rating row */
  .ps-skeleton-rating {
    height: 12px;
    width: 52%;
  }

  /* Price row */
  .ps-skeleton-price {
    height: 18px;
    width: 72%;
  }

  /* Button row */
  .ps-skeleton-btns {
    display: flex;
    gap: 8px;
    margin-top: 4px;
  }

  /* Each button placeholder */
  .ps-skeleton-btn {
    height: 36px;
    flex: 1;
    border-radius: 6px;
  }

  /* ==========================================
     SECTION WRAPPER
  ========================================== */
  .ps-section {
    background: radial-gradient(ellipse at top left, #8c52ff, #5ce1e6);
    padding: 60px 0 40px;
    min-height: 100vh;
  }

  /* ==========================================
     SECTION HEADING
  ========================================== */
  .ps-heading-wrap {
    text-align: center;
    margin-bottom: 36px;
    animation: ps-fadeUp 0.5s ease both;
  }

  .ps-heading {
    font-size: 2.2rem;
    font-weight: 800;
    color: #fff;
    margin-bottom: 6px;
    letter-spacing: -0.02em;
    text-shadow: 0 2px 12px rgba(0,0,0,0.15);
  }

  /* Subtitle below heading */
  .ps-subheading {
    font-size: 1.05rem;
    color: rgba(255,255,255,0.7);
    font-weight: 400;
  }

  /* ==========================================
     PRODUCTS GRID
  ========================================== */
  .ps-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 20px;
    padding: 0 16px;
  }

  /* ==========================================
     PRODUCT CARD
  ========================================== */
  .ps-card {
    background: #fff;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 4px 20px rgba(0,0,0,0.12);
    display: flex;
    flex-direction: column;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
    animation: ps-fadeUp 0.4s ease both;
    position: relative;
  }

  /* Lift card on hover */
  .ps-card:hover {
    transform: translateY(-6px);
    box-shadow: 0 12px 32px rgba(0,0,0,0.2);
  }

  /* ==========================================
     PRODUCT IMAGE WRAPPER
  ========================================== */
  .ps-img-wrap {
    overflow: hidden;
    background: #fff;
    height: 180px;               /* taller for better product visibility */
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    padding: 12px;               /* padding so image doesn't touch edges */
    border-bottom: 1px solid #f0f0f0;
  }

  .ps-img {
    width: 100%;
    height: 100%;
    object-fit: contain;         /* contain = full product visible, no cropping */
    transition: transform 0.35s ease;
  }

  .ps-img-wrap:hover .ps-img {
    transform: scale(1.08);      /* zoom on hover */
  }

  /* ==========================================
     CARD BODY
  ========================================== */
  .ps-card-body {
    padding: 12px 14px 14px;
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  /* Product name — clickable */
  .ps-name {
    font-size: 1rem;
    font-weight: 700;
    color: #111;
    cursor: pointer;
    line-height: 1.3;
    display: -webkit-box;
    -webkit-line-clamp: 2;       /* truncate after 2 lines */
    -webkit-box-orient: vertical;
    overflow: hidden;
    transition: color 0.15s;
    margin: 0;
  }

  .ps-name:hover {
    color: #ff5722;              /* orange on hover */
  }

  /* ==========================================
     RATING ROW
  ========================================== */
  .ps-rating-row {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .ps-review-count {
    font-size: 0.82rem;
    color: #999;
  }

  /* Out of stock badge */
  .ps-out-badge {
    display: inline-block;
    background: #f8d7da;
    color: #842029;
    font-size: 0.82rem;
    font-weight: 700;
    padding: 3px 8px;
    border-radius: 4px;
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  /* ==========================================
     PRICING ROW
  ========================================== */
  .ps-pricing {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
  }

  /* Original price — strikethrough muted */
  .ps-original-price {
    font-size: 0.88rem;
    color: #bbb;
    text-decoration: line-through;
    margin: 0;
  }

  /* Offer price — green bold */
  .ps-offer-price {
    font-size: 1.1rem;
    font-weight: 800;
    color: #198754;              /* green for savings */
    margin: 0;
  }

  /* Discount % badge */
  .ps-discount-badge {
    font-size: 0.78rem;
    font-weight: 700;
    color: #ff5722;
    background: #fff3ef;
    padding: 2px 6px;
    border-radius: 4px;
    white-space: nowrap;
  }

  /* ==========================================
     ACTION BUTTONS
  ========================================== */
  .ps-actions {
    display: flex;
    gap: 8px;
    margin-top: auto;            /* pushes buttons to bottom of card */
    padding-top: 6px;
  }

  /* Shared button base */
  .ps-btn {
    flex: 1;
    padding: 8px 6px;
    border: none;
    border-radius: 6px;
    font-size: 0.88rem;
    font-weight: 700;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
    transition: background 0.2s, transform 0.15s, box-shadow 0.2s;
    position: relative;
    overflow: hidden;
  }

  /* Add to Cart — green */
  .ps-btn.cart {
    background: #198754;
    color: #fff;
    box-shadow: 0 2px 8px rgba(25,135,84,0.3);
  }

  /* Shimmer sweep on cart button */
  .ps-btn.cart::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(
      105deg,
      transparent 40%,
      rgba(255,255,255,0.2) 50%,
      transparent 60%
    );
    background-size: 200% auto;
    animation: ps-shimmer 2.4s linear infinite;
  }

  .ps-btn.cart:hover:not(:disabled) {
    background: #157347;         /* darker green on hover */
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(25,135,84,0.4);
  }

  /* Disabled cart button when out of stock */
  .ps-btn.cart:disabled {
    background: #ddd;
    color: #aaa;
    cursor: not-allowed;
    box-shadow: none;
  }

  .ps-btn.cart:disabled::after {
    display: none;               /* hide shimmer on disabled */
  }

  /* View — orange */
  .ps-btn.view {
    background: #ff5722;
    color: #fff;
    box-shadow: 0 2px 8px rgba(255,87,34,0.3);
  }

  .ps-btn.view:hover {
    background: #6a0dad;         /* switch to violet on hover */
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(106,13,173,0.35);
  }

  /* ==========================================
     PAGINATION — styled to match theme
  ========================================== */
  .ps-pagination-wrap {
    display: flex;
    justify-content: center;
    margin-top: 36px;
    padding-bottom: 12px;
  }

  .ps-pagination-wrap .pagination {
    display: flex;
    gap: 6px;
    list-style: none;
    padding: 0;
    margin: 0;
    flex-wrap: wrap;
    justify-content: center;
  }

  .ps-pagination-wrap .page-item .page-link {
    padding: 8px 14px;
    border: 2px solid rgba(255,255,255,0.4);
    border-radius: 6px !important;
    font-size: 0.88rem;
    font-weight: 600;
    color: #fff;
    background: rgba(255,255,255,0.15);
    text-decoration: none;
    backdrop-filter: blur(6px);  /* frosted glass effect on pagination */
    transition: background 0.15s, border-color 0.15s, transform 0.1s;
  }

  /* Active page — solid white */
  .ps-pagination-wrap .page-item.active .page-link {
    background: #fff;
    color: #6a0dad;
    border-color: #fff;
    font-weight: 800;
  }

  .ps-pagination-wrap .page-item:not(.active) .page-link:hover {
    background: rgba(255,255,255,0.3);
    border-color: rgba(255,255,255,0.7);
    transform: translateY(-1px);
  }

  .ps-pagination-wrap .page-item.disabled .page-link {
    opacity: 0.35;
    cursor: not-allowed;
  }

  /* ==========================================
     STAGGERED CARD ANIMATION DELAYS
  ========================================== */
  .ps-card:nth-child(1) { animation-delay: 0.04s; }
  .ps-card:nth-child(2) { animation-delay: 0.08s; }
  .ps-card:nth-child(3) { animation-delay: 0.12s; }
  .ps-card:nth-child(4) { animation-delay: 0.16s; }
  .ps-card:nth-child(5) { animation-delay: 0.20s; }
  .ps-card:nth-child(6) { animation-delay: 0.24s; }

  /* ==========================================
     RESPONSIVE
  ========================================== */
  @media (max-width: 768px) {
    .ps-heading   { font-size: 1.7rem; }
    .ps-grid      { grid-template-columns: repeat(2, 1fr); gap: 14px; }
    .ps-img-wrap  { height: 130px; }
    .ps-offer-price { font-size: 1rem; }
  }

  @media (max-width: 400px) {
    .ps-grid      { grid-template-columns: 1fr; }
    .ps-heading   { font-size: 1.3rem; }
  }
`;

const ProductSection = () => {

  // Navigation hook used to navigate to product details page
  const navigate = useNavigate();

  const dispatch = useDispatch();

  // Pagination state
  const [activePage, setActivePage] = useState(1);
  const itemsPerPage = 6;

  const handlePageChange = (pageNumber) => {
    setActivePage(pageNumber);
  };

  // Loader state (true until API response)
  const [loading, setLoading] = useState(true);
  // Stores fetched product list
  const [products, setProducts] = useState([]);

  // Handler for adding product to cart
  const handleAddToCart = (product) => {
    // ==========================================
    // 🛒 ADD PRODUCT TO REDUX CART
    // ==========================================
    dispatch(
      addToCart({
        ...product,
        // Default quantity when adding from home page
        quantity: 1,
        // Save available stock
        stock: product.quantity
      })
    );

    // ==========================================
    // ✅ SUCCESS TOAST
    // ==========================================
    toast.success(`${product.name} added to cart`);
  };

  // Fetch products when component mounts
  useEffect(() => {
    async function fetchProducts() {
      try {
        // API call to get all products
        const res = await axiosInstance.get("/api/products");

        // console.log(res); // Debugging API response

        // Store products in state
        setProducts(res.data.products);
      } catch (err) {
        // Error handling
        console.error("Error fetching products:", err);
        toast.error("Failed to load products 😢");
      } finally {
        // Stop loader in both success & error cases
        setLoading(false);
      }
    }

    fetchProducts();
  }, []);

  // Calculate products for current page
  const indexOfLastProduct = activePage * itemsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - itemsPerPage;
  const currentProducts = products.slice(
    indexOfFirstProduct,
    indexOfLastProduct
  );

  // Calculate discount percentage for each product
  const getDiscount = (original, offer) => {
    if (!original || original <= offer) return null;
    return Math.round(((original - offer) / original) * 100);
  };

  return (
    <>
      <style>{styles}</style>

      {/* Product Section Wrapper */}
      <div className="ps-section" id="products">
        <div className="container">

          {/* ==========================================
              SECTION HEADING
          ========================================== */}
          <div className="ps-heading-wrap">
            <h2 className="ps-heading">Best Deals on Smartphones</h2>
            <p className="ps-subheading">Top picks at unbeatable prices</p>
          </div>

          {/* ==========================================
              PRODUCTS GRID
              🔄 Skeleton loader while fetching
          ========================================== */}
          <div className="ps-grid">
            {loading
              ? /* Show 6 shimmer skeleton cards while loading */
                [...Array(6)].map((_, i) => (
                  <div key={i} className="ps-skeleton-card">
                    {/* Image placeholder */}
                    <div className="ps-skeleton-block ps-skeleton-img" />
                    <div className="ps-skeleton-body">
                      {/* Title lines */}
                      <div className="ps-skeleton-block ps-skeleton-title" />
                      <div className="ps-skeleton-block ps-skeleton-title-2" />
                      {/* Rating */}
                      <div className="ps-skeleton-block ps-skeleton-rating" />
                      {/* Price */}
                      <div className="ps-skeleton-block ps-skeleton-price" />
                      {/* Buttons */}
                      <div className="ps-skeleton-btns">
                        <div className="ps-skeleton-block ps-skeleton-btn" />
                        <div className="ps-skeleton-block ps-skeleton-btn" />
                      </div>
                    </div>
                  </div>
                ))
              : currentProducts.map((product) => {

                  // Calculate discount % for this product
                  const discount = getDiscount(
                    product.originalPrice,
                    product.offerPrice
                  );

                  return (
                    <div key={product._id} className="ps-card">

                      {/* ---- Product Image + Hover Overlay ---- */}
                      <div className="ps-img-wrap">
                        <img
                          src={product.images?.[0]}
                          alt={product.name}
                          className="ps-img"
                          onClick={() => navigate(`/product/${product._id}`)}
                          onError={(e) => (e.target.src = placeholderImage)} // fallback image
                        />

                      </div>

                      {/* ---- Card Body ---- */}
                      <div className="ps-card-body">

                        {/* Product name — navigates to detail page on click */}
                        <h6
                          className="ps-name"
                          onClick={() => navigate(`/product/${product._id}`)}
                        >
                          {product.name}
                        </h6>

                        {/* ⭐ Rating OR 🚫 Out of stock (never both) */}
                        {product.quantity === 0 ? (
                          <span className="ps-out-badge">Out of Stock</span>
                        ) : (
                          <div className="ps-rating-row">
                            <RatingStars rating={product.averageRating || 0} />
                            <span className="ps-review-count">
                              ({product.numOfReviews})
                            </span>
                          </div>
                        )}

                        {/* 💰 Pricing — original strikethrough + offer price + discount % */}
                        <div className="ps-pricing">
                          <p className="ps-original-price">
                            ₹{product.originalPrice}
                          </p>
                          <p className="ps-offer-price">
                            ₹{product.offerPrice}
                          </p>
                          {/* Show discount badge only if there is a discount */}
                          {discount && (
                            <span className="ps-discount-badge">
                              -{discount}%
                            </span>
                          )}
                        </div>

                        {/* 🛒 Action Buttons */}
                        <div className="ps-actions">

                          {/* Add to Cart — violet, disabled if out of stock */}
                          <button
                            className="ps-btn cart"
                            disabled={product.quantity === 0}
                            title={
                              product.quantity === 0
                                ? "Out of stock"
                                : "Add to cart"
                            }
                            onClick={() =>
                              product.quantity > 0 && handleAddToCart(product)
                            }
                          >
                            🛒 Add
                          </button>

                          {/* View — orange, navigates to product detail */}
                          <button
                            className="ps-btn view"
                            title="View product"
                            onClick={() => navigate(`/product/${product._id}`)}
                          >
                            👁️ View
                          </button>

                        </div>

                      </div>
                    </div>
                  );
                })}
          </div>

          {/* ===================== Pagination ===================== */}
          {/* 
            This condition ensures:
            1️⃣ Pagination is shown ONLY after loading is finished
            2️⃣ Pagination is shown ONLY if total products are more than one page
              && This is short-circuit rendering
              It means:"Render the component only if the condition is true"
          */}
          {!loading && products.length > itemsPerPage && (
            <div className="ps-pagination-wrap">
              {/* Pagination component from react-js-pagination */}
              <Pagination
                /* 
                  activePage:
                  - Current page number selected
                  - Example: 1, 2, 3...
                  - This comes from React state (useState)
                */
                activePage={activePage}

                /*
                  itemsCountPerPage:
                  - How many products should appear per page
                  - Example: 6 products per page
                */
                itemsCountPerPage={itemsPerPage}

                /*
                  totalItemsCount:
                  - Total number of products available
                  - Used to calculate how many pages are needed
                  - Example: 30 products / 6 per page = 5 pages
                */
                totalItemsCount={products.length}

                /*
                  pageRangeDisplayed:
                  - How many page numbers to show in pagination UI
                  - Example: 5 → shows: 1 2 3 4 5
                */
                pageRangeDisplayed={5}

                /*
                  onChange:
                  - This function runs when user clicks a page number
                  - The clicked page number is automatically passed as argument
                  - Example: handlePageChange(2)
                */
                onChange={handlePageChange}

                /* ================= Buttons ================= */

                /* 🔹 Show First button */
                firstPageText="First"

                /* 🔹 Show Last button */
                lastPageText="Last"

                /* 🔹 Show Previous button */
                prevPageText="Prev"

                /* 🔹 Show Next button */
                nextPageText="Next"

                /*
                  itemClass:
                  - Class applied to each <li> element
                  - Works well with Bootstrap pagination styles
                */
                itemClass="page-item"

                /*
                  linkClass:
                  - Class applied to each page <a> link
                */
                linkClass="page-link"

                /*
                  innerClass:
                  - Class applied to the main <ul> wrapper
                */
                innerClass="pagination"
              />
            </div>
          )}
          {/* ===================== End Pagination ===================== */}

        </div>
      </div>
    </>
  );
};

export default ProductSection;