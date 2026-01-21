import { useState } from 'react'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from './pages/Home';
import ProductView from "./pages/ProductView";
import SearchProducts from "./pages/SearchProducts";

function App() {

  return (
    <>
      {/* <h1>Welcome to MobileMart 🛒</h1> */}
      <BrowserRouter>
        <Routes>
          {/* 🏠 Home page */}
          <Route path='/' element={<Home/>} />

          {/* Product view page */}
          <Route path="/product/:id" element={<ProductView />} />

          <Route path="/search" element={<SearchProducts />} />

          {/* 🚫 Catch-all route (404 page) */}
          <Route path="*" element={<h2 className="text-center mt-5 text-danger">404 - Page Not Found</h2>} />
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
