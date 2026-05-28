import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import VideoLoader from "../components/VideoLoader";

const AdminRoute = ({ children }) => {

  const { user, loading } = useSelector((state) => state.user);

  // ⏳ WAIT until user is loaded
  if (loading) {
    return <VideoLoader loaderName="loading" fullscreen />
    
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