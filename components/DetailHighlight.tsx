"use client";

import { FileText, Download, ExternalLink } from "lucide-react";
import { rupiah } from "@/lib/format";
import { Usulan } from "@/lib/types";

export default function DetailHighlight({ u }: { u: Usulan }) {
  function handleDownload() {
    // Simulasi download dokumen
    const content = `Dokumen Usulan Anggaran\n\nID Usulan: ${u.id}\nSKPD: ${u.skpd}\nTahap: ${u.tahap}\nTanggal: ${u.tanggal}\nKeterangan: ${u.ket}\nNilai: ${rupiah(u.nilai)}\nStatus: ${u.status}`;
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = u.dokumen || `${u.id}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleView() {
    // Simulasi view dokumen
    const content = `=== DOKUMEN USULAN ANGGARAN ===\n\nID Usulan: ${u.id}\nSKPD: ${u.skpd}\nTahap: ${u.tahap}\nTanggal Usulan: ${u.tanggal}\n\nKeterangan:\n${u.ket}\n\nNilai Diusulkan: ${rupiah(u.nilai)}\nStatus: ${u.status}\n\nDokumen: ${u.dokumen || "Tidak ada dokumen"}`;
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");
  }

  return (
    <div className="rounded-[11px] border border-[hsl(34_22%_86%)] bg-[hsl(36_30%_96%)] px-[18px] py-4">
      <div className="flex items-center gap-2.5">
        <span className="grid h-[34px] w-[34px] place-items-center rounded-[9px] bg-primary text-white">
          <FileText className="h-[15px] w-[15px]" />
        </span>
        <div>
          <div className="text-[15px] font-semibold">{u.skpd}</div>
          <div className="mono text-xs text-muted-fg">{u.id}</div>
        </div>
      </div>
      <div className="mt-3.5 grid grid-cols-2 gap-x-5 gap-y-3">
        <div>
          <div className="text-[10.5px] font-semibold uppercase tracking-[0.05em] text-muted-fg">
            Tahap Usulan
          </div>
          <div className="mt-0.5 text-sm font-medium">{u.tahap}</div>
        </div>
        <div>
          <div className="text-[10.5px] font-semibold uppercase tracking-[0.05em] text-muted-fg">
            Tanggal Usulan
          </div>
          <div className="mt-0.5 text-sm font-medium">{u.tanggal}</div>
        </div>
        <div className="col-span-2">
          <div className="text-[10.5px] font-semibold uppercase tracking-[0.05em] text-muted-fg">
            Keterangan
          </div>
          <div className="mt-0.5 text-sm font-medium">{u.ket}</div>
        </div>
        <div className="col-span-2">
          <div className="text-[10.5px] font-semibold uppercase tracking-[0.05em] text-muted-fg">
            Nominal Diusulkan
          </div>
          <div className="mt-0.5 text-lg font-bold text-primary">{rupiah(u.nilai)}</div>
        </div>

        {/* Dokumen */}
        <div className="col-span-2">
          <div className="text-[10.5px] font-semibold uppercase tracking-[0.05em] text-muted-fg">
            Dokumen Usulan
          </div>
          <div className="mt-1.5 flex items-center gap-2">
            <span className="text-sm font-medium text-muted-fg">
              {u.dokumen || "Tidak ada dokumen"}
            </span>
            {u.dokumen && (
              <div className="flex gap-1.5">
                <button
                  onClick={handleView}
                  className="inline-flex items-center gap-1 rounded-md border border-border bg-card px-2 py-1 text-xs font-medium text-fg hover:bg-muted"
                >
                  <ExternalLink className="h-3 w-3" />
                  Lihat
                </button>
                <button
                  onClick={handleDownload}
                  className="inline-flex items-center gap-1 rounded-md border border-primary bg-primary/5 px-2 py-1 text-xs font-medium text-primary hover:bg-primary/10"
                >
                  <Download className="h-3 w-3" />
                  Download
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
