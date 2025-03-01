import React, { useEffect, useState } from "react";
import { Outlet, Navigate } from "react-router-dom";
import { auth } from "./firebase"; // Import Firebase auth
import { onAuthStateChanged } from "firebase/auth";
import LoadingSpinner from "../components/Shared/LoadingSpinner"; // Optional loader

const SecureAuthRoutes = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listen for auth state changes
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false); // Stop loading once user state is determined
    });

    return () => unsubscribe(); // Cleanup on unmount
  }, []);

  if (loading) {
    return <LoadingSpinner />; // Show a loading spinner while checking auth state
  }

  return user ? <Outlet /> : <Navigate to="/admincet" replace />;
};

export default SecureAuthRoutes;
