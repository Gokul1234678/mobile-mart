import { useEffect } from "react";
import { useLocation } from "react-router-dom";

// ======================================================
// COMPONENT: ScrollToHash
// ======================================================
// Purpose:
// Enables smooth scrolling to sections like
// #contact or #footer when navigating from
// another page using React Router.
//
// Example:
// /#contact
// /#footer
//
// Without this component:
// React Router changes URL,
// but page will NOT automatically scroll.
//
// This component listens for URL hash changes
// and scrolls to the matching element.
// ======================================================

const ScrollToHash = () => {

  // ====================================================
  // useLocation()
  // ====================================================
  // Gives current URL information
  //
  // Example:
  // pathname → "/"
  // hash → "#contact"
  // ====================================================

  const location = useLocation();

  // ====================================================
  // useEffect()
  // ====================================================
  // Runs whenever URL changes
  // ====================================================

  useEffect(() => {

    // ==================================================
    // Check if URL contains hash
    // Example:
    // #contact
    // #footer
    // ==================================================

    if (location.hash) {

      // ================================================
      // Remove "#" symbol from hash
      //
      // Example:
      // "#contact" → "contact"
      // ================================================

      const elementId = location.hash.substring(1);

      // ================================================
      // Find HTML element by ID
      //
      // Example:
      // <section id="contact">
      // ================================================

      const element = document.getElementById(elementId);

      // ================================================
      // If element exists,
      // smoothly scroll to that section
      // ================================================

      if (element) {
        element.scrollIntoView({
          behavior: "smooth"
        });
      }
    }

  }, [location]); // re-run whenever URL changes

  // ====================================================
  // No UI rendered
  // This component only handles scrolling logic
  // ====================================================

  return null;
};

export default ScrollToHash;