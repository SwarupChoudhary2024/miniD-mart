import React, {
  useEffect,
  useState,
  useContext,
} from "react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import { CartContext } from "../context/CartContext";

import "../css/Header.css";

function Header({ user, setUser }) {
  const navigate = useNavigate();

  const cartContext = useContext(CartContext);

  const cartCount =
    cartContext?.cartCount || 0;

  const [location, setLocation] =
    useState(
      localStorage.getItem("location") ||
      "Select location"
    );

  const [
    isLocationModalOpen,
    setIsLocationModalOpen,
  ] = useState(false);

  const [
    isProfileOpen,
    setIsProfileOpen,
  ] = useState(false);

  const [cityInput, setCityInput] =
    useState("");

  const [search, setSearch] =
    useState("");

  // ==========================================
  // SYNC USER
  // ==========================================

  useEffect(() => {
    const syncUser = () => {
      try {
        const storedUser =
          localStorage.getItem("user");

        const parsedUser =
          storedUser
            ? JSON.parse(storedUser)
            : null;

        if (setUser) {
          setUser(parsedUser);
        }
      } catch (error) {
        console.error(
          "User parsing error:",
          error
        );

        if (setUser) {
          setUser(null);
        }
      }
    };

    window.addEventListener(
      "authChange",
      syncUser
    );

    return () => {
      window.removeEventListener(
        "authChange",
        syncUser
      );
    };
  }, [setUser]);

  // ==========================================
  // LOGOUT
  // ==========================================

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("role");

    if (setUser) {
      setUser(null);
    }

    window.dispatchEvent(
      new Event("authChange")
    );

    navigate("/login");
  };

  // ==========================================
  // LOCATION
  // ==========================================

  const handleCitySubmit = (e) => {
    e.preventDefault();

    if (!cityInput.trim()) {
      return;
    }

    const selectedCity =
      cityInput.trim();

    setLocation(selectedCity);

    localStorage.setItem(
      "location",
      selectedCity
    );

    setCityInput("");

    setIsLocationModalOpen(false);
  };

  // ==========================================
  // SEARCH
  // ==========================================

  const handleSearch = (e) => {
    e.preventDefault();

    if (!search.trim()) {
      navigate("/products");
      return;
    }

    navigate(
      `/products?search=${encodeURIComponent(
        search.trim()
      )}`
    );
  };

  // ==========================================
  // USER NAME
  // ==========================================

  const userName =
    user?.name ||
    user?.email?.split("@")[0] ||
    "User";

  const firstLetter =
    userName.charAt(0).toUpperCase();

  return (
    <>
      <header className="modern-header">

        <div className="header-container">

          {/* ================= LOGO ================= */}

          <Link
            to="/"
            className="brand-logo"
          >
            <div className="brand-icon">
              M
            </div>

            <div className="brand-text">
              <span className="brand-mini">
                Mini
              </span>

              <span className="brand-dmart">
                D-Mart
              </span>
            </div>
          </Link>

          {/* ================= LOCATION ================= */}

          <button
            className="location-button"
            onClick={() =>
              setIsLocationModalOpen(true)
            }
          >
            <span className="location-icon">
              📍
            </span>

            <span className="location-content">

              <span className="location-small">
                Deliver to
              </span>

              <span className="location-city">
                {location}
              </span>

            </span>

            <span className="location-arrow">
              ⌄
            </span>
          </button>

          {/* ================= SEARCH ================= */}

          <form
            className="modern-search"
            onSubmit={handleSearch}
          >
            <span className="search-icon">
              🔍
            </span>

            <input
              type="text"
              placeholder="Search groceries, snacks, dairy..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
            />

            {search && (
              <button
                type="button"
                className="clear-search"
                onClick={() =>
                  setSearch("")
                }
              >
                ×
              </button>
            )}

          </form>

          {/* ================= RIGHT SIDE ================= */}

          <div className="header-actions">

            {/* CART */}

            <button
              className="modern-cart-btn"
              onClick={() =>
                navigate("/cart")
              }
            >
              <span className="cart-icon">
                🛒
              </span>

              <span className="cart-text">
                Cart
              </span>

              {cartCount > 0 && (
                <span className="modern-cart-count">
                  {cartCount > 99
                    ? "99+"
                    : cartCount}
                </span>
              )}
            </button>

            {/* USER */}

            {user ? (
              <div className="modern-profile-wrapper">

                <button
                  className="modern-profile-button"
                  onClick={() =>
                    setIsProfileOpen(
                      !isProfileOpen
                    )
                  }
                >

                  <span className="modern-avatar">
                    {firstLetter}
                  </span>

                  <span className="profile-name-wrapper">

                    <span className="profile-hello">
                      Hello,
                    </span>

                    <span className="profile-name">
                      {userName}
                    </span>

                  </span>

                  <span className="profile-arrow">
                    ⌄
                  </span>

                </button>

                {isProfileOpen && (

                  <div className="modern-profile-dropdown">

                    {/* PROFILE HEADER */}

                    <div className="dropdown-user-header">

                      <div className="dropdown-avatar">
                        {firstLetter}
                      </div>

                      <div className="dropdown-user-info">

                        <h4>
                          {userName}
                        </h4>

                        <p>
                          {user?.email}
                        </p>

                      </div>

                    </div>

                    <div className="dropdown-role">

                      {user?.role || "USER"}

                    </div>

                    <div className="dropdown-divider" />

                    {/* DASHBOARD */}

                    <button
                      className="dropdown-menu-item"
                      onClick={() => {
                        setIsProfileOpen(false);
                        const role = String(user?.role || "")
                          .replace("ROLE_", "")
                          .toUpperCase();
                        navigate(
                          role === "ADMIN"
                            ? "/admin"
                            : role === "STAFF"
                            ? "/staff"
                            : "/user"
                        );
                      }}
                    >
                      <span>
                        🏠
                      </span>

                      <span>
                        My Dashboard
                      </span>
                    </button>

                    {/* MY ORDERS */}

                    <button
                      className="dropdown-menu-item"
                      onClick={() => {
                        setIsProfileOpen(false);
                        navigate("/orders");
                      }}
                    >
                      <span>
                        📦
                      </span>

                      <span>
                        My Orders
                      </span>
                    </button>

                    {/* CART */}

                    <button
                      className="dropdown-menu-item"
                      onClick={() => {
                        setIsProfileOpen(false);
                        navigate("/cart");
                      }}
                    >
                      <span>
                        🛒
                      </span>

                      <span>
                        My Cart
                      </span>
                    </button>

                    <div className="dropdown-divider" />

                    {/* LOGOUT */}

                    <button
                      className="dropdown-logout"
                      onClick={handleLogout}
                    >
                      <span>
                        🚪
                      </span>

                      <span>
                        Logout
                      </span>
                    </button>

                  </div>

                )}

              </div>
            ) : (

              <div className="modern-auth-buttons">

                <Link
                  to="/login"
                  className="login-link"
                >
                  Login
                </Link>

                <Link
                  to="/register"
                  className="register-link"
                >
                  Create Account
                </Link>

              </div>

            )}

          </div>

        </div>

      </header>

      {/* ==========================================
          LOCATION MODAL
      ========================================== */}

      {isLocationModalOpen && (

        <div
          className="modern-modal-overlay"
          onClick={() =>
            setIsLocationModalOpen(false)
          }
        >

          <div
            className="modern-location-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <button
              className="modal-close"
              onClick={() =>
                setIsLocationModalOpen(false)
              }
            >
              ×
            </button>

            <div className="modal-location-icon">
              📍
            </div>

            <h2>
              Where should we deliver?
            </h2>

            <p>
              Enter your city to see
              products available for you.
            </p>

            <form
              onSubmit={handleCitySubmit}
            >

              <input
                type="text"
                placeholder="Enter your city"
                value={cityInput}
                autoFocus
                onChange={(e) =>
                  setCityInput(
                    e.target.value
                  )
                }
              />

              <button
                type="submit"
                className="save-location-btn"
              >
                Save Location
              </button>

            </form>

          </div>

        </div>

      )}

    </>
  );
}

export default Header;