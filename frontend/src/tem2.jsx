import React, { useEffect, useState } from "react";
import axios from "axios";
import "../assets/css/product.css";

export default function ProductSection() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch products from your backend API
  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await axios.get("http://localhost:5000/api/products"); // ✅ Replace with your backend URL
        setProducts(res.data);
      } catch (err) {
        console.error("Error fetching products:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  return (
    <div
      className="container-fluid py-5"
      id="products"
      style={{ background: "radial-gradient(#8c52ff, #5ce1e6)" }}
    >
      <div className="holder">
        <h2 className="text-center text-white fw-bold mb-4">
          Best Deals on Smartphones
        </h2>

        {/* Loader animation */}
        {loading ? (
          <div className="text-center py-5">
            <div
              className="spinner-border text-light"
              style={{ width: "4rem", height: "4rem" }}
              role="status"
            >
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-3 text-white">Loading best deals...</p>
          </div>
        ) : (
          <div className="container">
            <div className="row justify-content-center g-3 g-md-4">
              {products.map((product) => (
                <div
                  key={product._id}
                  className="col-6 col-sm-6 col-md-4 col-lg-2 mb-4"
                >
                  <div className="card h-100 text-center shadow-sm border-0">
                    <div className="card-img-container overflow-hidden">
                      <img
                        src={product.image}
                        className="card-img-top"
                        alt={product.name}
                        style={{
                          height: "180px",
                          objectFit: "cover",
                          transition: "transform 0.4s ease",
                        }}
                        onMouseOver={(e) =>
                          (e.currentTarget.style.transform = "scale(1.1)")
                        }
                        onMouseOut={(e) =>
                          (e.currentTarget.style.transform = "scale(1)")
                        }
                      />
                    </div>

                    <div className="card-body text-start">
                      <h6 className="fw-bold text-dark">{product.name}</h6>
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

                      <div className="d-flex gap-2 mt-2">
                        <button
                          className="btn btn-sm w-50 text-white"
                          style={{ backgroundColor: "var(--voilet)" }}
                        >
                          <i className="bi bi-cart"></i> Add to Cart
                        </button>
                        <button
                          className="btn btn-sm w-50 text-white"
                          style={{ backgroundColor: "var(--green)" }}
                        >
                          <i className="bi bi-bag"></i> Buy Now
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* View All Button */}
            <div className="text-center mt-4">
              <a
                href="/products"
                className="btn text-white fw-semibold px-4 py-2"
                style={{
                  backgroundColor: "var(--green)",
                  borderRadius: "10px",
                }}
              >
                View All
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
