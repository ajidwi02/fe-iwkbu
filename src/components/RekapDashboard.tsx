"use client";

import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

import { Button } from "./ui/button";

import { Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Plus, Minus, FileSpreadsheet } from "lucide-react";

export interface DateRangeProps {
  startDate: Date | null;
  endDate: Date | null;
  onDateRangeChange: (start: Date | null, end: Date | null) => void;
  initialStartDate?: Date;
  initialEndDate?: Date;
}

interface ReportData {
  loket: string;
  kode_loket: string;
  iwkbu_tl_tgl_transaksi: string;
  iwkbu_tl_nopol: string;
  iwkbu_tl_rupiah_penerimaan: number;
  iwkbu_ti_tgl_transaksi: string;
  iwkbu_ti_nopol: string;
  iwkbu_ti_rupiah_penerimaan: number;
  kode_nopol_ci: number;
  kode_nopol_co: number;
  iwkbu_tl_bulan_maju: number;
  iwkbu_ti_bulan_maju: number;
  tl_keterangan_konversi_iwkbu: string;
}

interface GapDetail {
  nopol: string;
  keterangan: string;
  rupiah: number;
  tgl_transaksi: string;
  loket?: string;
}

interface RekapRow {
  no: number;
  loketKantor: string;
  petugas: string;
  checkinNopol: number;
  checkinRupiah: number;
  checkoutNopol: number;
  checkoutRupiah: number;
  memastikanNopol: number;
  memastikanRupiah: number;
  memastikanPersen: number;
  menambahkanNopol: number;
  menambahkanRupiah: number;
  mengupayakan: number;
  gapNopol: number;
  sisaNopol: number;
  sisaRupiah: number;
  gapDetails: GapDetail[];
  mengupayakanCount: number;
}

