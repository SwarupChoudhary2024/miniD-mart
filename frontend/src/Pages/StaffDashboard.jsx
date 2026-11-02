import { useEffect, useState } from "react";
import api from "../Services/api";
import { getProductMrp, getDiscountPercent, formatRupees } from "../Services/productPricing";
import "../css/StaffDashboard.css";

function StaffDashboard() {
    const [orders, setOrders] = useState([]);
    const [products, setProducts] = useState([]);
    const [productsLoading, setProductsLoading] = useState(true);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // =====================================================
    // LOAD ORDERS
    // =====================================================

    useEffect(() => {
        fetchOrders();
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            setProductsLoading(true);
            const response = await api.get("/products");
            const data = response.data;
            setProducts(Array.isArray(data) ? data : data?.products || []);
        } catch (err) {
            console.error("STAFF PRODUCT INVENTORY ERROR:", err.response?.data || err);
            setProducts([]);
        } finally {
            setProductsLoading(false);
        }
    };

    const fetchOrders = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get("/staff/orders");

            setOrders(
                Array.isArray(response.data)
                    ? response.data
                    : response.data?.orders || []
            );
        } catch (err) {
            console.error(
                "STAFF ORDERS ERROR:",
                err.response?.data || err
            );

            setOrders([]);

            setError(
                err.response?.data?.message ||
                err.response?.data?.error ||
                "Unable to load orders."
            );
        } finally {
            setLoading(false);
        }
    };

    // =====================================================
    // UPDATE ORDER STATUS
    // =====================================================

    const updateOrderStatus = async (orderId, status) => {
        try {
            await api.put(
                `/staff/orders/${orderId}/status`,
                {
                    status: status
                }
            );

            setOrders((prevOrders) =>
                prevOrders.map((order) =>
                    order.id === orderId
                        ? {
                              ...order,
                              status: status
                          }
                        : order
                )
            );

            alert(
                `Order #${orderId} marked as ${status}`
            );
        } catch (err) {
            console.error(
                "STATUS UPDATE ERROR:",
                err.response?.data || err
            );

            alert(
                err.response?.data?.message ||
                err.response?.data?.error ||
                "Unable to update order status."
            );
        }
    };

    // =====================================================
    // GET CUSTOMER NAME
    // =====================================================

    const getCustomerName = (order) => {
        return (
            order.customerName ||
            order.userName ||
            order.customer?.name ||
            order.user?.name ||
            "Customer"
        );
    };

    // =====================================================
    // GET CUSTOMER EMAIL
    // =====================================================

    const getCustomerEmail = (order) => {
        return (
            order.customerEmail ||
            order.userEmail ||
            order.customer?.email ||
            order.user?.email ||
            "N/A"
        );
    };

    // =====================================================
    // GET PRODUCT NAME
    // =====================================================

    const getProductName = (item) => {
        return (
            item?.product?.name ||
            item?.productName ||
            item?.name ||
            "Product"
        );
    };

    // =====================================================
    // GET PRODUCT IMAGE
    // =====================================================

    const getProductImage = (item) => {
        return (
            item?.product?.image ||
            item?.product?.imageUrl ||
            item?.image ||
            item?.imageUrl ||
            ""
        );
    };

    // =====================================================
    // GET PRODUCT QUANTITY
    // =====================================================

    const getProductQuantity = (item) => {
        return (
            item?.quantity ??
            item?.qty ??
            1
        );
    };

    // =====================================================
    // FORMAT DATE
    // =====================================================

    const formatDate = (date) => {
        if (!date) return "N/A";

        try {
            return new Date(date).toLocaleString(
                "en-IN"
            );
        } catch {
            return date;
        }
    };

    // =====================================================
    // GET STATUS COLOR
    // =====================================================

    const getStatusStyle = (status) => {
        switch (status) {
            case "PENDING":
                return {
                    backgroundColor: "#fef3c7",
                    color: "#92400e"
                };

            case "PREPARING":
                return {
                    backgroundColor: "#dbeafe",
                    color: "#1d4ed8"
                };

            case "READY":
                return {
                    backgroundColor: "#dcfce7",
                    color: "#166534"
                };

            case "COMPLETED":
                return {
                    backgroundColor: "#e0e7ff",
                    color: "#4338ca"
                };

            case "DELIVERED":
                return {
                    backgroundColor: "#dcfce7",
                    color: "#166534"
                };

            case "CANCELLED":
                return {
                    backgroundColor: "#fee2e2",
                    color: "#991b1b"
                };

            default:
                return {
                    backgroundColor: "#e5e7eb",
                    color: "#374151"
                };
        }
    };

    // =====================================================
    // BUTTON STYLE
    // =====================================================

    const actionButton = (
        backgroundColor,
        disabled = false
    ) => ({
        backgroundColor,
        color: "#ffffff",
        border: "none",
        padding: "10px 16px",
        borderRadius: "7px",
        cursor: disabled
            ? "not-allowed"
            : "pointer",
        fontWeight: "600",
        opacity: disabled ? 0.6 : 1
    });

    // =====================================================
    // RENDER
    // =====================================================

    return (
        <div
            className="staff-dashboard-page"
            style={{
                minHeight: "100vh",
                backgroundColor: "#f8fafc",
                padding: "30px",
                fontFamily: "Arial, sans-serif"
            }}
        >
            {/* ================= HEADER ================= */}

            <div
                style={{
                    maxWidth: "1200px",
                    margin: "0 auto 30px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: "20px",
                    flexWrap: "wrap"
                }}
            >
                <div>
                    <h1
                        style={{
                            margin: 0,
                            color: "#0f172a"
                        }}
                    >
                        Staff Dashboard
                    </h1>

                    <p
                        style={{
                            color: "#64748b",
                            marginTop: "8px"
                        }}
                    >
                        Manage customer orders and
                        prepare products for delivery
                        or pickup.
                    </p>
                </div>

                <button
                    onClick={() => { fetchOrders(); fetchProducts(); }}
                    disabled={loading || productsLoading}
                    style={{
                        backgroundColor: "#16a34a",
                        color: "#ffffff",
                        border: "none",
                        padding: "12px 18px",
                        borderRadius: "8px",
                        cursor: loading
                            ? "not-allowed"
                            : "pointer",
                        fontWeight: "600",
                        opacity: loading || productsLoading ? 0.6 : 1
                    }}
                >
                    🔄 Refresh Dashboard
                </button>
            </div>

            {/* ================= PRODUCT INVENTORY ================= */}
            <section className="staff-inventory-section">
                <div className="staff-inventory-heading">
                    <div>
                        <h2>Product Inventory</h2>
                        <p>Live stock quantities available for order preparation.</p>
                    </div>
                    <span>{products.length} products</span>
                </div>

                {productsLoading ? (
                    <p className="staff-inventory-empty">Loading product quantities...</p>
                ) : products.length === 0 ? (
                    <p className="staff-inventory-empty">No product inventory found.</p>
                ) : (
                    <div className="staff-inventory-grid">
                        {products.map((product) => {
                            const stock = Number(product.stockQuantity ?? product.stock ?? product.availableQuantity ?? 0);
                            const mrp = getProductMrp(product);
                            const discount = getDiscountPercent(product);
                            return (
                                <article className="staff-inventory-card" key={product.id}>
                                    <div className="staff-inventory-product">
                                        {(product.imageUrl || product.image) ? (
                                            <img src={product.imageUrl || product.image} alt={product.name} />
                                        ) : <div className="staff-inventory-placeholder">🛒</div>}
                                        <div>
                                            <h3>{product.name}</h3>
                                            <p>{product.category?.name || product.category || "Daily Essentials"}</p>
                                        </div>
                                    </div>
                                    <div className="staff-inventory-meta">
                                        <span>Unit: <strong>{product.quantity || product.unit || "1 Unit"}</strong></span>
                                        <span>Price: <strong>{formatRupees(product.price)}</strong></span>
                                        <span>MRP: <strong>{formatRupees(mrp)}</strong></span>
                                        <span>Discount: <strong>{discount}%</strong></span>
                                    </div>
                                    <div className={`staff-stock-quantity ${stock <= 0 ? "is-empty" : stock <= 5 ? "is-low" : ""}`}>
                                        <span>Available quantity</span>
                                        <strong>{stock}</strong>
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                )}
            </section>

            {/* ================= ERROR ================= */}

            {error && (
                <div
                    style={{
                        maxWidth: "1200px",
                        margin: "0 auto 20px",
                        padding: "15px 20px",
                        backgroundColor: "#fee2e2",
                        color: "#991b1b",
                        border: "1px solid #fecaca",
                        borderRadius: "8px"
                    }}
                >
                    <strong>Error:</strong> {error}
                </div>
            )}

            {/* ================= LOADING ================= */}

            {loading ? (
                <div
                    style={{
                        maxWidth: "1200px",
                        margin: "40px auto",
                        backgroundColor: "#ffffff",
                        padding: "60px 30px",
                        textAlign: "center",
                        borderRadius: "12px"
                    }}
                >
                    <h2>
                        Loading Orders...
                    </h2>

                    <p>
                        Please wait while we load
                        customer orders.
                    </p>
                </div>
            ) : orders.length === 0 ? (
                <div
                    style={{
                        maxWidth: "1200px",
                        margin: "40px auto",
                        backgroundColor: "#ffffff",
                        padding: "60px 30px",
                        textAlign: "center",
                        borderRadius: "12px",
                        border: "1px solid #e2e8f0"
                    }}
                >
                    <div
                        style={{
                            fontSize: "50px"
                        }}
                    >
                        🛒
                    </div>

                    <h2>
                        No Active Orders
                    </h2>

                    <p>
                        There are currently no orders
                        waiting for processing.
                    </p>

                    <button
                        onClick={fetchOrders}
                        style={{
                            backgroundColor: "#16a34a",
                            color: "#ffffff",
                            border: "none",
                            padding: "12px 18px",
                            borderRadius: "8px",
                            cursor: "pointer",
                            fontWeight: "600"
                        }}
                    >
                        🔄 Refresh
                    </button>
                </div>
            ) : (
                <div
                    style={{
                        maxWidth: "1200px",
                        margin: "0 auto",
                        display: "flex",
                        flexDirection: "column",
                        gap: "20px"
                    }}
                >
                    {orders.map((order) => (
                        <div
                            key={order.id}
                            style={{
                                backgroundColor:
                                    "#ffffff",
                                padding: "25px",
                                borderRadius: "12px",
                                border:
                                    "1px solid #e2e8f0",
                                boxShadow:
                                    "0 2px 5px rgba(0,0,0,0.05)"
                            }}
                        >
                            {/* ============ ORDER HEADER ============ */}

                            <div
                                style={{
                                    display: "flex",
                                    justifyContent:
                                        "space-between",
                                    alignItems:
                                        "flex-start",
                                    gap: "20px",
                                    flexWrap: "wrap"
                                }}
                            >
                                <div>
                                    <h2
                                        style={{
                                            marginTop: 0
                                        }}
                                    >
                                        Order #{order.id}
                                    </h2>

                                    <p>
                                        <strong>
                                            Customer:
                                        </strong>{" "}
                                        {getCustomerName(
                                            order
                                        )}
                                    </p>

                                    <p>
                                        <strong>
                                            Email:
                                        </strong>{" "}
                                        {getCustomerEmail(
                                            order
                                        )}
                                    </p>
                                </div>

                                <span
                                    style={{
                                        ...getStatusStyle(
                                            order.status
                                        ),
                                        padding:
                                            "8px 14px",
                                        borderRadius:
                                            "20px",
                                        fontWeight:
                                            "700"
                                    }}
                                >
                                    {order.status ||
                                        "PENDING"}
                                </span>
                            </div>

                            <hr
                                style={{
                                    border:
                                        "none",
                                    borderTop:
                                        "1px solid #e2e8f0",
                                    margin:
                                        "20px 0"
                                }}
                            />

                            {/* ============ PRODUCTS ============ */}

                            <h3
                                style={{
                                    marginBottom:
                                        "15px"
                                }}
                            >
                                Ordered Products
                            </h3>

                            {order.items &&
                            order.items.length > 0 ? (
                                <div
                                    style={{
                                        display:
                                            "flex",
                                        flexDirection:
                                            "column",
                                        gap: "12px"
                                    }}
                                >
                                    {order.items.map(
                                        (
                                            item,
                                            index
                                        ) => {
                                            const image =
                                                getProductImage(
                                                    item
                                                );

                                            const productName =
                                                getProductName(
                                                    item
                                                );

                                            const quantity =
                                                getProductQuantity(
                                                    item
                                                );

                                            return (
                                                <div
                                                    key={
                                                        item.id ||
                                                        index
                                                    }
                                                    style={{
                                                        display:
                                                            "flex",
                                                        alignItems:
                                                            "center",
                                                        gap:
                                                            "15px",
                                                        padding:
                                                            "12px",
                                                        backgroundColor:
                                                            "#f8fafc",
                                                        borderRadius:
                                                            "8px",
                                                        border:
                                                            "1px solid #e2e8f0"
                                                    }}
                                                >
                                                    {image ? (
                                                        <img
                                                            src={
                                                                image
                                                            }
                                                            alt={
                                                                productName
                                                            }
                                                            style={{
                                                                width:
                                                                    "70px",
                                                                height:
                                                                    "70px",
                                                                objectFit:
                                                                    "cover",
                                                                borderRadius:
                                                                    "8px",
                                                                border:
                                                                    "1px solid #e2e8f0"
                                                            }}
                                                        />
                                                    ) : (
                                                        <div
                                                            style={{
                                                                width:
                                                                    "70px",
                                                                height:
                                                                    "70px",
                                                                display:
                                                                    "flex",
                                                                alignItems:
                                                                    "center",
                                                                justifyContent:
                                                                    "center",
                                                                backgroundColor:
                                                                    "#e2e8f0",
                                                                borderRadius:
                                                                    "8px",
                                                                fontSize:
                                                                    "12px",
                                                                textAlign:
                                                                    "center"
                                                            }}
                                                        >
                                                            No Image
                                                        </div>
                                                    )}

                                                    <div
                                                        style={{
                                                            flex: 1
                                                        }}
                                                    >
                                                        <h4
                                                            style={{
                                                                margin:
                                                                    "0 0 8px"
                                                            }}
                                                        >
                                                            {
                                                                productName
                                                            }
                                                        </h4>

                                                        <p
                                                            style={{
                                                                margin:
                                                                    "4px 0",
                                                                color:
                                                                    "#475569"
                                                            }}
                                                        >
                                                            <strong>
                                                                Quantity:
                                                            </strong>{" "}
                                                            {
                                                                quantity
                                                            }
                                                        </p>

                                                        {item.unitPrice && (
                                                            <p
                                                                style={{
                                                                    margin:
                                                                        "4px 0",
                                                                    color:
                                                                        "#475569"
                                                                }}
                                                            >
                                                                <strong>
                                                                    Price:
                                                                </strong>{" "}
                                                                ₹
                                                                {
                                                                    item.unitPrice
                                                                }
                                                            </p>
                                                        )}
                                                    </div>

                                                    <div
                                                        style={{
                                                            fontWeight:
                                                                "700"
                                                        }}
                                                    >
                                                        {item.subtotal
                                                            ? `₹${item.subtotal}`
                                                            : ""}
                                                    </div>
                                                </div>
                                            );
                                        }
                                    )}
                                </div>
                            ) : (
                                <p
                                    style={{
                                        color:
                                            "#64748b"
                                    }}
                                >
                                    No product details
                                    available.
                                </p>
                            )}

                            {/* ============ ORDER DETAILS ============ */}

                            <div
                                style={{
                                    display: "grid",
                                    gridTemplateColumns:
                                        "repeat(auto-fit, minmax(200px, 1fr))",
                                    gap: "15px",
                                    marginTop:
                                        "25px",
                                    paddingTop:
                                        "20px",
                                    borderTop:
                                        "1px solid #e2e8f0"
                                }}
                            >
                                <div>
                                    <strong>
                                        Total Amount
                                    </strong>

                                    <p>
                                        ₹
                                        {order.totalAmount ??
                                            order.total ??
                                            0}
                                    </p>
                                </div>

                                <div>
                                    <strong>
                                        Order Type
                                    </strong>

                                    <p>
                                        {order.orderType ||
                                            "N/A"}
                                    </p>
                                </div>

                                <div>
                                    <strong>
                                        Payment Method
                                    </strong>

                                    <p>
                                        {order.paymentMethod ||
                                            "N/A"}
                                    </p>
                                </div>

                                <div>
                                    <strong>
                                        Order Date
                                    </strong>

                                    <p>
                                        {formatDate(
                                            order.createdAt
                                        )}
                                    </p>
                                </div>

                                {order.deliveryAddress && (
                                    <div>
                                        <strong>
                                            Delivery Address
                                        </strong>

                                        <p>
                                            {
                                                order.deliveryAddress
                                            }
                                        </p>
                                    </div>
                                )}

                                {order.pickupSlot && (
                                    <div>
                                        <strong>
                                            Pickup Slot
                                        </strong>

                                        <p>
                                            {
                                                order.pickupSlot
                                            }
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* ============ STAFF ACTIONS ============ */}

                            <div
                                style={{
                                    display: "flex",
                                    justifyContent:
                                        "flex-end",
                                    gap: "10px",
                                    marginTop:
                                        "25px",
                                    flexWrap: "wrap"
                                }}
                            >
                                <button
                                    onClick={() =>
                                        updateOrderStatus(
                                            order.id,
                                            "PREPARING"
                                        )
                                    }
                                    disabled={
                                        order.status ===
                                        "PREPARING"
                                    }
                                    style={actionButton(
                                        "#0284c7",
                                        order.status ===
                                            "PREPARING"
                                    )}
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
                                    disabled={
                                        order.status ===
                                        "READY"
                                    }
                                    style={actionButton(
                                        "#16a34a",
                                        order.status ===
                                            "READY"
                                    )}
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
                                    disabled={
                                        order.status ===
                                        "COMPLETED"
                                    }
                                    style={actionButton(
                                        "#475569",
                                        order.status ===
                                            "COMPLETED"
                                    )}
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

export default StaffDashboard;