import React, {
  useEffect,
  useState,
  useContext,
} from "react";

import { Link } from "react-router-dom";

import { CartContext } from "../context/CartContext";

import "../css/UserDashboard.css";

function UserDashboard({ user }) {

  const cartContext =
    useContext(CartContext);

  const addToCart =
    cartContext?.addToCart;

  const [products, setProducts] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

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

    const fetchProducts = async () => {

      try {

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

        setProducts(data);

      } catch (error) {

        console.error(
          "Product Error:",
          error
        );

      } finally {

        setLoading(false);

      }
    };

    fetchProducts();

  }, []);

  const handleAddToCart = (
    product
  ) => {

    if (addToCart) {
      addToCart(product);
    }

  };

  if (loading) {

    return (
      <div className="dashboard-loading">
        Loading products...
      </div>
    );

  }

  return (

    <div className="user-dashboard">

      {/* WELCOME */}

      <section className="user-welcome">

        <div>

          <h1>
            Welcome back,{" "}
            {user?.name ||
              user?.email?.split("@")[0] ||
              "Customer"} 👋
          </h1>

          <p>
            Shop your daily essentials
            at the best prices.
          </p>

        </div>

        <Link
          to="/products"
          className="view-products-btn"
        >
          View All Products →
        </Link>

      </section>

      {/* CATEGORIES */}

      <section className="dashboard-section">

        <div className="section-heading">

          <h2>
            Shop by Category
          </h2>

          <Link to="/products">
            View All →
          </Link>

        </div>

        <div className="dashboard-category-grid">

          {categories.map(
            (category) => (

              <Link
                key={category}
                to={`/products?category=${encodeURIComponent(
                  category
                )}`}
                className="dashboard-category-card"
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

      {/* PRODUCTS */}

      <section className="dashboard-section">

        <div className="section-heading">

          <h2>
            Recommended Products
          </h2>

          <Link to="/products">
            View All →
          </Link>

        </div>

        <div className="dashboard-product-grid">

          {products
            .slice(0, 8)
            .map((product) => (

              <div
                className="dashboard-product-card"
                key={product.id}
              >

                <div className="dashboard-product-image">

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

                <div className="dashboard-product-info">

                  <h3>
                    {product.name}
                  </h3>

                  <p className="product-unit">
                    {product.unit}
                  </p>

                  <div className="product-bottom">

                    <span className="dashboard-price">
                      ₹{product.price}
                    </span>

                    <button
                      onClick={() =>
                        handleAddToCart(
                          product
                        )
                      }
                      disabled={
                        product.stockQuantity === 0
                      }
                    >
                      {product.stockQuantity === 0
                        ? "Out of Stock"
                        : "Add"}
                    </button>

                  </div>

                </div>

              </div>

            ))}

        </div>

      </section>

    </div>

  );
}

export default UserDashboard;