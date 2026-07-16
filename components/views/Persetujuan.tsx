"use client";

import { useMemo, useState } from "react";
import { Eye, XCircle, CheckCircle2, Calendar, FileText, ClipboardList } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { Badge, Card, EmptyState, SectionHead } from "@/components/ui";
import Modal, { DialogBody, DialogFoot, DialogHead } from "@/components/Modal";
import DetailHighlight from "@/components/DetailHighlight";
import { rupiah, today } from "@/lib/format";
import { JenisPersetujuan, Usulan } from "@/lib/types";

// Map sub kegiatan ID ke nama untuk ditampilkan
const SUB_KEGIATAN_MAP: Record<string, string> = {
  "1": "Pengelolaan Pendidikan Dasar",
  "2": "Penyediaan Alkes Fasyankes",
  "3": "Pemeliharaan Jalan dan Drainase",
};

export default function Persetujuan({ jenis }: { jenis: JenisPersetujuan }) {
  const { usulanList, setUsulanList, toast } = useApp();
  const [tab, setTab] = useState<"masuk" | "disetujui" | "ditolak">("masuk");
  const [detailFor, setDetailFor] = useState<Usulan | null>(null);
  const [tglPersetujuan, setTglPersetujuan] = useState(today());
  const [nominalFinal, setNominalFinal] = useState("");
  const [catatanPersetujuan, setCatatanPersetujuan] = useState("");

  const set = useMemo(() => usulanList.filter((u) => u.jenis === jenis), [usulanList, jenis]);
  const masuk = set.filter((u) => u.status === "tapd");
  const dis = set.filter((u) => u.status === "disetujui");
  const tol = set.filter((u) => u.status === "ditolak");

  const shownList = tab === "disetujui" ? dis : tol;

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
    const nf = Number(nominalFinal.replace(/\D/g, "")) || detailFor.nilai;
    setUsulanList((list) =>
      list.map((x) => x.id === detailFor.id ? {
        ...x,
        status: "disetujui",
        nominalFinal: nf,
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
                          onClick={() => setDetailFor(u)}
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

      <Modal open={!!detailFor} onClose={() => setDetailFor(null)} width="wider">
        {detailFor && (
          <>
            <DialogHead
              title={`Persetujuan ${jenis}`}
              desc={`Tinjau usulan yang telah diverifikasi sebelumnya. Usulan ini telah diverifikasi pada tanggal ${detailFor.tglVerifikasi || "tidak diketahui"}.`}
            />
            <DialogBody>
              <div className="space-y-4">
                {/* Detail Usulan - Gabungan */}
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

                {/* Informasi Verifikasi dari Verifikator */}
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                  <h3 className="text-sm font-semibold mb-3 text-amber-800">📋 Informasi Verifikasi</h3>
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
                  <div className="mt-3 pt-3 border-t border-amber-200">
                    <div className="text-xs text-amber-700 font-medium mb-1">Catatan dari Verifikator</div>
                    <div className="text-sm text-amber-900 bg-amber-100/70 rounded-md px-3 py-2">
                      {detailFor.catatan || "Tidak ada catatan"}
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
                      <label>Nominal Final (Rp)</label>
                      <input
                        inputMode="numeric"
                        placeholder={rupiah(detailFor.nilai)}
                        value={nominalFinal}
                        onChange={(e) => setNominalFinal(e.target.value)}
                      />
                      <p className="mt-1 text-xs text-muted-fg">
                        Nilai usulan: {rupiah(detailFor.nilai)}. Kosongkan jika tidak ada perubahan.
                      </p>
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
              </div>
            </DialogBody>
            <DialogFoot between>
              <button
                onClick={tolak}
                className="inline-flex h-[42px] items-center gap-2 rounded-lg bg-danger px-4 font-semibold text-white hover:bg-[hsl(8_62%_42%)]"
              >
                <XCircle className="h-[15px] w-[15px]" />
                Tolak
              </button>
              <button
                onClick={setuju}
                className="inline-flex h-[42px] items-center gap-2 rounded-lg bg-success px-4 font-semibold text-white hover:bg-[hsl(150_50%_26%)]"
              >
                <CheckCircle2 className="h-[15px] w-[15px]" />
                Setujui
              </button>
            </DialogFoot>
          </>
        )}
      </Modal>
    </div>
  );
}
