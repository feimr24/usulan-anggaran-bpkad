"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, ClipboardList, FileText, RotateCcw } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { Card, EmptyState, SectionHead } from "@/components/ui";
import Modal, { DialogBody, DialogFoot, DialogHead } from "@/components/Modal";
import DetailHighlight from "@/components/DetailHighlight";
import { rupiah, today } from "@/lib/format";
import { JENIS, SUB_KEGIATAN } from "@/lib/data";
import { JenisPersetujuan, Usulan } from "@/lib/types";

export default function VerifikasiUsulan() {
  const { usulanList, setUsulanList, toast } = useApp();
  const [tab, setTab] = useState<"masuk" | "riwayat">("masuk");
  const [verifikasiFor, setVerifikasiFor] = useState<Usulan | null>(null);
  const [tgl, setTgl] = useState(today());
  const [jenis, setJenis] = useState<JenisPersetujuan>(JENIS[0]);
  const [catatan, setCatatan] = useState("");

  const masuk = useMemo(
    () => usulanList.filter((u) => u.status === "diajukan" || u.status === "verifikasi"),
    [usulanList]
  );
  const riwayat = useMemo(
    () => usulanList.filter((u) => u.tglVerifikasi),
    [usulanList]
  );

  function openVer(u: Usulan) {
    setVerifikasiFor(u);
    setTgl(today());
    setJenis(JENIS[0]);
    setCatatan("");
  }

  function doRevisi() {
    if (!verifikasiFor) return;
    setUsulanList((list) =>
      list.map((x) =>
        x.id === verifikasiFor.id
          ? { ...x, status: "revisi", tglVerifikasi: tgl, catatan }
          : x
      )
    );
    setVerifikasiFor(null);
    toast("Usulan dikembalikan", "info");
    setTab("riwayat");
  }

  function doProses() {
    if (!verifikasiFor) return;
    setUsulanList((list) =>
      list.map((x) =>
        x.id === verifikasiFor.id
          ? { ...x, status: "tapd", jenis, tglVerifikasi: tgl, catatan }
          : x
      )
    );
    setVerifikasiFor(null);
    toast(`Diteruskan ke persetujuan ${jenis}`);
    setTab("riwayat");
  }

  return (
    <div>
      <SectionHead
        title="Verifikasi Usulan"
        desc="Verifikasi kelengkapan data & kesesuaian dengan pedoman anggaran. Setiap keputusan terekam pada tab Riwayat Verifikasi."
      />
      <div className="mb-4 inline-flex gap-1 rounded-lg bg-muted p-1">
        <button
          onClick={() => setTab("masuk")}
          className={`rounded-md border-none px-3.5 py-[7px] text-sm font-medium ${
            tab === "masuk" ? "bg-card text-fg shadow-sm2" : "bg-transparent text-muted-fg"
          }`}
        >
          Verifikasi Masuk ({masuk.length})
        </button>
        <button
          onClick={() => setTab("riwayat")}
          className={`rounded-md border-none px-3.5 py-[7px] text-sm font-medium ${
            tab === "riwayat" ? "bg-card text-fg shadow-sm2" : "bg-transparent text-muted-fg"
          }`}
        >
          Riwayat Verifikasi ({riwayat.length})
        </button>
      </div>

      {tab === "masuk" ? (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  {["ID", "SKPD", "Tahap", "Nilai", "Tindakan"].map((h, i) => (
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
                          onClick={() => openVer(u)}
                          className="ml-auto inline-flex items-center gap-1.5 rounded-[7px] border-none bg-danger px-2.5 py-1.5 text-sm font-bold text-white hover:bg-[hsl(8_62%_40%)] shadow-sm2"
                        >
                          <ClipboardList className="h-[15px] w-[15px]" />
                          Verifikasi
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <EmptyState colSpan={5} message="Tidak ada usulan menunggu verifikasi." />
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
                  {["ID", "SKPD", "Tgl Verifikasi", "Hasil", "Nilai"].map((h, i) => (
                    <th
                      key={i}
                      className={`border-b border-border px-4 py-[11px] text-left text-xs font-semibold uppercase tracking-[0.04em] text-muted-fg ${
                        i === 4 ? "text-right" : ""
                      }`}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {riwayat.map((u) => (
                  <tr key={u.id} className="border-b border-[hsl(34_16%_92%)] last:border-none hover:bg-[hsl(36_24%_97%)]">
                    <td className="mono px-4 py-3 text-sm text-muted-fg">{u.id}</td>
                    <td className="px-4 py-3 text-sm">{u.skpd}</td>
                    <td className="px-4 py-3 text-sm text-muted-fg">{u.tglVerifikasi}</td>
                    <td className="px-4 py-3">
                      {u.status === "revisi" ? (
                        <span className="rounded-full border border-amber-200 bg-amber-50 px-[9px] py-[3px] text-xs font-semibold text-amber-800">
                          Direvisi
                        </span>
                      ) : (
                        <span className="rounded-full border border-fuchsia-200 bg-fuchsia-50 px-[9px] py-[3px] text-xs font-semibold text-fuchsia-800">
                          Diproses → {u.jenis}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right text-sm">{rupiah(u.nilai)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <Modal open={!!verifikasiFor} onClose={() => setVerifikasiFor(null)} width="wider">
        {verifikasiFor && (
          <>
            <DialogHead
              title="Verifikasi Usulan"
              desc="Periksa detail usulan, catat tanggal verifikasi, lalu proses atau kembalikan untuk revisi."
            />
            <DialogBody>
              <div className="space-y-4">
                <DetailHighlight u={verifikasiFor} />

                {/* Sub Kegiatan Entries */}
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
                  {verifikasiFor.subKegiatanEntries && verifikasiFor.subKegiatanEntries.length > 0 ? (
                    <div className="space-y-2">
                      {verifikasiFor.subKegiatanEntries.map((entry, idx) => {
                        const sk = SUB_KEGIATAN.find((s) => s.id === entry.subKegiatanId);
                        return (
                          <div
                            key={idx}
                            className="flex items-center justify-between rounded-lg border border-border bg-muted/50 px-3 py-2"
                          >
                            <div>
                              <div className="text-sm font-medium">
                                {sk?.nama || `ID: ${entry.subKegiatanId}`}
                              </div>
                              {sk?.kode && (
                                <div className="text-xs text-muted-fg">{sk.kode}</div>
                              )}
                            </div>
                            <div className="text-sm font-semibold">{rupiah(entry.anggaran)}</div>
                          </div>
                        );
                      })}
                      <div className="flex items-center justify-between border-t border-border pt-2 mt-2">
                        <span className="text-sm font-semibold">Total</span>
                        <span className="text-sm font-bold text-primary">{rupiah(verifikasiFor.nilai)}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm text-muted-fg">Tidak tersedia</div>
                  )}
                </div>

                {/* Form verifikasi */}
                <div className="rounded-lg border border-border bg-card p-4">
                  <h3 className="text-sm font-semibold mb-3">Form Verifikasi</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label>Tanggal Verifikasi</label>
                      <input type="date" value={tgl} onChange={(e) => setTgl(e.target.value)} />
                    </div>
                    <div>
                      <label>Jenis Persetujuan</label>
                      <select
                        value={jenis}
                        onChange={(e) => setJenis(e.target.value as JenisPersetujuan)}
                      >
                        {JENIS.map((j) => (
                          <option key={j}>{j}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="mt-3">
                    <label>Catatan Verifikasi</label>
                    <textarea
                      rows={3}
                      value={catatan}
                      onChange={(e) => setCatatan(e.target.value)}
                      placeholder="Tulis catatan verifikasi disini..."
                    />
                  </div>
                </div>
              </div>
            </DialogBody>
            <DialogFoot between>
              <button
                onClick={doRevisi}
                className="inline-flex items-center gap-2 rounded-lg border-transparent bg-transparent px-4 py-0 text-[14px] font-bold text-danger hover:bg-[hsl(8_70%_96%)]"
              >
                <RotateCcw className="h-[15px] w-[15px]" />
                Revisi
              </button>
              <button
                onClick={doProses}
                className="inline-flex h-[42px] items-center gap-2 rounded-lg bg-primary px-4 font-semibold text-primary-fg hover:bg-[hsl(8_58%_40%)]"
              >
                <CheckCircle2 className="h-[15px] w-[15px]" />
                Proses
              </button>
            </DialogFoot>
          </>
        )}
      </Modal>
    </div>
  );
}
