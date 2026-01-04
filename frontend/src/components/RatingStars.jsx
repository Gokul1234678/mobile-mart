import React from "react";

/**
 * * ⭐ Star Rating Renderer
 * Reusable rating component
 * Converts numeric rating (e.g. 3.5) into stars
 */
const RatingStars = ({ rating = 0 }) => {
  const fullStars = Math.floor(rating);// Full stars
  const hasHalfStar = rating % 1 !== 0;// Full stars
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0); // Remaining stars

  return (
    <div className="d-flex align-items-center gap-1">
      {/* Full stars */}
      {[...Array(fullStars)].map((_, i) => (
        <i key={`full-${i}`} className="bi bi-star-fill text-warning"></i>
      ))}

      {/* Half star */}
      {hasHalfStar && (
        <i className="bi bi-star-half text-warning"></i>
      )}

      {/* Empty stars */}
      {[...Array(emptyStars)].map((_, i) => (
        <i key={`empty-${i}`} className="bi bi-star text-warning"></i>
      ))}
    </div>
  );
};

export default RatingStars;
