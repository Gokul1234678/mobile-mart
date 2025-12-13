import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Cart from "./pages/Cart";
import MyOrders from "./pages/MyOrders";
import AccountSettings from "./pages/AccountSettings";
import Search from "./pages/Search";
import Login from "./pages/Login";
import Register from "./pages/Register";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 🏠 Home page */}
        <Route path="/" element={<Home />} />

        {/* 🛒 Cart page */}
        <Route path="/cart" element={<Cart />} />

        {/* 📦 My Orders page */}
        <Route path="/my-orders" element={<MyOrders />} />

        {/* 👤 Account Settings page */}
        <Route path="/account-settings" element={<AccountSettings />} />

        {/* 🔍 Search page */}
        <Route path="/search" element={<Search />} />

        {/* 🔑 Auth pages */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* 🚫 Catch-all route (404 page) */}
        <Route path="*" element={<h2 className="text-center mt-5 text-danger">404 - Page Not Found</h2>} />
      </Routes>
    </BrowserRouter>
  );
}
