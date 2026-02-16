import React, { useState, useEffect } from "react";
import axiosInstance from "../axios_instance";
import { toast } from "react-toastify";
import "../assets/styles/profile.css";
const MyProfile = () => {
  const [activeTab, setActiveTab] = useState("profile");
  const [loadingSave, setLoadingSave] = useState(false);
  const [user, setUser] = useState(null);
  const [editProfile, setEditProfile] = useState(false);
  const [editAddress, setEditAddress] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await axiosInstance.get("/api/myprofile", {
        withCredentials: true,
      });
      setUser(res.data.user);
    } catch (err) {
      toast.error("Failed to load profile");
    }
  };

  const saveProfile = async () => {
    try {
      setLoadingSave(true);

      await axiosInstance.put(
        "/api/update-profile",
        {
          name: user.name,
          phone: user.phone,
          gender: user.gender,
        },
        { withCredentials: true }
      );

      toast.success("Profile Updated!");
      setEditProfile(false);
    } catch (err) {
      toast.error("Update failed");
    } finally {
      setLoadingSave(false);
    }
  };

  if (!user) return <div className="text-center mt-5">Loading...</div>;

  return (
    <div className="container my-4">

      {/* Mobile Menu Button */}
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

        {/* Sidebar Desktop */}
        <div className="col-md-3 d-none d-md-block">
          <div className="list-group">
            <button
              className={`list-group-item sidebar-btn ${activeTab === "profile" ? "active" : ""}`}
              onClick={() => setActiveTab("profile")}
            >
              <i className="bi bi-person me-2"></i> Profile Information
            </button>

            <button
              className={`list-group-item sidebar-btn ${activeTab === "address" ? "active" : ""}`}
              onClick={() => setActiveTab("address")}
            >
              <i className="bi bi-geo-alt me-2"></i> Your Address
            </button>

            <button
              className={`list-group-item sidebar-btn ${activeTab === "password" ? "active" : ""}`}
              onClick={() => setActiveTab("password")}
            >
              <i className="bi bi-lock me-2"></i> Change Password
            </button>

            <button className="list-group-item">
              <i className="bi bi-bag me-2"></i> My Orders
            </button>

            <button className="list-group-item">
              <i className="bi bi-cart me-2"></i> My Cart
            </button>

            <button className="list-group-item text-danger">
              <i className="bi bi-trash me-2"></i> Delete Account
            </button>
          </div>
        </div>

        {/* Offcanvas Mobile */}
        <div className="offcanvas offcanvas-start" id="profileMenu">
          <div className="offcanvas-header">
            <h5>Menu</h5>
            <button className="btn-close" data-bs-dismiss="offcanvas"></button>
          </div>
          <div className="offcanvas-body">
            <button className="btn sidebar-btn" onClick={() => setActiveTab("profile")}>
              <i className="bi bi-person me-2"></i> Profile Information
            </button>
            <button className="btn sidebar-btn" onClick={() => setActiveTab("address")}>
              <i className="bi bi-geo-alt me-2"></i> Your Address
            </button>
            <button className="btn sidebar-btn" onClick={() => setActiveTab("password")}>
              <i className="bi bi-lock me-2"></i> Change Password
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="col-md-9 tab-content-wrapper fade-slide">

          {activeTab === "profile" && (
            <div>
              <h4>
                Profile Information{" "}
                <button
                  className="btn btn-link"
                  onClick={() =>
                    editProfile ? saveProfile() : setEditProfile(true)
                  }
                >
                  {editProfile ? "Save" : "Edit"}
                </button>
              </h4>

              <input
                className="form-control mb-2"
                value={user.name}
                disabled={!editProfile}
                onChange={(e) =>
                  setUser({ ...user, name: e.target.value })
                }
              />

              <input
                className="form-control mb-2"
                value={user.email}
                disabled
              />

              <input
                className="form-control mb-2"
                value={user.phone}
                disabled={!editProfile}
                onChange={(e) =>
                  setUser({ ...user, phone: e.target.value })
                }
              />

              {/* Gender */}
              <div>
                <label>
                  <input
                    type="radio"
                    value="male"
                    checked={user.gender === "male"}
                    disabled={!editProfile}
                    onChange={(e) =>
                      setUser({ ...user, gender: e.target.value })
                    }
                  /> Male
                </label>

                <label className="ms-3">
                  <input
                    type="radio"
                    value="female"
                    checked={user.gender === "female"}
                    disabled={!editProfile}
                    onChange={(e) =>
                      setUser({ ...user, gender: e.target.value })
                    }
                  /> Female
                </label>
              </div>

              {/* Spinner */}
              {loadingSave && (
                <div className="mt-3">
                  <div className="spinner-border text-primary"></div>
                </div>
              )}
            </div>
          )}

          {activeTab === "address" && (
            <div>
              <h4>Your Address</h4>
              <input
                className="form-control mb-2"
                value={user.address?.street || ""}
                disabled
              />
            </div>
          )}

          {activeTab === "password" && (
            <div>
              <h4>Change Password</h4>
              <input
                type="password"
                className="form-control mb-2"
                placeholder="Current Password"
              />
              <input
                type="password"
                className="form-control mb-2"
                placeholder="New Password"
              />
              <button className="btn btn-success">
                Change Password
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default MyProfile;
