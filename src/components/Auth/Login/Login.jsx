import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { signInValidation } from "../AuthValidations/AuthValidations";
import { useAppContext } from "../../Context/AppContext";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { signInServices } from "../AuthServices/AuthServices";

const Login = () => {
  const navigate = useNavigate();
  const [signInData, setSignInData] = useState({
    email: "",
    password: "",
    role: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const { user, setUser } = useAppContext();
  const [signInLoading, setSignInLoading] = useState(false);
  const [signInError, setSignInError] = useState("");
  const [signInMessage, setSignInMessage] = useState("");
  const [Errors, setErrors] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const handleChange = (e) => {
    const { name, value } = e.target;
    setSignInData((prev) => ({ ...prev, [name]: value }));
  };
  useEffect(() => {
    if (user) {
      const token = user?.access_token;
      const role = user?.role;
      if (token && role) {
        if (role === "SuperAdmin") {
          navigate("/super-admin-dashboard");
        } else if (role === "admin") {
          navigate("/admin-dashboard");
        } else if (role === "user") {
          navigate("/user-dashboard");
        }
      }
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const validation = signInValidation(signInData);
      setErrors(validation);
      if (Object.keys(validation).length === 0) {
        setIsLoading(true);
        const loginData = {
          email: signInData.email,
          password: signInData.password,
          role: signInData.role,
        };
        const response = await signInServices(loginData);
        if (response.status === 200 || response.status === 201) {
          const loginResponse = response.data;
          console.log(loginResponse, "loginResponse");
          sessionStorage.setItem("credentials", JSON.stringify(loginResponse));
          setUser(loginResponse);
          setTimeout(() => {
            if (loginResponse.role === "SuperAdmin") {
              navigate("/super-admin-dashboard");
            } else if (loginResponse.role === "admin") {
              navigate("/admin-dashboard");
            } else if (loginResponse.role == "user") {
              navigate("/user-dashboard");
            }
          }, 100);
          setSignInData({ email: "", password: "" });
        }
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="signin-page">
      <div className="container">
        <form onSubmit={handleLogin} className="login_form">
          <h1>Sign in</h1>
          <span>or use your account</span>
          <input
            type="text"
            name="email"
            placeholder="Enter your email"
            value={signInData.email}
            onChange={handleChange}
          />
          {Errors.email && <p className="error">{Errors.email}</p>}

          <div className="password-wrapper">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              value={signInData.password}
              onChange={handleChange}
            />
            <span
              className="toggle-eye"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FaEye /> : <FaEyeSlash />}
            </span>
          </div>
          {Errors.password && <p className="error">{Errors.password}</p>}
          <button disabled={signInLoading}>
            {isLoading ? "Signing In..." : "Sign In"}
          </button>
          {signInError && <p className="error">{signInError}</p>}
          {signInMessage && <p className="success">{signInMessage}</p>}
        </form>
      </div>
    </div>
  );
};

export default Login;
