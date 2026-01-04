import React from "react";

const ProductSkeleton = () => {
  return (
    <div className="card h-100 border-0 shadow-sm">
      <div
        className="bg-secondary bg-opacity-25"
        style={{ height: "150px" }}
      ></div>

      <div className="card-body">
        <div className="bg-secondary bg-opacity-25 mb-2" style={{ height: "12px" }}></div>
        <div className="bg-secondary bg-opacity-25 mb-2" style={{ height: "12px", width: "60%" }}></div>
        <div className="bg-secondary bg-opacity-25" style={{ height: "32px" }}></div>
      </div>
    </div>
  );
};

export default ProductSkeleton;
