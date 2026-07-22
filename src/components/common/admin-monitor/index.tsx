"use client"

import { useMemo, useState } from "react"
import "remixicon/fonts/remixicon.css"
import { useApp } from "@/context/app-context"
import { STATUS } from "@/lib/constants"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
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
import { rupiah } from "@/lib/utils"
import { Usulan } from "@/types/models"

const TABS: [string, string][] = [
  ["semua", "Semua"],
  ["disetujui", "Disetujui"],
  ["ditolak", "Ditolak"],
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

export default function AdminMonitor() {
  const { usulanList } = useApp()
  const [tab, setTab] = useState("semua")
  const [detailFor, setDetailFor] = useState<Usulan | null>(null)

  const processed = useMemo(
    () => usulanList.filter((u) => ["disetujui", "ditolak"].includes(u.status)),
    [usulanList]
  )

  const rows = useMemo(() => {
    if (tab === "semua") return processed
    return processed.filter((u) => u.status === tab)
  }, [processed, tab])

  const disetujui = processed.filter((u) => u.status === "disetujui")
  const ditolak = processed.filter((u) => u.status === "ditolak")

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-serif text-2xl font-medium tracking-tight">
          Monitoring Usulan
        </h1>
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
              tab === k
                ? "bg-card text-fg shadow-sm2"
                : "bg-transparent text-muted-fg"
            }`}
          >
            {l} (
            {k === "semua"
              ? processed.length
              : k === "disetujui"
                ? disetujui.length
                : ditolak.length}
            )
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
                  <tr
                    key={u.id}
                    className="border-b border-[hsl(34_16%_92%)] last:border-none hover:bg-[hsl(36_24%_97%)]"
                  >
                    <td className="px-4 py-3 text-sm font-medium">{u.skpd}</td>
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
                <EmptyState colSpan={7} message="Tidak ada usulan yang diproses." />
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Detail dialog */}
      <Dialog open={!!detailFor} onOpenChange={() => setDetailFor(null)}>
        <DialogContent className="sm:max-w-2xl">
          {detailFor && (
            <>
              <DialogHeader>
                <DialogTitle>Detail Usulan</DialogTitle>
                <DialogDescription>
                  Lihat detail usulan dan keputusan persetujuan.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <DetailHighlight u={detailFor} />
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-[11px] rounded-[10px] border border-border bg-card px-[13px] py-[11px]">
                    <div>
                      <div className="text-[10.5px] font-semibold uppercase tracking-[0.05em] text-muted-fg">
                        Jenis
                      </div>
                      <div className="mt-px text-sm font-semibold">
                        {detailFor.jenis || "—"}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-[11px] rounded-[10px] border border-border bg-card px-[13px] py-[11px]">
                    <div>
                      <div className="text-[10.5px] font-semibold uppercase tracking-[0.05em] text-muted-fg">
                        Status
                      </div>
                      <div className="mt-px text-sm font-semibold">
                        <StatusBadge status={detailFor.status} />
                      </div>
                    </div>
                  </div>
                </div>
                {detailFor.nominalFinal !== undefined && (
                  <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
                    <h3 className="mb-2 text-sm font-semibold text-emerald-800">
                      Keputusan Persetujuan
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <div className="text-xs font-medium text-emerald-700">
                          Nominal Final
                        </div>
                        <div className="text-lg font-bold text-emerald-900">
                          {rupiah(detailFor.nominalFinal)}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs font-medium text-emerald-700">
                          Tanggal Persetujuan
                        </div>
                        <div className="text-sm font-semibold text-emerald-900">
                          {detailFor.tglPersetujuan || "—"}
                        </div>
                      </div>
                    </div>
                    {detailFor.catatanPersetujuan && (
                      <div className="mt-3 border-t border-emerald-200 pt-3">
                        <div className="mb-1 text-xs font-medium text-emerald-700">
                          Catatan Persetujuan
                        </div>
                        <div className="rounded-md bg-emerald-100/70 px-3 py-2 text-sm text-emerald-900">
                          {detailFor.catatanPersetujuan}
                        </div>
                      </div>
                    )}
                  </div>
                )}
                {detailFor.catatan && (
                  <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                    <div className="mb-1 text-xs font-medium text-amber-700">
                      Catatan Verifikator
                    </div>
                    <div className="rounded-md bg-amber-100/70 px-3 py-2 text-sm text-amber-900">
                      {detailFor.catatan}
                    </div>
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDetailFor(null)}>
                  Tutup
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
