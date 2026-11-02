import React, { useContext } from "react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import {
  CartContext,
} from "../context/CartContext";

import "../css/Cart.css";

function Cart() {
  const navigate = useNavigate();

  const cartContext = useContext(CartContext);

  const {
    cartItems = [],
    cartTotal = 0,
    increaseQuantity,
    decreaseQuantity,
    removeFromCart,
  } = cartContext || {};

  // ==========================================
  // EMPTY CART
  // ==========================================

  if (cartItems.length === 0) {
    return (
      <div className="empty-cart">

        <h2>
          Your cart is empty 🛒
        </h2>

        <Link
          to="/products"
          className="continue-shopping"
        >
          Continue Shopping
        </Link>

      </div>
    );
  }

  return (
    <div className="cart-page">

      <h1>
        Shopping Cart
      </h1>

      <div className="cart-layout">

        {/* ======================================
            CART ITEMS
        ====================================== */}

        <div className="cart-items">

          {cartItems.map((item) => (

            <div
              className="cart-item"
              key={item.id}
            >

              {/* PRODUCT IMAGE */}

              <div className="cart-item-image">

                {item.imageUrl || item.image ? (

                  <img
                    src={item.imageUrl || item.image}
                    alt={item.name}
                  />

                ) : (

                  <span>
                    🛒
                  </span>

                )}

              </div>

              {/* PRODUCT INFO */}

              <div className="cart-item-info">

                <h3>
                  {item.name}
                </h3>

                <p>
                  {item.unit || "1 Unit"}
                </p>

                <h3>
                  ₹{Number(item.price || 0).toFixed(2)}
                </h3>

              </div>

              {/* QUANTITY CONTROLS */}

              <div className="quantity-controls">

                <button
                  onClick={() =>
                    decreaseQuantity?.(item.id)
                  }
                  aria-label="Decrease quantity"
                >
                  −
                </button>

                <span>
                  {item.quantity || 1}
                </span>

                <button
                  onClick={() =>
                    increaseQuantity?.(item.id)
                  }
                  disabled={
                    Number(item.stockQuantity || 0) > 0 &&
                    Number(item.quantity || 0) >=
                      Number(item.stockQuantity)
                  }
                  aria-label="Increase quantity"
                >
                  +
                </button>

              </div>

              {/* SUBTOTAL */}

              <div className="cart-subtotal">

                ₹
                {(
                  Number(item.price || 0) *
                  Number(item.quantity || 1)
                ).toFixed(2)}

              </div>

              {/* REMOVE */}

              <button
                className="remove-btn"
                onClick={() =>
                  removeFromCart?.(item.id)
                }
              >
                Remove
              </button>

            </div>

          ))}

        </div>

        {/* ======================================
            CART SUMMARY
        ====================================== */}

        <div className="cart-summary">

          <h2>
            Bill Details
          </h2>

          <div className="summary-row">

            <span>
              Items Total
            </span>

            <span>
              ₹{Number(cartTotal || 0).toFixed(2)}
            </span>

          </div>

          <div className="summary-row">

            <span>
              Delivery Fee
            </span>

            <span>
              FREE
            </span>

          </div>

          <hr />

          <div className="summary-total">

            <strong>
              Total
            </strong>

            <strong>
              ₹{Number(cartTotal || 0).toFixed(2)}
            </strong>

          </div>

          <button
            className="checkout-btn"
            onClick={() =>
              navigate("/checkout")
            }
          >
            Proceed to Checkout
          </button>

          <Link
            to="/products"
            className="continue-shopping"
          >
            ← Continue Shopping
          </Link>

        </div>

      </div>

    </div>
  );
}

export default Cart;