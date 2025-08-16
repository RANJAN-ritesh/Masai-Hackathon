import React, { useContext } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { MyContext } from "../context/AuthContextProvider";

function ProtectedRoute({ children }) {
  const { isAuth, loading } = useContext(MyContext);
  const location = useLocation();

  // Display a loading message while authentication is in progress
  if (loading) {
    return <p>Loading...</p>;
  }

  // If not authenticated, redirect to login
  if (!isAuth) {
    // console.log("redirecting to login for ",location)
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  //   console.log("current state ",isAuth, children)

  // console.log(
  //   "ProtectedRoute: isAuth =",
  //   isAuth,
  //   ", Loading =",
  //   loading,
  //   ", Current Path =",
  //   location.pathname
  // );

  return children;
}

export default ProtectedRoute;
