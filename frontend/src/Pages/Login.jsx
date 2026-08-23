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

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Helper to extract user ID from JWT token payload if missing from backend response body
  const extractIdFromJwt = (token) => {
    try {
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      );
      const decoded = JSON.parse(jsonPayload);
      return decoded.id || decoded.userId || decoded.sub;
    } catch {
      return null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await fetch("http://localhost:8080/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      console.log("LOGIN RESPONSE:", data);

      if (!response.ok) {
        throw new Error(
          data.message || data.error || "Invalid email or password"
        );
      }

      const token = data.token || data.jwt;

      if (!token) {
        throw new Error("Token not received from server");
      }

      // Extract User ID safely across different backend response structures or JWT payload
      const extractedUserId =
        data.id ||
        data.userId ||
        data.user?.id ||
        extractIdFromJwt(token);

      // Get first role
      const backendRole =
        data.roles && data.roles.length > 0
          ? data.roles[0]
          : "ROLE_CUSTOMER";

      const role = backendRole.replace("ROLE_", "").toUpperCase();

      console.log("BACKEND ROLE:", backendRole);
      console.log("DETECTED ROLE:", role);
      console.log("EXTRACTED USER ID:", extractedUserId);

      // Create complete frontend user object
      const loggedInUser = {
        id: extractedUserId,
        email: data.email || formData.email,
        name: data.name || formData.email.split("@")[0],
        role: role,
        roles: data.roles || [],
        token: token,
      };

      // Clear old login information
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      localStorage.removeItem("role");

      // Save new session data
      localStorage.setItem("user", JSON.stringify(loggedInUser));
      localStorage.setItem("token", token);
      localStorage.setItem("role", role);

      console.log("SAVED USER:", loggedInUser);

      // Update React state
      if (setUser) {
        setUser(loggedInUser);
      }

      // Notify Header / other components
      window.dispatchEvent(new Event("authChange"));

      // Redirect based on role
      if (role === "ADMIN") {
        navigate("/admin", { replace: true });
      } else if (role === "STAFF") {
        navigate("/staff", { replace: true });
      } else {
        navigate("/user", { replace: true });
      }
    } catch (err) {
      console.error("LOGIN ERROR:", err);
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>Welcome Back</h2>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter email"
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter password"
              required
            />
          </div>

          <button type="submit" disabled={loading} className="submit-btn">
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="auth-redirect">
          Don't have an account? <Link to="/register">Register</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;