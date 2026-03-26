import { useEffect, useState } from "react";
import axiosInstance from "../axios_instance";
import { toast } from "react-toastify";

// =============================================
// Self-contained styles — matches app theme
// =============================================
const styles = `
  :root {
    --orange: #ff5722;           /* kept only for submit button */
    --violet: #6a0dad;           /* primary accent color */
    --violet-light: #f3e8ff;     /* light violet background */
    --violet-dark: #4a0080;      /* darker violet for hover */
    --black: #111111;            /* primary text / dark elements */
    --white: #ffffff;            /* card backgrounds */
    --grey-light: #f5f5f5;       /* page background */
    --grey-mid: #e0e0e0;         /* borders */
    --grey-text: #555555;        /* secondary text */
    --grey-muted: #999999;       /* muted text */
    --gold: #f59e0b;             /* star color */
    --radius: 14px;
    --radius-sm: 8px;
    --shadow-sm: 0 1px 4px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.05);
    --shadow-md: 0 6px 24px rgba(0,0,0,0.15);
    --transition: 0.2s ease;
  }

  /* ---- Animations ---- */

  /* Slide up + fade in for cards */
  @keyframes rev-fadeUp {
    from { opacity: 0; transform: translateY(14px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  /* Star pop when selected */
  @keyframes rev-starPop {
    0%   { transform: scale(1); }
    50%  { transform: scale(1.4); }
    100% { transform: scale(1); }
  }

  /* Shimmer on submit button */
  @keyframes rev-shimmer {
    0%   { background-position: -200% center; }
    100% { background-position: 200% center; }
  }

  /* Spinner for loading state */
  @keyframes rev-spin {
    to { transform: rotate(360deg); }
  }

  /* ==========================================
     WRAPPER
  ========================================== */
  .rev-wrap {
    margin-top: 32px;
    font-family: inherit; /* use app font */
    background: var(--grey-light);
    padding: 20px;
    border-radius: var(--radius);
  }

  /* ==========================================
     SECTION HEADER
  ========================================== */
  .rev-header {
    display: flex;
    align-items: baseline;
    gap: 12px;
    margin-bottom: 20px;
    padding-bottom: 14px;
    border-bottom: 2px solid var(--black); /* black underline */
    animation: rev-fadeUp 0.4s ease both;
  }

  .rev-title {
    font-size: 1.7rem;
    font-weight: 700;
    color: var(--black);
    margin: 0;
    letter-spacing: -0.02em;
  }

  /* Black pill with review count */
  .rev-count-badge {
    background: var(--black);
    color: var(--white);
    font-size: 0.8rem;
    font-weight: 700;
    letter-spacing: 0.06em;
    padding: 3px 11px;
    border-radius: 20px;
    text-transform: uppercase;
  }

  /* ==========================================
     AVERAGE RATING BLOCK
  ========================================== */
  .rev-avg-block {
    display: flex;
    align-items: center;
    gap: 14px;
    background: var(--white);
    border-radius: var(--radius);
    padding: 18px 22px;
    margin-bottom: 20px;
    box-shadow: var(--shadow-sm);
    border-left: 4px solid var(--violet); /* violet accent bar */
    animation: rev-fadeUp 0.4s ease both;
    animation-delay: 0.05s;
  }

  /* Large rating number */
  .rev-avg-number {
    font-size: 3.2rem;
    font-weight: 700;
    color: var(--violet); /* violet for the big rating number */
    line-height: 1;
  }

  .rev-avg-right {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  /* Star row for average */
  .rev-stars {
    display: flex;
    gap: 2px;
  }

  /* Individual star — gold if filled, grey if empty */
  .rev-star {
    font-size: 28px;
    line-height: 1;
    transition: transform 0.15s ease;
  }

  .rev-star.filled { color: var(--gold); }
  .rev-star.empty  { color: #ddd; }

  .rev-avg-sub {
    font-size: 0.92rem;
    color: var(--grey-muted);
    font-weight: 500;
  }

  /* ==========================================
     WRITE A REVIEW CARD
  ========================================== */
  .rev-form-card {
    background: var(--white);
    border-radius: var(--radius);
    padding: 22px 24px;
    margin-bottom: 24px;
    box-shadow: var(--shadow-sm);
    position: relative;
    overflow: hidden;
    animation: rev-fadeUp 0.45s ease both;
    animation-delay: 0.1s;
    transition: box-shadow var(--transition), transform 0.2s ease;
  }

  .rev-form-card:hover {
    box-shadow: var(--shadow-md);
    transform: scale(1.01); /* subtle scale — form is wider so less zoom needed */
  }

  /* Orange → violet top bar animates in on hover */
  .rev-form-card::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 3px;
    background: var(--violet); /* solid violet bar */
    transform: scaleX(0);
    transform-origin: left;
    transition: transform 0.35s ease;
  }

  .rev-form-card:hover::before {
    transform: scaleX(1); /* sweeps left to right on hover */
  }

  .rev-form-title {
    font-size: 1.15rem;
    font-weight: 700;
    color: var(--black);
    margin: 0 0 16px;
    letter-spacing: -0.01em;
  }

  /* ---- Interactive Star Picker ---- */
  .rev-star-picker {
    display: flex;
    gap: 4px;
    margin-bottom: 14px;
  }

  /* Clickable star in the rating picker */
  .rev-star-btn {
    font-size: 34px;
    cursor: pointer;
    line-height: 1;
    transition: transform 0.15s ease, color 0.1s;
    background: none;
    border: none;
    padding: 0;
  }

  .rev-star-btn.filled { color: var(--gold); }
  .rev-star-btn.empty  { color: #ddd; }

  /* Pop effect when a star is selected */
  .rev-star-btn.filled {
    animation: rev-starPop 0.25s ease;
  }

  .rev-star-btn:hover {
    transform: scale(1.2); /* enlarge on hover for better UX */
  }

  /* ---- Comment Textarea ---- */
  .rev-textarea {
    width: 100%;
    min-height: 90px;
    padding: 12px 14px;
    border: 1.5px solid var(--grey-mid);
    border-radius: var(--radius-sm);
    font-size: 1rem;
    font-family: inherit;
    color: var(--black);
    background: var(--grey-light);
    resize: vertical;           /* allow vertical resize only */
    outline: none;
    transition: border-color var(--transition), box-shadow var(--transition);
    box-sizing: border-box;
    margin-bottom: 14px;
  }

  /* Highlight border on focus — violet */
  .rev-textarea:focus {
    border-color: var(--violet);
    box-shadow: 0 0 0 3px rgba(106,13,173,0.1);
  }

  .rev-textarea::placeholder {
    color: var(--text-muted);
  }

  /* ---- Submit Button ---- */
  .rev-submit-btn {
    padding: 12px 28px;
    background: var(--orange);    /* primary orange */
    color: #fff;
    border: none;
    border-radius: var(--radius-sm);
    font-size: 0.96rem;
    font-weight: 700;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    cursor: pointer;
    position: relative;
    overflow: hidden;             /* clip shimmer effect */
    transition: background var(--transition), transform 0.15s, box-shadow var(--transition);
    box-shadow: 0 3px 10px rgba(255,87,34,0.3);
  }

  /* Animated light sweep across button */
  .rev-submit-btn::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(
      105deg,
      transparent 40%,
      rgba(255,255,255,0.22) 50%,
      transparent 60%
    );
    background-size: 200% auto;
    animation: rev-shimmer 2.4s linear infinite;
  }

  /* Hover: switch to violet + scale up */
  .rev-submit-btn:hover {
    background: var(--violet);
    transform: scale(1.05);
    box-shadow: 0 5px 16px rgba(106,13,173,0.3);
  }

  .rev-submit-btn:active {
    transform: scale(0.97); /* press down = slight shrink */
  }

  /* ==========================================
     LOADER STATE
  ========================================== */
  .rev-loader {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 20px 0;
    color: var(--grey-muted);
    font-size: 0.96rem;
  }

  /* Spinning ring loader */
  .rev-spinner {
    width: 20px;
    height: 20px;
    border: 2px solid #f0ece5;
    border-top-color: var(--violet); /* only top colored → spin trick */
    border-radius: 50%;
    animation: rev-spin 0.8s linear infinite;
    flex-shrink: 0;
  }

  /* ==========================================
     EMPTY STATE
  ========================================== */
  .rev-empty {
    text-align: center;
    padding: 32px 20px;
    color: var(--grey-muted);
    font-size: 1rem;
    background: var(--white);
    border-radius: var(--radius);
    box-shadow: var(--shadow-sm);
    border: 1px dashed var(--grey-mid); /* dashed border for empty state */
  }

  .rev-empty-icon {
    font-size: 2rem;
    margin-bottom: 8px;
    opacity: 0.25;
  }

  /* ==========================================
     INDIVIDUAL REVIEW CARD
  ========================================== */
  .rev-card {
    background: var(--white);
    border-radius: var(--radius);
    padding: 18px 20px;
    margin-bottom: 12px;
    box-shadow: var(--shadow-sm);
    border-left: 3px solid transparent; /* revealed on hover */
    transition: box-shadow var(--transition), transform 0.2s ease, border-color var(--transition);
    animation: rev-fadeUp 0.4s ease both; /* each card fades in */
  }

  /* Scale up slightly on hover */
  .rev-card:hover {
    box-shadow: var(--shadow-md);
    transform: scale(1.02);
    border-left-color: var(--violet); /* violet left border on hover */
  }

  /* Top row: reviewer name (left) + star rating (right) */
  .rev-card-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
    gap: 12px;
    flex-wrap: wrap; /* stacks on small screens */
  }

  /* Reviewer name */
  .rev-reviewer-name {
    font-size: 1.02rem;
    font-weight: 700;
    color: var(--black); /* bold black name */
  }

  /* Review comment text */
  .rev-comment {
    font-size: 0.96rem;
    color: var(--grey-text);
    line-height: 1.6;
    margin: 0;
  }

  /* ==========================================
     RESPONSIVE
  ========================================== */
  @media (max-width: 500px) {
    .rev-avg-number { font-size: 2.6rem; }
    .rev-form-card  { padding: 16px; }
    .rev-card       { padding: 14px; }
    .rev-title      { font-size: 1.4rem; }
  }
`;

