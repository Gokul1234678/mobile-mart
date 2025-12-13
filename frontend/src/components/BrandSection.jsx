import React from "react";
import "../assets/styles/brand.css"
// Import brand images
import brand1 from "../assets/img/brands/1.jpg";
import brand2 from "../assets/img/brands/2.jpg";
import brand3 from "../assets/img/brands/3.jpg";
import brand4 from "../assets/img/brands/4.jpg";
import brand5 from "../assets/img/brands/5.jpg";
import brand6 from "../assets/img/brands/6.jpg";

const brands = [brand1, brand2, brand3, brand4, brand5, brand6];

const BrandSection = () => {
  return (
    <>
      {/* brand starts */}
      <div
        className="container-fluid bg-white pb-3 pb-md-5"
        style={{ backgroundColor: "var(--darkwhite)" }}
      >
        <p
          className="h2 text-center text-dark py-5"
          style={{ fontWeight: "900", letterSpacing: "2px" }}
        >
          OUR POPULAR BRANDS
        </p>

        <div className="container">
          <div className="row gy-4 gy-md-5 cus-brand">
            {brands.map((img, index) => (
              <div key={index} className="col-4">
                <img src={img} className="img-fluid" alt={`brand-${index + 1}`} />
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* brand ends */}
    </>
  );
};

export default BrandSection;
