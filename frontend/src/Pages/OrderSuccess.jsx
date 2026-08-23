import React from "react";
import { Link } from "react-router-dom";
import "../css/OrderSuccess.css";

function OrderSuccess() {
  return (
    <div className="order-success-page">
      <div className="success-background-shape shape-one"></div>
      <div className="success-background-shape shape-two"></div>

      <main className="order-success-card">
        {/* Success Icon */}

        <div className="success-icon-wrapper">
          <div className="success-icon">
            ✓
          </div>
        </div>

        {/* Content */}

        <span className="success-badge">
          ORDER CONFIRMED
        </span>

        <h1>
          Your order has been placed!
        </h1>

        <p className="success-message">
          Thank you for shopping with{" "}
          <strong>Mini D-Mart</strong>.
          We've received your order and will start
          processing it shortly.
        </p>

        {/* Order Information */}

        <div className="success-info-box">
          <div className="info-icon">
            📦
          </div>

          <div className="info-content">
            <h3>
              What happens next?
            </h3>

            <p>
              Your order confirmation and invoice
              will be sent to your registered email.
            </p>
          </div>
        </div>

        {/* Action Buttons */}

        <div className="success-actions">
          <Link
            to="/user"
            className="continue-shopping-btn"
          >
            <span>
              Continue Shopping
            </span>

            <span className="button-arrow">
              →
            </span>
          </Link>

          <Link
            to="/products"
            className="browse-products-btn"
          >
            Browse Products
          </Link>
        </div>

        {/* Footer */}

        <p className="success-footer">
          Thank you for choosing Mini D-Mart 🛒
        </p>
      </main>
    </div>
  );
}

export default OrderSuccess;