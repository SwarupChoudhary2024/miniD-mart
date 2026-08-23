import React from "react";
import { Link } from "react-router-dom";
import "../css/Footer.css";

function Footer() {
  return (
    <footer className="main-footer">
      <div className="footer-grid">
        {/* Company Info */}
        <div className="footer-col">
          <h2 className="footer-brand">Mini D-Mart</h2>
          <p>Your everyday grocery shopping destination.</p>
        </div>

        {/* Quick Links */}
        <div className="footer-col">
          <h3>Quick Links</h3>
          <Link to="/">Home</Link>
          <Link to="/products">Products</Link>
          <Link to="/cart">Cart</Link>
          <Link to="/login">Login</Link>
          <Link to="/register">Register</Link>
        </div>

        {/* Customer Service */}
        <div className="footer-col">
          <h3>Customer Service</h3>
          <p>Contact Us</p>
          <p>FAQs</p>
          <p>Privacy Policy</p>
          <p>Terms & Conditions</p>
        </div>
      </div>

      <div className="copyright">
        © 2026 Mini D-Mart. All rights reserved.
      </div>
    </footer>
  );
}

export default Footer;