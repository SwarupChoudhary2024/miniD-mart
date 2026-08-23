import React from "react";
import { Link } from "react-router-dom";

function OrderSuccess() {

  return (

    <div
      style={{
        minHeight: "70vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        textAlign: "center",
        padding: "20px",
      }}
    >

      <div style={{ fontSize: "70px" }}>
        🎉
      </div>

      <h1>
        Order Placed Successfully!
      </h1>

      <p>
        Thank you for shopping with Mini D-Mart.
      </p>

      <p>
        Your order confirmation and invoice
        will be sent to your registered email.
      </p>

      <Link
        to="/user"
        style={{
          background: "#087f23",
          color: "white",
          padding: "13px 25px",
          borderRadius: "8px",
          textDecoration: "none",
          marginTop: "20px",
        }}
      >
        Continue Shopping
      </Link>

    </div>

  );
}

export default OrderSuccess;