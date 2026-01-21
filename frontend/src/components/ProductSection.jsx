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
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Navigation hook from react-router-dom
import { useNavigate } from "react-router-dom";

// Pagination component used for product listing pages
import Pagination from "react-js-pagination";

const ProductSection = () => {


  // Navigation hook used to navigate to product details page
  const navigate = useNavigate();

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

  // 🛒 Temporary cart handler (later connect Redux)
  const handleAddToCart = (product) => {
    console.log("Add to cart:", product.name);
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


  return (
    <>
    {/* ToastContainer is for displaying notifications */}
      <ToastContainer position="top-right" autoClose={3000} />

      {/* Product Section Wrapper */}
      <div
        className="container-fluid py-5"
        id="products"
        style={{ background: "radial-gradient(#8c52ff, #5ce1e6)" }}
      >
        <div className="holder">
          {/* Section Heading */}
          <h2 className="text-center text-white fw-bold mb-4">
            Best Deals on Smartphones
          </h2>

          <div className="container">
            <div className="row justify-content-center g-3 g-md-4">
              {/* 🔄 Skeleton loader while fetching */}
              {loading
                ? [...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="col-6 col-md-4 col-lg-3 col-xl-2"
                  >
                    <ProductSkeleton />
                  </div>
                ))
                : currentProducts.map((product) => (
                  <div
                    key={product._id}
                    className="col-6 col-md-4 col-lg-3 col-xl-2"
                  >
                    {/* Product Card */}
                    <div className="card h-100 text-center shadow-sm border-0">
                      {/* Image container */}
                      <div className="overflow-hidden">
                        <img
                          src={product.images?.[0]}
                          alt={product.name}
                          className="card-img-top"
                          onError={(e) =>
                            (e.target.src = placeholderImage)
                          }
                          onMouseOver={(e) =>
                            (e.currentTarget.style.transform = "scale(1.1)")
                          }
                          onMouseOut={(e) =>
                            (e.currentTarget.style.transform = "scale(1)")
                          }
                        />
                      </div>

                      {/* Card Body */}
                      <div className="card-body text-start">
                        {/* Product Name */}

                        <h6 className="fw-bold text-dark" onClick={() => navigate(`/product/${product._id}`)} style={{ cursor: "pointer" }}>
                          {product.name}
                        </h6>

                        {/* ⭐ Rating OR 🚫 Out of stock (never both) */}
                        {product.quantity === 0 ? (
                          <span className="badge bg-danger mb-2">
                            Out of stock
                          </span>
                        ) : (
                          <div className="d-flex align-items-center gap-1 mb-1">
                            <RatingStars rating={product.averageRating || 0} />
                            <span
                              className="text-muted"
                              style={{ fontSize: "0.8em" }}
                            >
                              ({product.numOfReviews})
                            </span>
                          </div>
                        )}


                        {/* 💰 Pricing */}
                        <div className="d-flex align-items-center gap-2">
                          <p
                            className="text-muted text-decoration-line-through mb-1"
                            style={{ fontSize: "0.9em" }}
                          >
                            ₹{product.originalPrice}
                          </p>
                          <p
                            className="text-success fw-bold mb-1"
                            style={{ fontSize: "1.1em" }}
                          >
                            ₹{product.offerPrice}
                          </p>
                        </div>

                        {/* 🛒 Action Buttons */}
                        <div className="d-flex gap-2 mt-2">
                          <button
                            className="btn btn-sm w-50 text-white"
                            style={{ backgroundColor: "var(--voilet)" }}
                            disabled={product.quantity === 0}
                            title={product.quantity === 0 ? "Out of stock" : "Add to cart"}
                            onClick={() =>
                              product.quantity > 0 && handleAddToCart(product)
                            }
                          >
                            <i className="bi bi-cart"></i> Add
                          </button>

                          <button
                            className="btn btn-sm w-50 text-white"
                            style={{ backgroundColor: "var(--green)" }}
                            title="View product"
                            onClick={() => navigate(`/product/${product._id}`)}
                          >
                            <i className="bi bi-eye"></i> View
                          </button>

                        </div>

                      </div>
                    </div>
                  </div>
                ))}
            </div>

{/* ===================== Pagination ===================== */}
{/* 
  This condition ensures:
  1️⃣ Pagination is shown ONLY after loading is finished
  2️⃣ Pagination is shown ONLY if total products are more than one page
    && This is short-circuit rendering
    It means:“Render the component only if the condition is true”
*/}
{!loading && products.length > itemsPerPage && (
  <div className="d-flex justify-content-center mt-4">
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
      </div>
    </>
  );
};

export default ProductSection;
