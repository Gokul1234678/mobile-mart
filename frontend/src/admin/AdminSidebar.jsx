import { Link, useLocation } from "react-router-dom";

// =============================================
// Self-contained sidebar styles
// Dark theme: black bg, orange accent, white text
// =============================================
const sidebarStyles = `
  :root {
    --orange: #ff5722;
    --sidebar-bg: #2b3643;        /* dark navy/slate — matches Pluto reference */
    --sidebar-width: 240px;
    --sidebar-text: rgba(255,255,255,0.7);   /* muted white for inactive links */
    --sidebar-text-active: #ffffff;
    --sidebar-hover: rgba(255,255,255,0.07);
    --sidebar-section-line: #ff5722; /* orange underline for section labels */
    --transition: 0.2s ease;
  }

  /* ==========================================
     SIDEBAR WRAPPER
  ========================================== */
  .admin-sidebar {
    width: var(--sidebar-width);
    min-height: 100vh;
    background: var(--sidebar-bg);
    display: flex;
    flex-direction: column;
    flex-shrink: 0;              /* don't shrink in flex layout */
    position: sticky;
    top: 0;
    z-index: 200;
    transition: transform var(--transition);
  }

  /* ==========================================
     USER PROFILE BLOCK — like Pluto top section
     Shows avatar, name, online status
  ========================================== */
  .admin-sidebar-profile {
    padding: 22px 20px 18px;
    display: flex;
    align-items: center;
    gap: 13px;
    border-bottom: 1px solid rgba(255,255,255,0.08);
  }

  /* Circular avatar with user initial */
  .admin-profile-avatar {
    width: 46px;
    height: 46px;
    border-radius: 50%;
    background: var(--orange);       /* orange avatar circle */
    color: #fff;
    font-size: 1.1rem;
    font-weight: 700;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    text-transform: uppercase;
    border: 2px solid rgba(255,255,255,0.15); /* subtle ring */
  }

  .admin-profile-info {
    display: flex;
    flex-direction: column;
    gap: 3px;
    min-width: 0;
  }

  /* User name in sidebar */
  .admin-profile-name {
    font-size: 0.95rem;
    font-weight: 700;
    color: #fff;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  /* Green online dot + "Online" text */
  .admin-profile-status {
    display: flex;
    align-items: center;
    gap: 5px;
    font-size: 0.72rem;
    color: rgba(255,255,255,0.5);
  }

  .admin-status-dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: #4caf50;            /* green dot */
    flex-shrink: 0;
  }

  /* ==========================================
     CLOSE BUTTON — mobile only
  ========================================== */
  .admin-sidebar-close {
    display: none;                  /* hidden on desktop */
    position: absolute;
    top: 14px;
    right: 14px;
    background: rgba(255,255,255,0.08);
    border: none;
    color: #fff;
    width: 28px;
    height: 28px;
    border-radius: 6px;
    font-size: 1rem;
    cursor: pointer;
    align-items: center;
    justify-content: center;
    transition: background var(--transition);
  }

  .admin-sidebar-close:hover {
    background: rgba(255,255,255,0.15);
  }

  /* ==========================================
     MENU SECTION LABEL — "General" style from Pluto
     Bold white text with orange underline
  ========================================== */
  .admin-menu-label {
    font-size: 0.78rem;
    font-weight: 700;
    color: #ffffff;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    padding: 20px 20px 6px;
    position: relative;
    display: inline-block;
  }

  /* Orange underline below section label */
  .admin-menu-label::after {
    content: '';
    display: block;
    width: 30px;
    height: 2px;
    background: var(--orange);      /* orange line under "MAIN MENU" */
    margin-top: 5px;
  }

  /* ==========================================
     NAV MENU LINKS
  ========================================== */
  .admin-nav {
    flex: 1;
    padding: 6px 0;
    display: flex;
    flex-direction: column;
  }

  /* Each nav link — full width, no border-radius like Pluto */
  .admin-nav-link {
    display: flex;
    align-items: center;
    gap: 13px;
    padding: 12px 20px;
    text-decoration: none;
    color: var(--sidebar-text);
    font-size: 0.92rem;
    font-weight: 500;
    border-left: 3px solid transparent; /* orange bar revealed on active */
    transition: background var(--transition), color var(--transition), border-color var(--transition);
    position: relative;
  }

  /* Hover — subtle highlight */
  .admin-nav-link:hover {
    background: var(--sidebar-hover);
    color: var(--sidebar-text-active);
  }

  /* Active — orange left bar + bright white text, like Pluto */
  .admin-nav-link.active {
    background: rgba(255,87,34,0.1);     /* very subtle orange tint */
    color: #ffffff;
    border-left-color: var(--orange);    /* orange left indicator bar */
    font-weight: 600;
  }

  /* Colored icon box — each item gets a unique color like Pluto */
  .admin-nav-icon {
    width: 28px;
    height: 28px;
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1rem;
    flex-shrink: 0;
  }

  /* Individual icon bg colors per menu item */
  .admin-nav-icon.icon-dashboard  { background: rgba(255,152,0,0.18);  }  /* amber */
  .admin-nav-icon.icon-products   { background: rgba(33,150,243,0.18); }  /* blue */
  .admin-nav-icon.icon-orders     { background: rgba(76,175,80,0.18);  }  /* green */
  .admin-nav-icon.icon-users      { background: rgba(156,39,176,0.18); }  /* purple */

  /* ==========================================
     SIDEBAR FOOTER
  ========================================== */
  .admin-sidebar-footer {
    padding: 14px 20px;
    border-top: 1px solid rgba(255,255,255,0.07);
    font-size: 0.7rem;
    color: rgba(255,255,255,0.2);
    letter-spacing: 0.04em;
  }

  /* ==========================================
     OVERLAY — behind sidebar on mobile
  ========================================== */
  .admin-sidebar-overlay {
    display: none;                  /* hidden on desktop */
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.55);
    z-index: 150;
    animation: sidebarFadeIn 0.2s ease;
  }

  @keyframes sidebarFadeIn {
    from { opacity: 0; }
    to   { opacity: 1; }
  }

  /* ==========================================
     ADMIN LAYOUT SHELL
  ========================================== */
  .admin-layout {
    display: flex;
    min-height: 100vh;
    background: #f0f2f5;            /* light grey page background */
  }

  .admin-main {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-width: 0;
    overflow: hidden;
  }

  .admin-content {
    padding: 28px 24px;
    flex: 1;
    overflow-y: auto;
  }

  /* ==========================================
     RESPONSIVE — sidebar becomes drawer on mobile
  ========================================== */
  @media (max-width: 768px) {
    .admin-sidebar {
      position: fixed;
      left: 0;
      top: 0;
      height: 100vh;
      transform: translateX(-100%); /* hidden off-screen */
      z-index: 200;
    }

    .admin-sidebar.open {
      transform: translateX(0);     /* slides in when open */
    }

    .admin-sidebar-overlay {
      display: block;
    }

    .admin-sidebar-close {
      display: flex;
    }

    .admin-content {
      padding: 16px;
    }
  }
`;

