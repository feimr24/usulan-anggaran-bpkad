"use client"

import { useState } from "react"
import "remixicon/fonts/remixicon.css"
import { useApp } from "@/context/app-context"
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
import { SubKegiatan } from "@/types/models"
import { uid } from "@/lib/utils"

const emptyForm: Omit<SubKegiatan, "id"> = {
  nama: "",
  deskripsi: "",
}

export default function SubKegiatanView() {
  const { toast } = useApp()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<SubKegiatan | null>(null)
  const [form, setForm] = useState<Omit<SubKegiatan, "id">>(emptyForm)
  const [query, setQuery] = useState("")

  const [subKegiatanList, setSubKegiatanList] = useState<SubKegiatan[]>([
    {
      id: "1",
      nama: "Pengelolaan Pendidikan Dasar",
      deskripsi: "Kegiatan pengelolaan pendidikan dasar di tingkat SD dan SMP",
    },
    {
      id: "2",
      nama: "Penyediaan Alkes Fasyankes",
      deskripsi: "Pengadaan alat kesehatan untuk fasilitas kesehatan",
    },
    {
      id: "3",
      nama: "Pemeliharaan Jalan dan Drainase",
      deskripsi: "Pemeliharaan infrastruktur jalan dan sistem drainase",
    },
  ])

  const filteredData = subKegiatanList.filter(
    (s) =>
      s.nama.toLowerCase().includes(query.toLowerCase()) ||
      s.deskripsi.toLowerCase().includes(query.toLowerCase())
  )

  function openNew() {
    setEditing(null)
    setForm(emptyForm)
    setDialogOpen(true)
  }

  function openEdit(s: SubKegiatan) {
    setEditing(s)
    setForm({ ...s })
    setDialogOpen(true)
  }

  function remove(id: string) {
    setSubKegiatanList((list) => list.filter((x) => x.id !== id))
    toast("Sub Kegiatan dihapus")
  }

  function save() {
    if (!form.nama) {
      toast("Nama wajib diisi", "err")
      return
    }
    const data = { ...form, deskripsi: form.deskripsi.trim() || "—" }
    if (editing) {
      setSubKegiatanList((list) =>
        list.map((x) => (x.id === editing.id ? { ...x, ...data } : x))
      )
      toast("Sub Kegiatan diperbarui")
    } else {
      setSubKegiatanList((list) => [...list, { id: uid(), ...data }])
      toast("Sub Kegiatan disimpan")
    }
    setDialogOpen(false)
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-serif text-2xl font-medium tracking-tight">Sub Kegiatan</h1>
        <p className="mt-1 text-sm text-muted-fg">
          Kelola data master sub kegiatan. Sub kegiatan akan muncul pada saat SKPD melakukan input usulan anggaran.
        </p>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative min-w-[220px] max-w-[360px] flex-1">
          <Input
            className="pl-3"
            placeholder="Cari nama atau deskripsi sub kegiatan…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div className="flex-1" />
        <Button variant="default" onClick={openNew}>
          <i className="ri-add-line h-[15px] w-[15px]" />
          Tambah Sub Kegiatan
        </Button>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                {["Nama Sub Kegiatan", "Deskripsi", ""].map((h, i) => (
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
              {filteredData.length ? (
                filteredData.map((s) => (
                  <tr key={s.id} className="border-b border-[hsl(34_16%_92%)] last:border-none hover:bg-[hsl(36_24%_97%)]">
                    <td className="px-4 py-3 text-sm font-medium">{s.nama}</td>
                    <td className="px-4 py-3 text-sm text-muted-fg">{s.deskripsi}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => openEdit(s)}
                          className="grid h-8 w-8 place-items-center rounded-[7px] text-muted-fg hover:bg-muted hover:text-fg"
                        >
                          <i className="ri-edit-line h-[15px] w-[15px]" />
                        </button>
                        <button
                          onClick={() => remove(s.id)}
                          className="grid h-8 w-8 place-items-center rounded-[7px] text-muted-fg hover:bg-[hsl(8_70%_96%)] hover:text-danger"
                        >
                          <i className="ri-delete-bin-line h-[15px] w-[15px]" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <EmptyState
                  colSpan={3}
                  message="Tidak ada sub kegiatan yang cocok."
                />
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editing ? "Edit Sub Kegiatan" : "Tambah Sub Kegiatan"}
            </DialogTitle>
            <DialogDescription>
              Sub kegiatan akan muncul pada dropdown saat SKPD melakukan input usulan.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Nama Sub Kegiatan</Label>
              <Input
                value={form.nama}
                onChange={(e) => setForm({ ...form, nama: e.target.value })}
                placeholder="Contoh: Pengelolaan Pendidikan Dasar"
              />
            </div>
            <div>
              <Label>Deskripsi</Label>
              <Textarea
                rows={3}
                value={form.deskripsi}
                onChange={(e) => setForm({ ...form, deskripsi: e.target.value })}
                placeholder="Deskripsi singkat tentang sub kegiatan"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Batal
            </Button>
            <Button variant="default" onClick={save}>
              <i className="ri-save-line h-[15px] w-[15px]" />
              {editing ? "Simpan Perubahan" : "Simpan Sub Kegiatan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
