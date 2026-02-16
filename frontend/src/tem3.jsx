import React, { useState, useEffect } from "react";
import axiosInstance from "../axios_instance";
import { toast } from "react-toastify";
import "../assets/styles/profile.css";

const MyProfile = () => {
  const [activeTab, setActiveTab] = useState("profile");
  const [editingProfile, setEditingProfile] = useState(false);
  const [editingAddress, setEditingAddress] = useState(false);
  const [loading, setLoading] = useState(true);

  const [user, setUser] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    gender: "",
    street: "",
    city: "",
    state: "",
    pincode: ""
  });

  // ================= LOAD USER =================
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await axiosInstance.get("/api/myprofile", {
          withCredentials: true
        });

        setUser(data.user);

        setFormData({
          name: data.user.name || "",
          phone: data.user.phone || "",
          gender: data.user.gender || "",
          street: data.user.address?.street || "",
          city: data.user.address?.city || "",
          state: data.user.address?.state || "",
          pincode: data.user.address?.pincode || ""
        });

        setLoading(false);
      } catch (error) {
        toast.error("Failed to load profile");
      }
    };

    fetchProfile();
  }, []);

  // ================= HANDLE CHANGE =================
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ================= SAVE PROFILE =================
  const saveProfile = async () => {
    try {
      const { data } = await axiosInstance.put(
        "/api/update-profile",
        formData,
        { withCredentials: true }
      );

      toast.success(data.message);
      setEditingProfile(false);
      setEditingAddress(false);
      setUser(data.user);
    } catch (error) {
      toast.error(error.response?.data?.message || "Update failed");
    }
  };

  if (loading) return <h3 className="text-center mt-5">Loading...</h3>;

  return (
    <div className="container my-5">
      {/* ================= TOP USER INFO ================= */}
      <div className="d-flex align-items-center mb-4">
        <img
          src="https://cdn-icons-png.flaticon.com/512/149/149071.png"
          width="80"
          alt="user"
        />
        <div className="ms-3">
          <h2 className="text-primary">Welcome</h2>
          <h5>{user.name}</h5>
        </div>
      </div>

      <div className="row">
        {/* ================= SIDEBAR ================= */}
        <div className="col-md-3">
          <div className="card p-3">
            <h5 className="text-center mb-3">Account Settings</h5>
            <hr />

            <button
              className={`btn mb-2 ${activeTab === "profile" ? "btn-primary" : "btn-light"}`}
              onClick={() => setActiveTab("profile")}
            >
              <i className="bi bi-person me-2"></i> 
              Profile Information
            </button>

            <button
              className={`btn mb-2 ${activeTab === "address" ? "btn-primary" : "btn-light"}`}
              onClick={() => setActiveTab("address")}
            >
            <i className="bi bi-geo-alt me-2"></i>
             Your Address
            </button>

            <button
              className={`btn mb-2 ${activeTab === "password" ? "btn-primary" : "btn-light"}`}
              onClick={() => setActiveTab("password")}
            >
              <i className="bi bi-lock me-2"></i>
              Change Password
            </button>

            <hr />

            <button className="btn btn-light mb-2"> <i className="bi bi-bag me-2"></i>
              My Orders
            </button>

            <button className="btn btn-light mb-2"> <i className="bi bi-cart me-2"></i>
              My Cart
            </button>

            <button className="btn btn-danger"> <i className="bi bi-trash me-2"></i>
              Delete My Account
            </button>
          </div>
        </div>

        {/* ================= CONTENT ================= */}
        <div className="col-md-9">

          {/* ================= PROFILE TAB ================= */}
          {activeTab === "profile" && (
            <>
              <h4>
                Profile Information{" "}
                <span
                  className="text-primary cursor-pointer"
                  style={{ cursor: "pointer" }}
                  onClick={() =>
                    editingProfile ? saveProfile() : setEditingProfile(true)
                  }
                >
                  {editingProfile ? "Save" : "Edit"}
                </span>
              </h4>

              <div className="mb-3">
                <label>Name</label>
                <input
                  type="text"
                  className="form-control"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  readOnly={!editingProfile}
                />
              </div>

              <div className="mb-3">
                <label>Email</label>
                <input
                  type="email"
                  className="form-control"
                  value={user.email}
                  readOnly
                />
              </div>

              <div className="mb-3">
                <label>Mobile</label>
                <input
                  type="text"
                  className="form-control"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  readOnly={!editingProfile}
                />
              </div>

              <div className="mb-3">
                <label>Gender</label><br />
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

          {/* ================= ADDRESS TAB ================= */}
          {activeTab === "address" && (
            <>
              <h4>
                Your Address{" "}
                <span
                  style={{ cursor: "pointer" }}
                  className="text-primary"
                  onClick={() =>
                    editingAddress ? saveProfile() : setEditingAddress(true)
                  }
                >
                  {editingAddress ? "Save" : "Edit"}
                </span>
              </h4>

              <div className="mb-3">
                <label>Street</label>
                <input
                  type="text"
                  className="form-control"
                  name="street"
                  value={formData.street}
                  onChange={handleChange}
                  readOnly={!editingAddress}
                />
              </div>

              <div className="mb-3">
                <label>City</label>
                <input
                  type="text"
                  className="form-control"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  readOnly={!editingAddress}
                />
              </div>

              <div className="mb-3">
                <label>State</label>
                <input
                  type="text"
                  className="form-control"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  readOnly={!editingAddress}
                />
              </div>

              <div className="mb-3">
                <label>Pincode</label>
                <input
                  type="text"
                  className="form-control"
                  name="pincode"
                  value={formData.pincode}
                  onChange={handleChange}
                  readOnly={!editingAddress}
                />
              </div>
            </>
          )}

          {/* ================= PASSWORD TAB ================= */}
          {activeTab === "password" && (
            <>
              <h4>Change Password</h4>
              <div className="mb-3">
                <label>Current Password</label>
                <input type="password" className="form-control" />
              </div>

              <div className="mb-3">
                <label>New Password</label>
                <input type="password" className="form-control" />
              </div>

              <button className="btn btn-success">
                Change Password
              </button>
            </>
          )}

        </div>
      </div>
    </div>
  );
};

export default MyProfile;
