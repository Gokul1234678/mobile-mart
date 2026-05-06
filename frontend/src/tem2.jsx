import React, { useEffect, useState } from "react";

import axiosInstance from "../../axios_instance";
import { toast } from "react-toastify";
import { useParams, useNavigate } from "react-router-dom";
const AdminUserDetails = () => {

    const navigate = useNavigate();
    const { id } = useParams();

    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(false);

    // ==========================================
    // 📦 FETCH SINGLE USER
    // ==========================================
    const fetchUser = async () => {

        try {

            setLoading(true);

            const { data } = await axiosInstance.get(
                `/api/admin/users/${id}`,
                {
                    withCredentials: true
                }
            );

            setUser(data.user);

        } catch (err) {
            toast.error(
                err.response?.data?.message || "Failed to load user"
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUser();
    }, [id]);

    // ==========================================
    // ⏳ LOADING
    // ==========================================
    if (loading) {
        return (
            <div className="container mt-4">
                <h4>Loading...</h4>
            </div>
        );
    }

    // ==========================================
    // ❌ USER NOT FOUND
    // ==========================================
    if (!user) {
        return (
            <div className="container mt-4">
                <h4>User not found</h4>
            </div>
        );
    }

    return (
        <div className="container mt-4">
            <button
                className="btn btn-dark mb-3"
                onClick={() => navigate(-1)}
            >
                ← Back to Users
            </button>
            <h2>User Details</h2>

            {/* ================= USER INFO ================= */}
            <div className="card p-3 mb-3">

                <h5 className="mb-3">Basic Information</h5>

                <p>
                    <strong>User ID:</strong> {user._id}
                </p>

                <p>
                    <strong>Name:</strong> {user.name}
                </p>

                <p>
                    <strong>Email:</strong> {user.email}
                </p>

                <p>
                    <strong>Phone:</strong> {user.phone}
                </p>

                <p>
                    <strong>Gender:</strong> {user.gender}
                </p>

                <p>
                    <strong>Role:</strong>{" "}
                    <span
                        style={{
                            color:
                                user.role === "admin"
                                    ? "green"
                                    : "black",
                            fontWeight: "bold"
                        }}
                    >
                        {user.role}
                    </span>
                </p>

            </div>

            {/* ================= ADDRESS ================= */}
            <div className="card p-3">

                <h5 className="mb-3">Address Information</h5>

                <p>
                    <strong>Street:</strong>{" "}
                    {user.address?.street || "N/A"}
                </p>

                <p>
                    <strong>City:</strong>{" "}
                    {user.address?.city || "N/A"}
                </p>

                <p>
                    <strong>State:</strong>{" "}
                    {user.address?.state || "N/A"}
                </p>

                <p>
                    <strong>Pincode:</strong>{" "}
                    {user.address?.pincode || "N/A"}
                </p>

            </div>

        </div>
    );
};

// export default AdminUserDetails;