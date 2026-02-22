import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  Navigate,
} from "react-router-dom";

// --- IMPORT ASSETS (LOGO) ---
import logoImage from "../src/assets/images/Logo/SurabayaHeritage.png";

// --- IMPORT HALAMAN ---
import Landing from "./components/Landing";
import RegistrationForm from "./components/RegistrationForm";
import AdminDashboard from "./components/admin/AdminDashboard";
import PaymentPage from "./components/PaymentPage";
import AdminLogin from "./components/AdminLogin";
import CheckStatusPage from "./components/CheckStatusPage";

// IMPORT HALAMAN BARU
import PrivacyPolicyPage from "./components/PrivacyPolicyPage";
import ContactSupportPage from "./components/ContactSupportPage";

// --- KOMPONEN PROTEKSI (GATEKEEPER) ---
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem("isAdminAuthenticated");

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-heritage-cream font-sans flex flex-col justify-between">
        {/* =========================================
            1. HEADER (LOGO IMAGE)
            Logic: Hide di /login dan /admin, Show di halaman lain
           ========================================= */}
        <Routes>
          <Route path="/login" element={null} />
          <Route path="/admin" element={null} />
          <Route
            path="*"
            element={
              <div className="text-center pt-6 pb-2 px-4 bg-white/50 backdrop-blur-sm sticky top-0 z-40">
                <Link
                  to="/"
                  className="inline-block hover:scale-105 transition-transform cursor-pointer"
                >
                  <img
                    src={logoImage}
                    alt="Logo Surabaya Heritage Run"
                    className="h-16 md:h-20 w-auto object-contain mx-auto drop-shadow-sm"
                  />
                </Link>
              </div>
            }
          />
        </Routes>

        {/* =========================================
            2. MAIN CONTENT ROUTES
           ========================================= */}
        <main className="flex-grow">
          <Routes>
            {/* --- HALAMAN PUBLIK --- */}
            <Route path="/" element={<Landing />} />
            <Route path="/register" element={<RegistrationForm />} />
            <Route path="/payment" element={<PaymentPage />} />
            <Route path="/check-status" element={<CheckStatusPage />} />

            {/* RUTE BARU */}
            <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
            <Route path="/contact-support" element={<ContactSupportPage />} />

            {/* --- HALAMAN ADMIN --- */}
            <Route path="/login" element={<AdminLogin />} />
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
          </Routes>
        </main>

        {/* =========================================
            3. FOOTER
            Logic: Hide di /login dan /admin, Show di halaman lain
           ========================================= */}
        <Routes>
          <Route path="/login" element={null} />
          <Route path="/admin" element={null} />
          <Route
            path="*"
            element={
              <footer className="bg-slate-50 border-t border-slate-100 pt-12 pb-8 mt-auto">
                <div className="max-w-6xl mx-auto px-6 text-center">
                  {/* Navigasi Link Cepat */}
                  <div className="flex flex-wrap justify-center gap-6 mb-8">
                    <Link
                      to="/privacy-policy"
                      className="text-gray-400 hover:text-[#7B1818] text-xs font-bold uppercase tracking-widest transition-colors"
                    >
                      Kebijakan Privasi
                    </Link>
                    <Link
                      to="/contact-support"
                      className="text-gray-400 hover:text-[#7B1818] text-xs font-bold uppercase tracking-widest transition-colors"
                    >
                      Bantuan Teknis
                    </Link>
                    <Link
                      to="/check-status"
                      className="text-gray-400 hover:text-[#7B1818] text-xs font-bold uppercase tracking-widest transition-colors"
                    >
                      Cek Status
                    </Link>
                  </div>

                  {/* Informasi Copyright */}
                  <div className="text-gray-400 text-[10px] uppercase tracking-[0.2em]">
                    &copy; 2026 Surabaya Heritage Run - All rights reserved
                  </div>

                  {/* Dekorasi Tambahan */}
                  <div className="mt-4 flex justify-center items-center gap-2 opacity-30">
                    <div className="h-[1px] w-8 bg-gray-400"></div>
                    <span className="text-[9px] font-black uppercase tracking-tighter text-gray-500">
                      HUT Surabaya ke-733
                    </span>
                    <div className="h-[1px] w-8 bg-gray-400"></div>
                  </div>
                </div>
              </footer>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
