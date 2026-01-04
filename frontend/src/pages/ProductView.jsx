// React hooks
import React, { useEffect, useState } from "react";

// Router
import { useParams } from "react-router-dom";

// API
import axiosInstance from "../axios_instance";

// Components
import Navbar from "../components/Navbar";
import RatingStars from "../components/RatingStars";
import ProductSkeleton from "../components/ProductSkeleton";

// for title and meta tags
import { Helmet } from "react-helmet-async";


// Styles
import "../assets/styles/productView.css";
import VideoLoader from "../components/VideoLoader";

const ProductView = () => {
  const { id } = useParams(); // productId from URL

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);

  useEffect(() => {
    async function fetchProduct() {
      try {
        const res = await axiosInstance.get(`/api/product/${id}`);
        setProduct(res.data.product);
        console.log(res.data.product);
      } catch (err) {
        console.error("Failed to fetch product", err);
      } finally {
        setLoading(false);
      }
    }

    fetchProduct();
  }, [id]);

  // Quantity handlers
  const increaseQty = () => {
    if (qty < product.quantity) setQty(qty + 1);
  };

  const decreaseQty = () => {
    if (qty > 1) setQty(qty - 1);
  };

  if (loading) return <VideoLoader loaderName="loading" fullscreen  />;

  if (!product) return <p className="text-center h2">Product not found</p>;

  // this is for preventing scroll when loader is active
//   useEffect(() => {
//   document.body.style.overflow = loading ? "hidden" : "auto";
// }, [loading]);

  return (
    <>
      {/* dynamic title */}
      <Helmet>
        <title>
          {product
            ? `${product.name} | Mobile Mart`
            : "Product Details | Mobile Mart"}
        </title>

        <meta
          name="description"
          content={
            product
              ? product.description
              : "View product details, specifications, price, and reviews on Mobile Mart."
          }
        />
      </Helmet>

      <Navbar />

    
      <div className="container py-5 cus-font product-view-container">
        <div className="row">
          {/* IMAGE CAROUSEL */}
          <div className="col-lg-6">
            <div
              id="productCarousel"
              className="carousel slide"
              data-bs-ride="carousel"
            >
              <div className="carousel-inner">
                {product.images.map((img, index) => (
                  <div
                    key={index}
                    className={`carousel-item ${index === 0 ? "active" : ""
                      }`}
                  >
                    <img src={img} className="d-block w-100" alt={product.name} />
                  </div>
                ))}
              </div>

              <button
                className="carousel-control-prev"
                type="button"
                data-bs-target="#productCarousel"
                data-bs-slide="prev"
              >
                <span className="carousel-control-prev-icon"></span>
              </button>

              <button
                className="carousel-control-next"
                type="button"
                data-bs-target="#productCarousel"
                data-bs-slide="next"
              >
                <span className="carousel-control-next-icon"></span>
              </button>
            </div>
          </div>

          {/* PRODUCT DETAILS */}
          <div className="col-lg-6">
            <div className="product-card">
              <h2>{product.name}</h2>

              {/* Product ID */}
              <p className="text-muted" style={{ fontSize: "0.9em" }}>
                Product ID: {product._id}
              </p>

              {/* Rating */}
              <div className="d-flex align-items-center gap-2 mb-2">
                <RatingStars rating={product.averageRating} />
                <span className="text-muted">
                  ({product.numOfReviews} reviews)
                </span>
              </div>

              {/* Price */}
              <h3 className="text-success">₹{product.offerPrice}</h3>
              <p className="text-muted text-decoration-line-through">
                ₹{product.originalPrice}
              </p>


              {/* Availability */}
              <p style={{ fontSize: "1.2em" }}>
                Availability:{" "}
                <span
                  className={
                    product.quantity === 0 ? "text-danger" : "text-green"
                  }
                >
                  {product.quantity === 0 ? "Out of Stock" : product.availability}
                </span>
              </p>


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


              {/* ADD TO CART Button */}
              <button
                className="btn-add-to-cart"
                disabled={product.quantity === 0}
              >
                <i className="bi bi-cart me-1"></i> Add to Cart
              </button>


              {/* DETAILS */}
              <div className="product-details mt-4">
                <hr />
                <h5>Specifications</h5>
                <ul>
                  {Object.entries(product.specifications).map(
                    ([key, value]) => (
                      <li key={key}>
                        <strong>{key}:</strong> {value}
                      </li>
                    )
                  )}
                </ul>

                <hr />
                <h5>Description</h5>
                <p>{product.description}</p>


                {/* <!-- Warranty Information --> */}
                <hr />
                <h5>Warranty Information:</h5>
                <ul>
                  <li>1-year manufacturer warranty.</li>
                  <li>1-year warranty for in-box accessories.</li>
                </ul>

                {/* <!-- Return Policy --> */}
                <hr />
                <h5>Return Policy:</h5>
                <ul>
                  <li>7-day return policy available.</li>
                </ul>

              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProductView;
