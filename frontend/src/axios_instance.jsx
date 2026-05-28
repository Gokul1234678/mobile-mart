import axios from "axios";
import { toast } from "react-toastify";

// ======================================================
// 📦 CREATE AXIOS INSTANCE
// ======================================================
// This creates a reusable axios configuration
const axiosInstance = axios.create({
  baseURL: "http://localhost:8000/",
  withCredentials: true, // Include cookies in requests
});

// ======================================================
// 🔐 AXIOS RESPONSE INTERCEPTOR
// ======================================================
// what is interceptor? interceptor is middleware that runs before response reaches your component
// Interceptor = runs BEFORE response reaches your component
// Used for:
// ✔ global error handling
// ✔ token expiry handling
// ✔ logging
// ✔ request modification

axiosInstance.interceptors.response.use(

  // ====================================================
  // ✅ SUCCESS RESPONSE
  // ====================================================
  // If API works successfully,
  // simply return response normally

  (response) => response,


  // ====================================================
  // ❌ ERROR RESPONSE
  // ====================================================
  (error) => {

    // Check if backend returned 401 Unauthorized
    // 401 usually means:
    // ✔ token expired
    // ✔ invalid token
    // ✔ no token

    if (error.response?.status === 401) {

      // Current page path
      const currentPath = window.location.pathname;

      // Pages that should NOT auto redirect
      const publicPages = [
        "/login",
        "/register",
        "/forgot-password",
        "/reset-password"
      ];

      // Check if current page is public
      const isPublicPage = publicPages.some(
        (page) => currentPath.includes(page)
      );

      // Redirect ONLY for protected pages
      if (!isPublicPage) {

        localStorage.clear();

        toast.error(
          "Session expired. Please login again."
        );

        window.location.href = "/login";
      }
    }

    // ================================================
    // ❌ RETURN ERROR
    // ================================================
    // So component can still access error if needed

    return Promise.reject(error);
  }
);


export default axiosInstance;