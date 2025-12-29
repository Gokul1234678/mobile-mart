import React, { useState, useEffect } from 'react'
import "../assets/styles/product.css"
import axiosInstance from "../axios_instance"

import placeholderImage from "../assets/img/tem.jfif";


const ProductSection = () => {
  let [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  useEffect(() => {
    async function fetchProducts() {
      try {
        let res = await axiosInstance.get("/api/products");
        console.log(res);
        setProducts(res.data.products)

      } catch (err) {
        console.error("Error fetching products:", err);
      } finally {
        setLoading(false);
      }

    }
    fetchProducts()
  }, [])

  return (
    <>
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
          {loading ?
            (
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
            )
            :
            (
              <div className="container">
                <div className="row justify-content-center g-3 g-md-4">
                  {products.map((product) => (
                    <div key={product._id} className="col-6 col-md-4 col-lg-3 col-xl-2">
                      <div className="card h-100 text-center shadow-sm border-0">
                        <div className="card-img-containe overflow-hidden">
                          <img
                            src={product.image}
                            // this image only shown when url is wrong
                            onError={(e) => (e.target.src = placeholderImage)}
                            alt={product.name}
                            className="card-img-top"
                          
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
                              <i className="bi bi-cart add-to-cart-btn"> Add to Cart</i> 
                            </button>

                            <button
                              className="btn btn-sm w-50 text-white"
                              style={{ backgroundColor: "var(--green)" }}
                            >
                              <i className="bi bi-bag buy-btn"> Buy Now</i>
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
            )
          }

        </div>

      </div>


    </>
  )
}

export default ProductSection