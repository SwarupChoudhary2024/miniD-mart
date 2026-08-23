import React, {
  useEffect,
  useState,
  useContext,
} from "react";

import {
  useLocation,
} from "react-router-dom";

import {
  CartContext,
} from "../context/CartContext";

import "../css/Products.css";

function Products() {
  const location =
    useLocation();

  const {
    addToCart,
  } = useContext(CartContext);

  const [
    products,
    setProducts,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

  const params =
    new URLSearchParams(
      location.search
    );

  const search =
    params.get("search") || "";

  const category =
    params.get("category") || "";

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

          setProducts(data);
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
      <div className="page-loading">
        Loading products...
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-error">
        {error}
      </div>
    );
  }

  return (
    <div className="products-page">

      <div className="products-header">
        <div>
          <h1>
            {search
              ? `Search Results for "${search}"`
              : category
              ? category
              : "All Products"}
          </h1>

          <p>
            {filteredProducts.length} products found
          </p>
        </div>
      </div>

      {filteredProducts.length === 0 ? (
        <div className="no-products">
          <h2>
            No products found
          </h2>

          <p>
            Try searching for another product.
          </p>
        </div>
      ) : (
        <div className="products-grid">

          {filteredProducts.map(
            (product) => (

              <div
                className="product-card"
                key={product.id}
              >

                <div className="product-image-wrapper">

                  {product.imageUrl ? (
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="product-image"
                    />
                  ) : (
                    <div className="product-placeholder">
                      🛒
                    </div>
                  )}

                </div>

                <div className="product-info">

                  <h3>
                    {product.name}
                  </h3>

                  <p className="product-unit">
                    {product.unit ||
                      "1 Unit"}
                  </p>

                  {product.description && (
                    <p className="product-description">
                      {product.description}
                    </p>
                  )}

                  <h2 className="product-price">
                    ₹{product.price}
                  </h2>

                  <p
                    className={
                      product.stockQuantity > 0
                        ? "in-stock"
                        : "out-stock"
                    }
                  >
                    {product.stockQuantity > 0
                      ? `In Stock: ${product.stockQuantity}`
                      : "Out of Stock"}
                  </p>

                  <button
                    type="button"
                    className="add-to-cart-btn"
                    disabled={
                      product.stockQuantity <= 0
                    }
                    onClick={() =>
                      addToCart(product)
                    }
                  >
                    {product.stockQuantity > 0
                      ? "Add to Cart"
                      : "Out of Stock"}
                  </button>

                </div>

              </div>
            )
          )}

        </div>
      )}

    </div>
  );
}

export default Products;