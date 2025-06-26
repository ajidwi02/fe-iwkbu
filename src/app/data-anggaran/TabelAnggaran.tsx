"use client";

import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

import {
  Calendar as CalendarIcon,
  ArrowUp,
  ArrowDown,
  Minus,
} from "lucide-react"; // <-- Menambahkan ikon
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

// Interface untuk properti komponen
export interface DateRangeProps {
  startDate: Date | null;
  endDate: Date | null;
  onDateRangeChange: (start: Date | null, end: Date | null) => void;
  initialStartDate?: Date;
  initialEndDate?: Date;
}

// Interface untuk data mentah yang diambil dari API
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

// Interface baru yang sesuai dengan struktur Tabel Anggaran
interface AnggaranRow {
  no: number;
  namaLoket: string;
  anggaranSatuTahun: number;
  targetAnggaranBulan: number;
  penerimaan2024: number;
  penerimaan2025: number;
  realisasi: string;
  gapRealisasiPersen: string;
  gapRealisasiRupiah: number;
  growthPersen: string;
  growthRupiah: number;
  isHeader?: boolean;
  isSubTotal?: boolean;
  isGrandTotal?: boolean;
}

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE;

// Data mapping loket dengan tambahan `anggaranSatuTahun`
const loketMapping = [
  {
    no: 1,
    parentLoket: "KANWIL JAWA TENGAH",
    childLoket: "LOKET CABANG JAWA TENGAH",
    endpoint: `${BASE_URL}/loketcabangjawatengah`,
    anggaranSatuTahun: 123118000,
  },
  {
    no: 2,
    parentLoket: "",
    childLoket: "SAMSAT KENDAL",
    endpoint: `${BASE_URL}/samsatkendal`,
    anggaranSatuTahun: 247521000,
  },
  {
    no: 3,
    parentLoket: "",
    childLoket: "SAMSAT DEMAK",
    endpoint: `${BASE_URL}/samsatdemak`,
    anggaranSatuTahun: 151467000,
  },
  {
    no: 4,
    parentLoket: "",
    childLoket: "SAMSAT PURWODADI",
    endpoint: `${BASE_URL}/samsatpurwodadi`,
    anggaranSatuTahun: 297000000,
  },
  {
    no: 5,
    parentLoket: "",
    childLoket: "SAMSAT UNGARAN",
    endpoint: `${BASE_URL}/samsatungaran`,
    anggaranSatuTahun: 564192000,
  },
  {
    no: 6,
    parentLoket: "",
    childLoket: "SAMSAT SALATIGA",
    endpoint: `${BASE_URL}/samsatsalatiga`,
    anggaranSatuTahun: 93935000,
  },
  // Wilayah Surakarta
  {
    no: 7,
    parentLoket: "CABANG SURAKARTA",
    childLoket: "LOKET CABANG SURAKARTA",
    anggaranSatuTahun: 299700000,
    endpoint: `${BASE_URL}/samsatlokperwsra`,
  },
  {
    no: 8,
    parentLoket: "",
    childLoket: "SAMSAT SURAKARTA",
    anggaranSatuTahun: 139000000,
    endpoint: `${BASE_URL}/samsatsurakarta`,
  },
  {
    no: 9,
    parentLoket: "",
    childLoket: "SAMSAT KLATEN",
    anggaranSatuTahun: 153200000,
    endpoint: `${BASE_URL}/samsatklaten`,
  },
  {
    no: 10,
    parentLoket: "",
    childLoket: "SAMSAT BOYOLALI",
    anggaranSatuTahun: 181000000,
    endpoint: `${BASE_URL}/samsatboyolali`,
  },
  {
    no: 11,
    parentLoket: "",
    childLoket: "SAMSAT SRAGEN",
    anggaranSatuTahun: 220800000,
    endpoint: `${BASE_URL}/samsatsragen`,
  },
  {
    no: 12,
    parentLoket: "",
    childLoket: "SAMSAT PRAMBANAN",
    anggaranSatuTahun: 52841000,
    endpoint: `${BASE_URL}/samsatprambanan`,
  },
  {
    no: 13,
    parentLoket: "",
    childLoket: "SAMSAT DELANGGU",
    anggaranSatuTahun: 44000000,
    endpoint: `${BASE_URL}/samsatdelanggu`,
  },
];

// Fungsi helper untuk menghitung realisasi
const calculateRealisasi = (penerimaan: number, anggaran: number): string => {
  if (anggaran === 0) return "0.00%";
  const percentage = (penerimaan / anggaran) * 100;
  return `${percentage.toFixed(2)}%`;
};

// Fungsi helper untuk menghitung gap realisasi persentase
const calculateGapRealisasiPersen = (
  penerimaan: number,
  target: number
): string => {
  if (target === 0) {
    return penerimaan > 0 ? "∞" : "0.00%";
  }
  const percentage = ((penerimaan - target) / target) * 100;
  return `${percentage.toFixed(2)}%`;
};

