import { useEffect, useState } from "react";
import api from "../Services/api";

function StaffDashboard() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            setError("");

            console.log("Loading staff orders...");

            const response = await api.get("/staff/orders");

            console.log("STAFF ORDERS RESPONSE:", response.data);

            setOrders(
                Array.isArray(response.data)
                    ? response.data
                    : response.data.orders || []
            );
        } catch (err) {
            console.error("STAFF ORDERS ERROR:", err);

            console.log("Status:", err.response?.status);
            console.log("Response:", err.response?.data);

            setError(
                err.response?.data?.message ||
                err.response?.data?.error ||
                "Unable to load orders."
            );

            setOrders([]);
        } finally {
            setLoading(false);
        }
    };

    const updateOrderStatus = async (orderId, status) => {
        try {
            await api.put(
                `/staff/orders/${orderId}/status`,
                {
                    status: status,
                }
            );

            alert(`Order #${orderId} marked as ${status}`);

            fetchOrders();

        } catch (err) {
            console.error("STATUS UPDATE ERROR:", err);

            alert(
                err.response?.data?.message ||
                "Unable to update order status."
            );
        }
    };

    return (
        <div style={pageStyle}>

            <div style={headerStyle}>
                <div>
                    <h1 style={titleStyle}>
                        Staff Dashboard
                    </h1>

                    <p style={subtitleStyle}>
                        Manage customer orders and fulfillment.
                    </p>
                </div>

                <button
                    onClick={fetchOrders}
                    style={refreshButton}
                >
                    🔄 Refresh Orders
                </button>
            </div>

            {/* ERROR */}

            {error && (
                <div style={errorStyle}>
                    <strong>Error:</strong> {error}
                </div>
            )}

            {/* LOADING */}

            {loading ? (
                <div style={emptyCard}>
                    <h2>Loading Orders...</h2>
                    <p>
                        Please wait while we load customer orders.
                    </p>
                </div>
            ) : orders.length === 0 ? (

                <div style={emptyCard}>

                    <div style={iconStyle}>
                        🛒
                    </div>

                    <h2>
                        No Active Orders
                    </h2>

                    <p>
                        There are currently no orders waiting
                        for processing.
                    </p>

                    <button
                        onClick={fetchOrders}
                        style={refreshButton}
                    >
                        🔄 Refresh
                    </button>

                </div>

            ) : (

                <div style={ordersContainer}>

                    {orders.map((order) => (

                        <div
                            key={order.id}
                            style={orderCard}
                        >

                            <div style={orderHeader}>

                                <div>
                                    <h2>
                                        Order #{order.id}
                                    </h2>

                                    <p>
                                        Customer:{" "}
                                        {order.customerName ||
                                            order.userName ||
                                            order.customer?.name ||
                                            "Customer"}
                                    </p>

                                    <p>
                                        Email:{" "}
                                        {order.customerEmail ||
                                            order.userEmail ||
                                            order.customer?.email ||
                                            "N/A"}
                                    </p>
                                </div>

                                <span
                                    style={statusStyle(
                                        order.status
                                    )}
                                >
                                    {order.status || "PENDING"}
                                </span>

                            </div>

                            <hr />

                            <div style={orderInfo}>

                                <p>
                                    <strong>Total:</strong>{" "}
                                    ₹
                                    {order.totalAmount ||
                                        order.total ||
                                        0}
                                </p>

                                <p>
                                    <strong>Order Date:</strong>{" "}
                                    {order.createdAt
                                        ? new Date(
                                              order.createdAt
                                          ).toLocaleString()
                                        : "N/A"}
                                </p>

                            </div>

                            <div style={buttonContainer}>

                                <button
                                    onClick={() =>
                                        updateOrderStatus(
                                            order.id,
                                            "PREPARING"
                                        )
                                    }
                                    style={button("#0284c7")}
                                >
                                    Preparing
                                </button>

                                <button
                                    onClick={() =>
                                        updateOrderStatus(
                                            order.id,
                                            "READY"
                                        )
                                    }
                                    style={button("#16a34a")}
                                >
                                    Ready
                                </button>

                                <button
                                    onClick={() =>
                                        updateOrderStatus(
                                            order.id,
                                            "COMPLETED"
                                        )
                                    }
                                    style={button("#475569")}
                                >
                                    Complete
                                </button>

                            </div>

                        </div>

                    ))}

                </div>
            )}

        </div>
    );
}


/* =========================
   STYLES
========================= */

const pageStyle = {
    minHeight: "100vh",
    backgroundColor: "#f8fafc",
    padding: "40px",
};

const headerStyle = {
    maxWidth: "1100px",
    margin: "0 auto 30px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "20px",
};

const titleStyle = {
    margin: 0,
    fontSize: "32px",
    color: "#0f172a",
};

const subtitleStyle = {
    color: "#64748b",
    marginTop: "8px",
};

const refreshButton = {
    backgroundColor: "#16a34a",
    color: "white",
    border: "none",
    padding: "12px 18px",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600",
};

const errorStyle = {
    maxWidth: "1100px",
    margin: "0 auto 20px",
    padding: "15px 20px",
    backgroundColor: "#fee2e2",
    color: "#991b1b",
    border: "1px solid #fecaca",
    borderRadius: "8px",
};

const emptyCard = {
    maxWidth: "1100px",
    margin: "40px auto",
    backgroundColor: "white",
    padding: "60px 30px",
    textAlign: "center",
    borderRadius: "12px",
    border: "1px solid #e2e8f0",
};

const iconStyle = {
    fontSize: "50px",
    marginBottom: "15px",
};

const ordersContainer = {
    maxWidth: "1100px",
    margin: "auto",
    display: "flex",
    flexDirection: "column",
    gap: "20px",
};

const orderCard = {
    backgroundColor: "white",
    padding: "25px",
    borderRadius: "12px",
    border: "1px solid #e2e8f0",
    boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
};

const orderHeader = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
};

const orderInfo = {
    color: "#475569",
};

const buttonContainer = {
    display: "flex",
    justifyContent: "flex-end",
    gap: "10px",
    marginTop: "20px",
};

const button = (color) => ({
    backgroundColor: color,
    color: "white",
    border: "none",
    padding: "10px 15px",
    borderRadius: "7px",
    cursor: "pointer",
    fontWeight: "600",
});

const statusStyle = (status) => ({
    padding: "7px 12px",
    borderRadius: "20px",
    backgroundColor:
        status === "COMPLETED"
            ? "#dcfce7"
            : status === "READY"
            ? "#dbeafe"
            : "#fef3c7",
    color:
        status === "COMPLETED"
            ? "#166534"
            : status === "READY"
            ? "#1e40af"
            : "#92400e",
    fontWeight: "700",
});

export default StaffDashboard;