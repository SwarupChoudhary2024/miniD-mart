import { Link } from "react-router-dom";

function NotFound() {
    return (
        <div style={{ textAlign: "center", padding: "5rem 1rem", fontFamily: "sans-serif" }}>
            <h1 style={{ fontSize: "4rem", margin: "0 0 1rem 0", color: "#0284c7" }}>404</h1>
            <h2>Page Not Found</h2>
            <p style={{ color: "#64748b", marginBottom: "2rem" }}>
                The page you are looking for does not exist or has been moved.
            </p>
            <Link
                to="/"
                style={{
                    padding: "10px 20px",
                    backgroundColor: "#0284c7",
                    color: "#fff",
                    textDecoration: "none",
                    borderRadius: "4px"
                }}
            >
                Return to Home
            </Link>
        </div>
    );
}

export default NotFound;