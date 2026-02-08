import { useState } from 'react'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from './pages/Home';
import ProductView from "./pages/ProductView";
import SearchProducts from "./pages/SearchProducts";
import Login from "./pages/Login";
import Register from "./pages/Register";
import { ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
function App() {

  return (
    <>
    <ToastContainer position="top-right" autoClose={3000} />
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
          
          {/* 🔐 Login page */}
          <Route path="/login" element={<Login />} />

          {/* Register page */}
          <Route path="/register" element={<Register />} />
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
