import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  User,
  Heart,
  Shirt,
  ChevronRight,
  ChevronLeft,
  CheckCircle,
  Ruler,
  X,
  AlertCircle,
  Calendar,
  Phone,
  Mail,
  MapPin,
  CreditCard,
  Lock,
  Trophy,
  Footprints,
  Users,
} from "lucide-react";

// --- COMPONENT: MODERN INPUT (Reusable) ---
const ModernInput = ({
  label,
  name,
  value,
  onChange,
  error,
  type = "text",
  placeholder,
  icon: Icon,
  colSpan = 1,
  maxLength,
  disabled = false,
  options = [],
}) => (
  <div
    className={`flex flex-col gap-2 ${colSpan === 2 ? "md:col-span-2" : ""}`}
  >
    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">
      {label} {error && <span className="text-red-500">*</span>}
    </label>

    <div
      className={`relative group transition-all duration-300 ${disabled ? "opacity-70" : ""}`}
    >
      {Icon && (
        <div
          className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-300 
          ${error ? "text-red-500" : "text-slate-400 group-focus-within:text-red-600"}`}
        >
          <Icon size={20} />
        </div>
      )}

      {options.length > 0 ? (
        <div className="relative">
          <select
            name={name}
            value={value}
            onChange={onChange}
            disabled={disabled}
            className={`w-full bg-slate-50 border-2 rounded-xl py-4 pr-10 pl-12 outline-none appearance-none font-semibold text-slate-800 transition-all duration-300 cursor-pointer
              ${
                error
                  ? "border-red-100 bg-red-50 focus:border-red-500 focus:ring-4 focus:ring-red-500/10"
                  : "border-transparent focus:bg-white focus:border-red-600 focus:ring-4 focus:ring-red-600/10 hover:bg-slate-100"
              }
            `}
          >
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
            <ChevronRight size={16} className="rotate-90" />
          </div>
        </div>
      ) : (
        <input
          name={name}
          type={type}
          placeholder={placeholder}
          maxLength={maxLength}
          value={value}
          onChange={onChange}
          disabled={disabled}
          className={`w-full bg-slate-50 border-2 rounded-xl py-4 pr-4 outline-none font-semibold text-slate-800 transition-all duration-300 placeholder:text-slate-400 placeholder:font-normal
            ${Icon ? "pl-12" : "pl-4"}
            ${
              error
                ? "border-red-100 bg-red-50 focus:border-red-500 focus:ring-4 focus:ring-red-500/10"
                : "border-transparent focus:bg-white focus:border-red-600 focus:ring-4 focus:ring-red-600/10 hover:bg-slate-100"
            }
          `}
        />
      )}

      {error && (
        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-red-500 animate-pulse">
          <AlertCircle size={20} />
        </div>
      )}
    </div>

    {error && (
      <p className="text-xs text-red-500 font-medium ml-1 animate-slide-down">
        {error}
      </p>
    )}
  </div>
);

const RegistrationForm = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [successData, setSuccessData] = useState(null);
  const [showSizeChart, setShowSizeChart] = useState(false);

  // Status Event (Dari API /api/landing/config)
  const [eventStatus, setEventStatus] = useState({
    loading: true,
    isRegistrationOpen: false, // Master Switch
    activePhaseName: "",
    activePhaseIndex: 0,
    status: {
      is5KFull: false,
      is3KFull: false,
      isSoldOut: false,
    },
    limits: { "5K": 0, "3K": 0 },
    message: "",
  });

  const [errors, setErrors] = useState({});
  const [isDataConfirmed, setIsDataConfirmed] = useState(false);

  // Form Data
  const [formData, setFormData] = useState({
    fullName: "",
    nik: "",
    gender: "Laki-laki",
    birthDate: "",
    province: "",
    city: "",
    phoneNumber: "",
    email: "",
    medicalHistory: "Tidak Ada",
    bloodType: "O",
    emergencyName: "",
    emergencyPhone: "",
    emergencyRelation: "", // Wajib Ada
    jerseyType: "Dewasa",
    jerseySize: "M",
    bibName: "",
    waiverAccepted: false,
    category: "", // Akan diisi otomatis jika hanya 1 yg available
  });

  // 1. Fetch Status saat Component Mount
  useEffect(() => {
    const checkStatus = async () => {
      try {
        const res = await axios.get("http://localhost:5001/api/landing/config");
        if (res.data.success) {
          const data = res.data.data;
          setEventStatus({ ...data, loading: false });

          // Otomatis pilih kategori jika salah satu penuh
          if (data.isRegistrationOpen) {
            if (data.status.is5KFull && !data.status.is3KFull) {
              setFormData((prev) => ({ ...prev, category: "3K" }));
            } else if (!data.status.is5KFull && data.status.is3KFull) {
              setFormData((prev) => ({ ...prev, category: "5K" }));
            } else if (!data.status.is5KFull && !data.status.is3KFull) {
              setFormData((prev) => ({ ...prev, category: "5K" })); // Default 5K
            }
          }
        }
      } catch (error) {
        setEventStatus({
          loading: false,
          isRegistrationOpen: false,
          message: "Gagal terhubung ke server.",
        });
      }
    };
    checkStatus();
  }, []);

  // 2. Validasi Step 1
  const validateStep1 = () => {
    let newErrors = {};
    if (!formData.fullName.trim()) newErrors.fullName = "Wajib diisi";
    if (!formData.nik || formData.nik.length !== 16)
      newErrors.nik = "Wajib 16 digit";
    if (!formData.phoneNumber || formData.phoneNumber.length < 10)
      newErrors.phoneNumber = "Nomor tidak valid";
    if (!formData.email || !formData.email.includes("@"))
      newErrors.email = "Email tidak valid";
    if (!formData.birthDate) newErrors.birthDate = "Wajib diisi";
    if (!formData.province) newErrors.province = "Wajib diisi";
    if (!formData.city) newErrors.city = "Wajib diisi";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = () => {
    if (validateStep1()) {
      setStep(2);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    // Input Angka Saja
    if (
      (name === "nik" || name === "phoneNumber" || name === "emergencyPhone") &&
      type !== "checkbox"
    ) {
      if (value && !/^\d+$/.test(value)) return;
    }
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  // 3. Submit Form
  const handleSubmit = async () => {
    // Validasi Akhir
    if (
      !formData.emergencyName ||
      !formData.emergencyPhone ||
      !formData.emergencyRelation
    ) {
      alert("Harap lengkapi Data Kontak Darurat!");
      return;
    }

    if (!formData.category) {
      alert("Harap pilih Kategori Lari!");
      return;
    }

    setLoading(true);
    try {
      const finalJerseySize = `${formData.jerseyType}-${formData.jerseySize}`;

      // Harga dinamis (bisa diambil dari backend config idealnya)
      // Disini hardcode sementara, nanti bisa diganti data dari API
      const price = formData.category === "5K" ? 150000 : 125000;

      const response = await axios.post("http://localhost:5001/api/register", {
        ...formData,
        pricePaid: price,
        jerseySize: finalJerseySize,
        emergencyContact: {
          name: formData.emergencyName,
          phone: formData.emergencyPhone,
          relation: formData.emergencyRelation,
        },
      });

      if (response.data.success) {
        setSuccessData(response.data.data);
        setStep(3);
        window.scrollTo(0, 0);
      }
    } catch (error) {
      const msg = error.response?.data?.message || error.message;
      alert(`Gagal Register: ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  // --- RENDER: LOADING ---
  if (eventStatus.loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-12 h-12 border-4 border-slate-200 border-t-red-600 rounded-full animate-spin"></div>
      </div>
    );

  // --- RENDER: CLOSED / MAINTENANCE ---
  if (!eventStatus.isRegistrationOpen)
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="bg-white p-12 rounded-3xl shadow-xl text-center max-w-md w-full border border-slate-100">
          <Lock size={48} className="text-red-500 mx-auto mb-6" />
          <h2 className="text-2xl font-serif font-bold text-slate-900 mb-2">
            Pendaftaran Ditutup
          </h2>
          <p className="text-slate-500 mb-8">
            Mohon maaf, pendaftaran sedang ditutup sementara atau belum dibuka.
            Silakan cek kembali nanti.
          </p>
          <button
            onClick={() => navigate("/")}
            className="w-full py-4 bg-slate-900 text-white font-bold rounded-xl hover:bg-black transition-colors"
          >
            Kembali ke Beranda
          </button>
        </div>
      </div>
    );

  // --- RENDER: SUCCESS PAGE ---
  if (step === 3 && successData)
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl max-w-lg w-full text-center animate-fade-in relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-red-600 to-red-400"></div>
          <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6 text-green-600 border border-green-100">
            <CheckCircle size={40} strokeWidth={3} />
          </div>
          <h2 className="text-3xl font-serif font-bold text-slate-900 mb-2">
            Terima Kasih!
          </h2>
          <p className="text-slate-500 mb-8">Data Anda berhasil kami terima.</p>

          <div className="bg-slate-50 p-6 rounded-2xl mb-8 space-y-4 border border-slate-100 text-left">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500 font-medium">Nama Peserta</span>
              <span className="font-bold text-slate-900">
                {successData.fullName}
              </span>
            </div>
            <div className="flex justify-between text-sm items-center">
              <span className="text-slate-500 font-medium">Kategori</span>
              <span className="font-bold text-red-600 bg-red-50 px-3 py-1 rounded-full text-xs uppercase tracking-wider border border-red-100">
                {successData.category} RUN
              </span>
            </div>
            <div className="border-t border-slate-200 pt-3 flex justify-between items-center">
              <span className="text-slate-500 font-medium">Total Tagihan</span>
              <span className="text-2xl font-black text-slate-900">
                Rp {successData.pricePaid?.toLocaleString("id-ID")}
              </span>
            </div>
          </div>

          <button
            onClick={() =>
              navigate("/payment", { state: { userData: successData } })
            }
            className="w-full py-4 bg-red-600 text-white font-bold rounded-xl shadow-lg shadow-red-600/30 hover:bg-red-700 hover:-translate-y-1 transition-all"
          >
            Lanjut Pembayaran
          </button>
        </div>
      </div>
    );

  // --- RENDER: FORM UTAMA ---
  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 md:px-8 font-sans">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 text-center">
          <button
            onClick={() => navigate("/")}
            className="text-sm font-bold text-slate-400 hover:text-red-600 mb-4 transition-colors flex items-center justify-center gap-2 mx-auto"
          >
            <ChevronLeft size={16} /> KEMBALI
          </button>
          <h1 className="text-3xl md:text-5xl font-serif font-black text-slate-900 mb-2">
            Formulir <span className="text-red-600">Registrasi</span>
          </h1>
          <p className="text-slate-500 flex justify-center items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            Fase Aktif:{" "}
            <span className="font-bold text-slate-900 uppercase">
              {eventStatus.activePhaseName || "Regular"}
            </span>
          </p>
        </div>

        <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200 overflow-hidden relative border border-white">
          {/* Progress Bar */}
          <div className="flex items-center border-b border-slate-100 bg-slate-50/50">
            <div
              className={`flex-1 py-4 text-center text-sm font-bold border-b-2 transition-all ${step === 1 ? "text-red-600 border-red-600 bg-white" : "text-slate-400 border-transparent"}`}
            >
              1. Identitas Diri
            </div>
            <div
              className={`flex-1 py-4 text-center text-sm font-bold border-b-2 transition-all ${step === 2 ? "text-red-600 border-red-600 bg-white" : "text-slate-400 border-transparent"}`}
            >
              2. Kategori & Medis
            </div>
          </div>

          <div className="p-8 md:p-12">
            {step === 1 && (
              <div className="space-y-8 animate-fade-in">
                {/* SECTION: DATA DIRI */}
                <div className="space-y-6">
                  <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
                    <User className="text-red-600" /> Identitas Personal
                  </h3>
                  <div className="grid md:grid-cols-2 gap-5">
                    <ModernInput
                      label="Nama Lengkap"
                      name="fullName"
                      placeholder="Sesuai KTP"
                      icon={User}
                      value={formData.fullName}
                      onChange={handleChange}
                      error={errors.fullName}
                      colSpan={2}
                    />
                    <ModernInput
                      label="NIK"
                      name="nik"
                      placeholder="16 Digit Angka"
                      icon={CreditCard}
                      maxLength={16}
                      value={formData.nik}
                      onChange={handleChange}
                      error={errors.nik}
                    />
                    <ModernInput
                      label="Jenis Kelamin"
                      name="gender"
                      icon={User}
                      options={[
                        { value: "Laki-laki", label: "Laki-laki" },
                        { value: "Perempuan", label: "Perempuan" },
                      ]}
                      value={formData.gender}
                      onChange={handleChange}
                    />
                    <ModernInput
                      label="Tanggal Lahir"
                      name="birthDate"
                      type="date"
                      icon={Calendar}
                      value={formData.birthDate}
                      onChange={handleChange}
                      error={errors.birthDate}
                    />
                    <ModernInput
                      label="WhatsApp"
                      name="phoneNumber"
                      placeholder="08xxxxxxxx"
                      icon={Phone}
                      value={formData.phoneNumber}
                      onChange={handleChange}
                      error={errors.phoneNumber}
                    />
                  </div>
                </div>

                {/* SECTION: DOMISILI */}
                <div className="space-y-6">
                  <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
                    <MapPin className="text-red-600" /> Kontak & Domisili
                  </h3>
                  <div className="grid md:grid-cols-2 gap-5">
                    <ModernInput
                      label="Email Aktif"
                      name="email"
                      placeholder="nama@gmail.com"
                      icon={Mail}
                      value={formData.email}
                      onChange={handleChange}
                      error={errors.email}
                      colSpan={2}
                    />
                    <ModernInput
                      label="Provinsi"
                      name="province"
                      placeholder="Jawa Timur"
                      icon={MapPin}
                      value={formData.province}
                      onChange={handleChange}
                      error={errors.province}
                    />
                    <ModernInput
                      label="Kota/Kab"
                      name="city"
                      placeholder="Surabaya"
                      icon={MapPin}
                      value={formData.city}
                      onChange={handleChange}
                      error={errors.city}
                    />
                  </div>
                </div>

                {/* CONFIRMATION */}
                <div className="bg-blue-50 p-5 rounded-2xl border border-blue-100 mt-6">
                  <label className="flex items-start gap-4 cursor-pointer">
                    <div className="relative pt-1">
                      <input
                        type="checkbox"
                        checked={isDataConfirmed}
                        onChange={(e) => setIsDataConfirmed(e.target.checked)}
                        className="peer h-5 w-5 rounded border-slate-300 text-red-600 focus:ring-red-500"
                      />
                    </div>
                    <div className="text-sm text-slate-600">
                      Saya menyatakan bahwa data yang diisi adalah{" "}
                      <strong>BENAR</strong> dan sesuai identitas asli
                      (KTP/SIM/Paspor).
                    </div>
                  </label>
                </div>

                <button
                  disabled={!isDataConfirmed}
                  onClick={handleNextStep}
                  className={`w-full py-5 rounded-2xl font-bold text-lg flex justify-center items-center gap-2 transition-all shadow-xl
                    ${isDataConfirmed ? "bg-red-600 text-white hover:bg-red-700 hover:shadow-red-600/30 hover:-translate-y-1" : "bg-slate-200 text-slate-400 cursor-not-allowed"}
                  `}
                >
                  Lanjut Langkah 2 <ChevronRight />
                </button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-10 animate-fade-in">
                {/* SECTION: PILIH KATEGORI */}
                <div>
                  <h3 className="text-xl font-bold text-slate-900 mb-6 text-center">
                    Pilih Kategori Lari
                  </h3>

                  {/* ALERT JIKA SOLD OUT */}
                  {eventStatus.status?.isSoldOut && (
                    <div className="p-4 bg-red-100 text-red-700 rounded-xl mb-6 text-center font-bold border border-red-200 animate-pulse">
                      ⚠️ Mohon Maaf, Semua Kuota Fase Ini Sudah Penuh!
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    {/* CARD 5K */}
                    <button
                      type="button"
                      disabled={eventStatus.status?.is5KFull}
                      onClick={() =>
                        setFormData((p) => ({ ...p, category: "5K" }))
                      }
                      className={`relative p-6 rounded-3xl border-2 transition-all duration-300 flex flex-col items-center text-center group
                              ${
                                eventStatus.status?.is5KFull
                                  ? "opacity-50 grayscale cursor-not-allowed bg-slate-50 border-slate-200"
                                  : "cursor-pointer"
                              }
                              ${
                                formData.category === "5K" &&
                                !eventStatus.status?.is5KFull
                                  ? "border-red-600 bg-red-50 ring-4 ring-red-100 shadow-xl scale-[1.02]"
                                  : "border-slate-100 hover:border-red-200 hover:bg-white bg-white hover:shadow-lg"
                              }
                           `}
                    >
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 transition-colors ${formData.category === "5K" ? "bg-red-600 text-white" : "bg-slate-100 text-slate-500"}`}
                      >
                        <Trophy size={24} />
                      </div>
                      <h4 className="text-3xl font-black text-slate-900">5K</h4>
                      <p className="text-xs font-bold text-red-600 uppercase tracking-widest mb-2">
                        Heritage Run
                      </p>

                      {/* Badge Sold Out / Check */}
                      {eventStatus.status?.is5KFull ? (
                        <span className="bg-slate-800 text-white text-[10px] font-bold px-2 py-1 rounded uppercase">
                          Sold Out
                        </span>
                      ) : (
                        formData.category === "5K" && (
                          <div className="absolute top-4 right-4 text-red-600">
                            <CheckCircle size={24} fill="white" />
                          </div>
                        )
                      )}
                    </button>

                    {/* CARD 3K */}
                    <button
                      type="button"
                      disabled={eventStatus.status?.is3KFull}
                      onClick={() =>
                        setFormData((p) => ({ ...p, category: "3K" }))
                      }
                      className={`relative p-6 rounded-3xl border-2 transition-all duration-300 flex flex-col items-center text-center group
                              ${
                                eventStatus.status?.is3KFull
                                  ? "opacity-50 grayscale cursor-not-allowed bg-slate-50 border-slate-200"
                                  : "cursor-pointer"
                              }
                              ${
                                formData.category === "3K" &&
                                !eventStatus.status?.is3KFull
                                  ? "border-slate-800 bg-slate-50 ring-4 ring-slate-200 shadow-xl scale-[1.02]"
                                  : "border-slate-100 hover:border-slate-300 hover:bg-white bg-white hover:shadow-lg"
                              }
                           `}
                    >
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 transition-colors ${formData.category === "3K" ? "bg-slate-800 text-white" : "bg-slate-100 text-slate-500"}`}
                      >
                        <Footprints size={24} />
                      </div>
                      <h4 className="text-3xl font-black text-slate-900">3K</h4>
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
                        Fun Walk
                      </p>

                      {eventStatus.status?.is3KFull ? (
                        <span className="bg-slate-800 text-white text-[10px] font-bold px-2 py-1 rounded uppercase">
                          Sold Out
                        </span>
                      ) : (
                        formData.category === "3K" && (
                          <div className="absolute top-4 right-4 text-slate-800">
                            <CheckCircle size={24} fill="white" />
                          </div>
                        )
                      )}
                    </button>
                  </div>
                </div>

                <hr className="border-slate-100" />

                <div className="grid md:grid-cols-2 gap-8">
                  {/* SECTION: JERSEY */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="font-bold flex items-center gap-2">
                        <Shirt className="text-red-600" /> Ukuran Jersey
                      </h3>
                      <button
                        type="button"
                        onClick={() => setShowSizeChart(true)}
                        className="text-xs font-bold text-slate-400 hover:text-red-600 underline"
                      >
                        Lihat Size Chart
                      </button>
                    </div>
                    <div className="bg-slate-50 p-1 rounded-xl flex mb-2">
                      {["Dewasa", "Anak"].map((t) => (
                        <button
                          type="button"
                          key={t}
                          onClick={() =>
                            setFormData((p) => ({
                              ...p,
                              jerseyType: t,
                              jerseySize: t === "Dewasa" ? "M" : "Size 6",
                            }))
                          }
                          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${formData.jerseyType === t ? "bg-white shadow-sm text-slate-900" : "text-slate-400"}`}
                        >
                          {t.toUpperCase()}
                        </button>
                      ))}
                    </div>
                    <ModernInput
                      name="jerseySize"
                      options={
                        formData.jerseyType === "Dewasa"
                          ? ["S", "M", "L", "XL", "XXL"].map((v) => ({
                              value: v,
                              label: v,
                            }))
                          : ["Size 6", "Size 8", "Size 10", "Size 12"].map(
                              (v) => ({ value: v, label: v }),
                            )
                      }
                      value={formData.jerseySize}
                      onChange={handleChange}
                    />
                    <ModernInput
                      label="Nama BIB (Dada)"
                      name="bibName"
                      placeholder="MAX 12 HURUF"
                      maxLength={12}
                      value={formData.bibName}
                      onChange={handleChange}
                    />
                  </div>

                  {/* SECTION: MEDIS */}
                  <div className="space-y-4">
                    <h3 className="font-bold flex items-center gap-2">
                      <Heart className="text-red-600" /> Medis & Darurat
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      <ModernInput
                        label="Gol. Darah"
                        name="bloodType"
                        options={["A", "B", "AB", "O"].map((v) => ({
                          value: v,
                          label: v,
                        }))}
                        value={formData.bloodType}
                        onChange={handleChange}
                      />
                      <ModernInput
                        label="Penyakit"
                        name="medicalHistory"
                        options={[
                          "Tidak Ada",
                          "Asma",
                          "Jantung",
                          "Lainnya",
                        ].map((v) => ({ value: v, label: v }))}
                        value={formData.medicalHistory}
                        onChange={handleChange}
                      />
                    </div>
                    {/* INPUT KONTAK DARURAT */}
                    <div className="space-y-3 pt-2">
                      <p className="text-xs font-bold text-slate-400 uppercase">
                        Kontak Darurat (Wajib)
                      </p>
                      <div className="grid grid-cols-2 gap-3">
                        <input
                          name="emergencyName"
                          placeholder="Nama Kerabat"
                          value={formData.emergencyName}
                          onChange={handleChange}
                          className="bg-slate-50 border-2 border-transparent focus:bg-white focus:border-red-600 rounded-xl px-4 py-3 outline-none text-sm font-semibold w-full transition-all"
                        />
                        <input
                          name="emergencyRelation"
                          placeholder="Hubungan (Ayah/Ibu)"
                          value={formData.emergencyRelation}
                          onChange={handleChange}
                          className="bg-slate-50 border-2 border-transparent focus:bg-white focus:border-red-600 rounded-xl px-4 py-3 outline-none text-sm font-semibold w-full transition-all"
                        />
                      </div>
                      <input
                        name="emergencyPhone"
                        placeholder="No HP Darurat (08xxx)"
                        value={formData.emergencyPhone}
                        onChange={handleChange}
                        className="bg-slate-50 border-2 border-transparent focus:bg-white focus:border-red-600 rounded-xl px-4 py-3 outline-none text-sm font-semibold w-full transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* WAIVER */}
                <label className="flex gap-4 p-5 bg-slate-50 rounded-2xl cursor-pointer hover:bg-slate-100 transition-colors border border-transparent hover:border-slate-200">
                  <input
                    type="checkbox"
                    checked={formData.waiverAccepted}
                    onChange={(e) =>
                      setFormData((p) => ({
                        ...p,
                        waiverAccepted: e.target.checked,
                      }))
                    }
                    className="h-5 w-5 rounded border-slate-300 text-red-600 focus:ring-red-500 mt-1"
                  />
                  <span className="text-sm text-slate-600 leading-relaxed">
                    Dengan ini saya menyatakan sehat jasmani dan rohani untuk
                    mengikuti event ini, serta membebaskan panitia dari segala
                    tuntutan hukum jika terjadi cedera akibat kelalaian pribadi.
                  </span>
                </label>

                <div className="flex gap-4">
                  <button
                    onClick={() => setStep(1)}
                    className="px-6 py-4 rounded-xl font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 transition-colors"
                  >
                    <ChevronLeft />
                  </button>
                  <button
                    disabled={
                      !formData.waiverAccepted ||
                      loading ||
                      eventStatus.status?.isSoldOut
                    }
                    onClick={handleSubmit}
                    className={`flex-1 py-4 rounded-xl font-bold text-lg text-white shadow-xl transition-all flex justify-center items-center gap-2
                           ${
                             formData.waiverAccepted &&
                             !eventStatus.status?.isSoldOut
                               ? "bg-red-600 hover:bg-red-700 hover:-translate-y-1 shadow-red-600/20"
                               : "bg-slate-300 cursor-not-allowed"
                           }
                        `}
                  >
                    {loading
                      ? "Memproses..."
                      : eventStatus.status?.isSoldOut
                        ? "Pendaftaran Penuh"
                        : "Daftar Sekarang"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MODAL SIZE CHART */}
      {showSizeChart && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden animate-scale-up">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-lg">Size Chart Jersey</h3>
              <button type="button" onClick={() => setShowSizeChart(false)}>
                <X size={24} className="text-slate-400 hover:text-slate-900" />
              </button>
            </div>
            <div className="p-6 overflow-x-auto">
              <table className="w-full text-center text-sm">
                <thead className="font-bold bg-slate-50 text-slate-900">
                  <tr>
                    <th className="py-3 px-2 rounded-l-lg">Size</th>
                    <th className="px-2">Lebar (cm)</th>
                    <th className="px-2 rounded-r-lg">Panjang (cm)</th>
                  </tr>
                </thead>
                <tbody className="text-slate-600 divide-y divide-slate-100">
                  {[
                    { s: "S", l: 48, p: 68 },
                    { s: "M", l: 50, p: 70 },
                    { s: "L", l: 52, p: 72 },
                    { s: "XL", l: 54, p: 74 },
                    { s: "XXL", l: 56, p: 76 },
                  ].map((r, i) => (
                    <tr key={i} className="hover:bg-slate-50">
                      <td className="py-3 font-bold">{r.s}</td>
                      <td>{r.l}</td>
                      <td>{r.p}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="p-6 pt-0">
              <button
                onClick={() => setShowSizeChart(false)}
                className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
         .animate-fade-in { animation: fadeIn 0.5s ease-out forwards; }
         .animate-scale-up { animation: scaleUp 0.3s ease-out forwards; }
         @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
         @keyframes scaleUp { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
      `}</style>
    </div>
  );
};

export default RegistrationForm;