// Fungsi helper untuk menghitung growth
const calculateGrowthPersen = (
  penerimaan2025: number,
  penerimaan2024: number
): string => {
  if (penerimaan2024 === 0) {
    return penerimaan2025 > 0 ? "∞" : "0.00%";
  }
  const percentage = ((penerimaan2025 - penerimaan2024) / penerimaan2024) * 100;
  return `${percentage.toFixed(2)}%`;
};

// Komponen baru untuk menampilkan sel performa dengan warna dan ikon
const PerformanceCell = ({
  value,
  isPercentage = false,
}: {
  value: string | number;
  isPercentage?: boolean;
}) => {
  const numericValue =
    typeof value === "string" ? parseFloat(value.replace("%", "")) : value;
  const isPositive = numericValue > 0;
  const isNegative = numericValue < 0;
  const isNeutral = numericValue === 0;

  const colorClass = cn({
    "text-green-600": isPositive,
    "text-red-600": isNegative,
    "text-gray-600": isNeutral,
  });

  const Icon = isPositive ? ArrowUp : isNegative ? ArrowDown : Minus;

  const formattedValue = isPercentage
    ? `${numericValue.toFixed(2)}%`
    : new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(numericValue);

  return (
    <div
      className={cn(
        "flex items-center justify-end gap-2 font-medium",
        isPercentage && "justify-center",
        colorClass
      )}
    >
      {isPercentage && <Icon className="h-4 w-4" />}
      <span>{isPercentage ? value : formattedValue}</span>
    </div>
  );
};

