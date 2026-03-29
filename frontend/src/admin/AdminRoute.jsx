import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

const AdminRoute = ({ children }) => {

  const { user, loading } = useSelector((state) => state.user);

  // ⏳ WAIT until user is loaded
  if (loading) {
    return <h2>Loading...</h2>; // or your loader component
  }

  // ❌ Not logged in
  if (!user) {
    return <Navigate to="/login" />;
  }

  // ❌ Not admin
  if (user.role !== "admin") {
    return <Navigate to="/" />;
  }

  // ✅ Allow access
  return children;
};

export default AdminRoute;