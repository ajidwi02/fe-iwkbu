// memastikan-data.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  Calendar as CalendarIcon,
  Target,
  TrendingUp,
  PlusCircle,
  Building,
} from "lucide-react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

// --- INTERFACE (TETAP SAMA) ---
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
// --- AKHIR INTERFACE ---

// --- START: INTERFACE BARU UNTUK DATA KUADRAN ---
interface QuadrantItem {
  loket: string;
  value: number;
}
interface QuadrantDetail {
  count: number;
  items: QuadrantItem[];
}
interface QuadrantData {
  memastikan: Record<string, QuadrantDetail>;
  mengupayakan: Record<string, QuadrantDetail>;
  menambahkan: Record<string, QuadrantDetail>;
}
// --- END: INTERFACE BARU UNTUK DATA KUADRAN ---

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE;
const loketMapping = [
  /* ... ISI LOKET MAPPING TETAP SAMA, TIDAK PERLU DIUBAH ... */
  {
    no: 1,
    parentLoket: "KANWIL JAWA TENGAH",
    childLoket: "LOKET KANWIL JAWA TENGAH",
    petugas: "GUNTUR DWI SAPUTRA",
    endpoint: `${BASE_URL}/loketcabangjawatengah`,
  },
  {
    no: 2,
    parentLoket: "",
    childLoket: "SAMSAT KENDAL",
    petugas: "HEIRTANA HANDIETRA",
    endpoint: `${BASE_URL}/samsatkendal`,
  },
  {
    no: 3,
    parentLoket: "",
    childLoket: "SAMSAT DEMAK",
    petugas: "TIARA HAPSARI",
    endpoint: `${BASE_URL}/samsatdemak`,
  },
  {
    no: 4,
    parentLoket: "",
    childLoket: "SAMSAT PURWODADI",
    petugas: "ADI SETIAWAN",
    endpoint: `${BASE_URL}/samsatpurwodadi`,
  },
  {
    no: 5,
    parentLoket: "",
    childLoket: "SAMSAT UNGARAN",
    petugas: "MAHENDRA DWI HEISTRIANTO",
    endpoint: `${BASE_URL}/samsatungaran`,
  },
  {
    no: 6,
    parentLoket: "",
    childLoket: "SAMSAT SALATIGA",
    petugas: "RIKA WAHYU UTAMI",
    endpoint: `${BASE_URL}/samsatsalatiga`,
  },
  {
    no: 7,
    parentLoket: "CABANG SURAKARTA",
    childLoket: "LOKET CABANG SURAKARTA",
    petugas: "M. ROSYID ABDURRACHMAN",
    endpoint: `${BASE_URL}/samsatlokperwsra`,
  },
  {
    no: 8,
    parentLoket: "",
    childLoket: "SAMSAT SURAKARTA",
    petugas: "HARI SETIAWAN",
    endpoint: `${BASE_URL}/samsatsurakarta`,
  },
  {
    no: 9,
    parentLoket: "",
    childLoket: "SAMSAT KLATEN",
    petugas: "R ANTON PRASETYO",
    endpoint: `${BASE_URL}/samsatklaten`,
  },
  {
    no: 10,
    parentLoket: "",
    childLoket: "SAMSAT BOYOLALI",
    petugas: "RIO AQIL TITA",
    endpoint: `${BASE_URL}/samsatboyolali`,
  },
  {
    no: 11,
    parentLoket: "",
    childLoket: "SAMSAT SRAGEN",
    petugas: "ARIE SOFIANTO",
    endpoint: `${BASE_URL}/samsatsragen`,
  },
  {
    no: 12,
    parentLoket: "",
    childLoket: "SAMSAT PRAMBANAN",
    petugas: "ARISTO YANLIAR",
    endpoint: `${BASE_URL}/samsatprambanan`,
  },
  {
    no: 13,
    parentLoket: "",
    childLoket: "SAMSAT DELANGGU",
    petugas: "SURYO BAGUS LUDIRO",
    endpoint: `${BASE_URL}/samsatdelanggu`,
  },
  {
    no: 14,
    parentLoket: "CABANG MAGELANG",
    childLoket: "LOKET CABANG MAGELANG",
    petugas: "MAHARIS",
    endpoint: `${BASE_URL}/samsatlokpwkmgl`,
  },
  {
    no: 15,
    parentLoket: "",
    childLoket: "SAMSAT MAGELANG",
    petugas: "BAGAS JATI INDRA SETIAWAN",
    endpoint: `${BASE_URL}/samsatmagelang`,
  },
  {
    no: 16,
    parentLoket: "",
    childLoket: "SAMSAT PURWOREJO",
    petugas: "SEPTIAN ADE R.R",
    endpoint: `${BASE_URL}/samsatpurworejo`,
  },
  {
    no: 17,
    parentLoket: "",
    childLoket: "SAMSAT KEBUMEN",
    petugas: "TUTIK WURYANTARI",
    endpoint: `${BASE_URL}/samsatkebumen`,
  },
  {
    no: 18,
    parentLoket: "",
    childLoket: "SAMSAT TEMANGGUNG",
    petugas: "IKA WINANDITA SARI",
    endpoint: `${BASE_URL}/samsattemanggung`,
  },
  {
    no: 19,
    parentLoket: "",
    childLoket: "SAMSAT WONOSOBO",
    petugas: "TYSON ADHY PAMUNGKAS",
    endpoint: `${BASE_URL}/samsatwonosobo`,
  },
  {
    no: 20,
    parentLoket: "",
    childLoket: "SAMSAT MUNGKID",
    petugas: "DANY YULIANANTO",
    endpoint: `${BASE_URL}/samsatmungkid`,
  },
  {
    no: 21,
    parentLoket: "",
    childLoket: "SAMSAT BAGELEN",
    petugas: "WINOTO PUJO RUMIESGO",
    endpoint: `${BASE_URL}/samsatbagelen`,
  },
  {
    no: 22,
    parentLoket: "CABANG PURWOKERTO",
    childLoket: "LOKET CABANG PURWOKERTO",
    petugas: "ARMA HEDITA S.R.",
    endpoint: `${BASE_URL}/samsatlokprwpwt`,
  },
  {
    no: 23,
    parentLoket: "",
    childLoket: "SAMSAT PURWOKERTO",
    petugas: "ILHAM A.POHAN",
    endpoint: `${BASE_URL}/samsat/purwokerto`,
  },
  {
    no: 24,
    parentLoket: "",
    childLoket: "SAMSAT PURBALINGGA",
    petugas: "AHMAD IMRAN RASIDI",
    endpoint: `${BASE_URL}/samsat/purbalingga`,
  },
  {
    no: 25,
    parentLoket: "",
    childLoket: "SAMSAT BANJARNEGARA",
    petugas: "AFRIYANSYA PRAYUGO",
    endpoint: `${BASE_URL}/samsat/banjarnegara`,
  },
  {
    no: 26,
    parentLoket: "",
    childLoket: "SAMSAT MAJENANG",
    petugas: "LIA PUJI UTANTO",
    endpoint: `${BASE_URL}/samsat/majenang`,
  },
  {
    no: 27,
    parentLoket: "",
    childLoket: "SAMSAT CILACAP",
    petugas: "WIDI ANTORO",
    endpoint: `${BASE_URL}/samsat/cilacap`,
  },
  {
    no: 28,
    parentLoket: "",
    childLoket: "SAMSAT WANGON",
    petugas: "RIZKY DWI HATMO N.",
    endpoint: `${BASE_URL}/samsat/wangon`,
  },
  {
    no: 29,
    parentLoket: "CABANG PEKALONGAN",
    childLoket: "LOKET CABANG PEKALONGAN",
    petugas: "WAHYU AKBAR ADIGUNA",
    endpoint: `${BASE_URL}/samsat/lokprwpkl`,
  },
  {
    no: 30,
    parentLoket: "",
    childLoket: "SAMSAT PEKALONGAN",
    petugas: "YUDHO TIGO PRAKOSO",
    endpoint: `${BASE_URL}/samsat/pekalongan`,
  },
  {
    no: 31,
    parentLoket: "",
    childLoket: "SAMSAT PEMALANG",
    petugas: "ENDY ARYAGUNAWAN A.A",
    endpoint: `${BASE_URL}/samsat/pemalang`,
  },
  {
    no: 32,
    parentLoket: "",
    childLoket: "SAMSAT TEGAL",
    petugas: "M.SOFYAN ARIFIN MARSETYO",
    endpoint: `${BASE_URL}/samsat/tegal`,
  },
  {
    no: 33,
    parentLoket: "",
    childLoket: "SAMSAT BREBES",
    petugas: "KRISTANTO PRATAMA",
    endpoint: `${BASE_URL}/samsat/brebes`,
  },
  {
    no: 34,
    parentLoket: "",
    childLoket: "SAMSAT BATANG",
    petugas: "SEPTIN DIAH KURNIAWATI",
    endpoint: `${BASE_URL}/samsat/batang`,
  },
  {
    no: 35,
    parentLoket: "",
    childLoket: "SAMSAT KAJEN",
    petugas: "YUDHI BAGUS KURNIAWATI",
    endpoint: `${BASE_URL}/samsat/kajen`,
  },
  {
    no: 36,
    parentLoket: "",
    childLoket: "SAMSAT SLAWI",
    petugas: "WASKITO ADHI ARIYANTO",
    endpoint: `${BASE_URL}/samsat/slawi`,
  },
  {
    no: 37,
    parentLoket: "",
    childLoket: "SAMSAT BUMIAYU",
    petugas: "HARI SUDJATNIKO",
    endpoint: `${BASE_URL}/samsat/bumiayu`,
  },
  {
    no: 38,
    parentLoket: "",
    childLoket: "SAMSAT TANJUNG",
    petugas: "MAGDALENA SIAHAAN",
    endpoint: `${BASE_URL}/samsat/tanjung`,
  },
  {
    no: 39,
    parentLoket: "CABANG PATI",
    childLoket: "LOKET CABANG PATI",
    petugas: "YEKTI KUMALA SARI",
    endpoint: `${BASE_URL}/samsat/lokprwpti`,
  },
  {
    no: 40,
    parentLoket: "",
    childLoket: "SAMSAT PATI",
    petugas: "ARIA BRAMANTO",
    endpoint: `${BASE_URL}/samsat/pati`,
  },
  {
    no: 41,
    parentLoket: "",
    childLoket: "SAMSAT KUDUS",
    petugas: "AGUS MUJAYANTO",
    endpoint: `${BASE_URL}/samsat/kudus`,
  },
  {
    no: 42,
    parentLoket: "",
    childLoket: "SAMSAT JEPARA",
    petugas: "IWAN BACHTIAR",
    endpoint: `${BASE_URL}/samsat/jepara`,
  },
  {
    no: 43,
    parentLoket: "",
    childLoket: "SAMSAT REMBANG",
    petugas: "ADHIYANTO",
    endpoint: `${BASE_URL}/samsat/rembang`,
  },
  {
    no: 44,
    parentLoket: "",
    childLoket: "SAMSAT BLORA",
    petugas: "WAHYUL HUDA",
    endpoint: `${BASE_URL}/samsat/blora`,
  },
  {
    no: 45,
    parentLoket: "",
    childLoket: "SAMSAT CEPU",
    petugas: "MUHAMMAD FAHRUDDIN",
    endpoint: `${BASE_URL}/samsat/cepu`,
  },
  {
    no: 46,
    parentLoket: "CABANG SEMARANG",
    childLoket: "LOKET CABANG SEMARANG",
    petugas: "ARIEF EKA SETIAWAN",
    endpoint: `${BASE_URL}/samsat/lokprwsmg`,
  },
  {
    no: 47,
    parentLoket: "",
    childLoket: "SAMSAT SEMARANG I",
    petugas: "BIMO",
    endpoint: `${BASE_URL}/samsat/semarang1`,
  },
  {
    no: 48,
    parentLoket: "",
    childLoket: "SAMSAT SEMARANG II",
    petugas: "ADITYA GINANJAR INDRASAKTI",
    endpoint: `${BASE_URL}/samsat/semarang2`,
  },
  {
    no: 49,
    parentLoket: "",
    childLoket: "SAMSAT SEMARANG III",
    petugas: "ARIS MURDIYANTO",
    endpoint: `${BASE_URL}/samsat/semarang3`,
  },
  {
    no: 50,
    parentLoket: "CABANG SUKOHARJO",
    childLoket: "LOKET CABANG SUKOHARJO",
    petugas: "M. HASBI",
    endpoint: `${BASE_URL}/samsat/lokprwskh`,
  },
  {
    no: 51,
    parentLoket: "",
    childLoket: "SAMSAT SUKOHARJO",
    petugas: "MARIA TUTI",
    endpoint: `${BASE_URL}/samsat/sukoharjo`,
  },
  {
    no: 52,
    parentLoket: "",
    childLoket: "SAMSAT KARANGANYAR",
    petugas: "M. WAHYUANTO",
    endpoint: `${BASE_URL}/samsat/karanganyar`,
  },
  {
    no: 53,
    parentLoket: "",
    childLoket: "SAMSAT WONOGIRI",
    petugas: "ADISTI",
    endpoint: `${BASE_URL}/samsat/wonogiri`,
  },
  {
    no: 54,
    parentLoket: "",
    childLoket: "SAMSAT PURWANTORO",
    petugas: "BONNY C. EDWARD",
    endpoint: `${BASE_URL}/samsat/purwantoro`,
  },
  {
    no: 55,
    parentLoket: "",
    childLoket: "SAMSAT BATURETNO",
    petugas: "M. TAUFIKUROHMAN",
    endpoint: `${BASE_URL}/samsat/baturetno`,
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
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [useDateRange, setUseDateRange] = useState(true);

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

  const fetchData = async () => {
    // ... FUNGSI fetchData TETAP SAMA, TIDAK PERLU DIUBAH ...
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
    // ... FUNGSI generateRekap TETAP SAMA, TIDAK PERLU DIUBAH ...
    if (!data.length) {
      console.log("Data masih kosong");
      return;
    }

    const monthStr = month.toString().padStart(2, "0");
    const result: RekapRow[] = [];
    let groupSubTotal: RekapRow | null = null;

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
      const date = new Date(2000, month - 1, day);
      const startDate = new Date(2000, start.getMonth(), start.getDate());
      const endDate = new Date(2000, end.getMonth(), end.getDate());
      return date >= startDate && date <= endDate;
    };

    loketMapping.forEach((loket) => {
      const endpointData =
        data.find((d) => d.endpoint === loket.endpoint)?.data || [];
      const gapDetails: GapDetail[] = [];
      const memastikanDetails: { nopol: string; rupiah: number }[] = [];

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

      // const matchedNopol = new Set<string>();
      // let matchedRupiah = 0;
      let totalBulanMajuTI = 0;
      let countNopolBulanMajuTI = 0;
      let menambahkanNopol = 0;
      let menambahkanRupiah = 0;
      const sisaNopolSet = new Set<string>();
      let sisaRupiah = 0;

      endpointData.forEach((item) => {
        if (item.iwkbu_tl_tgl_transaksi) {
          const [, mon] = item.iwkbu_tl_tgl_transaksi.split("/");
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
          }
        }
      });

      endpointData.forEach((item) => {
        if (item.iwkbu_ti_tgl_transaksi) {
          const [, mon] = item.iwkbu_ti_tgl_transaksi.split("/");
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
              memastikanDetails.push({
                nopol: item.iwkbu_ti_nopol,
                rupiah: item.iwkbu_ti_rupiah_penerimaan || 0,
              });
              // if (!matchedNopol.has(item.iwkbu_ti_nopol)) {
              //   matchedNopol.add(item.iwkbu_ti_nopol);
              //   matchedRupiah += item.iwkbu_ti_rupiah_penerimaan || 0;
              // }
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

      rekap.memastikanNopol = memastikanDetails.length;
      rekap.memastikanRupiah = memastikanDetails.reduce(
        (sum, detail) => sum + detail.rupiah,
        0
      );
      rekap.memastikanPersen =
        rekap.checkinNopol > 0 ? rekap.memastikanNopol / rekap.checkinNopol : 0;
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

      if (loket.parentLoket) {
        if (groupSubTotal) {
          groupSubTotal.memastikanPersen =
            groupSubTotal.checkinNopol > 0
              ? groupSubTotal.memastikanNopol / groupSubTotal.checkinNopol
              : 0;
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
        groupSubTotal.checkinNopol > 0
          ? groupSubTotal.memastikanNopol / groupSubTotal.checkinNopol
          : 0;
      groupSubTotal.mengupayakan =
        groupSubTotal.mengupayakanCount > 0
          ? Math.round(
              groupSubTotal.mengupayakan / groupSubTotal.mengupayakanCount
            )
          : 0;
      result.push(groupSubTotal);
    }

    setRekapData(result);
  };

  useEffect(() => {
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    setStartDate(firstDayOfMonth);
    setEndDate(today);
    setMonth(today.getMonth() + 1);
    setUseDateRange(true);
    onDateRangeChange(firstDayOfMonth, today);
    fetchData();
  }, []);

  useEffect(() => {
    if (data.length > 0) {
      generateRekap();
    }
  }, [data, month]);

  // --- START: LOGIKA BARU UNTUK MEMPROSES DATA DASHBOARD KUADRAN ---
  const quadrantData = useMemo(() => {
    if (!rekapData || rekapData.length === 0) return null;

    const initQuadrant = () => ({
      q1: { count: 0, items: [] },
      q2: { count: 0, items: [] },
      q3: { count: 0, items: [] },
      q4: { count: 0, items: [] },
    });

    const data: QuadrantData = {
      memastikan: initQuadrant(),
      mengupayakan: initQuadrant(),
      menambahkan: initQuadrant(),
    };

    const branchData: {
      loket: string;
      memastikan: number;
      mengupayakan: number;
      menambahkan: number;
    }[] = [];

    // Ekstrak data sub total untuk setiap cabang
    for (let i = 0; i < rekapData.length; i++) {
      const row = rekapData[i];
      if (
        row.loketKantor.startsWith("KANWIL") ||
        row.loketKantor.startsWith("CABANG")
      ) {
        const subTotalRow = rekapData
          .slice(i + 1)
          .find((r) => r.loketKantor === "SUB TOTAL");

        if (subTotalRow) {
          branchData.push({
            loket: row.loketKantor,
            memastikan: subTotalRow.memastikanPersen * 100,
            mengupayakan: subTotalRow.mengupayakan,
            menambahkan: subTotalRow.menambahkanNopol,
          });
        }
      }
    }

    // Kategorikan setiap cabang ke dalam kuadran
    branchData.forEach((branch) => {
      // Memastikan
      if (branch.memastikan >= 76)
        data.memastikan.q1.items.push({
          loket: branch.loket,
          value: branch.memastikan,
        });
      else if (branch.memastikan >= 51)
        data.memastikan.q2.items.push({
          loket: branch.loket,
          value: branch.memastikan,
        });
      else if (branch.memastikan >= 26)
        data.memastikan.q3.items.push({
          loket: branch.loket,
          value: branch.memastikan,
        });
      else
        data.memastikan.q4.items.push({
          loket: branch.loket,
          value: branch.memastikan,
        });

      // Mengupayakan
      if (branch.mengupayakan >= 10)
        data.mengupayakan.q1.items.push({
          loket: branch.loket,
          value: branch.mengupayakan,
        });
      else if (branch.mengupayakan >= 7)
        data.mengupayakan.q2.items.push({
          loket: branch.loket,
          value: branch.mengupayakan,
        });
      else if (branch.mengupayakan >= 4)
        data.mengupayakan.q3.items.push({
          loket: branch.loket,
          value: branch.mengupayakan,
        });
      else
        data.mengupayakan.q4.items.push({
          loket: branch.loket,
          value: branch.mengupayakan,
        });

      // Menambahkan
      if (branch.menambahkan >= 15)
        data.menambahkan.q1.items.push({
          loket: branch.loket,
          value: branch.menambahkan,
        });
      else if (branch.menambahkan >= 11)
        data.menambahkan.q2.items.push({
          loket: branch.loket,
          value: branch.menambahkan,
        });
      else if (branch.menambahkan >= 6)
        data.menambahkan.q3.items.push({
          loket: branch.loket,
          value: branch.menambahkan,
        });
      else
        data.menambahkan.q4.items.push({
          loket: branch.loket,
          value: branch.menambahkan,
        });
    });

    // Hitung total di setiap kuadran
    for (const key of ["memastikan", "mengupayakan", "menambahkan"]) {
      const metric = key as keyof QuadrantData;
      for (let i = 1; i <= 4; i++) {
        const qKey = `q${i}` as keyof (typeof data)[typeof metric];
        data[metric][qKey].count = data[metric][qKey].items.length;
      }
    }

    return data;
  }, [rekapData]);
  // --- END: LOGIKA BARU UNTUK MEMPROSES DATA DASHBOARD KUADRAN ---

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
    <div className="space-y-8">
      {/* Filter Section */}
      <div className="flex flex-col sm:flex-row sm:items-end gap-4 rounded-md border p-4 shadow-sm">
        {/* ... Isi Filter tetap sama ... */}
        <div className="w-full">
          <label className="text-sm font-medium mb-1 block">
            Filter Tanggal
          </label>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full">
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
            <span className="hidden sm:inline mx-1 text-gray-500">s/d</span>
            <span className="sm:hidden text-xs text-gray-500 text-center w-full">
              sampai dengan
            </span>
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

      {/* ============== START: LAYOUT BARU YANG DIGABUNGKAN ============== */}

      {/* 1. Bagian Analisis Kuadran (Dengan Detail Loket) */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-center mb-6">
          Analisis Kinerja Quadran
        </h2>
        {quadrantData && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Kolom Memastikan */}
            <div className="border rounded-lg p-4 shadow-sm">
              <h3 className="font-semibold text-center text-lg mb-4">
                Memastikan
              </h3>
              <div className="space-y-3">
                {[
                  {
                    key: "q1",
                    label: "QUADRAN I (76-100%)",
                    data: quadrantData.memastikan.q1,
                    color: "bg-green-100 border-green-500",
                  },
                  {
                    key: "q2",
                    label: "QUADRAN II (51-75%)",
                    data: quadrantData.memastikan.q2,
                    color: "bg-yellow-100 border-yellow-500",
                  },
                  {
                    key: "q3",
                    label: "QUADRAN III (26-50%)",
                    data: quadrantData.memastikan.q3,
                    color: "bg-orange-100 border-orange-500",
                  },
                  {
                    key: "q4",
                    label: "QUADRAN IV (0-25%)",
                    data: quadrantData.memastikan.q4,
                    color: "bg-red-100 border-red-500",
                  },
                ].map((quad) => (
                  <div
                    key={quad.key}
                    className={`border-2 rounded-lg p-3 ${quad.color}`}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <div className="font-bold">{quad.label}</div>
                      <div className="text-xl font-bold">{quad.data.count}</div>
                    </div>
                    <div className="text-left text-xs space-y-1">
                      {quad.data.items.length > 0 ? (
                        quad.data.items
                          .sort((a, b) => b.value - a.value)
                          .map((item, index) => (
                            <div
                              key={index}
                              className="bg-white/60 p-1.5 rounded-md flex justify-between"
                            >
                              <span>
                                {index + 1}. {item.loket}
                              </span>
                              <span className="font-semibold">
                                {item.value.toFixed(2)}%
                              </span>
                            </div>
                          ))
                      ) : (
                        <p className="text-gray-500 text-center text-xs py-2">
                          - Tidak ada data -
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Kolom Mengupayakan */}
            <div className="border rounded-lg p-4 shadow-sm">
              <h3 className="font-semibold text-center text-lg mb-4">
                Mengupayakan
              </h3>
              <div className="space-y-3">
                {[
                  {
                    key: "q1",
                    label: "QUADRAN I (10+ bln)",
                    data: quadrantData.mengupayakan.q1,
                    color: "bg-green-100 border-green-500",
                  },
                  {
                    key: "q2",
                    label: "QUADRAN II (7-9 bln)",
                    data: quadrantData.mengupayakan.q2,
                    color: "bg-yellow-100 border-yellow-500",
                  },
                  {
                    key: "q3",
                    label: "QUADRAN III (4-6 bln)",
                    data: quadrantData.mengupayakan.q3,
                    color: "bg-orange-100 border-orange-500",
                  },
                  {
                    key: "q4",
                    label: "QUADRAN IV (0-3 bln)",
                    data: quadrantData.mengupayakan.q4,
                    color: "bg-red-100 border-red-500",
                  },
                ].map((quad) => (
                  <div
                    key={quad.key}
                    className={`border-2 rounded-lg p-3 ${quad.color}`}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <div className="font-bold">{quad.label}</div>
                      <div className="text-xl font-bold">{quad.data.count}</div>
                    </div>
                    <div className="text-left text-xs space-y-1">
                      {quad.data.items.length > 0 ? (
                        quad.data.items
                          .sort((a, b) => b.value - a.value)
                          .map((item, index) => (
                            <div
                              key={index}
                              className="bg-white/60 p-1.5 rounded-md flex justify-between"
                            >
                              <span>
                                {index + 1}. {item.loket}
                              </span>
                              <span className="font-semibold">
                                {item.value} bln
                              </span>
                            </div>
                          ))
                      ) : (
                        <p className="text-gray-500 text-center text-xs py-2">
                          - Tidak ada data -
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Kolom Menambahkan */}
            <div className="border rounded-lg p-4 shadow-sm">
              <h3 className="font-semibold text-center text-lg mb-4">
                Menambahkan
              </h3>
              <div className="space-y-3">
                {[
                  {
                    key: "q1",
                    label: "QUADRAN I (15+ Nopol)",
                    data: quadrantData.menambahkan.q1,
                    color: "bg-green-100 border-green-500",
                  },
                  {
                    key: "q2",
                    label: "QUADRAN II (11-14 Nopol)",
                    data: quadrantData.menambahkan.q2,
                    color: "bg-yellow-100 border-yellow-500",
                  },
                  {
                    key: "q3",
                    label: "QUADRAN III (6-10 Nopol)",
                    data: quadrantData.menambahkan.q3,
                    color: "bg-orange-100 border-orange-500",
                  },
                  {
                    key: "q4",
                    label: "QUADRAN IV (0-5 Nopol)",
                    data: quadrantData.menambahkan.q4,
                    color: "bg-red-100 border-red-500",
                  },
                ].map((quad) => (
                  <div
                    key={quad.key}
                    className={`border-2 rounded-lg p-3 ${quad.color}`}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <div className="font-bold">{quad.label}</div>
                      <div className="text-xl font-bold">{quad.data.count}</div>
                    </div>
                    <div className="text-left text-xs space-y-1">
                      {quad.data.items.length > 0 ? (
                        quad.data.items
                          .sort((a, b) => b.value - a.value)
                          .map((item, index) => (
                            <div
                              key={index}
                              className="bg-white/60 p-1.5 rounded-md flex justify-between"
                            >
                              <span>
                                {index + 1}. {item.loket}
                              </span>
                              <span className="font-semibold">
                                {item.value} nopol
                              </span>
                            </div>
                          ))
                      ) : (
                        <p className="text-gray-500 text-center text-xs py-2">
                          - Tidak ada data -
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
      {/* ============== END: LAYOUT BARU YANG DIGABUNGKAN ============== */}

      {/* Bagian Tabel Peringkat Kinerja (TETAP ADA) */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-center mb-6">
          Tabel Peringkat Kinerja Cabang
        </h2>
        <div className="border rounded-lg shadow-sm">
          <Table>
            <TableHeader className="bg-gray-50">
              <TableRow>
                <TableHead className="w-[50px] text-center">No</TableHead>
                <TableHead className="min-w-[200px]">Kantor Cabang</TableHead>
                <TableHead className="text-center min-w-[170px]">
                  Memastikan (%)
                </TableHead>
                <TableHead className="text-center">
                  Mengupayakan (Bulan)
                </TableHead>
                <TableHead className="text-center">
                  Menambahkan (Nopol)
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rekapData
                .filter(
                  (row) =>
                    row.loketKantor === "KANWIL JAWA TENGAH" ||
                    row.loketKantor.startsWith("CABANG")
                )
                .map((row) => {
                  const subTotalRow = rekapData.find(
                    (r) =>
                      r.loketKantor === "SUB TOTAL" &&
                      rekapData.indexOf(r) > rekapData.indexOf(row)
                  );
                  return {
                    loketKantor: row.loketKantor,
                    memastikanPersen: subTotalRow?.memastikanPersen || 0,
                    mengupayakan: subTotalRow?.mengupayakan || 0,
                    menambahkanNopol: subTotalRow?.menambahkanNopol || 0,
                  };
                })
                .sort((a, b) => b.memastikanPersen - a.memastikanPersen)
                .map((row, index) => (
                  <TableRow
                    key={index}
                    className="font-medium hover:bg-gray-50"
                  >
                    <TableCell className="text-center text-lg font-bold text-gray-400">
                      {index + 1}
                    </TableCell>
                    <TableCell>{row.loketKantor}</TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-2">
                        <span className="font-bold text-base w-16">
                          {(row.memastikanPersen * 100).toFixed(2)}%
                        </span>
                        <Progress
                          value={row.memastikanPersen * 100}
                          className="w-[60%]"
                        />
                      </div>
                    </TableCell>
                    <TableCell className="text-center text-base font-bold">
                      {row.mengupayakan || "0"}
                    </TableCell>
                    <TableCell className="text-center text-base font-bold">
                      {row.menambahkanNopol || "0"}
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
