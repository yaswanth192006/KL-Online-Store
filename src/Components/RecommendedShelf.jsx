import { useContext } from "react";
import { Link } from "react-router-dom";
import { CartContext, formatINR } from "../context/CartContext";

function RecommendedShelf({
  title = "✨ Personalized Recommendations For You",
  subtitle = "Smart picks tailored to your campus browsing, cart & order history",
  limit = 4,
  extraPool = [],
  onSelectProduct,
  onAdded
}) {
  const { getRecommendations, addToCart, isLoggedIn } = useContext(CartContext);
  const recs = getRecommendations(limit, extraPool);

  if (!recs || recs.length === 0) return null;

  const handleQuickAdd = (product) => {
    const isLogged = isLoggedIn || localStorage.getItem("isLoggedIn") === "true";
    if (!isLogged) {
      alert("Please login first to add items to your cart!");
      return;
    }
    const res = addToCart({
      id: product.id,
      title: product.title,
      price: product.price,
      category: product.category,
      thumbnail: product.thumbnail,
      quantity: 1
    });
    if (res && !res.ok) {
      alert(res.message);
      return;
    }
    if (onAdded) {
      onAdded(`Added "${product.title}" to Cart!`);
    }
  };

  return (
    <section className="recommended-shelf">
      <div className="shelf-header">
        <div>
          <h2>{title}</h2>
          <p>{subtitle}</p>
        </div>
        <Link to="/products" className="shelf-link-pill">
          Explore Full Catalog ➔
        </Link>
      </div>

      <div className="recommended-grid">
        {recs.map(({ product, reason }) => (
          <div className="rec-card" key={product.id || product.title}>
            <span className="rec-reason-badge">{reason}</span>
            <div
              className="rec-img-wrap"
              onClick={() => onSelectProduct && onSelectProduct(product)}
              style={{ cursor: onSelectProduct ? "pointer" : "default" }}
            >
              <img src={product.thumbnail} alt={product.title} loading="lazy" />
            </div>
            <div className="rec-info">
              <h4
                onClick={() => onSelectProduct && onSelectProduct(product)}
                style={{ cursor: onSelectProduct ? "pointer" : "default" }}
              >
                {product.title}
              </h4>
              <div className="rec-meta">
                <span className="rec-price">{formatINR(product.price)}</span>
                <span className="rec-rating">★ {product.rating || 4.8}</span>
              </div>
              <button
                type="button"
                className="rec-add-btn"
                onClick={() => handleQuickAdd(product)}
              >
                + Quick Add
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default RecommendedShelf;
