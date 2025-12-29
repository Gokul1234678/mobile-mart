import React from "react";
import Navbar from "../components/Navbar";
import Slider from "../components/Slider";
import ProductSection from "../components/ProductSection";
import BrandSection from "../components/BrandSection";
import ContactSection from "../components/ContactSection";
import Footer from "../components/Footer";

import "../assets/styles/Home.css"

// This component helps us set page title and meta description dynamically
import SEO from "../components/SEO";

export default function Home() {
  return (


    <div style={{ "backgroundColor": "var(--voilet)" }}>
      <SEO
        title="Mobile Mart | Best Deals on Smartphones"
        description="Find the best smartphone deals from top brands at Mobile Mart."
      />
      
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
