import { useContext, useState } from "react";
import { Link } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import { CartContext, SHIPMENT_STAGES, formatINR } from "../context/CartContext";

function downloadCSV(filename, rows) {
  if (!rows || rows.length === 0) return;
  const headers = Object.keys(rows[0]);
  const csv = [
    headers.join(","),
    ...rows.map((row) =>
      headers
        .map((h) => `"${String(row[h] ?? "").replace(/"/g, '""')}"`)
        .join(",")
    )
  ].join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function MerchantDashboard() {
  const {
    isLoggedIn,
    userRole,
    inventory,
    orders,
    itemRequests,
    pendingItemRequestsCount,
    addProduct,
    updateProduct,
    deleteProduct,
    resetInventory,
    advanceOrderStage,
    updateReturnStatus,
    approveExternalItemRequest,
    rejectExternalItemRequest
  } = useContext(CartContext);

  const [activeTab, setActiveTab] = useState("inventory");
  const [invSearch, setInvSearch] = useState("");
  const [orderFilter, setOrderFilter] = useState("all");
  const [toastMsg, setToastMsg] = useState("");

  const [showAddForm, setShowAddForm] = useState(false);
  const [newProd, setNewProd] = useState({
    title: "",
    category: "electronics",
    price: "",
    stock: "20",
    description: "",
    thumbnail: ""
  });

  const [editingProd, setEditingProd] = useState(null);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 2500);
  };

  if (!isLoggedIn || userRole !== "merchant") {
    return (
      <>
        <Header />
        <div className="merchant-gate-container">
          <div className="auth-card" style={{ maxWidth: "460px" }}>
            <h2>🔒 Merchant Access Only</h2>
            <p className="auth-subtitle">
              Inventory management, product editing, analytics, and order fulfillment are restricted to authenticated Merchant accounts.
            </p>
            <Link to="/login" className="btn" style={{ display: "inline-block" }}>
              Go to Login
            </Link>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  const totalRevenue = orders.reduce(
    (sum, ord) => sum + (parseFloat(ord.pricing?.total) || 0),
    0
  );
  const pendingOrdersCount = orders.filter((o) => (o.trackingStage ?? 0) < 3).length;
  const lowStockItems = inventory.filter((p) => (p.stock ?? 0) <= 10);
  const totalUnits = inventory.reduce((sum, p) => sum + (p.stock ?? 0), 0);

  const categoryStats = inventory.reduce((acc, item) => {
    const cat = item.category || "other";
    if (!acc[cat]) acc[cat] = { count: 0, value: 0 };
    acc[cat].count += 1;
    acc[cat].value += (parseFloat(item.price) || 0) * (item.stock ?? 0);
    return acc;
  }, {});
  const maxCatValue = Math.max(
    1,
    ...Object.values(categoryStats).map((c) => c.value)
  );

  const filteredInventory = inventory.filter(
    (p) =>
      p.title.toLowerCase().includes(invSearch.toLowerCase()) ||
      (p.category && p.category.toLowerCase().includes(invSearch.toLowerCase()))
  );

  const filteredOrders = orders.filter((o) => {
    if (orderFilter === "all") return true;
    return String(o.trackingStage ?? 0) === orderFilter;
  });

  const allReturnedItems = orders.flatMap((ord) =>
    (ord.items || [])
      .filter((it) => Boolean(it.returnStatus))
      .map((it) => ({
        ...it,
        orderId: ord.orderId,
        orderDate: ord.orderDate,
        customerName: ord.customer?.name,
        studentId: ord.customer?.studentId,
        ownerUsername: ord.ownerUsername || ord.customer?.studentId,
        hostelBlock: ord.customer?.hostelBlock,
        roomNo: ord.customer?.roomNo
      }))
  );

  const handleCreateProduct = (e) => {
    e.preventDefault();
    if (!newProd.title.trim()) return;
    addProduct(newProd);
    setNewProd({
      title: "",
      category: "electronics",
      price: "",
      stock: "20",
      description: "",
      thumbnail: ""
    });
    setShowAddForm(false);
    showToast("New product added to live catalog!");
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (!editingProd) return;
    updateProduct(editingProd.id, {
      title: editingProd.title,
      category: editingProd.category,
      price: editingProd.price,
      stock: editingProd.stock,
      description: editingProd.description,
      thumbnail: editingProd.thumbnail
    });
    setEditingProd(null);
    showToast("Product details updated!");
  };

  const handleExportInventory = () => {
    downloadCSV(
      "kl-online-store-inventory.csv",
      inventory.map((p) => ({
        ID: p.id,
        Title: p.title,
        Category: p.category,
        PriceINR: p.price,
        Stock: p.stock ?? 0,
        Rating: p.rating ?? 4.7
      }))
    );
    showToast("Inventory exported as CSV!");
  };

  const handleExportOrders = () => {
    if (orders.length === 0) {
      showToast("No orders to export yet.");
      return;
    }
    downloadCSV(
      "kl-online-store-orders.csv",
      orders.map((o) => ({
        OrderID: o.orderId,
        TrackingID: o.trackingId || "",
        Date: o.orderDate,
        Student: o.customer.name,
        RollID: o.customer.studentId,
        Hostel: o.customer.hostelBlock,
        PaymentMethod: o.payment.method,
        TotalINR: o.pricing.total,
        Status: o.status
      }))
    );
    showToast("Orders exported as CSV!");
  };

  return (
    <>
      <Header />
      {toastMsg && <div className="toast-popup">🏪 {toastMsg}</div>}

      <div className="merchant-container">
        <div className="merchant-top-banner">
          <div>
            <h1>🏪 Merchant Inventory & Order Console</h1>
            <p>Real-time stock management, product editor, analytics, and campus fulfillment</p>
          </div>
          <div className="merchant-top-actions">
            <button
              type="button"
              className="btn-outline-light"
              onClick={handleExportInventory}
            >
              ⬇ Export Inventory CSV
            </button>
            <button
              type="button"
              className="btn-outline-light"
              onClick={handleExportOrders}
            >
              ⬇ Export Orders CSV
            </button>
          </div>
        </div>

        {pendingItemRequestsCount > 0 && (
          <div className="merchant-notif-banner">
            <div>
              <strong>🔔 {pendingItemRequestsCount} New Customer Item Request{pendingItemRequestsCount > 1 ? "s" : ""}!</strong>
              <span>A customer ordered item(s) from external partner stores. Review to add to inventory or reject.</span>
            </div>
            <button
              type="button"
              onClick={() => setActiveTab("requests")}
            >
              Review Item Requests ➔
            </button>
          </div>
        )}

        <div className="merchant-kpi-grid">
          <div className="kpi-card">
            <span className="kpi-label">Total Sales Revenue</span>
            <strong className="kpi-value">{formatINR(totalRevenue)}</strong>
            <span className="kpi-sub">{orders.length} total order(s)</span>
          </div>
          <div className="kpi-card">
            <span className="kpi-label">Pending Fulfillments</span>
            <strong className="kpi-value">{pendingOrdersCount}</strong>
            <span className="kpi-sub">Active campus deliveries</span>
          </div>
          <div className="kpi-card">
            <span className="kpi-label">Catalog SKUs & Units</span>
            <strong className="kpi-value">{inventory.length}</strong>
            <span className="kpi-sub">{totalUnits} total units in stock</span>
          </div>
          <div className={`kpi-card ${lowStockItems.length > 0 ? "kpi-alert" : ""}`}>
            <span className="kpi-label">Low Stock Alerts (≤ 10)</span>
            <strong className="kpi-value">{lowStockItems.length}</strong>
            <span className="kpi-sub">
              {lowStockItems.length > 0 ? "Restock recommended" : "All SKUs healthy"}
            </span>
          </div>
        </div>

        <div className="merchant-chart-card">
          <h3>📊 Inventory Valuation by Category</h3>
          <div className="cat-bars-list">
            {Object.entries(categoryStats).map(([cat, stat]) => {
              const pct = Math.round((stat.value / maxCatValue) * 100);
              return (
                <div className="cat-bar-row" key={cat}>
                  <span className="cat-bar-name">{cat.toUpperCase()} ({stat.count})</span>
                  <div className="cat-bar-track">
                    <div className="cat-bar-fill" style={{ width: `${Math.max(6, pct)}%` }} />
                  </div>
                  <span className="cat-bar-val">{formatINR(stat.value)}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="merchant-tabs">
          <button
            type="button"
            className={activeTab === "inventory" ? "active" : ""}
            onClick={() => setActiveTab("inventory")}
          >
            📦 Inventory & Product Editor ({inventory.length})
          </button>
          <button
            type="button"
            className={activeTab === "orders" ? "active" : ""}
            onClick={() => setActiveTab("orders")}
          >
            🚚 All Customer Orders ({orders.length})
          </button>
          <button
            type="button"
            className={activeTab === "returns" ? "active" : ""}
            onClick={() => setActiveTab("returns")}
          >
            ↩ Returned Items ({allReturnedItems.length})
          </button>
          <button
            type="button"
            className={activeTab === "requests" ? "active" : ""}
            onClick={() => setActiveTab("requests")}
          >
            🔔 Item Requests ({pendingItemRequestsCount} pending)
          </button>
        </div>

        {activeTab === "inventory" && (
          <div className="merchant-panel">
            <div className="merchant-toolbar">
              <input
                type="text"
                placeholder="🔍 Search products by name or category..."
                value={invSearch}
                onChange={(e) => setInvSearch(e.target.value)}
              />
              <div className="toolbar-right-btns">
                <button
                  type="button"
                  className="add-prod-btn"
                  onClick={() => setShowAddForm((prev) => !prev)}
                >
                  {showAddForm ? "Close Form" : "+ Add New Product"}
                </button>
                <button
                  type="button"
                  className="reset-inv-btn"
                  onClick={() => {
                    resetInventory();
                    showToast("Catalog reset to default KL inventory.");
                  }}
                >
                  ↺ Reset Defaults
                </button>
              </div>
            </div>

            {showAddForm && (
              <form className="add-product-form" onSubmit={handleCreateProduct}>
                <h4>Add New Catalog Item</h4>
                <div className="form-grid-3">
                  <div className="form-group">
                    <label>Product Title *</label>
                    <input
                      type="text"
                      value={newProd.title}
                      onChange={(e) => setNewProd({ ...newProd, title: e.target.value })}
                      placeholder="e.g. Raspberry Pi 5 Starter Kit"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Category *</label>
                    <select
                      value={newProd.category}
                      onChange={(e) => setNewProd({ ...newProd, category: e.target.value })}
                    >
                      <option value="electronics">electronics</option>
                      <option value="laptops">laptops</option>
                      <option value="mobiles">mobiles</option>
                      <option value="accessories">accessories</option>
                      <option value="stationery">stationery</option>
                      <option value="grooming">grooming</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Price (INR ₹) *</label>
                    <input
                      type="number"
                      step="1"
                      min="1"
                      value={newProd.price}
                      onChange={(e) => setNewProd({ ...newProd, price: e.target.value })}
                      placeholder="1499"
                      required
                    />
                  </div>
                </div>
                <div className="form-grid-3">
                  <div className="form-group">
                    <label>Initial Stock *</label>
                    <input
                      type="number"
                      min="0"
                      value={newProd.stock}
                      onChange={(e) => setNewProd({ ...newProd, stock: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group" style={{ gridColumn: "span 2" }}>
                    <label>Image URL (optional)</label>
                    <input
                      type="url"
                      value={newProd.thumbnail}
                      onChange={(e) => setNewProd({ ...newProd, thumbnail: e.target.value })}
                      placeholder="https://images.unsplash.com/..."
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <input
                    type="text"
                    value={newProd.description}
                    onChange={(e) => setNewProd({ ...newProd, description: e.target.value })}
                    placeholder="Brief description for students..."
                  />
                </div>
                <button type="submit" className="save-prod-btn">
                  Save Product to Storefront
                </button>
              </form>
            )}

            <div className="inventory-table-wrap">
              <table className="inventory-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInventory.map((item) => {
                    const stock = item.stock ?? 0;
                    return (
                      <tr key={item.id}>
                        <td>
                          <div className="inv-prod-cell">
                            <img src={item.thumbnail} alt={item.title} />
                            <div>
                              <strong>
                                {item.title}{" "}
                                {item.sourcedFrom && (
                                  <span className="sourced-inv-badge">🌐 {item.sourcedFrom}</span>
                                )}
                              </strong>
                              <small>{item.description?.slice(0, 60)}...</small>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className="inv-cat-pill">{item.category}</span>
                        </td>
                        <td>
                          <strong>{formatINR(item.price)}</strong>
                        </td>
                        <td>
                          <span
                            className={`stock-pill ${
                              stock === 0 ? "stock-out" : stock <= 10 ? "stock-low" : "stock-ok"
                            }`}
                          >
                            {stock} units
                          </span>
                        </td>
                        <td>
                          <div className="inv-actions">
                            <button
                              type="button"
                              className="inv-btn restock"
                              onClick={() => {
                                updateProduct(item.id, { stock: stock + 5 });
                                showToast(`Restocked +5 for ${item.title}`);
                              }}
                            >
                              +5 Stock
                            </button>
                            <button
                              type="button"
                              className="inv-btn edit"
                              onClick={() => setEditingProd({ ...item })}
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              className="inv-btn del"
                              onClick={() => {
                                deleteProduct(item.id);
                                showToast(`Removed ${item.title}`);
                              }}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "orders" && (
          <div className="merchant-panel">
            <div className="merchant-toolbar">
              <select
                value={orderFilter}
                onChange={(e) => setOrderFilter(e.target.value)}
                className="category-select"
              >
                <option value="all">All Order Stages ({orders.length})</option>
                {SHIPMENT_STAGES.map((st, idx) => (
                  <option key={st.key} value={String(idx)}>
                    Stage {idx + 1}: {st.label}
                  </option>
                ))}
              </select>
            </div>

            {filteredOrders.length === 0 ? (
              <div className="empty-cart-message">
                <h3>No orders in this stage</h3>
                <p>Orders placed by students will appear here for fulfillment and tracking updates.</p>
              </div>
            ) : (
              <div className="merchant-orders-list">
                {filteredOrders.map((ord) => {
                  const stageIdx = ord.trackingStage ?? 0;
                  const isDelivered = stageIdx >= SHIPMENT_STAGES.length - 1;
                  return (
                    <div className="merchant-order-card" key={ord.orderId}>
                      <div className="m-order-top">
                        <div>
                          <strong>{ord.orderId}</strong> •{" "}
                          <span className="tracking-chip">{ord.trackingId || "TRK-KL"}</span> •{" "}
                          <span>{ord.orderDate}</span>
                        </div>
                        <span className={`order-status-badge stage-${stageIdx}`}>
                          {ord.status}
                        </span>
                      </div>

                      <div className="m-order-mid">
                        <div style={{ flex: 1 }}>
                          <p>
                            <strong>Candidate:</strong> {ord.customer.name} ({ord.customer.studentId}) •{" "}
                            <span>Login: <code>{ord.ownerUsername || ord.customer.studentId}</code></span>
                          </p>
                          <p>
                            <strong>Destination:</strong> {ord.customer.hostelBlock}, {ord.customer.roomNo}
                          </p>
                          <div className="merchant-order-items-box">
                            <strong>Ordered Items:</strong>
                            {ord.items.map((it, i) => (
                              <div className="merchant-item-line" key={i}>
                                <span>
                                  {it.title} ×{it.quantity || 1} ({formatINR((parseFloat(it.price) || 0) * (it.quantity || 1))})
                                </span>
                                {it.returnStatus && (
                                  <div className="merchant-return-ctrl">
                                    <span className="return-status-pill">
                                      ↩ {it.returnStatus}: {it.returnReason}
                                      {it.returnNote ? ` — "${it.returnNote}"` : ""}
                                    </span>
                                    {it.returnStatus === "Return Requested" && (
                                      <button
                                        type="button"
                                        className="inv-btn restock"
                                        onClick={() => {
                                          updateReturnStatus(ord.orderId, it.title, "Returned & Refunded");
                                          showToast(`Approved return & restocked ${it.title}`);
                                        }}
                                      >
                                        Approve Return & Restock
                                      </button>
                                    )}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="m-order-right">
                          <strong>{formatINR(ord.pricing.total)}</strong>
                          <span>{ord.payment.method}</span>
                        </div>
                      </div>

                      <div className="m-stage-controls">
                        <span>Set Shipment Stage:</span>
                        <div className="stage-pills-row">
                          {SHIPMENT_STAGES.map((st, idx) => (
                            <button
                              key={st.key}
                              type="button"
                              className={`stage-ctrl-btn ${idx === stageIdx ? "current" : idx < stageIdx ? "passed" : ""}`}
                              onClick={() => {
                                advanceOrderStage(ord.orderId, idx);
                                showToast(`${ord.orderId} updated to "${st.label}"`);
                              }}
                            >
                              {idx + 1}. {st.label}
                            </button>
                          ))}
                        </div>
                        {!isDelivered && (
                          <button
                            type="button"
                            className="advance-stage-btn"
                            onClick={() => {
                              const next = stageIdx + 1;
                              advanceOrderStage(ord.orderId, next);
                              showToast(`Advanced ${ord.orderId} to ${SHIPMENT_STAGES[next].label}`);
                            }}
                          >
                            Advance Next Stage ➔
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === "returns" && (
          <div className="merchant-panel">
            <div className="returned-section-head" style={{ marginBottom: "16px" }}>
              <h2>↩ Customer Returned Items ({allReturnedItems.length})</h2>
              <p>All items returned by customers along with their return reason and default/submitted message</p>
            </div>

            {allReturnedItems.length === 0 ? (
              <div className="empty-cart-message">
                <h3>No returned items yet</h3>
                <p>Items returned by students from their Orders page will appear here with their message.</p>
              </div>
            ) : (
              <div className="returned-cards-list">
                {allReturnedItems.map((rit, idx) => (
                  <div className="returned-item-card" key={`${rit.orderId}-${rit.title}-${idx}`}>
                    <img src={rit.thumbnail} alt={rit.title} />
                    <div className="returned-item-info">
                      <div className="returned-item-top">
                        <strong>{rit.title}</strong>
                        <span className="return-status-pill">{rit.returnStatus}</span>
                      </div>
                      <p className="returned-meta">
                        Customer: <strong>{rit.customerName}</strong> ({rit.studentId} • login: <code>{rit.ownerUsername}</code>) •{" "}
                        Order: <strong>{rit.orderId}</strong> • Qty: {rit.quantity || 1} •{" "}
                        {formatINR((parseFloat(rit.price) || 0) * (rit.quantity || 1))}
                      </p>
                      <p className="returned-meta">
                        Pickup Location: {rit.hostelBlock}, {rit.roomNo}
                        {rit.returnRequestedAt ? ` • Requested: ${rit.returnRequestedAt}` : ""}
                      </p>
                      <div className="customer-return-msg-box">
                        <span>Customer Message ({rit.returnReason}):</span>{" "}
                        “{rit.returnNote || `Returning item due to: ${rit.returnReason}. Please collect from hostel reception.`}”
                      </div>
                      {rit.returnStatus === "Return Requested" && (
                        <div style={{ marginTop: "10px" }}>
                          <button
                            type="button"
                            className="inv-btn restock"
                            onClick={() => {
                              updateReturnStatus(rit.orderId, rit.title, "Returned & Refunded");
                              showToast(`Approved return & restocked ${rit.title}`);
                            }}
                          >
                            ✓ Approve Return & Restock
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "requests" && (
          <div className="merchant-panel">
            <div className="returned-section-head" style={{ marginBottom: "16px" }}>
              <h2>🔔 Customer External Item Notifications ({itemRequests.length})</h2>
              <p>When customers order items not yet in KL inventory, approve to add to store inventory or reject</p>
            </div>

            {itemRequests.length === 0 ? (
              <div className="empty-cart-message">
                <h3>No external item requests yet</h3>
                <p>When a customer orders an external-store item via the AI Assistant, a notification appears here.</p>
              </div>
            ) : (
              <div className="returned-cards-list">
                {itemRequests.map((req) => (
                  <div className="returned-item-card request-item-card" key={req.requestId}>
                    <img src={req.thumbnail} alt={req.title} />
                    <div className="returned-item-info">
                      <div className="returned-item-top">
                        <strong>{req.title}</strong>
                        <span
                          className={`req-status-pill ${
                            req.status === "Pending"
                              ? "req-pending"
                              : req.status === "Rejected"
                              ? "req-rejected"
                              : "req-approved"
                          }`}
                        >
                          {req.status}
                        </span>
                      </div>
                      <p className="returned-meta">
                        Price: <strong>{formatINR(req.price)}</strong> • Category:{" "}
                        <strong>{req.category}</strong> • Source:{" "}
                        <strong>🌐 {req.storeName}</strong>
                      </p>
                      <p className="returned-meta">
                        Requested by: <strong>{req.requestedBy?.name}</strong> ({req.requestedBy?.studentId}) •{" "}
                        {req.requestedAt}
                      </p>
                      <p className="returned-meta">{req.description}</p>

                      {req.status === "Pending" && (
                        <div className="req-actions-row">
                          <button
                            type="button"
                            className="req-approve-btn"
                            onClick={() => {
                              approveExternalItemRequest(req.requestId);
                              showToast(`Added "${req.title}" to KL Inventory!`);
                            }}
                          >
                            ✓ Add to Inventory
                          </button>
                          <button
                            type="button"
                            className="req-reject-btn"
                            onClick={() => {
                              rejectExternalItemRequest(req.requestId);
                              showToast(`Rejected "${req.title}" request.`);
                            }}
                          >
                            ✕ Reject Item
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {editingProd && (
        <div className="modal-backdrop" onClick={() => setEditingProd(null)}>
          <div className="product-modal" style={{ maxWidth: "560px" }} onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="modal-close-btn"
              onClick={() => setEditingProd(null)}
            >
              ✕
            </button>
            <h3>Edit Product Details</h3>
            <form onSubmit={handleSaveEdit} className="edit-product-form">
              <div className="form-group">
                <label>Product Title</label>
                <input
                  type="text"
                  value={editingProd.title}
                  onChange={(e) => setEditingProd({ ...editingProd, title: e.target.value })}
                  required
                />
              </div>
              <div className="form-grid-3">
                <div className="form-group">
                  <label>Category</label>
                  <input
                    type="text"
                    value={editingProd.category}
                    onChange={(e) => setEditingProd({ ...editingProd, category: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Price (₹)</label>
                  <input
                    type="number"
                    step="1"
                    min="0"
                    value={editingProd.price}
                    onChange={(e) => setEditingProd({ ...editingProd, price: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Stock</label>
                  <input
                    type="number"
                    min="0"
                    value={editingProd.stock ?? 0}
                    onChange={(e) => setEditingProd({ ...editingProd, stock: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  rows="3"
                  value={editingProd.description || ""}
                  onChange={(e) => setEditingProd({ ...editingProd, description: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Thumbnail URL</label>
                <input
                  type="text"
                  value={editingProd.thumbnail || ""}
                  onChange={(e) => setEditingProd({ ...editingProd, thumbnail: e.target.value })}
                />
              </div>
              <div className="gateway-actions">
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => setEditingProd(null)}
                >
                  Cancel
                </button>
                <button type="submit" className="save-prod-btn">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}

export default MerchantDashboard;
