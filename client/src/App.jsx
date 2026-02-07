import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  Navigate,
} from "react-router-dom";

// --- IMPORT ASSETS (LOGO) ---
// Pastikan path ini sesuai dengan lokasi penyimpanan file logo Anda
import logoImage from "../src/assets/images/Logo/SurabayaHeritage.png";

// --- IMPORT HALAMAN ---
import LandingPage from "./components/LandingPage";
import RegistrationForm from "./components/RegistrationForm";
import AdminDashboard from "./components/admin/AdminDashboard";
import PaymentPage from "./components/PaymentPage";
import AdminLogin from "./components/AdminLogin";
import CheckStatusPage from "./components/CheckStatusPage";

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
          {/* Untuk Landing Page ( / ) Anda bisa memilih untuk menyembunyikan header global ini 
              jika LandingPage sudah punya Navbar sendiri, atau membiarkannya. 
              Di sini saya membiarkannya tampil sebagai default. */}
          <Route
            path="*"
            element={
              <div className="text-center pt-6 pb-2 px-4 bg-white/50 backdrop-blur-sm sticky top-0 z-40">
                <Link
                  to="/"
                  className="inline-block hover:scale-105 transition-transform cursor-pointer"
                >
                  {/* UPDATE: Menggunakan Gambar Logo */}
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
        <Routes>
          {/* --- HALAMAN PUBLIK --- */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/register" element={<RegistrationForm />} />
          <Route path="/payment" element={<PaymentPage />} />
          <Route path="/check-status" element={<CheckStatusPage />} />

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
              <footer className="text-center text-gray-400 text-xs py-10 mt-auto bg-slate-50 border-t border-slate-100">
                &copy; 2026 Surabaya Heritage Run. All rights reserved.
              </footer>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
