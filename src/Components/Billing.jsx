import { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import { CartContext, formatINR } from "../context/CartContext";

function Billing() {
  const {
    cart,
    username,
    studentId,
    email,
    calculateSubtotal,
    placeOrder
  } = useContext(CartContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: username === "yaswanth192006" ? "Yaswanth" : username || "Yaswanth",
    studentId: studentId || "2500030520",
    email: email || "2500030520@kluniversity.in",
    phone: "9876543210",
    hostelBlock: "Boys Hostel Block-1 (BH-1)",
    roomNo: "Room 312",
    campusArea: "KL University Main Campus, Vaddeswaram, Guntur - 522502",
    deliverySlot: "Afternoon (2:00 PM - 4:00 PM)",
    ecoPickup: false,
    splitCount: 1,
    deliveryNotes: "Deliver outside hostel reception",
    paymentMethod: "UPI",
    upiId: "yaswanth@oksbi",
    cardNumber: "4532 •••• •••• 8912",
    cardExpiry: "09/28",
    cardCvv: "321",
    cardName: "Yaswanth",
    bankName: "State Bank of India (KL Campus Branch)"
  });

  const [couponCode, setCouponCode] = useState("KL10");
  const [discountRate, setDiscountRate] = useState(0.1);
  const [couponMessage, setCouponMessage] = useState(
    "🎉 10% KL Student Discount Auto-Applied!"
  );

  const [gatewayOpen, setGatewayOpen] = useState(false);
  const [gatewayOtp, setGatewayOtp] = useState("123456");
  const [gatewayError, setGatewayError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const subtotal = calculateSubtotal();
  const discountAmount = subtotal * discountRate;
  const ecoCredit = formData.ecoPickup
    ? Math.min(50, Math.max(0, subtotal - discountAmount))
    : 0;
  const taxableAmount = Math.max(0, subtotal - discountAmount - ecoCredit);
  const taxAmount = taxableAmount * 0.05; // 5% GST
  const deliveryFee = 0;
  const grandTotal = taxableAmount + taxAmount + deliveryFee;
  const perPersonShare = grandTotal / Math.max(1, Number(formData.splitCount) || 1);

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    const code = couponCode.trim().toUpperCase();
    if (code === "KL10" || code === "KLU10") {
      setDiscountRate(0.1);
      setCouponMessage("🎉 Coupon 'KL10' applied! 10% student discount deducted.");
    } else {
      setDiscountRate(0);
      setCouponMessage("❌ Invalid coupon. Use 'KL10' for 10% student discount.");
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleOpenGateway = (e) => {
    e.preventDefault();

    if (cart.length === 0) {
      alert("Your cart is empty. Please add items before placing an order!");
      navigate("/products");
      return;
    }

    if (!formData.fullName.trim() || !formData.studentId.trim() || !formData.phone.trim()) {
      alert("Please fill in all required customer details.");
      return;
    }

    if (formData.paymentMethod === "UPI" && !formData.upiId.includes("@")) {
      alert("Please enter a valid UPI ID (e.g. name@oksbi).");
      return;
    }

    setGatewayError("");
    setGatewayOpen(true);
  };

  const handleAuthorizePayment = () => {
    if (
      (formData.paymentMethod === "CARD" || formData.paymentMethod === "NETBANKING") &&
      gatewayOtp.trim().length < 4
    ) {
      setGatewayError("Enter the 6-digit demo OTP (123456) to authorize.");
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      placeOrder({
        ...formData,
        discountApplied: discountRate > 0,
        discountRate,
        discountLabel: `Student Discount (${Math.round(discountRate * 100)}%)`
      });
      setIsSubmitting(false);
      setGatewayOpen(false);
      navigate("/receipt");
    }, 650);
  };

  if (cart.length === 0) {
    return (
      <>
        <Header />
        <div className="cart-container">
          <div className="empty-cart-message">
            <h3>No items in cart for billing</h3>
            <p>Please select items from the catalog before checking out.</p>
            <Link to="/products" className="btn">
              Go to Products
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

      <div className="billing-page-container">
        <div className="billing-header">
          <h1>🧾 Checkout & Campus Billing</h1>
          <p>Official student checkout with delivery slot scheduling, roommate split-pay & PayShield gateway</p>
        </div>

        <form onSubmit={handleOpenGateway} className="billing-layout">
          <div className="billing-left-col">
            <div className="billing-section-card">
              <div className="card-heading">
                <span className="step-num">1</span>
                <h3>Student & Customer Details</h3>
              </div>
              <div className="form-grid-2">
                <div className="form-group">
                  <label>Full Name *</label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>KL Student Roll ID *</label>
                  <input
                    type="text"
                    name="studentId"
                    value={formData.studentId}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
              <div className="form-grid-2">
                <div className="form-group">
                  <label>University Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Mobile Contact Number *</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="billing-section-card">
              <div className="card-heading">
                <span className="step-num">2</span>
                <h3>Hostel Delivery Address & Time Slot</h3>
              </div>
              <div className="form-grid-2">
                <div className="form-group">
                  <label>Hostel Block / Residence *</label>
                  <select
                    name="hostelBlock"
                    value={formData.hostelBlock}
                    onChange={handleChange}
                  >
                    <option value="Boys Hostel Block-1 (BH-1)">Boys Hostel Block-1 (BH-1)</option>
                    <option value="Boys Hostel Block-2 (BH-2)">Boys Hostel Block-2 (BH-2)</option>
                    <option value="Boys Hostel Block-3 (BH-3)">Boys Hostel Block-3 (BH-3)</option>
                    <option value="Girls Hostel Block-1 (GH-1)">Girls Hostel Block-1 (GH-1)</option>
                    <option value="Girls Hostel Block-2 (GH-2)">Girls Hostel Block-2 (GH-2)</option>
                    <option value="Day Scholar (SAC Pickup)">Day Scholar (Student Activity Center Pickup)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Room Number / Cabin *</label>
                  <input
                    type="text"
                    name="roomNo"
                    value={formData.roomNo}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="form-grid-2">
                <div className="form-group">
                  <label>Preferred Delivery Slot</label>
                  <select
                    name="deliverySlot"
                    value={formData.deliverySlot}
                    onChange={handleChange}
                    disabled={formData.ecoPickup}
                  >
                    <option value="Morning (9:00 AM - 11:00 AM)">Morning (9:00 AM - 11:00 AM)</option>
                    <option value="Afternoon (2:00 PM - 4:00 PM)">Afternoon (2:00 PM - 4:00 PM)</option>
                    <option value="Evening (5:00 PM - 8:00 PM)">Evening (5:00 PM - 8:00 PM)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Split Bill With Roommates</label>
                  <select
                    name="splitCount"
                    value={formData.splitCount}
                    onChange={handleChange}
                  >
                    <option value={1}>Just Me (1 Student)</option>
                    <option value={2}>Split 2 Ways (Roommates)</option>
                    <option value={3}>Split 3 Ways (Roommates)</option>
                    <option value={4}>Split 4 Ways (Roommates)</option>
                  </select>
                </div>
              </div>

              <label className="eco-pickup-toggle">
                <input
                  type="checkbox"
                  name="ecoPickup"
                  checked={formData.ecoPickup}
                  onChange={handleChange}
                />
                <div>
                  <strong>🌱 Green Campus Eco-Pickup at SAC Kiosk (-₹50.00 Instant Credit)</strong>
                  <span>Walk & collect from Student Activity Center to save delivery packaging.</span>
                </div>
              </label>

              <div className="form-group" style={{ marginTop: "12px" }}>
                <label>Special Delivery Instructions (Optional)</label>
                <input
                  type="text"
                  name="deliveryNotes"
                  value={formData.deliveryNotes}
                  onChange={handleChange}
                  placeholder="e.g. Call upon reaching hostel gate"
                />
              </div>
            </div>

            <div className="billing-section-card">
              <div className="card-heading">
                <span className="step-num">3</span>
                <h3>Secure Payment Gateway</h3>
              </div>

              <div className="payment-options-grid">
                <label className={`payment-pill ${formData.paymentMethod === "UPI" ? "active" : ""}`}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="UPI"
                    checked={formData.paymentMethod === "UPI"}
                    onChange={handleChange}
                  />
                  <span>📱 UPI (GPay / PhonePe / QR)</span>
                </label>

                <label className={`payment-pill ${formData.paymentMethod === "CARD" ? "active" : ""}`}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="CARD"
                    checked={formData.paymentMethod === "CARD"}
                    onChange={handleChange}
                  />
                  <span>💳 Credit / Debit Card</span>
                </label>

                <label className={`payment-pill ${formData.paymentMethod === "NETBANKING" ? "active" : ""}`}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="NETBANKING"
                    checked={formData.paymentMethod === "NETBANKING"}
                    onChange={handleChange}
                  />
                  <span>🏦 Net Banking</span>
                </label>

                <label className={`payment-pill ${formData.paymentMethod === "COD" ? "active" : ""}`}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="COD"
                    checked={formData.paymentMethod === "COD"}
                    onChange={handleChange}
                  />
                  <span>💵 Cash on Delivery</span>
                </label>
              </div>

              <div className="payment-details-box">
                {formData.paymentMethod === "UPI" && (
                  <div className="upi-details">
                    <p>Enter your Virtual Payment Address (UPI ID) — QR code available on next step:</p>
                    <div className="form-group">
                      <label>UPI ID (e.g., student@oksbi / 9876543210@paytm)</label>
                      <input
                        type="text"
                        name="upiId"
                        value={formData.upiId}
                        onChange={handleChange}
                        placeholder="yourname@upi"
                      />
                    </div>
                    <div className="upi-apps-icons">
                      <span className="app-badge">Google Pay</span>
                      <span className="app-badge">PhonePe</span>
                      <span className="app-badge">Paytm</span>
                      <span className="app-badge">BHIM</span>
                    </div>
                  </div>
                )}

                {formData.paymentMethod === "CARD" && (
                  <div className="card-details">
                    <div className="form-group">
                      <label>Card Number</label>
                      <input
                        type="text"
                        name="cardNumber"
                        value={formData.cardNumber}
                        onChange={handleChange}
                        placeholder="•••• •••• •••• ••••"
                      />
                    </div>
                    <div className="form-grid-3">
                      <div className="form-group">
                        <label>Expiry</label>
                        <input
                          type="text"
                          name="cardExpiry"
                          value={formData.cardExpiry}
                          onChange={handleChange}
                          placeholder="MM/YY"
                        />
                      </div>
                      <div className="form-group">
                        <label>CVV</label>
                        <input
                          type="password"
                          name="cardCvv"
                          value={formData.cardCvv}
                          onChange={handleChange}
                          placeholder="•••"
                          maxLength={4}
                        />
                      </div>
                      <div className="form-group">
                        <label>Cardholder Name</label>
                        <input
                          type="text"
                          name="cardName"
                          value={formData.cardName}
                          onChange={handleChange}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {formData.paymentMethod === "NETBANKING" && (
                  <div className="netbanking-details">
                    <div className="form-group">
                      <label>Select Your Bank</label>
                      <select
                        name="bankName"
                        value={formData.bankName}
                        onChange={handleChange}
                      >
                        <option value="State Bank of India (KL Campus Branch)">State Bank of India (KL Campus Branch)</option>
                        <option value="HDFC Bank">HDFC Bank</option>
                        <option value="ICICI Bank">ICICI Bank</option>
                        <option value="Axis Bank">Axis Bank</option>
                        <option value="KL Campus Smart Wallet">KL Campus Smart Wallet</option>
                      </select>
                    </div>
                  </div>
                )}

                {formData.paymentMethod === "COD" && (
                  <div className="cod-details">
                    <p>💵 Pay with Cash or UPI directly to our campus delivery staff when your package arrives at your hostel room.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="billing-right-col">
            <div className="billing-summary-card">
              <h3>Order Summary ({cart.length} item{cart.length > 1 ? "s" : ""})</h3>

              <div className="summary-items-scroll">
                {cart.map((item, idx) => (
                  <div className="summary-item-preview" key={idx}>
                    <img src={item.thumbnail} alt={item.title} />
                    <div className="preview-info">
                      <h4>{item.title}</h4>
                      <p>Qty: {item.quantity || 1} × {formatINR(item.price)}</p>
                    </div>
                    <span className="preview-total">
                      {formatINR((parseFloat(item.price) || 0) * (item.quantity || 1))}
                    </span>
                  </div>
                ))}
              </div>

              <div className="coupon-box">
                <label>Student Discount Coupon</label>
                <div className="coupon-input-group">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="Enter Coupon (e.g. KL10)"
                  />
                  <button type="button" onClick={handleApplyCoupon}>
                    Apply
                  </button>
                </div>
                {couponMessage && (
                  <p className={`coupon-msg ${discountRate > 0 ? "text-success" : "text-error"}`}>
                    {couponMessage}
                  </p>
                )}
              </div>

              <div className="billing-breakdown">
                <div className="b-row">
                  <span>Subtotal</span>
                  <span>{formatINR(subtotal)}</span>
                </div>
                {discountRate > 0 && (
                  <div className="b-row text-success">
                    <span>Discount ({Math.round(discountRate * 100)}%)</span>
                    <span>-{formatINR(discountAmount)}</span>
                  </div>
                )}
                {ecoCredit > 0 && (
                  <div className="b-row text-success">
                    <span>🌱 Eco-Pickup Credit</span>
                    <span>-{formatINR(ecoCredit)}</span>
                  </div>
                )}
                <div className="b-row">
                  <span>GST (5%)</span>
                  <span>{formatINR(taxAmount)}</span>
                </div>
                <div className="b-row text-success">
                  <span>Campus Delivery</span>
                  <span>FREE (₹0.00)</span>
                </div>
                <hr />
                <div className="b-row grand-total-row">
                  <span>Grand Total</span>
                  <span className="highlight-price">{formatINR(grandTotal)}</span>
                </div>
                {Number(formData.splitCount) > 1 && (
                  <div className="split-pay-callout">
                    👥 Split {formData.splitCount} ways: <strong>{formatINR(perPersonShare)} / student</strong>
                  </div>
                )}
              </div>

              <button type="submit" className="place-order-btn">
                Proceed to Payment Gateway ➔
              </button>

              <div className="security-guarantee">
                <p>🔒 KL PayShield Sandbox Gateway • Instant GST Receipt & Tracking ID</p>
              </div>
            </div>
          </div>
        </form>
      </div>

      {gatewayOpen && (
        <div className="modal-backdrop">
          <div className="gateway-modal">
            <div className="gateway-header">
              <div>
                <span className="gateway-badge">🔒 KL PayShield Sandbox Gateway</span>
                <h3>Authorize Payment — {formatINR(grandTotal)}</h3>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => !isSubmitting && setGatewayOpen(false)}
              >
                ✕
              </button>
            </div>

            <div className="gateway-body">
              {formData.paymentMethod === "UPI" && (
                <div className="gateway-upi-box">
                  <div className="qr-sim-box" aria-label="Simulated UPI QR">
                    <svg viewBox="0 0 100 100" width="110" height="110">
                      <rect width="100" height="100" fill="#ffffff" />
                      <rect x="6" y="6" width="26" height="26" fill="#1e2328" />
                      <rect x="11" y="11" width="16" height="16" fill="#ffffff" />
                      <rect x="15" y="15" width="8" height="8" fill="#1e2328" />
                      <rect x="68" y="6" width="26" height="26" fill="#1e2328" />
                      <rect x="73" y="11" width="16" height="16" fill="#ffffff" />
                      <rect x="77" y="15" width="8" height="8" fill="#1e2328" />
                      <rect x="6" y="68" width="26" height="26" fill="#1e2328" />
                      <rect x="11" y="73" width="16" height="16" fill="#ffffff" />
                      <rect x="15" y="77" width="8" height="8" fill="#1e2328" />
                      <rect x="40" y="12" width="8" height="8" fill="#e52e71" />
                      <rect x="52" y="20" width="8" height="8" fill="#1e2328" />
                      <rect x="40" y="40" width="20" height="20" fill="#ff8a00" />
                      <rect x="45" y="45" width="10" height="10" fill="#ffffff" />
                      <rect x="12" y="44" width="12" height="8" fill="#1e2328" />
                      <rect x="72" y="44" width="14" height="10" fill="#1e2328" />
                      <rect x="44" y="72" width="12" height="12" fill="#1e2328" />
                      <rect x="64" y="68" width="24" height="8" fill="#1e2328" />
                      <rect x="72" y="82" width="16" height="10" fill="#e52e71" />
                    </svg>
                  </div>
                  <p>
                    UPI Request sent to <strong>{formData.upiId}</strong>
                  </p>
                  <small>Simulated UPI collect request — click below to confirm approval.</small>
                </div>
              )}

              {(formData.paymentMethod === "CARD" || formData.paymentMethod === "NETBANKING") && (
                <div className="gateway-otp-box">
                  <p>
                    {formData.paymentMethod === "CARD"
                      ? `3D-Secure OTP Verification for Card ${formData.cardNumber}`
                      : `NetBanking Authorization for ${formData.bankName}`}
                  </p>
                  <div className="form-group">
                    <label>Enter Demo OTP (Default: 123456)</label>
                    <input
                      type="text"
                      value={gatewayOtp}
                      onChange={(e) => setGatewayOtp(e.target.value)}
                      maxLength={6}
                    />
                  </div>
                </div>
              )}

              {formData.paymentMethod === "COD" && (
                <div className="gateway-cod-box">
                  <p>
                    Confirm Cash on Delivery order of <strong>{formatINR(grandTotal)}</strong> to{" "}
                    <strong>{formData.hostelBlock}</strong> ({formData.roomNo}).
                  </p>
                </div>
              )}

              {gatewayError && <p className="auth-error-banner">{gatewayError}</p>}

              <div className="gateway-actions">
                <button
                  type="button"
                  className="cancel-btn"
                  disabled={isSubmitting}
                  onClick={() => setGatewayOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="place-order-btn"
                  disabled={isSubmitting}
                  onClick={handleAuthorizePayment}
                >
                  {isSubmitting ? "Authorizing..." : "Authorize & Complete Order ✓"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}

export default Billing;
