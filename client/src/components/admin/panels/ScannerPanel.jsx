import React, { useState } from "react";
import { Scanner } from "@yudiel/react-qr-scanner";
import { ScanLine, RefreshCw, BadgeCheck } from "lucide-react";

const ScannerPanel = ({ onScanSuccess }) => {
  const [manualId, setManualId] = useState("");
  const [isScanning, setIsScanning] = useState(true);

  const handleScan = (result) => {
    if (result && result[0] && isScanning) {
      setIsScanning(false);
      onScanSuccess(result[0].rawValue, () => setIsScanning(true));
    }
  };

  const handleManualSubmit = () => {
    if (!manualId.trim()) return alert("Masukkan ID Peserta");
    onScanSuccess(manualId, () => setManualId(""));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in-up">
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 text-center">
        <h2 className="text-2xl font-bold text-slate-900 mb-2 flex items-center justify-center gap-2">
          <ScanLine size={28} className="text-red-600" /> Area Check-in
        </h2>
        <p className="text-slate-500 text-sm mb-8">
          Arahkan kamera ke QR Code Peserta atau masukkan ID secara manual.
        </p>
        <div className="grid md:grid-cols-2 gap-8">
          {/* Scanner Box */}
          <div className="bg-black rounded-3xl overflow-hidden shadow-2xl border-4 border-slate-900 relative aspect-square flex items-center justify-center">
            {isScanning ? (
              <Scanner
                onScan={handleScan}
                components={{ audio: false, finder: true }}
                styles={{ container: { width: "100%", height: "100%" } }}
              />
            ) : (
              <div className="text-white flex flex-col items-center">
                <RefreshCw
                  size={40}
                  className="animate-spin mb-2 text-red-500"
                />
                <p>Memproses data...</p>
              </div>
            )}
          </div>

          {/* Manual Input */}
          <div className="flex flex-col justify-center space-y-6 text-left">
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
              <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
                <BadgeCheck size={18} className="text-red-600" /> Mode Manual
              </h3>
              <div className="flex gap-2">
                <input
                  value={manualId}
                  onChange={(e) => setManualId(e.target.value)}
                  placeholder="Contoh: 65c4a..."
                  className="flex-1 px-4 py-3 bg-white border border-slate-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
                />
                <button
                  onClick={handleManualSubmit}
                  className="px-6 py-3 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-black transition-all"
                >
                  Cek
                </button>
              </div>
            </div>
            <div className="bg-red-50 p-6 rounded-2xl border border-red-100">
              <h3 className="font-bold text-red-800 mb-2">
                Instruksi Panitia:
              </h3>
              <ul className="text-sm text-red-700 space-y-2 list-disc list-inside">
                <li>
                  Pastikan status peserta{" "}
                  <span className="bg-green-100 text-green-800 px-1 rounded font-bold">
                    LUNAS
                  </span>
                  .
                </li>
                <li>
                  Cocokkan Nama Peserta dengan <b>KTP Asli</b>.
                </li>
                <li>
                  Klik tombol <b>"KONFIRMASI CHECK-IN"</b>.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScannerPanel;
