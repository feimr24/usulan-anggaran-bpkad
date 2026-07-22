"use client"

import { useMemo, useState } from "react"
import "remixicon/fonts/remixicon.css"
import { useApp } from "@/context/app-context"
import { STATUS, SUB_KEGIATAN } from "@/lib/constants"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { EmptyState } from "@/components/shared/empty-state"
import DetailHighlight from "@/components/shared/detail-highlight"
import { rupiah, today, parseNominal } from "@/lib/utils"
import { StatusKey } from "@/types"
import { Usulan } from "@/types/models"

const FILTERS: [string, string][] = [
  ["all", "Semua"],
  ["draft", "Draft"],
  ["diajukan", "Diajukan"],
  ["verifikasi", "Menunggu Verifikasi"],
  ["tapd", "Menunggu TAPD"],
  ["disetujui", "Disetujui"],
  ["ditolak", "Ditolak"],
  ["revisi", "Revisi"],
]

function StatusBadge({ status }: { status: string }) {
  const s = STATUS[status as keyof typeof STATUS]
  return (
    <span
      className={`inline-flex h-5 w-fit items-center rounded-full border px-2 py-0.5 text-xs font-medium ${s?.className ?? ""}`}
    >
      {s?.label ?? status}
    </span>
  )
}

export default function MonitorStatus() {
  const { usulanList, setUsulanList, jadwalList, currentSkpd, toast } = useApp()
  const [filter, setFilter] = useState("all")
  const [filterJenis, setFilterJenis] = useState("all")
  const [inputOpen, setInputOpen] = useState(false)
  const [detailFor, setDetailFor] = useState<Usulan | null>(null)

  // Wizard state
  const [wizardStep, setWizardStep] = useState<1 | 2>(1)
  const [nomorUsulan, setNomorUsulan] = useState("")
  const [tanggalUsulan, setTanggalUsulan] = useState(today())
  const [dokumenName, setDokumenName] = useState("")
  const [keterangan, setKeterangan] = useState("")
  const [entries, setEntries] = useState<
    Array<{ subKegiatanId: string; anggaran: string }>
  >([{ subKegiatanId: "", anggaran: "" }])

  const jadwalAktif = jadwalList.find((j) => j.aktif) || null

  const totalAnggaran = useMemo(
    () => entries.reduce((sum, e) => sum + parseNominal(e.anggaran), 0),
    [entries]
  )

  const rows = useMemo(
    () =>
      usulanList.filter((u) => {
        const matchStatus = filter === "all" || u.status === filter
        const matchJenis = filterJenis === "all" || u.jenis === filterJenis
        return matchStatus && matchJenis
      }),
    [usulanList, filter, filterJenis]
  )

  function openInput() {
    setWizardStep(1)
    setNomorUsulan("")
    setTanggalUsulan(today())
    setDokumenName("")
    setKeterangan("")
    setEntries([{ subKegiatanId: "", anggaran: "" }])
    setInputOpen(true)
  }

  function goToStep2() {
    if (!nomorUsulan.trim()) {
      toast("Isi Nomor Usulan SKPD terlebih dahulu", "err")
      return
    }
    setWizardStep(2)
  }

  function updateEntry(
    idx: number,
    field: "subKegiatanId" | "anggaran",
    value: string
  ) {
    setEntries((prev) =>
      prev.map((e, i) => (i === idx ? { ...e, [field]: value } : e))
    )
  }

  function addEntry() {
    setEntries((prev) => [...prev, { subKegiatanId: "", anggaran: "" }])
  }

  function removeEntry(idx: number) {
    setEntries((prev) => prev.filter((_, i) => i !== idx))
  }

  function build(status: StatusKey) {
    if (!jadwalAktif) {
      toast(
        "Tidak ada jadwal usulan aktif. Hubungi admin untuk mengaktifkan jadwal.",
        "err"
      )
      return
    }

    const validEntries = entries.filter((e) => e.subKegiatanId)
    if (validEntries.length === 0) {
      toast("Tambahkan minimal satu sub kegiatan", "err")
      return
    }

    const newItem: Usulan = {
      id:
        "USL-" +
        jadwalAktif.tahun +
        "-" +
        String(usulanList.length + 1).padStart(3, "0"),
      nomorUsulan: nomorUsulan.trim(),
      skpd: currentSkpd.nama,
      tanggal: tanggalUsulan,
      tahap: jadwalAktif.tahap,
      ket: keterangan.trim(),
      nilai: validEntries.reduce(
        (sum, e) => sum + parseNominal(e.anggaran),
        0
      ),
      status,
      dokumen: dokumenName || "dokumen-usulan-baru.pdf",
      subKegiatanEntries: validEntries.map((e) => ({
        subKegiatanId: e.subKegiatanId,
        anggaran: parseNominal(e.anggaran),
      })),
    }
    setUsulanList((list) => [newItem, ...list])
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-medium tracking-tight">
            Monitor Status
          </h1>
          <p className="mt-1 text-sm text-muted-fg">
            Pantau posisi tiap usulan dan buat usulan baru. Gunakan tab untuk
            memfilter berdasarkan status pengajuan.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => {
              const usulanDiajukan = usulanList.filter(
                (u) => u.status !== "draft"
              )
              if (usulanDiajukan.length === 0) {
                toast("Tidak ada usulan yang bisa di-export", "err")
                return
              }
              const header =
                "ID,Nomor Usulan,SKPD,Tanggal,Tahap,Dokumen,Jenis,Diusulkan,Disetujui,Status\n"
              const csvRows = usulanDiajukan
                .map(
                  (u) =>
                    `"${u.id}","${u.nomorUsulan || ""}","${u.skpd}","${u.tanggal}","${u.tahap}","${u.dokumen || ""}","${u.jenis || ""}",${u.nilai},${u.nominalFinal ?? ""},"${u.status}"`
                )
                .join("\n")
              const blob = new Blob([header + csvRows], { type: "text/csv" })
              const url = URL.createObjectURL(blob)
              const a = document.createElement("a")
              a.href = url
              a.download = `usulan-${currentSkpd.nama.replace(/\s+/g, "-")}-${today()}.csv`
              a.click()
              URL.revokeObjectURL(url)
              toast(`${usulanDiajukan.length} usulan berhasil di-export`)
            }}
          >
            <i className="ri-download-line h-[15px] w-[15px]" />
            Export
          </Button>
          <Button variant="default" onClick={openInput}>
            <i className="ri-add-line h-[15px] w-[15px]" />
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
                filter === k
                  ? "bg-card text-fg shadow-sm2"
                  : "bg-transparent text-muted-fg"
              }`}
            >
              {l} (
              {k === "all"
                ? usulanList.length
                : usulanList.filter((u) => u.status === k).length}
              )
            </button>
          ))}
        </div>
        <div className="flex-1" />
        <select
          value={filterJenis}
          onChange={(e) => setFilterJenis(e.target.value)}
          className="h-[38px] w-auto min-w-[180px] rounded-lg border border-input bg-card px-3 py-2 text-sm"
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
                {[
                  "Tanggal",
                  "Tahap",
                  "Dokumen",
                  "Jenis",
                  "Diusulkan",
                  "Disetujui",
                  "Status",
                  "",
                ].map((h, i) => {
                  const align =
                    i === 4 || i === 5
                      ? "text-right"
                      : i === 2 || i === 3 || i === 6
                        ? "text-center"
                        : i === 7
                          ? "text-right"
                          : "text-left"
                  return (
                    <th
                      key={i}
                      className={`border-b border-border px-4 py-[11px] text-xs font-semibold uppercase tracking-[0.04em] text-muted-fg ${align}`}
                    >
                      {i === 7 ? "Aksi" : h}
                    </th>
                  )
                })}
              </tr>
            </thead>
            <tbody>
              {rows.length ? (
                rows.map((u) => (
                  <tr
                    key={u.id}
                    className="border-b border-[hsl(34_16%_92%)] last:border-none hover:bg-[hsl(36_24%_97%)]"
                  >
                    <td className="px-4 py-3 text-sm">{u.tanggal}</td>
                    <td className="px-4 py-3 text-sm text-muted-fg">{u.tahap}</td>
                    <td className="px-4 py-3 text-center">
                      {u.dokumen ? (
                        <button
                          onClick={() => {
                            const blob = new Blob([""], {
                              type: "application/pdf",
                            })
                            const url = URL.createObjectURL(blob)
                            const a = document.createElement("a")
                            a.href = url
                            a.download = u.dokumen!
                            a.click()
                            URL.revokeObjectURL(url)
                          }}
                          className="inline-flex items-center gap-1 text-sm font-medium text-primary underline-offset-2 hover:underline"
                        >
                          <i className="ri-download-line h-3.5 w-3.5" />
                          Dokumen
                        </button>
                      ) : (
                        <span className="text-sm text-muted-fg">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {u.jenis ? (
                        <span className="inline-flex items-center rounded-full border border-fuchsia-200 bg-fuchsia-50 px-[9px] py-[3px] text-xs font-semibold text-fuchsia-800">
                          {u.jenis}
                        </span>
                      ) : (
                        <span className="text-xs text-muted-fg">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right text-sm">
                      {rupiah(u.nilai)}
                    </td>
                    <td className="px-4 py-3 text-right text-sm">
                      {u.nominalFinal !== undefined ? (
                        rupiah(u.nominalFinal)
                      ) : (
                        <span className="text-muted-fg">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <StatusBadge status={u.status} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        className="ml-auto"
                        onClick={() => setDetailFor(u)}
                      >
                        <i className="ri-eye-line h-[15px] w-[15px]" />
                        Detail
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <EmptyState
                  colSpan={8}
                  message="Tidak ada usulan pada status ini."
                />
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Input Usulan - 2 Step Wizard */}
      <Dialog open={inputOpen} onOpenChange={setInputOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Input Usulan Anggaran</DialogTitle>
            <DialogDescription>
              {wizardStep === 1
                ? "Langkah 1 dari 2: Isi data usulan dan unggah dokumen."
                : "Langkah 2 dari 2: Isi rincian anggaran per sub kegiatan."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {/* Jadwal Aktif */}
            <div className="rounded-lg border border-border bg-card p-4">
              <h3 className="mb-2 text-sm font-semibold">Jadwal Usulan Aktif</h3>
              {jadwalAktif ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-muted-fg">
                        Tahun Anggaran
                      </label>
                      <div className="text-sm font-medium">
                        {jadwalAktif.tahun}
                      </div>
                    </div>
                    <div>
                      <label className="text-xs text-muted-fg">Tahap</label>
                      <div className="text-sm font-medium">
                        {jadwalAktif.tahap}
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-muted-fg">
                        Buka Usulan
                      </label>
                      <div className="text-sm font-medium">
                        {jadwalAktif.buka.replace(" ", ", ")}
                      </div>
                    </div>
                    <div>
                      <label className="text-xs text-muted-fg">
                        Tutup Usulan
                      </label>
                      <div className="text-sm font-medium">
                        {jadwalAktif.tutup.replace(" ", ", ")}
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-muted-fg">Status</label>
                    <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
                      Aktif
                    </span>
                  </div>
                </div>
              ) : (
                <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
                  Tidak ada jadwal usulan aktif. Hubungi admin untuk mengaktifkan
                  jadwal.
                </div>
              )}
            </div>

            {/* Step indicator */}
            <div className="flex items-center gap-2 text-xs text-muted-fg">
              <span
                className={`font-semibold ${wizardStep === 1 ? "text-primary" : ""}`}
              >
                1. Data Usulan
              </span>
              <span>&rarr;</span>
              <span
                className={`font-semibold ${wizardStep === 2 ? "text-primary" : ""}`}
              >
                2. Sub Kegiatan &amp; Anggaran
              </span>
            </div>

            {/* Step 1: Data Usulan */}
            {wizardStep === 1 && (
              <>
                <div>
                  <Label>Nomor Usulan SKPD</Label>
                  <Input
                    value={nomorUsulan}
                    onChange={(e) => setNomorUsulan(e.target.value)}
                    placeholder="Contoh: USL/DIK/2026/001"
                  />
                </div>
                <div>
                  <Label>Tanggal Usulan</Label>
                  <Input
                    type="date"
                    value={tanggalUsulan}
                    onChange={(e) => setTanggalUsulan(e.target.value)}
                  />
                </div>
                <div>
                  <Label>Unggah Dokumen (PDF)</Label>
                  <label className="flex cursor-pointer items-center gap-3 rounded-[9px] border-[1.5px] border-dashed border-input px-4 py-5 text-sm text-muted-fg hover:bg-muted/50">
                    <i className="ri-upload-2-line h-5 w-5" />
                    <span>
                      {dokumenName ||
                        "Klik untuk memilih berkas PDF, atau seret ke sini"}
                    </span>
                    <input
                      type="file"
                      accept="application/pdf"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0]
                        if (f) setDokumenName(f.name)
                      }}
                    />
                  </label>
                </div>
                <div>
                  <Label>Keterangan Usulan</Label>
                  <Textarea
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
                  <div
                    key={idx}
                    className="space-y-3 rounded-lg border border-border bg-card p-4"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold">
                        Sub Kegiatan #{idx + 1}
                      </span>
                      {entries.length > 1 && (
                        <button
                          onClick={() => removeEntry(idx)}
                          className="inline-flex items-center gap-1 text-xs text-muted-fg hover:text-danger"
                        >
                          <i className="ri-subtract-line h-3.5 w-3.5" />
                          Hapus
                        </button>
                      )}
                    </div>
                    <div>
                      <Label>Sub Kegiatan</Label>
                      <select
                        value={entry.subKegiatanId}
                        onChange={(e) =>
                          updateEntry(idx, "subKegiatanId", e.target.value)
                        }
                        className="mt-1.5 w-full rounded-lg border border-input bg-card px-3 py-2 text-sm"
                      >
                        <option value="" disabled>
                          Pilih sub kegiatan…
                        </option>
                        {SUB_KEGIATAN.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.kode ? s.kode + " - " : ""}
                            {s.nama}
                          </option>
                        ))}
                      </select>
                      {entry.subKegiatanId && (
                        <p className="mt-1 text-xs text-muted-fg">
                          {
                            SUB_KEGIATAN.find(
                              (s) => s.id === entry.subKegiatanId
                            )?.deskripsi
                          }
                        </p>
                      )}
                    </div>
                    <div>
                      <Label>Anggaran (Rp)</Label>
                      <Input
                        inputMode="numeric"
                        placeholder="0"
                        value={entry.anggaran}
                        onChange={(e) =>
                          updateEntry(idx, "anggaran", e.target.value)
                        }
                      />
                    </div>
                  </div>
                ))}

                <button
                  onClick={addEntry}
                  className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-primary/30 bg-primary/5 py-3 text-sm font-semibold text-primary hover:bg-primary/10"
                >
                  <i className="ri-add-line h-4 w-4" />
                  Tambah Sub Kegiatan
                </button>

                <div className="rounded-lg border border-border bg-card p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold">Total Anggaran</span>
                    <span className="text-lg font-bold text-primary">
                      {rupiah(totalAnggaran)}
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            {wizardStep === 2 && (
              <Button variant="outline" onClick={() => setWizardStep(1)}>
                Sebelumnya
              </Button>
            )}
            {wizardStep === 1 && (
              <Button variant="default" onClick={goToStep2}>
                Selanjutnya
              </Button>
            )}
            {wizardStep === 2 && (
              <>
                <Button
                  variant="outline"
                  onClick={() => {
                    build("draft")
                    setInputOpen(false)
                    toast("Draft usulan disimpan")
                  }}
                >
                  <i className="ri-save-line h-[15px] w-[15px]" />
                  Simpan Draft
                </Button>
                <Button
                  variant="default"
                  onClick={() => {
                    build("diajukan")
                    setInputOpen(false)
                    toast("Usulan diajukan")
                  }}
                >
                  <i className="ri-send-plane-line h-[15px] w-[15px]" />
                  Ajukan Usulan
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Detail dialog */}
      <Dialog open={!!detailFor} onOpenChange={() => setDetailFor(null)}>
        <DialogContent className="sm:max-w-2xl">
          {detailFor && (
            <>
              <DialogHeader>
                <DialogTitle>Detail Usulan</DialogTitle>
                <DialogDescription>
                  Lihat detail usulan, status pengajuan, dan riwayat persetujuan.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <DetailHighlight u={detailFor} />

                {/* Sub Kegiatan Entries */}
                {detailFor.subKegiatanEntries &&
                  detailFor.subKegiatanEntries.length > 0 && (
                    <div className="rounded-lg border border-border bg-card p-4">
                      <div className="mb-3 flex items-center gap-[11px]">
                        <span className="grid h-[34px] w-[34px] place-items-center rounded-lg bg-muted text-muted-fg">
                          <i className="ri-file-list-3-line h-4 w-4" />
                        </span>
                        <div>
                          <div className="text-[10.5px] font-semibold uppercase tracking-[0.05em] text-muted-fg">
                            Rincian Sub Kegiatan
                          </div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        {detailFor.subKegiatanEntries.map((entry, idx) => {
                          const sk = SUB_KEGIATAN.find(
                            (s) => s.id === entry.subKegiatanId
                          )
                          const entryStatus = entry.status
                          const isRejected = entryStatus === "rejected"
                          const isAdjusted = entryStatus === "adjusted"
                          const isApproved = entryStatus === "approved"
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
                                    <div className="text-xs text-muted-fg">
                                      {sk.kode}
                                    </div>
                                  )}
                                </div>
                                <div className="text-right">
                                  <div className="text-sm font-semibold">
                                    {rupiah(entry.anggaran)}
                                  </div>
                                  {isRejected && (
                                    <span className="mt-0.5 inline-block rounded-full border border-red-200 bg-red-100 px-2 py-0.5 text-[10px] font-semibold text-red-700">
                                      Ditolak
                                    </span>
                                  )}
                                  {isApproved && (
                                    <span className="mt-0.5 inline-block rounded-full border border-emerald-200 bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                                      Disetujui
                                    </span>
                                  )}
                                  {isAdjusted && (
                                    <span className="mt-0.5 inline-block rounded-full border border-amber-200 bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
                                      Disesuaikan
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          )
                        })}
                        <div className="flex items-center justify-between border-t border-border pt-2 mt-2">
                          <span className="text-sm font-semibold">Total</span>
                          <span className="text-sm font-bold text-primary">
                            {rupiah(detailFor.nilai)}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                {/* Info Status & Jenis */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-[11px] rounded-[10px] border border-border bg-card px-[13px] py-[11px]">
                    <span className="grid h-[34px] w-[34px] place-items-center rounded-lg bg-muted text-muted-fg">
                      <i className="ri-eye-line h-4 w-4" />
                    </span>
                    <div>
                      <div className="text-[10.5px] font-semibold uppercase tracking-[0.05em] text-muted-fg">
                        Status Pengajuan
                      </div>
                      <div className="mt-px text-sm font-semibold">
                        <StatusBadge status={detailFor.status} />
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-[11px] rounded-[10px] border border-border bg-card px-[13px] py-[11px]">
                    <span className="grid h-[34px] w-[34px] place-items-center rounded-lg bg-muted text-muted-fg">
                      <i className="ri-calendar-line h-4 w-4" />
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
                        ) : (
                          "—"
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Catatan Verifikator */}
                {detailFor.catatan && (
                  <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                    <div className="mb-1 text-xs font-medium text-amber-700">
                      Catatan dari Verifikator
                    </div>
                    <div className="rounded-md bg-amber-100/70 px-3 py-2 text-sm text-amber-900">
                      {detailFor.catatan}
                    </div>
                  </div>
                )}

                {/* Nominal Final & Catatan Persetujuan */}
                {(detailFor.status === "disetujui" ||
                  detailFor.status === "ditolak") &&
                  detailFor.nominalFinal !== undefined && (
                    <div
                      className={`rounded-lg border p-4 ${
                        detailFor.status === "disetujui"
                          ? "border-emerald-200 bg-emerald-50"
                          : "border-red-200 bg-red-50"
                      }`}
                    >
                      <h3
                        className={`text-sm font-semibold mb-2 ${
                          detailFor.status === "disetujui"
                            ? "text-emerald-800"
                            : "text-red-800"
                        }`}
                      >
                        Keputusan {detailFor.jenis}
                      </h3>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <div
                            className={`text-xs font-medium ${
                              detailFor.status === "disetujui"
                                ? "text-emerald-700"
                                : "text-red-700"
                            }`}
                          >
                            Nominal Final
                          </div>
                          <div
                            className={`text-lg font-bold ${
                              detailFor.status === "disetujui"
                                ? "text-emerald-900"
                                : "text-red-900"
                            }`}
                          >
                            {rupiah(detailFor.nominalFinal)}
                          </div>
                        </div>
                        <div>
                          <div
                            className={`text-xs font-medium ${
                              detailFor.status === "disetujui"
                                ? "text-emerald-700"
                                : "text-red-700"
                            }`}
                          >
                            Tanggal Persetujuan
                          </div>
                          <div
                            className={`text-sm font-semibold ${
                              detailFor.status === "disetujui"
                                ? "text-emerald-900"
                                : "text-red-900"
                            }`}
                          >
                            {detailFor.tglPersetujuan || "—"}
                          </div>
                        </div>
                      </div>
                      {detailFor.catatanPersetujuan && (
                        <div
                          className={`mt-3 border-t pt-3 ${
                            detailFor.status === "disetujui"
                              ? "border-emerald-200"
                              : "border-red-200"
                          }`}
                        >
                          <div
                            className={`mb-1 text-xs font-medium ${
                              detailFor.status === "disetujui"
                                ? "text-emerald-700"
                                : "text-red-700"
                            }`}
                          >
                            Catatan Persetujuan
                          </div>
                          <div
                            className={`rounded-md px-3 py-2 text-sm ${
                              detailFor.status === "disetujui"
                                ? "bg-emerald-100/70 text-emerald-900"
                                : "bg-red-100/70 text-red-900"
                            }`}
                          >
                            {detailFor.catatanPersetujuan}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                {/* Riwayat Lengkap Proses */}
                <div className="rounded-lg border border-border bg-card p-4">
                  <h3 className="mb-3 text-sm font-semibold">Riwayat Proses</h3>
                  <div className="space-y-3">
                    {/* Step 1: Pengajuan */}
                    <div className="flex items-center gap-3">
                      <span className="grid h-8 w-8 place-items-center rounded-full bg-blue-100 text-blue-700">
                        <i className="ri-checkbox-circle-line h-4 w-4" />
                      </span>
                      <div className="flex-1">
                        <div className="text-xs text-muted-fg">
                          Diajukan oleh SKPD
                        </div>
                        <div className="text-sm font-medium">
                          {detailFor.tanggal}
                        </div>
                        {detailFor.ket && (
                          <div className="mt-0.5 text-xs text-muted-fg">
                            {detailFor.ket}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Step 2: Verifikasi */}
                    {detailFor.tglVerifikasi && (
                      <div className="flex items-center gap-3">
                        <span className="grid h-8 w-8 place-items-center rounded-full bg-amber-100 text-amber-700">
                          <i className="ri-checkbox-circle-line h-4 w-4" />
                        </span>
                        <div className="flex-1">
                          <div className="text-xs text-muted-fg">
                            {detailFor.status === "revisi"
                              ? "Dikembalikan untuk revisi oleh Verifikator"
                              : "Diverifikasi oleh Verifikator BPKAD"}
                          </div>
                          <div className="text-sm font-medium">
                            {detailFor.tglVerifikasi}
                          </div>
                          {detailFor.catatan && (
                            <div className="mt-0.5 text-xs text-muted-fg">
                              Catatan: {detailFor.catatan}
                            </div>
                          )}
                          {detailFor.jenis &&
                            detailFor.status !== "revisi" && (
                              <div className="mt-0.5 text-xs text-muted-fg">
                                Diteruskan ke {detailFor.jenis}
                              </div>
                            )}
                        </div>
                      </div>
                    )}

                    {/* Step 3: Persetujuan */}
                    {detailFor.tglPersetujuan && (
                      <div className="flex items-center gap-3">
                        <span
                          className={`grid h-8 w-8 place-items-center rounded-full ${
                            detailFor.status === "disetujui"
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          <i className="ri-checkbox-circle-line h-4 w-4" />
                        </span>
                        <div className="flex-1">
                          <div className="text-xs text-muted-fg">
                            {detailFor.status === "disetujui"
                              ? `Disetujui oleh ${detailFor.jenis}`
                              : `Ditolak oleh ${detailFor.jenis}`}
                          </div>
                          <div className="text-sm font-medium">
                            {detailFor.tglPersetujuan}
                          </div>
                          {detailFor.nominalFinal !== undefined &&
                            detailFor.status === "disetujui" && (
                              <div className="mt-0.5 text-xs text-muted-fg">
                                Nominal Final:{" "}
                                {rupiah(detailFor.nominalFinal)}
                              </div>
                            )}
                          {detailFor.catatanPersetujuan && (
                            <div className="mt-0.5 text-xs text-muted-fg">
                              Catatan: {detailFor.catatanPersetujuan}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <DialogFooter className="flex !flex-row !justify-between">
                <Button
                  variant="outline"
                  onClick={() => setDetailFor(null)}
                >
                  Tutup
                </Button>
                <Button
                  variant="default"
                  onClick={() => {
                    const entriesText =
                      detailFor.subKegiatanEntries
                        ?.map((e, i) => {
                          const sk = SUB_KEGIATAN.find(
                            (s) => s.id === e.subKegiatanId
                          )
                          return `  ${i + 1}. ${sk?.nama || e.subKegiatanId}: ${rupiah(e.anggaran)}`
                        })
                        .join("\n") || "  -"
                    const content =
                      `DETAIL USULAN ANGGARAN\n` +
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
                      `Tanggal Verifikasi: ${detailFor.tglVerifikasi || "-"}\n`
                    const blob = new Blob([content], { type: "text/plain" })
                    const url = URL.createObjectURL(blob)
                    const a = document.createElement("a")
                    a.href = url
                    a.download = `usulan-${detailFor.id}.txt`
                    a.click()
                    URL.revokeObjectURL(url)
                    toast("Detail usulan berhasil di-export")
                  }}
                >
                  <i className="ri-download-line h-[15px] w-[15px]" />
                  Export
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
