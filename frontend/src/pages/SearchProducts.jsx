// React
import React, { useEffect, useState } from "react";

// Router
import { useNavigate } from "react-router-dom";

// API
import axiosInstance from "../axios_instance";

// Components
import Navbar from "../components/Navbar";
import RatingStars from "../components/RatingStars";
import ProductSkeleton from "../components/ProductSkeleton";

// Pagination
import Pagination from "react-js-pagination";

// Styles
import "../assets/styles/searchPage.css";

import { Helmet } from "react-helmet-async";

const SearchProducts = () => {
  const navigate = useNavigate();

  // --------------------
  // STATES
  // --------------------
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);

  const [keyword, setKeyword] = useState("");

  // Toggle filter visibility (for mobile)
  const [showFilters, setShowFilters] = useState(false);

  // Toggle Filters (React way)
  const toggleFilters = () => {
    setShowFilters((prev) => !prev);
  };


  const [filters, setFilters] = useState({
    brand: [],
    ram: [],
    storage: [],
    battery: [],
    minPrice: "",
    maxPrice: ""
  });

  const [activePage, setActivePage] = useState(1);
  const [itemsPerPage] = useState(6);
  const [totalProducts, setTotalProducts] = useState(0);

  // --------------------
  // FETCH PRODUCTS
  // --------------------
  useEffect(() => {
    fetchProducts();
  }, [keyword, filters, activePage]);

  const fetchProducts = async () => {
    try {
      setLoading(true);

      const params = {
        q: keyword,
        page: activePage,
        limit: itemsPerPage,
        brand: filters.brand.join(","),      // Apple,Samsung
        ram: filters.ram.join(","),          // 6GB,8GB
        storage: filters.storage.join(","),  // 128GB,256GB
        battery: filters.battery.join(","),  // 5000mAh
        minPrice: filters.minPrice,
        maxPrice: filters.maxPrice
      };


      // console.log("Fetching with params:", params)

      const res = await axiosInstance.get(
        "/api/products/advanced-search",
        { params }
      );

      // console.log("Search results:", res.data);

      setProducts(res.data.products);
      setTotalProducts(res.data.totalProductsFound);
    } catch (err) {
      console.error("Search failed", err);
    } finally {
      setLoading(false);
    }
  };

  // --------------------
  // FILTER HANDLERS
  // --------------------
  const toggleFilter = (type, value) => {
    setActivePage(1); // reset pagination(🔑 IMPORTANT: go back to page 1)
    setFilters((prev) => ({
      ...prev,
      [type]: prev[type].includes(value)
        ? prev[type].filter((v) => v !== value)
        : [...prev[type], value]
    }));
    // console.log(filters);
  };

  const handlePageChange = (pageNumber) => {
    setActivePage(pageNumber);
  };

  // --------------------
  // RENDER
  // --------------------
  return (
    <>

      <Helmet>
      {/* Dynamic title ---> the title to change when searching */}
        <title>
          {keyword
            ? `Search "${keyword}" | Mobile Mart`
            : "Search Products | Mobile Mart"}
        </title>
        <meta
          name="description"
          content="Search smartphones by brand, RAM, storage, battery and price. Find the best mobile deals on Mobile Mart."
        />
      </Helmet>

      <Navbar />

      {/* 🔍 SEARCH BAR (mobile-friendly UI) */}
      <div className="container my-3">
        <div className="search-bar-wrapper mx-auto">
          <div className="search-bar">
            <i className="bi bi-search search-icon"></i>

            <input
              type="text"
              className="search-input"
              placeholder="Search for smartphones, brands, features..."
              value={keyword}
              onChange={(e) => {
                setKeyword(e.target.value);
                setActivePage(1); // reset pagination
              }}
            />

            {keyword && (
              <button
                className="clear-btn"
                onClick={() => {
                  setKeyword("");
                  setActivePage(1);
                }}
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </div>


      {/* 🔘 Filter button (only visible on mobile) */}
      <button
        className="btn btn-primary mb-3 d-lg-none ms-4 mt-2"
        onClick={toggleFilters}
      >
        <i className="bi bi-funnel me-1"></i>
        {showFilters ? "Hide Filters" : "Show Filters"}
      </button>



      {/* MAIN LAYOUT */}
      <div className="container my-4">
        <div className="row">
          {/* FILTERS */}
          <div
            className={`col-lg-3 col-md-4 filters ${showFilters ? "d-block" : "d-none d-lg-block"
              }`}
          >

            <h5>Filters</h5>

            <div className="accordion" id="filtersAccordion">

              {/* 💰 PRICE */}
              <div className="accordion-item">
                <h6 className="accordion-header">
                  <button
                    className="accordion-button collapsed"
                    data-bs-toggle="collapse"
                    data-bs-target="#priceCollapse"
                  >
                    Price
                  </button>
                </h6>
                <div id="priceCollapse" className="accordion-collapse collapse">
                  <div className="accordion-body">
                    <input
                      type="number"
                      className="form-control mb-2"
                      placeholder="Min price"
                      onChange={(e) =>
                        setFilters({ ...filters, minPrice: e.target.value })
                      }
                    />
                    <input
                      type="number"
                      className="form-control"
                      placeholder="Max price"
                      onChange={(e) =>
                        setFilters({ ...filters, maxPrice: e.target.value })
                      }
                    />
                  </div>
                </div>
              </div>

              {/* 🏷️ BRAND */}
              <div className="accordion-item">
                <h6 className="accordion-header">
                  <button
                    className="accordion-button collapsed"
                    data-bs-toggle="collapse"
                    data-bs-target="#brandCollapse"
                  >
                    Brand
                  </button>
                </h6>
                <div id="brandCollapse" className="accordion-collapse collapse">
                  <div className="accordion-body">
                    {["Apple", "Samsung", "Redmi", "Vivo", "Poco", "OnePlus"].map((b) => (
                      <div key={b}>
                        <input
                          type="checkbox"
                          checked={filters.brand.includes(b)}
                          onChange={() => toggleFilter("brand", b)}
                        />{" "}
                        {b}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* ⚙️ RAM */}
              <div className="accordion-item">
                <h6 className="accordion-header">
                  <button
                    className="accordion-button collapsed"
                    data-bs-toggle="collapse"
                    data-bs-target="#ramCollapse"
                  >
                    RAM
                  </button>
                </h6>
                <div id="ramCollapse" className="accordion-collapse collapse">
                  <div className="accordion-body">
                    {["4GB", "6GB", "8GB", "12GB"].map((r) => (
                      <div key={r}>
                        <input
                          type="checkbox"
                          checked={filters.ram.includes(r)}
                          onChange={() => toggleFilter("ram", r)}
                        />{" "}
                        {r}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* 💾 STORAGE */}
              <div className="accordion-item">
                <h6 className="accordion-header">
                  <button
                    className="accordion-button collapsed"
                    data-bs-toggle="collapse"
                    data-bs-target="#storageCollapse"
                  >
                    Storage
                  </button>
                </h6>
                <div id="storageCollapse" className="accordion-collapse collapse">
                  <div className="accordion-body">
                    {["64GB", "128GB", "256GB", "512GB"].map((s) => (
                      <div key={s}>
                        <input
                          type="checkbox"
                          checked={filters.storage.includes(s)}
                          onChange={() => toggleFilter("storage", s)}
                        />{" "}
                        {s}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* 🔋 BATTERY */}
              <div className="accordion-item">
                <h6 className="accordion-header">
                  <button
                    className="accordion-button collapsed"
                    data-bs-toggle="collapse"
                    data-bs-target="#batteryCollapse"
                  >
                    Battery
                  </button>
                </h6>
                <div id="batteryCollapse" className="accordion-collapse collapse">
                  <div className="accordion-body">
                    {["4000mAh", "4500mAh", "5000mAh", "6000mAh"].map((b) => (
                      <div key={b}>
                        <input
                          type="checkbox"
                          checked={filters.battery.includes(b)}
                          onChange={() => toggleFilter("battery", b)}
                        />{" "}
                        {b}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

            </div>
          </div>



          {/* PRODUCTS */}
          <div className="col-lg-9 col-md-8">
            <div className="row g-3">

              {/* 🔄 Loading skeletons */}
              {loading &&
                [...Array(6)].map((_, i) => (
                  <div key={i} className="col-6 col-md-4">
                    <ProductSkeleton />
                  </div>
                ))
              }

              {/* ❌ No products found */}
              {!loading && products.length === 0 && (
                <div className="col-12 text-center mt-5">
                  <h4>No products found 😢</h4>
                  <p>Try changing filters or search keyword</p>
                </div>
              )
              }


              {/* ✅ Products */}
              {!loading &&
                products.length > 0 &&
                products.map((product) => (
                  <div key={product._id} className="col-12" >

                    <div className="search-product-card"
                      onClick={() => navigate(`/product/${product._id}`)}
                    >

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
                          className={`availability ${product.quantity > 0 ? "in-stock" : "out-stock"
                            }`}
                        >
                          {product.quantity > 0 ? "In stock" : "Out of stock"}
                        </p>

                        {/* Price */}
                        <h4 className="price">₹ {product.offerPrice}</h4>

                        {/* Add Cart */}
                        <button
                          className=" btn-cart "
                          disabled={product.quantity === 0}
                          onClick={() => console.log("Add to cart", product._id)}
                        >
                          <i className="bi bi-cart me-1 "></i> Add Cart
                        </button>

                      </div>
                    </div>
                  </div>
                ))}

            </div>

            {/* PAGINATION */}
            {!loading && totalProducts > itemsPerPage && (
              <div className="d-flex justify-content-center mt-4">
                <Pagination
                  activePage={activePage}
                  itemsCountPerPage={itemsPerPage}
                  totalItemsCount={totalProducts}
                  pageRangeDisplayed={5}
                  onChange={handlePageChange}
                  firstPageText="First"
                  lastPageText="Last"
                  prevPageText="Prev"
                  nextPageText="Next"
                  itemClass="page-item"
                  linkClass="page-link"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default SearchProducts;
