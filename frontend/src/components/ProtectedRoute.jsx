import React from "react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import VideoLoader from "../components/VideoLoader";

const ProtectedRoute = ({ children }) => {
    // Get authentication state from Redux
    const { isAuthenticated, loading } = useSelector((state) => state.user);
  
    // 🟡 WAIT until loadUser() finishes
    if (loading) {
        // return <div className="text-center mt-5">Loading...</div>;
        return <VideoLoader loaderName="loading" fullscreen/>;
    }

    // If user NOT logged in → redirect to login page
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // If logged in → show the protected page
    return children;
};

export default ProtectedRoute;