import React from "react";
import { Link, useLocation } from "react-router-dom";
import "../css/OrderSuccess.css";

function OrderSuccess() {
  const location = useLocation();
  const order = location.state?.order;

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

        {order && (
          <p className="success-message">
            Order <strong>#{order.id}</strong> &middot; Total{" "}
            <strong>
              ₹{Number(order.totalAmount || 0).toFixed(2)}
            </strong>{" "}
            &middot;{" "}
            {order.orderType === "PICKUP"
              ? `Pickup: ${order.pickupSlot}`
              : "Home delivery"}
          </p>
        )}

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
              Our team will prepare your order. You can follow
              its progress anytime in My Orders.
            </p>
          </div>
        </div>

        {/* Action Buttons */}

        <div className="success-actions">
          <Link
            to="/products"
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
            to="/orders"
            className="browse-products-btn"
          >
            View My Orders
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