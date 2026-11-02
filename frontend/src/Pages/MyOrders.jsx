import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api, { getErrorMessage } from "../Services/api";
import "../css/MyOrders.css";

const STATUS_LABELS = {
  PENDING: "Pending",
  PREPARING: "Preparing",
  READY: "Ready",
  DISPATCHED: "Out for delivery",
  DELIVERED: "Delivered",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

const formatDate = (value) => {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? String(value)
    : date.toLocaleString("en-IN");
};

function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState(null);

  const loadOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const response = await api.get("/orders/my");
      setOrders(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      setError(getErrorMessage(err, "Unable to load your orders."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const cancelOrder = async (orderId) => {
    if (!window.confirm("Cancel this order?")) return;

    try {
      setBusyId(orderId);
      const response = await api.patch(`/orders/${orderId}/cancel`);
      setOrders((prev) =>
        prev.map((order) => (order.id === orderId ? response.data : order))
      );
    } catch (err) {
      alert(getErrorMessage(err, "Unable to cancel this order."));
    } finally {
      setBusyId(null);
    }
  };

  if (loading) {
    return <div className="myorders-page"><p className="myorders-info">Loading your orders...</p></div>;
  }

  return (
    <div className="myorders-page">
      <div className="myorders-header">
        <h1>My Orders</h1>
        <button type="button" onClick={loadOrders} className="myorders-refresh">
          ↻ Refresh
        </button>
      </div>

      {error && <div className="myorders-error">{error}</div>}

      {!error && orders.length === 0 && (
        <div className="myorders-empty">
          <div className="myorders-empty-icon">📦</div>
          <h2>No orders yet</h2>
          <p>When you place an order it will show up here.</p>
          <Link to="/products" className="myorders-shop-btn">
            Start Shopping
          </Link>
        </div>
      )}

      {orders.map((order) => (
        <article className="myorders-card" key={order.id}>
          <div className="myorders-card-top">
            <div>
              <h3>Order #{order.id}</h3>
              <span className="myorders-date">{formatDate(order.createdAt)}</span>
            </div>
            <span className={`myorders-status status-${String(order.status).toLowerCase()}`}>
              {STATUS_LABELS[order.status] || order.status}
            </span>
          </div>

          <ul className="myorders-items">
            {(order.items || []).map((item) => (
              <li key={item.id}>
                <span>
                  {item.product?.name || "Product"} × {item.quantity}
                </span>
                <strong>₹{Number(item.subtotal || 0).toFixed(2)}</strong>
              </li>
            ))}
          </ul>

          <div className="myorders-meta">
            <span>
              {order.orderType === "PICKUP"
                ? `Pickup: ${order.pickupSlot || "-"}`
                : `Deliver to: ${order.deliveryAddress || "-"}`}
            </span>
            <span>Payment: {order.paymentMethod}</span>
          </div>

          <div className="myorders-card-bottom">
            <strong className="myorders-total">
              Total ₹{Number(order.totalAmount || 0).toFixed(2)}
            </strong>

            {order.status === "PENDING" && (
              <button
                type="button"
                className="myorders-cancel"
                disabled={busyId === order.id}
                onClick={() => cancelOrder(order.id)}
              >
                {busyId === order.id ? "Cancelling..." : "Cancel order"}
              </button>
            )}
          </div>
        </article>
      ))}
    </div>
  );
}

export default MyOrders;
