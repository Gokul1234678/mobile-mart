import { useState } from 'react'
import { BrowserRouter, Routes, Route } from "react-router-dom";

// PAGES
import Home from './pages/Home';
import ProductView from "./pages/ProductView";
import SearchProducts from "./pages/SearchProducts";
import Login from "./pages/Login";
import Register from "./pages/Register";
import MyProfile from "./pages/MyProfile";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import OrderSuccess from "./pages/OrderSuccess";
import Orders from "./pages/Orders";
import OrderDetails from "./pages/Orderdetails";

// ADMIN PAGES
import AdminLayout from "./admin/AdminLayout";
import AdminRoute from "./admin/AdminRoute";
import Dashboard from "./pages/admin/Dashboard";
import Products from "./pages/admin/Products";
import AdminOrders from "./pages/admin/Orders";
import Users from "./pages/admin/Users";

import AddProduct from "./pages/admin/AddProduct";

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

  // On app load, check if user is already logged in (e.g. has valid token)
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

          <Route path="/forgot-password" element={<ForgotPassword />} />

          <Route path="/reset-password/:token" element={<ResetPassword />} />

          <Route path="/cart" element={<Cart />} />

          <Route path="/checkout" element={<Checkout />} />

          <Route path="/order-success/:id" element={<OrderSuccess />} />

          {/* Orders page */}
          <Route path="/orders" element={<Orders />} />

          <Route path="/orders/:id" element={<OrderDetails />} />


          {/* admin Routes */}
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminLayout />
              </AdminRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="products" element={<Products />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="users" element={<Users />} />

            <Route path="add-product" element={<AddProduct />} />
          </Route>
          {/* <Route path="/admin/add-product" element={<AddProduct />} /> */}
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
