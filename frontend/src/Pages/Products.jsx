import React, {
  useEffect,
  useState,
  useContext,
} from "react";

import {
  useLocation,
  Link,
} from "react-router-dom";

import {
  CartContext,
} from "../context/CartContext";

import api, { getErrorMessage } from "../Services/api";

import "../css/Products.css";
import { getProductMrp, getDiscountPercent, formatRupees } from "../Services/productPricing";

function Products() {
  const location = useLocation();

  const { addToCart } =
    useContext(CartContext);

  const [products, setProducts] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const params =
    new URLSearchParams(
      location.search
    );

  const search =
    params.get("search") || "";

  const category =
    params.get("category") || "";

  const categories = [
    "All",
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
          setError("");

          const response = await api.get("/products");

        const data = response.data;

          setProducts(
            Array.isArray(data)
              ? data
              : data.products || []
          );

        } catch (error) {

          setError(
            getErrorMessage(error, "Something went wrong")
          );

        } finally {

          setLoading(false);

        }

      };

    fetchProducts();

  }, []);

  const filteredProducts =
    products.filter((product) => {

      const productName =
        product.name
          ?.toLowerCase() || "";

      const searchMatch =
        productName.includes(
          search.toLowerCase()
        );

      const productCategory =
        product.category?.name ||
        product.category ||
        "";

      const categoryMatch =
        !category ||
        productCategory
          .toLowerCase()
          .includes(
            category.toLowerCase()
          );

      return (
        searchMatch &&
        categoryMatch
      );

    });

  if (loading) {

    return (

      <div className="products-page">

        <div className="products-container">

          <div className="products-loading">

            {[1, 2, 3, 4, 5, 6, 7, 8].map(
              (item) => (

                <div
                  className="skeleton-card"
                  key={item}
                >

                  <div className="skeleton-image" />

                  <div className="skeleton-line title" />

                  <div className="skeleton-line" />

                  <div className="skeleton-line small" />

                </div>

              )
            )}

          </div>

        </div>

      </div>

    );

  }

  if (error) {

    return (

      <div className="products-page">

        <div className="products-container">

          <div className="products-error">

            <div className="error-icon">
              ⚠️
            </div>

            <h2>
              Unable to load products
            </h2>

            <p>
              {error}
            </p>

            <button
              onClick={() =>
                window.location.reload()
              }
            >
              Try Again
            </button>

          </div>

        </div>

      </div>

    );

  }

  return (

    <div className="products-page">

      <div className="products-container">

        {/* =====================
            HEADER
        ====================== */}

        <section className="products-hero">

          <div className="products-hero-content">

            <div className="breadcrumb">

              <Link to="/">
                Home
              </Link>

              <span>
                /
              </span>

              <span>
                Products
              </span>

            </div>

            <h1>

              {search
                ? `Search Results`
                : category
                ? category
                : "Shop All Products"}

            </h1>

            {search ? (

              <p>
                Results for
                {" "}
                <strong>
                  "{search}"
                </strong>
              </p>

            ) : (

              <p>
                Discover everything you need,
                all in one place.
              </p>

            )}

          </div>

          <div className="products-hero-icon">
            🛒
          </div>

        </section>


        {/* =====================
            CATEGORY CHIPS
        ====================== */}

        <div className="category-filter-bar">

          {categories.map(
            (item) => {

              const isActive =
                item === "All"
                  ? !category
                  : category === item;

              return (

                <Link
                  key={item}
                  to={
                    item === "All"
                      ? "/products"
                      : `/products?category=${encodeURIComponent(
                          item
                        )}`
                  }
                  className={
                    `category-chip ${
                      isActive
                        ? "active"
                        : ""
                    }`
                  }
                >

                  {item}

                </Link>

              );

            }
          )}

        </div>


        {/* =====================
            RESULTS HEADER
        ====================== */}

        <div className="products-results-header">

          <div>

            <h2>
              Products
            </h2>

            <p>

              {filteredProducts.length}
              {" "}
              {filteredProducts.length === 1
                ? "product"
                : "products"}
              {" "}
              available

            </p>

          </div>

        </div>


        {/* =====================
            EMPTY STATE
        ====================== */}

        {filteredProducts.length === 0 ? (

          <div className="no-products">

            <div className="empty-icon">
              🛍️
            </div>

            <h2>
              No products found
            </h2>

            <p>
              Try searching for another
              product or category.
            </p>

            <Link
              to="/products"
              className="browse-btn"
            >
              Browse All Products
            </Link>

          </div>

        ) : (

          /* =====================
              PRODUCT GRID
          ====================== */

          <div className="products-grid">

            {filteredProducts.map(
              (product) => {

                const stock =
                  product.stockQuantity ??
                  product.stock ??
                  0;

                const image =
                  product.imageUrl ||
                  product.image;

                const isOutOfStock =
                  stock <= 0;

                return (

                  <article
                    className="product-card"
                    key={product.id}
                  >

                    {/* IMAGE */}

                    <div className="product-image-wrapper">

                      {getDiscountPercent(product) > 0 && (
                        <span className="discount-badge">
                          {getDiscountPercent(product)}% OFF
                        </span>
                      )}

                      {image ? (

                        <img
                          src={image}
                          alt={product.name}
                          className="product-image"
                        />

                      ) : (

                        <div className="product-placeholder">

                          🛒

                        </div>

                      )}

                    </div>


                    {/* PRODUCT INFO */}

                    <div className="product-info">

                      <div className="product-category">

                        {product.category?.name ||
                          product.category ||
                          "Daily Essentials"}

                      </div>

                      <h3>

                        {product.name}

                      </h3>

                      <p className="product-unit">

                        {product.unit ||
                          product.quantity ||
                          "1 Unit"}

                      </p>


                      {product.description && (

                        <p className="product-description">

                          {product.description}

                        </p>

                      )}


                      {/* PRICE */}

                      <div className="price-row">

                        <div className="product-price-details">
                          <span className="product-price">
                            {formatRupees(product.price)}
                          </span>
                          {getProductMrp(product) > Number(product.price || 0) && (
                            <>
                              <span className="product-mrp">
                                MRP <del>{formatRupees(getProductMrp(product))}</del>
                              </span>
                              <span className="product-savings">
                                You save {formatRupees(getProductMrp(product) - Number(product.price || 0))}
                              </span>
                            </>
                          )}
                        </div>

                      </div>


                      {/* STOCK */}

                      <div className="product-footer">

                        <span
                          className={
                            isOutOfStock
                              ? "stock-status out"
                              : "stock-status"
                          }
                        >

                          <span className="stock-dot" />

                          {isOutOfStock
                            ? "Out of Stock"
                            : "In Stock"}

                        </span>

                      </div>


                      {/* ADD BUTTON */}

                      <button
                        type="button"
                        className={
                          `add-to-cart-btn ${
                            isOutOfStock
                              ? "disabled"
                              : ""
                          }`
                        }
                        disabled={isOutOfStock}
                        onClick={() =>
                          addToCart(product)
                        }
                      >

                        {isOutOfStock
                          ? "Out of Stock"
                          : "Add to Cart"}

                        {!isOutOfStock && (
                          <span>
                            +
                          </span>
                        )}

                      </button>

                    </div>

                  </article>

                );

              }
            )}

          </div>

        )}

      </div>

    </div>

  );

}

export default Products;