import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import "../css/Login.css";

function Login({ setUser }) {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Extract user ID from JWT
  const extractIdFromJwt = (token) => {
    try {
      const base64Url = token.split(".")[1];

      const base64 = base64Url
        .replace(/-/g, "+")
        .replace(/_/g, "/");

      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map(
            (c) =>
              "%" +
              ("00" + c.charCodeAt(0).toString(16)).slice(-2)
          )
          .join("")
      );

      const decoded = JSON.parse(jsonPayload);

      return (
        decoded.id ||
        decoded.userId ||
        decoded.sub
      );
    } catch {
      return null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await fetch(
        "http://localhost:8080/api/auth/login",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();

      console.log("LOGIN RESPONSE:", data);

      if (!response.ok) {
        throw new Error(
          data.message ||
            data.error ||
            "Invalid email or password"
        );
      }

      const token =
        data.token || data.jwt;

      if (!token) {
        throw new Error(
          "Token not received from server"
        );
      }

      const extractedUserId =
        data.id ||
        data.userId ||
        data.user?.id ||
        extractIdFromJwt(token);

      const backendRole =
        data.roles &&
        data.roles.length > 0
          ? data.roles[0]
          : "ROLE_CUSTOMER";

      const role = backendRole
        .replace("ROLE_", "")
        .toUpperCase();

      const loggedInUser = {
        id: extractedUserId,

        email:
          data.email ||
          formData.email,

        name:
          data.name ||
          formData.email.split("@")[0],

        role: role,

        roles:
          data.roles || [],

        token: token,
      };

      // Clear old data
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      localStorage.removeItem("role");

      // Save login data
      localStorage.setItem(
        "user",
        JSON.stringify(loggedInUser)
      );

      localStorage.setItem(
        "token",
        token
      );

      localStorage.setItem(
        "role",
        role
      );

      console.log(
        "SAVED USER:",
        loggedInUser
      );

      // Update React state
      if (setUser) {
        setUser(loggedInUser);
      }

      // Notify other components
      window.dispatchEvent(
        new Event("authChange")
      );

      // Role based redirect
      if (role === "ADMIN") {
        navigate("/admin", {
          replace: true,
        });
      } else if (role === "STAFF") {
        navigate("/staff", {
          replace: true,
        });
      } else {
        navigate("/user", {
          replace: true,
        });
      }

    } catch (err) {
      console.error(
        "LOGIN ERROR:",
        err
      );

      setError(
        err.message ||
          "Login failed. Please try again."
      );

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">

      {/* Background decorations */}

      <div className="login-shape shape-one"></div>

      <div className="login-shape shape-two"></div>


      <div className="login-wrapper">

        {/* LEFT SIDE */}

        <div className="login-brand-section">

          <div className="brand-content">

            <Link
              to="/"
              className="login-logo"
            >
              <span>Mini</span>D-Mart
            </Link>

            <div className="brand-text">

              <span className="brand-badge">
                🛒 SMART SHOPPING
              </span>

              <h1>
                Everything you need,
                <br />
                <span>delivered simply.</span>
              </h1>

              <p>
                Shop groceries, daily essentials
                and more at great prices.
              </p>

            </div>


            <div className="brand-features">

              <div className="brand-feature">

                <div className="feature-icon">
                  ⚡
                </div>

                <div>
                  <h4>
                    Fast Shopping
                  </h4>

                  <p>
                    Shop your essentials quickly
                  </p>
                </div>

              </div>


              <div className="brand-feature">

                <div className="feature-icon">
                  🛍️
                </div>

                <div>
                  <h4>
                    Best Products
                  </h4>

                  <p>
                    Quality products at great prices
                  </p>
                </div>

              </div>


              <div className="brand-feature">

                <div className="feature-icon">
                  🔒
                </div>

                <div>
                  <h4>
                    Secure Account
                  </h4>

                  <p>
                    Your information stays protected
                  </p>
                </div>

              </div>

            </div>

          </div>

        </div>


        {/* RIGHT SIDE */}

        <div className="login-form-section">

          <div className="login-form-container">

            <div className="mobile-login-logo">
              <Link to="/">
                <span>Mini</span>D-Mart
              </Link>
            </div>


            <div className="login-heading">

              <span className="welcome-icon">
                👋
              </span>

              <h2>
                Welcome back!
              </h2>

              <p>
                Enter your details to access
                your account.
              </p>

            </div>


            {error && (

              <div className="login-error">

                <span>
                  ⚠️
                </span>

                <p>
                  {error}
                </p>

              </div>

            )}


            <form
              onSubmit={handleSubmit}
              className="login-form"
            >

              {/* EMAIL */}

              <div className="login-input-group">

                <label htmlFor="email">
                  Email Address
                </label>

                <div className="input-wrapper">

                  <span className="input-icon">
                    ✉
                  </span>

                  <input
                    id="email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                    autoComplete="email"
                    required
                  />

                </div>

              </div>


              {/* PASSWORD */}

              <div className="login-input-group">

                <label htmlFor="password">
                  Password
                </label>

                <div className="input-wrapper">

                  <span className="input-icon">
                    🔒
                  </span>

                  <input
                    id="password"
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    required
                  />

                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() =>
                      setShowPassword(
                        !showPassword
                      )
                    }
                    aria-label="Toggle password visibility"
                  >
                    {showPassword
                      ? "🙈"
                      : "👁"}
                  </button>

                </div>

              </div>


              {/* OPTIONS */}

              <div className="login-options">

                <label className="remember-me">

                  <input type="checkbox" />

                  <span>
                    Remember me
                  </span>

                </label>

              </div>


              {/* LOGIN BUTTON */}

              <button
                type="submit"
                disabled={loading}
                className="login-submit-btn"
              >

                {loading ? (

                  <>
                    <span className="login-spinner"></span>

                    Logging in...
                  </>

                ) : (

                  <>
                    Login to Account

                    <span>
                      →
                    </span>
                  </>

                )}

              </button>

            </form>


            <div className="login-divider">

              <span>
                New to Mini D-Mart?
              </span>

            </div>


            <p className="auth-redirect">

              Don't have an account?

              <Link to="/register">
                Create Account →
              </Link>

            </p>


            <p className="login-footer-text">

              By continuing, you agree to
              our Terms & Privacy Policy.

            </p>

          </div>

        </div>

      </div>

    </div>
  );
}

export default Login;