import { useContext, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import RecommendedShelf from "./RecommendedShelf";
import { CartContext, formatINR } from "../context/CartContext";

function Cart() {
  const {
    cart,
    isLoggedIn,
    userRole,
    removeFromCart,
    updateQuantity,
    clearCart,
    calculateSubtotal,
    getProductStock
  } = useContext(CartContext);
  const navigate = useNavigate();
  const [toastMsg, setToastMsg] = useState("");

  if (isLoggedIn && userRole === "merchant") {
    return <Navigate to="/merchant" replace />;
  }

  const subtotal = calculateSubtotal();

  const handleProceedToBilling = () => {
    navigate("/billing");
  };

  const handleAdded = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 2500);
  };

  return (
    <>
      <Header />
      {toastMsg && <div className="toast-popup">🛒 {toastMsg}</div>}

      <div className="cart-container">
        <div className="cart-header-title">
          <h1>🛒 Your Campus Shopping Cart</h1>
          <p>Review your selected items before proceeding to billing & hostel delivery</p>
        </div>

        {cart.length === 0 ? (
          <div className="empty-cart-message">
            <div className="empty-icon">🛍️</div>
            <h3>Your cart is empty</h3>
            <p>Looks like you haven't added any campus items to your cart yet.</p>
            <div className="empty-cart-actions">
              <Link to="/products" className="btn">
                Browse Products
              </Link>
            </div>
          </div>
        ) : (
          <div className="cart-layout-grid">
            <div className="cart-items-column">
              {cart.map((item, index) => {
                const availStock = getProductStock(item.title);
                const qty = item.quantity || 1;
                return (
                  <div className="cart-item-row" key={index}>
                    <img src={item.thumbnail} alt={item.title} className="cart-thumb" />
                    <div className="cart-item-details">
                      <h3>{item.title}</h3>
                      <p className="unit-price">
                        Unit Price: {formatINR(item.price)} •{" "}
                        <span className="stock-inline">Stock: {availStock}</span>
                      </p>

                      <div className="cart-qty-controls">
                        <button
                          onClick={() => updateQuantity(index, -1)}
                          disabled={qty <= 1}
                          title="Decrease quantity"
                        >
                          -
                        </button>
                        <span className="qty-indicator">Qty: {qty}</span>
                        <button
                          onClick={() => updateQuantity(index, 1)}
                          disabled={qty >= availStock}
                          title="Increase quantity"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <div className="cart-item-pricing">
                      <p className="row-subtotal">
                        {formatINR((parseFloat(item.price) || 0) * qty)}
                      </p>
                      <button
                        className="remove-btn"
                        onClick={() => removeFromCart(index)}
                        title="Remove item"
                      >
                        🗑️ Remove
                      </button>
                    </div>
                  </div>
                );
              })}

              <div className="cart-actions-bar">
                <button className="clear-cart-btn" onClick={clearCart}>
                  Clear Cart
                </button>
                <Link to="/products" className="continue-link">
                  ← Continue Shopping
                </Link>
              </div>
            </div>

            <div className="cart-summary-column">
              <div className="summary-card">
                <h3>Order Summary</h3>
                <div className="summary-row">
                  <span>Subtotal ({cart.reduce((a, c) => a + (c.quantity || 1), 0)} items)</span>
                  <span>{formatINR(subtotal)}</span>
                </div>
                <div className="summary-row text-success">
                  <span>Campus Delivery</span>
                  <span>FREE</span>
                </div>
                <div className="summary-row discount-banner">
                  <span>🎓 Student Discount (Code: KL10)</span>
                  <span>10% OFF at Billing</span>
                </div>
                <hr />
                <div className="summary-row total-row">
                  <span>Estimated Total</span>
                  <span className="total-amount">{formatINR(subtotal)}</span>
                </div>

                <button className="checkout-btn" onClick={handleProceedToBilling}>
                  Proceed to Billing & Checkout ➔
                </button>

                <div className="trust-badges">
                  <span>🔒 Secure Payment Gateway</span>
                  <span>📦 Live Hostel Shipment Tracking</span>
                </div>
              </div>
            </div>
          </div>
        )}

        <RecommendedShelf
          title="💡 Complete Your Campus Setup"
          subtitle="Recommended add-ons based on your cart and browsing activity"
          limit={4}
          onAdded={handleAdded}
        />
      </div>

      <Footer />
    </>
  );
}

export default Cart;
