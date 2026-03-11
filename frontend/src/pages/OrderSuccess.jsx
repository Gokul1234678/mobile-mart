import React from "react";
import { useParams, useNavigate } from "react-router-dom";

const styles = `
  :root {
    --orange: #ff5722;
    --orange-hover: #e64a19;
    --violet: #6a0dad;
    --red: #e53935;
    --green: #2e7d32;
    --green-light: #e8f5e9;
    --green-mid: #4caf50;
    --text-primary: #111111;
    --text-secondary: #555555;
    --text-muted: #999999;
    --page-bg: #f8f8f8;
    --card-bg: #ffffff;
    --border: #eeeeee;
    --radius: 16px;
    --radius-sm: 8px;
    --shadow-sm: 0 1px 4px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.04);
    --shadow-md: 0 8px 32px rgba(0,0,0,0.1);
    --transition: 0.2s ease;
  }

  /* ---- Keyframes ---- */
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(28px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  @keyframes popIn {
    0%   { opacity: 0; transform: scale(0.5); }
    70%  { transform: scale(1.12); }
    100% { opacity: 1; transform: scale(1); }
  }

  @keyframes checkDraw {
    from { stroke-dashoffset: 80; }
    to   { stroke-dashoffset: 0; }
  }

  @keyframes circleDraw {
    from { stroke-dashoffset: 314; }
    to   { stroke-dashoffset: 0; }
  }

  @keyframes confettiFall {
    0%   { transform: translateY(-20px) rotate(0deg); opacity: 1; }
    100% { transform: translateY(120px) rotate(720deg); opacity: 0; }
  }

  @keyframes shimmer {
    0%   { background-position: -200% center; }
    100% { background-position: 200% center; }
  }

  @keyframes pulse-ring {
    0%   { transform: scale(1); opacity: 0.6; }
    100% { transform: scale(1.5); opacity: 0; }
  }

  /* ---- Page ---- */
  .success-page {
    min-height: 100vh;
    background: var(--page-bg);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 40px 20px 80px;
    position: relative;
    overflow: hidden;
  }

  /* Subtle bg pattern */
  .success-page::before {
    content: '';
    position: fixed;
    inset: 0;
    background-image:
      radial-gradient(circle at 20% 20%, rgba(255,87,34,0.06) 0%, transparent 50%),
      radial-gradient(circle at 80% 80%, rgba(106,13,173,0.06) 0%, transparent 50%);
    pointer-events: none;
    z-index: 0;
  }

  /* ---- Confetti dots ---- */
  .confetti-dot {
    position: fixed;
    width: 8px;
    height: 8px;
    border-radius: 2px;
    animation: confettiFall linear forwards;
    z-index: 0;
    pointer-events: none;
  }

  /* ---- Card ---- */
  .success-card {
    background: var(--card-bg);
    border-radius: var(--radius);
    padding: 48px 44px 40px;
    max-width: 480px;
    width: 100%;
    text-align: center;
    box-shadow: var(--shadow-md);
    position: relative;
    z-index: 1;
    animation: fadeUp 0.6s ease both;
    animation-delay: 0.1s;
  }

  /* top accent bar */
  .success-card::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 4px;
    background: linear-gradient(90deg, var(--orange), var(--violet));
    border-radius: var(--radius) var(--radius) 0 0;
  }

  /* ---- Check icon ---- */
  .success-icon-wrap {
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 24px;
    animation: popIn 0.6s cubic-bezier(0.22, 1, 0.36, 1) both;
    animation-delay: 0.3s;
  }

  /* Pulse ring behind icon */
  .success-icon-wrap::after {
    content: '';
    position: absolute;
    width: 90px;
    height: 90px;
    border-radius: 50%;
    background: var(--green-light);
    animation: pulse-ring 1.8s ease-out infinite;
    animation-delay: 0.9s;
    z-index: -1;
  }

  .success-svg {
    width: 80px;
    height: 80px;
  }

  .success-svg .circle {
    fill: none;
    stroke: var(--green-mid);
    stroke-width: 3;
    stroke-dasharray: 314;
    stroke-dashoffset: 314;
    animation: circleDraw 0.6s ease forwards;
    animation-delay: 0.4s;
  }

  .success-svg .check {
    fill: none;
    stroke: var(--green-mid);
    stroke-width: 4;
    stroke-linecap: round;
    stroke-linejoin: round;
    stroke-dasharray: 80;
    stroke-dashoffset: 80;
    animation: checkDraw 0.4s ease forwards;
    animation-delay: 0.9s;
  }

  /* ---- Headline ---- */
  .success-headline {
    font-size: 1.55rem;
    font-weight: 700;
    color: var(--text-primary);
    margin: 0 0 8px;
    letter-spacing: -0.02em;
    animation: fadeUp 0.5s ease both;
    animation-delay: 0.5s;
  }

  .success-subtext {
    font-size: 1rem;
    color: var(--text-secondary);
    margin: 0 0 28px;
    line-height: 1.6;
    animation: fadeUp 0.5s ease both;
    animation-delay: 0.6s;
  }

  /* ---- Order ID pill ---- */
  .order-id-pill {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: #f5f5f5;
    border: 1px solid var(--border);
    border-radius: 40px;
    padding: 8px 18px;
    margin-bottom: 32px;
    animation: fadeUp 0.5s ease both;
    animation-delay: 0.7s;
  }

  .order-id-label {
    font-size: 0.75rem;
    font-weight: 600;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }

  .order-id-value {
    font-size: 0.82rem;
    font-weight: 700;
    color: var(--violet);
    letter-spacing: 0.03em;
    word-break: break-all;
  }

  /* ---- Divider ---- */
  .success-divider {
    border: none;
    border-top: 1px solid var(--border);
    margin: 0 0 28px;
  }

  /* ---- Continue button ---- */
  .continue-btn {
    width: 100%;
    padding: 14px 20px;
    background: var(--orange);
    color: #fff;
    border: none;
    border-radius: var(--radius-sm);
    font-size: 0.88rem;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    transition: background var(--transition), transform 0.15s, box-shadow var(--transition);
    box-shadow: 0 4px 16px rgba(255,87,34,0.35);
    animation: fadeUp 0.5s ease both;
    animation-delay: 0.8s;
  }

  /* shimmer sweep */
  .continue-btn::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(
      105deg,
      transparent 40%,
      rgba(255,255,255,0.25) 50%,
      transparent 60%
    );
    background-size: 200% auto;
    animation: shimmer 2.4s linear infinite;
  }

  .continue-btn:hover {
    background: var(--violet);
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(106,13,173,0.35);
  }

  .continue-btn:active {
    transform: translateY(0);
  }

  /* ---- Responsive ---- */
  @media (max-width: 520px) {
    .success-card {
      padding: 36px 22px 30px;
    }
    .success-headline {
      font-size: 1.25rem;
    }
    .success-subtext {
      font-size: 0.9rem;
    }
    .success-svg {
      width: 66px;
      height: 66px;
    }
  }
`;

