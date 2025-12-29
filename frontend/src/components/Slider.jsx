import React, { useState, useEffect, useRef } from "react";
import b1 from "../assets/img/banner/b1.jpg";
import b2 from "../assets/img/banner/b2.jpg";
import b3 from "../assets/img/banner/b3.jpg";
import b4 from "../assets/img/banner/b4.jpg";
import b5 from "../assets/img/banner/b5.jpg";
import b6 from "../assets/img/banner/b6.jpg";
import b7 from "../assets/img/banner/b7.jpg";
import "../assets/styles/slider.css"; // optional if you have your slider styles

export default function Slider() {
  const images = [b1, b2, b3, b4, b5, b6, b7];
  // console.log(b1);
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const autoSlideRef = useRef(null);

  // 🔄 Go to next slide
  const nextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  // ⬅️ Go to previous slide
  const prevSlide = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  };

  // ⚙️ Auto-slide logic
  useEffect(() => {
    startAutoSlide();
    return () => clearInterval(autoSlideRef.current);
  }, []);

  const startAutoSlide = () => {
    autoSlideRef.current = setInterval(nextSlide, 3000);
  };

  const restartAutoSlide = () => {
    clearInterval(autoSlideRef.current);
    startAutoSlide();
  };

  // 🔘 Update slider on dot click
  const goToSlide = (index) => {
    setCurrentIndex(index);
    restartAutoSlide();
  };

  return (
    <>
    <div className="slider mt-2 position-relative overflow-hidden">
      {/* 🖼️ Image List */}
      <div
        className="list d-flex transition-all"
        style={{
          transform: `translateX(-${currentIndex * 100}%)`,
          transition: "transform 0.8s ease",
        }}
      >
        {images.map((img, index) => (
          <img
            key={index}
            src={img}
            alt={`banner-${index}`}
            className="w-100 flex-shrink-0"
            style={{ height: "auto" }}
          />
        ))}
      </div>

      {/* ⬅️ ➡️ Buttons */}
      <div className="buttons position-absolute top-50 w-100 d-flex justify-content-between px-3">
        <button
          className="btn btn-light rounded-circle"
          id="prev"
          onClick={() => {
            prevSlide();
            restartAutoSlide();
          }}
        >
          ❮
        </button>
        <button
          className="btn btn-light rounded-circle"
          id="next"
          onClick={() => {
            nextSlide();
            restartAutoSlide();
          }}
        >
          ❯
        </button>
      </div>

      {/* 🔘 Dots Navigation */}
      <ul className="dots d-flex justify-content-center mt-2 list-unstyled mb-0">
        {images.map((_, index) => (
          <li
            key={index}
            onClick={() => goToSlide(index)}
            className={`mx-1 ${
              index === currentIndex ? "active" : ""
            }`}
            style={{
              width: "10px",
              height: "10px",
              borderRadius: "50%",
              backgroundColor:
                index === currentIndex ? "var(--green)" : "rgba(255,255,255,0.5)",
              cursor: "pointer",
              transition: "background-color 0.3s",
            }}
          ></li>
        ))}
      </ul>
    </div>
    
       
    <p className="quote-custom container text-center my-5">Find the Perfect Fit for Your Pocket</p>
   
    </>
  );
}
