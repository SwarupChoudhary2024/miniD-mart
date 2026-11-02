import React, { useContext, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CartContext } from "../context/CartContext";
import api, { getErrorMessage } from "../Services/api";
import "../css/Checkout.css";

function Checkout() {
  const navigate = useNavigate();
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [orderError, setOrderError] = useState("");

  const [orderType, setOrderType] = useState("DELIVERY");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [pickupSlot, setPickupSlot] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("COD");

  // Pickup time windows: remaining windows of today + all windows of tomorrow
  const pickupSlots = useMemo(() => {
    const windows = [[10, 12], [12, 14], [14, 16], [16, 18], [18, 20]];
    const fmt = (h) => {
      const suffix = h >= 12 ? "PM" : "AM";
      const hour = h % 12 === 0 ? 12 : h % 12;
      return `${hour} ${suffix}`;
    };
    const nowHour = new Date().getHours();
    const slots = [];

    windows.forEach(([from, to]) => {
      if (from > nowHour + 1) {
        slots.push(`Today, ${fmt(from)} - ${fmt(to)}`);
      }
    });
    windows.forEach(([from, to]) => {
      slots.push(`Tomorrow, ${fmt(from)} - ${fmt(to)}`);
    });

    return slots;
  }, []);

  const cartContext = useContext(CartContext);

  const cartItems = Array.isArray(cartContext?.cartItems)
    ? cartContext.cartItems
    : [];

  const clearCart = cartContext?.clearCart;

  const total = useMemo(() => {
    return cartItems.reduce((sum, item) => {
      const price = Number(item?.price) || 0;
      const quantity = Number(item?.quantity) || 1;

      return sum + price * quantity;
    }, 0);
  }, [cartItems]);

  const totalItems = useMemo(() => {
    return cartItems.reduce((sum, item) => {
      return sum + (Number(item?.quantity) || 1);
    }, 0);
  }, [cartItems]);

  const handlePlaceOrder = async () => {
    if (cartItems.length === 0 || isPlacingOrder) return;

    setOrderError("");

    if (orderType === "DELIVERY" && deliveryAddress.trim().length < 5) {
      setOrderError("Please enter your full delivery address.");
      return;
    }

    if (orderType === "PICKUP" && !pickupSlot) {
      setOrderError("Please choose a pickup time slot.");
      return;
    }

    const payload = {
      orderType,
      deliveryAddress:
        orderType === "DELIVERY" ? deliveryAddress.trim() : null,
      pickupSlot: orderType === "PICKUP" ? pickupSlot : null,
      paymentMethod,
      items: cartItems.map((item) => ({
        productId: Number(item.id),
        quantity: Number(item.quantity) || 1,
      })),
    };

    try {
      setIsPlacingOrder(true);

      // POST /api/orders  -> saved in MySQL, stock is reduced
      const response = await api.post("/orders", payload);

      if (typeof clearCart === "function") {
        clearCart();
      }

      navigate("/order-success", {
        replace: true,
        state: { order: response.data },
      });
    } catch (error) {
      console.error("PLACE ORDER ERROR:", error.response?.data || error);
      setOrderError(
        getErrorMessage(error, "Could not place your order. Please try again.")
      );
    } finally {
      setIsPlacingOrder(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="checkout-empty-page">
        <div className="checkout-empty-card">
          <div className="empty-cart-icon">🛒</div>

          <span className="empty-badge">
            YOUR CART
          </span>

          <h1>Your cart is empty</h1>

          <p>
            Looks like you haven't added anything to your
            cart yet. Explore our products and start shopping.
          </p>

          <Link
            to="/products"
            className="continue-shopping-btn"
          >
            <span>←</span>
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page">

      <div className="checkout-wrapper">

        {/* HEADER */}

        <div className="checkout-header">

          <div>
            <span className="checkout-label">
              SECURE CHECKOUT
            </span>

            <h1>Review your order</h1>

            <p>
              You have {totalItems} item
              {totalItems !== 1 ? "s" : ""} in your cart.
            </p>
          </div>

          <Link
            to="/cart"
            className="back-to-cart"
          >
            ← Back to Cart
          </Link>

        </div>

        <div className="checkout-layout">

          {/* LEFT SIDE */}

          <main className="checkout-main">

            <div className="checkout-card">

              <div className="checkout-card-header">

                <div>
                  <h2>Order Items</h2>

                  <p>
                    Check your selected products
                  </p>
                </div>

                <span className="items-count">
                  {totalItems} Items
                </span>

              </div>

              <div className="checkout-items">

                {cartItems.map((item, index) => {

                  const price =
                    Number(item?.price) || 0;

                  const quantity =
                    Number(item?.quantity) || 1;

                  const itemTotal =
                    price * quantity;

                  return (
                    <div
                      className="checkout-item"
                      key={item?.id || index}
                    >

                      <div className="checkout-item-image">

                        {item?.imageUrl || item?.image ? (
                          <img
                            src={
                              item.imageUrl ||
                              item.image
                            }
                            alt={
                              item?.name ||
                              "Product"
                            }
                          />
                        ) : (
                          <span>🛍️</span>
                        )}

                      </div>

                      <div className="checkout-item-details">

                        <h3>
                          {item?.name ||
                            "Product"}
                        </h3>

                        <p className="checkout-unit">
                          {item?.unit ||
                            "1 Unit"}
                        </p>

                        <div className="checkout-price-mobile">

                          ₹{price.toFixed(2)}
                          <span>
                            × {quantity}
                          </span>
                        </div>

                      </div>

                      <div className="checkout-quantity">

                        <span>
                          Qty
                        </span>

                        <strong>
                          {quantity}
                        </strong>

                      </div>

                      <div className="checkout-item-total">

                        <span>
                          Item Total
                        </span>

                        <strong>
                          ₹{itemTotal.toFixed(2)}
                        </strong>

                      </div>

                    </div>
                  );
                })}

              </div>

            </div>

            <div className="checkout-card">
              <div className="checkout-card-header">
                <div>
                  <h2>Delivery &amp; Payment</h2>
                  <p>Tell us how you want to receive your order</p>
                </div>
              </div>

              <div className="checkout-options">
                <div className="option-toggle">
                  <button
                    type="button"
                    className={orderType === "DELIVERY" ? "active" : ""}
                    onClick={() => setOrderType("DELIVERY")}
                  >
                    🚚 Home Delivery
                  </button>
                  <button
                    type="button"
                    className={orderType === "PICKUP" ? "active" : ""}
                    onClick={() => setOrderType("PICKUP")}
                  >
                    🏬 Store Pickup
                  </button>
                </div>

                {orderType === "DELIVERY" ? (
                  <label className="option-field">
                    <span>Delivery address</span>
                    <textarea
                      rows="3"
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      placeholder="House no, street, area, city, PIN code"
                    />
                  </label>
                ) : (
                  <label className="option-field">
                    <span>Pickup time</span>
                    <select
                      value={pickupSlot}
                      onChange={(e) => setPickupSlot(e.target.value)}
                    >
                      <option value="">Select a time slot</option>
                      {pickupSlots.map((slot) => (
                        <option key={slot} value={slot}>
                          {slot}
                        </option>
                      ))}
                    </select>
                  </label>
                )}

                <label className="option-field">
                  <span>Payment method</span>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  >
                    <option value="COD">
                      {orderType === "DELIVERY"
                        ? "Cash on Delivery"
                        : "Pay at Store (Cash)"}
                    </option>
                    <option value="UPI">
                      {orderType === "DELIVERY"
                        ? "UPI on Delivery"
                        : "UPI at Store"}
                    </option>
                    <option value="CARD">
                      {orderType === "DELIVERY"
                        ? "Card on Delivery"
                        : "Card at Store"}
                    </option>
                  </select>
                </label>
              </div>
            </div>

            <Link
              to="/products"
              className="continue-link"
            >
              ← Continue Shopping
            </Link>

          </main>

          {/* RIGHT SIDE */}

          <aside className="order-summary-card">

            <div className="summary-header">

              <div className="summary-icon">
                📋
              </div>

              <div>
                <h2>
                  Order Summary
                </h2>

                <p>
                  Almost there!
                </p>
              </div>

            </div>

            <div className="summary-details">

              <div className="summary-row">

                <span>
                  Subtotal
                </span>

                <strong>
                  ₹{total.toFixed(2)}
                </strong>

              </div>

              <div className="summary-row">

                <span>
                  Delivery
                </span>

                <span className="free-delivery">
                  FREE
                </span>

              </div>

              <div className="summary-row">

                <span>
                  Total Items
                </span>

                <strong>
                  {totalItems}
                </strong>

              </div>

            </div>

            <div className="summary-divider"></div>

            <div className="summary-total">

              <span>
                Total Amount
              </span>

              <strong>
                ₹{total.toFixed(2)}
              </strong>

            </div>

            {orderError && (
              <div className="checkout-error" role="alert">
                {orderError}
              </div>
            )}

            <button
              className="place-order-btn"
              onClick={handlePlaceOrder}
              disabled={isPlacingOrder}
            >

              {isPlacingOrder
                ? "Placing Order..."
                : "Place Order"}

              {!isPlacingOrder && (
                <span>→</span>
              )}

            </button>

            <div className="secure-checkout">

              <span>🔒</span>

              <p>
                Your order details are securely processed.
              </p>

            </div>

          </aside>

        </div>

      </div>

    </div>
  );
}

export default Checkout;