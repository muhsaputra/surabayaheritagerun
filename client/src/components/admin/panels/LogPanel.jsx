import React, { useState, useEffect } from "react";
import axios from "axios";
import { RefreshCw } from "lucide-react";

const LogPanel = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const res = await axios.get("http://localhost:5001/api/admin/logs");
      if (res.data.success) {
        setLogs(res.data.data);
      }
    } catch (error) {
      console.error("Gagal load log", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in-up pb-10">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-3xl font-bold text-slate-900 font-serif border-b border-slate-200 pb-2 w-full">
          Riwayat Aktivitas
        </h2>
        <button
          onClick={fetchLogs}
          className="p-2 bg-white border hover:bg-slate-50 rounded-lg text-slate-500 transition absolute right-0"
          title="Refresh Log"
        >
          <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-xs">
            <tr>
              <th className="p-4">Waktu</th>
              <th className="p-4">Aksi</th>
              <th className="p-4">Detail Aktivitas</th>
              <th className="p-4">IP Address</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan="4" className="p-8 text-center text-slate-400">
                  Memuat data log...
                </td>
              </tr>
            ) : logs.length === 0 ? (
              <tr>
                <td colSpan="4" className="p-8 text-center text-slate-400">
                  Belum ada aktivitas tercatat.
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr
                  key={log._id}
                  className="hover:bg-slate-50 transition-colors"
                >
                  <td className="p-4 whitespace-nowrap text-slate-500 font-mono text-xs">
                    {new Date(log.createdAt).toLocaleString("id-ID")}
                  </td>
                  <td className="p-4">
                    <span
                      className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-wider ${
                        log.action === "VERIFY_PAYMENT"
                          ? "bg-green-100 text-green-700"
                          : log.action === "CHECK_IN"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-slate-200 text-slate-600"
                      }`}
                    >
                      {log.action.replace("_", " ")}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="font-bold text-slate-900">{log.target}</div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      {log.details}
                    </div>
                  </td>
                  <td className="p-4 text-xs text-slate-400 font-mono">
                    {log.ipAddress}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LogPanel; // <--- INI BAGIAN PENTING YANG HILANG
