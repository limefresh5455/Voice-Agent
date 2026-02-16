import React, { useState, useEffect } from "react";
import { FaEye, FaEyeSlash, FaArrowLeft } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "./OrganizationLogin.css";
import { signInValidation } from "../AuthValidations/AuthValidations";
import { signInSuperService } from "../AuthServices/AuthServices";
import { useAppContext } from "../../Context/AppContext";

const SuperAdminLogin = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const { setUser } = useAppContext();
  const [signInData, setSignInData] = useState({
    email: "",
    password: "",
  });
  const [Errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const storedUser = JSON.parse(sessionStorage.getItem("super_credentials"));

    if (storedUser?.access_token && storedUser?.role === "SuperAdmin") {
      navigate("/super-admin-dashboard", { replace: true });
    }
  }, [navigate]);

  const handleBackClick = () => {
    const storedSuper = sessionStorage.getItem("super_credentials");

    if (storedSuper) {
      sessionStorage.removeItem("super_credentials");
      setUser(null);
    }

    navigate("/", { replace: true });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSignInData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    const validation = signInValidation(signInData);
    setErrors(validation);

    if (Object.keys(validation).length === 0) {
      try {
        setIsLoading(true);

        const response = await signInSuperService(signInData);

        if (response.status === 200 || response.status === 201) {
          const Response = response.data;

          const loginResponse = {
            ...response.data,
            role: "SuperAdmin",
            loginFrom: "/super-admin-login",
          };

          sessionStorage.setItem(
            "super_credentials",
            JSON.stringify(loginResponse),
          );
          setUser(loginResponse);

          setTimeout(() => {
            if (loginResponse.role === "SuperAdmin")
              navigate("/super-admin-dashboard");
          }, 200);

          setSignInData({ email: "", password: "" });
        }
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="orgLogin-container">
      <div className="orgLogin-card">
        <h2 className="orgLogin-title">Super Admin Login</h2>
        <p className="orgLogin-subtitle">
          Welcome back! Please login to continue
        </p>

        <form onSubmit={handleLogin}>
          <div className="orgLogin-inputGroup">
            <label className="orgLogin-label">Email</label>
            <input
              className="orgLogin-input"
              name="email"
              type="email"
              placeholder="Enter your email"
              value={signInData.email}
              onChange={handleChange}
            />
            {Errors.email && <p className="error">{Errors.email}</p>}
          </div>

          <div className="orgLogin-inputGroup">
            <label className="orgLogin-label">Password</label>

            <div className="orgLogin-passwordWrapper">
              <input
                className="orgLogin-input"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={signInData.password}
                onChange={handleChange}
              />

              <span
                className="orgLogin-togglePassword"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FaEye /> : <FaEyeSlash />}
              </span>
            </div>
            {Errors.password && <p className="error">{Errors.password}</p>}
          </div>

          <button className="orgLogin-btn" type="submit" disabled={isLoading}>
            {isLoading ? "Signing In..." : "Login"}
          </button>

          <button
            type="button"
            className="orgLogin-backBtn"
            onClick={handleBackClick}
          >
            <FaArrowLeft className="orgLogin-backIcon" /> Back
          </button>
        </form>
      </div>
    </div>
  );
};

export default SuperAdminLogin;
