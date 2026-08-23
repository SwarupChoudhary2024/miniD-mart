import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../Services/api";
import "../css/Register.css";

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");
    setLoading(true);

    try {
      const response = await api.post(
        "/auth/register",
        formData
      );

      console.log(
        "Registration response:",
        response.data
      );

      setMessage(
        "Account created successfully! Redirecting to login..."
      );

      setTimeout(() => {
        navigate("/login");
      }, 1500);

    } catch (err) {

      console.error(
        "Full Registration Error:",
        err
      );

      if (err.response) {

        const data =
          err.response.data;

        if (typeof data === "string") {

          setError(data);

        } else if (data?.message) {

          setError(data.message);

        } else if (data?.errors) {

          const fieldErrors =
            Object.values(
              data.errors
            ).join(", ");

          setError(
            fieldErrors ||
            "Validation failed"
          );

        } else {

          setError(
            "Registration failed. Please check your details."
          );

        }

      } else {

        setError(
          "Network error. Please check your connection."
        );

      }

    } finally {

      setLoading(false);

    }
  };

  return (
    <div className="register-page">

      {/* LEFT SIDE */}

      <div className="register-banner">

        <div className="brand">

          <div className="brand-logo">
            🛒
          </div>

          <h2>
            Mini D-Mart
          </h2>

        </div>

        <div className="banner-content">

          <span className="banner-tag">
            SMART SHOPPING
          </span>

          <h1>
            Everything you need,
            <br />
            delivered with ease.
          </h1>

          <p>
            Create your account and enjoy
            a faster and easier shopping
            experience.
          </p>

          <div className="benefits">

            <div className="benefit-item">
              <span>✓</span>
              <p>Fresh daily essentials</p>
            </div>

            <div className="benefit-item">
              <span>✓</span>
              <p>Easy and secure shopping</p>
            </div>

            <div className="benefit-item">
              <span>✓</span>
              <p>Manage your orders easily</p>
            </div>

          </div>

        </div>

        <div className="banner-decoration decoration-one"></div>
        <div className="banner-decoration decoration-two"></div>

      </div>


      {/* RIGHT SIDE */}

      <div className="register-form-section">

        <div className="register-form-wrapper">

          <div className="mobile-brand">

            <div className="mobile-logo">
              🛒
            </div>

            <span>
              Mini D-Mart
            </span>

          </div>

          <div className="form-heading">

            <span className="form-badge">
              CREATE ACCOUNT
            </span>

            <h1>
              Join Mini D-Mart
            </h1>

            <p>
              Create your account and start shopping.
            </p>

          </div>


          {message && (

            <div className="alert-success">

              <span>
                ✓
              </span>

              {message}

            </div>

          )}


          {error && (

            <div className="alert-error">

              <span>
                !
              </span>

              {error}

            </div>

          )}


          <form
            onSubmit={handleSubmit}
            className="register-form"
          >

            {/* FULL NAME */}

            <div className="form-group">

              <label>
                Full Name
              </label>

              <div className="input-wrapper">

                <span className="input-icon">
                  👤
                </span>

                <input
                  type="text"
                  name="name"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />

              </div>

            </div>


            {/* EMAIL */}

            <div className="form-group">

              <label>
                Email Address
              </label>

              <div className="input-wrapper">

                <span className="input-icon">
                  ✉️
                </span>

                <input
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />

              </div>

            </div>


            {/* PHONE */}

            <div className="form-group">

              <label>
                Phone Number
                <span className="optional">
                  Optional
                </span>
              </label>

              <div className="input-wrapper">

                <span className="input-icon">
                  📱
                </span>

                <input
                  type="tel"
                  name="phone"
                  placeholder="Enter your phone number"
                  value={formData.phone}
                  onChange={handleChange}
                />

              </div>

            </div>


            {/* PASSWORD */}

            <div className="form-group">

              <label>
                Password
              </label>

              <div className="input-wrapper">

                <span className="input-icon">
                  🔒
                </span>

                <input
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  name="password"
                  placeholder="Create a strong password"
                  value={formData.password}
                  onChange={handleChange}
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
                >
                  {showPassword
                    ? "Hide"
                    : "Show"}
                </button>

              </div>

            </div>


            {/* SUBMIT */}

            <button
              type="submit"
              disabled={loading}
              className="register-submit-btn"
            >

              {loading ? (

                <>
                  <span className="spinner"></span>
                  Creating Account...
                </>

              ) : (

                <>
                  Create Account
                  <span className="arrow">
                    →
                  </span>
                </>

              )}

            </button>

          </form>


          <div className="login-link">

            <span>
              Already have an account?
            </span>

            <Link to="/login">
              Login
            </Link>

          </div>

        </div>

      </div>

    </div>
  );
}

export default Register;