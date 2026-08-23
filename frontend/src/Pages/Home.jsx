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
  const { addToCart } =
    useContext(CartContext);

  const [products, setProducts] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const categories = [
    "Grocery",
    "Dairy",
    "Beverages",
    "Snacks",
    "Personal Care",
    "Home Care",
    "Household",
    "Pooja Needs",
  ];

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

          setError(
            error.message
          );

        } finally {

          setLoading(false);

        }
      };

    fetchProducts();

  }, []);

  return (
    <div className="home-page">

      {/* Categories */}

      <nav className="category-bar">

        <Link
          to="/products"
          className="category-item active"
        >
          All Categories
        </Link>

        {categories.map(
          (category) => (

            <Link
              key={category}
              to={`/products?category=${encodeURIComponent(
                category
              )}`}
              className="category-item"
            >
              {category}
            </Link>

          )
        )}

      </nav>

      {/* Hero */}

      <section className="hero">

        <div className="hero-content">

          <span className="hero-label">
            DAILY ESSENTIALS
          </span>

          <h1>
            Everything you need,
            <br />
            at better prices.
          </h1>

          <p>
            Shop groceries,
            household products and
            daily essentials.
          </p>

          <Link
            to="/products"
            className="shop-btn"
          >
            Shop Now
          </Link>

        </div>

        <div className="hero-image">
          🛒
        </div>

      </section>

      {/* Popular Categories */}

      <section className="section">

        <div className="section-header">

          <h2>
            Popular Categories
          </h2>

          <Link
            to="/products"
            className="view-all"
          >
            View All →
          </Link>

        </div>

        <div className="category-grid">

          {categories.map(
            (category) => (

              <Link
                key={category}
                to={`/products?category=${encodeURIComponent(
                  category
                )}`}
                className="category-card"
              >

                <div className="category-icon">
                  🛍️
                </div>

                <h3>
                  {category}
                </h3>

              </Link>

            )
          )}

        </div>

      </section>

      {/* Best Deals */}

      <section className="section">

        <div className="section-header">

          <h2>
            Best Deals
          </h2>

          <Link
            to="/products"
            className="view-all"
          >
            View All →
          </Link>

        </div>

        {loading && (
          <p>
            Loading products...
          </p>
        )}

        {error && (
          <p className="error-message">
            {error}
          </p>
        )}

        {!loading &&
          !error &&
          products.length === 0 && (
            <p>
              No products available.
            </p>
          )}

        <div className="product-grid">

          {products
            .slice(0, 8)
            .map((product) => (

              <div
                className="product-card"
                key={product.id}
              >

                {product.discount && (
                  <div className="discount-badge">
                    {product.discount}
                  </div>
                )}

                <div className="product-image">

                  {product.image ? (

                    <img
                      src={product.image}
                      alt={product.name}
                    />

                  ) : (

                    "🛒"

                  )}

                </div>

                <h3>
                  {product.name}
                </h3>

                <p className="quantity">
                  {product.quantity ||
                    "1 Unit"}
                </p>

                <div className="price-container">

                  <strong className="current-price">
                    ₹{product.price}
                  </strong>

                  {product.mrp && (
                    <del className="mrp-price">
                      ₹{product.mrp}
                    </del>
                  )}

                </div>

                <p>
                  Stock:{" "}
                  {product.stock}
                </p>

                <button
                  type="button"
                  className="add-to-cart-btn"
                  disabled={
                    product.stock <= 0
                  }
                  onClick={() =>
                    addToCart(product)
                  }
                >
                  {product.stock <= 0
                    ? "Out of Stock"
                    : "Add to Cart"}
                </button>

              </div>

            ))}

        </div>

      </section>

    </div>
  );
}

export default Home;