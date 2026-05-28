import React from "react";
import { Link } from "react-router-dom";
import errorVideo from "../assets/videos/404.mp4";

const NotFound = () => {

  // Page title
  document.title = "404 - Page Not Found | Mobile Mart";

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#fff",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        padding: "20px"
      }}
    >

      {/* 404 Video */}
      <video
        src={errorVideo}
        autoPlay
        loop
        muted
        playsInline
        style={{
          width: "320px",
          maxWidth: "100%"
        }}
      />

      {/* Text */}
      <h2
        style={{
          marginTop: "10px",
          fontWeight: "700",
          color: "#333"
        }}
      >
        Oops! Page Not Found
      </h2>

      <p
        style={{
          color: "#777",
          textAlign: "center",
          maxWidth: "400px"
        }}
      >
        The page you are looking for does not exist or may have been moved.
      </p>

      {/* Back Home Button */}
      <Link
        to="/"
        style={{
          marginTop: "15px",
          backgroundColor: "#6f42c1",
          color: "#fff",
          padding: "10px 20px",
          borderRadius: "8px",
          textDecoration: "none",
          fontWeight: "600"
        }}
      >
        Back to Home
      </Link>

    </div>
  );
};

export default NotFound;