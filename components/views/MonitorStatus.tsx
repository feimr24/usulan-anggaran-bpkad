"use client";

import { useMemo, useState } from "react";
import { Eye, Plus, Save, Send, Upload, Calendar, CheckCircle2, ClipboardList, Download } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { Badge, Button, Card, EmptyState, SectionHead } from "@/components/ui";
import Modal, { DialogBody, DialogFoot, DialogHead } from "@/components/Modal";
import DetailHighlight from "@/components/DetailHighlight";
import { rupiah, today } from "@/lib/format";
import { StatusKey, Usulan } from "@/lib/types";

// Map sub kegiatan ID ke nama untuk ditampilkan
const SUB_KEGIATAN_MAP: Record<string, string> = {
  "1": "Pengelolaan Pendidikan Dasar",
  "2": "Penyediaan Alkes Fasyankes",
  "3": "Pemeliharaan Jalan dan Drainase",
};

const FILTERS: [string, string][] = [
  ["all", "Semua"],
  ["draft", "Draft"],
  ["diajukan", "Diajukan"],
  ["verifikasi", "Menunggu Verifikasi"],
  ["tapd", "Menunggu TAPD"],
  ["disetujui", "Disetujui"],
  ["ditolak", "Ditolak"],
  ["revisi", "Revisi"],
];

// Helper functions for formatting date and time
function formatDateRange(buka: string, tutup: string): string {
  if (!buka || !tutup) return "-";
  const start = buka.split(' ')[0];
  const end = tutup.split(' ')[0];
  return `${start} s/d ${end}`;
}

function formatTimeRange(buka: string, tutup: string): string {
  if (!buka || !tutup) return "-";
  const startTime = buka.split(' ')[1] || "00:00";
  const endTime = tutup.split(' ')[1] || "23:59";
  return `${startTime} - ${endTime}`;
}

function formatJadwalLengkap(j: { tahun: string; tahap: string; buka: string; tutup: string }): string {
  const bukaDate = j.buka.split(' ')[0] || "";
  const bukaTime = j.buka.split(' ')[1] || "";
  const tutupDate = j.tutup.split(' ')[0] || "";
  const tutupTime = j.tutup.split(' ')[1] || "";
  return `${j.tahun} · ${j.tahap} · Buka: ${bukaDate} ${bukaTime} · Tutup: ${tutupDate} ${tutupTime}`;
}

