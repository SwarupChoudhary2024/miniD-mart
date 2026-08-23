import React, {
  useState,
  useEffect,
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
      "Select City"
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

  useEffect(() => {
    const syncUser = () => {
      const storedUser =
        localStorage.getItem("user");

      try {
        const parsedUser =
          storedUser
            ? JSON.parse(storedUser)
            : null;

        setUser(parsedUser);
      } catch {
        setUser(null);
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

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");

    if (setUser) {
      setUser(null);
    }

    window.dispatchEvent(
      new Event("authChange")
    );

    navigate("/login");
  };

  const handleCitySubmit = (e) => {
    e.preventDefault();

    if (!cityInput.trim()) return;

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

  const handleSearch = (e) => {
    e.preventDefault();

    if (!search.trim()) return;

    navigate(
      `/products?search=${encodeURIComponent(
        search.trim()
      )}`
    );
  };

  const userName =
    user?.name ||
    user?.email?.split("@")[0] ||
    "User";

  return (
    <>
      <nav className="navbar-container">

        <div className="navbar-top">

          {/* LOGO */}

          <div className="logo">
            <Link to="/">
              <span className="logo-mini">
                Mini
              </span>

              {" "}

              <span className="logo-dmart">
                D-Mart
              </span>
            </Link>
          </div>

          {/* LOCATION */}

          <div
            className="location-container"
            onClick={() =>
              setIsLocationModalOpen(true)
            }
          >
            <span className="pin-icon">
              📍
            </span>

            <div className="location-text">
              <span className="location-label">
                Deliver to
              </span>

              <span className="location-value">
                {location}
              </span>
            </div>
          </div>

          {/* SEARCH */}

          <form
            className="search-bar"
            onSubmit={handleSearch}
          >
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
            />

            <button
              type="submit"
              className="search-btn"
            >
              🔍
            </button>
          </form>

          {/* RIGHT SIDE */}

          <div className="nav-right">

            {user ? (

              <div className="profile-wrapper">

                <button
                  className="profile-button"
                  onClick={() =>
                    setIsProfileOpen(
                      !isProfileOpen
                    )
                  }
                >
                  👤 {userName}
                  <span>⌄</span>
                </button>

                {isProfileOpen && (

                  <div className="profile-dropdown">

                    <div className="profile-info">

                      <div className="profile-avatar">
                        {userName
                          .charAt(0)
                          .toUpperCase()}
                      </div>

                      <div>

                        <h4>
                          {userName}
                        </h4>

                        <p>
                          {user?.email}
                        </p>

                      </div>

                    </div>

                    <div className="profile-divider" />

                    <div className="profile-details">

                      <p>
                        <strong>Name:</strong>
                        {" "}
                        {user?.name ||
                          "Not Available"}
                      </p>

                      <p>
                        <strong>Email:</strong>
                        {" "}
                        {user?.email ||
                          "Not Available"}
                      </p>

                      <p>
                        <strong>Role:</strong>
                        {" "}
                        {user?.role ||
                          "USER"}
                      </p>

                    </div>

                    <div className="profile-divider" />

                    <button
                      className="profile-menu-btn"
                      onClick={() => {
                        setIsProfileOpen(false);
                        navigate("/user");
                      }}
                    >
                      🛍 My Dashboard
                    </button>

                    <button
                      className="profile-menu-btn"
                      onClick={() => {
                        setIsProfileOpen(false);
                        navigate("/cart");
                      }}
                    >
                      🛒 My Cart
                    </button>

                    <button
                      className="logout-menu-btn"
                      onClick={handleLogout}
                    >
                      Logout
                    </button>

                  </div>

                )}

              </div>

            ) : (

              <div className="auth-links">

                <Link to="/login">
                  Login
                </Link>

                <span>/</span>

                <Link to="/register">
                  Register
                </Link>

              </div>

            )}

            {/* CART */}

            <button
              className="cart-btn"
              onClick={() =>
                navigate("/cart")
              }
            >
              🛒 Cart

              {cartCount > 0 && (
                <span className="cart-count">
                  {cartCount}
                </span>
              )}

            </button>

          </div>

        </div>

      </nav>

      {/* LOCATION MODAL */}

      {isLocationModalOpen && (

        <div className="modal-overlay">

          <div className="modal-content">

            <h3>
              Select Delivery Location
            </h3>

            <form
              onSubmit={handleCitySubmit}
            >

              <input
                type="text"
                placeholder="Enter your city"
                value={cityInput}
                onChange={(e) =>
                  setCityInput(
                    e.target.value
                  )
                }
              />

              <div className="modal-actions">

                <button type="submit">
                  Save
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setIsLocationModalOpen(false)
                  }
                >
                  Cancel
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </>
  );
}

export default Header;