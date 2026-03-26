import { useEffect, useState } from "react";
import axiosInstance from "../axios_instance";
import { toast } from "react-toastify";

// ⭐ Star display component
const Stars = ({ rating }) => {
  return (
    <div>
      {[1,2,3,4,5].map((i) => (
        <span key={i} style={{ color: i <= rating ? "gold" : "#ccc" }}>
          ★
        </span>
      ))}
    </div>
  );
};

const ProductReviews = ({ productId }) => {

  // ==========================================
  // STATE
  // ==========================================
  const [reviews, setReviews] = useState([]);
  const [avgRating, setAvgRating] = useState(0);
  const [count, setCount] = useState(0);

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");

  const [loading, setLoading] = useState(true);


  // ==========================================
  // FETCH REVIEWS
  // ==========================================
  const fetchReviews = async () => {
    try {
      const { data } = await axiosInstance.get(
        `/api/products/${productId}/reviews`
      );

      setReviews(data.reviews);
      setAvgRating(data.averageRating);
      setCount(data.numOfReviews);

    } catch (err) {
      toast.error("Failed to load reviews");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [productId]);


  // ==========================================
  // SUBMIT REVIEW
  // ==========================================
  const submitReviewHandler = async () => {

    if (!rating || !comment) {
      toast.error("Please add rating and comment");
      return;
    }

    try {
      const { data } = await axiosInstance.put(
        `/api/products/${productId}/review`,
        { rating, comment },
        { withCredentials: true }
      );

      toast.success(data.message);

      // reset form
      setRating(0);
      setComment("");

      // refresh reviews
      fetchReviews();

    } catch (err) {
      toast.error(err.response?.data?.message);
    }
  };


  // ==========================================
  // UI
  // ==========================================
  return (
    <div className="mt-4">

      {/* HEADER */}
      <h4>Customer Reviews</h4>

      {/* AVG RATING */}
      <div className="mb-3">
        <Stars rating={Math.round(avgRating)} />
        <p>{avgRating.toFixed(1)} out of 5 ({count} reviews)</p>
      </div>


      {/* SUBMIT REVIEW */}
      <div className="card p-3 mb-3">
        <h5>Write a Review</h5>

        {/* Rating */}
        <div className="mb-2">
          {[1,2,3,4,5].map((i) => (
            <span
              key={i}
              style={{
                cursor: "pointer",
                fontSize: "20px",
                color: i <= rating ? "gold" : "#ccc"
              }}
              onClick={() => setRating(i)}
            >
              ★
            </span>
          ))}
        </div>

        {/* Comment */}
        <textarea
          className="form-control mb-2"
          placeholder="Write your review..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />

        <button
          className="btn btn-success"
          onClick={submitReviewHandler}
        >
          Submit Review
        </button>
      </div>


      {/* REVIEWS LIST */}
      {loading ? (
        <p>Loading reviews...</p>
      ) : reviews.length === 0 ? (
        <p>No reviews yet</p>
      ) : (
        reviews.map((rev) => (
          <div key={rev._id} className="card p-3 mb-2">

            <div className="d-flex justify-content-between">
              <strong>{rev.name}</strong>
              <Stars rating={rev.rating} />
            </div>

            <p className="mb-0">{rev.comment}</p>

          </div>
        ))
      )}

    </div>
  );
};

// export default ProductReviews;