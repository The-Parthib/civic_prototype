import React from "react";
import { Link } from "react-router-dom";

const Landing = () => {
  return (
    <div className="landing-page">
      <h1>Welcome to Civic</h1>
      <div className="auth-links text-blue-500">
        <Link to="/login">Login</Link>
        <Link to="/register">Register</Link>
      </div>
    </div>
  );
};

export default Landing;
