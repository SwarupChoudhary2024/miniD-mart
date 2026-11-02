import { useState } from "react";
import { Routes, Route } from "react-router-dom";

import Header from "./Components/Header";
import ProtectedRoute from "./Components/ProtectedRoute";
import Checkout from "./Components/Checkout";

import Home from "./Pages/Home";
import Login from "./Pages/Login";
import Register from "./Pages/Register";
import Products from "./Pages/Products";
import Cart from "./Pages/Cart";
import Profile from "./Pages/Profile";
import AdminDashboard from "./Pages/AdminDashboard";
import StaffDashboard from "./Pages/StaffDashboard";
import UserDashboard from "./Pages/UserDashboard";
import NotFound from "./Pages/NotFound";
import OrderSuccess from "./Pages/OrderSuccess";
import MyOrders from "./Pages/MyOrders";

function App() {
  // ================================
  // LOAD USER FROM LOCAL STORAGE
  // ================================

  const [user, setUser] = useState(() => {
    try {
      const storedUser = localStorage.getItem("user");

      if (!storedUser) {
        return null;
      }

      return JSON.parse(storedUser);
    } catch (error) {
      console.error("Error loading user:", error);

      localStorage.removeItem("user");
      localStorage.removeItem("token");
      localStorage.removeItem("role");

      return null;
    }
  });

  return (
    <>
      <Header
        user={user}
        setUser={setUser}
      />

      <Routes>

        {/* ================================
            HOME
        ================================= */}

        <Route
          path="/"
          element={<Home />}
        />

        {/* ================================
            LOGIN
        ================================= */}

        <Route
          path="/login"
          element={
            <Login
              setUser={setUser}
            />
          }
        />

        {/* ================================
            REGISTER
        ================================= */}

        <Route
          path="/register"
          element={<Register />}
        />

        {/* ================================
            PRODUCTS
        ================================= */}

        <Route
          path="/products"
          element={<Products />}
        />

        {/* ================================
            CART
            CUSTOMER / STAFF / ADMIN
        ================================= */}

        <Route
          path="/cart"
          element={
            <ProtectedRoute
              allowedRoles={[
                "CUSTOMER",
                "STAFF",
                "ADMIN",
              ]}
            >
              <Cart />
            </ProtectedRoute>
          }
        />

        {/* ================================
            CHECKOUT
            CUSTOMER / STAFF / ADMIN
        ================================= */}

        <Route
          path="/checkout"
          element={
            <ProtectedRoute
              allowedRoles={[
                "CUSTOMER",
                "STAFF",
                "ADMIN",
              ]}
            >
              <Checkout />
            </ProtectedRoute>
          }
        />

        {/* ================================
            CUSTOMER DASHBOARD
        ================================= */}

        <Route
          path="/user"
          element={
            <ProtectedRoute
              allowedRoles={["CUSTOMER"]}
            >
              <UserDashboard />
            </ProtectedRoute>
          }
        />

        {/* ================================
            PROFILE
            CUSTOMER / STAFF / ADMIN
        ================================= */}

        <Route
          path="/profile"
          element={
            <ProtectedRoute
              allowedRoles={[
                "CUSTOMER",
                "STAFF",
                "ADMIN",
              ]}
            >
              <Profile
                user={user}
                setUser={setUser}
              />
            </ProtectedRoute>
          }
        />

        {/* ================================
            MY ORDERS
            CUSTOMER / STAFF / ADMIN
        ================================= */}

        <Route
          path="/orders"
          element={
            <ProtectedRoute
              allowedRoles={[
                "CUSTOMER",
                "STAFF",
                "ADMIN",
              ]}
            >
              <MyOrders />
            </ProtectedRoute>
          }
        />

        {/* ================================
            STAFF DASHBOARD
        ================================= */}

        <Route
          path="/staff"
          element={
            <ProtectedRoute
              allowedRoles={["STAFF"]}
            >
              <StaffDashboard />
            </ProtectedRoute>
          }
        />

        {/* ================================
            ADMIN DASHBOARD
        ================================= */}

        <Route
          path="/admin"
          element={
            <ProtectedRoute
              allowedRoles={["ADMIN"]}
            >
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* ================================
            UNAUTHORIZED
        ================================= */}

        <Route
          path="/unauthorized"
          element={
            <div
              style={{
                padding: "50px",
                textAlign: "center",
              }}
            >
              <h1>
                403 - Unauthorized
              </h1>

              <p>
                You do not have permission
                to access this page.
              </p>

              <button
                onClick={() =>
                  window.history.back()
                }
                style={{
                  marginTop: "20px",
                  padding: "10px 20px",
                  cursor: "pointer",
                }}
              >
                Go Back
              </button>
            </div>
          }
        />

        <Route
          path="/order-success"
          element={
            <ProtectedRoute
              allowedRoles={[
                "CUSTOMER",
                "STAFF",
                "ADMIN",
              ]}
            >
              <OrderSuccess />
            </ProtectedRoute>
          }
        />

        {/* ================================
            404
        ================================= */}

        <Route
          path="*"
          element={<NotFound />}
        />
 
      </Routes>
    </>
  );
}

export default App;