// Confetti config
const CONFETTI = [
  { left: "10%", color: "#ff5722", delay: "0.1s", duration: "1.4s", size: "10px" },
  { left: "25%", color: "#6a0dad", delay: "0.3s", duration: "1.1s", size: "7px" },
  { left: "40%", color: "#4caf50", delay: "0s",   duration: "1.6s", size: "9px" },
  { left: "55%", color: "#ff5722", delay: "0.5s", duration: "1.2s", size: "6px" },
  { left: "70%", color: "#6a0dad", delay: "0.2s", duration: "1.5s", size: "11px" },
  { left: "85%", color: "#4caf50", delay: "0.4s", duration: "1.3s", size: "8px" },
  { left: "15%", color: "#ffc107", delay: "0.6s", duration: "1.7s", size: "7px" },
  { left: "60%", color: "#ffc107", delay: "0.1s", duration: "1.0s", size: "9px" },
  { left: "90%", color: "#ff5722", delay: "0.7s", duration: "1.4s", size: "6px" },
  { left: "5%",  color: "#6a0dad", delay: "0.3s", duration: "1.2s", size: "10px" },
];

const OrderSuccess = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <>
      <style>{styles}</style>
      <div className="success-page">

        {/* Confetti */}
        {CONFETTI.map((c, i) => (
          <div
            key={i}
            className="confetti-dot"
            style={{
              left: c.left,
              top: "-10px",
              background: c.color,
              width: c.size,
              height: c.size,
              animationDelay: c.delay,
              animationDuration: c.duration,
            }}
          />
        ))}

        <div className="success-card">

          {/* Animated checkmark */}
          <div className="success-icon-wrap">
            <svg className="success-svg" viewBox="0 0 100 100">
              <circle className="circle" cx="50" cy="50" r="46" />
              <polyline className="check" points="28,52 44,66 72,36" />
            </svg>
          </div>

          {/* Text */}
          <h2 className="success-headline">Order Placed Successfully!</h2>
          <p className="success-subtext">
            Your order has been placed successfully.<br />
            Thank you for your order!
          </p>

          {/* Order ID */}
          <div className="order-id-pill">
            <span className="order-id-label">Order ID</span>
            <span className="order-id-value">{id}</span>
          </div>

          <hr className="success-divider" />

          {/* CTA */}
          <button className="continue-btn" onClick={() => navigate("/")}>
            Continue Shopping
          </button>

        </div>
      </div>
    </>
  );
};

export default OrderSuccess;