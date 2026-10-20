import { Route, Routes } from "react-router-dom";
import "./App.css";
import Home from "./Pages/Home";
import Collection from "./Pages/Collection";
import About from "./Pages/About";
import Contact from "./Pages/Contact";
import Product from "./Pages/Product";
import Cart from "./Pages/Cart";
import Login from "./Pages/Login";
import ResetPassword from "./Pages/ResetPassword";
import PlaceOrder from "./Pages/PlaceOrder";
import Orders from "./Pages/Orders";
import Navbar from "./Components/Navbar";
import Footer from "./Components/Footer";
import SearchBar from "./Components/SearchBar";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Verify from "./Pages/Verify";
import TshirtGenerator from "./Pages/TshirtGenerator";
import { useAuth } from "./auth/AuthContext";
import { useCatalogue } from "./catalogue/CatalogueContext";
import { CartProvider } from "./cart/CartContext";
import { BACKEND_URL } from "./config";

function App() {
  // The composition root: the Cart still receives its auth and catalogue
  // dependencies as props, so the module itself knows neither.
  const { token } = useAuth();
  const { allProducts } = useCatalogue();

  return (
    <CartProvider token={token} products={allProducts} backendUrl={BACKEND_URL}>
      <div className="px-4 sm:px-[5vw] md:px-[7vw] lg:px-[9vw]">
        <ToastContainer />

        <Navbar />
        <SearchBar />

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/collection" element={<Collection />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/product/:productId" element={<Product />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/login" element={<Login />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/place-order" element={<PlaceOrder />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/verify" element={<Verify />} />
          <Route path="/tshirt-generator" element={<TshirtGenerator />} />
        </Routes>

        <Footer />
      </div>
    </CartProvider>
  );
}

export default App;
