import { useState, useEffect } from "react";
import { HashRouter, Routes, Route } from "react-router-dom";
import Home from "./Components/Home";
import Products1 from "./Components/Products1";
import Cart from "./Components/Cart";
import Billing from "./Components/Billing";
import Receipt from "./Components/Receipt";
import Orders from "./Components/Orders";
import OrderTracking from "./Components/OrderTracking";
import MerchantDashboard from "./Components/MerchantDashboard";
import Login from "./Components/Login";
import Signup from "./Components/Signup";
import ClockWidget from "./Components/ClockWidget";
import AIAssistant from "./Components/AIAssistant";
import { DateContext } from "./context/DateContext";
import { CartProvider } from "./context/CartContext";
import "./Components/Styles.css";

function App() {
  const [currentDate, setCurrentDate] = useState(new Date().toDateString());
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentDate(now.toDateString());
      setCurrentTime(now.toLocaleTimeString());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <DateContext.Provider value={{ currentDate, currentTime }}>
      <CartProvider>
        <HashRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/products" element={<Products1 />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/billing" element={<Billing />} />
            <Route path="/receipt" element={<Receipt />} />
            <Route path="/receipt/:orderId" element={<Receipt />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/tracking" element={<OrderTracking />} />
            <Route path="/tracking/:orderId" element={<OrderTracking />} />
            <Route path="/merchant" element={<MerchantDashboard />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
          </Routes>
          <AIAssistant />
          <ClockWidget />
        </HashRouter>
      </CartProvider>
    </DateContext.Provider>
  );
}

export default App;
