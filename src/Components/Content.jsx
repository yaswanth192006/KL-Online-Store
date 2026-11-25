import { Link } from "react-router-dom";

function Content() {
  return (
    <section className="content">
      <div className="content-container">
        <span className="campus-pill">🎓 Official KL University Student Portal</span>
        <h2>Welcome to KL Online Store!</h2>
        <p>Find the best student deals on smartphones, tech gadgets, and campus essentials.</p>
        <div className="hero-cta-group">
          <Link to="/products" className="btn">
            Shop Products Now
          </Link>
        </div>
      </div>
    </section>
  );
}

export default Content;
