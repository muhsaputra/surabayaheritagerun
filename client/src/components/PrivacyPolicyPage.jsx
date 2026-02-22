import React from "react";
import { ArrowLeft, ShieldLock, Eye, Server, UserCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";

const PrivacyPolicyPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#FDFBF7] font-sans text-slate-800 pb-20">
      <div className="bg-[#7B1818] h-64 flex items-center justify-center relative overflow-hidden rounded-b-[4rem]">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/pinstriped-suit.png')]"></div>
        <div className="relative z-10 text-center">
          <button
            onClick={() => navigate("/")}
            className="mb-6 bg-white/10 hover:bg-white/20 text-white border border-white/20 px-6 py-2 rounded-full backdrop-blur-md transition-all flex items-center gap-2 mx-auto"
          >
            <ArrowLeft size={18} /> Beranda
          </button>
          <h1 className="text-4xl md:text-5xl font-serif font-black text-white uppercase tracking-tight">
            Kebijakan <span className="text-[#D4AF37]">Privasi</span>
          </h1>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 -mt-16 relative z-20">
        <div className="bg-white p-10 md:p-16 rounded-[3rem] shadow-2xl border border-slate-100 space-y-12">
          <section>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center text-[#7B1818]">
                <Eye size={24} />
              </div>
              <h2 className="text-2xl font-black uppercase tracking-tight">
                Informasi yang Kami Kumpulkan
              </h2>
            </div>
            <p className="text-slate-600 leading-relaxed italic">
              "Kami mengumpulkan data pribadi yang Anda berikan saat
              pendaftaran, termasuk namun tidak terbatas pada nama lengkap,
              alamat email, nomor telepon, dan ukuran jersey."
            </p>
          </section>

          <section>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
                <Server size={24} />
              </div>
              <h2 className="text-2xl font-black uppercase tracking-tight">
                Penggunaan Data
              </h2>
            </div>
            <p className="text-slate-600 leading-relaxed italic">
              "Data Anda digunakan secara eksklusif untuk keperluan administrasi
              lomba, verifikasi pembayaran melalui Midtrans, dan pengiriman
              e-tiket resmi Surabaya Heritage Run 2026."
            </p>
          </section>

          <section>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
                <ShieldLock size={24} />
              </div>
              <h2 className="text-2xl font-black uppercase tracking-tight">
                Keamanan Informasi
              </h2>
            </div>
            <p className="text-slate-600 leading-relaxed italic">
              "Kami menerapkan standar enkripsi SSL untuk melindungi transmisi
              data Anda. Informasi pembayaran diproses langsung oleh gateway
              pembayaran berlisensi dan tidak disimpan di server kami."
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;
