import { useState } from "react";
import AdminSidebar from "./AdminSidebar";
import AdminNavbar from "./AdminNavbar";
import { Outlet } from "react-router-dom";

// =============================================
// AdminLayout — wraps all admin pages
// Sidebar (left) + Navbar (top) + Page content
// Sidebar can be collapsed on mobile via toggle
// =============================================
const AdminLayout = () => {

  // Controls sidebar open/close on mobile
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="admin-layout">

      {/* ── Dark overlay — shown behind sidebar on mobile ── */}
      {sidebarOpen && (
        <div
          className="admin-sidebar-overlay"
          onClick={() => setSidebarOpen(false)} // tap outside to close
        />
      )}

      {/* ── Sidebar — passes open state and close handler ── */}
      <AdminSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* ── Right side: navbar + page content ── */}
      <div className="admin-main">

        {/* Top navbar — passes toggle handler for hamburger button */}
        <AdminNavbar onMenuToggle={() => setSidebarOpen((prev) => !prev)} />

        {/* Rendered page component (Dashboard, Products, etc.) */}
        <div className="admin-content">
          <Outlet />
        </div>

      </div>

    </div>
  );
};

export default AdminLayout;