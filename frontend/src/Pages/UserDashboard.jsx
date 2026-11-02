import React, {
  useEffect,
  useState,
  useContext,
} from "react";

import { Link } from "react-router-dom";

import {
  CartContext,
} from "../context/CartContext";

import api from "../Services/api";

import "../css/UserDashboard.css";

function UserDashboard({ user }) {

  const cartContext = useContext(CartContext) || {};

  const {
    cartItems = [],
    addToCart,
    updateQuantity,
    removeFromCart,
  } = cartContext;

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const categories = [
    {
      name: "Grocery",
      icon: "🥬",
    },
    {
      name: "Dairy",
      icon: "🥛",
    },
    {
      name: "Beverages",
      icon: "🥤",
    },
    {
      name: "Snacks",
      icon: "🍪",
    },
    {
      name: "Personal Care",
      icon: "🧴",
    },
    {
      name: "Home Care",
      icon: "🧹",
    },
    {
      name: "Household",
      icon: "🏠",
    },
    {
      name: "Pooja Needs",
      icon: "🪔",
    },
  ];

  // ==========================================
  // FETCH PRODUCTS
  // ==========================================

  useEffect(() => {

    const fetchProducts = async () => {

      try {

        setLoading(true);

        const response = await api.get("/products");

        const data = response.data;

        setProducts(
          Array.isArray(data)
            ? data
            : data.products || []
        );

      } catch (error) {

        console.error(
          "Product Error:",
          error
        );

        setProducts([]);

      } finally {

        setLoading(false);

      }

    };

    fetchProducts();

  }, []);

  // ==========================================
  // CART QUANTITY
  // ==========================================

  const getCartQuantity = (productId) => {

    const cartProduct =
      cartItems.find(
        (item) =>
          Number(item.id) ===
          Number(productId)
      );

    return Number(
      cartProduct?.quantity || 0
    );

  };

  // ==========================================
  // ADD TO CART
  // ==========================================

  const handleAddToCart = (product) => {

    if (!addToCart) {
      console.error(
        "addToCart function not found"
      );
      return;
    }

    addToCart(product);

  };

  // ==========================================
  // INCREASE QUANTITY
  // ==========================================

  const handleIncrease = (product) => {

    const currentQuantity =
      getCartQuantity(product.id);

    const stock =
      Number(
        product.stockQuantity ??
        product.stock ??
        0
      );

    if (
      stock > 0 &&
      currentQuantity >= stock
    ) {
      return;
    }

    if (updateQuantity) {

      updateQuantity(
        product.id,
        currentQuantity + 1
      );

    } else if (addToCart) {

      addToCart(product);

    }

  };

  // ==========================================
  // DECREASE QUANTITY
  // ==========================================

  const handleDecrease = (product) => {

    const currentQuantity =
      getCartQuantity(product.id);

    if (currentQuantity <= 1) {

      if (removeFromCart) {
        removeFromCart(product.id);
      }

      return;

    }

    if (updateQuantity) {

      updateQuantity(
        product.id,
        currentQuantity - 1
      );

    }

  };

  // ==========================================
  // USER NAME
  // ==========================================

  const userName =
    user?.name ||
    user?.email?.split("@")[0] ||
    "Customer";

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {

    return (

      <div className="modern-dashboard">

        <div className="dashboard-container">

          <div className="modern-loader">

            <div className="loader-spinner"></div>

            <p>
              Loading your products...
            </p>

          </div>

        </div>

      </div>

    );

  }

  // ==========================================
  // UI
  // ==========================================

  return (

    <main className="modern-dashboard">

      <div className="dashboard-container">

        {/* =====================================
            HERO / WELCOME
        ===================================== */}

        <section className="dashboard-hero">

          <div className="hero-content">

            <div className="hero-badge">

              ✨ Fresh groceries, delivered fast

            </div>

            <h1>

              Hello,{" "}

              <span>
                {userName}
              </span>

              👋

            </h1>

            <p>

              Discover fresh groceries and
              everyday essentials at prices
              you'll love.

            </p>

            <div className="hero-actions">

              <Link
                to="/products"
                className="hero-primary-btn"
              >
                Start Shopping
                <span>→</span>
              </Link>

              <Link
                to="/cart"
                className="hero-secondary-btn"
              >
                🛒 View Cart

                {cartItems.length > 0 && (

                  <span className="hero-cart-count">

                    {cartItems.length}

                  </span>

                )}

              </Link>

            </div>

          </div>

          <div className="hero-visual">

            <div className="hero-circle hero-circle-one"></div>

            <div className="hero-circle hero-circle-two"></div>

            <div className="hero-main-icon">
              🛒
            </div>

            <div className="floating-card card-top">
              🥬 Fresh Products
            </div>

            <div className="floating-card card-bottom">
              ⚡ Fast Delivery
            </div>

          </div>

        </section>


        {/* =====================================
            CATEGORIES
        ===================================== */}

        <section className="dashboard-section">

          <div className="modern-section-header">

            <div>

              <span className="section-label">
                EXPLORE
              </span>

              <h2>
                Shop by category
              </h2>

            </div>

            <Link
              to="/products"
              className="modern-view-all"
            >
              View all
              <span>→</span>
            </Link>

          </div>


          <div className="modern-category-grid">

            {categories.map(
              (category) => (

                <Link
                  key={category.name}
                  to={`/products?category=${encodeURIComponent(
                    category.name
                  )}`}
                  className="modern-category-card"
                >

                  <div className="category-icon-wrapper">

                    <span>
                      {category.icon}
                    </span>

                  </div>

                  <h3>
                    {category.name}
                  </h3>

                  <span className="category-arrow">
                    →
                  </span>

                </Link>

              )
            )}

          </div>

        </section>


        {/* =====================================
            RECOMMENDED PRODUCTS
        ===================================== */}

        <section className="dashboard-section">

          <div className="modern-section-header">

            <div>

              <span className="section-label">
                FOR YOU
              </span>

              <h2>
                Recommended products
              </h2>

            </div>

            <Link
              to="/products"
              className="modern-view-all"
            >
              View all
              <span>→</span>
            </Link>

          </div>


          {products.length === 0 ? (

            <div className="modern-empty-state">

              <div>
                📦
              </div>

              <h3>
                No products available
              </h3>

              <p>
                Please check again later.
              </p>

            </div>

          ) : (

            <div className="modern-product-grid">

              {products
                .slice(0, 8)
                .map((product) => {

                  const quantity =
                    getCartQuantity(
                      product.id
                    );

                  const isInCart =
                    quantity > 0;

                  const stock =
                    Number(
                      product.stockQuantity ??
                      product.stock ??
                      0
                    );

                  const isOutOfStock =
                    stock <= 0;

                  const maxReached =
                    stock > 0 &&
                    quantity >= stock;

                  const image =
                    product.imageUrl ||
                    product.image ||
                    "";

                  return (

                    <article
                      className="modern-product-card"
                      key={product.id}
                    >

                      {/* PRODUCT IMAGE */}

                      <div className="modern-product-image">

                        {isOutOfStock && (

                          <span className="stock-badge">
                            Out of stock
                          </span>

                        )}

                        {image ? (

                          <img
                            src={image}
                            alt={product.name}
                          />

                        ) : (

                          <div className="product-placeholder">

                            🛒

                          </div>

                        )}

                      </div>


                      {/* PRODUCT INFO */}

                      <div className="modern-product-info">

                        <p className="product-category">

                          {product.category ||
                            "Daily Essentials"}

                        </p>

                        <h3>

                          {product.name}

                        </h3>

                        <p className="modern-product-unit">

                          {product.unit ||
                            product.quantity ||
                            "1 Unit"}

                        </p>


                        <div className="modern-product-footer">

                          <div>

                            <span className="price-label">
                              Price
                            </span>

                            <div className="modern-price">

                              ₹{product.price}

                            </div>

                          </div>


                          {/* OUT OF STOCK */}

                          {isOutOfStock ? (

                            <button
                              className="modern-out-stock"
                              disabled
                            >
                              Unavailable
                            </button>

                          ) : !isInCart ? (

                            /* ADD BUTTON */

                            <button
                              className="modern-add-btn"
                              onClick={() =>
                                handleAddToCart(
                                  product
                                )
                              }
                            >

                              <span>
                                Add
                              </span>

                              <b>
                                +
                              </b>

                            </button>

                          ) : (

                            /* QUANTITY CONTROL */

                            <div className="modern-quantity-control">

                              <button
                                onClick={() =>
                                  handleDecrease(
                                    product
                                  )
                                }
                                aria-label="Decrease quantity"
                              >
                                −
                              </button>

                              <span>

                                {quantity}

                              </span>

                              <button
                                disabled={
                                  maxReached
                                }
                                onClick={() =>
                                  handleIncrease(
                                    product
                                  )
                                }
                                aria-label="Increase quantity"
                              >
                                +
                              </button>

                            </div>

                          )}

                        </div>

                      </div>

                    </article>

                  );

                })}

            </div>

          )}

        </section>

      </div>

    </main>

  );

}

export default UserDashboard;