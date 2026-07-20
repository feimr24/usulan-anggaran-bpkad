"use client";

import { useMemo, useState } from "react";
import { Eye, XCircle, CheckCircle2, Minus, ClipboardList, Check, X } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { Badge, Button, Card, EmptyState, SectionHead } from "@/components/ui";
import Modal, { DialogBody, DialogFoot, DialogHead } from "@/components/Modal";
import DetailHighlight from "@/components/DetailHighlight";
import { rupiah, today, parseNominal } from "@/lib/format";
import { SUB_KEGIATAN } from "@/lib/data";
import { JenisPersetujuan, Usulan, SubKegiatanEntry } from "@/lib/types";

type EntryStatus = "pending" | "approved" | "rejected" | "adjusted";

interface AdjustedEntry {
  subKegiatanId: string;
  anggaran: number;
  adjustedAnggaran: string;
  status: EntryStatus;
}

export default function Persetujuan({ jenis }: { jenis: JenisPersetujuan }) {
  const { usulanList, setUsulanList, toast } = useApp();
  const [tab, setTab] = useState<"masuk" | "disetujui" | "ditolak">("masuk");
  const [detailFor, setDetailFor] = useState<Usulan | null>(null);
  const [wizardStep, setWizardStep] = useState<1 | 2 | 3>(1);
  const [tglPersetujuan, setTglPersetujuan] = useState(today());
  const [catatanPersetujuan, setCatatanPersetujuan] = useState("");
  const [adjustedEntries, setAdjustedEntries] = useState<AdjustedEntry[]>([]);

  const set = useMemo(() => usulanList.filter((u) => u.jenis === jenis), [usulanList, jenis]);
  const masuk = set.filter((u) => u.status === "tapd");
  const dis = set.filter((u) => u.status === "disetujui");
  const tol = set.filter((u) => u.status === "ditolak");

  const shownList = tab === "disetujui" ? dis : tol;

  const totalAnggaran = useMemo(
    () => adjustedEntries.reduce((sum, e) => {
      if (e.status === "rejected") return sum;
      return sum + (e.status === "adjusted" ? parseNominal(e.adjustedAnggaran) : e.anggaran);
    }, 0),
    [adjustedEntries]
  );

  function openDetail(u: Usulan) {
    setDetailFor(u);
    setWizardStep(1);
    setTglPersetujuan(today());
    setCatatanPersetujuan("");
    setAdjustedEntries(
      (u.subKegiatanEntries || []).map((e) => ({
        subKegiatanId: e.subKegiatanId,
        anggaran: e.anggaran,
        adjustedAnggaran: String(e.anggaran),
        status: (e.status || "pending") as EntryStatus,
      }))
    );
  }

  function approveEntry(idx: number) {
    setAdjustedEntries((prev) =>
      prev.map((e, i) => (i === idx ? { ...e, status: "approved" as EntryStatus } : e))
    );
  }

  function rejectEntry(idx: number) {
    setAdjustedEntries((prev) =>
      prev.map((e, i) => (i === idx ? { ...e, status: "rejected" as EntryStatus } : e))
    );
  }

  function adjustEntry(idx: number, value: string) {
    setAdjustedEntries((prev) =>
      prev.map((e, i) =>
        i === idx
          ? { ...e, adjustedAnggaran: value, status: "adjusted" as EntryStatus }
          : e
      )
    );
  }

  function resetEntry(idx: number) {
    setAdjustedEntries((prev) =>
      prev.map((e, i) =>
        i === idx
          ? { ...e, adjustedAnggaran: String(e.anggaran), status: "pending" as EntryStatus }
          : e
      )
    );
  }

  function editDecidedEntry(idx: number) {
    setAdjustedEntries((prev) =>
      prev.map((e, i) =>
        i === idx
          ? { ...e, adjustedAnggaran: String(e.anggaran), status: "pending" as EntryStatus }
          : e
      )
    );
  }

  function tolak() {
    if (!detailFor) return;
    setUsulanList((list) =>
      list.map((x) => x.id === detailFor.id ? {
        ...x,
        status: "ditolak",
        catatanPersetujuan: catatanPersetujuan.trim() || undefined,
        tglPersetujuan,
      } : x)
    );
    setDetailFor(null);
    toast("Usulan ditolak", "err");
  }

  function setuju() {
    if (!detailFor) return;
    // Keep ALL entries with their status (approved, adjusted, rejected)
    const finalEntries: SubKegiatanEntry[] = adjustedEntries.map((e) => ({
      subKegiatanId: e.subKegiatanId,
      anggaran: e.status === "rejected" ? 0 : e.status === "adjusted" ? parseNominal(e.adjustedAnggaran) : e.anggaran,
      status: e.status as "approved" | "rejected" | "adjusted",
    }));
    const finalNilai = finalEntries
      .filter((e) => e.status !== "rejected")
      .reduce((sum, e) => sum + e.anggaran, 0);
    setUsulanList((list) =>
      list.map((x) => x.id === detailFor.id ? {
        ...x,
        status: "disetujui",
        nominalFinal: finalNilai,
        subKegiatanEntries: finalEntries,
        catatanPersetujuan: catatanPersetujuan.trim() || undefined,
        tglPersetujuan,
      } : x)
    );
    setDetailFor(null);
    toast("Usulan disetujui");
  }

  return (
    <div>
      <SectionHead
        title={`Persetujuan ${jenis}`}
        desc={`Menampilkan seluruh usulan berjenis persetujuan ${jenis}. Buka detail usulan, lalu setujui atau tolak.`}
      />
      <div className="mb-4 inline-flex flex-wrap gap-1 rounded-lg bg-muted p-1">
        <button
          onClick={() => setTab("masuk")}
          className={`rounded-md border-none px-3.5 py-[7px] text-sm font-medium ${
            tab === "masuk" ? "bg-card text-fg shadow-sm2" : "bg-transparent text-muted-fg"
          }`}
        >
          Usulan Masuk ({masuk.length})
        </button>
        <button
          onClick={() => setTab("disetujui")}
          className={`rounded-md border-none px-3.5 py-[7px] text-sm font-medium ${
            tab === "disetujui" ? "bg-card text-fg shadow-sm2" : "bg-transparent text-muted-fg"
          }`}
        >
          Disetujui ({dis.length})
        </button>
        <button
          onClick={() => setTab("ditolak")}
          className={`rounded-md border-none px-3.5 py-[7px] text-sm font-medium ${
            tab === "ditolak" ? "bg-card text-fg shadow-sm2" : "bg-transparent text-muted-fg"
          }`}
        >
          Ditolak ({tol.length})
        </button>
      </div>

      {tab === "masuk" ? (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  {["ID", "SKPD", "Tahap", "Diusulkan", "Aksi"].map((h, i) => (
                    <th
                      key={i}
                      className={`border-b border-border px-4 py-[11px] text-left text-xs font-semibold uppercase tracking-[0.04em] text-muted-fg ${
                        i >= 3 ? "text-right" : ""
                      }`}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {masuk.length ? (
                  masuk.map((u) => (
                    <tr key={u.id} className="border-b border-[hsl(34_16%_92%)] last:border-none hover:bg-[hsl(36_24%_97%)]">
                      <td className="mono px-4 py-3 text-sm text-muted-fg">{u.id}</td>
                      <td className="px-4 py-3 text-sm">{u.skpd}</td>
                      <td className="px-4 py-3 text-sm text-muted-fg">{u.tahap}</td>
                      <td className="px-4 py-3 text-right text-sm">{rupiah(u.nilai)}</td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => openDetail(u)}
                          className="ml-auto inline-flex h-[34px] items-center gap-1.5 rounded-[7px] border border-input bg-card px-[11px] text-sm font-semibold hover:bg-muted"
                        >
                          <Eye className="h-[15px] w-[15px]" />
                          Lihat Usulan
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <EmptyState colSpan={5} message="Tidak ada usulan menunggu keputusan." />
                )}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  {["ID", "SKPD", "Diusulkan", "Status"].map((h, i) => (
                    <th
                      key={i}
                      className={`border-b border-border px-4 py-[11px] text-left text-xs font-semibold uppercase tracking-[0.04em] text-muted-fg ${
                        i === 2 ? "text-right" : ""
                      }`}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {shownList.map((u) => (
                  <tr key={u.id} className="border-b border-[hsl(34_16%_92%)] last:border-none hover:bg-[hsl(36_24%_97%)]">
                    <td className="mono px-4 py-3 text-sm text-muted-fg">{u.id}</td>
                    <td className="px-4 py-3 text-sm">{u.skpd}</td>
                    <td className="px-4 py-3 text-right text-sm">{rupiah(u.nilai)}</td>
                    <td className="px-4 py-3">
                      <Badge status={u.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Detail - 3 Step Wizard */}
      <Modal open={!!detailFor} onClose={() => setDetailFor(null)} width="wider">
        {detailFor && (
          <>
            <DialogHead
              title={`Persetujuan ${jenis}`}
              desc={
                wizardStep === 1
                  ? "Langkah 1 dari 3: Tinjau detail usulan dari SKPD dan hasil verifikasi."
                  : wizardStep === 2
                  ? "Langkah 2 dari 3: Tinjau, setujui, atau tolak setiap sub kegiatan."
                  : "Langkah 3 dari 3: Isi form persetujuan."
              }
            />
            <DialogBody>
              <div className="space-y-4">
                {/* Step indicator */}
                <div className="flex items-center gap-2 text-xs text-muted-fg">
                  <span className={`font-semibold ${wizardStep === 1 ? "text-primary" : ""}`}>
                    1. Detail Usulan
                  </span>
                  <span>→</span>
                  <span className={`font-semibold ${wizardStep === 2 ? "text-primary" : ""}`}>
                    2. Sub Kegiatan
                  </span>
                  <span>→</span>
                  <span className={`font-semibold ${wizardStep === 3 ? "text-primary" : ""}`}>
                    3. Persetujuan
                  </span>
                </div>

                {/* Step 1: Detail Usulan dari SKPD + Verifikator */}
                {wizardStep === 1 && (
                  <>
                    <DetailHighlight u={detailFor} />

                    {/* Informasi Verifikasi dari Verifikator */}
                    <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                      <h3 className="text-sm font-semibold mb-3 text-amber-800">Informasi Verifikasi</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-xs text-amber-700 font-medium">Tanggal Verifikasi</div>
                          <div className="text-sm font-semibold text-amber-900">
                            {detailFor.tglVerifikasi || "—"}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-amber-700 font-medium">Diverifikasi Oleh</div>
                          <div className="text-sm font-semibold text-amber-900">Verifikator BPKAD</div>
                        </div>
                      </div>
                      {detailFor.catatan && (
                        <div className="mt-3 pt-3 border-t border-amber-200">
                          <div className="text-xs text-amber-700 font-medium mb-1">Catatan dari Verifikator</div>
                          <div className="text-sm text-amber-900 bg-amber-100/70 rounded-md px-3 py-2">
                            {detailFor.catatan}
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                )}

                {/* Step 2: Rincian Sub Kegiatan dengan Adjustment */}
                {wizardStep === 2 && (
                  <>
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
                      <div className="space-y-3">
                        {adjustedEntries.map((entry, idx) => {
                          const sk = SUB_KEGIATAN.find((s) => s.id === entry.subKegiatanId);
                          const isRejected = entry.status === "rejected";
                          const isAdjusted = entry.status === "adjusted";
                          const isApproved = entry.status === "approved";
                          return (
                            <div
                              key={idx}
                              className={`rounded-lg border px-3 py-3 space-y-2 ${
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
                                <div className="text-sm font-semibold">
                                  {rupiah(isRejected ? 0 : isAdjusted ? parseNominal(entry.adjustedAnggaran) : entry.anggaran)}
                                </div>
                              </div>

                              {isRejected && (
                                <div className="flex items-center justify-between">
                                  <div className="text-xs text-red-600 font-medium">Ditolak</div>
                                  {wizardStep === 2 && (
                                    <button
                                      onClick={() => editDecidedEntry(idx)}
                                      className="text-xs text-muted-fg hover:text-primary underline"
                                    >
                                      Ubah
                                    </button>
                                  )}
                                </div>
                              )}
                              {isApproved && (
                                <div className="flex items-center justify-between">
                                  <div className="text-xs text-emerald-600 font-medium">Disetujui</div>
                                  {wizardStep === 2 && (
                                    <button
                                      onClick={() => editDecidedEntry(idx)}
                                      className="text-xs text-muted-fg hover:text-primary underline"
                                    >
                                      Ubah
                                    </button>
                                  )}
                                </div>
                              )}

                              {/* Action buttons - only in step 2 */}
                              {wizardStep === 2 && !isRejected && !isApproved && (
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => approveEntry(idx)}
                                    className="inline-flex items-center gap-1 rounded-md border border-emerald-200 bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700 hover:bg-emerald-100"
                                  >
                                    <Check className="h-3 w-3" />
                                    Setujui
                                  </button>
                                  <button
                                    onClick={() => rejectEntry(idx)}
                                    className="inline-flex items-center gap-1 rounded-md border border-red-200 bg-red-50 px-2 py-1 text-xs font-medium text-red-700 hover:bg-red-100"
                                  >
                                    <X className="h-3 w-3" />
                                    Tolak
                                  </button>
                                </div>
                              )}

                              {/* Adjust input - only in step 2 */}
                              {wizardStep === 2 && !isRejected && !isApproved && (
                                <div>
                                  <label className="text-xs text-muted-fg">Atur Anggaran (Rp)</label>
                                  <div className="flex items-center gap-2">
                                    <input
                                      inputMode="numeric"
                                      value={entry.adjustedAnggaran}
                                      onChange={(e) => adjustEntry(idx, e.target.value)}
                                      className="flex-1"
                                    />
                                    {isAdjusted && (
                                      <button
                                        onClick={() => resetEntry(idx)}
                                        className="text-xs text-muted-fg hover:text-danger"
                                      >
                                        Reset
                                      </button>
                                    )}
                                  </div>
                                  <p className="mt-1 text-xs text-muted-fg">
                                    Asli: {rupiah(entry.anggaran)}
                                  </p>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                      <div className="flex items-center justify-between border-t border-border pt-3 mt-3">
                        <span className="text-sm font-semibold">Total yang Disetujui</span>
                        <span className="text-lg font-bold text-primary">{rupiah(totalAnggaran)}</span>
                      </div>
                    </div>
                  </>
                )}

                {/* Step 3: Form Persetujuan (tanpa nominal final) */}
                {wizardStep === 3 && (
                  <>
                    {/* Ringkasan */}
                    <div className="rounded-lg border border-border bg-card p-4">
                      <h3 className="text-sm font-semibold mb-2">Ringkasan Keputusan</h3>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <div className="text-xs text-muted-fg">Total Anggaran Disetujui</div>
                          <div className="text-lg font-bold text-primary">{rupiah(totalAnggaran)}</div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-fg">Jumlah Sub Kegiatan</div>
                          <div className="text-sm font-semibold">
                            {adjustedEntries.filter((e) => e.status !== "rejected").length} dari {adjustedEntries.length} disetujui
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Form Persetujuan */}
                    <div className="rounded-lg border border-border bg-card p-4">
                      <h3 className="text-sm font-semibold mb-3">Form Persetujuan {jenis}</h3>
                      <div className="space-y-3">
                        <div>
                          <label>Tanggal Persetujuan</label>
                          <input
                            type="date"
                            value={tglPersetujuan}
                            onChange={(e) => setTglPersetujuan(e.target.value)}
                          />
                        </div>
                        <div>
                          <label>Catatan Persetujuan</label>
                          <textarea
                            rows={3}
                            value={catatanPersetujuan}
                            onChange={(e) => setCatatanPersetujuan(e.target.value)}
                            placeholder="Tulis catatan persetujuan..."
                          />
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </DialogBody>
            <DialogFoot>
              {wizardStep > 1 && (
                <Button variant="outline" onClick={() => setWizardStep((s) => (s - 1) as 1 | 2 | 3)}>
                  Sebelumnya
                </Button>
              )}
              {wizardStep < 3 && (
                <Button variant="primary" onClick={() => setWizardStep((s) => (s + 1) as 1 | 2 | 3)}>
                  Selanjutnya
                </Button>
              )}
              {wizardStep === 3 && (
                <>
                  <button
                    onClick={tolak}
                    className="inline-flex h-[38px] items-center gap-1.5 rounded-lg bg-danger px-3.5 text-sm font-semibold text-white hover:bg-[hsl(8_62%_42%)]"
                  >
                    <XCircle className="h-[14px] w-[14px]" />
                    Tolak
                  </button>
                  <button
                    onClick={setuju}
                    className="inline-flex h-[38px] items-center gap-1.5 rounded-lg bg-success px-3.5 text-sm font-semibold text-white hover:bg-[hsl(150_50%_26%)]"
                  >
                    <CheckCircle2 className="h-[14px] w-[14px]" />
                    Setujui
                  </button>
                </>
              )}
            </DialogFoot>
          </>
        )}
      </Modal>
    </div>
  );
}
