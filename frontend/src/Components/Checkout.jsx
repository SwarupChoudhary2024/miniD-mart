import React, { useContext, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CartContext } from "../context/CartContext";
import "../css/Checkout.css";

function Checkout() {
  const navigate = useNavigate();
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

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

  const handlePlaceOrder = () => {
    if (cartItems.length === 0) return;

    setIsPlacingOrder(true);

    console.log("Order placed:", cartItems);

    setTimeout(() => {
      if (typeof clearCart === "function") {
        clearCart();
      }

      navigate("/order-success");
    }, 700);
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