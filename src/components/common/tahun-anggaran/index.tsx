"use client"

import { useState } from "react"
import "remixicon/fonts/remixicon.css"
import { useApp } from "@/context/app-context"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
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
import { TahunAnggaran } from "@/types/models"
import { uid } from "@/lib/utils"

export default function TahunAnggaranView() {
  const { tahunAnggaranList, setTahunAnggaranList, toast } = useApp()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<TahunAnggaran | null>(null)
  const [tahun, setTahun] = useState("")

  function openNew() {
    setEditing(null)
    setTahun("")
    setDialogOpen(true)
  }

  function openEdit(t: TahunAnggaran) {
    setEditing(t)
    setTahun(t.tahun)
    setDialogOpen(true)
  }

  function remove(id: string) {
    setTahunAnggaranList((list) => list.filter((x) => x.id !== id))
    toast("Tahun anggaran dihapus")
  }

  function save() {
    if (!tahun.trim()) {
      toast("Tahun wajib diisi", "err")
      return
    }
    if (editing) {
      setTahunAnggaranList((list) =>
        list.map((x) =>
          x.id === editing.id ? { ...x, tahun: tahun.trim() } : x
        )
      )
      toast("Tahun anggaran diperbarui")
    } else {
      setTahunAnggaranList((list) => [
        ...list,
        { id: uid(), tahun: tahun.trim(), aktif: false },
      ])
      toast("Tahun anggaran ditambahkan")
    }
    setDialogOpen(false)
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-medium tracking-tight">
            Tahun Anggaran
          </h1>
          <p className="mt-1 text-sm text-muted-fg">
            Kelola daftar tahun anggaran. Tahun yang tersedia akan muncul di form
            tambah jadwal usulan.
          </p>
        </div>
        <Button variant="default" onClick={openNew}>
          <i className="ri-add-line h-[15px] w-[15px]" />
          Tambah Tahun
        </Button>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                {["Tahun Anggaran", "Status", ""].map((h, i) => (
                  <th
                    key={i}
                    className={`border-b border-border px-4 py-[11px] text-left text-xs font-semibold uppercase tracking-[0.04em] text-muted-fg ${
                      i === 2 ? "text-right" : ""
                    }`}
                  >
                    {i === 2 ? "Aksi" : h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tahunAnggaranList.length ? (
                tahunAnggaranList.map((t) => (
                  <tr
                    key={t.id}
                    className="border-b border-[hsl(34_16%_92%)] last:border-none hover:bg-[hsl(36_24%_97%)]"
                  >
                    <td className="px-4 py-3 text-sm font-medium">{t.tahun}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border ${
                          t.aktif
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-muted text-muted-fg border-border"
                        }`}
                      >
                        {t.aktif ? "Aktif" : "Non-aktif"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => openEdit(t)}
                          className="grid h-8 w-8 place-items-center rounded-[7px] text-muted-fg hover:bg-muted hover:text-fg"
                        >
                          <i className="ri-edit-line h-[15px] w-[15px]" />
                        </button>
                        <button
                          onClick={() => remove(t.id)}
                          className="grid h-8 w-8 place-items-center rounded-[7px] text-muted-fg hover:bg-[hsl(8_70%_96%)] hover:text-danger"
                        >
                          <i className="ri-delete-bin-line h-[15px] w-[15px]" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <EmptyState colSpan={3} message="Belum ada tahun anggaran." />
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>
              {editing ? "Edit Tahun Anggaran" : "Tambah Tahun Anggaran"}
            </DialogTitle>
            <DialogDescription>
              Tahun anggaran akan digunakan di form jadwal usulan.
            </DialogDescription>
          </DialogHeader>
          <div>
            <Label>Tahun</Label>
            <Input
              value={tahun}
              onChange={(e) => setTahun(e.target.value)}
              placeholder="Contoh: 2026"
              maxLength={4}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Batal
            </Button>
            <Button variant="default" onClick={save}>
              <i className="ri-save-line h-[15px] w-[15px]" />
              {editing ? "Simpan Perubahan" : "Simpan Tahun"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