// =============================================
// MENU CONFIG — name, path, emoji icon
// =============================================
const MENU = [
  { name: "Dashboard", path: "/admin",          icon: "📊", iconCls: "icon-dashboard" },
  { name: "Products",  path: "/admin/products", icon: "📦", iconCls: "icon-products"  },
  { name: "Orders",    path: "/admin/orders",   icon: "🧾", iconCls: "icon-orders"    },
  { name: "Users",     path: "/admin/users",    icon: "👥", iconCls: "icon-users"     },
];

// =============================================
// COMPONENT
// Props:
//   isOpen  — boolean, controls mobile drawer open state
//   onClose — function, called when close button or overlay is clicked
// =============================================
const AdminSidebar = ({ isOpen, onClose }) => {

  const location = useLocation(); // get current URL path for active state

  return (
    <>
      <style>{sidebarStyles}</style>

      <aside className={`admin-sidebar ${isOpen ? "open" : ""}`}>

        {/* ── Close button (mobile only) ── */}
        <button className="admin-sidebar-close" onClick={onClose}>✕</button>

        {/* ── User Profile Block — like Pluto reference ── */}
        <div className="admin-sidebar-profile">
          {/* Avatar circle with first letter of "Admin" */}
          <div className="admin-profile-avatar">A</div>
          <div className="admin-profile-info">
            <div className="admin-profile-name">Admin</div>
            {/* Green dot + online status */}
            <div className="admin-profile-status">
              <span className="admin-status-dot" />
              Online
            </div>
          </div>
        </div>

        {/* ── Menu section label ── */}
        <div className="admin-menu-label">Main Menu</div>

        {/* ── Navigation Links ── */}
        <nav className="admin-nav">
          {MENU.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`admin-nav-link ${
                // exact match for /admin dashboard, startsWith for sub-routes
                item.path === "/admin"
                  ? location.pathname === "/admin" ? "active" : ""
                  : location.pathname.startsWith(item.path) ? "active" : ""
              }`}
              onClick={onClose} // close sidebar on mobile after navigation
            >
              {/* Icon box with unique bg color per item */}
              <span className={`admin-nav-icon ${item.iconCls}`}>{item.icon}</span>
              {item.name}
            </Link>
          ))}
        </nav>

        {/* ── Footer ── */}
        <div className="admin-sidebar-footer">
          Mobile Mart v1.0
        </div>

      </aside>
    </>
  );
};

export default AdminSidebar;