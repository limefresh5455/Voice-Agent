import React from "react";
import { useNavigate } from "react-router-dom";
import "./WelcomePage.css";

const WelcomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="welcome-container">
      <div className="welcome-card">
        <h1 className="welcome-title">Welcome</h1>
        <p className="welcome-subtitle">Choose a login option to continue</p>

        <div className="button-group">
          <button
            className="login-btn org-btn"
            onClick={() => navigate("/organization-login")}
          >
            Organization Login
          </button>

          <button
            className="login-btn admin-btn"
            onClick={() => navigate("/admin-login")}
          >
            Admin Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default WelcomePage;
