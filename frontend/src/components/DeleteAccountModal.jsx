// =============================================
// Self-contained styles — matches app theme
// Orange (#ff5722) + Violet (#6a0dad)
// =============================================
const styles = `

  /* ==========================================
     ANIMATIONS
  ========================================== */

  /* Overlay fades in */
  @keyframes dam-fadeIn {
    from { opacity: 0; }
    to   { opacity: 1; }
  }

  /* Modal slides up + fades in */
  @keyframes dam-slideUp {
    from { opacity: 0; transform: translateY(30px) scale(0.96); }
    to   { opacity: 1; transform: translateY(0)    scale(1);    }
  }

  /* Icon bounce on entry */
  @keyframes dam-bounce {
    0%   { transform: scale(0.5); opacity: 0; }
    60%  { transform: scale(1.2); }
    100% { transform: scale(1);   opacity: 1; }
  }

  /* Spinner for loading state */
  @keyframes dam-spin {
    to { transform: rotate(360deg); }
  }

  /* ==========================================
     OVERLAY — dark semi-transparent backdrop
  ========================================== */
  .delete-modal-overlay {
    position: fixed;
    inset: 0;                          /* covers full screen */
    background: rgba(0, 0, 0, 0.55);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 20px;
    animation: dam-fadeIn 0.2s ease both; /* overlay fades in */
    backdrop-filter: blur(3px);        /* subtle blur behind modal */
  }

  /* ==========================================
     MODAL CARD
  ========================================== */
  .delete-modal {
    background: #ffffff;
    border-radius: 16px;
    padding: 40px 36px 32px;
    max-width: 420px;
    width: 100%;
    text-align: center;
    box-shadow: 0 24px 64px rgba(0, 0, 0, 0.2);
    animation: dam-slideUp 0.35s cubic-bezier(0.22, 1, 0.36, 1) both;
    position: relative;
    overflow: hidden;
  }

  /* Red top accent bar */
  .delete-modal::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 4px;
    background: linear-gradient(90deg, #e53935, #ff5722); /* red → orange */
  }

  /* ==========================================
     WARNING ICON
  ========================================== */
  .delete-modal-icon {
    font-size: 3.5rem;
    margin-bottom: 18px;
    display: block;
    animation: dam-bounce 0.5s cubic-bezier(0.22, 1, 0.36, 1) both;
    animation-delay: 0.15s;           /* slight delay after modal appears */
  }

  /* ==========================================
     TITLE
  ========================================== */
  .delete-modal-title {
    font-size: 1.5rem;
    font-weight: 700;
    color: #111;
    margin: 0 0 16px;
    letter-spacing: -0.02em;
  }

  /* ==========================================
     DESCRIPTION TEXT
  ========================================== */
  .delete-modal-text {
    font-size: 0.95rem;
    color: #555;
    line-height: 1.7;
    margin: 0 0 28px;
  }

  /* "This action cannot be undone" — highlighted warning line */
  .delete-modal-warning {
    display: inline-block;
    margin-top: 8px;
    font-size: 0.82rem;
    font-weight: 700;
    color: #e53935;                   /* red warning text */
    background: #fff5f5;
    border: 1px solid #ffcdd2;
    border-radius: 6px;
    padding: 6px 14px;
    letter-spacing: 0.02em;
  }

  /* ==========================================
     ACTION BUTTONS ROW
  ========================================== */
  .delete-modal-actions {
    display: flex;
    gap: 12px;
  }

  /* Shared button base */
  .delete-modal-actions button {
    flex: 1;
    padding: 13px 16px;
    border-radius: 8px;
    font-size: 0.92rem;
    font-weight: 700;
    letter-spacing: 0.02em;
    cursor: pointer;
    transition: background 0.2s, transform 0.15s, box-shadow 0.2s;
    border: none;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
  }

  /* Cancel — outlined neutral style */
  .delete-cancel-btn {
    background: #f5f5f5;
    color: #555;
    border: 1.5px solid #e0e0e0 !important;
  }

  .delete-cancel-btn:hover:not(:disabled) {
    background: #eeeeee;
    color: #111;
    transform: translateY(-1px);
  }

  /* Delete — solid red */
  .delete-confirm-btn {
    background: #e53935;
    color: #fff;
    box-shadow: 0 4px 14px rgba(229, 57, 53, 0.35);
  }

  .delete-confirm-btn:hover:not(:disabled) {
    background: #c62828;             /* darker red on hover */
    transform: translateY(-1px);
    box-shadow: 0 6px 20px rgba(229, 57, 53, 0.45);
  }

  /* Both buttons — disabled state while deleting */
  .delete-modal-actions button:disabled {
    opacity: 0.55;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }

  /* Inline spinner inside Delete button when loading */
  .dam-spinner {
    width: 15px;
    height: 15px;
    border: 2px solid rgba(255,255,255,0.4);
    border-top-color: #fff;
    border-radius: 50%;
    animation: dam-spin 0.7s linear infinite;
    flex-shrink: 0;
  }

  /* ==========================================
     RESPONSIVE — tighten padding on mobile
  ========================================== */
  @media (max-width: 480px) {
    .delete-modal {
      padding: 30px 20px 24px;
    }

    .delete-modal-title {
      font-size: 1.3rem;
    }

    .delete-modal-text {
      font-size: 0.9rem;
    }

    /* Stack buttons vertically on small screens */
    .delete-modal-actions {
      flex-direction: column;
    }
  }
`;

const DeleteAccountModal = ({
  isOpen,
  onClose,
  onDelete,
  loading
}) => {

  // Don't render modal if closed — saves memory
  if (!isOpen) return null;

  return (
    <>
      <style>{styles}</style>

      {/* ── Dark overlay — click outside to close ── */}
      <div
        className="delete-modal-overlay"
        onClick={onClose}               /* clicking backdrop closes modal */
      >

        {/* ── Modal card — stop click from bubbling to overlay ── */}
        <div
          className="delete-modal"
          onClick={(e) => e.stopPropagation()}
        >

          {/* ── Warning Icon ── */}
          <span className="delete-modal-icon">😢</span>

          {/* ── Title ── */}
          <h2 className="delete-modal-title">Delete Account?</h2>

          {/* ── Description ── */}
          <p className="delete-modal-text">
            We're really sorry to see you go.
            <br /><br />
            Deleting your account will permanently remove your profile
            and account access from Mobile Mart.
            <br /><br />
            {/* Highlighted warning line — red pill */}
            <span className="delete-modal-warning">
              ⚠️ This action cannot be undone
            </span>
          </p>

          {/* ── Action Buttons ── */}
          <div className="delete-modal-actions">

            {/* Cancel — closes modal without action */}
            <button
              className="delete-cancel-btn"
              onClick={onClose}
              disabled={loading}        /* disabled while delete is in progress */
            >
              Cancel
            </button>

            {/* Delete — triggers onDelete handler */}
            <button
              className="delete-confirm-btn"
              onClick={onDelete}
              disabled={loading}
            >
              {/* Show spinner + text while API call is running */}
              {loading ? (
                <>
                  <span className="dam-spinner" />
                  Deleting...
                </>
              ) : (
                "Delete Account"
              )}
            </button>

          </div>

        </div>
      </div>
    </>
  );
};

export default DeleteAccountModal;