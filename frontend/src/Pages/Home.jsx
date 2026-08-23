import React, {
  useEffect,
  useState,
  useContext,
} from "react";

import { Link } from "react-router-dom";

import {
  CartContext,
} from "../context/CartContext";

import "../css/Home.css";

function Home() {

  const cartContext = useContext(CartContext);

  const {
    cartItems = [],
    addToCart,
    updateQuantity,
    removeFromCart,
  } = cartContext || {};

  const [products, setProducts] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

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
      icon: "🍿",
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

    const fetchProducts =
      async () => {

        try {

          setLoading(true);

          const response =
            await fetch(
              "http://localhost:8080/api/products"
            );

          if (!response.ok) {
            throw new Error(
              "Failed to load products"
            );
          }

          const data =
            await response.json();

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

          setError(
            error.message
          );

        } finally {

          setLoading(false);

        }

      };

    fetchProducts();

  }, []);

  // ==========================================
  // GET PRODUCT QUANTITY
  // ==========================================

  const getCartQuantity =
    (productId) => {

      const cartProduct =
        cartItems.find(
          (item) =>
            Number(item.id) ===
            Number(productId)
        );

      return (
        cartProduct?.quantity || 0
      );

    };

  // ==========================================
  // ADD TO CART
  // ==========================================

  const handleAddToCart =
    (product) => {

      if (!addToCart) {
        return;
      }

      addToCart(product);

    };

  // ==========================================
  // INCREASE QUANTITY
  // ==========================================

  const handleIncrease =
    (product) => {

      const currentQuantity =
        getCartQuantity(
          product.id
        );

      const stock =
        Number(
          product.stockQuantity ?? 0
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

      }

    };

  // ==========================================
  // DECREASE QUANTITY
  // ==========================================

  const handleDecrease =
    (product) => {

      const currentQuantity =
        getCartQuantity(
          product.id
        );

      if (currentQuantity <= 1) {

        if (removeFromCart) {

          removeFromCart(
            product.id
          );

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

  return (

    <div className="home-page">

      {/* ======================================
          CATEGORY NAVIGATION
      ====================================== */}

      <div className="category-navigation">

        <div className="category-scroll">

          <Link
            to="/products"
            className="category-pill active"
          >
            ✨ All
          </Link>

          {categories.map(
            (category) => (

              <Link
                key={category.name}
                to={`/products?category=${encodeURIComponent(
                  category.name
                )}`}
                className="category-pill"
              >
                {category.icon}
                {" "}
                {category.name}
              </Link>

            )
          )}

        </div>

      </div>

      {/* ======================================
          HERO SECTION
      ====================================== */}

      <section className="modern-hero">

        <div className="hero-content">

          <div className="hero-badge">
            ⚡ Fast Delivery
          </div>

          <h1>

            Groceries delivered

            <span>
              {" "}
              fresh & fast.
            </span>

          </h1>

          <p>

            Everything you need for
            your home, delivered right
            to your doorstep.

          </p>

          <div className="hero-buttons">

            <Link
              to="/products"
              className="primary-btn"
            >
              Start Shopping
              <span>
                →
              </span>
            </Link>

            <Link
              to="/products"
              className="secondary-btn"
            >
              Browse Products
            </Link>

          </div>

          <div className="hero-features">

            <div>
              <span>
                🚚
              </span>

              <p>
                Fast Delivery
              </p>
            </div>

            <div>
              <span>
                🥬
              </span>

              <p>
                Fresh Products
              </p>
            </div>

            <div>
              <span>
                💳
              </span>

              <p>
                Easy Checkout
              </p>
            </div>

          </div>

        </div>

        <div className="hero-visual">

          <div className="hero-circle circle-one" />

          <div className="hero-circle circle-two" />

          <div className="shopping-card">

            <div className="shopping-bag">
              🛍️
            </div>

            <div className="floating-item item-one">
              🥦
            </div>

            <div className="floating-item item-two">
              🥛
            </div>

            <div className="floating-item item-three">
              🍞
            </div>

            <div className="floating-item item-four">
              🍎
            </div>

          </div>

        </div>

      </section>

      {/* ======================================
          POPULAR CATEGORIES
      ====================================== */}

      <section className="home-section">

        <div className="modern-section-header">

          <div>

            <span>
              EXPLORE
            </span>

            <h2>
              Shop by Category
            </h2>

          </div>

          <Link
            to="/products"
            className="view-all-link"
          >
            View All
            <span>
              →
            </span>
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

                <div className="category-icon-box">
                  {category.icon}
                </div>

                <h3>
                  {category.name}
                </h3>

                <span>
                  Explore →
                </span>

              </Link>

            )
          )}

        </div>

      </section>

      {/* ======================================
          BEST DEALS
      ====================================== */}

      <section className="home-section">

        <div className="modern-section-header">

          <div>

            <span>
              BEST OFFERS
            </span>

            <h2>
              Popular Products
            </h2>

          </div>

          <Link
            to="/products"
            className="view-all-link"
          >
            View All
            <span>
              →
            </span>
          </Link>

        </div>

        {/* LOADING */}

        {loading && (

          <div className="loading-grid">

            {[1, 2, 3, 4].map(
              (item) => (

                <div
                  key={item}
                  className="product-skeleton"
                />

              )
            )}

          </div>

        )}

        {/* ERROR */}

        {!loading &&
          error && (

            <div className="product-status error-status">

              <span>
                ⚠️
              </span>

              <h3>
                Unable to load products
              </h3>

              <p>
                {error}
              </p>

            </div>

          )}

        {/* EMPTY */}

        {!loading &&
          !error &&
          products.length === 0 && (

            <div className="product-status">

              <span>
                🛒
              </span>

              <h3>
                No products available
              </h3>

              <p>
                Products will appear here soon.
              </p>

            </div>

          )}

        {/* PRODUCTS */}

        {!loading &&
          !error &&
          products.length > 0 && (

            <div className="modern-product-grid">

              {products
                .slice(0, 8)
                .map(
                  (product) => {

                    const quantity =
                      getCartQuantity(
                        product.id
                      );

                    const stock =
                      Number(
                        product.stockQuantity ?? 0
                      );

                    const isInCart =
                      quantity > 0;

                    const isOutOfStock =
                      stock <= 0;

                    const maxReached =
                      stock > 0 &&
                      quantity >= stock;

                    return (

                      <div
                        className="modern-product-card"
                        key={product.id}
                      >

                        {product.discount && (

                          <div className="modern-discount">
                            {product.discount}
                          </div>

                        )}

                        <div className="modern-product-image">

                          {product.imageUrl ? (

                            <img
                              src={product.imageUrl}
                              alt={product.name}
                            />

                          ) : (

                            <span>
                              🛒
                            </span>

                          )}

                        </div>

                        <div className="modern-product-info">

                          <p className="product-category-label">

                            {product.category ||
                              "Daily Essentials"}

                          </p>

                          <h3>
                            {product.name}
                          </h3>

                          <p className="modern-product-unit">

                            {product.unit ||
                              "1 Unit"}

                          </p>

                          <div className="modern-price-row">

                            <div>

                              <strong>
                                ₹{product.price}
                              </strong>

                              {product.mrp &&
                                Number(
                                  product.mrp
                                ) >
                                Number(
                                  product.price
                                ) && (

                                  <del>
                                    ₹{product.mrp}
                                  </del>

                                )}

                            </div>

                            <span
                              className={
                                isOutOfStock
                                  ? "stock-badge out"
                                  : "stock-badge"
                              }
                            >

                              {isOutOfStock
                                ? "Out of Stock"
                                : `${stock} left`}

                            </span>

                          </div>

                          {/* ADD BUTTON */}

                          {isOutOfStock ? (

                            <button
                              className="modern-out-stock"
                              disabled
                            >
                              Out of Stock
                            </button>

                          ) : !isInCart ? (

                            <button
                              className="modern-add-btn"
                              onClick={() =>
                                handleAddToCart(
                                  product
                                )
                              }
                            >
                              <span>
                                +
                              </span>

                              Add to Cart

                            </button>

                          ) : (

                            <div className="modern-quantity-wrapper">

                              <div className="modern-quantity">

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

                              <Link
                                to="/cart"
                                className="quick-cart-link"
                              >
                                Cart →
                              </Link>

                            </div>

                          )}

                        </div>

                      </div>

                    );

                  }
                )}

            </div>

          )}

      </section>

      {/* ======================================
          BOTTOM BANNER
      ====================================== */}

      <section className="delivery-banner">

        <div className="delivery-icon">
          🚚
        </div>

        <div>

          <h2>
            Fresh groceries, delivered fast.
          </h2>

          <p>
            Shop your everyday essentials
            without leaving home.
          </p>

        </div>

        <Link
          to="/products"
          className="delivery-btn"
        >
          Shop Now →
        </Link>

      </section>

    </div>

  );

}

export default Home;