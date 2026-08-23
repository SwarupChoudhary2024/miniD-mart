import { useState, useEffect } from "react";
import api from "../Services/api";

function AdminDashboard() {
    const [activeTab, setActiveTab] = useState("overview");
    const [products, setProducts] = useState([]);
    const [orders, setOrders] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // Input mode toggle: "url" or "file"
    const [imageInputType, setImageInputType] = useState("file");

    const [showModal, setShowModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [productForm, setProductForm] = useState({
        name: "",
        category: "Grocery",
        productType: "",
        image: "",
        price: "",
        mrp: "",
        quantity: "",
        stock: ""
    });

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        setLoading(true);
        setError("");
        try {
            const productsRes = await api.get("/products").catch(() => ({ data: [] }));
            setProducts(productsRes.data || []);
        } catch (err) {
            console.error("Dashboard Fetch Error:", err);
            setError("Failed to load dashboard data.");
        } finally {
            setLoading(false);
        }
    };

    const handleFormChange = (e) => {
        setProductForm({
            ...productForm,
            [e.target.name]: e.target.value
        });
    };

    // Handle Local Device File Selection
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                alert("File size exceeds 2MB limit. Please choose a smaller image.");
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setProductForm((prev) => ({
                    ...prev,
                    image: reader.result // Base64 Data URL string
                }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleOpenModal = (product = null) => {
        if (product) {
            setEditingProduct(product);
            setProductForm({
                name: product.name || "",
                category: product.category || "Grocery",
                productType: product.productType || "",
                image: product.image || "",
                price: product.price || "",
                mrp: product.mrp || "",
                quantity: product.quantity || "",
                stock: product.stock || ""
            });
        } else {
            setEditingProduct(null);
            setProductForm({
                name: "",
                category: "Grocery",
                productType: "",
                image: "",
                price: "",
                mrp: "",
                quantity: "",
                stock: ""
            });
        }
        setShowModal(true);
    };

    const handleSaveProduct = async (e) => {
        e.preventDefault();
        try {
            if (editingProduct) {
                await api.put(`/admin/products/${editingProduct.id}`, productForm);
                setProducts(products.map(p => p.id === editingProduct.id ? { ...p, ...productForm } : p));
            } else {
                const res = await api.post("/admin/products", productForm);
                setProducts([...products, res.data || { ...productForm, id: Date.now() }]);
            }
            setShowModal(false);
        } catch (err) {
            console.error("Save product error:", err);
            alert("Failed to save product. Check backend configuration.");
        }
    };

    const handleDeleteProduct = async (id) => {
        if (!window.confirm("Are you sure you want to delete this product?")) return;
        try {
            await api.delete(`/admin/products/${id}`);
            setProducts(products.filter(p => p.id !== id));
        } catch (err) {
            console.error("Delete error:", err);
            setProducts(products.filter(p => p.id !== id));
        }
    };

    return (
        <div style={{ display: "flex", minHeight: "100vh", fontFamily: "sans-serif" }}>
            {/* SIDEBAR */}
            <aside style={{ width: "240px", backgroundColor: "#1e293b", color: "#fff", padding: "1.5rem" }}>
                <h2 style={{ margin: "0 0 2rem 0", fontSize: "1.25rem", color: "#38bdf8" }}>Mini D-Mart Admin</h2>
                <nav style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                    {["overview", "products", "orders", "users"].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            style={{
                                padding: "10px 15px",
                                textAlign: "left",
                                textTransform: "capitalize",
                                backgroundColor: activeTab === tab ? "#0284c7" : "transparent",
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

            {/* MAIN CONTENT AREA */}
            <main style={{ flex: 1, padding: "2rem", backgroundColor: "#f8fafc" }}>
                <header style={{ marginBottom: "2rem" }}>
                    <h1 style={{ textTransform: "capitalize", margin: 0 }}>{activeTab} Management</h1>
                </header>

                {error && <div style={{ padding: "1rem", backgroundColor: "#fef2f2", color: "#dc2626", marginBottom: "1rem" }}>{error}</div>}

                {/* OVERVIEW TAB */}
                {activeTab === "overview" && (
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1.5rem" }}>
                        <div style={cardStyle}>
                            <h3>Total Products</h3>
                            <p style={cardStatStyle}>{products.length}</p>
                        </div>
                        <div style={cardStyle}>
                            <h3>Total Orders</h3>
                            <p style={cardStatStyle}>{orders.length}</p>
                        </div>
                        <div style={cardStyle}>
                            <h3>Total Users</h3>
                            <p style={cardStatStyle}>{users.length}</p>
                        </div>
                    </div>
                )}

                {/* PRODUCTS TAB */}
                {activeTab === "products" && (
                    <div>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem" }}>
                            <h3>Product Inventory</h3>
                            <button
                                onClick={() => handleOpenModal()}
                                style={{ backgroundColor: "#16a34a", color: "#fff", border: "none", padding: "8px 16px", borderRadius: "4px", cursor: "pointer" }}
                            >
                                + Add Product
                            </button>
                        </div>

                        <table style={{ width: "100%", borderCollapse: "collapse", backgroundColor: "#fff" }}>
                            <thead>
                                <tr style={{ backgroundColor: "#e2e8f0", textAlign: "left" }}>
                                    <th style={thStyle}>Image</th>
                                    <th style={thStyle}>Name</th>
                                    <th style={thStyle}>Type</th>
                                    <th style={thStyle}>Category</th>
                                    <th style={thStyle}>Price (₹)</th>
                                    <th style={thStyle}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {products.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" style={{ padding: "1rem", textAlign: "center" }}>No products found.</td>
                                    </tr>
                                ) : (
                                    products.map((p) => (
                                        <tr key={p.id} style={{ borderBottom: "1px solid #e2e8f0" }}>
                                            <td style={tdStyle}>
                                                {p.image ? (
                                                    <img src={p.image} alt={p.name} style={{ width: "40px", height: "40px", objectFit: "cover", borderRadius: "4px" }} />
                                                ) : (
                                                    <div style={{ width: "40px", height: "40px", backgroundColor: "#cbd5e1", borderRadius: "4px" }} />
                                                )}
                                            </td>
                                            <td style={tdStyle}>{p.name}</td>
                                            <td style={tdStyle}>{p.productType || "N/A"}</td>
                                            <td style={tdStyle}>{p.category}</td>
                                            <td style={tdStyle}>₹{p.price}</td>
                                            <td style={tdStyle}>
                                                <button onClick={() => handleOpenModal(p)} style={{ marginRight: "8px", cursor: "pointer" }}>Edit</button>
                                                <button onClick={() => handleDeleteProduct(p.id)} style={{ color: "red", cursor: "pointer" }}>Delete</button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* ORDERS TAB */}
                {activeTab === "orders" && (
                    <div style={{ backgroundColor: "#fff", padding: "1.5rem", borderRadius: "8px" }}>
                        <p>Order management table integration ready.</p>
                    </div>
                )}

                {/* USERS TAB */}
                {activeTab === "users" && (
                    <div style={{ backgroundColor: "#fff", padding: "1.5rem", borderRadius: "8px" }}>
                        <p>Registered user accounts interface ready.</p>
                    </div>
                )}
            </main>

            {/* PRODUCT MODAL */}
            {showModal && (
                <div style={modalOverlayStyle}>
                    <div style={modalContentStyle}>
                        <h2>{editingProduct ? "Edit Product" : "Add New Product"}</h2>
                        <form onSubmit={handleSaveProduct} style={{ display: "flex", flexDirection: "column", gap: "1rem", marginTop: "1rem" }}>
                            <input type="text" name="name" placeholder="Product Name" value={productForm.name} onChange={handleFormChange} required style={inputStyle} />
                            
                            {/* TEXT INPUT FOR PRODUCT TYPE */}
                            <input 
                                type="text" 
                                name="productType" 
                                placeholder="Product Type (e.g. Organic, Packaged, Perishable)" 
                                value={productForm.productType} 
                                onChange={handleFormChange} 
                                required 
                                style={inputStyle} 
                            />

                            <select name="category" value={productForm.category} onChange={handleFormChange} style={inputStyle}>
                                <option value="Grocery">Grocery</option>
                                <option value="Dairy">Dairy</option>
                                <option value="Beverages">Beverages</option>
                                <option value="Snacks">Snacks</option>
                            </select>

                            {/* DUAL IMAGE INPUT SELECTION */}
                            <div>
                                <label style={{ fontSize: "0.85rem", color: "#64748b", display: "block", marginBottom: "4px" }}>Product Image Source:</label>
                                <div style={{ display: "flex", gap: "1rem", marginBottom: "8px" }}>
                                    <label style={{ fontSize: "0.85rem" }}>
                                        <input type="radio" value="file" checked={imageInputType === "file"} onChange={() => setImageInputType("file")} /> Choose from Device
                                    </label>
                                    <label style={{ fontSize: "0.85rem" }}>
                                        <input type="radio" value="url" checked={imageInputType === "url"} onChange={() => setImageInputType("url")} /> Web URL Link
                                    </label>
                                </div>

                                {imageInputType === "file" ? (
                                    <input type="file" accept="image/*" onChange={handleFileChange} style={inputStyle} />
                                ) : (
                                    <input type="url" name="image" placeholder="Image URL (https://...)" value={productForm.image} onChange={handleFormChange} style={inputStyle} />
                                )}

                                {productForm.image && (
                                    <div style={{ marginTop: "8px" }}>
                                        <p style={{ fontSize: "0.75rem", color: "#64748b", margin: "0 0 4px 0" }}>Preview:</p>
                                        <img src={productForm.image} alt="Preview" style={{ width: "60px", height: "60px", objectFit: "cover", borderRadius: "4px", border: "1px solid #cbd5e1" }} />
                                    </div>
                                )}
                            </div>

                            <input type="number" name="price" placeholder="Price (₹)" value={productForm.price} onChange={handleFormChange} required style={inputStyle} />
                            <input type="number" name="mrp" placeholder="MRP (₹)" value={productForm.mrp} onChange={handleFormChange} required style={inputStyle} />
                            <input type="text" name="quantity" placeholder="Quantity (e.g. 1 kg / 500ml)" value={productForm.quantity} onChange={handleFormChange} required style={inputStyle} />
                            
                            <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem" }}>
                                <button type="button" onClick={() => setShowModal(false)} style={{ padding: "8px 16px" }}>Cancel</button>
                                <button type="submit" style={{ padding: "8px 16px", backgroundColor: "#0284c7", color: "#fff", border: "none" }}>Save</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

const cardStyle = { backgroundColor: "#fff", padding: "1.5rem", borderRadius: "8px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" };
const cardStatStyle = { fontSize: "2rem", fontWeight: "bold", color: "#0284c7", margin: "0.5rem 0 0 0" };
const thStyle = { padding: "12px", borderBottom: "2px solid #cbd5e1" };
const tdStyle = { padding: "12px", verticalAlign: "middle" };
const inputStyle = { padding: "8px", borderRadius: "4px", border: "1px solid #ccc", width: "100%", boxSizing: "border-box" };
const modalOverlayStyle = { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center" };
const modalContentStyle = { backgroundColor: "#fff", padding: "2rem", borderRadius: "8px", width: "420px", maxHeight: "90vh", overflowY: "auto" };

export default AdminDashboard;