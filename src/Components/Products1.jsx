import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import { CartContext, formatINR } from "../context/CartContext";

function Products1() {
  const {
    inventory,
    isLoggedIn,
    userRole,
    addToCart,
    toggleWishlist,
    isInWishlist,
    wishlist,
    reviews,
    recordProductView
  } = useContext(CartContext);

  const isMerchant = isLoggedIn && userRole === "merchant";

  const [externalProducts, setExternalProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [wishlistOnly, setWishlistOnly] = useState(false);
  const [addedToast, setAddedToast] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    fetch("https://dummyjson.com/products?limit=24", { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error("API status not OK");
        return res.json();
      })
      .then((data) => {
        if (data && data.products && data.products.length > 0) {
          const inrConverted = data.products.map((dp) => ({
            ...dp,
            id: `ext-${dp.id}`,
            category: (dp.category || "general").trim().toLowerCase(),
            price: Math.round((parseFloat(dp.price) || 10) * 83)
          }));
          setExternalProducts(inrConverted);
        }
      })
      .catch(() => {
        setExternalProducts([]);
      })
      .finally(() => {
        clearTimeout(timeoutId);
      });

    return () => {
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, []);

  const products = [
    ...inventory.map((p) => ({
      ...p,
      category: (p.category || "other").trim().toLowerCase()
    })),
    ...externalProducts.filter(
      (ep) => !inventory.some((ip) => ip.title.toLowerCase() === ep.title.toLowerCase())
    )
  ];

  const showToast = (msg) => {
    setAddedToast(msg);
    setTimeout(() => setAddedToast(""), 2500);
  };

  const handleAddToCart = (product) => {
    if (isMerchant) return;
    const isLogged = isLoggedIn || localStorage.getItem("isLoggedIn") === "true";

    if (isLogged) {
      const res = addToCart({
        id: product.id,
        title: product.title,
        price: product.price,
        category: product.category,
        thumbnail: product.thumbnail,
        quantity: 1
      });
      if (res && !res.ok) {
        showToast(res.message);
        return;
      }
      showToast(`Added "${product.title}" to Cart!`);
    } else {
      alert("Please login first to add items to your cart!");
      navigate("/login");
    }
  };

  const handleOpenDetails = (product) => {
    recordProductView(product);
    setSelectedProduct(product);
  };

  const categories = [
    "all",
    ...new Set(products.map((p) => (p.category || "").trim().toLowerCase()).filter(Boolean))
  ];

  const searchTokens = searchTerm
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean);

  const filteredProducts = products.filter((p) => {
    const normCategory = (p.category || "").trim().toLowerCase();
    const haystack = `${p.title || ""} ${normCategory} ${p.description || ""}`.toLowerCase();
    const matchesSearch =
      searchTokens.length === 0 ||
      searchTokens.every((tok) => haystack.includes(tok));
    const matchesCategory =
      selectedCategory === "all" || normCategory === selectedCategory;
    const matchesWishlist = !wishlistOnly || isInWishlist(p.title);
    return matchesSearch && matchesCategory && matchesWishlist;
  });

  const verifiedBuyerReviews = selectedProduct
    ? (reviews[selectedProduct.title] || []).filter((r) => r.verifiedPurchase)
    : [];

  return (
    <>
      <Header />

      {addedToast && (
        <div className="toast-popup">
          🛒 {addedToast}
        </div>
      )}

      <div className="products-page-container">
        <div className="page-header-banner">
          <h2>{isMerchant ? "Catalog Preview (Merchant View)" : "Campus Product Catalog"}</h2>
          <p>
            {isMerchant
              ? "Previewing live storefront catalog & verified buyer reviews"
              : "Discover laptops, smartphones, student tech, live stock & verified buyer reviews"}
          </p>
        </div>

        <div className="filter-bar">
          <input
            type="text"
            className="search-input"
            placeholder="🔍 Search items by name, category, or specs (e.g. bottle, laptop, ryzen)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          <select
            className="category-select"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                Category: {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </option>
            ))}
          </select>

          {!isMerchant && (
            <button
              type="button"
              className={`wishlist-filter-btn ${wishlistOnly ? "active" : ""}`}
              onClick={() => setWishlistOnly((prev) => !prev)}
            >
              {wishlistOnly ? "♥ Saved Wishlist" : "♡ Wishlist"} ({wishlist.length})
            </button>
          )}
        </div>

        {filteredProducts.length === 0 ? (
          <div className="empty-cart-message">
            <h3>No matching products found</h3>
            <p>Try clearing your search, category, or wishlist filter.</p>
            <button
              type="button"
              className="btn"
              onClick={() => {
                setSearchTerm("");
                setSelectedCategory("all");
                setWishlistOnly(false);
              }}
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <section className="products">
            {filteredProducts.map((p) => {
              const stockVal = typeof p.stock === "number" ? p.stock : 25;
              const outOfStock = stockVal <= 0;
              const lowStock = stockVal > 0 && stockVal <= 10;
              const wished = isInWishlist(p.title);

              return (
                <div className="product" key={p.id || p.title}>
                  <div className="product-image-wrap">
                    <img
                      src={p.thumbnail}
                      alt={p.title}
                      loading="lazy"
                      onClick={() => handleOpenDetails(p)}
                      style={{ cursor: "pointer" }}
                    />
                    <span className="category-tag">{p.category}</span>
                    {!isMerchant && (
                      <button
                        type="button"
                        className={`wishlist-heart-btn ${wished ? "wished" : ""}`}
                        onClick={() => toggleWishlist(p)}
                        title={wished ? "Remove from Wishlist" : "Save to Wishlist"}
                      >
                        {wished ? "♥" : "♡"}
                      </button>
                    )}
                    <span
                      className={`stock-pill ${
                        outOfStock ? "stock-out" : lowStock ? "stock-low" : "stock-ok"
                      }`}
                    >
                      {outOfStock
                        ? "Out of Stock"
                        : lowStock
                        ? `Only ${stockVal} left`
                        : `In Stock (${stockVal})`}
                    </span>
                  </div>
                  <h3
                    onClick={() => handleOpenDetails(p)}
                    style={{ cursor: "pointer" }}
                    title="Click for details & verified buyer reviews"
                  >
                    {p.title}
                  </h3>
                  <p className="product-desc">{p.description}</p>
                  <div className="product-price-rating">
                    <p className="price">{formatINR(p.price)}</p>
                    <span className="rating-chip">★ {p.rating || 4.7}</span>
                  </div>
                  <div className="product-card-actions">
                    {!isMerchant && (
                      <button
                        type="button"
                        disabled={outOfStock}
                        className={outOfStock ? "btn-disabled" : ""}
                        onClick={() => handleAddToCart(p)}
                      >
                        {outOfStock ? "Out of Stock" : "Add to Cart"}
                      </button>
                    )}
                    <button
                      type="button"
                      className="quick-view-btn"
                      style={isMerchant ? { flex: 1 } : undefined}
                      onClick={() => handleOpenDetails(p)}
                    >
                      {isMerchant ? "View Details & Reviews" : "Reviews"}
                    </button>
                  </div>
                </div>
              );
            })}
          </section>
        )}
      </div>

      {/* Product Detail & Read-Only Verified Buyer Reviews Modal */}
      {selectedProduct && (
        <div className="modal-backdrop" onClick={() => setSelectedProduct(null)}>
          <div className="product-modal" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="modal-close-btn"
              onClick={() => setSelectedProduct(null)}
            >
              ✕
            </button>
            <div className="modal-product-grid">
              <div className="modal-img-box">
                <img src={selectedProduct.thumbnail} alt={selectedProduct.title} />
              </div>
              <div className="modal-info-box">
                <span className="modal-cat-badge">{selectedProduct.category}</span>
                <h2>{selectedProduct.title}</h2>
                <p className="modal-desc">{selectedProduct.description}</p>
                <div className="modal-price-row">
                  <span className="modal-price">{formatINR(selectedProduct.price)}</span>
                  <span className="rating-chip">★ {selectedProduct.rating || 4.8}</span>
                  <span className="modal-stock-text">
                    Stock: {typeof selectedProduct.stock === "number" ? selectedProduct.stock : 25} units
                  </span>
                </div>
                {!isMerchant && (
                  <div className="modal-btn-row">
                    <button
                      type="button"
                      className="btn"
                      disabled={typeof selectedProduct.stock === "number" && selectedProduct.stock <= 0}
                      onClick={() => handleAddToCart(selectedProduct)}
                    >
                      {typeof selectedProduct.stock === "number" && selectedProduct.stock <= 0
                        ? "Out of Stock"
                        : "Add to Cart"}
                    </button>
                    <button
                      type="button"
                      className="wishlist-modal-btn"
                      onClick={() => toggleWishlist(selectedProduct)}
                    >
                      {isInWishlist(selectedProduct.title) ? "♥ Saved" : "♡ Save to Wishlist"}
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="modal-reviews-section">
              <div className="verified-reviews-head">
                <h3>Verified Buyer Reviews ({verifiedBuyerReviews.length})</h3>
                <span className="buyer-only-note">
                  ✓ Only customers who purchased this product can review from My Orders
                </span>
              </div>

              <div className="reviews-list">
                {verifiedBuyerReviews.length === 0 ? (
                  <p className="no-reviews-msg">
                    No verified buyer reviews yet. Reviews appear here once a student purchases this product.
                  </p>
                ) : (
                  verifiedBuyerReviews.map((rev, i) => (
                    <div className="review-card" key={i}>
                      <div className="review-top">
                        <strong>{rev.author}</strong>
                        <span className="review-id">Roll ID: {rev.studentId}</span>
                        <span className="verified-buyer-pill">✓ Verified Buyer</span>
                        <span className="review-stars">{"★".repeat(rev.rating)}</span>
                        <span className="review-date">{rev.date}</span>
                      </div>
                      <p>{rev.comment}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}

export default Products1;
