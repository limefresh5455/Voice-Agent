import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signUpValidation } from "../AuthValidations/AuthValidations";
import "./SignUp.css";
const SignUp = () => {
  const navigate = useNavigate();
  const BASE_URL = import.meta.env.VITE_BASE_URL;

  const [signUpData, setSignUpData] = useState({
    username: "",
    email: "",
    password: "",
  });

  const [signUpLoading, setSignUpLoading] = useState(false);
  const [signUpError, setSignUpError] = useState("");
  const [signUpMessage, setSignUpMessage] = useState("");
  const [Errors, setErrors] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSignUpData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    try {
      const validation = signUpValidation(signUpData);
      setErrors(validation);
      if (Object.keys(validation).length === 0) {
        setIsLoading(true);
        const signUpData = {
          username: signUpData.username,
          email: signUpData.email,
          password: signUpData.password,
        };
        const response = await signUpService(signUpData);
        if (response.status === 200 || response.status === 201) {
          console.log(response.data, "check res");
          return false;
          sessionStorage.setItem("user_details", JSON.stringify(response.data));

          setSignUpData({ username: "", email: "", password: "" });
        }
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="signup-page">
      <div className="container">
        <form onSubmit={handleSignUp} className="login_form">
          <h1>Create Account</h1>
          <span>or use your email for registration</span>
          <input
            type="text"
            name="username"
            placeholder="Username"
            value={signUpData.username}
            onChange={handleChange}
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={signUpData.email}
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={signUpData.password}
            onChange={handleChange}
            required
          />
          <p>
            Already have an account?{" "}
            <Link to="/" className="signin">
              Sign In
            </Link>
          </p>
          <button disabled={signUpLoading}>
            {isLoading ? "Signing Up..." : "Sign Up"}
          </button>
          {signUpError && <p className="error">{signUpError}</p>}
          {signUpMessage && <p className="success">{signUpMessage}</p>}
        </form>
      </div>
    </div>
  );
};

export default SignUp;