export default function MonitorStatus() {
  const { usulanList, setUsulanList, jadwalList, currentSkpd, toast } = useApp();
  const [filter, setFilter] = useState("all");
  const [filterJenis, setFilterJenis] = useState("all");
  const [inputOpen, setInputOpen] = useState(false);
  const [detailFor, setDetailFor] = useState<Usulan | null>(null);

  const [nilai, setNilai] = useState("");
  const [ket, setKet] = useState("");
  const [subKegiatanId, setSubKegiatanId] = useState("");

  // Data dummy untuk sub kegiatan - dalam implementasi nyata akan diambil dari context/API
  const [subKegiatanList] = useState([
    {
      id: "1",
      kode: "5.2.03.01",
      nama: "Pengelolaan Pendidikan Dasar",
      deskripsi: "Kegiatan pengelolaan pendidikan dasar di tingkat SD dan SMP",
    },
    {
      id: "2",
      kode: "5.2.02.01",
      nama: "Penyediaan Alkes Fasyankes",
      deskripsi: "Pengadaan alat kesehatan untuk fasilitas kesehatan",
    },
    {
      id: "3",
      kode: "5.2.03.05",
      nama: "Pemeliharaan Jalan dan Drainase",
      deskripsi: "Pemeliharaan infrastruktur jalan dan sistem drainase",
    },
  ]);

  // Hanya ambil jadwal aktif
  const jadwalAktif = jadwalList.find((j) => j.aktif) || null;

  const rows = useMemo(() =>
    usulanList.filter((u) => {
      const matchStatus = filter === "all" || u.status === filter;
      const matchJenis = filterJenis === "all" || u.jenis === filterJenis;
      return matchStatus && matchJenis;
    }),
    [usulanList, filter, filterJenis]
  );

  function openInput() {
    setNilai("");
    setKet("");
    setSubKegiatanId("");
    setInputOpen(true);
  }

  function build(status: StatusKey) {
    if (!jadwalAktif) {
      toast("Tidak ada jadwal usulan aktif. Hubungi admin untuk mengaktifkan jadwal.", "err");
      return;
    }

    if (!subKegiatanId) {
      toast("Pilih sub kegiatan terlebih dahulu", "err");
      return;
    }

    const selectedSubKegiatan = subKegiatanList.find(s => s.id === subKegiatanId);

    const newItem: Usulan = {
      id: "USL-2026-" + String(usulanList.length + 1).padStart(3, "0"),
      skpd: currentSkpd.nama,
      tanggal: today(),
      tahap: jadwalAktif.tahap,
      ket: ket.trim() || "(tanpa keterangan)",
      nilai: Number(nilai.replace(/\D/g, "")) || 0,
      status,
      dokumen: "dokumen-usulan-baru.pdf",
      subKegiatanId: subKegiatanId,
    };
    setUsulanList((list) => [newItem, ...list]);
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-medium tracking-tight">Monitor Status</h1>
          <p className="mt-1 text-sm text-muted-fg">
            Pantau posisi tiap usulan dan buat usulan baru. Gunakan tab untuk memfilter berdasarkan status pengajuan.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => {
            // Export semua usulan yang sudah diajukan
            const usulanDiajukan = usulanList.filter((u) => u.status !== "draft");
            if (usulanDiajukan.length === 0) {
              toast("Tidak ada usulan yang bisa di-export", "err");
              return;
            }
            const header = "ID,SKPD,Tanggal,Tahap,Keterangan,Nilai,Status,Jenis,Catatan\n";
            const rows = usulanDiajukan.map((u) =>
              `"${u.id}","${u.skpd}","${u.tanggal}","${u.tahap}","${u.ket}",${u.nilai},"${u.status}","${u.jenis || ""}","${u.catatan || ""}"`
            ).join("\n");
            const blob = new Blob([header + rows], { type: "text/csv" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `usulan-${currentSkpd.nama.replace(/\s+/g, "-")}-${today()}.csv`;
            a.click();
            URL.revokeObjectURL(url);
            toast(`${usulanDiajukan.length} usulan berhasil di-export`);
          }}>
            <Download className="h-[15px] w-[15px]" />
            Export
          </Button>
          <Button variant="primary" onClick={openInput}>
            <Plus className="h-[15px] w-[15px]" />
            Input Usulan
          </Button>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="inline-flex flex-wrap gap-1 rounded-lg bg-muted p-1">
          {FILTERS.map(([k, l]) => (
            <button
              key={k}
              onClick={() => setFilter(k)}
              className={`rounded-md border-none px-3.5 py-[7px] text-sm font-medium ${
                filter === k ? "bg-card text-fg shadow-sm2" : "bg-transparent text-muted-fg"
              }`}
            >
              {l} (
              {k === "all" ? usulanList.length : usulanList.filter((u) => u.status === k).length}
              )
            </button>
          ))}
        </div>
        <div className="flex-1" />
        <select
          value={filterJenis}
          onChange={(e) => setFilterJenis(e.target.value)}
          className="h-[38px] w-auto min-w-[180px]"
        >
          <option value="all">Semua Jenis Persetujuan</option>
          <option value="Sekda">Disetujui Sekda</option>
          <option value="PPKD">Disetujui PPKD</option>
          <option value="TAPD">Disetujui TAPD</option>
        </select>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                {["Tanggal", "Tahap", "Keterangan", "Jenis", "Nilai", "Status", ""].map(
                  (h, i) => (
                    <th
                      key={i}
                      className={`border-b border-border px-4 py-[11px] text-left text-xs font-semibold uppercase tracking-[0.04em] text-muted-fg ${
                        i === 4 || i === 6 ? "text-right" : ""
                      }`}
                    >
                      {i === 6 ? "Aksi" : h}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {rows.length ? (
                rows.map((u) => (
                  <tr key={u.id} className="border-b border-[hsl(34_16%_92%)] last:border-none hover:bg-[hsl(36_24%_97%)]">
                    <td className="px-4 py-3 text-sm">{u.tanggal}</td>
                    <td className="px-4 py-3 text-sm text-muted-fg">{u.tahap}</td>
                    <td className="max-w-[220px] truncate px-4 py-3 text-sm text-muted-fg">
                      {u.ket}
                    </td>
                    <td className="px-4 py-3">
                      {u.jenis ? (
                        <span className="inline-flex items-center rounded-full border border-fuchsia-200 bg-fuchsia-50 px-[9px] py-[3px] text-xs font-semibold text-fuchsia-800">
                          {u.jenis}
                        </span>
                      ) : (
                        <span className="text-xs text-muted-fg">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right text-sm">{rupiah(u.nilai)}</td>
                    <td className="px-4 py-3">
                      <Badge status={u.status} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        className="ml-auto"
                        onClick={() => setDetailFor(u)}
                      >
                        <Eye className="h-[15px] w-[15px]" />
                        Detail
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <EmptyState colSpan={7} message="Tidak ada usulan pada status ini." />
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Input Usulan dialog */}
      <Modal open={inputOpen} onClose={() => setInputOpen(false)} width="wide">
        <DialogHead
          title="Input Usulan Anggaran"
          desc="Input usulan anggaran berdasarkan jadwal aktif. Pilih sub kegiatan dari daftar master."
        />
        <DialogBody>
          <div className="space-y-4">
            {/* Jadwal Aktif */}
            <div className="rounded-lg border border-border bg-card p-4">
              <h3 className="text-sm font-semibold mb-2">Jadwal Usulan Aktif</h3>
              {jadwalAktif ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-muted-fg">Tahun Anggaran</label>
                      <div className="text-sm font-medium">{jadwalAktif.tahun}</div>
                    </div>
                    <div>
                      <label className="text-xs text-muted-fg">Tahap</label>
                      <div className="text-sm font-medium">{jadwalAktif.tahap}</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-muted-fg">Buka Usulan</label>
                      <div className="text-sm font-medium">
                        {jadwalAktif.buka.replace(' ', ', ')}
                      </div>
                    </div>
                    <div>
                      <label className="text-xs text-muted-fg">Tutup Usulan</label>
                      <div className="text-sm font-medium">
                        {jadwalAktif.tutup.replace(' ', ', ')}
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-muted-fg">Status</label>
                    <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700 border border-emerald-200">
                      ✓ Aktif
                    </span>
                  </div>
                </div>
              ) : (
                <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
                  ⚠️ Tidak ada jadwal usulan aktif. Hubungi admin untuk mengaktifkan jadwal.
                </div>
              )}
            </div>

            <div>
              <label>Sub Kegiatan</label>
              <select
                value={subKegiatanId}
                onChange={(e) => setSubKegiatanId(e.target.value)}
                disabled={!subKegiatanList.length}
              >
                <option value="" disabled>
                  Pilih sub kegiatan…
                </option>
                {subKegiatanList.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.kode} - {s.nama}
                  </option>
                ))}
              </select>
              {subKegiatanId && (
                <p className="mt-1 text-xs text-muted-fg">
                  {subKegiatanList.find(s => s.id === subKegiatanId)?.deskripsi}
                </p>
              )}
            </div>

            <div>
              <label>Unggah Dokumen (PDF)</label>
              <label className="flex cursor-pointer items-center gap-3 rounded-[9px] border-[1.5px] border-dashed border-input px-4 py-5 text-sm text-muted-fg hover:bg-muted/50">
                <Upload className="h-5 w-5" />
                <span>Klik untuk memilih berkas PDF, atau seret ke sini</span>
                <input type="file" accept="application/pdf" className="hidden" />
              </label>
            </div>

            <div>
              <label>Usulan Anggaran (Rp)</label>
              <input
                inputMode="numeric"
                placeholder="0"
                value={nilai}
                onChange={(e) => setNilai(e.target.value)}
                className="text-lg"
              />
              <p className="mt-1 text-xs text-muted-fg">
                Format: 1.000.000.000
              </p>
            </div>

            <div>
              <label>Keterangan Usulan</label>
              <textarea
                rows={3}
                value={ket}
                onChange={(e) => setKet(e.target.value)}
                placeholder="Jelaskan detail usulan anggaran..."
              />
            </div>
          </div>
        </DialogBody>
        <DialogFoot>
          <Button
            variant="outline"
            onClick={() => {
              build("draft");
              setInputOpen(false);
              toast("Draft usulan disimpan");
            }}
          >
            <Save className="h-[15px] w-[15px]" />
            Simpan Draft
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              build("diajukan");
              setInputOpen(false);
              toast("Usulan diajukan");
            }}
          >
            <Send className="h-[15px] w-[15px]" />
            Ajukan Usulan
          </Button>
        </DialogFoot>
      </Modal>

      {/* Detail dialog */}
      <Modal open={!!detailFor} onClose={() => setDetailFor(null)} width="wider">
        {detailFor && (
          <>
            <DialogHead
              title="Detail Usulan"
              desc="Lihat detail usulan, status pengajuan, dan riwayat persetujuan."
            />
            <DialogBody>
              <div className="space-y-4">
                <DetailHighlight u={detailFor} />

                {/* Sub Kegiatan */}
                <div className="rounded-lg border border-border bg-card p-4">
                  <div className="flex items-center gap-[11px]">
                    <span className="grid h-[34px] w-[34px] place-items-center rounded-lg bg-muted text-muted-fg">
                      <ClipboardList className="h-4 w-4" />
                    </span>
                    <div>
                      <div className="text-[10.5px] font-semibold uppercase tracking-[0.05em] text-muted-fg">
                        Sub Kegiatan
                      </div>
                      <div className="mt-px text-sm font-semibold">
                        {detailFor.subKegiatanId ? (
                          SUB_KEGIATAN_MAP[detailFor.subKegiatanId] || `ID: ${detailFor.subKegiatanId}`
                        ) : (
                          "Tidak tersedia"
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Info Status & Jenis */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-[11px] rounded-[10px] border border-border bg-card px-[13px] py-[11px]">
                    <span className="grid h-[34px] w-[34px] place-items-center rounded-lg bg-muted text-muted-fg">
                      <Eye className="h-4 w-4" />
                    </span>
                    <div>
                      <div className="text-[10.5px] font-semibold uppercase tracking-[0.05em] text-muted-fg">
                        Status Pengajuan
                      </div>
                      <div className="mt-px text-sm font-semibold">
                        <Badge status={detailFor.status} />
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-[11px] rounded-[10px] border border-border bg-card px-[13px] py-[11px]">
                    <span className="grid h-[34px] w-[34px] place-items-center rounded-lg bg-muted text-muted-fg">
                      <Calendar className="h-4 w-4" />
                    </span>
                    <div>
                      <div className="text-[10.5px] font-semibold uppercase tracking-[0.05em] text-muted-fg">
                        Jenis Persetujuan
                      </div>
                      <div className="mt-px text-sm font-semibold">
                        {detailFor.jenis ? (
                          <span className="inline-flex items-center rounded-full border border-fuchsia-200 bg-fuchsia-50 px-[9px] py-[3px] text-xs font-semibold text-fuchsia-800">
                            {detailFor.jenis}
                          </span>
                        ) : "—"}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Catatan Verifikator */}
                {detailFor.catatan && (
                  <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                    <div className="text-xs text-amber-700 font-medium mb-1">Catatan dari Verifikator</div>
                    <div className="text-sm text-amber-900 bg-amber-100/70 rounded-md px-3 py-2">
                      {detailFor.catatan}
                    </div>
                  </div>
                )}

                {/* Riwayat Verifikasi & Persetujuan */}
                {(detailFor.tglVerifikasi || detailFor.status === "disetujui") && (
                  <div className="rounded-lg border border-border bg-card p-4">
                    <h3 className="text-sm font-semibold mb-3">Riwayat Proses</h3>
                    <div className="space-y-3">
                      {detailFor.tglVerifikasi && (
                        <div className="flex items-center gap-3">
                          <span className="grid h-8 w-8 place-items-center rounded-full bg-amber-100 text-amber-700">
                            <CheckCircle2 className="h-4 w-4" />
                          </span>
                          <div>
                            <div className="text-xs text-muted-fg">Diverifikasi oleh Verifikator</div>
                            <div className="text-sm font-medium">{detailFor.tglVerifikasi}</div>
                          </div>
                        </div>
                      )}
                      {detailFor.status === "disetujui" && (
                        <div className="flex items-center gap-3">
                          <span className="grid h-8 w-8 place-items-center rounded-full bg-emerald-100 text-emerald-700">
                            <CheckCircle2 className="h-4 w-4" />
                          </span>
                          <div>
                            <div className="text-xs text-muted-fg">Disetujui oleh {detailFor.jenis}</div>
                            <div className="text-sm font-medium">{detailFor.tglVerifikasi || "—"}</div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </DialogBody>
            <DialogFoot between>
              <Button variant="outline" onClick={() => setDetailFor(null)}>
                Tutup
              </Button>
              <Button
                variant="primary"
                onClick={() => {
                  // Export detail usulan ke file teks
                  const content = `DETAIL USULAN ANGGARAN\n` +
                    `========================\n\n` +
                    `ID Usulan: ${detailFor.id}\n` +
                    `SKPD: ${detailFor.skpd}\n` +
                    `Tanggal: ${detailFor.tanggal}\n` +
                    `Tahap: ${detailFor.tahap}\n` +
                    `Keterangan: ${detailFor.ket}\n` +
                    `Nilai: Rp ${detailFor.nilai.toLocaleString('id-ID')}\n` +
                    `Dokumen: ${detailFor.dokumen || "-"}\n` +
                    `Status: ${detailFor.status}\n\n` +
                    `Sub Kegiatan: ${detailFor.subKegiatanId ? (SUB_KEGIATAN_MAP[detailFor.subKegiatanId] || detailFor.subKegiatanId) : "-"}\n` +
                    `Jenis Persetujuan: ${detailFor.jenis || "-"}\n\n` +
                    `Catatan Verifikator: ${detailFor.catatan || "-"}\n` +
                    `Tanggal Verifikasi: ${detailFor.tglVerifikasi || "-"}\n`;
                  const blob = new Blob([content], { type: "text/plain" });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = `usulan-${detailFor.id}.txt`;
                  a.click();
                  URL.revokeObjectURL(url);
                  toast("Detail usulan berhasil di-export");
                }}
              >
                Export
              </Button>
            </DialogFoot>
          </>
        )}
      </Modal>
    </div>
  );
}
