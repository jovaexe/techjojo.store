
import { useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Analytics } from "@vercel/analytics/react";
import Home from "./pages/home";
import GamingLaptops from "./pages/gamingLaptop";
import Monitor from "./pages/monitor";
import BusinessLaptop from "./pages/businesslaptop";
import PageNotFound from "./pages/pageNotFound";
import Desktop from "./pages/desktop";
import Macbooks from "./pages/macbook";
import Techaccessories from "./pages/techaccessories";
import ScrollToTop from "./components/ScrollToTop";
import { ThemeProvider } from "./context/ThemeContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import HomeAppliance from './pages/homeappliances'
import Smartphones from "./pages/smartphone";
import SearchPage from "./pages/search";
import { preloadAllProducts } from "./lib/productCache";

export default function App() {
  useEffect(() => { preloadAllProducts(); }, []);

  return (
    <ThemeProvider>
      <BrowserRouter>
        <Analytics />
        <ScrollToTop />
        <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-black">
          <Navbar />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/gaminglaptops" element={<GamingLaptops />} />
              <Route path="/businesslaptops" element={<BusinessLaptop />} />
              <Route path="/desktops" element={<Desktop />} />
              <Route path="/macbooks" element={<Macbooks />} />
              <Route path="/monitors" element={<Monitor />} />
               <Route path="/techaccessories" element={<Techaccessories />} />
               <Route path="/homeappliances" element={<HomeAppliance />} />
               <Route path="/smartphones" element={<Smartphones />} />
               <Route path="/search" element={<SearchPage />} />
              <Route path="*" element={<PageNotFound />} />
            </Routes>
          </main>
          <Footer whatsAppNumber="+234 805 471 7837" />
        </div>
      </BrowserRouter>
    </ThemeProvider>
  );
}
