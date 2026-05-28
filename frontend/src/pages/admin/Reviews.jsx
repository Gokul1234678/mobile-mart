import React, { useEffect, useState } from "react";
import axiosInstance from "../../axios_instance";
import { toast } from "react-toastify";

const Reviews = () => {

    // ==========================================
    // 📦 STATES
    // ==========================================
    const [products, setProducts] = useState([]);

    const [selectedProduct, setSelectedProduct] = useState("");

    const [reviews, setReviews] = useState([]);

    const [averageRating, setAverageRating] = useState(0);

    const [numOfReviews, setNumOfReviews] = useState(0);

    const [loading, setLoading] = useState(false);

    // ==========================================
    // 📦 FETCH PRODUCTS
    // ==========================================
    const fetchProducts = async () => {

        try {

            // change API if your products API differs
            const { data } = await axiosInstance.get("/api/products");

            setProducts(data.products);

        } catch (err) {
            toast.error("Failed to load products");
        }
    };

    useEffect(() => {
            // Set page title on mount
    document.title = "Reviews | Mobile Mart";
        fetchProducts();
    }, []);

    // ==========================================
    // ⭐ FETCH REVIEWS OF SELECTED PRODUCT
    // ==========================================
    const fetchReviews = async (productId) => {

        try {

            setLoading(true);

            const { data } = await axiosInstance.get(
                `/api/products/${productId}/reviews`
            );

            setReviews(data.reviews);

            setAverageRating(data.averageRating);

            setNumOfReviews(data.numOfReviews);

        } catch (err) {

            toast.error(
                err.response?.data?.message || "Failed to load reviews"
            );

        } finally {
            setLoading(false);
        }
    };

    // ==========================================
    // 🗑 DELETE REVIEW
    // ==========================================
    const deleteReview = async (reviewId) => {

        const confirmDelete = window.confirm(
            "Are you sure you want to delete this review?"
        );

        if (!confirmDelete) return;

        try {

            await axiosInstance.delete(
                `/api/admin/products/${selectedProduct}/reviews/${reviewId}`,
                {
                    withCredentials: true
                }
            );

            toast.success("Review deleted successfully");

            // refresh reviews
            fetchReviews(selectedProduct);

        } catch (err) {

            toast.error(
                err.response?.data?.message || "Delete failed"
            );
        }
    };

    return (
        <div className="container mt-4">

            <h2>Reviews Management</h2>

            {/* ================= PRODUCT SELECT ================= */}
            <div className="mb-4">

                <label className="form-label">
                    Select Product
                </label>

                <select
                    className="form-select"
                    value={selectedProduct}
                    onChange={(e) => {

                        setSelectedProduct(e.target.value);

                        if (e.target.value) {
                            fetchReviews(e.target.value);
                        }
                    }}
                >

                    <option value="">
                        Select Product
                    </option>

                    {products.map((product) => (

                        <option
                            key={product._id}
                            value={product._id}
                        >
                            {product.name}
                        </option>

                    ))}

                </select>

            </div>

            {/* ================= REVIEW SUMMARY ================= */}
            {selectedProduct && (

                <div className="mb-3">

                    <h5>
                        ⭐ Average Rating: {averageRating.toFixed(1)}
                    </h5>

                    <h6>
                        📝 Total Reviews: {numOfReviews}
                    </h6>

                </div>

            )}

            {/* ================= LOADING ================= */}
            {loading ? (
                <p>Loading...</p>
            ) : (

                <>
                    {/* ================= NO REVIEWS ================= */}
                    {selectedProduct && reviews.length === 0 && (
                        <p>No reviews found</p>
                    )}

                    {/* ================= REVIEWS TABLE ================= */}
                    {reviews.length > 0 && (

                        <div className="table-responsive">

                            <table className="table table-bordered text-center align-middle">
                            <thead>
                                <tr>
                                    <th>User</th>
                                    <th>Rating</th>
                                    <th>Comment</th>
                                    <th>Action</th>
                                </tr>
                            </thead>

                            <tbody>

                                {reviews.map((review) => (

                                    <tr key={review._id}>

                                        {/* USER */}
                                        <td>{review.name}</td>

                                        {/* RATING */}
                                        <td>
                                            {"⭐".repeat(review.rating)}
                                        </td>

                                        {/* COMMENT */}
                                        <td>{review.comment}</td>

                                        {/* DELETE */}
                                        <td>

                                            <button
                                                className="btn btn-sm btn-danger"
                                                onClick={() =>
                                                    deleteReview(review._id)
                                                }
                                            >
                                                🗑
                                            </button>

                                        </td>

                                    </tr>

                                ))}

                            </tbody>

                        </table>

            </div>

          )}

        </>

    )
}

    </div >
  );
};

export default Reviews;