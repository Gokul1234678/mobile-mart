import React from "react";
import Navbar from "../components/Navbar";
import Slider from "../components/Slider";
// import ProductSection from "../components/ProductSection";
// import Brands from "../components/Brands";
// import Contact from "../components/Contact";
// import Footer from "../components/Footer";
// import UpArrow from "../components/UpArrow";

import "../assets/styles/Home.css"
import ProductSection from "../components/ProductSection";
import BrandSection from "../components/BrandSection";
import ContactSection from "../components/ContactSection";
import Footer from "../components/Footer";


export default function Home() {
  return (


    <div style={{ "backgroundColor": "var(--voilet)" }}>
      
      <Navbar />
       
       <Slider />
       <ProductSection/>
       <BrandSection/>
       <ContactSection/>
       <Footer/>

      {/* <p className="quote-custom container text-center my-5 fs-3 fw-semibold text-white">
        Find the Perfect Fit for Your Pocket
       </p>

       <ProductSection />
       <Brands />
       <Contact />
       <Footer /> */}
    </div>
  );
}
