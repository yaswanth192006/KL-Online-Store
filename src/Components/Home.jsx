import { useState, useContext } from "react";
import { Navigate } from "react-router-dom";
import Header from "./Header";
import Content from "./Content";
import RecommendedShelf from "./RecommendedShelf";
import Highlights from "./Highlights";
import Footer from "./Footer";
import { CartContext } from "../context/CartContext";

function Home() {
  const { isLoggedIn, userRole } = useContext(CartContext);
  const [toastMsg, setToastMsg] = useState("");

  if (isLoggedIn && userRole === "merchant") {
    return <Navigate to="/merchant" replace />;
  }

  const handleAdded = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 2500);
  };

  return (
    <>
      <Header />
      {toastMsg && <div className="toast-popup">🛒 {toastMsg}</div>}
      <Content />
      <RecommendedShelf limit={4} onAdded={handleAdded} />
      <Highlights />
      <Footer />
    </>
  );
}

export default Home;
