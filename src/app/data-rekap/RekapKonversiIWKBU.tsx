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

import { format } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@radix-ui/react-select";
import { Button } from "@/components/ui/button";

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
}

interface RekapRow {
  no: number;
  loketKantor: string;
  petugas: string;
  anggaran: number;
  checkinNopol: number;
  checkinRupiah: number;
  checkoutNopol: number;
  checkoutRupiah: number;
  memastikanNopol: number;
  memastikanRupiah: number;
  memastikanPersen: number;
  mengupayakan: number;
}

// Mapping data untuk loket dan petugas
const loketMapping = [
  {
    no: 1,
    parentLoket: "LOKET KEDUNGSAPUR",
    childLoket: "LOKET CABANG JAWA TENGAH",
    petugas: "GUNTUR DWI SAPUTRA",
    anggaran: 45000000,
    endpoint: "http://localhost:8080/loketcabangjawatengah",
  },
  {
    no: 2,
    parentLoket: "",
    childLoket: "SAMSAT KENDAL",
    petugas: "HEIRTANA HANDIETRA",
    anggaran: 45000000,
    endpoint: "http://localhost:8080/samsatkendal",
  },
  {
    no: 3,
    parentLoket: "",
    childLoket: "SAMSAT DEMAK",
    petugas: "TIARA HAPSARI",
    anggaran: 45000000,
    endpoint: "http://localhost:8080/samsatdemak",
  },
  {
    no: 4,
    parentLoket: "",
    childLoket: "SAMSAT PURWODADI",
    petugas: "ADI SETIAWAN",
    anggaran: 45000000,
    endpoint: "http://localhost:8080/samsatpurwodadi",
  },
  {
    no: 5,
    parentLoket: "",
    childLoket: "SAMSAT UNGARAN",
    petugas: "MAHENDRA DWI HEISTRIANTO",
    anggaran: 45000000,
    endpoint: "http://localhost:8080/samsatungaran",
  },
  {
    no: 6,
    parentLoket: "",
    childLoket: "RIKA WAHYU UTAMI",
    petugas: "ADI SETIAWAN",
    anggaran: 45000000,
    endpoint: "http://localhost:8080/samsatsalatiga",
  },
];

