"use client";

import { Download } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { Badge, Button, Card, SectionHead } from "@/components/ui";
import { rupiah } from "@/lib/format";

export default function Laporan() {
  const { usulanList } = useApp();

  return (
    <div>
      <SectionHead
        title="Laporan"
        desc="Rekap jenis persetujuan dan usulan ditolak. Filter per tanggal, tahap usulan, dan SKPD. Ekspor ke PDF atau Excel."
        actions={
          <>
            <Button variant="outline" onClick={() => window.print()}>
              <Download className="h-[15px] w-[15px]" />
              Excel
            </Button>
            <Button variant="outline" onClick={() => window.print()}>
              <Download className="h-[15px] w-[15px]" />
              PDF
            </Button>
          </>
        }
      />
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                {["ID", "SKPD", "Jenis", "Nilai", "Status"].map((h, i) => (
                  <th
                    key={i}
                    className={`border-b border-border px-4 py-[11px] text-left text-xs font-semibold uppercase tracking-[0.04em] text-muted-fg ${
                      i === 3 ? "text-right" : ""
                    }`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {usulanList.map((u) => (
                <tr key={u.id} className="border-b border-[hsl(34_16%_92%)] last:border-none hover:bg-[hsl(36_24%_97%)]">
                  <td className="mono px-4 py-3 text-sm text-muted-fg">{u.id}</td>
                  <td className="px-4 py-3 text-sm">{u.skpd}</td>
                  <td className="px-4 py-3 text-sm text-muted-fg">{u.jenis ?? "—"}</td>
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
    </div>
  );
}
