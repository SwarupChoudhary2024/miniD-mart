import { useState, useEffect } from "react";
import api from "../Services/api";
import { getProductMrp, getDiscountPercent, formatRupees } from "../Services/productPricing";
import "../css/AdminDashboard.css";

function AdminDashboard() {
    const [activeTab, setActiveTab] = useState("overview");

    const [products, setProducts] = useState([]);
    const [orders, setOrders] = useState([]);

    const [loading, setLoading] = useState(false);
    const [ordersLoading, setOrdersLoading] = useState(false);
    const [error, setError] = useState("");

    const [imageInputType, setImageInputType] = useState("file");

    const [showModal, setShowModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [savingProduct, setSavingProduct] = useState(false);

    const emptyProductForm = {
        name: "",
        category: "Grocery",
        productType: "",
        image: "",
        price: "",
        mrp: "",
        quantity: "",
        stock: ""
    };

    const [productForm, setProductForm] =
        useState(emptyProductForm);

    // =========================================================
    // INITIAL LOAD
    // =========================================================

    useEffect(() => {
        fetchProducts();
        fetchOrders();
    }, []);

    // =========================================================
    // LOAD DATA WHEN TAB CHANGES
    // =========================================================

    useEffect(() => {
        if (activeTab === "overview") {
            fetchProducts();
            fetchOrders();
        }

        if (activeTab === "products") {
            fetchProducts();
        }

        if (activeTab === "orders") {
            fetchOrders();
        }
    }, [activeTab]);

    // =========================================================
    // GET PRODUCTS
    // =========================================================

    const fetchProducts = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get("/products");

            setProducts(
                Array.isArray(response.data)
                    ? response.data
                    : []
            );
        } catch (err) {
            console.error(
                "PRODUCT FETCH ERROR:",
                err.response?.data || err
            );

            setError(
                err.response?.data?.message ||
                err.response?.data?.error ||
                "Failed to load products."
            );
        } finally {
            setLoading(false);
        }
    };

    // =========================================================
    // GET ALL ORDERS
    // =========================================================

    const fetchOrders = async () => {
        try {
            setOrdersLoading(true);
            setError("");

            const response =
                await api.get("/admin/orders");

            setOrders(
                Array.isArray(response.data)
                    ? response.data
                    : []
            );
        } catch (err) {
            console.error(
                "ADMIN ORDERS ERROR:",
                err.response?.data || err
            );

            setOrders([]);

            setError(
                err.response?.data?.message ||
                err.response?.data?.error ||
                "Failed to load orders."
            );
        } finally {
            setOrdersLoading(false);
        }
    };

    // =========================================================
    // FORM CHANGE
    // =========================================================

    const handleFormChange = (e) => {
        const { name, value } = e.target;

        setProductForm((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    // =========================================================
    // IMAGE FILE CHANGE
    // =========================================================

    const handleFileChange = (e) => {
        const file = e.target.files[0];

        if (!file) return;

        if (file.size > 2 * 1024 * 1024) {
            alert(
                "File size exceeds 2MB. Please choose a smaller image."
            );
            return;
        }

        if (!file.type.startsWith("image/")) {
            alert("Please select a valid image file.");
            return;
        }

        const reader = new FileReader();

        reader.onloadend = () => {
            setProductForm((prev) => ({
                ...prev,
                image: reader.result
            }));
        };

        reader.readAsDataURL(file);
    };

    // =========================================================
    // OPEN PRODUCT MODAL
    // =========================================================

    const handleOpenModal = async (product = null) => {
        if (product) {
            setEditingProduct(product);
            setProductForm({
                name: product.name || "",
                category: typeof product.category === "object" ? (product.category?.name || "Grocery") : (product.category || "Grocery"),
                productType: product.productType || product.product_type || "",
                image: product.image || product.imageUrl || "",
                price: product.price ?? "",
                mrp: product.mrp ?? product.maximumRetailPrice ?? product.price ?? "",
                quantity: product.quantity ?? product.unit ?? "",
                stock: product.stockQuantity ?? product.stock ?? product.availableQuantity ?? ""
            });
            setImageInputType("file");
            setShowModal(true);

            // Fetch the latest full product record when opening Edit.
            try {
                let response;
                try {
                    response = await api.get(`/admin/products/${product.id}`);
                } catch (adminDetailError) {
                    response = await api.get(`/products/${product.id}`);
                }
                const details = response.data?.product || response.data;
                if (details && typeof details === "object") {
                    setProductForm({
                        name: details.name ?? product.name ?? "",
                        category: typeof details.category === "object" ? (details.category?.name || "Grocery") : (details.category ?? product.category ?? "Grocery"),
                        productType: details.productType ?? details.product_type ?? product.productType ?? "",
                        image: details.image ?? details.imageUrl ?? product.image ?? product.imageUrl ?? "",
                        price: details.price ?? product.price ?? "",
                        mrp: details.mrp ?? details.maximumRetailPrice ?? product.mrp ?? product.price ?? "",
                        quantity: details.quantity ?? details.unit ?? product.quantity ?? "",
                        stock: details.stockQuantity ?? details.stock ?? details.availableQuantity ?? product.stockQuantity ?? product.stock ?? ""
                    });
                    setEditingProduct(details);
                }
            } catch (err) {
                // Some backends expose only GET /products; keep the already loaded product values.
                console.warn("Could not fetch product detail; using product list data.", err);
            }
        } else {
            setEditingProduct(null);
            setProductForm({ ...emptyProductForm });
            setImageInputType("file");
            setShowModal(true);
        }
    };

    // =========================================================
    // CLOSE PRODUCT MODAL
    // =========================================================

    const handleCloseModal = () => {
        if (savingProduct) return;

        setShowModal(false);
        setEditingProduct(null);

        setProductForm({
            ...emptyProductForm
        });
    };

    // =========================================================
    // VALIDATE PRODUCT
    // =========================================================

    const validateProduct = () => {
        if (!productForm.name.trim()) {
            return "Product name is required.";
        }

        if (!productForm.category.trim()) {
            return "Category is required.";
        }

        if (!productForm.productType.trim()) {
            return "Product type is required.";
        }

        if (
            productForm.price === "" ||
            Number(productForm.price) < 0
        ) {
            return "Enter a valid product price.";
        }

        if (
            productForm.mrp === "" ||
            Number(productForm.mrp) < Number(productForm.price)
        ) {
            return "MRP must be equal to or greater than the selling price.";
        }

        if (!productForm.quantity.trim()) {
            return "Product quantity is required.";
        }

        if (
            productForm.stock === "" ||
            Number(productForm.stock) < 0
        ) {
            return "Enter a valid stock quantity.";
        }

        return "";
    };

    // =========================================================
    // SAVE PRODUCT
    // =========================================================

    const handleSaveProduct = async (e) => {
        e.preventDefault();

        const validationError =
            validateProduct();

        if (validationError) {
            alert(validationError);
            return;
        }

        try {
            setSavingProduct(true);

            const productData = {
                name:
                    productForm.name.trim(),

                category:
                    productForm.category.trim(),

                productType:
                    productForm.productType.trim(),

                image:
                    productForm.image || "",

                price:
                    Number(productForm.price),

                mrp:
                    Number(productForm.mrp || productForm.price),

                quantity:
                    productForm.quantity.trim(),

                stockQuantity:
                    Number(productForm.stock)
            };

            let response;

            if (editingProduct) {
                response = await api.put(
                    `/admin/products/${editingProduct.id}`,
                    productData
                );

                setProducts((prev) =>
                    prev.map((product) =>
                        product.id ===
                        editingProduct.id
                            ? response.data
                            : product
                    )
                );
            } else {
                response = await api.post(
                    "/admin/products",
                    productData
                );

                if (response.data) {
                    setProducts((prev) => [
                        ...prev,
                        response.data
                    ]);
                }
            }

            handleCloseModal();

            alert(
                editingProduct
                    ? "Product updated successfully."
                    : "Product added successfully."
            );

            await fetchProducts();

        } catch (err) {
            console.error(
                "SAVE PRODUCT ERROR:",
                err.response?.data || err
            );

            const message =
                err.response?.data?.message ||
                err.response?.data?.error ||
                err.response?.data ||
                err.message ||
                "Failed to save product.";

            alert(
                typeof message === "string"
                    ? message
                    : "Failed to save product."
            );

        } finally {
            setSavingProduct(false);
        }
    };

    // =========================================================
    // DELETE PRODUCT
    // =========================================================

    const handleDeleteProduct = async (id) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this product?"
        );

        if (!confirmed) return;

        try {
            await api.delete(
                `/admin/products/${id}`
            );

            setProducts((prev) =>
                prev.filter(
                    (product) =>
                        product.id !== id
                )
            );

            alert(
                "Product deleted successfully."
            );

        } catch (err) {
            console.error(
                "DELETE PRODUCT ERROR:",
                err.response?.data || err
            );

            alert(
                err.response?.data?.message ||
                err.response?.data?.error ||
                "Failed to delete product."
            );
        }
    };

    // =========================================================
    // UPDATE ORDER STATUS
    // =========================================================

    const handleStatusChange = async (
        orderId,
        newStatus
    ) => {
        try {
            await api.patch(
                `/admin/orders/${orderId}/status`,
                null,
                {
                    params: {
                        status: newStatus
                    }
                }
            );

            setOrders((prev) =>
                prev.map((order) =>
                    order.id === orderId
                        ? {
                            ...order,
                            status: newStatus
                        }
                        : order
                )
            );

        } catch (err) {
            console.error(
                "ORDER STATUS ERROR:",
                err.response?.data || err
            );

            alert(
                err.response?.data?.message ||
                err.response?.data?.error ||
                "Unable to update order status."
            );
        }
    };

    // =========================================================
    // ORDER STATUS STYLE
    // =========================================================

    const getStatusStyle = (status) => {
        switch (status) {
            case "PENDING":
                return {
                    backgroundColor: "#fef3c7",
                    color: "#92400e"
                };

            case "PREPARING":
            case "READY":
            case "DISPATCHED":
                return {
                    backgroundColor: "#dbeafe",
                    color: "#1d4ed8"
                };

            case "COMPLETED":
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

    // =========================================================
    // FORMAT DATE
    // =========================================================

    const formatDate = (date) => {
        if (!date) return "N/A";

        try {
            return new Date(
                date
            ).toLocaleString("en-IN");
        } catch {
            return date;
        }
    };

    // =========================================================
    // GET CUSTOMER NAME
    // =========================================================

    const getCustomerName = (order) => {
        return (
            order.customerName ||
            order.user?.name ||
            order.customerEmail ||
            order.user?.email ||
            "Customer"
        );
    };

    // =========================================================
    // GET ORDER PRODUCT
    // =========================================================

    const getOrderProduct = (item) => {
        return item?.product || item;
    };

    // =========================================================
    // GET ORDER PRODUCT NAME
    // =========================================================

    const getOrderProductName = (item) => {
        const product =
            getOrderProduct(item);

        return (
            product?.name ||
            item?.productName ||
            "Product"
        );
    };

    // =========================================================
    // GET ORDER PRODUCT IMAGE
    // =========================================================

    const getOrderProductImage = (item) => {
        const product =
            getOrderProduct(item);

        return (
            product?.image ||
            product?.imageUrl ||
            item?.image ||
            item?.imageUrl ||
            ""
        );
    };

    // =========================================================
    // GET ORDER QUANTITY
    // =========================================================

    const getOrderQuantity = (item) => {
        return (
            item?.quantity ??
            item?.qty ??
            1
        );
    };

    // =========================================================
    // STYLES
    // =========================================================

    const cardStyle = {
        backgroundColor: "#ffffff",
        padding: "1.5rem",
        borderRadius: "10px",
        boxShadow:
            "0 1px 4px rgba(0,0,0,0.08)"
    };

    const cardStatStyle = {
        fontSize: "2rem",
        fontWeight: "bold",
        margin: "10px 0 0"
    };

    const thStyle = {
        padding: "12px",
        textAlign: "left",
        borderBottom:
            "1px solid #e2e8f0",
        whiteSpace: "nowrap"
    };

    const tdStyle = {
        padding: "12px",
        verticalAlign: "top",
        borderBottom:
            "1px solid #e2e8f0"
    };

    // =========================================================
    // RENDER
    // =========================================================

    return (
        <div
            className="admin-dashboard-root"
            style={{
                display: "flex",
                minHeight: "100vh",
                fontFamily: "sans-serif"
            }}
        >

            {/* ================= SIDEBAR ================= */}

            <aside
                style={{
                    width: "240px",
                    backgroundColor: "#1e293b",
                    color: "#fff",
                    padding: "1.5rem",
                    boxSizing: "border-box"
                }}
            >

                <h2
                    style={{
                        margin:
                            "0 0 2rem 0",
                        fontSize: "1.25rem",
                        color: "#38bdf8"
                    }}
                >
                    Mini D-Mart Admin
                </h2>

                <nav
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "0.5rem"
                    }}
                >

                    {[
                        "overview",
                        "products",
                        "orders"
                    ].map((tab) => (

                        <button
                            key={tab}
                            onClick={() =>
                                setActiveTab(tab)
                            }
                            style={{
                                padding: "10px 15px",
                                textAlign: "left",
                                textTransform:
                                    "capitalize",
                                backgroundColor:
                                    activeTab === tab
                                        ? "#0284c7"
                                        : "transparent",
                                color: "#fff",
                                border: "none",
                                borderRadius: "4px",
                                cursor: "pointer"
                            }}
                        >
                            {tab}
                        </button>

                    ))}

                </nav>

            </aside>

            {/* ================= MAIN ================= */}

            <main
                style={{
                    flex: 1,
                    padding: "2rem",
                    backgroundColor: "#f8fafc",
                    overflowX: "auto"
                }}
            >

                <header
                    style={{
                        marginBottom: "2rem"
                    }}
                >
                    <h1
                        style={{
                            textTransform:
                                "capitalize",
                            margin: 0
                        }}
                    >
                        {activeTab} Management
                    </h1>
                </header>

                {/* ================= ERROR ================= */}

                {error && (
                    <div
                        style={{
                            padding: "1rem",
                            backgroundColor:
                                "#fef2f2",
                            color: "#dc2626",
                            marginBottom: "1rem",
                            borderRadius: "6px"
                        }}
                    >
                        {error}
                    </div>
                )}

                {/* ================= OVERVIEW ================= */}

                {activeTab === "overview" && (

                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns:
                                "repeat(auto-fit, minmax(200px, 1fr))",
                            gap: "1.5rem"
                        }}
                    >

                        <div style={cardStyle}>
                            <h3>
                                Total Products
                            </h3>

                            <p style={cardStatStyle}>
                                {products.length}
                            </p>
                        </div>

                        <div style={cardStyle}>
                            <h3>
                                Total Orders
                            </h3>

                            <p style={cardStatStyle}>
                                {orders.length}
                            </p>
                        </div>

                        <div style={cardStyle}>
                            <h3>
                                Pending Orders
                            </h3>

                            <p style={cardStatStyle}>
                                {
                                    orders.filter(
                                        (order) =>
                                            order.status ===
                                            "PENDING"
                                    ).length
                                }
                            </p>
                        </div>

                        <div style={cardStyle}>
                            <h3>
                                Delivered Orders
                            </h3>

                            <p style={cardStatStyle}>
                                {
                                    orders.filter(
                                        (order) =>
                                            order.status ===
                                            "DELIVERED"
                                    ).length
                                }
                            </p>
                        </div>

                    </div>

                )}

                {/* ================= PRODUCTS ================= */}

                {activeTab === "products" && (

                    <div>

                        <div
                            style={{
                                display: "flex",
                                justifyContent:
                                    "space-between",
                                alignItems: "center",
                                marginBottom: "1.5rem"
                            }}
                        >

                            <h2>
                                Product Management
                            </h2>

                            <button
                                onClick={() =>
                                    handleOpenModal()
                                }
                                style={{
                                    backgroundColor:
                                        "#0284c7",
                                    color: "#fff",
                                    border: "none",
                                    padding:
                                        "10px 18px",
                                    borderRadius:
                                        "6px",
                                    cursor: "pointer"
                                }}
                            >
                                + Add Product
                            </button>

                        </div>

                        {loading ? (
                            <p>
                                Loading products...
                            </p>
                        ) : (

                            <div
                                style={{
                                    backgroundColor:
                                        "#fff",
                                    borderRadius:
                                        "8px",
                                    overflowX:
                                        "auto"
                                }}
                            >

                                <table
                                    style={{
                                        width: "100%",
                                        borderCollapse:
                                            "collapse"
                                    }}
                                >

                                    <thead>
                                        <tr>
                                            <th style={thStyle}>
                                                Image
                                            </th>

                                            <th style={thStyle}>
                                                Name
                                            </th>

                                            <th style={thStyle}>
                                                Category
                                            </th>

                                            <th style={thStyle}>
                                                Price
                                            </th>

                                            <th style={thStyle}>MRP</th>
                                            <th style={thStyle}>Discount</th>
                                            <th style={thStyle}>
                                                Stock
                                            </th>

                                            <th style={thStyle}>
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>

                                    <tbody>

                                        {products.length === 0 ? (

                                            <tr>
                                                <td
                                                    colSpan="8"
                                                    style={{
                                                        ...tdStyle,
                                                        textAlign:
                                                            "center"
                                                    }}
                                                >
                                                    No products found.
                                                </td>
                                            </tr>

                                        ) : (

                                            products.map(
                                                (product) => (

                                                    <tr
                                                        key={
                                                            product.id
                                                        }
                                                    >

                                                        <td
                                                            style={
                                                                tdStyle
                                                            }
                                                        >

                                                            {(
                                                                product.image ||
                                                                product.imageUrl
                                                            ) ? (

                                                                <img
                                                                    src={
                                                                        product.image ||
                                                                        product.imageUrl
                                                                    }
                                                                    alt={
                                                                        product.name
                                                                    }
                                                                    style={{
                                                                        width:
                                                                            "60px",
                                                                        height:
                                                                            "60px",
                                                                        objectFit:
                                                                            "cover",
                                                                        borderRadius:
                                                                            "6px"
                                                                    }}
                                                                />

                                                            ) : (

                                                                "No Image"

                                                            )}

                                                        </td>

                                                        <td
                                                            style={
                                                                tdStyle
                                                            }
                                                        >
                                                            {
                                                                product.name
                                                            }
                                                        </td>

                                                        <td
                                                            style={
                                                                tdStyle
                                                            }
                                                        >
                                                            {
                                                                product.category?.name || product.category || "—"
                                                            }
                                                        </td>

                                                        <td
                                                            style={
                                                                tdStyle
                                                            }
                                                        >
                                                            ₹
                                                            {
                                                                product.price
                                                            }
                                                        </td>

                                                        <td style={tdStyle}>
                                                            {formatRupees(getProductMrp(product))}
                                                        </td>

                                                        <td style={tdStyle}>
                                                            {getDiscountPercent(product)}% OFF
                                                        </td>

                                                        <td
                                                            style={
                                                                tdStyle
                                                            }
                                                        >
                                                            {
                                                                product.stockQuantity ??
                                                                product.stock ??
                                                                0
                                                            }
                                                        </td>

                                                        <td
                                                            style={
                                                                tdStyle
                                                            }
                                                        >

                                                            <button
                                                                onClick={() =>
                                                                    handleOpenModal(
                                                                        product
                                                                    )
                                                                }
                                                                style={{
                                                                    marginRight:
                                                                        "8px",
                                                                    padding:
                                                                        "7px 12px",
                                                                    cursor:
                                                                        "pointer"
                                                                }}
                                                            >
                                                                Edit
                                                            </button>

                                                            <button
                                                                onClick={() =>
                                                                    handleDeleteProduct(
                                                                        product.id
                                                                    )
                                                                }
                                                                style={{
                                                                    padding:
                                                                        "7px 12px",
                                                                    cursor:
                                                                        "pointer",
                                                                    backgroundColor:
                                                                        "#dc2626",
                                                                    color:
                                                                        "#fff",
                                                                    border:
                                                                        "none",
                                                                    borderRadius:
                                                                        "4px"
                                                                }}
                                                            >
                                                                Delete
                                                            </button>

                                                        </td>

                                                    </tr>

                                                )
                                            )

                                        )}

                                    </tbody>

                                </table>

                            </div>

                        )}

                    </div>

                )}

                {/* ================= ORDERS ================= */}

                {activeTab === "orders" && (

                    <div>

                        <h2>
                            Order Management
                        </h2>

                        {ordersLoading ? (

                            <p>
                                Loading orders...
                            </p>

                        ) : (

                            <div
                                style={{
                                    backgroundColor:
                                        "#fff",
                                    borderRadius:
                                        "8px",
                                    overflowX:
                                        "auto",
                                    boxShadow:
                                        "0 1px 4px rgba(0,0,0,0.08)"
                                }}
                            >

                                <table
                                    style={{
                                        width: "100%",
                                        borderCollapse:
                                            "collapse",
                                        minWidth:
                                            "1100px"
                                    }}
                                >

                                    <thead>

                                        <tr>

                                            <th style={thStyle}>
                                                Order ID
                                            </th>

                                            <th style={thStyle}>
                                                Customer
                                            </th>

                                            <th style={thStyle}>
                                                Products
                                            </th>

                                            <th style={thStyle}>
                                                Amount
                                            </th>

                                            <th style={thStyle}>
                                                Order Type
                                            </th>

                                            <th style={thStyle}>
                                                Payment
                                            </th>

                                            <th style={thStyle}>
                                                Date
                                            </th>

                                            <th style={thStyle}>
                                                Status
                                            </th>

                                        </tr>

                                    </thead>

                                    <tbody>

                                        {orders.length === 0 ? (

                                            <tr>

                                                <td
                                                    colSpan="8"
                                                    style={{
                                                        ...tdStyle,
                                                        textAlign:
                                                            "center"
                                                    }}
                                                >
                                                    No orders found.
                                                </td>

                                            </tr>

                                        ) : (

                                            orders.map(
                                                (order) => (

                                                    <tr
                                                        key={
                                                            order.id
                                                        }
                                                    >

                                                        {/* ORDER ID */}

                                                        <td
                                                            style={
                                                                tdStyle
                                                            }
                                                        >
                                                            #
                                                            {
                                                                order.id
                                                            }
                                                        </td>

                                                        {/* CUSTOMER */}

                                                        <td
                                                            style={
                                                                tdStyle
                                                            }
                                                        >
                                                            {
                                                                getCustomerName(
                                                                    order
                                                                )
                                                            }
                                                        </td>

                                                        {/* PRODUCTS */}

                                                        <td
                                                            style={{
                                                                ...tdStyle,
                                                                minWidth:
                                                                    "280px"
                                                            }}
                                                        >

                                                            {order.items &&
                                                            order.items
                                                                .length >
                                                                0 ? (

                                                                <div
                                                                    style={{
                                                                        display:
                                                                            "flex",
                                                                        flexDirection:
                                                                            "column",
                                                                        gap:
                                                                            "10px"
                                                                    }}
                                                                >

                                                                    {order.items.map(
                                                                        (
                                                                            item,
                                                                            index
                                                                        ) => {

                                                                            const image =
                                                                                getOrderProductImage(
                                                                                    item
                                                                                );

                                                                            const productName =
                                                                                getOrderProductName(
                                                                                    item
                                                                                );

                                                                            const quantity =
                                                                                getOrderQuantity(
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
                                                                                            "12px",
                                                                                        paddingBottom:
                                                                                            "10px",
                                                                                        borderBottom:
                                                                                            index !==
                                                                                            order
                                                                                                .items
                                                                                                .length -
                                                                                                1
                                                                                                ? "1px solid #e2e8f0"
                                                                                                : "none"
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
                                                                                                    "55px",
                                                                                                height:
                                                                                                    "55px",
                                                                                                objectFit:
                                                                                                    "cover",
                                                                                                borderRadius:
                                                                                                    "6px",
                                                                                                border:
                                                                                                    "1px solid #e2e8f0"
                                                                                            }}
                                                                                        />

                                                                                    ) : (

                                                                                        <div
                                                                                            style={{
                                                                                                width:
                                                                                                    "55px",
                                                                                                height:
                                                                                                    "55px",
                                                                                                display:
                                                                                                    "flex",
                                                                                                alignItems:
                                                                                                    "center",
                                                                                                justifyContent:
                                                                                                    "center",
                                                                                                backgroundColor:
                                                                                                    "#e2e8f0",
                                                                                                borderRadius:
                                                                                                    "6px",
                                                                                                fontSize:
                                                                                                    "10px",
                                                                                                textAlign:
                                                                                                    "center"
                                                                                            }}
                                                                                        >
                                                                                            No Image
                                                                                        </div>

                                                                                    )}

                                                                                    <div>

                                                                                        <div
                                                                                            style={{
                                                                                                fontWeight:
                                                                                                    "600"
                                                                                            }}
                                                                                        >
                                                                                            {
                                                                                                productName
                                                                                            }
                                                                                        </div>

                                                                                        <div
                                                                                            style={{
                                                                                                fontSize:
                                                                                                    "13px",
                                                                                                color:
                                                                                                    "#64748b",
                                                                                                marginTop:
                                                                                                    "4px"
                                                                                            }}
                                                                                        >
                                                                                            Quantity:{" "}
                                                                                            {
                                                                                                quantity
                                                                                            }
                                                                                        </div>

                                                                                    </div>

                                                                                </div>

                                                                            );
                                                                        }
                                                                    )}

                                                                </div>

                                                            ) : (

                                                                <span
                                                                    style={{
                                                                        color:
                                                                            "#64748b"
                                                                    }}
                                                                >
                                                                    No products
                                                                </span>

                                                            )}

                                                        </td>

                                                        {/* AMOUNT */}

                                                        <td
                                                            style={
                                                                tdStyle
                                                            }
                                                        >
                                                            ₹
                                                            {
                                                                order.totalAmount ??
                                                                0
                                                            }
                                                        </td>

                                                        {/* ORDER TYPE */}

                                                        <td
                                                            style={
                                                                tdStyle
                                                            }
                                                        >
                                                            {
                                                                order.orderType ||
                                                                "N/A"
                                                            }
                                                        </td>

                                                        {/* PAYMENT */}

                                                        <td
                                                            style={
                                                                tdStyle
                                                            }
                                                        >
                                                            {
                                                                order.paymentMethod ||
                                                                "N/A"
                                                            }
                                                        </td>

                                                        {/* DATE */}

                                                        <td
                                                            style={
                                                                tdStyle
                                                            }
                                                        >
                                                            {
                                                                formatDate(
                                                                    order.createdAt
                                                                )
                                                            }
                                                        </td>

                                                        {/* STATUS */}

                                                        <td
                                                            style={
                                                                tdStyle
                                                            }
                                                        >

                                                            <select
                                                                value={
                                                                    order.status ||
                                                                    "PENDING"
                                                                }
                                                                onChange={(
                                                                    e
                                                                ) =>
                                                                    handleStatusChange(
                                                                        order.id,
                                                                        e.target
                                                                            .value
                                                                    )
                                                                }
                                                                style={{
                                                                    ...getStatusStyle(
                                                                        order.status
                                                                    ),
                                                                    padding:
                                                                        "7px",
                                                                    border:
                                                                        "none",
                                                                    borderRadius:
                                                                        "5px",
                                                                    cursor:
                                                                        "pointer",
                                                                    fontWeight:
                                                                        "600"
                                                                }}
                                                            >

                                                                <option value="PENDING">
                                                                    PENDING
                                                                </option>

                                                                <option value="PREPARING">
                                                                    PREPARING
                                                                </option>

                                                                <option value="READY">
                                                                    READY
                                                                </option>

                                                                <option value="DISPATCHED">
                                                                    DISPATCHED
                                                                </option>

                                                                <option value="DELIVERED">
                                                                    DELIVERED
                                                                </option>

                                                                <option value="COMPLETED">
                                                                    COMPLETED
                                                                </option>

                                                                <option value="CANCELLED">
                                                                    CANCELLED
                                                                </option>

                                                            </select>

                                                        </td>

                                                    </tr>

                                                )
                                            )

                                        )}

                                    </tbody>

                                </table>

                            </div>

                        )}

                    </div>

                )}

            </main>

            {/* ================= PRODUCT MODAL ================= */}

            {showModal && (

                <div
                    style={{
                        position: "fixed",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor:
                            "rgba(0,0,0,0.5)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        zIndex: 1000,
                        padding: "20px"
                    }}
                >

                    <div
                        style={{
                            backgroundColor: "#fff",
                            width: "100%",
                            maxWidth: "600px",
                            maxHeight: "90vh",
                            overflowY: "auto",
                            borderRadius: "10px",
                            padding: "25px"
                        }}
                    >

                        <div
                            style={{
                                display: "flex",
                                justifyContent:
                                    "space-between",
                                alignItems: "center",
                                marginBottom:
                                    "20px"
                            }}
                        >

                            <h2
                                style={{
                                    margin: 0
                                }}
                            >
                                {editingProduct
                                    ? "Edit Product"
                                    : "Add Product"}
                            </h2>

                            <button
                                onClick={
                                    handleCloseModal
                                }
                                disabled={
                                    savingProduct
                                }
                                style={{
                                    border: "none",
                                    background:
                                        "transparent",
                                    fontSize:
                                        "24px",
                                    cursor:
                                        "pointer"
                                }}
                            >
                                ×
                            </button>

                        </div>

                        <form
                            onSubmit={
                                handleSaveProduct
                            }
                        >

                            <div
                                style={{
                                    display: "grid",
                                    gridTemplateColumns:
                                        "repeat(auto-fit, minmax(220px, 1fr))",
                                    gap: "15px"
                                }}
                            >

                                <div>
                                    <label>
                                        Product Name
                                    </label>

                                    <input
                                        type="text"
                                        name="name"
                                        value={
                                            productForm.name
                                        }
                                        onChange={
                                            handleFormChange
                                        }
                                        style={{
                                            width: "100%",
                                            padding:
                                                "10px",
                                            marginTop:
                                                "5px",
                                            boxSizing:
                                                "border-box"
                                        }}
                                    />
                                </div>

                                <div>
                                    <label>
                                        Category
                                    </label>

                                    <input
                                        type="text"
                                        name="category"
                                        value={
                                            productForm.category
                                        }
                                        onChange={
                                            handleFormChange
                                        }
                                        style={{
                                            width: "100%",
                                            padding:
                                                "10px",
                                            marginTop:
                                                "5px",
                                            boxSizing:
                                                "border-box"
                                        }}
                                    />
                                </div>

                                <div>
                                    <label>
                                        Product Type
                                    </label>

                                    <input
                                        type="text"
                                        name="productType"
                                        value={
                                            productForm.productType
                                        }
                                        onChange={
                                            handleFormChange
                                        }
                                        style={{
                                            width: "100%",
                                            padding:
                                                "10px",
                                            marginTop:
                                                "5px",
                                            boxSizing:
                                                "border-box"
                                        }}
                                    />
                                </div>

                                <div>
                                    <label>
                                        Quantity
                                    </label>

                                    <input
                                        type="text"
                                        name="quantity"
                                        value={
                                            productForm.quantity
                                        }
                                        onChange={
                                            handleFormChange
                                        }
                                        placeholder="1 kg / 500 g / 1 litre"
                                        style={{
                                            width: "100%",
                                            padding:
                                                "10px",
                                            marginTop:
                                                "5px",
                                            boxSizing:
                                                "border-box"
                                        }}
                                    />
                                </div>

                                <div>
                                    <label>
                                        Price
                                    </label>

                                    <input
                                        type="number"
                                        name="price"
                                        value={
                                            productForm.price
                                        }
                                        onChange={
                                            handleFormChange
                                        }
                                        style={{
                                            width: "100%",
                                            padding:
                                                "10px",
                                            marginTop:
                                                "5px",
                                            boxSizing:
                                                "border-box"
                                        }}
                                    />
                                </div>

                                <div>
                                    <label>
                                        MRP
                                    </label>

                                    <input
                                        type="number"
                                        name="mrp"
                                        value={
                                            productForm.mrp
                                        }
                                        onChange={
                                            handleFormChange
                                        }
                                        style={{
                                            width: "100%",
                                            padding:
                                                "10px",
                                            marginTop:
                                                "5px",
                                            boxSizing:
                                                "border-box"
                                        }}
                                    />
                                </div>

                                <div className="admin-discount-preview">
                                    <label>Customer Discount</label>
                                    <strong>{getDiscountPercent({ price: productForm.price, mrp: productForm.mrp })}% OFF</strong>
                                    <small>
                                        Customer saves {formatRupees(Math.max(0, Number(productForm.mrp || 0) - Number(productForm.price || 0)))}
                                    </small>
                                </div>

                                <div>
                                    <label>
                                        Stock Quantity
                                    </label>

                                    <input
                                        type="number"
                                        name="stock"
                                        value={
                                            productForm.stock
                                        }
                                        onChange={
                                            handleFormChange
                                        }
                                        style={{
                                            width: "100%",
                                            padding:
                                                "10px",
                                            marginTop:
                                                "5px",
                                            boxSizing:
                                                "border-box"
                                        }}
                                    />
                                </div>

                            </div>

                            <div
                                style={{
                                    marginTop:
                                        "20px"
                                }}
                            >

                                <label
                                    style={{
                                        marginRight:
                                            "15px"
                                    }}
                                >
                                    <input
                                        type="radio"
                                        checked={
                                            imageInputType ===
                                            "file"
                                        }
                                        onChange={() =>
                                            setImageInputType(
                                                "file"
                                            )
                                        }
                                    />

                                    {" "}Upload Image
                                </label>

                                <label>
                                    <input
                                        type="radio"
                                        checked={
                                            imageInputType ===
                                            "url"
                                        }
                                        onChange={() =>
                                            setImageInputType(
                                                "url"
                                            )
                                        }
                                    />

                                    {" "}Image URL
                                </label>

                            </div>

                            <div
                                style={{
                                    marginTop:
                                        "15px"
                                }}
                            >

                                {imageInputType ===
                                "file" ? (

                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={
                                            handleFileChange
                                        }
                                    />

                                ) : (

                                    <input
                                        type="text"
                                        name="image"
                                        value={
                                            productForm.image
                                        }
                                        onChange={
                                            handleFormChange
                                        }
                                        placeholder="Enter image URL"
                                        style={{
                                            width: "100%",
                                            padding:
                                                "10px",
                                            boxSizing:
                                                "border-box"
                                        }}
                                    />

                                )}

                            </div>

                            {productForm.image && (

                                <div
                                    style={{
                                        marginTop:
                                            "15px"
                                    }}
                                >

                                    <img
                                        src={
                                            productForm.image
                                        }
                                        alt="Preview"
                                        style={{
                                            width:
                                                "120px",
                                            height:
                                                "120px",
                                            objectFit:
                                                "cover",
                                            borderRadius:
                                                "8px"
                                        }}
                                    />

                                </div>

                            )}

                            <div
                                style={{
                                    display:
                                        "flex",
                                    justifyContent:
                                        "flex-end",
                                    gap:
                                        "10px",
                                    marginTop:
                                        "25px"
                                }}
                            >

                                <button
                                    type="button"
                                    onClick={
                                        handleCloseModal
                                    }
                                    disabled={
                                        savingProduct
                                    }
                                    style={{
                                        padding:
                                            "10px 18px",
                                        cursor:
                                            "pointer"
                                    }}
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    disabled={
                                        savingProduct
                                    }
                                    style={{
                                        padding:
                                            "10px 18px",
                                        backgroundColor:
                                            "#0284c7",
                                        color:
                                            "#fff",
                                        border:
                                            "none",
                                        borderRadius:
                                            "5px",
                                        cursor:
                                            "pointer"
                                    }}
                                >
                                    {savingProduct
                                        ? "Saving..."
                                        : editingProduct
                                            ? "Update Product"
                                            : "Save Product"}
                                </button>

                            </div>

                        </form>

                    </div>

                </div>

            )}

        </div>
    );
}

export default AdminDashboard;