import { useContext } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import { CartContext, formatINR } from "../context/CartContext";

function Receipt() {
  const { orderId } = useParams();
  const { latestOrder, selectedOrderId, getUserOrders, isLoggedIn, userRole } = useContext(CartContext);
  const navigate = useNavigate();

  const visibleOrders = getUserOrders();
  const targetId = orderId || selectedOrderId;
  const order =
    (targetId && visibleOrders.find((o) => o.orderId === targetId)) ||
    (latestOrder && visibleOrders.find((o) => o.orderId === latestOrder.orderId)) ||
    (visibleOrders && visibleOrders[0]);
  const isMerchant = isLoggedIn && userRole === "merchant";

  const handlePrint = () => {
    window.print();
  };

  if (!order) {
    return (
      <>
        <Header />
        <div className="cart-container">
          <div className="empty-cart-message">
            <h3>No recent order found</h3>
            <p>You haven't placed any order yet during this session.</p>
            <Link to="/products" className="btn">
              Browse Store
            </Link>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />

      <div className="receipt-page-container">
        <div className="receipt-actions-header no-print">
          <div className="order-success-banner">
            <span className="success-icon">🎉</span>
            <div>
              <h2>Official Campus Tax Invoice</h2>
              <p>
                Order <strong>{order.orderId}</strong> • Tracking ID:{" "}
                <strong>{order.trackingId || "TRK-KL"}</strong>
              </p>
            </div>
          </div>

          <div className="action-buttons-group">
            <button className="print-btn" onClick={handlePrint}>
              🖨️ Print Tax Invoice / Save PDF
            </button>
            <button
              className="track-btn-receipt"
              onClick={() => navigate(`/tracking/${order.orderId}`)}
            >
              🚚 Track Shipment
            </button>
            <button
              className="view-orders-btn"
              onClick={() => navigate(isMerchant ? "/merchant" : "/orders")}
            >
              📦 {isMerchant ? "Back to Merchant Console" : "View My Orders"}
            </button>
            <Link to="/products" className="shop-more-btn">
              🏬 Continue Shopping
            </Link>
          </div>
        </div>

        <div className="invoice-paper" id="printable-invoice">
          <div className="invoice-header">
            <div className="invoice-brand">
              <h1>🏬 KL Online Store</h1>
              <p className="university-name">K L Deemed to be University</p>
              <p className="store-address">
                Official Campus Store, Green Fields, Vaddeswaram,<br />
                Guntur District, Andhra Pradesh - 522502<br />
                <strong>GSTIN:</strong> 37AAATK1234F1Z5 | <strong>Auth ID:</strong> KL/STU/2026
              </p>
            </div>
            <div className="invoice-meta">
              <span className="tax-invoice-title">TAX INVOICE / RECEIPT</span>
              <p><strong>Order ID:</strong> {order.orderId}</p>
              {order.trackingId && <p><strong>Tracking ID:</strong> {order.trackingId}</p>}
              <p><strong>Date & Time:</strong> {order.orderDate}</p>
              <p>
                <strong>Payment Mode:</strong> {order.payment.method} ({order.payment.transactionId})
              </p>
              <span className={`status-pill ${order.payment.method === "COD" ? "status-cod" : "status-paid"}`}>
                {order.payment.status}
              </span>
            </div>
          </div>

          <hr className="invoice-divider" />

          <div className="invoice-parties-grid">
            <div className="party-box">
              <h4>Billed To (Student):</h4>
              <p className="student-name"><strong>{order.customer.name}</strong></p>
              <p><strong>Roll Number:</strong> {order.customer.studentId}</p>
              <p><strong>Email:</strong> {order.customer.email}</p>
              <p><strong>Phone:</strong> {order.customer.phone}</p>
              {order.splitCount > 1 && (
                <p className="text-success">
                  <strong>Roommate Split:</strong> {order.splitCount} ways ({formatINR(order.perPersonTotal)} / student)
                </p>
              )}
            </div>

            <div className="party-box">
              <h4>Hostel Delivery Address:</h4>
              <p><strong>Hostel:</strong> {order.customer.hostelBlock}</p>
              <p><strong>Room / Cabin:</strong> {order.customer.roomNo}</p>
              <p>
                <strong>Delivery Slot:</strong>{" "}
                {order.ecoPickup ? "Express SAC Eco-Pickup" : order.deliverySlot || "Standard"}
              </p>
              <p><strong>Campus:</strong> {order.customer.campusArea}</p>
              <p><strong>Shipment Status:</strong> <span className="text-success">{order.status}</span></p>
            </div>
          </div>

          <table className="invoice-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Item Description</th>
                <th className="text-center">Qty</th>
                <th className="text-right">Unit Price</th>
                <th className="text-right">Total Amount</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>
                    <strong>{item.title}</strong>
                  </td>
                  <td className="text-center">{item.quantity || 1}</td>
                  <td className="text-right">{formatINR(item.price)}</td>
                  <td className="text-right">
                    {formatINR((parseFloat(item.price) || 0) * (item.quantity || 1))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="invoice-bottom-grid">
            <div className="invoice-terms">
              <h5>Terms & Conditions:</h5>
              <ol>
                <li>This is an officially verified computer-generated student receipt for KL University purchases.</li>
                <li>Items delivered during your selected hostel slot or SAC Eco-Pickup kiosk.</li>
                <li>Valid for student lab and hackathon expenditure reimbursements.</li>
                <li>For campus delivery inquiries, contact: <code>2500030520@kluniversity.in</code>.</li>
              </ol>
            </div>

            <div className="invoice-totals-box">
              <div className="tot-row">
                <span>Items Subtotal:</span>
                <span>{formatINR(order.pricing.subtotal)}</span>
              </div>
              {parseFloat(order.pricing.discount) > 0 && (
                <div className="tot-row text-success">
                  <span>{order.pricing.discountLabel || "Student Discount"}:</span>
                  <span>-{formatINR(order.pricing.discount)}</span>
                </div>
              )}
              {parseFloat(order.pricing.ecoCredit || 0) > 0 && (
                <div className="tot-row text-success">
                  <span>🌱 Eco-Pickup Credit:</span>
                  <span>-{formatINR(order.pricing.ecoCredit)}</span>
                </div>
              )}
              <div className="tot-row">
                <span>GST Tax (5%):</span>
                <span>+{formatINR(order.pricing.tax)}</span>
              </div>
              <div className="tot-row text-success">
                <span>Hostel Delivery Fee:</span>
                <span>FREE (₹0.00)</span>
              </div>
              <hr />
              <div className="tot-row grand-total">
                <span>Grand Total:</span>
                <span>{formatINR(order.pricing.total)}</span>
              </div>
            </div>
          </div>

          <div className="invoice-footer-sign">
            <div className="signature-box">
              <div className="signature-line">Authorized Signatory</div>
              <p>KL University Store In-Charge</p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}

export default Receipt;
