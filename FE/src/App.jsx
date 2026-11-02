import { Routes, Route, useLocation } from "react-router-dom";

// Pages
import Home from "./pages/Home";
import Category from "./pages/Category";
import Checkout from "./pages/Checkout";
import AdminDashboard from "./pages/AdminDashboard";
import AdminLogin from "./pages/AdminLogin";

// Components
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

function App() {
  const { pathname } = useLocation();
  const lowerPath = pathname.toLowerCase();

  const isAdminRoute = lowerPath.startsWith("/pages/admin-");

  const hideFooter =
    lowerPath === "/checkout.html" ||
    lowerPath === "/pages/checkout.html";

  return (
    <>
      {!isAdminRoute && <Navbar />}

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/pages/category.html" element={<Category />} />
        <Route path="/pages/checkOut.html" element={<Checkout />} />
        <Route path="/checkout.html" element={<Checkout />} />
        <Route path="/pages/admin-dashboard.html" element={<AdminDashboard />} />
        <Route path="/pages/admin-login.html" element={<AdminLogin />} />
      </Routes>

      {!isAdminRoute && !hideFooter && <Footer />}
    </>
  );
}

export default App;