const RekapDashboardKonversi = () => {
  const [data, setData] = useState<{ endpoint: string; data: ReportData[] }[]>(
    []
  );
  const [rekapData, setRekapData] = useState<RekapRow[]>([]);
  const [month, setMonth] = useState<number>(5); // Default Mei
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        )
      );

      console.log("Data dari API:", responses);
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
    console.log(`Memproses data untuk bulan: ${monthStr}`);

    const result: RekapRow[] = [];

    loketMapping.forEach((loket, index) => {
      // Cari data yang sesuai dengan endpoint
      const endpointData =
        data.find((d) => d.endpoint === loket.endpoint)?.data || [];

      // Inisialisasi data rekap
      const rekap: RekapRow = {
        no: loket.no,
        loketKantor: loket.childLoket,
        petugas: loket.petugas,
        anggaran: loket.anggaran,
        checkinNopol: 0,
        checkinRupiah: 0,
        checkoutNopol: 0,
        checkoutRupiah: 0,
        memastikanNopol: 0,
        memastikanRupiah: 0,
        memastikanPersen: 0,
        mengupayakan: 0, // Initialize mengupayakan
      };

      // Data untuk memastikan
      const matchedNopol = new Set<string>();
      let matchedRupiah = 0;

      // Data untuk mengupayakan
      let totalBulanMajuTI = 0;
      let totalBulanMajuTL = 0;
      let countDataBulanIni = 0;

      // Proses data checkin (TL)
      endpointData.forEach((item) => {
        if (item.iwkbu_tl_tgl_transaksi) {
          const [day, mon] = item.iwkbu_tl_tgl_transaksi.split("/");
          if (mon === monthStr) {
            rekap.checkinNopol += item.kode_nopol_co || 0;
            rekap.checkinRupiah += item.iwkbu_tl_rupiah_penerimaan || 0;
            // totalBulanMajuTL += item.iwkbu_tl_bulan_maju || 0;
            // Only count if bulan maju > 0
            if (item.iwkbu_tl_bulan_maju > 0) {
              totalBulanMajuTL += item.iwkbu_tl_bulan_maju;
              countDataBulanIni++;
            }
          }
        }
      });

      // Proses data checkout (TI) dan cari yang match dengan checkin
      endpointData.forEach((item) => {
        if (item.iwkbu_ti_tgl_transaksi) {
          const [day, mon] = item.iwkbu_ti_tgl_transaksi.split("/");
          if (mon === monthStr) {
            rekap.checkoutNopol += item.kode_nopol_ci || 0;
            rekap.checkoutRupiah += item.iwkbu_ti_rupiah_penerimaan || 0;
            // totalBulanMajuTI += item.iwkbu_ti_bulan_maju || 0;
            if (item.iwkbu_ti_bulan_maju > 0) {
              totalBulanMajuTI += item.iwkbu_ti_bulan_maju;

              countDataBulanIni++;
            }

            // Cari apakah nopol ini ada di data checkin
            const foundInCheckin = endpointData.some(
              (ciItem) =>
                ciItem.iwkbu_tl_nopol === item.iwkbu_ti_nopol &&
                ciItem.iwkbu_tl_tgl_transaksi &&
                ciItem.iwkbu_tl_tgl_transaksi.split("/")[1] === monthStr
            );

            if (foundInCheckin && item.iwkbu_ti_nopol) {
              if (!matchedNopol.has(item.iwkbu_ti_nopol)) {
                matchedNopol.add(item.iwkbu_ti_nopol);
                matchedRupiah += item.iwkbu_ti_rupiah_penerimaan || 0;
              }
            }
          }
        }
      });

      // Hitung persentase
      const persen =
        rekap.checkoutNopol > 0 ? matchedNopol.size / rekap.checkoutNopol : 0;

      rekap.memastikanNopol = matchedNopol.size;
      rekap.memastikanRupiah = matchedRupiah;
      rekap.memastikanPersen = persen;

      // Hitung mengupayakan (TI bulan maju - TL bulan maju)
      rekap.mengupayakan = totalBulanMajuTL - totalBulanMajuTI;
      rekap.mengupayakan = rekap.mengupayakan / countDataBulanIni;

      // Tambahkan parent loket jika ada
      if (loket.parentLoket) {
        result.push({
          no: loket.no,
          loketKantor: loket.parentLoket,
          petugas: "",
          anggaran: loket.anggaran,
          checkinNopol: 0,
          checkinRupiah: 0,
          checkoutNopol: 0,
          checkoutRupiah: 0,
          memastikanNopol: 0,
          memastikanRupiah: 0,
          memastikanPersen: 0,
          mengupayakan: 0,
        });
      }

      // Tambahkan data utama
      result.push(rekap);
    });

    // Tambahkan sub total
    const subTotal: RekapRow = {
      no: 0,
      loketKantor: "SUB TOTAL",
      petugas: "",
      anggaran: result.reduce((sum, row) => sum + (row.anggaran || 0), 0),
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
        result.reduce((sum, row) => {
          if (row.checkoutNopol > 0) {
            return sum + row.memastikanNopol / row.checkoutNopol;
          }
          return sum;
        }, 0) / result.filter((row) => row.checkoutNopol > 0).length,
      mengupayakan: result.reduce((sum, row) => sum + row.mengupayakan, 0),
    };

    result.push(subTotal);

    console.log("Hasil rekap:", result);
    setRekapData(result);
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (data.length > 0) {
      generateRekap();
    }
  }, [data, month]);

  const months = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
  ];

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
      {/* Filter Bulan */}
      <div className="flex flex-wrap items-end gap-4 rounded-md border p-4 shadow-sm">
        <div className="flex flex-col space-y-1">
          <label className="text-sm font-medium">Bulan</label>
          <Select
            value={month.toString()}
            onValueChange={(value) => setMonth(parseInt(value))}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Pilih Bulan" />
            </SelectTrigger>
            <SelectContent>
              {months.map((m, index) => (
                <SelectItem key={index} value={(index + 1).toString()}>
                  {m}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Button onClick={generateRekap}>Tampilkan</Button>
        </div>
      </div>

      {/* Tabel Rekap */}
      <div className="overflow-auto rounded-lg border shadow-md">
        <Table>
          <TableHeader className="bg-gray-100">
            <TableRow>
              <TableHead className="w-[50px] text-center">NO</TableHead>
              <TableHead className="min-w-[200px]">LOKET KANTOR</TableHead>
              <TableHead className="min-w-[150px]">PETUGAS</TableHead>
              <TableHead className="min-w-[150px]">ANGGARAN</TableHead>
              <TableHead colSpan={3} className="text-center">
                CHECKIN
              </TableHead>
              <TableHead colSpan={3} className="text-center">
                CHECKOUT
              </TableHead>
              <TableHead colSpan={3} className="text-center">
                SELISIH CICO
              </TableHead>
            </TableRow>
            <TableRow>
              <TableHead></TableHead>
              <TableHead></TableHead>
              <TableHead></TableHead>
              <TableHead></TableHead>
              <TableHead className="text-center">NOPOL</TableHead>
              <TableHead className="text-center">JUMLAH BULAN</TableHead>
              <TableHead className="text-center">RUPIAH</TableHead>
              <TableHead className="text-center">NOPOL</TableHead>
              <TableHead className="text-center">JUMLAH BULAN</TableHead>
              <TableHead className="text-center">RUPIAH</TableHead>
              <TableHead className="text-center">NOPOL</TableHead>
              <TableHead className="text-center">JUMLAH BULAN</TableHead>
              <TableHead className="text-center">RUPIAH</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rekapData.map((row, index) => (
              <TableRow
                key={index}
                className={
                  row.loketKantor === "SUB TOTAL"
                    ? "bg-blue-50 font-semibold"
                    : row.loketKantor === "LOKET KEDUNGSAPUR"
                    ? "bg-gray-100 font-medium"
                    : ""
                }
              >
                <TableCell className="text-center">
                  {row.no > 0 ? row.no : ""}
                </TableCell>
                <TableCell className={row.no === 0 ? "font-semibold" : ""}>
                  {row.loketKantor}
                </TableCell>
                <TableCell>{row.petugas}</TableCell>
                <TableCell>{formatRupiah(row.anggaran || 0)}</TableCell>
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
                <TableCell className="text-center">
                  {row.mengupayakan !== 0 ? row.mengupayakan : "-"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default RekapDashboardKonversi;
