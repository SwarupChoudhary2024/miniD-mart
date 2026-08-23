import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CartContext } from "../context/CartContext";
import "../css/Checkout.css";

function Checkout() {
  const navigate = useNavigate();
  const { cart, cartTotal, clearCart } = useContext(CartContext);

  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("COD");

  const [address, setAddress] = useState({
    fullName: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
  });

  useEffect(() => {
    if (!cart || cart.length === 0) {
      navigate("/cart");
    }
  }, [cart, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setAddress((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    if (!address.fullName.trim()) {
      alert("Please enter your full name");
      return false;
    }
    if (!address.phone.trim() || !/^\d{10}$/.test(address.phone)) {
      alert("Please enter a valid 10-digit phone number");
      return false;
    }
    if (!address.address.trim()) {
      alert("Please enter your address");
      return false;
    }
    if (!address.city.trim()) {
      alert("Please enter your city");
      return false;
    }
    if (!address.state.trim()) {
      alert("Please enter your state");
      return false;
    }
    if (!address.pincode.trim() || !/^\d{6}$/.test(address.pincode)) {
      alert("Please enter a valid 6-digit pincode");
      return false;
    }
    return true;
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (loading) return;

    if (!cart || cart.length === 0) {
      alert("Your cart is empty");
      navigate("/products");
      return;
    }

    if (!validateForm()) return;

    // Safely parse LocalStorage User & Token
    let user = null;
    let token = localStorage.getItem("token");

    try {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        user = JSON.parse(storedUser);
      }
    } catch (error) {
      console.error("User parsing error:", error);
    }

    // Token fallback inside user object if separate token key is absent
    if (!token && user?.token) {
      token = user.token;
    }

    // Extract User ID safely across different backend structures
    const userId = user?.id || user?.userId || user?.user?.id;

    // Login validation check
    if (!token || !userId) {
      alert("Your login session has expired or user ID is missing. Please login again.");
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      navigate("/login");
      return;
    }

    setLoading(true);

    try {
      const fullAddress = `${address.fullName}, Phone: ${address.phone}, ${address.address}, ${address.city}, ${address.state} - ${address.pincode}`;

      const orderData = {
        orderType: "HOME_DELIVERY",
        deliveryAddress: fullAddress,
        pickupSlot: null,
        paymentMethod: paymentMethod,
        items: cart.map((item) => ({
          productId: item.id,
          quantity: Number(item.quantity),
        })),
      };

      const orderUrl = `http://localhost:8080/api/orders/${userId}`;

      const response = await fetch(orderUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(orderData),
      });

      const responseText = await response.text();

      if (!response.ok) {
        let message = "Unable to place order.";
        try {
          const errorData = JSON.parse(responseText);
          message = errorData.message || errorData.error || message;
        } catch {
          if (responseText) message = responseText;
        }

        if (response.status === 401 || response.status === 403) {
          alert("Session expired or unauthorized. Please login again.");
          localStorage.removeItem("user");
          localStorage.removeItem("token");
          navigate("/login");
          return;
        }

        throw new Error(message);
      }

      let result = {};
      if (responseText) {
        try {
          result = JSON.parse(responseText);
        } catch (error) {
          console.warn("Response was not JSON", error);
        }
      }

      clearCart();
      alert("Order placed successfully!");
      navigate(`/order-success?orderId=${result.id || ""}`);
    } catch (error) {
      console.error("ORDER ERROR:", error);
      alert(error.message || "Something went wrong while placing your order.");
    } finally {
      setLoading(false);
    }
  };

  if (!cart || cart.length === 0) return null;

  const deliveryCharge = 0;
  const finalTotal = Number(cartTotal || 0) + deliveryCharge;

  return (
    <div className="checkout-page">
      <div className="checkout-container">
        {/* Left Section - Delivery & Payment Details */}
        <div className="checkout-left">
          <div className="checkout-heading">
            <h1>Checkout</h1>
            <p>Enter your delivery details and complete your order.</p>
          </div>

          <form onSubmit={handlePlaceOrder} className="checkout-form">
            <div className="checkout-card">
              <h2 className="card-title">📍 Delivery Address</h2>

              <div className="form-grid">
                <div className="form-group">
                  <label>Full Name</label>
                  <input
                    type="text"
                    name="fullName"
                    placeholder="Enter full name"
                    value={address.fullName}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label>Phone Number</label>
                  <input
                    type="tel"
                    name="phone"
                    placeholder="10-digit phone number"
                    value={address.phone}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Complete Address</label>
                <textarea
                  name="address"
                  placeholder="House number, street, landmark, area"
                  value={address.address}
                  onChange={handleChange}
                  rows="3"
                />
              </div>

              <div className="form-grid three-col">
                <div className="form-group">
                  <label>City</label>
                  <input
                    type="text"
                    name="city"
                    placeholder="Enter city"
                    value={address.city}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label>State</label>
                  <input
                    type="text"
                    name="state"
                    placeholder="Enter state"
                    value={address.state}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label>Pincode</label>
                  <input
                    type="text"
                    name="pincode"
                    placeholder="6-digit pincode"
                    value={address.pincode}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            <div className="checkout-card">
              <h2 className="card-title">💳 Payment Method</h2>

              <label className="payment-option">
                <input
                  type="radio"
                  name="payment"
                  value="COD"
                  checked={paymentMethod === "COD"}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
                <div className="payment-text">
                  <strong>Cash on Delivery</strong>
                  <p>Pay cash or via UPI scanner at the time of delivery.</p>
                </div>
              </label>

              <label className="payment-option">
                <input
                  type="radio"
                  name="payment"
                  value="ONLINE"
                  checked={paymentMethod === "ONLINE"}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
                <div className="payment-text">
                  <strong>Online Payment</strong>
                  <p>Pay securely using UPI, Credit/Debit Card, or Net Banking.</p>
                </div>
              </label>
            </div>

            <button type="submit" className="place-order-btn" disabled={loading}>
              {loading
                ? "Placing Order..."
                : `Place Order • ₹${finalTotal.toFixed(2)}`}
            </button>
          </form>
        </div>

        {/* Right Section - Cart Summary */}
        <div className="checkout-right">
          <div className="checkout-card summary-card">
            <h2 className="card-title">Order Summary</h2>

            <div className="checkout-products">
              {cart.map((item) => (
                <div className="checkout-product-item" key={item.id}>
                  <div className="product-image-wrap">
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt={item.name} />
                    ) : (
                      <div className="fallback-img">🛒</div>
                    )}
                  </div>

                  <div className="product-details">
                    <h4 className="product-title">{item.name}</h4>
                    <p className="product-qty">Qty: {item.quantity}</p>
                    <span className="product-price">
                      ₹{Number(item.price).toFixed(2)} each
                    </span>
                  </div>

                  <div className="product-total-price">
                    ₹{(Number(item.price) * Number(item.quantity)).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>

            <div className="divider" />

            <div className="price-row">
              <span>Subtotal</span>
              <span>₹{Number(cartTotal).toFixed(2)}</span>
            </div>

            <div className="price-row">
              <span>Delivery Fee</span>
              <span className="free-tag">FREE</span>
            </div>

            <div className="divider" />

            <div className="price-row total-row">
              <strong>Total Amount</strong>
              <strong className="grand-total">₹{finalTotal.toFixed(2)}</strong>
            </div>

            <button
              type="button"
              className="back-to-cart-btn"
              onClick={() => navigate("/cart")}
            >
              ← Edit Cart Items
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Checkout;