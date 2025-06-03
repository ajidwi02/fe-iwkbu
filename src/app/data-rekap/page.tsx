"use client";

import { useEffect, useState } from "react";
import RekapTabel from "../detail-data-cabang/RekapTabel3M";
import RekapTabelKonversi from "./RekapKonversiIWKBU";

const Rekap = () => {
  const [currentTime, setCurrentTime] = useState<string>("");

  const [tanggalAwal, setTanggalAwal] = useState<string>("");
  const [tanggalAkhir, setTanggalAkhir] = useState<string>("");

  const [submittedAwal, setSubmittedAwal] = useState<string>("");
  const [submittedAkhir, setSubmittedAkhir] = useState<string>("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const formattedDate = now.toLocaleDateString("id-ID");
      const formattedTime = now.toLocaleTimeString("id-ID", {
        hour12: false,
      });
      setCurrentTime(`${formattedDate} ${formattedTime}`);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);

    return () => clearInterval(interval);
  }, []);

  // fungsi untuk tombol submit
  const formatTanggal = (tanggal: string) => {
    const d = new Date(tanggal);
    const day = d.getDate().toString().padStart(2, "0");
    const month = (d.getMonth() + 1).toString().padStart(2, "0");
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  };

  // fungsi untuk tombol Submit
  const handleSubmit = () => {
    if (!tanggalAwal || !tanggalAkhir) {
      alert("Pilih tanggal awal dan akhir");
      return;
    }
    setSubmittedAwal(tanggalAwal);
    setSubmittedAkhir(tanggalAkhir);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-gray-900 text-white py-4 px-4 md:px-8">
        <h1 className="text-xl md:text-3xl font-bold text-center uppercase leading-tight">
          Monitoring CICO & Konversi IWKBU
        </h1>
      </div>

      {/* Sub Header */}
      <div className="bg-white py-4 px-4 md:px-8 border-b border-gray-200">
        <h2 className="text-base md:text-lg font-bold text-black text-center uppercase tracking-wide">
          {submittedAwal && submittedAkhir
            ? `Checkin Checkout Penerimaan IWKBU Periode ${formatTanggal(
                submittedAwal
              )} s.d ${formatTanggal(submittedAkhir)}`
            : "Checkin Checkout Penerimaan IWKBU Periode 01-05-2025 s.d. 31-05-2025"}
        </h2>
      </div>

      {/* Rekap Section */}
      <div className="px-4 md:px-8 py-6">
        <RekapTabelKonversi />
      </div>

      {/* Table Section */}
    </div>
  );
};

export default Rekap;
