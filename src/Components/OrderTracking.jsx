import { useContext, useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import { CartContext, SHIPMENT_STAGES } from "../context/CartContext";

function OrderTracking() {
  const { orderId: paramOrderId } = useParams();
  const { getUserOrders, selectOrderForReceipt, isLoggedIn, userRole } = useContext(CartContext);
  const navigate = useNavigate();

  const visibleOrders = getUserOrders();
  const [lookupInput, setLookupInput] = useState(paramOrderId || "");
  const [activeOrder, setActiveOrder] = useState(null);

  useEffect(() => {
    if (paramOrderId) {
      setLookupInput(paramOrderId);
      const found = visibleOrders.find(
        (o) =>
          o.orderId.toLowerCase() === paramOrderId.toLowerCase() ||
          (o.trackingId && o.trackingId.toLowerCase() === paramOrderId.toLowerCase())
      );
      setActiveOrder(found || null);
    } else if (visibleOrders.length > 0 && !activeOrder) {
      setActiveOrder(visibleOrders[0]);
      setLookupInput(visibleOrders[0].orderId);
    }
  }, [paramOrderId, visibleOrders.length]);

  const handleLookup = (e) => {
    e.preventDefault();
    const q = lookupInput.trim().toLowerCase();
    if (!q) return;
    const found = visibleOrders.find(
      (o) =>
        o.orderId.toLowerCase() === q ||
        (o.trackingId && o.trackingId.toLowerCase() === q)
    );
    setActiveOrder(found || null);
  };

  const currentStage = activeOrder ? activeOrder.trackingStage ?? 0 : 0;
  const isMerchant = isLoggedIn && userRole === "merchant";

  return (
    <>
      <Header />

      <div className="tracking-page-container">
        <div className="orders-header">
          <h1>🚚 Live Campus Shipment Tracker</h1>
          <p>
            {isMerchant
              ? "Track any customer order across all campus accounts"
              : "Track your orders using your Order ID or Tracking ID"}
          </p>
        </div>

        <form className="tracking-search-form" onSubmit={handleLookup}>
          <input
            type="text"
            placeholder="Enter Order ID (e.g. KL-2026-...) or Tracking ID (TRK-KL-...)"
            value={lookupInput}
            onChange={(e) => setLookupInput(e.target.value)}
          />
          <button type="submit">Track Order</button>
        </form>

        {visibleOrders.length > 0 && (
          <div className="recent-track-pills">
            <span>{isMerchant ? "All Recent Orders:" : "Your Recent Orders:"}</span>
            {visibleOrders.slice(0, 5).map((ord) => (
              <button
                key={ord.orderId}
                type="button"
                className={`track-pill ${activeOrder?.orderId === ord.orderId ? "active" : ""}`}
                onClick={() => {
                  setLookupInput(ord.orderId);
                  setActiveOrder(ord);
                }}
              >
                {ord.orderId} ({ord.status})
              </button>
            ))}
          </div>
        )}

        {!activeOrder ? (
          <div className="empty-cart-message">
            <div className="empty-icon">📍</div>
            <h3>{visibleOrders.length === 0 ? "No shipments to track yet" : "Order not found"}</h3>
            <p>
              {visibleOrders.length === 0
                ? "Place an order from the store to receive a live Tracking ID."
                : "Double-check your Order ID or Tracking ID and try again."}
            </p>
            {!isMerchant && (
              <Link to="/products" className="btn">
                Browse Store
              </Link>
            )}
          </div>
        ) : (
          <div className="tracking-card">
            <div className="tracking-card-top">
              <div>
                <span className="tracking-chip">{activeOrder.trackingId || "TRK-KL"}</span>
                <h2>Order {activeOrder.orderId}</h2>
                <p>
                  Route: <strong>Vaddeswaram Central Store</strong> ➔{" "}
                  <strong>
                    {activeOrder.customer.hostelBlock} ({activeOrder.customer.roomNo})
                  </strong>
                </p>
              </div>
              <div className="tracking-eta-box">
                <span>Delivery Window</span>
                <strong>
                  {activeOrder.ecoPickup
                    ? "🌱 SAC Eco-Pickup Ready"
                    : activeOrder.deliverySlot || "Same-Day Campus Delivery"}
                </strong>
              </div>
            </div>

            <div className="tracking-stepper">
              {SHIPMENT_STAGES.map((stage, idx) => {
                const isDone = idx <= currentStage;
                const isCurrent = idx === currentStage;
                return (
                  <div
                    key={stage.key}
                    className={`stepper-node ${isDone ? "done" : ""} ${isCurrent ? "current" : ""}`}
                  >
                    <div className="stepper-circle">{isDone ? "✓" : idx + 1}</div>
                    <h4>{stage.label}</h4>
                    <p>{stage.note}</p>
                  </div>
                );
              })}
            </div>

            <div className="tracking-details-grid">
              <div className="tracking-log-box">
                <h3>📋 Dispatch Timeline</h3>
                <ul>
                  {(activeOrder.trackingHistory || []).map((entry, i) => (
                    <li key={i}>
                      <span className="log-time">{entry.timestamp}</span>
                      <div>
                        <strong>{entry.label}</strong>
                        <p>{entry.note}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="tracking-items-box">
                <h3>📦 Package Contents ({activeOrder.items.length})</h3>
                <ul>
                  {activeOrder.items.map((it, idx) => (
                    <li key={idx}>
                      <span>
                        {it.title}
                        {it.returnStatus ? ` (${it.returnStatus})` : ""}
                      </span>
                      <strong>×{it.quantity || 1}</strong>
                    </li>
                  ))}
                </ul>
                <div className="tracking-actions">
                  <button
                    type="button"
                    className="view-invoice-btn"
                    onClick={() => {
                      selectOrderForReceipt(activeOrder.orderId);
                      navigate(`/receipt/${activeOrder.orderId}`);
                    }}
                  >
                    🧾 View Official Tax Invoice
                  </button>
                  {isMerchant && (
                    <Link to="/merchant" className="merchant-hint-link">
                      Update stage in Merchant Console ➔
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </>
  );
}

export default OrderTracking;
