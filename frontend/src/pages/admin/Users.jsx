import React, { useEffect, useState } from "react";
import axiosInstance from "../../axios_instance";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import Pagination from "react-js-pagination";
import { useSelector } from "react-redux";
/* ─── Styles ─────────────────────────────────────────────────── */
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;600&family=DM+Sans:wght@400;500;600&display=swap');

  .um-root {
    font-family: 'DM Sans', sans-serif;
    background: #f4f3ef;
    min-height: 100vh;
    padding: 40px 20px 80px;
    color: #1a1a1a;
  }

  .um-container {
    max-width: 1000px;
    margin: 0 auto;
  }

  /* ── Header ── */
  .um-header {
    display: flex;
    align-items: baseline;
    gap: 12px;
    margin-bottom: 28px;
  }

  .um-header h2 {
    font-size: 26px;
    font-weight: 600;
    letter-spacing: -0.5px;
    margin: 0;
  }

  .um-count-pill {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 12px;
    color: #888;
    background: #e8e6e0;
    padding: 3px 10px;
    border-radius: 20px;
  }

  /* ── Top Bar ── */
  .um-topbar {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
    margin-bottom: 20px;
  }

  .um-search-wrap {
    position: relative;
    flex: 1;
    min-width: 200px;
    max-width: 320px;
  }

  .um-search-icon {
    position: absolute;
    left: 12px;
    top: 50%;
    transform: translateY(-50%);
    font-size: 14px;
    color: #aaa;
    pointer-events: none;
  }

  .um-search {
    width: 100%;
    padding: 9px 12px 9px 36px;
    border: 1.5px solid #e2e0d8;
    border-radius: 8px;
    font-size: 14px;
    font-family: 'DM Sans', sans-serif;
    background: #fff;
    color: #1a1a1a;
    outline: none;
    transition: border-color 0.15s;
  }

  .um-search:focus {
    border-color: #1a1a1a;
  }

  .um-search::placeholder { color: #bbb; }

  .um-sort {
    padding: 9px 14px;
    border: 1.5px solid #e2e0d8;
    border-radius: 8px;
    font-size: 14px;
    font-family: 'DM Sans', sans-serif;
    background: #fff;
    color: #1a1a1a;
    outline: none;
    cursor: pointer;
    transition: border-color 0.15s;
    appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24'%3E%3Cpath fill='%23999' d='M7 10l5 5 5-5z'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 10px center;
    padding-right: 32px;
  }

  .um-sort:focus { border-color: #1a1a1a; }

  /* ── Table Card ── */
  .um-card {
    background: #fff;
    border: 1.5px solid #e2e0d8;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 1px 4px rgba(0,0,0,0.04);
    animation: um-fadeUp 0.3s ease both;
  }

  @keyframes um-fadeUp {
    from { opacity: 0; transform: translateY(8px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  /* ── Table ── */
  .um-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 14px;
  }

  .um-table thead {
    background: #f8f7f3;
    border-bottom: 1.5px solid #e2e0d8;
  }

  .um-table thead th {
    padding: 13px 16px;
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 1px;
    color: #999;
    text-align: left;
    white-space: nowrap;
  }

  .um-table thead th.center { text-align: center; }

  .um-table tbody tr {
    border-bottom: 1px solid #f0ede7;
    transition: background 0.12s;
  }

  .um-table tbody tr:last-child { border-bottom: none; }
  .um-table tbody tr:hover { background: #fafaf8; }

  .um-table td {
    padding: 13px 16px;
    vertical-align: middle;
    color: #1a1a1a;
  }

  .um-table td.center { text-align: center; }

  /* ── ID cell ── */
  .um-id {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 12px;
    color: #999;
    background: #f4f3ef;
    padding: 2px 7px;
    border-radius: 4px;
    cursor: default;
  }

  /* ── Avatar + Name ── */
  .um-user-cell {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .um-avatar {
    width: 34px;
    height: 34px;
    border-radius: 50%;
    background: #1a1a1a;
    color: #fff;
    font-size: 13px;
    font-weight: 600;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    text-transform: uppercase;
  }

  .um-name { font-weight: 500; }

  /* ── Role badge ── */
  .um-role-badge {
    display: inline-block;
    font-size: 11px;
    font-weight: 600;
    text-transform: capitalize;
    letter-spacing: 0.4px;
    padding: 3px 10px;
    border-radius: 20px;
  }

  .um-role-badge.admin { background: #ede9fe; color: #5b21b6; }
  .um-role-badge.user  { background: #f0ede7; color: #777; }

  /* ── Role select ── */
  .um-role-select {
    padding: 6px 28px 6px 10px;
    border: 1.5px solid #e2e0d8;
    border-radius: 6px;
    font-size: 13px;
    font-family: 'DM Sans', sans-serif;
    background: #fff;
    color: #1a1a1a;
    outline: none;
    cursor: pointer;
    appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24'%3E%3Cpath fill='%23999' d='M7 10l5 5 5-5z'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 8px center;
    transition: border-color 0.15s;
  }

  .um-role-select:focus { border-color: #1a1a1a; }

  /* ── Action buttons ── */
  .um-actions {
    display: flex;
    gap: 8px;
    justify-content: center;
  }

  .um-btn {
    width: 32px;
    height: 32px;
    border: none;
    border-radius: 7px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 15px;
    transition: opacity 0.15s, transform 0.1s;
  }

  .um-btn:hover { opacity: 0.8; transform: scale(1.08); }
  .um-btn:active { transform: scale(0.96); }

  .um-btn-view   { background: #e0f2fe; }
  .um-btn-delete { background: #fce4ec; }

  /* ── Empty / Loading ── */
  .um-state {
    padding: 60px 20px;
    text-align: center;
    color: #aaa;
    font-size: 14px;
    font-style: italic;
  }

  .um-spinner {
    width: 26px;
    height: 26px;
    border: 3px solid #e2e0d8;
    border-top-color: #1a1a1a;
    border-radius: 50%;
    animation: um-spin 0.7s linear infinite;
    margin: 0 auto 12px;
  }

  @keyframes um-spin { to { transform: rotate(360deg); } }

  /* ── Pagination ── */
  .um-pagination {
    display: flex;
    justify-content: center;
    margin-top: 28px;
  }

  .um-pagination .pagination {
    display: flex;
    gap: 6px;
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .um-pagination .page-item .page-link {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    border-radius: 8px;
    border: 1.5px solid #e2e0d8;
    background: #fff;
    color: #555;
    font-size: 13px;
    font-weight: 500;
    font-family: 'DM Sans', sans-serif;
    cursor: pointer;
    text-decoration: none;
    transition: all 0.15s;
  }

  .um-pagination .page-item .page-link:hover {
    border-color: #1a1a1a;
    color: #1a1a1a;
  }

  .um-pagination .page-item.active .page-link {
    background: #1a1a1a;
    border-color: #1a1a1a;
    color: #fff;
  }

  .um-pagination .page-item.disabled .page-link {
    opacity: 0.35;
    cursor: default;
    pointer-events: none;
  }
`;

/* ─── Helper ── */
const initials = (name = "") =>
  name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();

/* ─── Component ─────────────────────────────────────────────── */
const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [sortOption, setSortOption] = useState("newest");
  const [activePage, setActivePage] = useState(1);
  const usersPerPage = 5;
  const navigate = useNavigate();

  const { user: loggedInUser } = useSelector((state) => state.user);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data } = await axiosInstance.get("/api/admin/users", {
        withCredentials: true,
      });
      setUsers(data.users);
    } catch {
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const filteredUsers = users.filter((u) =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  const sortedUsers = [...filteredUsers].sort((a, b) => {
    if (sortOption === "az") return a.name.localeCompare(b.name);
    if (sortOption === "za") return b.name.localeCompare(a.name);
    if (sortOption === "admins") return a.role === "admin" ? -1 : 1;
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  const currentUsers = sortedUsers.slice(
    (activePage - 1) * usersPerPage,
    activePage * usersPerPage
  );

  const updateRole = async (id, role) => {
    try {
      await axiosInstance.put(`/api/admin/users/${id}`, { role }, { withCredentials: true });
      toast.success("Role updated");
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    }
  };

  const deleteUser = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      await axiosInstance.delete(`/api/admin/users/${id}`, { withCredentials: true });
      toast.success("User deleted");
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || "Delete failed");
    }
  };

  return (
    <>
      <style>{styles}</style>

      <div className="um-root">
        <div className="um-container">

          {/* Header */}
          <div className="um-header">
            <h2>Users Management</h2>
            <span className="um-count-pill">{filteredUsers.length} users</span>
          </div>

          {/* Top Bar */}
          <div className="um-topbar">
            <div className="um-search-wrap">
              <span className="um-search-icon">🔍</span>
              <input
                type="text"
                className="um-search"
                placeholder="Search by name or email…"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setActivePage(1); }}
              />
            </div>

            <select
              className="um-sort"
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
            >
              <option value="newest">Newest First</option>
              <option value="az">Name A–Z</option>
              <option value="za">Name Z–A</option>
              <option value="admins">Admins First</option>
            </select>
          </div>

          {/* Table Card */}
          <div className="um-card">
            {loading ? (
              <div className="um-state">
                <div className="um-spinner" />
                Loading users…
              </div>
            ) : currentUsers.length === 0 ? (
              <div className="um-state">No users found.</div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table className="um-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Phone</th>
                      <th className="center">Role</th>
                      <th className="center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentUsers.map((user) => (
                      <tr key={user._id}>

                        {/* ID */}
                        <td>
                          <span className="um-id" title={user._id}>
                            #{user._id.slice(-6).toUpperCase()}
                          </span>
                        </td>

                        {/* Name */}
                        <td>
                          <div className="um-user-cell">
                            <div className="um-avatar">{initials(user.name)}</div>
                            <span className="um-name">{user.name}</span>
                          </div>
                        </td>

                        {/* Email */}
                        <td style={{ color: "#555" }}>{user.email}</td>

                        {/* Phone */}
                        <td style={{ color: "#555" }}>{user.phone || "—"}</td>

                        {/* Role */}
                        <td className="center">
                          <span
                            title={
                              loggedInUser._id === user._id
                                ? "You cannot change your own role"
                                : "Change User Role"
                            }
                          >
                            <select
                              className="um-role-select"
                              value={user.role}
                              disabled={loggedInUser._id === user._id}
                              onChange={(e) =>
                                updateRole(user._id, e.target.value)
                              }
                            >
                              <option value="user">User</option>
                              <option value="admin">Admin</option>
                            </select>
                          </span>
                        </td>
                        {/* Actions */}
                        <td className="center">
                          <div className="um-actions">
                            <button
                              className="um-btn um-btn-view"
                              title="View user"
                              onClick={() => navigate(`/admin/users/${user._id}`)}
                            >
                              👁️
                            </button>
                            <span
                              title={
                                loggedInUser._id === user._id
                                  ? "You cannot delete your own account"
                                  : "Delete User"
                              }
                            >
                              <button
                                className="btn btn-sm btn-danger"
                                disabled={loggedInUser._id === user._id}
                                style={{
                                  cursor:
                                    loggedInUser._id === user._id
                                      ? "not-allowed"
                                      : "pointer",
                                  opacity:
                                    loggedInUser._id === user._id
                                      ? 0.5
                                      : 1
                                }}
                              >
                                🗑
                              </button>
                            </span>
                          </div>
                        </td>

                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Pagination */}
          {filteredUsers.length > usersPerPage && (
            <div className="um-pagination">
              <Pagination
                activePage={activePage}
                itemsCountPerPage={usersPerPage}
                totalItemsCount={filteredUsers.length}
                pageRangeDisplayed={5}
                onChange={(page) => setActivePage(page)}
                innerClass="pagination"
                itemClass="page-item"
                linkClass="page-link"
                activeClass="active"
                disabledClass="disabled"
              />
            </div>
          )}

        </div>
      </div>
    </>
  );
};

export default Users;