const loketMapping = [
  {
    no: 1,
    parentLoket: "KANWIL JAWA TENGAH",
    childLoket: "LOKET KANWIL JAWA TENGAH",
    petugas: "GUNTUR DWI SAPUTRA",
    endpoint: "http://103.152.242.34:8080/loketcabangjawatengah",
  },
  {
    no: 2,
    parentLoket: "",
    childLoket: "SAMSAT KENDAL",
    petugas: "HEIRTANA HANDIETRA",
    endpoint: "http://103.152.242.34:8080/samsatkendal",
  },
  {
    no: 3,
    parentLoket: "",
    childLoket: "SAMSAT DEMAK",
    petugas: "TIARA HAPSARI",
    endpoint: "http://103.152.242.34:8080/samsatdemak", //data gagal terambil
  },
  {
    no: 4,
    parentLoket: "",
    childLoket: "SAMSAT PURWODADI",
    petugas: "ADI SETIAWAN",
    endpoint: "http://103.152.242.34:8080/samsatpurwodadi",
  },
  {
    no: 5,
    parentLoket: "",
    childLoket: "SAMSAT UNGARAN",
    petugas: "MAHENDRA DWI HEISTRIANTO",
    endpoint: "http://103.152.242.34:8080/samsatungaran",
  },
  {
    no: 6,
    parentLoket: "",
    childLoket: "SAMSAT SALATIGA",
    petugas: "RIKA WAHYU UTAMI",
    endpoint: "http://103.152.242.34:8080/samsatsalatiga",
  },

  // Wilayah Surakarta
  {
    no: 7,
    parentLoket: "CABANG SURAKARTA",
    childLoket: "LOKET CABANG SURAKARTA",
    petugas: "M. ROSYID ABDURRACHMAN",
    endpoint: "http://103.152.242.34:8080/samsatlokperwsra",
  },
  {
    no: 8,
    parentLoket: "",
    childLoket: "SAMSAT SURAKARTA",
    petugas: "HARI SETIAWAN",
    endpoint: "http://103.152.242.34:8080/samsatsurakarta",
  },
  {
    no: 9,
    parentLoket: "",
    childLoket: "SAMSAT KLATEN",
    petugas: "R ANTON PRASETYO",
    endpoint: "http://103.152.242.34:8080/samsatklaten",
  },
  {
    no: 10,
    parentLoket: "",
    childLoket: "SAMSAT BOYOLALI",
    petugas: "RIO AQIL TITA",
    endpoint: "http://103.152.242.34:8080/samsatboyolali",
  },
  {
    no: 11,
    parentLoket: "",
    childLoket: "SAMSAT SRAGEN",
    petugas: "ARIE SOFIANTO",
    endpoint: "http://103.152.242.34:8080/samsatsragen",
  },
  {
    no: 12,
    parentLoket: "",
    childLoket: "SAMSAT PRAMBANAN",
    petugas: "ARISTO YANLIAR",
    endpoint: "http://103.152.242.34:8080/samsatprambanan",
  },
  {
    no: 13,
    parentLoket: "",
    childLoket: "SAMSAT DELANGGU",
    petugas: "SURYO BAGUS LUDIRO",
    endpoint: "http://103.152.242.34:8080/samsatdelanggu",
  },

  // Wilayah Magelang
  {
    no: 14,
    parentLoket: "CABANG MAGELANG",
    childLoket: "LOKET CABANG MAGELANG",
    petugas: "MAHARIS",
    endpoint: "http://103.152.242.34:8080/samsatlokpwkmgl",
  },
  {
    no: 15,
    parentLoket: "",
    childLoket: "SAMSAT MAGELANG",
    petugas: "BAGAS JATI INDRA SETIAWAN",
    endpoint: "http://103.152.242.34:8080/samsatmagelang",
  },
  {
    no: 16,
    parentLoket: "",
    childLoket: "SAMSAT PURWOREJO",
    petugas: "SEPTIAN ADE R.R",
    endpoint: "http://103.152.242.34:8080/samsatpurworejo",
  },
  {
    no: 17,
    parentLoket: "",
    childLoket: "SAMSAT KEBUMEN",
    petugas: "TUTIK WURYANTARI",
    endpoint: "http://103.152.242.34:8080/samsatkebumen",
  },
  {
    no: 18,
    parentLoket: "",
    childLoket: "SAMSAT TEMANGGUNG",
    petugas: "IKA WINANDITA SARI",
    endpoint: "http://103.152.242.34:8080/samsattemanggung",
  },
  {
    no: 19,
    parentLoket: "",
    childLoket: "SAMSAT WONOSOBO",
    petugas: "TYSON ADHY PAMUNGKAS",
    endpoint: "http://103.152.242.34:8080/samsatwonosobo",
  },
  {
    no: 20,
    parentLoket: "",
    childLoket: "SAMSAT MUNGKID",
    petugas: "DANY YULIANANTO",
    endpoint: "http://103.152.242.34:8080/samsatmungkid",
  },
  {
    no: 21,
    parentLoket: "",
    childLoket: "SAMSAT BAGELEN",
    petugas: "WINOTO PUJO RUMIESGO",
    endpoint: "http://103.152.242.34:8080/samsatbagelen",
  },

  // Wilayah Purwokerto
  {
    no: 22,
    parentLoket: "CABANG PURWOKERTO",
    childLoket: "LOKET CABANG PURWOKERTO",
    petugas: "ARMA HEDITA S.R.",
    endpoint: "http://103.152.242.34:8080/samsatlokprwpwt",
  },
  {
    no: 23,
    parentLoket: "",
    childLoket: "SAMSAT PURWOKERTO",
    petugas: "ILHAM A.POHAN",
    endpoint: "http://103.152.242.34:8080/samsat/purwokerto",
  },
  {
    no: 24,
    parentLoket: "",
    childLoket: "SAMSAT PURBALINGGA",
    petugas: "AHMAD IMRAN RASIDI",
    endpoint: "http://103.152.242.34:8080/samsat/purbalingga",
  },
  {
    no: 25,
    parentLoket: "",
    childLoket: "SAMSAT BANJARNEGARA",
    petugas: "AFRIYANSYA PRAYUGO",
    endpoint: "http://103.152.242.34:8080/samsat/banjarnegara", //data gagal terambil
  },
  {
    no: 26,
    parentLoket: "",
    childLoket: "SAMSAT MAJENANG",
    petugas: "LIA PUJI UTANTO",
    endpoint: "http://103.152.242.34:8080/samsat/majenang",
  },
  {
    no: 27,
    parentLoket: "",
    childLoket: "SAMSAT CILACAP",
    petugas: "WIDI ANTORO",
    endpoint: "http://103.152.242.34:8080/samsat/cilacap",
  },
  {
    no: 28,
    parentLoket: "",
    childLoket: "SAMSAT WANGON",
    petugas: "RIZKY DWI HATMO N.",
    endpoint: "http://103.152.242.34:8080/samsat/wangon",
  },

  // Wilayah Pekalongan
  {
    no: 29,
    parentLoket: "CABANG PEKALONGAN",
    childLoket: "LOKET CABANG PEKALONGAN",
    petugas: "WAHYU AKBAR ADIGUNA",
    endpoint: "http://103.152.242.34:8080/samsat/lokprwpkl",
  },
  {
    no: 30,
    parentLoket: "",
    childLoket: "SAMSAT PEKALONGAN",
    petugas: "YUDHO TIGO PRAKOSO",
    endpoint: "http://103.152.242.34:8080/samsat/pekalongan",
  },
  {
    no: 31,
    parentLoket: "",
    childLoket: "SAMSAT PEMALANG",
    petugas: "ENDY ARYAGUNAWAN A.A",
    endpoint: "http://103.152.242.34:8080/samsat/pemalang",
  },
  {
    no: 32,
    parentLoket: "",
    childLoket: "SAMSAT TEGAL",
    petugas: "M.SOFYAN ARIFIN MARSETYO",
    endpoint: "http://103.152.242.34:8080/samsat/tegal",
  },
  {
    no: 33,
    parentLoket: "",
    childLoket: "SAMSAT BREBES",
    petugas: "KRISTANTO PRATAMA",
    endpoint: "http://103.152.242.34:8080/samsat/brebes",
  },
  {
    no: 34,
    parentLoket: "",
    childLoket: "SAMSAT BATANG",
    petugas: "SEPTIN DIAH KURNIAWATI",
    endpoint: "http://103.152.242.34:8080/samsat/batang",
  },
  {
    no: 35,
    parentLoket: "",
    childLoket: "SAMSAT KAJEN",
    petugas: "YUDHI BAGUS KURNIAWATI",
    endpoint: "http://103.152.242.34:8080/samsat/kajen",
  },
  {
    no: 36,
    parentLoket: "",
    childLoket: "SAMSAT SLAWI",
    petugas: "WASKITO ADHI ARIYANTO",
    endpoint: "http://103.152.242.34:8080/samsat/slawi",
  },
  {
    no: 37,
    parentLoket: "",
    childLoket: "SAMSAT BUMIAYU",
    petugas: "HARI SUDJATNIKO",
    endpoint: "http://103.152.242.34:8080/samsat/bumiayu",
  },
  {
    no: 38,
    parentLoket: "",
    childLoket: "SAMSAT TANJUNG",
    petugas: "MAGDALENA SIAHAAN",
    endpoint: "http://103.152.242.34:8080/samsat/tanjung",
  },

  // Wilayah Pati
  {
    no: 39,
    parentLoket: "CABANG PATI",
    childLoket: "LOKET CABANG PATI",
    petugas: "YEKTI KUMALA SARI",
    endpoint: "http://103.152.242.34:8080/samsat/lokprwpti",
  },
  {
    no: 40,
    parentLoket: "",
    childLoket: "SAMSAT PATI",
    petugas: "ARIA BRAMANTO",
    endpoint: "http://103.152.242.34:8080/samsat/pati",
  },
  {
    no: 41,
    parentLoket: "",
    childLoket: "SAMSAT KUDUS",
    petugas: "AGUS MUJAYANTO",
    endpoint: "http://103.152.242.34:8080/samsat/kudus",
  },
  {
    no: 42,
    parentLoket: "",
    childLoket: "SAMSAT JEPARA",
    petugas: "IWAN BACHTIAR",
    endpoint: "http://103.152.242.34:8080/samsat/jepara",
  },
  {
    no: 43,
    parentLoket: "",
    childLoket: "SAMSAT REMBANG",
    petugas: "ADHIYANTO",
    endpoint: "http://103.152.242.34:8080/samsat/rembang",
  },
  {
    no: 44,
    parentLoket: "",
    childLoket: "SAMSAT BLORA",
    petugas: "WAHYUL HUDA",
    endpoint: "http://103.152.242.34:8080/samsat/blora",
  },
  {
    no: 45,
    parentLoket: "",
    childLoket: "SAMSAT CEPU",
    petugas: "MUHAMMAD FAHRUDDIN",
    endpoint: "http://103.152.242.34:8080/samsat/cepu",
  },
  // Wilayah Semarang
  {
    no: 46,
    parentLoket: "CABANG SEMARANG",
    childLoket: "LOKET CABANG SEMARANG",
    petugas: "ARIEF EKA SETIAWAN",
    endpoint: "http://103.152.242.34:8080/samsat/lokprwsmg",
  },
  {
    no: 47,
    parentLoket: "",
    childLoket: "SAMSAT SEMARANG I",
    petugas: "BIMO",
    endpoint: "http://103.152.242.34:8080/samsat/semarang1",
  },
  {
    no: 48,
    parentLoket: "",
    childLoket: "SAMSAT SEMARANG II",
    petugas: "ADITYA GINANJAR INDRASAKTI",
    endpoint: "http://103.152.242.34:8080/samsat/semarang2",
  },
  {
    no: 49,
    parentLoket: "",
    childLoket: "SAMSAT SEMARANG III",
    petugas: "ARIS MURDIYANTO",
    endpoint: "http://103.152.242.34:8080/samsat/semarang3",
  },
  // Wilayah Sukoharjo
  {
    no: 50,
    parentLoket: "CABANG SUKOHARJO",
    childLoket: "LOKET CABANG SUKOHARJO",
    petugas: "M. HASBI",
    endpoint: "http://103.152.242.34:8080/samsat/lokprwskh",
  },
  {
    no: 51,
    parentLoket: "",
    childLoket: "SAMSAT SUKOHARJO",
    petugas: "MARIA TUTI",
    endpoint: "http://103.152.242.34:8080/samsat/sukoharjo",
  },
  {
    no: 52,
    parentLoket: "",
    childLoket: "SAMSAT KARANGANYAR",
    petugas: "M. WAHYUANTO",
    endpoint: "http://103.152.242.34:8080/samsat/karanganyar",
  },
  {
    no: 53,
    parentLoket: "",
    childLoket: "SAMSAT WONOGIRI",
    petugas: "ADISTI",
    endpoint: "http://103.152.242.34:8080/samsat/wonogiri",
  },
  {
    no: 54,
    parentLoket: "",
    childLoket: "SAMSAT PURWANTORO",
    petugas: "BONNY C. EDWARD",
    endpoint: "http://103.152.242.34:8080/samsat/purwantoro",
  },
  {
    no: 55,
    parentLoket: "",
    childLoket: "SAMSAT BATURETNO",
    petugas: "M. TAUFIKUROHMAN",
    endpoint: "http://103.152.242.34:8080/samsat/baturetno",
  },
];

