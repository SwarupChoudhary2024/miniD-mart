import React, {
  useContext,
} from "react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import {
  CartContext,
} from "../context/CartContext";

import "../css/Cart.css";

function Cart() {
  const navigate =
    useNavigate();

  const {
    cart,
    cartTotal,
    increaseQuantity,
    decreaseQuantity,
    removeFromCart,
  } = useContext(CartContext);

  if (cart.length === 0) {
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

        <div className="cart-items">

          {cart.map((item) => (

            <div
              className="cart-item"
              key={item.id}
            >

              <div className="cart-item-image">

                {item.imageUrl ? (
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                  />
                ) : (
                  "🛒"
                )}

              </div>

              <div className="cart-item-info">

                <h3>
                  {item.name}
                </h3>

                <p>
                  {item.unit || "1 Unit"}
                </p>

                <h3>
                  ₹{item.price}
                </h3>

              </div>

              <div className="quantity-controls">

                <button
                  onClick={() =>
                    decreaseQuantity(
                      item.id
                    )
                  }
                >
                  −
                </button>

                <span>
                  {item.quantity}
                </span>

                <button
                  onClick={() =>
                    increaseQuantity(
                      item.id
                    )
                  }
                >
                  +
                </button>

              </div>

              <div className="cart-subtotal">

                ₹
                {(
                  Number(item.price) *
                  item.quantity
                ).toFixed(2)}

              </div>

              <button
                className="remove-btn"
                onClick={() =>
                  removeFromCart(
                    item.id
                  )
                }
              >
                Remove
              </button>

            </div>
          ))}

        </div>

        <div className="cart-summary">

          <h2>
            Bill Details
          </h2>

          <div className="summary-row">
            <span>
              Items Total
            </span>

            <span>
              ₹{cartTotal.toFixed(2)}
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
              ₹{cartTotal.toFixed(2)}
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

        </div>

      </div>
    </div>
  );
}

export default Cart;