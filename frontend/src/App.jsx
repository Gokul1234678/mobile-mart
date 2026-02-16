import { useState } from 'react'
import { BrowserRouter, Routes, Route } from "react-router-dom";

// PAGES
import Home from './pages/Home';
import ProductView from "./pages/ProductView";
import SearchProducts from "./pages/SearchProducts";
import Login from "./pages/Login";
import Register from "./pages/Register";
import MyProfile from "./pages/MyProfile";

// TOASTIFY for notifications
import { ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { loadUser } from './redux/userSlice';

// PROTECTED ROUTE COMPONENT
import ProtectedRoute from "./components/ProtectedRoute";

function App() {

  // Used to dispatch Redux actions(functions)
  const dispatch = useDispatch();

  useEffect(() => {
    // console.log("app render...");
    dispatch(loadUser());
  }, [dispatch]);

  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} />
      {/* <h1>Welcome to MobileMart 🛒</h1> */}
      <BrowserRouter>
        <Routes>
          {/* 🏠 Home page */}
          <Route path='/' element={<Home />} />

          {/* Product view page */}
          <Route path="/product/:id" element={<ProductView />} />

          <Route path="/search" element={<SearchProducts />} />

          {/* 🚫 Catch-all route (404 page) */}
          <Route path="*" element={<h2 className="text-center mt-5 text-danger">404 - Page Not Found</h2>} />

          {/* 🔐 Login page */}
          <Route path="/login" element={<Login />} />

          {/* Register page */}
          <Route path="/register" element={<Register />} />


          {/* my profile page */}
          {/* <Route path="/profile" element={<MyProfile />} /> */}
          <Route
            path="/profile"
            // Wrap MyProfile with ProtectedRoute to restrict access
            element={
              <ProtectedRoute>
                <MyProfile />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
