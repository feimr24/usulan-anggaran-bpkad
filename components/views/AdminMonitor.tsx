"use client";

import { useMemo, useState } from "react";
import { Eye } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { Badge, Button, Card, EmptyState } from "@/components/ui";
import Modal, { DialogBody, DialogFoot, DialogHead } from "@/components/Modal";
import DetailHighlight from "@/components/DetailHighlight";
import { rupiah } from "@/lib/format";
import { Usulan } from "@/lib/types";

const TABS: [string, string][] = [
  ["semua", "Semua"],
  ["disetujui", "Disetujui"],
  ["ditolak", "Ditolak"],
];

export default function AdminMonitor() {
  const { usulanList } = useApp();
  const [tab, setTab] = useState("semua");
  const [detailFor, setDetailFor] = useState<Usulan | null>(null);

  // Hanya tampilkan usulan yang sudah diproses (bukan draft/diajukan/verifikasi)
  const processed = useMemo(
    () => usulanList.filter((u) => ["disetujui", "ditolak"].includes(u.status)),
    [usulanList]
  );

  const rows = useMemo(() => {
    if (tab === "semua") return processed;
    return processed.filter((u) => u.status === tab);
  }, [processed, tab]);

  const disetujui = processed.filter((u) => u.status === "disetujui");
  const ditolak = processed.filter((u) => u.status === "ditolak");

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-serif text-2xl font-medium tracking-tight">Monitoring Usulan</h1>
        <p className="mt-1 text-sm text-muted-fg">
          Pantau seluruh usulan yang sudah diproses oleh Sekda, PPKD, atau TAPD.
        </p>
      </div>

      <div className="mb-4 inline-flex flex-wrap gap-1 rounded-lg bg-muted p-1">
        {TABS.map(([k, l]) => (
          <button
            key={k}
            onClick={() => setTab(k)}
            className={`rounded-md border-none px-3.5 py-[7px] text-sm font-medium ${
              tab === k ? "bg-card text-fg shadow-sm2" : "bg-transparent text-muted-fg"
            }`}
          >
            {l} ({k === "semua" ? processed.length : k === "disetujui" ? disetujui.length : ditolak.length})
          </button>
        ))}
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                {["SKPD", "Tahap", "Keterangan", "Jenis", "Nilai Usul", "Status", ""].map(
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
                    <td className="px-4 py-3 text-sm font-medium">{u.skpd}</td>
                    <td className="px-4 py-3 text-sm text-muted-fg">{u.tahap}</td>
                    <td className="max-w-[220px] truncate px-4 py-3 text-sm text-muted-fg">{u.ket}</td>
                    <td className="px-4 py-3">
                      {u.jenis ? (
                        <span className="inline-flex items-center rounded-full border border-fuchsia-200 bg-fuchsia-50 px-[9px] py-[3px] text-xs font-semibold text-fuchsia-800">
                          {u.jenis}
                        </span>
                      ) : <span className="text-xs text-muted-fg">—</span>}
                    </td>
                    <td className="px-4 py-3 text-right text-sm">{rupiah(u.nilai)}</td>
                    <td className="px-4 py-3"><Badge status={u.status} /></td>
                    <td className="px-4 py-3 text-right">
                      <Button variant="outline" size="sm" className="ml-auto" onClick={() => setDetailFor(u)}>
                        <Eye className="h-[15px] w-[15px]" />
                        Detail
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <EmptyState colSpan={7} message="Tidak ada usulan yang diproses." />
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Detail dialog */}
      <Modal open={!!detailFor} onClose={() => setDetailFor(null)} width="wider">
        {detailFor && (
          <>
            <DialogHead title="Detail Usulan" desc="Lihat detail usulan dan keputusan persetujuan." />
            <DialogBody>
              <div className="space-y-4">
                <DetailHighlight u={detailFor} />
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-[11px] rounded-[10px] border border-border bg-card px-[13px] py-[11px]">
                    <div>
                      <div className="text-[10.5px] font-semibold uppercase tracking-[0.05em] text-muted-fg">Jenis</div>
                      <div className="mt-px text-sm font-semibold">{detailFor.jenis || "—"}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-[11px] rounded-[10px] border border-border bg-card px-[13px] py-[11px]">
                    <div>
                      <div className="text-[10.5px] font-semibold uppercase tracking-[0.05em] text-muted-fg">Status</div>
                      <div className="mt-px text-sm font-semibold"><Badge status={detailFor.status} /></div>
                    </div>
                  </div>
                </div>
                {detailFor.nominalFinal !== undefined && (
                  <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
                    <h3 className="text-sm font-semibold mb-2 text-emerald-800">Keputusan Persetujuan</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <div className="text-xs text-emerald-700 font-medium">Nominal Final</div>
                        <div className="text-lg font-bold text-emerald-900">{rupiah(detailFor.nominalFinal)}</div>
                      </div>
                      <div>
                        <div className="text-xs text-emerald-700 font-medium">Tanggal Persetujuan</div>
                        <div className="text-sm font-semibold text-emerald-900">{detailFor.tglPersetujuan || "—"}</div>
                      </div>
                    </div>
                    {detailFor.catatanPersetujuan && (
                      <div className="mt-3 pt-3 border-t border-emerald-200">
                        <div className="text-xs text-emerald-700 font-medium mb-1">Catatan Persetujuan</div>
                        <div className="text-sm text-emerald-900 bg-emerald-100/70 rounded-md px-3 py-2">
                          {detailFor.catatanPersetujuan}
                        </div>
                      </div>
                    )}
                  </div>
                )}
                {detailFor.catatan && (
                  <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                    <div className="text-xs text-amber-700 font-medium mb-1">Catatan Verifikator</div>
                    <div className="text-sm text-amber-900 bg-amber-100/70 rounded-md px-3 py-2">
                      {detailFor.catatan}
                    </div>
                  </div>
                )}
              </div>
            </DialogBody>
            <DialogFoot>
              <Button variant="outline" onClick={() => setDetailFor(null)}>Tutup</Button>
            </DialogFoot>
          </>
        )}
      </Modal>
    </div>
  );
}