// =============================================
// STARS DISPLAY — shows filled/empty stars
// Used in avg rating block and each review card
// =============================================
const Stars = ({ rating }) => (
  <div className="rev-stars">
    {[1, 2, 3, 4, 5].map((i) => (
      <span
        key={i}
        className={`rev-star ${i <= rating ? "filled" : "empty"}`}
      >
        ★
        {/* The ★ character itself is always the same — only the CSS class changes its color. */}
      </span>
    ))}
  </div>
);

// =============================================
// MAIN COMPONENT
// Props: productId — MongoDB _id of the product
// =============================================
const ProductReviews = ({ productId }) => {

  // ==========================================
  // STATE
  // ==========================================
  const [reviews,   setReviews]   = useState([]);  // list of all reviews
  const [avgRating, setAvgRating] = useState(0);   // average star rating
  const [count,     setCount]     = useState(0);   // total number of reviews

  const [rating,  setRating]  = useState(0);  // selected star in the form
  const [comment, setComment] = useState(""); // typed review text

  const [loading, setLoading] = useState(true); // show spinner while fetching

  // ==========================================
  // FETCH REVIEWS
  // GET /api/products/:productId/reviews
  // Called on mount and after each new review submission
  // ==========================================
  const fetchReviews = async () => {
    try {
      const { data } = await axiosInstance.get(
        `/api/products/${productId}/reviews`
      );
      setReviews(data.reviews);       // array of review objects
      setAvgRating(data.averageRating); // e.g. 4.3
      setCount(data.numOfReviews);    // e.g. 12
    } catch (err) {
      toast.error("Failed to load reviews");
    } finally {
      setLoading(false); // hide spinner regardless of result
    }
  };

  // Run fetchReviews whenever productId changes
  useEffect(() => {
    fetchReviews();
  }, [productId]);

  // ==========================================
  // SUBMIT REVIEW
  // PUT /api/products/:productId/review
  // Validates form, sends data, refreshes list
  // ==========================================
  const submitReviewHandler = async () => {

    // Validate — both rating and comment required
    if (!rating || !comment) {
      toast.error("Please add rating and comment");
      return;
    }

    try {
      const { data } = await axiosInstance.put(
        `/api/products/${productId}/review`,
        { rating, comment },        // send star rating + text
        { withCredentials: true }   // send auth cookie
      );

      toast.success(data.message);

      // Reset form fields after successful submission
      setRating(0);
      setComment("");

      // Re-fetch to show the new review immediately
      fetchReviews();

    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to submit review");
    }
  };

  // ==========================================
  // RENDER
  // ==========================================
  return (
    <>
      <style>{styles}</style>
      <div className="rev-wrap">

        {/* ==========================================
            HEADER — title + review count badge
        ========================================== */}
        <div className="rev-header">
          <h4 className="rev-title">Customer Reviews</h4>
          {/* Only show badge once data is loaded */}
          {!loading && (
            <span className="rev-count-badge">
              {count} {count === 1 ? "review" : "reviews"}
            </span>
          )}
        </div>

        {/* ==========================================
            AVERAGE RATING BLOCK
            Large number + stars + subtitle text
        ========================================== */}
        <div className="rev-avg-block">
          {/* Big number on the left */}
          <div className="rev-avg-number">{avgRating.toFixed(1)}</div>
          <div className="rev-avg-right">
            {/* Round to nearest whole number for star display */}
            <Stars rating={Math.round(avgRating)} />
            <div className="rev-avg-sub">
              out of 5 · {count} {count === 1 ? "review" : "reviews"}
            </div>
          </div>
        </div>

        {/* ==========================================
            WRITE A REVIEW FORM CARD
        ========================================== */}
        <div className="rev-form-card">
          <div className="rev-form-title">Write a Review</div>

          {/* ---- Interactive Star Picker ---- */}
          {/* When you click star 4, it calls setRating(4). React re-renders, now rating = 4, so i <= 4 is true for stars 1–4 → all four turn gold instantly. */}
          <div className="rev-star-picker">
            {[1, 2, 3, 4, 5].map((i) => (
              <button
                key={i}
                className={`rev-star-btn ${i <= rating ? "filled" : "empty"}`}
                onClick={() => setRating(i)} // set rating to clicked star index
                title={`${i} star${i > 1 ? "s" : ""}`} // tooltip on hover
              >
                ★
                {/* The ★ character itself is always the same — only the CSS class changes its color. */}
              </button>
            ))}
          </div>

          {/* ---- Comment Input ---- */}
          <textarea
            className="rev-textarea"
            placeholder="Share your experience with this product..."
            value={comment}
            onChange={(e) => setComment(e.target.value)} // update state on type
            rows={3}
          />

          {/* ---- Submit Button ---- */}
          <button className="rev-submit-btn" onClick={submitReviewHandler}>
            Submit Review
          </button>
        </div>

        {/* ==========================================
            REVIEWS LIST
            Loading → Empty → List of review cards
        ========================================== */}
        {loading ? (
          /* Loading spinner */
          <div className="rev-loader">
            <div className="rev-spinner" />
            Loading reviews...
          </div>

        ) : reviews.length === 0 ? (
          /* Empty state — no reviews yet */
          <div className="rev-empty">
            <div className="rev-empty-icon">💬</div>
            <div>No reviews yet — be the first to review!</div>
          </div>

        ) : (
          /* Render one card per review with staggered animation */
          reviews.map((rev, index) => (
            <div
              key={rev._id}
              className="rev-card"
              style={{ animationDelay: `${index * 0.06}s` }} // stagger each card
            >
              {/* Top: reviewer name + star rating */}
              <div className="rev-card-top">
                <span className="rev-reviewer-name">{rev.name}</span>
                <Stars rating={rev.rating} /> {/* display star rating */}
              </div>

              {/* Review comment text */}
              <p className="rev-comment">{rev.comment}</p>
            </div>
          ))
        )}

      </div>
    </>
  );
};

export default ProductReviews;