const TabelAnggaran = ({
  onDateRangeChange,
  initialStartDate,
  initialEndDate,
}: DateRangeProps) => {
  const [data, setData] = useState<{ endpoint: string; data: ReportData[] }[]>(
    []
  );
  const [anggaranData, setAnggaranData] = useState<AnggaranRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  const formatDateWithoutYear = (date: Date | null) => {
    if (!date) return "Pilih Tanggal";
    return format(date, "dd MMMM");
  };

  const filterDataByDate = () => {
    if (!startDate || !endDate) return;
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
              return { endpoint: item.endpoint, data: [], error: err.message };
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
    if (!data.length || !endDate) return;

    const result: AnggaranRow[] = [];
    let groupSubTotal: AnggaranRow | null = null;

    const numberOfMonths = endDate.getMonth() + 1;

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
      const startDateComparable = new Date(
        2000,
        start.getMonth(),
        start.getDate()
      );
      const endDateComparable = new Date(2000, end.getMonth(), end.getDate());
      return date >= startDateComparable && date <= endDateComparable;
    };

    loketMapping.forEach((loket) => {
      if (loket.parentLoket) {
        if (groupSubTotal) {
          const finalSubTotal = groupSubTotal;
          finalSubTotal.realisasi = calculateRealisasi(
            finalSubTotal.penerimaan2025,
            finalSubTotal.anggaranSatuTahun
          );
          finalSubTotal.gapRealisasiPersen = calculateGapRealisasiPersen(
            finalSubTotal.penerimaan2025,
            finalSubTotal.targetAnggaranBulan
          );
          finalSubTotal.growthPersen = calculateGrowthPersen(
            finalSubTotal.penerimaan2025,
            finalSubTotal.penerimaan2024
          );
          result.push(finalSubTotal);
        }

        result.push({
          no: 0,
          namaLoket: loket.parentLoket,
          isHeader: true,
          anggaranSatuTahun: 0,
          targetAnggaranBulan: 0,
          penerimaan2024: 0,
          penerimaan2025: 0,
          realisasi: "",
          gapRealisasiPersen: "",
          gapRealisasiRupiah: 0,
          growthPersen: "",
          growthRupiah: 0,
        });
        groupSubTotal = {
          no: 0,
          namaLoket: "SUBTOTAL",
          isSubTotal: true,
          anggaranSatuTahun: 0,
          targetAnggaranBulan: 0,
          penerimaan2024: 0,
          penerimaan2025: 0,
          realisasi: "0.00%",
          gapRealisasiPersen: "0.00%",
          gapRealisasiRupiah: 0,
          growthPersen: "0.00%",
          growthRupiah: 0,
        };
      }

      const endpointData =
        data.find((d) => d.endpoint === loket.endpoint)?.data || [];
      const filteredData = endpointData.filter((item) => {
        const dateStr =
          item.iwkbu_tl_tgl_transaksi || item.iwkbu_ti_tgl_transaksi;
        return isDateInRange(dateStr, startDate, endDate);
      });

      const penerimaan2024 = filteredData.reduce(
        (sum, item) => sum + (item.iwkbu_tl_rupiah_penerimaan || 0),
        0
      );
      const penerimaan2025 = filteredData.reduce(
        (sum, item) => sum + (item.iwkbu_ti_rupiah_penerimaan || 0),
        0
      );

      const targetAnggaranBulanBerjalan =
        (loket.anggaranSatuTahun / 12) * numberOfMonths;
      const realisasiString = calculateRealisasi(
        penerimaan2025,
        loket.anggaranSatuTahun
      );
      const gapRealisasiRupiah = penerimaan2025 - targetAnggaranBulanBerjalan;
      const gapRealisasiPersen = calculateGapRealisasiPersen(
        penerimaan2025,
        targetAnggaranBulanBerjalan
      );
      const growthRupiah = penerimaan2025 - penerimaan2024;
      const growthPersen = calculateGrowthPersen(
        penerimaan2025,
        penerimaan2024
      );

      const rekap: AnggaranRow = {
        no: loket.no,
        namaLoket: loket.childLoket,
        anggaranSatuTahun: loket.anggaranSatuTahun,
        penerimaan2024,
        penerimaan2025,
        targetAnggaranBulan: targetAnggaranBulanBerjalan,
        realisasi: realisasiString,
        gapRealisasiPersen: gapRealisasiPersen,
        gapRealisasiRupiah: gapRealisasiRupiah,
        growthPersen: growthPersen,
        growthRupiah: growthRupiah,
      };

      result.push(rekap);

      if (groupSubTotal) {
        groupSubTotal.anggaranSatuTahun += rekap.anggaranSatuTahun;
        groupSubTotal.targetAnggaranBulan += rekap.targetAnggaranBulan;
        groupSubTotal.penerimaan2024 += rekap.penerimaan2024;
        groupSubTotal.penerimaan2025 += rekap.penerimaan2025;
        groupSubTotal.gapRealisasiRupiah += rekap.gapRealisasiRupiah;
        groupSubTotal.growthRupiah += rekap.growthRupiah;
      }
    });

    if (groupSubTotal) {
      const finalSubTotal = groupSubTotal;
      finalSubTotal.realisasi = calculateRealisasi(
        finalSubTotal.penerimaan2025,
        finalSubTotal.anggaranSatuTahun
      );
      finalSubTotal.gapRealisasiPersen = calculateGapRealisasiPersen(
        finalSubTotal.penerimaan2025,
        finalSubTotal.targetAnggaranBulan
      );
      finalSubTotal.growthPersen = calculateGrowthPersen(
        finalSubTotal.penerimaan2025,
        finalSubTotal.penerimaan2024
      );
      result.push(finalSubTotal);
    }

    setAnggaranData(result);
  };

  useEffect(() => {
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    setStartDate(firstDayOfMonth);
    setEndDate(today);
    onDateRangeChange(firstDayOfMonth, today);
    fetchData();
  }, []);

  useEffect(() => {
    if (data.length > 0) {
      generateRekap();
    }
  }, [data, startDate, endDate]);

  if (loading)
    return (
      <div className="p-4 text-center text-sm text-gray-500">
        Memuat data...
      </div>
    );
  if (error)
    return (
      <div className="p-4 text-center text-sm text-red-500">Error: {error}</div>
    );

  return (
    <div className="space-y-4">
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-end gap-4 rounded-md border p-4 shadow-sm bg-white">
          <div className="w-full">
            <label className="text-sm font-medium mb-2 block text-gray-700">
              Filter Periode Laporan
            </label>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full">
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
                        if (date && endDate && date > endDate) setEndDate(null);
                      }}
                      initialFocus
                      fixedWeeks
                      showOutsideDays
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <span className="hidden sm:inline mx-1 text-gray-500">s/d</span>
              <span className="sm:hidden text-xs text-gray-500 text-center w-full">
                sampai dengan
              </span>
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

      <div className="overflow-x-auto rounded-lg border shadow-md bg-white">
        <Table className="min-w-full">
          <TableHeader className="bg-slate-100">
            <TableRow>
              <TableHead
                rowSpan={2}
                className="text-slate-800 w-[50px] text-center align-middle font-semibold whitespace-nowrap px-4"
              >
                NO
              </TableHead>
              <TableHead
                rowSpan={2}
                className="text-slate-800 min-w-[220px] align-middle font-semibold sticky left-0 bg-slate-100 z-10"
              >
                NAMA LOKET
              </TableHead>
              <TableHead
                rowSpan={2}
                className="text-slate-800 min-w-[180px] align-middle text-center font-semibold whitespace-nowrap"
              >
                ANGGARAN 1 TAHUN
              </TableHead>
              <TableHead
                rowSpan={2}
                className="text-slate-800 min-w-[180px] align-middle text-center font-semibold whitespace-nowrap"
              >
                TARGET ANGGARAN S/D SAAT INI
              </TableHead>
              <TableHead
                colSpan={2}
                className="text-slate-800 text-center border-b border-slate-300 font-semibold"
              >
                PENERIMAAN
              </TableHead>
              <TableHead
                rowSpan={2}
                className="text-slate-800 text-center align-middle font-semibold"
              >
                REALISASI
              </TableHead>
              <TableHead
                colSpan={2}
                className="text-slate-800 text-center border-b border-slate-300 font-semibold"
              >
                GAP REALISASI
              </TableHead>
              <TableHead
                colSpan={2}
                className="text-slate-800 text-center border-b border-slate-300 font-semibold"
              >
                GROWTH
              </TableHead>
            </TableRow>
            <TableRow className="bg-slate-50">
              <TableHead className="text-slate-600 text-center font-medium whitespace-nowrap">
                2024
              </TableHead>
              <TableHead className="text-slate-600 text-center font-medium whitespace-nowrap">
                2025
              </TableHead>
              <TableHead className="text-slate-600 text-center font-medium whitespace-nowrap">
                %
              </TableHead>
              <TableHead className="text-slate-600 text-center font-medium whitespace-nowrap">
                RUPIAH
              </TableHead>
              <TableHead className="text-slate-600 text-center font-medium whitespace-nowrap">
                %
              </TableHead>
              <TableHead className="text-slate-600 text-center font-medium whitespace-nowrap">
                RUPIAH
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {anggaranData.map((row, index) => {
              if (row.isHeader) {
                return (
                  <TableRow
                    key={index}
                    className="bg-slate-700 hover:bg-slate-600"
                  >
                    <TableCell
                      colSpan={11}
                      className="text-white font-bold text-sm tracking-wider uppercase py-3"
                    >
                      {row.namaLoket}
                    </TableCell>
                  </TableRow>
                );
              }

              if (row.isSubTotal) {
                return (
                  <TableRow key={index} className="bg-slate-200 font-bold">
                    <TableCell
                      colSpan={2}
                      className="text-right text-slate-800"
                    >
                      {row.namaLoket}
                    </TableCell>
                    <TableCell className="text-right text-slate-800">
                      {formatRupiah(row.anggaranSatuTahun)}
                    </TableCell>
                    <TableCell className="text-right text-slate-800">
                      {formatRupiah(row.targetAnggaranBulan)}
                    </TableCell>
                    <TableCell className="text-right text-slate-800">
                      {formatRupiah(row.penerimaan2024)}
                    </TableCell>
                    <TableCell className="text-right text-slate-800">
                      {formatRupiah(row.penerimaan2025)}
                    </TableCell>
                    <TableCell className="text-center text-slate-800">
                      {row.realisasi}
                    </TableCell>
                    <TableCell>
                      <PerformanceCell
                        value={row.gapRealisasiPersen}
                        isPercentage
                      />
                    </TableCell>
                    <TableCell>
                      <PerformanceCell value={row.gapRealisasiRupiah} />
                    </TableCell>
                    <TableCell>
                      <PerformanceCell value={row.growthPersen} isPercentage />
                    </TableCell>
                    <TableCell>
                      <PerformanceCell value={row.growthRupiah} />
                    </TableCell>
                  </TableRow>
                );
              }

              return (
                <TableRow
                  key={index}
                  className="hover:bg-gray-50 even:bg-white odd:bg-slate-50/50"
                >
                  <TableCell className="text-center text-gray-600">
                    {row.no}
                  </TableCell>
                  <TableCell className="font-medium text-gray-800 sticky left-0 bg-inherit z-10">
                    {row.namaLoket}
                  </TableCell>
                  <TableCell className="text-right font-mono text-gray-700">
                    {formatRupiah(row.anggaranSatuTahun)}
                  </TableCell>
                  <TableCell className="text-right font-mono text-gray-700">
                    {formatRupiah(row.targetAnggaranBulan)}
                  </TableCell>
                  <TableCell className="text-right font-mono text-gray-700">
                    {formatRupiah(row.penerimaan2024)}
                  </TableCell>
                  <TableCell className="text-right font-mono text-gray-700">
                    {formatRupiah(row.penerimaan2025)}
                  </TableCell>
                  <TableCell className="text-center font-semibold text-blue-600">
                    {row.realisasi}
                  </TableCell>
                  <TableCell>
                    <PerformanceCell
                      value={row.gapRealisasiPersen}
                      isPercentage
                    />
                  </TableCell>
                  <TableCell>
                    <PerformanceCell value={row.gapRealisasiRupiah} />
                  </TableCell>
                  <TableCell>
                    <PerformanceCell value={row.growthPersen} isPercentage />
                  </TableCell>
                  <TableCell>
                    <PerformanceCell value={row.growthRupiah} />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default TabelAnggaran;
