import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Lock,
  User,
  Eye,
  EyeOff,
  ShieldCheck,
  AlertCircle,
  ArrowRight,
} from "lucide-react";

import adminBg from "../assets/images/gallery8.jpg";

const AdminLogin = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  // --- LOGIKA LOGIN (UPDATED UNTUK DEPLOYMENT) ---
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Menggunakan variabel env agar URL otomatis menyesuaikan saat deploy
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

      const res = await axios.post(`${API_URL}/api/admin/login`, formData);

      if (res.data.success) {
        // Simpan Token dan Data Admin ke LocalStorage
        localStorage.setItem("adminToken", res.data.token);
        localStorage.setItem("adminData", JSON.stringify(res.data.admin));

        // Simpan status legacy agar kompatibel dengan sistem lama
        localStorage.setItem("isAdminAuthenticated", "true");

        // Arahkan ke Dashboard
        navigate("/admin");
      }
    } catch (err) {
      const message =
        err.response?.data?.message ||
        "Gagal terhubung ke server. Pastikan backend aktif.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden font-sans selection:bg-red-500 selection:text-white">
      {/* BACKGROUND IMAGE LAYER */}
      <div className="absolute inset-0 z-0">
        <img
          src={adminBg}
          alt="Admin Background"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-[2px]"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/60"></div>
      </div>

      <div className="absolute -top-20 -right-20 w-96 h-96 bg-red-600 rounded-full blur-[150px] opacity-30 animate-pulse z-0"></div>

      {/* LOGIN CARD */}
      <div className="w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/10 p-10 rounded-3xl shadow-2xl relative z-10 animate-fade-in-up">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-gradient-to-br from-red-600 to-red-800 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-red-900/50 transform rotate-3 hover:rotate-0 transition-all duration-500 border border-white/10">
            <ShieldCheck size={40} className="text-white" />
          </div>
          <h1 className="text-3xl font-serif font-bold text-white tracking-wide mb-2">
            Admin Portal
          </h1>
          <p className="text-slate-300 text-sm">Surabaya Heritage Run 2026</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-red-500/20 border border-red-500/50 text-red-200 text-sm p-4 rounded-xl mb-6 flex items-center gap-3 animate-shake">
            <AlertCircle size={18} /> {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="group">
            <label className="text-xs font-bold text-slate-400 ml-1 uppercase tracking-wider mb-2 block group-focus-within:text-red-500 transition-colors">
              Username
            </label>
            <div className="relative">
              <User
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-red-500 transition-colors"
                size={20}
              />
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="ID Administrator"
                className="w-full pl-12 pr-4 py-4 bg-black/40 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:bg-black/60 focus:border-red-500 focus:ring-1 focus:ring-red-500/50 outline-none transition-all backdrop-blur-sm"
                required
                autoComplete="off"
              />
            </div>
          </div>

          <div className="group">
            <label className="text-xs font-bold text-slate-400 ml-1 uppercase tracking-wider mb-2 block group-focus-within:text-red-500 transition-colors">
              Password
            </label>
            <div className="relative">
              <Lock
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-red-500 transition-colors"
                size={20}
              />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full pl-12 pr-12 py-4 bg-black/40 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:bg-black/60 focus:border-red-500 focus:ring-1 focus:ring-red-500/50 outline-none transition-all backdrop-blur-sm"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-red-600 hover:bg-red-700 text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-red-900/50 transition-all transform hover:-translate-y-1 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2 mt-4 border border-white/10"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                <span className="text-sm">Memverifikasi...</span>
              </div>
            ) : (
              <>
                Masuk Dashboard <ArrowRight size={20} />
              </>
            )}
          </button>
        </form>

        <div className="mt-10 text-center border-t border-white/10 pt-6">
          <p className="text-[10px] uppercase tracking-widest text-slate-500">
            Secure Database Protected &bull; 2026
          </p>
        </div>
      </div>

      <style>{`
        @keyframes fade-in-up { 
          from { opacity: 0; transform: translateY(40px) scale(0.95); } 
          to { opacity: 1; transform: translateY(0) scale(1); } 
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .animate-fade-in-up { animation: fade-in-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .animate-shake { animation: shake 0.4s ease-in-out; }
      `}</style>
    </div>
  );
};

export default AdminLogin;
