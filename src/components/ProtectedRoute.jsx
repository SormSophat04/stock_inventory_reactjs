import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";

export default function ProtectedRoute({role, children }) {
  const { user, loading } = useContext(AuthContext);
  const userRole = user?.role;


  if (loading) {
    // You might want to show a spinner here
    return <p>Loading...</p>;
  }

  if (!user) {
    // Redirect them to the /login page, but if they're already there, don't do anything.
    return <Navigate to="/" />;
  }

  if (role && role !== userRole) {
    return <Navigate to="/403" />;
  }

  return children;
}
