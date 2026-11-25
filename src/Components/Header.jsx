import { useContext } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { CartContext } from "../context/CartContext";

function Header() {
  const {
    isLoggedIn,
    userRole,
    username,
    studentId,
    logoutUser,
    totalCartCount,
    wishlist,
    pendingItemRequestsCount
  } = useContext(CartContext);
  const navigate = useNavigate();
  const location = useLocation();

  const isMerchant = isLoggedIn && userRole === "merchant";

  const handleAuthClick = () => {
    if (isLoggedIn) {
      logoutUser();
      navigate(isMerchant ? "/login" : "/");
    } else {
      navigate("/login");
    }
  };

  const isActive = (path) =>
    location.pathname === path || (path !== "/" && location.pathname.startsWith(path + "/"))
      ? "active"
      : "";

  return (
    <header>
      <div className="header-brand">
        <h1>
          <Link to={isMerchant ? "/merchant" : "/"}>🏬 KL Online Store</Link>
        </h1>
        <span className="brand-tagline">KL University Official Store</span>
      </div>

      <nav>
        {isMerchant ? (
          <>
            <Link to="/merchant" className={`merchant-nav-link ${isActive("/merchant")}`}>
              🏪 Merchant Console
              {pendingItemRequestsCount > 0 && (
                <span className="merchant-notif-badge" title="Pending customer item requests">
                  🔔 {pendingItemRequestsCount}
                </span>
              )}
            </Link>
            <Link to="/products" className={isActive("/products")}>
              Catalog Preview
            </Link>
            <Link to="/tracking" className={isActive("/tracking")}>
              Track Orders
            </Link>
          </>
        ) : (
          <>
            <Link to="/" className={isActive("/")}>Home</Link>
            <Link to="/products" className={isActive("/products")}>
              Products {wishlist.length > 0 && <span className="nav-mini-heart">♥{wishlist.length}</span>}
            </Link>
            <Link to="/orders" className={isActive("/orders")}>Orders</Link>
            <Link to="/tracking" className={isActive("/tracking")}>Track</Link>
            <Link to="/cart" className={`cart-link-wrapper ${isActive("/cart")}`}>
              Cart
              {totalCartCount > 0 && (
                <span className="cart-badge">{totalCartCount}</span>
              )}
            </Link>
          </>
        )}
      </nav>

      <div className="header-right">
        {isMerchant && (
          <span className="role-switch-pill role-merchant">
            🏪 Merchant
          </span>
        )}

        {isLoggedIn && (
          <div id="user-display" title={`ID: ${studentId}`}>
            {isMerchant ? "👤" : "🎓"} <span>{username}</span>
          </div>
        )}
        <div id="auth-button">
          <button onClick={handleAuthClick}>
            {isLoggedIn ? "Logout" : "Login"}
          </button>
        </div>
      </div>
    </header>
  );
}

export default Header;
