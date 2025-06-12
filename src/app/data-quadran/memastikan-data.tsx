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

import { Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

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
    parentLoket: "LOKET KEDUNGSAPUR",
    childLoket: "LOKET CABANG JAWA TENGAH",
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
    parentLoket: "PERWAKILAN SURAKARTA",
    childLoket: "LOKET PERWAKILAN SURAKARTA",
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
    parentLoket: "PERWAKILAN MAGELANG",
    childLoket: "LOKET PERWAKILAN MAGELANG",
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
    parentLoket: "PERWAKILAN PURWOKERTO",
    childLoket: "LOKET PERWAKILAN PURWOKERTO",
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
    parentLoket: "PERWAKILAN PEKALONGAN",
    childLoket: "LOKET PERWAKILAN PEKALONGAN",
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
    parentLoket: "PERWAKILAN PATI",
    childLoket: "LOKET PERWAKILAN PATI",
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
    parentLoket: "PERWAKILAN SEMARANG",
    childLoket: "LOKET PERWAKILAN SEMARANG",
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
    parentLoket: "PERWAKILAN SUKOHARJO",
    childLoket: "LOKET PERWAKILAN SUKOHARJO",
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

const MemastikanData = ({
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

  // New state for quadrant data and tooltip
  const [quadrantData, setQuadrantData] = useState<any>(null);
  const [hoveredQuadrant, setHoveredQuadrant] = useState<string | null>(null);

  // Function to classify data into quadrants
  const classifyQuadrants = () => {
    if (!filteredData.length) return;
    // Memastikan Quadrants
    const memastikanQuadrants = {
      q1: { name: "Quadran I (61-100%)", value: 0, items: [] as string[] },
      q2: { name: "Quadran II (41-60%)", value: 0, items: [] as string[] },
      q3: { name: "Quadran III (21-40%)", value: 0, items: [] as string[] },
      q4: { name: "Quadran IV (0-20%)", value: 0, items: [] as string[] },
    };

    // Mengupayakan Quadrants =
    const mengupayakanQuadrants = {
      q1: { name: "Quadran I (9+ bulan)", value: 0, items: [] as string[] },
      q2: { name: "Quadran II (6-8 bulan)", value: 0, items: [] as string[] },
      q3: { name: "Quadran III (3-5 bulan)", value: 0, items: [] as string[] },
      q4: { name: "Quadran IV (0-2 bulan)", value: 0, items: [] as string[] },
    };

    // Mengupayakan Quadrants =
    const menambahkanQuadrants = {
      q1: { name: "Quadran I (15+ Nopol)", value: 0, items: [] },
      q2: { name: "Quadran II (11-14 nopol)", value: 0, items: [] },
      q3: { name: "Quadran III (6-10 nopol)", value: 0, items: [] },
      q4: { name: "Quadran IV (0-5 nopol)", value: 0, items: [] },
    };

    filteredData.forEach((row) => {
      if (row.loketKantor === "SUB TOTAL") return;

      // Memastikan classification
      const memastikanPercent = row.memastikanPersen * 100;
      if (memastikanPercent >= 61) {
        memastikanQuadrants.q1.value++;
        memastikanQuadrants.q1.items.push(row.loketKantor);
      } else if (memastikanPercent >= 41) {
        memastikanQuadrants.q2.value++;
        memastikanQuadrants.q2.items.push(row.loketKantor);
      } else if (memastikanPercent >= 21) {
        memastikanQuadrants.q3.value++;
        memastikanQuadrants.q3.items.push(row.loketKantor);
      } else {
        memastikanQuadrants.q4.value++;
        memastikanQuadrants.q4.items.push(row.loketKantor);
      }
      // Mengupayakan classification
      const mengupayakanValue = row.mengupayakan || 0;
      if (mengupayakanValue >= 9) {
        mengupayakanQuadrants.q1.value++;
        mengupayakanQuadrants.q1.items.push(row.loketKantor);
      } else if (mengupayakanValue >= 6) {
        mengupayakanQuadrants.q2.value++;
        mengupayakanQuadrants.q2.items.push(row.loketKantor);
      } else if (mengupayakanValue >= 3) {
        mengupayakanQuadrants.q3.value++;
        mengupayakanQuadrants.q3.items.push(row.loketKantor);
      } else {
        mengupayakanQuadrants.q4.value++;
        mengupayakanQuadrants.q4.items.push(row.loketKantor);
      }
    });
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

            if (!isMemastikan && !isMenambahkan && item.iwkbu_ti_nopol) {
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
              });
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
      rekap.sisaNopol = sisaNopolSet.size;
      rekap.sisaRupiah = sisaRupiah;
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

    const grandTotal: RekapRow = {
      no: 0,
      loketKantor: "GRAND TOTAL",
      petugas: "",
      checkinNopol: result.reduce((sum, row) => sum + row.checkinNopol, 0),
      checkinRupiah: result.reduce((sum, row) => sum + row.checkinRupiah, 0),
      checkoutNopol: result.reduce((sum, row) => sum + row.checkoutNopol, 0),
      checkoutRupiah: result.reduce((sum, row) => sum + row.checkoutRupiah, 0),
      memastikanNopol: result.reduce(
        (sum, row) => sum + row.memastikanNopol,
        0
      ),
      memastikanRupiah: result.reduce(
        (sum, row) => sum + row.memastikanRupiah,
        0
      ),
      memastikanPersen:
        result.reduce((sum, row) => sum + row.checkoutNopol, 0) > 0
          ? result.reduce((sum, row) => sum + row.memastikanNopol, 0) /
            result.reduce((sum, row) => sum + row.checkoutNopol, 0)
          : 0,
      menambahkanNopol: result.reduce(
        (sum, row) => sum + row.menambahkanNopol,
        0
      ),
      menambahkanRupiah: result.reduce(
        (sum, row) => sum + row.menambahkanRupiah,
        0
      ),
      mengupayakan:
        result.reduce((sum, row) => sum + row.mengupayakan, 0) /
        result.filter((row) => row.mengupayakan > 0).length,
      gapNopol: result.reduce((sum, row) => sum + row.gapNopol, 0),
      sisaNopol: result.reduce((sum, row) => sum + row.sisaNopol, 0),
      sisaRupiah: result.reduce((sum, row) => sum + row.sisaRupiah, 0),
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

  // Filter to only show SUB TOTAL rows
  const filteredData = rekapData.filter(
    (row) =>
      row.loketKantor === "SUB TOTAL" ||
      row.loketKantor === "LOKET KEDUNGSAPUR" ||
      row.loketKantor === "PERWAKILAN SURAKARTA" ||
      row.loketKantor === "PERWAKILAN MAGELANG" ||
      row.loketKantor === "PERWAKILAN PURWOKERTO" ||
      row.loketKantor === "PERWAKILAN PEKALONGAN" ||
      row.loketKantor === "PERWAKILAN PATI" ||
      row.loketKantor === "PERWAKILAN SEMARANG" ||
      row.loketKantor === "PERWAKILAN SUKOHARJO"
  );

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
      {/* Tabel Data Memastikan */}
      <div>
        <p>Memastikan Data</p>
        <div className="overflow-auto rounded-lg border shadow-md">
          <Table>
            <TableHeader className="bg-gray-100">
              <TableRow>
                <TableHead className="w-[50px] text-center">NO URUT</TableHead>
                <TableHead className="min-w-[200px]">LOKET</TableHead>
                <TableHead className="text-center">NILAI (%)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData
                .filter(
                  (row) =>
                    row.loketKantor === "LOKET KEDUNGSAPUR" ||
                    row.loketKantor === "PERWAKILAN SURAKARTA" ||
                    row.loketKantor === "PERWAKILAN MAGELANG" ||
                    row.loketKantor === "PERWAKILAN PURWOKERTO" ||
                    row.loketKantor === "PERWAKILAN PEKALONGAN" ||
                    row.loketKantor === "PERWAKILAN PATI" ||
                    row.loketKantor === "PERWAKILAN SEMARANG" ||
                    row.loketKantor === "PERWAKILAN SUKOHARJO"
                )
                .map((row) => {
                  const subTotalRow = filteredData.find(
                    (r) =>
                      r.loketKantor === "SUB TOTAL" &&
                      filteredData.indexOf(r) > filteredData.indexOf(row)
                  );
                  return {
                    ...row,
                    memastikanPersen: subTotalRow?.memastikanPersen || 0,
                  };
                })
                .sort((a, b) => b.memastikanPersen - a.memastikanPersen)
                .map((row, index) => (
                  <TableRow key={index} className="bg-blue-50 font-semibold">
                    {[
                      <TableCell key="no" className="text-center">
                        {index + 1}
                      </TableCell>,
                      <TableCell key="loket">{row.loketKantor}</TableCell>,
                      <TableCell key="nilai" className="text-center">
                        {row.memastikanPersen
                          ? `${(row.memastikanPersen * 100).toFixed(2)}%`
                          : "-"}
                      </TableCell>,
                    ]}
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </div>
      </div>
      {/* Tabel Data Mengupayakan */}
      <div>
        <p className="font-medium mb-2">Mengupayakan Data</p>
        <div className="overflow-auto rounded-lg border shadow-md">
          <Table>
            <TableHeader className="bg-gray-100">
              <TableRow>
                <TableHead className="w-[50px] text-center">NO URUT</TableHead>
                <TableHead className="min-w-[200px]">LOKET</TableHead>
                <TableHead className="text-center">NILAI (Nopol)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData
                .filter(
                  (row) =>
                    row.loketKantor === "LOKET KEDUNGSAPUR" ||
                    row.loketKantor === "PERWAKILAN SURAKARTA" ||
                    row.loketKantor === "PERWAKILAN MAGELANG" ||
                    row.loketKantor === "PERWAKILAN PURWOKERTO" ||
                    row.loketKantor === "PERWAKILAN PEKALONGAN" ||
                    row.loketKantor === "PERWAKILAN PATI" ||
                    row.loketKantor === "PERWAKILAN SEMARANG" ||
                    row.loketKantor === "PERWAKILAN SUKOHARJO"
                )
                .map((row) => {
                  const subTotalRow = filteredData.find(
                    (r) =>
                      r.loketKantor === "SUB TOTAL" &&
                      filteredData.indexOf(r) > filteredData.indexOf(row)
                  );
                  return {
                    ...row,
                    mengupayakan: subTotalRow?.mengupayakan || 0,
                  };
                })
                .sort((a, b) => b.mengupayakan - a.mengupayakan) // Sort by mengupayakan descending
                .map((row, index) => (
                  <TableRow
                    key={`a-${index}`}
                    className="bg-purple-50 font-semibold"
                  >
                    <TableCell className="text-center">{index + 1}</TableCell>
                    <TableCell>{row.loketKantor}</TableCell>
                    <TableCell className="text-center">
                      {row.mengupayakan || "-"}
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </div>
      </div>
      {/* Tabel Data Menambahkan */}
      <div>
        <p className="font-medium mb-2">Menambahkan Data</p>
        <div className="overflow-auto rounded-lg border shadow-md">
          <Table>
            <TableHeader className="bg-gray-100">
              <TableRow>
                <TableHead className="w-[50px] text-center">NO URUT</TableHead>
                <TableHead className="min-w-[200px]">LOKET</TableHead>
                <TableHead className="text-center">NILAI (Nopol)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData
                .filter(
                  (row) =>
                    row.loketKantor === "LOKET KEDUNGSAPUR" ||
                    row.loketKantor === "PERWAKILAN SURAKARTA" ||
                    row.loketKantor === "PERWAKILAN MAGELANG" ||
                    row.loketKantor === "PERWAKILAN PURWOKERTO" ||
                    row.loketKantor === "PERWAKILAN PEKALONGAN" ||
                    row.loketKantor === "PERWAKILAN PATI" ||
                    row.loketKantor === "PERWAKILAN SEMARANG" ||
                    row.loketKantor === "PERWAKILAN SUKOHARJO"
                )
                .map((row) => {
                  const subTotalRow = filteredData.find(
                    (r) =>
                      r.loketKantor === "SUB TOTAL" &&
                      filteredData.indexOf(r) > filteredData.indexOf(row)
                  );
                  return {
                    ...row,
                    menambahkanNopol: subTotalRow?.menambahkanNopol || 0,
                  };
                })
                .sort((a, b) => b.menambahkanNopol - a.menambahkanNopol) // Sort by menambahkanNopol descending
                .map((row, index) => (
                  <TableRow
                    key={`a-${index}`}
                    className="bg-purple-50 font-semibold"
                  >
                    <TableCell className="text-center">{index + 1}</TableCell>
                    <TableCell>{row.loketKantor}</TableCell>
                    <TableCell className="text-center">
                      {row.menambahkanNopol || "-"}
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default MemastikanData;
