"use client";

import { useMemo, useState } from "react";
import { Eye, Plus, Minus, Save, Send, Upload, Calendar, CheckCircle2, ClipboardList, Download } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { Badge, Button, Card, EmptyState, SectionHead } from "@/components/ui";
import Modal, { DialogBody, DialogFoot, DialogHead } from "@/components/Modal";
import DetailHighlight from "@/components/DetailHighlight";
import { rupiah, today, parseNominal } from "@/lib/format";
import { SUB_KEGIATAN } from "@/lib/data";
import { StatusKey, Usulan } from "@/lib/types";

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

export default function MonitorStatus() {
  const { usulanList, setUsulanList, jadwalList, currentSkpd, toast } = useApp();
  const [filter, setFilter] = useState("all");
  const [filterJenis, setFilterJenis] = useState("all");
  const [inputOpen, setInputOpen] = useState(false);
  const [detailFor, setDetailFor] = useState<Usulan | null>(null);

  // Wizard state
  const [wizardStep, setWizardStep] = useState<1 | 2>(1);
  const [nomorUsulan, setNomorUsulan] = useState("");
  const [tanggalUsulan, setTanggalUsulan] = useState(today());
  const [dokumenName, setDokumenName] = useState("");
  const [keterangan, setKeterangan] = useState("");
  const [entries, setEntries] = useState<Array<{ subKegiatanId: string; anggaran: string }>>([
    { subKegiatanId: "", anggaran: "" },
  ]);

  const jadwalAktif = jadwalList.find((j) => j.aktif) || null;

  const totalAnggaran = useMemo(
    () => entries.reduce((sum, e) => sum + parseNominal(e.anggaran), 0),
    [entries]
  );

  const rows = useMemo(() =>
    usulanList.filter((u) => {
      const matchStatus = filter === "all" || u.status === filter;
      const matchJenis = filterJenis === "all" || u.jenis === filterJenis;
      return matchStatus && matchJenis;
    }),
    [usulanList, filter, filterJenis]
  );

  function openInput() {
    setWizardStep(1);
    setNomorUsulan("");
    setTanggalUsulan(today());
    setDokumenName("");
    setKeterangan("");
    setEntries([{ subKegiatanId: "", anggaran: "" }]);
    setInputOpen(true);
  }

  function goToStep2() {
    if (!nomorUsulan.trim()) {
      toast("Isi Nomor Usulan SKPD terlebih dahulu", "err");
      return;
    }
    setWizardStep(2);
  }

  function updateEntry(idx: number, field: "subKegiatanId" | "anggaran", value: string) {
    setEntries((prev) => prev.map((e, i) => (i === idx ? { ...e, [field]: value } : e)));
  }

  function addEntry() {
    setEntries((prev) => [...prev, { subKegiatanId: "", anggaran: "" }]);
  }

  function removeEntry(idx: number) {
    setEntries((prev) => prev.filter((_, i) => i !== idx));
  }

  function build(status: StatusKey) {
    if (!jadwalAktif) {
      toast("Tidak ada jadwal usulan aktif. Hubungi admin untuk mengaktifkan jadwal.", "err");
      return;
    }

    const validEntries = entries.filter(
      (e) => e.subKegiatanId && parseNominal(e.anggaran) > 0
    );
    if (validEntries.length === 0) {
      toast("Tambahkan minimal satu sub kegiatan dengan anggaran", "err");
      return;
    }

    const newItem: Usulan = {
      id: "USL-" + jadwalAktif.tahun + "-" + String(usulanList.length + 1).padStart(3, "0"),
      nomorUsulan: nomorUsulan.trim(),
      skpd: currentSkpd.nama,
      tanggal: tanggalUsulan,
      tahap: jadwalAktif.tahap,
      ket: keterangan.trim(),
      nilai: validEntries.reduce((sum, e) => sum + parseNominal(e.anggaran), 0),
      status,
      dokumen: dokumenName || "dokumen-usulan-baru.pdf",
      subKegiatanEntries: validEntries.map((e) => ({
        subKegiatanId: e.subKegiatanId,
        anggaran: parseNominal(e.anggaran),
      })),
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
            const usulanDiajukan = usulanList.filter((u) => u.status !== "draft");
            if (usulanDiajukan.length === 0) {
              toast("Tidak ada usulan yang bisa di-export", "err");
              return;
            }
            const header = "ID,Nomor Usulan,SKPD,Tanggal,Tahap,Nilai,Status,Jenis\n";
            const csvRows = usulanDiajukan.map((u) =>
              `"${u.id}","${u.nomorUsulan || ""}","${u.skpd}","${u.tanggal}","${u.tahap}",${u.nilai},"${u.status}","${u.jenis || ""}"`
            ).join("\n");
            const blob = new Blob([header + csvRows], { type: "text/csv" });
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
                      {u.ket || u.nomorUsulan || "-"}
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

      {/* Input Usulan - 2 Step Wizard */}
      <Modal open={inputOpen} onClose={() => setInputOpen(false)} width="wide">
        <DialogHead
          title="Input Usulan Anggaran"
          desc={wizardStep === 1
            ? "Langkah 1 dari 2: Isi data usulan dan unggah dokumen."
            : "Langkah 2 dari 2: Isi rincian anggaran per sub kegiatan."
          }
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
                        {jadwalAktif.buka.replace(" ", ", ")}
                      </div>
                    </div>
                    <div>
                      <label className="text-xs text-muted-fg">Tutup Usulan</label>
                      <div className="text-sm font-medium">
                        {jadwalAktif.tutup.replace(" ", ", ")}
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

            {/* Step indicator */}
            <div className="flex items-center gap-2 text-xs text-muted-fg">
              <span className={`font-semibold ${wizardStep === 1 ? "text-primary" : ""}`}>
                1. Data Usulan
              </span>
              <span>→</span>
              <span className={`font-semibold ${wizardStep === 2 ? "text-primary" : ""}`}>
                2. Sub Kegiatan & Anggaran
              </span>
            </div>

            {/* Step 1: Data Usulan */}
            {wizardStep === 1 && (
              <>
                <div>
                  <label>Nomor Usulan SKPD</label>
                  <input
                    value={nomorUsulan}
                    onChange={(e) => setNomorUsulan(e.target.value)}
                    placeholder="Contoh: USL/DIK/2026/001"
                  />
                </div>
                <div>
                  <label>Tanggal Usulan</label>
                  <input
                    type="date"
                    value={tanggalUsulan}
                    onChange={(e) => setTanggalUsulan(e.target.value)}
                  />
                </div>
                <div>
                  <label>Unggah Dokumen (PDF)</label>
                  <label className="flex cursor-pointer items-center gap-3 rounded-[9px] border-[1.5px] border-dashed border-input px-4 py-5 text-sm text-muted-fg hover:bg-muted/50">
                    <Upload className="h-5 w-5" />
                    <span>{dokumenName || "Klik untuk memilih berkas PDF, atau seret ke sini"}</span>
                    <input
                      type="file"
                      accept="application/pdf"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) setDokumenName(f.name);
                      }}
                    />
                  </label>
                </div>
                <div>
                  <label>Keterangan Usulan</label>
                  <textarea
                    rows={3}
                    value={keterangan}
                    onChange={(e) => setKeterangan(e.target.value)}
                    placeholder="Jelaskan detail usulan anggaran..."
                  />
                </div>
              </>
            )}

            {/* Step 2: Sub Kegiatan & Anggaran */}
            {wizardStep === 2 && (
              <>
                {entries.map((entry, idx) => (
                  <div key={idx} className="rounded-lg border border-border bg-card p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold">Sub Kegiatan #{idx + 1}</span>
                      {entries.length > 1 && (
                        <button
                          onClick={() => removeEntry(idx)}
                          className="inline-flex items-center gap-1 text-xs text-muted-fg hover:text-danger"
                        >
                          <Minus className="h-3.5 w-3.5" />
                          Hapus
                        </button>
                      )}
                    </div>
                    <div>
                      <label>Sub Kegiatan</label>
                      <select
                        value={entry.subKegiatanId}
                        onChange={(e) => updateEntry(idx, "subKegiatanId", e.target.value)}
                      >
                        <option value="" disabled>
                          Pilih sub kegiatan…
                        </option>
                        {SUB_KEGIATAN.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.kode ? s.kode + " - " : ""}{s.nama}
                          </option>
                        ))}
                      </select>
                      {entry.subKegiatanId && (
                        <p className="mt-1 text-xs text-muted-fg">
                          {SUB_KEGIATAN.find((s) => s.id === entry.subKegiatanId)?.deskripsi}
                        </p>
                      )}
                    </div>
                    <div>
                      <label>Anggaran (Rp)</label>
                      <input
                        inputMode="numeric"
                        placeholder="0"
                        value={entry.anggaran}
                        onChange={(e) => updateEntry(idx, "anggaran", e.target.value)}
                      />
                    </div>
                  </div>
                ))}

                <button
                  onClick={addEntry}
                  className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-primary/30 bg-primary/5 py-3 text-sm font-semibold text-primary hover:bg-primary/10"
                >
                  <Plus className="h-4 w-4" />
                  Tambah Sub Kegiatan
                </button>

                <div className="rounded-lg border border-border bg-card p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold">Total Anggaran</span>
                    <span className="text-lg font-bold text-primary">{rupiah(totalAnggaran)}</span>
                  </div>
                </div>
              </>
            )}
          </div>
        </DialogBody>
        <DialogFoot>
          {wizardStep === 2 && (
            <Button variant="outline" onClick={() => setWizardStep(1)}>
              Sebelumnya
            </Button>
          )}
          {wizardStep === 1 && (
            <Button variant="primary" onClick={goToStep2}>
              Selanjutnya
            </Button>
          )}
          {wizardStep === 2 && (
            <>
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
            </>
          )}
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

                {/* Sub Kegiatan Entries */}
                {detailFor.subKegiatanEntries && detailFor.subKegiatanEntries.length > 0 && (
                  <div className="rounded-lg border border-border bg-card p-4">
                    <div className="flex items-center gap-[11px] mb-3">
                      <span className="grid h-[34px] w-[34px] place-items-center rounded-lg bg-muted text-muted-fg">
                        <ClipboardList className="h-4 w-4" />
                      </span>
                      <div>
                        <div className="text-[10.5px] font-semibold uppercase tracking-[0.05em] text-muted-fg">
                          Rincian Sub Kegiatan
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      {detailFor.subKegiatanEntries.map((entry, idx) => {
                        const sk = SUB_KEGIATAN.find((s) => s.id === entry.subKegiatanId);
                        const entryStatus = entry.status;
                        const isRejected = entryStatus === "rejected";
                        const isAdjusted = entryStatus === "adjusted";
                        const isApproved = entryStatus === "approved";
                        return (
                          <div
                            key={idx}
                            className={`rounded-lg border px-3 py-2 ${
                              isRejected
                                ? "border-red-200 bg-red-50"
                                : isApproved
                                ? "border-emerald-200 bg-emerald-50"
                                : isAdjusted
                                ? "border-amber-200 bg-amber-50"
                                : "border-border bg-muted/50"
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="text-sm font-medium">
                                  {sk?.nama || `ID: ${entry.subKegiatanId}`}
                                </div>
                                {sk?.kode && (
                                  <div className="text-xs text-muted-fg">{sk.kode}</div>
                                )}
                              </div>
                              <div className="text-right">
                                <div className="text-sm font-semibold">{rupiah(entry.anggaran)}</div>
                                {isRejected && (
                                  <span className="inline-block mt-0.5 rounded-full border border-red-200 bg-red-100 px-2 py-0.5 text-[10px] font-semibold text-red-700">
                                    Ditolak
                                  </span>
                                )}
                                {isApproved && (
                                  <span className="inline-block mt-0.5 rounded-full border border-emerald-200 bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                                    Disetujui
                                  </span>
                                )}
                                {isAdjusted && (
                                  <span className="inline-block mt-0.5 rounded-full border border-amber-200 bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
                                    Disesuaikan
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                      <div className="flex items-center justify-between border-t border-border pt-2 mt-2">
                        <span className="text-sm font-semibold">Total</span>
                        <span className="text-sm font-bold text-primary">{rupiah(detailFor.nilai)}</span>
                      </div>
                    </div>
                  </div>
                )}

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

                {/* Nominal Final & Catatan Persetujuan */}
                {(detailFor.status === "disetujui" || detailFor.status === "ditolak") && detailFor.nominalFinal !== undefined && (
                  <div className={`rounded-lg border p-4 ${detailFor.status === "disetujui" ? "border-emerald-200 bg-emerald-50" : "border-red-200 bg-red-50"}`}>
                    <h3 className={`text-sm font-semibold mb-2 ${detailFor.status === "disetujui" ? "text-emerald-800" : "text-red-800"}`}>
                      Keputusan {detailFor.jenis}
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <div className={`text-xs font-medium ${detailFor.status === "disetujui" ? "text-emerald-700" : "text-red-700"}`}>Nominal Final</div>
                        <div className={`text-lg font-bold ${detailFor.status === "disetujui" ? "text-emerald-900" : "text-red-900"}`}>
                          {rupiah(detailFor.nominalFinal)}
                        </div>
                      </div>
                      <div>
                        <div className={`text-xs font-medium ${detailFor.status === "disetujui" ? "text-emerald-700" : "text-red-700"}`}>Tanggal Persetujuan</div>
                        <div className={`text-sm font-semibold ${detailFor.status === "disetujui" ? "text-emerald-900" : "text-red-900"}`}>
                          {detailFor.tglPersetujuan || "—"}
                        </div>
                      </div>
                    </div>
                    {detailFor.catatanPersetujuan && (
                      <div className="mt-3 pt-3 border-t border-emerald-200">
                        <div className={`text-xs font-medium mb-1 ${detailFor.status === "disetujui" ? "text-emerald-700" : "text-red-700"}`}>Catatan Persetujuan</div>
                        <div className={`text-sm rounded-md px-3 py-2 ${detailFor.status === "disetujui" ? "text-emerald-900 bg-emerald-100/70" : "text-red-900 bg-red-100/70"}`}>
                          {detailFor.catatanPersetujuan}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Riwayat Lengkap Proses */}
                <div className="rounded-lg border border-border bg-card p-4">
                  <h3 className="text-sm font-semibold mb-3">Riwayat Proses</h3>
                  <div className="space-y-3">
                    {/* Step 1: Pengajuan */}
                    <div className="flex items-center gap-3">
                      <span className="grid h-8 w-8 place-items-center rounded-full bg-blue-100 text-blue-700">
                        <CheckCircle2 className="h-4 w-4" />
                      </span>
                      <div className="flex-1">
                        <div className="text-xs text-muted-fg">Diajukan oleh SKPD</div>
                        <div className="text-sm font-medium">{detailFor.tanggal}</div>
                        {detailFor.ket && (
                          <div className="text-xs text-muted-fg mt-0.5">{detailFor.ket}</div>
                        )}
                      </div>
                    </div>

                    {/* Step 2: Verifikasi */}
                    {detailFor.tglVerifikasi && (
                      <div className="flex items-center gap-3">
                        <span className="grid h-8 w-8 place-items-center rounded-full bg-amber-100 text-amber-700">
                          <CheckCircle2 className="h-4 w-4" />
                        </span>
                        <div className="flex-1">
                          <div className="text-xs text-muted-fg">
                            {detailFor.status === "revisi"
                              ? "Dikembalikan untuk revisi oleh Verifikator"
                              : "Diverifikasi oleh Verifikator BPKAD"}
                          </div>
                          <div className="text-sm font-medium">{detailFor.tglVerifikasi}</div>
                          {detailFor.catatan && (
                            <div className="text-xs text-muted-fg mt-0.5">Catatan: {detailFor.catatan}</div>
                          )}
                          {detailFor.jenis && detailFor.status !== "revisi" && (
                            <div className="text-xs text-muted-fg mt-0.5">Diteruskan ke {detailFor.jenis}</div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Step 3: Persetujuan */}
                    {detailFor.tglPersetujuan && (
                      <div className="flex items-center gap-3">
                        <span className={`grid h-8 w-8 place-items-center rounded-full ${
                          detailFor.status === "disetujui"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-red-100 text-red-700"
                        }`}>
                          <CheckCircle2 className="h-4 w-4" />
                        </span>
                        <div className="flex-1">
                          <div className="text-xs text-muted-fg">
                            {detailFor.status === "disetujui"
                              ? `Disetujui oleh ${detailFor.jenis}`
                              : `Ditolak oleh ${detailFor.jenis}`}
                          </div>
                          <div className="text-sm font-medium">{detailFor.tglPersetujuan}</div>
                          {detailFor.nominalFinal !== undefined && detailFor.status === "disetujui" && (
                            <div className="text-xs text-muted-fg mt-0.5">
                              Nominal Final: {rupiah(detailFor.nominalFinal)}
                            </div>
                          )}
                          {detailFor.catatanPersetujuan && (
                            <div className="text-xs text-muted-fg mt-0.5">Catatan: {detailFor.catatanPersetujuan}</div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </DialogBody>
            <DialogFoot between>
              <Button variant="outline" onClick={() => setDetailFor(null)}>
                Tutup
              </Button>
              <Button
                variant="primary"
                onClick={() => {
                  const entriesText = detailFor.subKegiatanEntries?.map((e, i) => {
                    const sk = SUB_KEGIATAN.find((s) => s.id === e.subKegiatanId);
                    return `  ${i + 1}. ${sk?.nama || e.subKegiatanId}: ${rupiah(e.anggaran)}`;
                  }).join("\n") || "  -";
                  const content = `DETAIL USULAN ANGGARAN\n` +
                    `========================\n\n` +
                    `ID Usulan: ${detailFor.id}\n` +
                    `Nomor Usulan: ${detailFor.nomorUsulan || "-"}\n` +
                    `SKPD: ${detailFor.skpd}\n` +
                    `Tanggal: ${detailFor.tanggal}\n` +
                    `Tahap: ${detailFor.tahap}\n\n` +
                    `Rincian Anggaran:\n${entriesText}\n\n` +
                    `Total: ${rupiah(detailFor.nilai)}\n` +
                    `Dokumen: ${detailFor.dokumen || "-"}\n` +
                    `Status: ${detailFor.status}\n\n` +
                    `Jenis Persetujuan: ${detailFor.jenis || "-"}\n` +
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