const RekapDashboard = ({
  onDateRangeChange,
  initialStartDate,
  initialEndDate,
}: DateRangeProps) => {
  const [data, setData] = useState<{ endpoint: string; data: ReportData[] }[]>(
    []
  );
  const [rekapData, setRekapData] = useState<RekapRow[]>([]);
  const [month, setMonth] = useState<number>(5);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRow, setSelectedRow] = useState<RekapRow | null>(null);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [useDateRange, setUseDateRange] = useState(true);

  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>(
    {}
  );
  //fungsi expand
  const toggleGroup = (groupName: string) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [groupName]: !prev[groupName],
    }));
  };
  const formatDateWithoutYear = (date: Date | null) => {
    if (!date) return "Pilih Tanggal";
    return format(date, "dd MMMM");
  };

  const filterDataByDate = () => {
    if (!startDate || !endDate) return;

    setUseDateRange(true);
    onDateRangeChange(startDate, endDate);
    generateRekap();
  };

  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${Math.round(value * 100)}%`;
  };

  // fungsi untuk export di excel
  const exportGapDetailsToExcel = (row: RekapRow) => {
    if (!row.gapDetails || row.gapDetails.length === 0) {
      alert("Tidak ada data GAP untuk diexport.");
      return;
    }

    const dataToExport = row.gapDetails.map((item) => ({
      Nopol: item.nopol,
      Keterangan: item.keterangan,
      Rupiah: item.rupiah,
      Tanggal_Transaksi: item.tgl_transaksi,
      Loket: item.loket || row.loketKantor,
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "GAP Nopol");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    const fileName = `GAP_${row.loketKantor.replace(/\s+/g, "_")}.xlsx`;
    saveAs(blob, fileName);
  };
  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      const responses = await Promise.all(
        loketMapping.map((item) =>
          fetch(item.endpoint)
            .then((response) => {
              if (!response.ok)
                throw new Error(`Gagal mengambil data dari ${item.endpoint}`);
              return response.json();
            })
            .then((result) => ({
              endpoint: item.endpoint,
              data: result.data || [],
            }))
            .catch((err) => {
              console.error(`Error fetching ${item.endpoint}:`, err);
              return {
                endpoint: item.endpoint,
                data: [],
                error: err.message,
              };
            })
        )
      );

      setData(responses);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi Kesalahan");
    } finally {
      setLoading(false);
    }
  };

  const generateRekap = () => {
    if (!data.length) {
      console.log("Data masih kosong");
      return;
    }

    const monthStr = month.toString().padStart(2, "0");
    const result: RekapRow[] = [];
    let groupSubTotal: RekapRow | null = null;

    // Helper function to compare dates ignoring year
    const isDateInRange = (
      dateStr: string,
      start: Date | null,
      end: Date | null
    ) => {
      if (!start || !end || !dateStr) return false;

      const parts = dateStr.split("/");
      if (parts.length < 2) return false;

      const day = parseInt(parts[0]);
      const month = parseInt(parts[1]);

      // Use fixed year (2000) for comparison
      const date = new Date(2000, month - 1, day);
      const startDate = new Date(2000, start.getMonth(), start.getDate());
      const endDate = new Date(2000, end.getMonth(), end.getDate());

      return date >= startDate && date <= endDate;
    };

    loketMapping.forEach((loket) => {
      const endpointData =
        data.find((d) => d.endpoint === loket.endpoint)?.data || [];
      const gapDetails: GapDetail[] = [];

      const rekap: RekapRow = {
        no: loket.no,
        loketKantor: loket.childLoket,
        petugas: loket.petugas,
        checkinNopol: 0,
        checkinRupiah: 0,
        checkoutNopol: 0,
        checkoutRupiah: 0,
        memastikanNopol: 0,
        memastikanRupiah: 0,
        memastikanPersen: 0,
        menambahkanNopol: 0,
        menambahkanRupiah: 0,
        mengupayakan: 0,
        gapNopol: 0,
        sisaNopol: 0,
        sisaRupiah: 0,
        gapDetails: [],
        mengupayakanCount: 0,
      };

      const matchedNopol = new Set<string>();
      let matchedRupiah = 0;
      let totalBulanMajuTI = 0;
      let totalBulanMajuTL = 0;
      let countNopolBulanMajuTL = 0;
      let countNopolBulanMajuTI = 0;
      let menambahkanNopol = 0;
      let menambahkanRupiah = 0;
      const sisaNopolSet = new Set<string>();
      let sisaRupiah = 0;

      // Process checkin (TL) data
      endpointData.forEach((item) => {
        if (item.iwkbu_tl_tgl_transaksi) {
          const [day, mon] = item.iwkbu_tl_tgl_transaksi.split("/");

          // Check month filter or date range
          const monthMatch = mon === monthStr;
          const dateRangeMatch =
            useDateRange &&
            isDateInRange(item.iwkbu_tl_tgl_transaksi, startDate, endDate);

          if (
            (!useDateRange && monthMatch) ||
            (useDateRange && dateRangeMatch)
          ) {
            rekap.checkinNopol += item.kode_nopol_co || 0;
            rekap.checkinRupiah += item.iwkbu_tl_rupiah_penerimaan || 0;
            if (item.iwkbu_tl_bulan_maju > 0) {
              totalBulanMajuTL += item.iwkbu_tl_bulan_maju;
              countNopolBulanMajuTL++;
            }
          }
        }
      });

      // Process checkout (TI) data
      endpointData.forEach((item) => {
        if (item.iwkbu_ti_tgl_transaksi) {
          const [day, mon] = item.iwkbu_ti_tgl_transaksi.split("/");

          // Check month filter or date range
          const monthMatch = mon === monthStr;
          const dateRangeMatch =
            useDateRange &&
            isDateInRange(item.iwkbu_ti_tgl_transaksi, startDate, endDate);

          if (
            (!useDateRange && monthMatch) ||
            (useDateRange && dateRangeMatch)
          ) {
            rekap.checkoutNopol += item.kode_nopol_ci || 0;
            rekap.checkoutRupiah += item.iwkbu_ti_rupiah_penerimaan || 0;

            const isMenambahkan =
              item.tl_keterangan_konversi_iwkbu === "Armada Baru" ||
              item.tl_keterangan_konversi_iwkbu === "Mutasi Masuk";

            const isMemastikan = endpointData.some(
              (ciItem) =>
                ciItem.iwkbu_tl_nopol === item.iwkbu_ti_nopol &&
                ciItem.iwkbu_tl_tgl_transaksi &&
                ((!useDateRange &&
                  ciItem.iwkbu_tl_tgl_transaksi.split("/")[1] === monthStr) ||
                  (useDateRange &&
                    isDateInRange(
                      ciItem.iwkbu_tl_tgl_transaksi,
                      startDate,
                      endDate
                    )))
            );

            if (isMenambahkan) {
              menambahkanNopol += 1;
              menambahkanRupiah += item.iwkbu_ti_rupiah_penerimaan || 0;
            }

            if (isMemastikan && item.iwkbu_ti_nopol) {
              if (!matchedNopol.has(item.iwkbu_ti_nopol)) {
                matchedNopol.add(item.iwkbu_ti_nopol);
                matchedRupiah += item.iwkbu_ti_rupiah_penerimaan || 0;
              }
            }
            const processedNopols = new Set<string>();
            endpointData.forEach((ciItem) => {
              if (
                ciItem.iwkbu_ti_nopol &&
                ((isMemastikan && matchedNopol.has(ciItem.iwkbu_ti_nopol)) ||
                  (isMenambahkan &&
                    (ciItem.tl_keterangan_konversi_iwkbu === "Armada Baru" ||
                      ciItem.tl_keterangan_konversi_iwkbu === "Mutasi Masuk")))
              ) {
                processedNopols.add(ciItem.iwkbu_ti_nopol);
              }
            });

            if (
              item.iwkbu_ti_nopol &&
              !processedNopols.has(item.iwkbu_ti_nopol)
            ) {
              sisaNopolSet.add(item.iwkbu_ti_nopol);
              sisaRupiah += item.iwkbu_ti_rupiah_penerimaan || 0;
            }

            if (item.iwkbu_ti_bulan_maju > 0) {
              totalBulanMajuTI += item.iwkbu_ti_bulan_maju;
              countNopolBulanMajuTI++;
            }
          }
        }
      });

      // Process gap details (checkin nopols not in checkout)
      endpointData.forEach((item) => {
        if (item.iwkbu_tl_tgl_transaksi) {
          const [day, mon] = item.iwkbu_tl_tgl_transaksi.split("/");

          // Check month filter or date range
          const monthMatch = mon === monthStr;
          const dateRangeMatch =
            useDateRange &&
            isDateInRange(item.iwkbu_tl_tgl_transaksi, startDate, endDate);

          if (
            (!useDateRange && monthMatch) ||
            (useDateRange && dateRangeMatch)
          ) {
            const foundInCheckout = endpointData.some(
              (tiItem) =>
                tiItem.iwkbu_ti_nopol === item.iwkbu_tl_nopol &&
                tiItem.iwkbu_ti_tgl_transaksi &&
                ((!useDateRange &&
                  tiItem.iwkbu_ti_tgl_transaksi.split("/")[1] === monthStr) ||
                  (useDateRange &&
                    isDateInRange(
                      tiItem.iwkbu_ti_tgl_transaksi,
                      startDate,
                      endDate
                    )))
            );

            if (!foundInCheckout) {
              gapDetails.push({
                nopol: item.iwkbu_tl_nopol,
                keterangan: item.tl_keterangan_konversi_iwkbu || "-",
                rupiah: item.iwkbu_tl_rupiah_penerimaan || 0,
                tgl_transaksi: item.iwkbu_tl_tgl_transaksi,
                loket: loket.childLoket,
              });

              if (groupSubTotal) {
                groupSubTotal.gapDetails.push({
                  ...gapDetails[gapDetails.length - 1],
                  loket: loket.childLoket,
                });
              }
            }
          }
        }
      });

      rekap.memastikanNopol = matchedNopol.size;
      rekap.memastikanRupiah = matchedRupiah;
      rekap.memastikanPersen =
        rekap.checkoutNopol > 0 ? matchedNopol.size / rekap.checkoutNopol : 0;
      rekap.menambahkanNopol = menambahkanNopol;
      rekap.menambahkanRupiah = menambahkanRupiah;
      rekap.gapNopol = rekap.checkinNopol - rekap.memastikanNopol;
      rekap.mengupayakan =
        countNopolBulanMajuTI > 0
          ? Math.round(totalBulanMajuTI / rekap.checkoutNopol)
          : 0;

      rekap.sisaNopol =
        rekap.checkoutNopol - (rekap.memastikanNopol + rekap.menambahkanNopol);
      rekap.sisaRupiah =
        rekap.checkoutRupiah -
        (rekap.memastikanRupiah + rekap.menambahkanRupiah);
      rekap.gapDetails = gapDetails;

      // Handle parent loket and subtotals
      if (loket.parentLoket) {
        if (groupSubTotal) {
          groupSubTotal.memastikanPersen =
            groupSubTotal.checkoutNopol > 0
              ? groupSubTotal.memastikanNopol / groupSubTotal.checkoutNopol
              : 0;

          // Calculate average mengupayakan for subtotal
          groupSubTotal.mengupayakan =
            groupSubTotal.mengupayakanCount > 0
              ? Math.round(
                  groupSubTotal.mengupayakan / groupSubTotal.mengupayakanCount
                )
              : 0;
          result.push(groupSubTotal);
          groupSubTotal = null;
        }

        result.push({
          no: 0,
          loketKantor: loket.parentLoket,
          petugas: "",
          checkinNopol: 0,
          checkinRupiah: 0,
          checkoutNopol: 0,
          checkoutRupiah: 0,
          memastikanNopol: 0,
          memastikanRupiah: 0,
          memastikanPersen: 0,
          menambahkanNopol: 0,
          menambahkanRupiah: 0,
          mengupayakan: 0,
          gapNopol: 0,
          sisaNopol: 0,
          sisaRupiah: 0,
          gapDetails: [],
          mengupayakanCount: 0,
        });

        groupSubTotal = {
          no: 0,
          loketKantor: "SUB TOTAL",
          petugas: "",
          checkinNopol: 0,
          checkinRupiah: 0,
          checkoutNopol: 0,
          checkoutRupiah: 0,
          memastikanNopol: 0,
          memastikanRupiah: 0,
          memastikanPersen: 0,
          menambahkanNopol: 0,
          menambahkanRupiah: 0,
          mengupayakan: 0,
          gapNopol: 0,
          sisaNopol: 0,
          sisaRupiah: 0,
          gapDetails: [],
          mengupayakanCount: 0,
        };
      }

      result.push(rekap);

      if (groupSubTotal) {
        groupSubTotal.checkinNopol += rekap.checkinNopol;
        groupSubTotal.checkinRupiah += rekap.checkinRupiah;
        groupSubTotal.checkoutNopol += rekap.checkoutNopol;
        groupSubTotal.checkoutRupiah += rekap.checkoutRupiah;
        groupSubTotal.memastikanNopol += rekap.memastikanNopol;
        groupSubTotal.memastikanRupiah += rekap.memastikanRupiah;
        groupSubTotal.menambahkanNopol += rekap.menambahkanNopol;
        groupSubTotal.menambahkanRupiah += rekap.menambahkanRupiah;
        if (rekap.mengupayakan > 0) {
          groupSubTotal.mengupayakan += rekap.mengupayakan;
          groupSubTotal.mengupayakanCount =
            (groupSubTotal.mengupayakanCount || 0) + 1;
        }
        groupSubTotal.gapNopol += rekap.gapNopol;
        groupSubTotal.sisaNopol += rekap.sisaNopol;
        groupSubTotal.sisaRupiah += rekap.sisaRupiah;
      }
    });

    if (groupSubTotal) {
      groupSubTotal.memastikanPersen =
        groupSubTotal.checkoutNopol > 0
          ? groupSubTotal.memastikanNopol / groupSubTotal.checkoutNopol
          : 0;

      // Calculate average mengupayakan for subtotal
      groupSubTotal.mengupayakan =
        groupSubTotal.mengupayakanCount > 0
          ? Math.round(
              groupSubTotal.mengupayakan / groupSubTotal.mengupayakanCount
            )
          : 0;

      result.push(groupSubTotal);
    }

    const subTotalRows = result.filter(
      (row) => row.loketKantor === "SUB TOTAL"
    );

    const grandTotal: RekapRow = {
      no: 0,
      loketKantor: "GRAND TOTAL",
      petugas: "",
      checkinNopol: subTotalRows.reduce(
        (sum, row) => sum + row.checkinNopol,
        0
      ),
      checkinRupiah: subTotalRows.reduce(
        (sum, row) => sum + row.checkinRupiah,
        0
      ),
      checkoutNopol: subTotalRows.reduce(
        (sum, row) => sum + row.checkoutNopol,
        0
      ),
      checkoutRupiah: subTotalRows.reduce(
        (sum, row) => sum + row.checkoutRupiah,
        0
      ),
      memastikanNopol: subTotalRows.reduce(
        (sum, row) => sum + row.memastikanNopol,
        0
      ),
      memastikanRupiah: subTotalRows.reduce(
        (sum, row) => sum + row.memastikanRupiah,
        0
      ),
      memastikanPersen:
        subTotalRows.reduce((sum, row) => sum + row.checkoutNopol, 0) > 0
          ? subTotalRows.reduce((sum, row) => sum + row.memastikanNopol, 0) /
            subTotalRows.reduce((sum, row) => sum + row.checkoutNopol, 0)
          : 0,
      menambahkanNopol: subTotalRows.reduce(
        (sum, row) => sum + row.menambahkanNopol,
        0
      ),
      menambahkanRupiah: subTotalRows.reduce(
        (sum, row) => sum + row.menambahkanRupiah,
        0
      ),
      mengupayakan: Math.round(
        subTotalRows.reduce((sum, row) => sum + row.mengupayakan, 0) /
          subTotalRows.filter((row) => row.mengupayakan > 0).length
      ),
      gapNopol: subTotalRows.reduce((sum, row) => sum + row.gapNopol, 0),
      sisaNopol: subTotalRows.reduce((sum, row) => sum + row.sisaNopol, 0),
      sisaRupiah: subTotalRows.reduce((sum, row) => sum + row.sisaRupiah, 0),
      gapDetails: [],
      mengupayakanCount: 0,
    };

    result.push(grandTotal);
    setRekapData(result);
  };

  useEffect(() => {
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    setStartDate(firstDayOfMonth);
    setEndDate(today);
    setMonth(today.getMonth() + 1);
    setUseDateRange(true);

    // kirim ke parent component
    onDateRangeChange(firstDayOfMonth, today);

    fetchData();
  }, []);

  useEffect(() => {
    if (data.length > 0) {
      generateRekap();
    }
  }, [data, month]);

  const handleDetail = (row: RekapRow) => {
    setSelectedRow(row);
  };

  if (loading) {
    return (
      <div className="p-4 text-center text-sm text-gray-500">
        Memuat data...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center text-sm text-red-500">Error: {error}</div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-end gap-4 rounded-md border p-4 shadow-sm">
          <div className="w-full">
            <label className="text-sm font-medium mb-1 block">
              Filter Tanggal
            </label>

            {/* Date Range Container */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full">
              {/* Start Date Picker */}
              <div className="w-full sm:w-auto">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full sm:w-[140px] justify-start text-left font-normal text-sm",
                        !startDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formatDateWithoutYear(startDate)}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={startDate || undefined}
                      onSelect={(date) => {
                        setStartDate(date || null);
                        if (date && endDate && date > endDate) {
                          setEndDate(null);
                        }
                      }}
                      initialFocus
                      fixedWeeks
                      showOutsideDays
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Separator */}
              <span className="hidden sm:inline mx-1 text-gray-500">s/d</span>
              <span className="sm:hidden text-xs text-gray-500 text-center w-full">
                sampai dengan
              </span>

              {/* End Date Picker */}
              <div className="w-full sm:w-auto">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full sm:w-[140px] justify-start text-left font-normal text-sm",
                        !endDate && "text-muted-foreground"
                      )}
                      disabled={!startDate}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formatDateWithoutYear(endDate)}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={endDate || undefined}
                      onSelect={(date) => setEndDate(date || null)}
                      initialFocus
                      fixedWeeks
                      showOutsideDays
                      fromDate={startDate || undefined}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Submit Button */}
              <Button
                onClick={filterDataByDate}
                disabled={!startDate || !endDate}
                className="w-full sm:w-auto sm:ml-2 mt-2 sm:mt-0"
              >
                Tampilkan
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="overflow-auto rounded-lg border shadow-md">
        <Table>
          <TableHeader className="bg-gray-100">
            <TableRow>
              <TableHead className="w-[50px] text-center">NO</TableHead>
              <TableHead className="min-w-[200px]">LOKET KANTOR</TableHead>
              <TableHead className="min-w-[150px]">PETUGAS</TableHead>
              <TableHead colSpan={2} className="text-center">
                CHECKIN
              </TableHead>
              <TableHead colSpan={2} className="text-center">
                CHECKOUT
              </TableHead>
              <TableHead colSpan={3} className="text-center">
                MEMASTIKAN
              </TableHead>
              <TableHead className="text-center">GAP</TableHead>
              <TableHead className="text-center">MENGUPAYAKAN</TableHead>
              <TableHead colSpan={2} className="text-center">
                MENAMBAHKAN
              </TableHead>
              <TableHead colSpan={2} className="text-center">
                PENERIMAAN LEBIH
              </TableHead>
            </TableRow>
            <TableRow>
              <TableHead></TableHead>
              <TableHead></TableHead>
              <TableHead></TableHead>
              <TableHead className="text-center">NOPOL</TableHead>
              <TableHead className="text-center">RUPIAH</TableHead>
              <TableHead className="text-center">NOPOL</TableHead>
              <TableHead className="text-center">RUPIAH</TableHead>
              <TableHead className="text-center">NOPOL</TableHead>
              <TableHead className="text-center">RUPIAH</TableHead>
              <TableHead className="text-center">%</TableHead>
              <TableHead className="text-center">NOPOL</TableHead>
              <TableHead className="text-center">
                Rata-rata Bulan Maju
              </TableHead>
              <TableHead className="text-center">NOPOL</TableHead>
              <TableHead className="text-center">RUPIAH</TableHead>
              <TableHead className="text-center">NOPOL</TableHead>
              <TableHead className="text-center">RUPIAH</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rekapData.map((row, index) => {
              const isGroupHeader =
                row.loketKantor === "KANWIL JAWA TENGAH" ||
                row.loketKantor === "CABANG SURAKARTA" ||
                row.loketKantor === "CABANG MAGELANG" ||
                row.loketKantor === "CABANG PURWOKERTO" ||
                row.loketKantor === "CABANG PEKALONGAN" ||
                row.loketKantor === "CABANG PATI" ||
                row.loketKantor === "CABANG SEMARANG" ||
                row.loketKantor === "CABANG SUKOHARJO";
              const isSubTotal = row.loketKantor === "SUB TOTAL";
              const isGrandTotal = row.loketKantor === "GRAND TOTAL";

              if (isGroupHeader) {
                return (
                  <TableRow
                    key={index}
                    className="bg-gray-100 font-medium cursor-pointer hover:bg-gray-200"
                    onClick={() => toggleGroup(row.loketKantor)}
                  >
                    <TableCell colSpan={16}>
                      <div className="flex justify-between items-center">
                        <span>{row.loketKantor}</span>
                        {expandedGroups[row.loketKantor] ? (
                          <Minus className="w-4 h-4 text-gray-600" />
                        ) : (
                          <Plus className="w-4 h-4 text-gray-600" />
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              }
              // Dapatkan grup parent sebelumnya (group loket)
              const prevGroup =
                rekapData
                  .slice(0, index)
                  .reverse()
                  .find(
                    (r) =>
                      r.loketKantor.startsWith("KANWIL") ||
                      r.loketKantor.startsWith("CABANG")
                  )?.loketKantor || "";

              // Jika belum di-expand, jangan tampilkan row
              if (prevGroup && !expandedGroups[prevGroup]) {
                return null;
              }

              return (
                <TableRow
                  key={index}
                  className={
                    isGrandTotal
                      ? "bg-purple-50 font-bold"
                      : isSubTotal
                      ? "bg-blue-50 font-semibold"
                      : ""
                  }
                >
                  <TableCell className="text-center">
                    {!isSubTotal && !isGrandTotal && row.no > 0 ? row.no : ""}
                  </TableCell>
                  <TableCell
                    className={
                      isSubTotal || isGrandTotal ? "font-semibold" : ""
                    }
                  >
                    {row.loketKantor}
                  </TableCell>
                  <TableCell>{row.petugas}</TableCell>
                  <TableCell className="text-center">
                    {row.checkinNopol > 0 ? row.checkinNopol : "-"}
                  </TableCell>
                  <TableCell className="text-right">
                    {row.checkinRupiah > 0
                      ? formatRupiah(row.checkinRupiah)
                      : "-"}
                  </TableCell>
                  <TableCell className="text-center">
                    {row.checkoutNopol > 0 ? row.checkoutNopol : "-"}
                  </TableCell>
                  <TableCell className="text-right">
                    {row.checkoutRupiah > 0
                      ? formatRupiah(row.checkoutRupiah)
                      : "-"}
                  </TableCell>
                  <TableCell className="text-center">
                    {row.memastikanNopol > 0 ? row.memastikanNopol : "-"}
                  </TableCell>
                  <TableCell className="text-right">
                    {row.memastikanRupiah > 0
                      ? formatRupiah(row.memastikanRupiah)
                      : "-"}
                  </TableCell>
                  <TableCell className="text-center">
                    {row.memastikanPersen > 0
                      ? formatPercentage(row.memastikanPersen)
                      : "-"}
                  </TableCell>
                  <TableCell
                    className={`text-center ${
                      (!isGroupHeader && row.gapNopol !== 0) || isSubTotal
                        ? "text-blue-600 cursor-pointer hover:underline font-medium"
                        : ""
                    }`}
                    onClick={() => {
                      if (
                        (!isGroupHeader && row.gapNopol !== 0) ||
                        isSubTotal
                      ) {
                        handleDetail(row);
                      }
                    }}
                  >
                    {row.gapNopol !== 0 ? row.gapNopol : "-"}
                  </TableCell>
                  <TableCell className="text-center">
                    {row.mengupayakan !== 0 ? row.mengupayakan : "-"}
                  </TableCell>
                  <TableCell className="text-center">
                    {row.menambahkanNopol > 0 ? row.menambahkanNopol : "-"}
                  </TableCell>
                  <TableCell className="text-right">
                    {row.menambahkanRupiah > 0
                      ? formatRupiah(row.menambahkanRupiah)
                      : "-"}
                  </TableCell>
                  <TableCell className="text-center">
                    {row.sisaNopol > 0 ? row.sisaNopol : "-"}
                  </TableCell>
                  <TableCell className="text-right">
                    {row.sisaRupiah > 0 ? formatRupiah(row.sisaRupiah) : "-"}
                  </TableCell>
                </TableRow>
              );
              // return (
              //   <TableRow
              //     key={index}
              //     className={
              //       isGrandTotal
              //         ? "bg-purple-50 font-bold"
              //         : isSubTotal
              //         ? "bg-blue-50 font-semibold"
              //         : isGroupHeader
              //         ? "bg-gray-100 font-medium"
              //         : ""
              //     }
              //   >
              //     <TableCell className="text-center">
              //       {!isGroupHeader && row.no > 0 ? row.no : ""}
              //     </TableCell>
              //     <TableCell
              //       className={
              //         isSubTotal || isGrandTotal ? "font-semibold" : ""
              //       }
              //     >
              //       {row.loketKantor}
              //     </TableCell>
              //     <TableCell>{row.petugas}</TableCell>
              //     <TableCell className="text-center">
              //       {row.checkinNopol > 0 ? row.checkinNopol : "-"}
              //     </TableCell>
              //     <TableCell className="text-right">
              //       {row.checkinRupiah > 0
              //         ? formatRupiah(row.checkinRupiah)
              //         : "-"}
              //     </TableCell>
              //     <TableCell className="text-center">
              //       {row.checkoutNopol > 0 ? row.checkoutNopol : "-"}
              //     </TableCell>
              //     <TableCell className="text-right">
              //       {row.checkoutRupiah > 0
              //         ? formatRupiah(row.checkoutRupiah)
              //         : "-"}
              //     </TableCell>
              //     <TableCell className="text-center">
              //       {row.memastikanNopol > 0 ? row.memastikanNopol : "-"}
              //     </TableCell>
              //     <TableCell className="text-right">
              //       {row.memastikanRupiah > 0
              //         ? formatRupiah(row.memastikanRupiah)
              //         : "-"}
              //     </TableCell>
              //     <TableCell className="text-center">
              //       {row.memastikanPersen > 0
              //         ? formatPercentage(row.memastikanPersen)
              //         : "-"}
              //     </TableCell>
              //     <TableCell
              //       className={`text-center ${
              //         (!isGroupHeader && row.gapNopol !== 0) || isSubTotal
              //           ? "text-blue-600 cursor-pointer hover:underline font-medium"
              //           : ""
              //       }`}
              //       onClick={() => {
              //         if (
              //           (!isGroupHeader && row.gapNopol !== 0) ||
              //           isSubTotal
              //         ) {
              //           handleDetail(row);
              //         }
              //       }}
              //     >
              //       {row.gapNopol !== 0 ? row.gapNopol : "-"}
              //     </TableCell>
              //     <TableCell className="text-center">
              //       {row.mengupayakan !== 0 ? row.mengupayakan : "-"}
              //     </TableCell>
              //     <TableCell className="text-center">
              //       {row.menambahkanNopol > 0 ? row.menambahkanNopol : "-"}
              //     </TableCell>
              //     <TableCell className="text-right">
              //       {row.menambahkanRupiah > 0
              //         ? formatRupiah(row.menambahkanRupiah)
              //         : "-"}
              //     </TableCell>
              //     <TableCell className="text-center">
              //       {row.sisaNopol > 0 ? row.sisaNopol : "-"}
              //     </TableCell>
              //     <TableCell className="text-right">
              //       {row.sisaRupiah > 0 ? formatRupiah(row.sisaRupiah) : "-"}
              //     </TableCell>
              //   </TableRow>
              // );
            })}
          </TableBody>
        </Table>
      </div>
      {/* Detail Modal */}
      {selectedRow && (
        <div className="fixed inset-0 bg-white/30 backdrop-blur-lg backdrop-saturate-150 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="flex justify-between items-start p-5 border-b">
              <div>
                <h3 className="text-xl font-bold text-gray-800">
                  Detail GAP Nopol - {selectedRow.loketKantor}
                  {selectedRow.loketKantor === "SUB TOTAL" &&
                    " (Breakdown per Loket)"}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {selectedRow.petugas || "-"}
                </p>
              </div>
              <div className="flex gap-2 items-center">
                <Button
                  onClick={() => exportGapDetailsToExcel(selectedRow)}
                  className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2 px-4 py-2 text-sm rounded-md shadow"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  Export Excel
                </Button>
              </div>
            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-5 bg-gray-50 border-b">
              <div className="bg-white p-3 rounded-md shadow-sm">
                <p className="text-sm text-gray-600">CheckIn</p>
                <p className="text-lg font-semibold">
                  {selectedRow.checkinNopol} nopol
                </p>
              </div>
              <div className="bg-white p-3 rounded-md shadow-sm">
                <p className="text-sm text-gray-600">Memastikan</p>
                <p className="text-lg font-semibold">
                  {selectedRow.memastikanNopol} nopol
                </p>
              </div>
              <div className="bg-white p-3 rounded-md shadow-sm">
                <p className="text-sm text-gray-600">Total GAP</p>
                <p className="text-lg font-semibold">
                  {selectedRow.gapNopol} nopol
                </p>
              </div>
            </div>

            {/* Table Container */}
            <div className="flex-1 overflow-auto">
              {selectedRow.loketKantor === "SUB TOTAL" ? (
                /* Special view for SUB TOTAL rows */
                <Table className="min-w-full">
                  <TableHeader className="bg-gray-100 sticky top-0">
                    <TableRow>
                      <TableHead className="min-w-[200px]">Loket</TableHead>
                      <TableHead className="min-w-[200px]">
                        Keterangan
                      </TableHead>
                      <TableHead className="text-center">
                        Jumlah Nopol
                      </TableHead>
                      <TableHead className="text-right">Total Nilai</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(() => {
                      // Group gap details by loket and then by keterangan
                      const groupedByLoket = selectedRow.gapDetails.reduce(
                        (groups, item) => {
                          const loket = item.loket || "Unknown";
                          const keterangan = item.keterangan || "-";

                          if (!groups[loket]) {
                            groups[loket] = {};
                          }

                          if (!groups[loket][keterangan]) {
                            groups[loket][keterangan] = {
                              count: 0,
                              total: 0,
                            };
                          }

                          groups[loket][keterangan].count++;
                          groups[loket][keterangan].total += item.rupiah;
                          return groups;
                        },
                        {} as Record<
                          string,
                          Record<string, { count: number; total: number }>
                        >
                      );

                      // If no data
                      if (Object.keys(groupedByLoket).length === 0) {
                        return (
                          <TableRow>
                            <TableCell
                              colSpan={4}
                              className="py-8 text-center text-gray-500"
                            >
                              Tidak ada data detail GAP
                            </TableCell>
                          </TableRow>
                        );
                      }

                      // Render grouped data
                      return Object.entries(groupedByLoket).flatMap(
                        ([loket, keteranganGroups], loketIndex) => {
                          const loketTotal = Object.values(
                            keteranganGroups
                          ).reduce((sum, { total }) => sum + total, 0);
                          const loketCount = Object.values(
                            keteranganGroups
                          ).reduce((sum, { count }) => sum + count, 0);

                          return [
                            // Loket header row
                            <TableRow
                              key={`loket-${loketIndex}`}
                              className="bg-gray-50 font-medium"
                            >
                              <TableCell className="font-semibold">
                                {loket}
                              </TableCell>
                              <TableCell colSpan={3} className="font-semibold">
                                Total: {loketCount} Nopol (
                                {formatRupiah(loketTotal)})
                              </TableCell>
                            </TableRow>,
                            // Keterangan rows
                            ...Object.entries(keteranganGroups).map(
                              (
                                [keterangan, { count, total }],
                                keteranganIndex
                              ) => (
                                <TableRow
                                  key={`keterangan-${loketIndex}-${keteranganIndex}`}
                                >
                                  <TableCell></TableCell>
                                  <TableCell>{keterangan}</TableCell>
                                  <TableCell className="text-center">
                                    {count} Nopol
                                  </TableCell>
                                  <TableCell className="text-right">
                                    {formatRupiah(total)}
                                  </TableCell>
                                </TableRow>
                              )
                            ),
                          ];
                        }
                      );
                    })()}
                  </TableBody>
                  {selectedRow.gapDetails.length > 0 && (
                    <TableFooter className="bg-gray-100 sticky bottom-0">
                      <TableRow className="font-bold">
                        <TableCell>Grand Total</TableCell>
                        <TableCell></TableCell>
                        <TableCell className="text-center">
                          {selectedRow.gapDetails.length} Nopol
                        </TableCell>
                        <TableCell className="text-right">
                          {formatRupiah(
                            selectedRow.gapDetails.reduce(
                              (sum, item) => sum + item.rupiah,
                              0
                            )
                          )}
                        </TableCell>
                      </TableRow>
                    </TableFooter>
                  )}
                </Table>
              ) : (
                /* Regular view for non-SUB TOTAL rows */
                <Table className="min-w-full">
                  <TableHeader className="bg-gray-100 sticky top-0">
                    <TableRow>
                      <TableHead className="w-[60px] text-center">No</TableHead>
                      <TableHead className="min-w-[120px] text-center">
                        No. Polisi
                      </TableHead>
                      <TableHead className="min-w-[150px] text-center">
                        Keterangan
                      </TableHead>
                      <TableHead className="min-w-[120px] text-right">
                        Nilai
                      </TableHead>
                      <TableHead className="min-w-[120px] text-right">
                        Tanggal
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(() => {
                      // Group gap details by keterangan
                      const groupedDetails = selectedRow.gapDetails.reduce(
                        (groups, item) => {
                          const key = item.keterangan || "-";
                          if (!groups[key]) {
                            groups[key] = [];
                          }
                          groups[key].push(item);
                          return groups;
                        },
                        {} as Record<string, GapDetail[]>
                      );

                      // If no data
                      if (Object.keys(groupedDetails).length === 0) {
                        return (
                          <TableRow>
                            <TableCell
                              colSpan={5}
                              className="py-8 text-center text-gray-500"
                            >
                              Tidak ada data detail GAP
                            </TableCell>
                          </TableRow>
                        );
                      }

                      // Render grouped data
                      let rowIndex = 0;
                      return Object.entries(groupedDetails).flatMap(
                        ([keterangan, items], groupIndex) => {
                          const subtotal = items.reduce(
                            (sum, item) => sum + item.rupiah,
                            0
                          );

                          return [
                            // Group header row
                            <TableRow
                              key={`header-${groupIndex}`}
                              className="bg-gray-50"
                            >
                              <TableCell
                                colSpan={5}
                                className="font-semibold text-gray-800"
                              >
                                {keterangan} ({items.length} Nopol)
                              </TableCell>
                            </TableRow>,
                            // Item rows
                            ...items.map((item, itemIndex) => {
                              rowIndex++;
                              return (
                                <TableRow
                                  key={`item-${groupIndex}-${itemIndex}`}
                                >
                                  <TableCell className="py-2 font-medium text-center">
                                    {rowIndex}
                                  </TableCell>
                                  <TableCell className="py-2 font-mono text-center">
                                    {item.nopol}
                                  </TableCell>
                                  <TableCell className="py-2 text-center">
                                    {item.keterangan}
                                  </TableCell>
                                  <TableCell className="py-2 text-right">
                                    {formatRupiah(item.rupiah)}
                                  </TableCell>
                                  <TableCell className="py-2 text-right">
                                    {item.tgl_transaksi}
                                  </TableCell>
                                </TableRow>
                              );
                            }),
                            // Subtotal row
                            <TableRow
                              key={`subtotal-${groupIndex}`}
                              className="bg-blue-50 font-medium"
                            >
                              <TableCell colSpan={3} className="text-right">
                                Subtotal {keterangan}
                              </TableCell>
                              <TableCell className="text-right">
                                {formatRupiah(subtotal)}
                              </TableCell>
                              <TableCell></TableCell>
                            </TableRow>,
                          ];
                        }
                      );
                    })()}
                  </TableBody>
                  {/* Grand total row */}
                  {selectedRow.gapDetails.length > 0 && (
                    <TableFooter className="bg-gray-100 sticky bottom-0">
                      <TableRow className="font-bold">
                        <TableCell colSpan={3} className="text-right">
                          Grand Total
                        </TableCell>
                        <TableCell className="text-right">
                          {formatRupiah(
                            selectedRow.gapDetails.reduce(
                              (sum, item) => sum + item.rupiah,
                              0
                            )
                          )}
                        </TableCell>
                        <TableCell></TableCell>
                      </TableRow>
                    </TableFooter>
                  )}
                </Table>
              )}
            </div>

            {/* Footer */}
            <div className="flex justify-end p-4 border-t bg-gray-50">
              <Button
                onClick={() => setSelectedRow(null)}
                variant="outline"
                className="min-w-[100px]"
              >
                Tutup
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RekapDashboard;
