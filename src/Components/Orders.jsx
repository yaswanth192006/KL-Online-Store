import { useContext, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import { CartContext, SHIPMENT_STAGES, formatINR } from "../context/CartContext";

function Orders() {
  const {
    isLoggedIn,
    userRole,
    username,
    getUserOrders,
    selectOrderForReceipt,
    addReview,
    requestReturn
  } = useContext(CartContext);

  const [searchQuery, setSearchQuery] = useState("");
  const [reviewingItem, setReviewingItem] = useState(null); // { orderId, title }
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  const [returningItem, setReturningItem] = useState(null); // { orderId, title }
  const [returnReason, setReturnReason] = useState("Damaged / Defective");
  const [returnNote, setReturnNote] = useState("Item is damaged or defective. Requesting return pickup from hostel reception.");

  const [toastMsg, setToastMsg] = useState("");
  const navigate = useNavigate();

  // All ordered items view for all users belongs in Merchant Console only
  if (isLoggedIn && userRole === "merchant") {
    return <Navigate to="/merchant" replace />;
  }

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 2500);
  };

  if (!isLoggedIn) {
    return (
      <>
        <Header />
        <div className="orders-page-container">
          <div className="empty-cart-message">
            <div className="empty-icon">🔒</div>
            <h3>Sign in to view your orders</h3>
            <p>Each student can only view, review, and return items from their own account.</p>
            <Link to="/login" className="btn">
              Sign In
            </Link>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  const userOrders = getUserOrders();

  const filteredOrders = userOrders.filter((ord) => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return true;
    return (
      ord.orderId.toLowerCase().includes(q) ||
      (ord.trackingId && ord.trackingId.toLowerCase().includes(q)) ||
      (ord.status && ord.status.toLowerCase().includes(q)) ||
      (ord.items || []).some((it) => it.title.toLowerCase().includes(q))
    );
  });

  const handleOpenInvoice = (orderId) => {
    selectOrderForReceipt(orderId);
    navigate(`/receipt/${orderId}`);
  };

  const handleSubmitPurchaseReview = (e) => {
    e.preventDefault();
    if (!reviewingItem || !comment.trim()) return;
    const res = addReview(reviewingItem.title, {
      rating,
      comment
    });
    if (res && !res.ok) {
      showToast(res.message);
      return;
    }
    setReviewingItem(null);
    setComment("");
    setRating(5);
    showToast(`Verified review published for ${reviewingItem.title}!`);
  };

  const handleSubmitReturn = (e) => {
    e.preventDefault();
    if (!returningItem) return;
    const finalMessage =
      returnNote.trim() ||
      `Customer requested return due to: ${returnReason}. Please collect from hostel reception.`;
    requestReturn(returningItem.orderId, returningItem.title, returnReason, finalMessage);
    showToast(`Return requested for ${returningItem.title}.`);
    setReturningItem(null);
    setReturnReason("Damaged / Defective");
    setReturnNote("Item is damaged or defective. Requesting return pickup from hostel reception.");
  };

  const returnedItems = userOrders.flatMap((ord) =>
    (ord.items || [])
      .filter((it) => Boolean(it.returnStatus))
      .map((it) => ({
        ...it,
        orderId: ord.orderId,
        orderDate: ord.orderDate,
        customerName: ord.customer?.name,
        hostelBlock: ord.customer?.hostelBlock,
        roomNo: ord.customer?.roomNo
      }))
  );

  return (
    <>
      <Header />
      {toastMsg && <div className="toast-popup">✅ {toastMsg}</div>}

      <div className="orders-page-container">
        <div className="orders-header">
          <h1>📦 My Orders ({username})</h1>
          <p>View your own purchases, track shipments, request returns, and share your product review</p>
        </div>

        {userOrders.length === 0 ? (
          <div className="empty-cart-message">
            <div className="empty-icon">📦</div>
            <h3>No orders found for {username}</h3>
            <p>You haven't placed any orders under this login yet.</p>
            <Link to="/products" className="btn">
              Start Shopping
            </Link>
          </div>
        ) : (
          <>
            <div className="orders-search-bar">
              <input
                type="text"
                placeholder="🔍 Filter your orders by Order ID, Tracking ID, item name, or status..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="orders-list">
              {filteredOrders.map((order) => {
                const stageIdx = order.trackingStage ?? 0;
                return (
                  <div className="order-history-card" key={order.orderId}>
                    <div className="order-card-header">
                      <div>
                        <span className="order-id-label">Order ID:</span>
                        <strong className="order-id-value"> {order.orderId}</strong>
                        {order.trackingId && (
                          <span className="tracking-chip"> • {order.trackingId}</span>
                        )}
                        <span className="order-date"> • {order.orderDate}</span>
                      </div>
                      <div>
                        <span className={`order-status-badge stage-${stageIdx}`}>
                          {order.status}
                        </span>
                      </div>
                    </div>

                    <div className="mini-shipment-bar">
                      {SHIPMENT_STAGES.map((st, idx) => (
                        <div
                          key={st.key}
                          className={`mini-step ${idx <= stageIdx ? "done" : ""}`}
                        >
                          <span className="mini-dot">{idx <= stageIdx ? "✓" : idx + 1}</span>
                          <span className="mini-label">{st.label}</span>
                        </div>
                      ))}
                    </div>

                    <div className="order-card-body">
                      <div className="order-dest-info" style={{ gridColumn: "span 2" }}>
                        <p>
                          <strong>Deliver To:</strong> {order.customer.name} ({order.customer.studentId})
                        </p>
                        <p>
                          <strong>Location:</strong> {order.customer.hostelBlock}, {order.customer.roomNo}
                        </p>
                        <p>
                          <strong>Slot:</strong> {order.ecoPickup ? "🌱 SAC Eco-Pickup" : order.deliverySlot || "Standard"} •{" "}
                          <strong>Payment:</strong> {order.payment.method}
                        </p>
                      </div>

                      <div className="order-pricing-summary">
                        <p className="order-total-paid">Total: {formatINR(order.pricing.total)}</p>
                        {order.splitCount > 1 && (
                          <p className="split-mini-note">
                            👥 {formatINR(order.perPersonTotal)} × {order.splitCount} roommates
                          </p>
                        )}
                        <div className="order-action-btns">
                          <Link
                            to={`/tracking/${order.orderId}`}
                            className="track-order-btn"
                          >
                            🚚 Track Shipment
                          </Link>
                          <button
                            type="button"
                            className="view-invoice-btn"
                            onClick={() => handleOpenInvoice(order.orderId)}
                          >
                            🧾 Tax Invoice
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Per-Item Review & Return Section */}
                    <div className="order-items-manage-list">
                      {order.items.map((it, idx) => (
                        <div className="order-item-manage-row" key={idx}>
                          <div className="manage-item-left">
                            <img src={it.thumbnail} alt={it.title} />
                            <div>
                              <strong>{it.title}</strong>
                              <span>
                                Qty: {it.quantity || 1} × {formatINR(it.price)}
                              </span>
                            </div>
                          </div>

                          <div className="manage-item-actions">
                            {it.returnStatus ? (
                              <span className="return-status-pill">
                                ↩ {it.returnStatus} ({it.returnReason})
                              </span>
                            ) : (
                              <button
                                type="button"
                                className="return-item-btn"
                                onClick={() => {
                                  setReviewingItem(null);
                                  setReturningItem({ orderId: order.orderId, title: it.title });
                                }}
                              >
                                ↩ Return Item
                              </button>
                            )}

                            <button
                              type="button"
                              className="review-item-pill"
                              onClick={() => {
                                setReturningItem(null);
                                setReviewingItem({ orderId: order.orderId, title: it.title });
                              }}
                            >
                              ⭐ Write Review
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {reviewingItem && reviewingItem.orderId === order.orderId && (
                      <form className="inline-order-review-form" onSubmit={handleSubmitPurchaseReview}>
                        <strong>Share Your Opinion / Review for {reviewingItem.title}</strong>
                        <div className="review-form" style={{ marginTop: "8px", marginBottom: 0 }}>
                          <select
                            value={rating}
                            onChange={(e) => setRating(Number(e.target.value))}
                          >
                            <option value={5}>★★★★★ (5/5)</option>
                            <option value={4}>★★★★☆ (4/5)</option>
                            <option value={3}>★★★☆☆ (3/5)</option>
                            <option value={2}>★★☆☆☆ (2/5)</option>
                            <option value={1}>★☆☆☆☆ (1/5)</option>
                          </select>
                          <input
                            type="text"
                            placeholder="Mention your opinion about this purchased product..."
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            required
                          />
                          <button type="submit">Publish Review</button>
                          <button
                            type="button"
                            className="cancel-btn"
                            style={{ padding: "8px 12px" }}
                            onClick={() => setReviewingItem(null)}
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    )}

                    {returningItem && returningItem.orderId === order.orderId && (
                      <form className="inline-order-return-form" onSubmit={handleSubmitReturn}>
                        <strong>Request Return for {returningItem.title}</strong>
                        <div className="review-form" style={{ marginTop: "8px", marginBottom: 0 }}>
                          <select
                            value={returnReason}
                            onChange={(e) => {
                              const nextReason = e.target.value;
                              setReturnReason(nextReason);
                              setReturnNote(
                                `Returning item due to: ${nextReason}. Please collect from hostel reception.`
                              );
                            }}
                          >
                            <option value="Damaged / Defective">Damaged / Defective</option>
                            <option value="Wrong Item Delivered">Wrong Item Delivered</option>
                            <option value="Quality Not As Expected">Quality Not As Expected</option>
                            <option value="No Longer Needed">No Longer Needed</option>
                          </select>
                          <input
                            type="text"
                            placeholder="Enter message for merchant..."
                            value={returnNote}
                            onChange={(e) => setReturnNote(e.target.value)}
                            required
                          />
                          <button type="submit" className="return-submit-btn">Submit Return</button>
                          <button
                            type="button"
                            className="cancel-btn"
                            style={{ padding: "8px 12px" }}
                            onClick={() => setReturningItem(null)}
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    )}
                  </div>
                );
              })}
            </div>

            {returnedItems.length > 0 && (
              <section className="returned-items-section">
                <div className="returned-section-head">
                  <h2>↩ Returned Items ({returnedItems.length})</h2>
                  <p>Items you returned along with your submitted return message</p>
                </div>

                <div className="returned-cards-list">
                  {returnedItems.map((rit, idx) => (
                    <div className="returned-item-card" key={`${rit.orderId}-${rit.title}-${idx}`}>
                      <img src={rit.thumbnail} alt={rit.title} />
                      <div className="returned-item-info">
                        <div className="returned-item-top">
                          <strong>{rit.title}</strong>
                          <span className="return-status-pill">{rit.returnStatus}</span>
                        </div>
                        <p className="returned-meta">
                          Order: <strong>{rit.orderId}</strong> • Qty: {rit.quantity || 1} •{" "}
                          {formatINR((parseFloat(rit.price) || 0) * (rit.quantity || 1))}
                          {rit.returnRequestedAt ? ` • Requested: ${rit.returnRequestedAt}` : ""}
                        </p>
                        <div className="customer-return-msg-box">
                          <span>Customer Message ({rit.returnReason}):</span>{" "}
                          “{rit.returnNote || `Returning item due to: ${rit.returnReason}.`}”
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>

      <Footer />
    </>
  );
}

export default Orders;
