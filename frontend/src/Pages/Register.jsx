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
            const response = await api.post("/auth/register", formData);

            setMessage("Registration successful! Redirecting to login...");
            console.log("Registration response:", response.data);

            setTimeout(() => {
                navigate("/login");
            }, 1500);
        } catch (err) {
            console.error("Full Registration Error:", err);

            if (err.response) {
                const data = err.response.data;

                if (typeof data === "string") {
                    setError(data);
                } else if (data?.message) {
                    setError(data.message);
                } else if (data?.errors) {
                    const fieldErrors = Object.values(data.errors).join(", ");
                    setError(fieldErrors || "Validation failed");
                } else {
                    setError("Bad Request (400): Please check your input fields.");
                }
            } else {
                setError("Network error or server is unreachable.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h1>Create Account</h1>
                <p>Join Mini D-Mart</p>

                {message && <div className="alert-success">{message}</div>}
                {error && <div className="alert-error">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <input
                            type="text"
                            name="name"
                            placeholder="Full Name"
                            value={formData.name}
                            onChange={handleChange}
                            className="form-input"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <input
                            type="email"
                            name="email"
                            placeholder="Email Address"
                            value={formData.email}
                            onChange={handleChange}
                            className="form-input"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <input
                            type="password"
                            name="password"
                            placeholder="Password"
                            value={formData.password}
                            onChange={handleChange}
                            className="form-input"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <input
                            type="tel"
                            name="phone"
                            placeholder="Phone Number"
                            value={formData.phone}
                            onChange={handleChange}
                            className="form-input"
                        />
                    </div>

                    <button type="submit" disabled={loading} className="submit-btn">
                        {loading ? "Creating Account..." : "Create Account"}
                    </button>
                </form>

                <p className="auth-redirect">
                    Already have an account? <Link to="/login">Login</Link>
                </p>
            </div>
        </div>
    );
}

export default Register;