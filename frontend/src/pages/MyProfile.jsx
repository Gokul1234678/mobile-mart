import React, { useState, useEffect } from "react";
import axiosInstance from "../axios_instance";
import { toast } from "react-toastify";
import "../assets/styles/profile.css";
import Navbar from "../components/Navbar";


import manImg from "../assets/img/icons/man.png";
import womanImg from "../assets/img/icons/woman.png";


const MyProfile = () => {

  // ================= TAB STATE =================
  const [activeTab, setActiveTab] = useState("profile");

  // ================= EDIT STATES =================
  const [editingProfile, setEditingProfile] = useState(false);
  const [editingAddress, setEditingAddress] = useState(false);

  // ================= LOADING STATES =================
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false); // spinner while saving

  // ================= USER DATA =================
  const [user, setUser] = useState(null);

  // ================= FORM DATA =================
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    gender: "",
    street: "",
    city: "",
    state: "",
    pincode: ""
  });

  // ================= PASSWORD FIELDS =================
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loadingPassword, setLoadingPassword] = useState(false);

  // ================= SHOW/HIDE PASSWORD STATES =================
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);


  // ==========================================================
  // 🔐 HANDLE CHANGE PASSWORD
  // ==========================================================
  const handleChangePassword = async () => {
    try {
      // 1️⃣ Frontend validation
      if (!oldPassword || !newPassword) {
        return toast.error("Both fields are required");
      }

      if (newPassword.length < 6) {
        return toast.error("New password must be at least 6 characters");
      }

      // Show loading spinner on button
      setLoadingPassword(true);

      // 2️⃣ Call backend API
      const { data } = await axiosInstance.put(
        "/api/change-password",
        {
          // The request body contains the old and new passwords, which are sent to the server for processing. The server will verify the old password and update it to the new password if valid.
          oldPassword,
          newPassword
        },
        { withCredentials: true }// It tells the browser to include cookies and authentication info in a cross-origin request
      );

      toast.success(data.message);

      // 3️⃣ Clear inputs after success
      setOldPassword("");
      setNewPassword("");

    } catch (error) {
      toast.error(
        error.response?.data?.message || "Password change failed"
      );
    } finally {
      setLoadingPassword(false);
    }
  };


  // ==========================================================
  // 🔹 LOAD USER PROFILE WHEN COMPONENT MOUNTS
  // ==========================================================
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await axiosInstance.get("/api/myprofile", {
          // It tells the browser to include cookies and authentication info in a cross-origin request
          withCredentials: true
        });

        setUser(data.user);

        // Fill form fields with user data
        setFormData({
          name: data.user.name || "",
          phone: data.user.phone || "",
          gender: data.user.gender || "",
          street: data.user.address?.street || "",
          city: data.user.address?.city || "",
          state: data.user.address?.state || "",
          pincode: data.user.address?.pincode || ""
        });

      } catch (error) {
        toast.error("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  // ==========================================================
  // 🔹 HANDLE INPUT CHANGE
  // ==========================================================
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ==========================================================
  // 🔹 SAVE PROFILE OR ADDRESS
  // ==========================================================
  const saveProfile = async () => {
    try {
      setSaving(true);

      const { data } = await axiosInstance.put(
        "/api/update-profile",
        formData,
        { withCredentials: true }// It tells the browser to include cookies and authentication info in a cross-origin request
      );

      toast.success(data.message);

      setEditingProfile(false);
      setEditingAddress(false);
      setUser(data.user);

    } catch (error) {
      toast.error(error.response?.data?.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  // ==========================================================
  // 🔹 HANDLE TAB CHANGE + CLOSE MOBILE MENU
  // ==========================================================
  const handleTabChange = (tab) => {
    setActiveTab(tab);

    // Close mobile offcanvas if open
    const offcanvasElement = document.getElementById("profileMenu");
    // window.bootstrap is available only if Bootstrap JS is included in the project
    if (offcanvasElement) {
      const offcanvas =
        window.bootstrap?.Offcanvas.getInstance(offcanvasElement);// It retrieves the existing Offcanvas instance associated with the element, if it exists. If no instance exists, it returns null.
      if (offcanvas) offcanvas.hide();// It programmatically hides the offcanvas menu, ensuring that it closes when a tab is selected on mobile devices.
    }
  };

  // ==========================================================
  // 🔹 LOADING SCREEN
  // ==========================================================
  if (loading) {
    return (
      <div className="text-center mt-5">
        <div className="spinner-border text-primary"></div>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="container my-5 profile-container">

        {/* ================= TOP USER INFO ================= */}
        <div className="d-flex align-items-center mb-4">
          <img
            // If user gender is male → show manImg
            // If user gender is female → show womanImg
            // If user gender is not specified → show default avatar
            src={
              user?.gender === "male"
                ? manImg
                : user?.gender === "female"
                  ? womanImg
                  : "https://cdn-icons-png.flaticon.com/512/149/149071.png"
            }
            width="80"
            alt="user"
            className="profile-avatar"
          />

          <div className="ms-3">
            <h2 className="text-primary">Welcome</h2>
            <h5>{user.name}</h5>
          </div>
        </div>

        {/* ================= MOBILE MENU BUTTON ================= */}
        <div className="d-md-none mb-3">
          <button
            className="btn btn-primary"
            data-bs-toggle="offcanvas"
            data-bs-target="#profileMenu"
          >
            Open Menu
          </button>
        </div>

        <div className="row">

          {/* ================= SIDEBAR DESKTOP ================= */}
          <div className="col-md-3 d-none d-md-block">
            <div className="card p-3">
              <h5 className="text-center mb-3">Account Settings</h5>
              <hr />

              <button
                className={`btn mb-2 ${activeTab === "profile" ? "btn-primary" : "btn-light"}`}
                onClick={() => handleTabChange("profile")}
              >
                <i className="bi bi-person me-2"></i>
                Profile Information
              </button>

              <button
                className={`btn mb-2 ${activeTab === "address" ? "btn-primary" : "btn-light"}`}
                onClick={() => handleTabChange("address")}
              >
                <i className="bi bi-geo-alt me-2"></i>
                Your Address
              </button>

              <button
                className={`btn mb-2 ${activeTab === "password" ? "btn-primary" : "btn-light"}`}
                onClick={() => handleTabChange("password")}
              >
                <i className="bi bi-lock me-2"></i>
                Change Password
              </button>

              <hr />

              <button className="btn btn-light mb-2">
                <i className="bi bi-bag me-2"></i> My Orders
              </button>

              <button className="btn btn-light mb-2">
                <i className="bi bi-cart me-2"></i> My Cart
              </button>

              <button className="btn btn-danger">
                <i className="bi bi-trash me-2"></i> Delete My Account
              </button>
            </div>
          </div>

          {/* ================= MOBILE OFFCANVAS MENU ================= */}
          <div
            className="offcanvas offcanvas-start"
            id="profileMenu"
            style={{ width: "270px" }}
          >
            {/* Header */}
            <div
              className="offcanvas-header"
              style={{ backgroundColor: "var(--voilet)", color: "#fff" }}
            >
              <h5 className="mb-0 fw-bold">Account Menu</h5>
              <button
                className="btn-close btn-close-white"
                data-bs-dismiss="offcanvas"
              ></button>
            </div>

            <div className="offcanvas-body p-3">

              {/* Profile */}
              <button
                className={`btn w-100 text-start mb-3 mobile-menu-btn ${activeTab === "profile" ? "active-menu" : ""
                  }`}
                onClick={() => handleTabChange("profile")}
              >
                <i className="bi bi-person me-2"></i>
                Profile Information
              </button>

              {/* Address */}
              <button
                className={`btn w-100 text-start mb-3 mobile-menu-btn ${activeTab === "address" ? "active-menu" : ""
                  }`}
                onClick={() => handleTabChange("address")}
              >
                <i className="bi bi-geo-alt me-2"></i>
                Your Address
              </button>

              {/* Password */}
              <button
                className={`btn w-100 text-start mb-3 mobile-menu-btn ${activeTab === "password" ? "active-menu" : ""
                  }`}
                onClick={() => handleTabChange("password")}
              >
                <i className="bi bi-lock me-2"></i>
                Change Password
              </button>

              <hr />

              {/* Orders */}
              <button className="btn w-100 text-start mb-3 mobile-menu-btn">
                <i className="bi bi-bag me-2"></i>
                My Orders
              </button>

              {/* Cart */}
              <button className="btn w-100 text-start mb-3 mobile-menu-btn">
                <i className="bi bi-cart me-2"></i>
                My Cart
              </button>

              <hr />

              {/* Delete Account */}
              <button className="btn w-100 text-start delete-account-btn btn-danger">
                <i className="bi bi-trash me-2"></i>
                Delete Account
              </button>

            </div>
          </div>

          {/* ================= CONTENT AREA ================= */}
          <div className="col-md-9">

            {/* PROFILE TAB */}
            {activeTab === "profile" && (
              <>
                <h4>
                  Profile Information{" "}
                  <span
                    className="text-primary"
                    style={{ cursor: "pointer" }}

                    // If editingProfile is TRUE → call saveProfile() to save changes
                    // If editingProfile is FALSE → setEditingProfile(true) to enable editing
                    onClick={() =>
                      editingProfile ? saveProfile() : setEditingProfile(true)
                    }
                  >
                    {editingProfile ? "Save" : "Edit"}
                    {/* If editingProfile is TRUE → show "Save"
                        If editingProfile is FALSE → show "Edit"
                        */}
                  </span>
                </h4>

                <input
                  className="profile-input form-control mb-3"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  readOnly={!editingProfile}
                />

                <input
                  className="profile-input form-control mb-3"
                  value={user.email}
                  readOnly
                />

                <input
                  className=" profile-input form-control mb-3"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  readOnly={!editingProfile}
                />

                <div className="profile-label">
                  <input
                    type="radio"
                    name="gender"
                    value="male"
                    checked={formData.gender === "male"}
                    onChange={handleChange}
                    disabled={!editingProfile}
                  /> Male

                  <input
                    type="radio"
                    name="gender"
                    value="female"
                    className="ms-3"
                    checked={formData.gender === "female"}
                    onChange={handleChange}
                    disabled={!editingProfile}
                  /> Female
                </div>
              </>
            )}

            {/* ADDRESS TAB */}
            {activeTab === "address" && (
              <>
                <h4>
                  Your Address{" "}
                  <span
                    className="text-primary"
                    style={{ cursor: "pointer" }}
                    onClick={() =>
                      editingAddress ? saveProfile() : setEditingAddress(true)
                    }
                  >
                    {editingAddress ? "Save" : "Edit"}
                  </span>
                </h4>

                <input
                  className="profile-input form-control mb-2"
                  name="street"
                  value={formData.street}
                  onChange={handleChange}
                  readOnly={!editingAddress}
                />

                <input
                  className=" profile-input form-control mb-2"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  readOnly={!editingAddress}
                />

                <input
                  className=" profile-input form-control mb-2"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  readOnly={!editingAddress}
                />

                <input
                  className=" profile-input form-control mb-2"
                  name="pincode"
                  value={formData.pincode}
                  onChange={handleChange}
                  readOnly={!editingAddress}
                />
              </>
            )}

            {/* PASSWORD TAB */}
            {activeTab === "password" && (
              <>
                <h4>Change Password</h4>

                {/* Old Password */}
                <div className="input-group mb-3">
                  <input
                    type={showOldPassword ? "text" : "password"}
                    className="form-control profile-input"
                    placeholder="Current Password"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                  />

                  <span
                    className="input-group-text cursor-pointer"
                    onClick={() => setShowOldPassword(!showOldPassword)}
                    style={{ cursor: "pointer" }}
                  >
                    <i className={`bi ${showOldPassword ? "bi-eye-slash" : "bi-eye"}`}></i>
                  </span>
                </div>

                {/* New Password */}
                <div className="input-group mb-3">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    className="form-control profile-input"
                    placeholder="New Password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />

                  <span
                    className="input-group-text cursor-pointer"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    style={{ cursor: "pointer" }}
                  >
                    <i className={`bi ${showNewPassword ? "bi-eye-slash" : "bi-eye"}`}></i>
                  </span>
                </div>

                {/* Button */}
                <button
                  className="btn btn-success px-4"
                  onClick={handleChangePassword}
                  disabled={loadingPassword}
                >
                  {loadingPassword ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Changing...
                    </>
                  ) : (
                    "Change Password"
                  )}
                </button>
              </>
            )}



            {/* ================= SAVE LOADING SPINNER ================= */}
            {saving && (
              <div className="mt-3">
                <div className="spinner-border text-primary"></div>
              </div>
            )}

          </div>
        </div>
      </div>
    </>
  );
};

export default MyProfile;
