import React from "react";
import {
  ArrowLeft,
  MessageCircle,
  Mail,
  Phone,
  MapPin,
  History,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const ContactSupportPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#FDFBF7] font-sans text-slate-800 pb-20">
      <div className="bg-[#7B1818] h-80 flex items-center justify-center relative overflow-hidden rounded-b-[4rem]">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/pinstriped-suit.png')]"></div>
        <div className="relative z-10 text-center px-4">
          <button
            onClick={() => navigate("/")}
            className="mb-8 bg-white/10 hover:bg-white/20 text-white border border-white/20 px-6 py-2 rounded-full backdrop-blur-md transition-all flex items-center gap-2 mx-auto"
          >
            <ArrowLeft size={18} /> Kembali
          </button>
          <h1 className="text-4xl md:text-6xl font-serif font-black text-white uppercase tracking-tighter">
            Bantuan <span className="text-[#D4AF37]">Teknis</span>
          </h1>
          <p className="text-white/60 mt-4 max-w-md mx-auto">
            Hubungi tim kami jika Anda mengalami kendala pendaftaran atau
            pembayaran.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 -mt-16 relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <a
            href="https://wa.me/628123456789"
            className="bg-white p-10 rounded-[3rem] shadow-xl border border-slate-100 hover:border-[#7B1818] transition-all group"
          >
            <div className="w-16 h-16 bg-emerald-50 rounded-3xl flex items-center justify-center text-emerald-600 mb-8 group-hover:bg-emerald-600 group-hover:text-white transition-all">
              <MessageCircle size={32} />
            </div>
            <h3 className="text-2xl font-black uppercase mb-2">
              WhatsApp Support
            </h3>
            <p className="text-slate-500 text-sm leading-relaxed">
              Respon cepat melalui chat untuk kendala e-tiket dan verifikasi
              pembayaran.
            </p>
          </a>

          <div className="bg-white p-10 rounded-[3rem] shadow-xl border border-slate-100">
            <div className="w-16 h-16 bg-blue-50 rounded-3xl flex items-center justify-center text-blue-600 mb-8">
              <Mail size={32} />
            </div>
            <h3 className="text-2xl font-black uppercase mb-2">
              Official Email
            </h3>
            <p className="text-slate-500 text-sm leading-relaxed">
              support@surabayaheritagerun.com
              <br />
              Kami akan membalas dalam waktu maksimal 24 jam.
            </p>
          </div>

          <div className="bg-white p-10 rounded-[3rem] shadow-xl border border-slate-100 md:col-span-2 flex flex-col md:flex-row items-center gap-8">
            <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center text-amber-600 shrink-0">
              <MapPin size={40} />
            </div>
            <div className="text-center md:text-left">
              <h3 className="text-2xl font-black uppercase mb-2">
                Sekretariat Panitia
              </h3>
              <p className="text-slate-500 text-sm leading-relaxed italic">
                "Gedung Plaza Internatio, Jl. Garuda No.1, Surabaya. Jam
                Operasional: 09:00 - 17:00 WIB."
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactSupportPage;
