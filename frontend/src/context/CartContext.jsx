import React, {
  createContext,
  useEffect,
  useState,
} from "react";

export const CartContext = createContext(null);

export const CartProvider = ({ children }) => {

  // ==========================================
  // CART STATE
  // ==========================================

  const [cartItems, setCartItems] = useState(() => {
    try {
      const savedCart =
        localStorage.getItem("cartItems");

      if (!savedCart) {
        return [];
      }

      const parsedCart =
        JSON.parse(savedCart);

      return Array.isArray(parsedCart)
        ? parsedCart
        : [];

    } catch (error) {

      console.error(
        "Cart loading error:",
        error
      );

      return [];
    }
  });

  // ==========================================
  // SAVE CART TO LOCAL STORAGE
  // ==========================================

  useEffect(() => {

    localStorage.setItem(
      "cartItems",
      JSON.stringify(cartItems)
    );

  }, [cartItems]);

  // ==========================================
  // ADD TO CART
  // ==========================================

  const addToCart = (product) => {

    if (!product || !product.id) {
      console.error(
        "Invalid product:",
        product
      );

      return;
    }

    setCartItems((prevItems) => {

      const safeItems =
        Array.isArray(prevItems)
          ? prevItems
          : [];

      const existingItem =
        safeItems.find(
          (item) =>
            Number(item.id) ===
            Number(product.id)
        );

      // ======================================
      // PRODUCT ALREADY EXISTS
      // ======================================

      if (existingItem) {

        const stock =
          Number(
            existingItem.stockQuantity ??
            product.stockQuantity ??
            0
          );

        const currentQuantity =
          Number(
            existingItem.quantity || 0
          );

        // Do not increase above stock
        if (
          stock > 0 &&
          currentQuantity >= stock
        ) {
          return safeItems;
        }

        return safeItems.map((item) => {

          if (
            Number(item.id) ===
            Number(product.id)
          ) {

            return {
              ...item,
              quantity:
                Number(item.quantity || 0) + 1,
            };
          }

          return item;

        });
      }

      // ======================================
      // NEW PRODUCT
      // ======================================

      return [
        ...safeItems,
        {
          ...product,
          // product.quantity is the pack size text (e.g. "1 kg") - keep it as
          // "unit" because "quantity" below is the number of items in the cart.
          unit:
            product.unit ||
            (typeof product.quantity === "string"
              ? product.quantity
              : ""),
          quantity: 1,
        },
      ];

    });
  };

  // ==========================================
  // REMOVE PRODUCT FROM CART
  // ==========================================

  const removeFromCart = (productId) => {

    setCartItems((prevItems) => {

      const safeItems =
        Array.isArray(prevItems)
          ? prevItems
          : [];

      return safeItems.filter(
        (item) =>
          Number(item.id) !==
          Number(productId)
      );

    });
  };

  // ==========================================
  // UPDATE QUANTITY
  // ==========================================

  const updateQuantity = (
    productId,
    quantity
  ) => {

    const newQuantity =
      Number(quantity);

    if (
      !newQuantity ||
      newQuantity <= 0
    ) {

      removeFromCart(productId);

      return;
    }

    setCartItems((prevItems) => {

      const safeItems =
        Array.isArray(prevItems)
          ? prevItems
          : [];

      return safeItems.map((item) => {

        if (
          Number(item.id) ===
          Number(productId)
        ) {

          const stock =
            Number(item.stockQuantity || 0);

          let finalQuantity =
            newQuantity;

          // Prevent quantity from exceeding stock
          if (
            stock > 0 &&
            finalQuantity > stock
          ) {
            finalQuantity = stock;
          }

          return {
            ...item,
            quantity: finalQuantity,
          };
        }

        return item;

      });

    });
  };

  // ==========================================
  // INCREASE QUANTITY
  // ==========================================

  const increaseQuantity = (
    productId
  ) => {

    setCartItems((prevItems) => {

      const safeItems =
        Array.isArray(prevItems)
          ? prevItems
          : [];

      return safeItems.map((item) => {

        if (
          Number(item.id) ===
          Number(productId)
        ) {

          const stock =
            Number(
              item.stockQuantity || 0
            );

          const currentQuantity =
            Number(
              item.quantity || 0
            );

          // Stop if stock limit reached
          if (
            stock > 0 &&
            currentQuantity >= stock
          ) {
            return item;
          }

          return {
            ...item,
            quantity:
              currentQuantity + 1,
          };
        }

        return item;

      });

    });
  };

  // ==========================================
  // DECREASE QUANTITY
  // ==========================================

  const decreaseQuantity = (
    productId
  ) => {

    setCartItems((prevItems) => {

      const safeItems =
        Array.isArray(prevItems)
          ? prevItems
          : [];

      const existingItem =
        safeItems.find(
          (item) =>
            Number(item.id) ===
            Number(productId)
        );

      if (!existingItem) {
        return safeItems;
      }

      // Remove item if quantity becomes zero
      if (
        Number(existingItem.quantity) <= 1
      ) {

        return safeItems.filter(
          (item) =>
            Number(item.id) !==
            Number(productId)
        );
      }

      return safeItems.map((item) => {

        if (
          Number(item.id) ===
          Number(productId)
        ) {

          return {
            ...item,
            quantity:
              Number(item.quantity) - 1,
          };
        }

        return item;

      });

    });
  };

  // ==========================================
  // CLEAR CART
  // ==========================================

  const clearCart = () => {

    setCartItems([]);

  };

  // ==========================================
  // TOTAL ITEMS
  // ==========================================

  const cartCount = cartItems.reduce(
    (total, item) => {

      return (
        total +
        Number(item.quantity || 0)
      );

    },
    0
  );

  // ==========================================
  // TOTAL PRICE
  // ==========================================

  const cartTotal = cartItems.reduce(
    (total, item) => {

      const price =
        Number(item.price || 0);

      const quantity =
        Number(item.quantity || 0);

      return (
        total +
        price * quantity
      );

    },
    0
  );

  // ==========================================
  // CONTEXT PROVIDER
  // ==========================================

  return (

    <CartContext.Provider
      value={{

        // Cart data
        cartItems,

        // Cart actions
        addToCart,
        removeFromCart,
        updateQuantity,
        increaseQuantity,
        decreaseQuantity,
        clearCart,

        // Cart information
        cartCount,
        cartTotal,

      }}
    >

      {children}

    </CartContext.Provider>

  );
};