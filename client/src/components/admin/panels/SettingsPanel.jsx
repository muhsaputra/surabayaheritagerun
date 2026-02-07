import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom"; // 👈 Tambahkan useNavigate
import {
  ToggleRight,
  ToggleLeft,
  Calendar,
  Save,
  CheckCircle,
  Circle,
  Lock,
  Unlock,
  Users,
  Banknote,
} from "lucide-react";

const SettingsPanel = () => {
  const navigate = useNavigate();
  const [config, setConfig] = useState(null);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activePhaseIndex, setActivePhaseIndex] = useState(0);

  useEffect(() => {
    fetchConfigAndStats();
  }, []);

  // --- LOGIKA FETCH DENGAN TOKEN ---
  const fetchConfigAndStats = async () => {
    try {
      const token = localStorage.getItem("adminToken"); // 👈 Ambil token
      const headers = { Authorization: `Bearer ${token}` };

      // 1. Fetch Config
      const resConfig = await axios.get(
        "http://localhost:5001/api/admin/config",
        { headers }, // 👈 Kirim headers
      );

      // 2. Fetch Participant Stats
      const resStats = await axios.get(
        "http://localhost:5001/api/admin/stats-count",
        { headers }, // 👈 Kirim headers
      );

      if (resConfig.data.success) {
        setConfig(resConfig.data.data);
        if (resConfig.data.data.activePhaseIndex !== undefined) {
          setActivePhaseIndex(resConfig.data.data.activePhaseIndex);
        }
      }

      if (resStats.data.success) {
        setStats(resStats.data.data);
      }
    } catch (error) {
      console.error("Gagal memuat data", error);
      // Jika token tidak valid, arahkan ke login
      if (error.response?.status === 401) {
        navigate("/admin/login");
      }
    } finally {
      setLoading(false);
    }
  };

  // --- LOGIKA SAVE DENGAN TOKEN ---
  const handleSave = async () => {
    if (!confirm("Simpan perubahan Harga, Kuota & Fase Aktif?")) return;
    setSaving(true);

    const token = localStorage.getItem("adminToken");
    const payload = {
      ...config,
      activePhaseIndex: activePhaseIndex,
    };

    try {
      await axios.post(
        "http://localhost:5001/api/admin/config",
        payload,
        { headers: { Authorization: `Bearer ${token}` } }, // 👈 Kirim headers
      );
      alert("✅ Pengaturan Berhasil Disimpan!");
    } catch (error) {
      alert(
        "Gagal menyimpan: " + (error.response?.data?.message || error.message),
      );
      if (error.response?.status === 401) navigate("/admin/login");
    } finally {
      setSaving(false);
    }
  };

  const handleLimitChange = (index, category, value) => {
    const newPhases = [...config.phases];
    newPhases[index].limits[category] = parseInt(value) || 0;
    setConfig({ ...config, phases: newPhases });
  };

  const handlePriceChange = (index, category, value) => {
    const newPhases = [...config.phases];
    if (!newPhases[index].prices) {
      newPhases[index].prices = { "5K": 0, "3K": 0 };
    }
    newPhases[index].prices[category] = parseInt(value) || 0;
    setConfig({ ...config, phases: newPhases });
  };

  const getCount = (phaseName, category) => {
    if (stats[phaseName] && stats[phaseName][category] !== undefined) {
      return stats[phaseName][category];
    }
    return 0;
  };

  const QuotaProgress = ({ current, limit, label }) => {
    const percentage = limit > 0 ? Math.min(100, (current / limit) * 100) : 0;
    const isFull = current >= limit && limit > 0;

    return (
      <div className="mb-2">
        <div className="flex justify-between text-xs mb-1 font-bold">
          <span className="text-slate-500 uppercase">{label}</span>
          <span className={isFull ? "text-red-600" : "text-slate-700"}>
            {current} / {limit} {isFull && "(PENUH)"}
          </span>
        </div>
        <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
          <div
            className={`h-2.5 rounded-full transition-all duration-500 ${isFull ? "bg-red-600" : "bg-blue-600"}`}
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
      </div>
    );
  };

  if (loading)
    return (
      <div className="p-10 text-center text-slate-500 font-bold animate-pulse">
        Memuat Pengaturan Keamanan...
      </div>
    );
  if (!config)
    return (
      <div className="p-10 text-center text-red-500 font-bold">
        Gagal memuat data konfigurasi.
      </div>
    );

  return (
    <div className="space-y-6 animate-fade-in-up pb-10">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-3xl font-bold text-slate-900 font-serif border-b border-slate-200 pb-2 w-full">
          Pengaturan Harga & Kuota
        </h2>
      </div>

      <div
        className={`p-6 rounded-2xl shadow-sm border transition-all flex justify-between items-center ${config.isRegistrationOpen ? "bg-white border-green-500 border-l-8" : "bg-red-50 border-red-500 border-l-8"}`}
      >
        <div>
          <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2">
            Master Switch Pendaftaran
            <span
              className={`text-xs px-2 py-0.5 rounded-full ${config.isRegistrationOpen ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
            >
              {config.isRegistrationOpen ? "BUKA" : "TUTUP"}
            </span>
          </h3>
          <p className="text-sm text-slate-500 mt-1">
            Jika dimatikan, pendaftaran tutup total (Maintenance Mode).
          </p>
        </div>
        <button
          onClick={() =>
            setConfig({
              ...config,
              isRegistrationOpen: !config.isRegistrationOpen,
            })
          }
          className={`text-5xl transition-transform active:scale-95 ${config.isRegistrationOpen ? "text-green-600" : "text-red-600"}`}
        >
          {config.isRegistrationOpen ? (
            <ToggleRight size={64} />
          ) : (
            <ToggleLeft size={64} />
          )}
        </button>
      </div>

      <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
        <h3 className="font-bold text-xl text-slate-900 mb-6 flex items-center gap-2">
          <Calendar className="text-red-600" size={24} /> Atur Harga & Kuota per
          Fase
        </h3>

        <div className="space-y-6">
          {config.phases.map((phase, index) => {
            const isActive = activePhaseIndex === index;
            const current5K = getCount(phase.name, "5K");
            const current3K = getCount(phase.name, "3K");
            const prices = phase.prices || { "5K": 0, "3K": 0 };

            return (
              <div
                key={index}
                onClick={() => setActivePhaseIndex(index)}
                className={`p-6 rounded-2xl border-2 cursor-pointer transition-all duration-300 relative ${
                  isActive
                    ? "bg-white border-red-600 shadow-xl scale-[1.01]"
                    : "bg-slate-50 border-slate-200 opacity-70 hover:opacity-100 hover:border-red-200"
                }`}
              >
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="md:w-1/4 border-r border-slate-100 pr-6 flex flex-col justify-center">
                    <div className="flex items-center gap-3 mb-2">
                      {isActive ? (
                        <CheckCircle size={28} className="text-red-600" />
                      ) : (
                        <Circle size={28} className="text-slate-300" />
                      )}
                      <h4
                        className={`text-xl font-black uppercase ${isActive ? "text-slate-900" : "text-slate-400"}`}
                      >
                        {phase.name}
                      </h4>
                    </div>
                    {isActive ? (
                      <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-3 py-1 rounded-lg text-xs font-bold w-fit">
                        <Unlock size={12} /> AKTIF SEKARANG
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 bg-slate-200 text-slate-500 px-3 py-1 rounded-lg text-xs font-bold w-fit">
                        <Lock size={12} /> TIDAK AKTIF
                      </span>
                    )}
                  </div>

                  <div className="md:w-3/4 pl-2 grid md:grid-cols-2 gap-8">
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                      <QuotaProgress
                        current={current5K}
                        limit={phase.limits["5K"]}
                        label="5K Run - Kuota"
                      />
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        <div>
                          <label className="text-[10px] font-bold text-slate-400 uppercase">
                            Batas Kuota
                          </label>
                          <input
                            type="number"
                            value={phase.limits["5K"]}
                            onChange={(e) =>
                              handleLimitChange(index, "5K", e.target.value)
                            }
                            className="w-full p-2 border rounded-lg text-sm font-bold border-slate-300 focus:border-red-500 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                            <Banknote size={10} /> Harga (Rp)
                          </label>
                          <input
                            type="number"
                            value={prices["5K"]}
                            onChange={(e) =>
                              handlePriceChange(index, "5K", e.target.value)
                            }
                            className="w-full p-2 border rounded-lg text-sm font-bold border-green-300 bg-green-50 text-green-800 focus:border-green-500 focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                      <QuotaProgress
                        current={current3K}
                        limit={phase.limits["3K"]}
                        label="3K Walk - Kuota"
                      />
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        <div>
                          <label className="text-[10px] font-bold text-slate-400 uppercase">
                            Batas Kuota
                          </label>
                          <input
                            type="number"
                            value={phase.limits["3K"]}
                            onChange={(e) =>
                              handleLimitChange(index, "3K", e.target.value)
                            }
                            className="w-full p-2 border rounded-lg text-sm font-bold border-slate-300 focus:border-red-500 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                            <Banknote size={10} /> Harga (Rp)
                          </label>
                          <input
                            type="number"
                            value={prices["3K"]}
                            onChange={(e) =>
                              handlePriceChange(index, "3K", e.target.value)
                            }
                            className="w-full p-2 border rounded-lg text-sm font-bold border-green-300 bg-green-50 text-green-800 focus:border-green-500 focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end sticky bottom-0 bg-white pb-2 z-10">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-8 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-black shadow-lg flex items-center gap-2 transition-all hover:-translate-y-1"
          >
            {saving ? (
              "Menyimpan..."
            ) : (
              <>
                <Save size={20} /> Simpan Perubahan
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;
