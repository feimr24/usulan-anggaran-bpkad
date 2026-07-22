"use client"

import { useMemo, useState } from "react"
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
import { SectionHead } from "@/components/shared/section-head"
import { EmptyState } from "@/components/shared/empty-state"
import { Skpd } from "@/types/models"
import { uid } from "@/lib/utils"

const emptySkpd: Omit<Skpd, "id"> = {
  nama: "",
  kepala: "",
  nip: "",
  pangkat: "",
  userId: "",
  password: "",
}

export default function AkunSkpd() {
  const { skpdList, setSkpdList, toast } = useApp()
  const [query, setQuery] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Skpd | null>(null)
  const [form, setForm] = useState<Omit<Skpd, "id">>(emptySkpd)

  const rows = useMemo(() => {
    const q = query.toLowerCase()
    return skpdList.filter(
      (s) => s.nama.toLowerCase().includes(q) || s.kepala.toLowerCase().includes(q)
    )
  }, [skpdList, query])

  function openNew() {
    setEditing(null)
    setForm(emptySkpd)
    setDialogOpen(true)
  }

  function openEdit(s: Skpd) {
    setEditing(s)
    setForm({ ...s })
    setDialogOpen(true)
  }

  function remove(id: string) {
    setSkpdList((list) => list.filter((x) => x.id !== id))
    toast("Akun SKPD dihapus")
  }

  function save() {
    const nama = form.nama.trim()
    const nip = form.nip.trim()
    if (!nama || !nip) {
      toast("Nama SKPD dan NIP wajib diisi", "err")
      return
    }
    if (editing) {
      setSkpdList((list) =>
        list.map((x) => (x.id === editing.id ? { ...x, ...form, nama, nip } : x))
      )
      toast("Perubahan akun disimpan")
    } else {
      setSkpdList((list) => [{ id: uid(), ...form, nama, nip }, ...list])
      toast("Akun dibuat")
    }
    setDialogOpen(false)
  }

  return (
    <div>
      <SectionHead
        title="Akun SKPD"
        desc="Buat dan kelola akun seluruh SKPD. NIP Kepala SKPD otomatis menjadi User ID; password digenerate otomatis."
      />
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative min-w-[220px] max-w-[360px] flex-1">
          <i className="ri-search-line pointer-events-none absolute left-3 top-1/2 h-[15px] w-[15px] -translate-y-1/2 text-muted-fg" />
          <Input
            className="pl-9"
            placeholder="Cari SKPD atau kepala…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div className="flex-1" />
        <Button variant="default" onClick={openNew}>
          <i className="ri-add-line h-[15px] w-[15px]" />
          Tambah SKPD
        </Button>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                {["Nama SKPD", "Kepala SKPD", "NIP", "User ID", "Pangkat", ""].map(
                  (h, i) => (
                    <th
                      key={i}
                      className={`border-b border-border px-4 py-[11px] text-left text-xs font-semibold uppercase tracking-[0.04em] text-muted-fg ${
                        i === 5 ? "text-right" : ""
                      }`}
                    >
                      {i === 5 ? "Aksi" : h}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {rows.length ? (
                rows.map((s) => (
                  <tr key={s.id} className="border-b border-[hsl(34_16%_92%)] last:border-none hover:bg-[hsl(36_24%_97%)]">
                    <td className="px-4 py-3 text-sm font-medium">{s.nama}</td>
                    <td className="px-4 py-3 text-sm">{s.kepala}</td>
                    <td className="mono px-4 py-3 text-sm text-muted-fg">{s.nip}</td>
                    <td className="mono px-4 py-3 text-sm text-muted-fg">{s.userId}</td>
                    <td className="px-4 py-3 text-sm text-muted-fg">{s.pangkat}</td>
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
                <EmptyState colSpan={6} message="Tidak ada SKPD yang cocok." />
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editing ? "Edit Akun SKPD" : "Tambah Akun SKPD"}
            </DialogTitle>
            <DialogDescription>
              NIP Kepala SKPD otomatis menjadi User ID. Password digenerate sistem.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Nama SKPD</Label>
              <Input
                value={form.nama}
                onChange={(e) => setForm({ ...form, nama: e.target.value })}
              />
            </div>
            <div>
              <Label>Nama Kepala SKPD</Label>
              <Input
                value={form.kepala}
                onChange={(e) => setForm({ ...form, kepala: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>NIP Kepala SKPD</Label>
                <Input
                  value={form.nip}
                  onChange={(e) => setForm({ ...form, nip: e.target.value })}
                />
              </div>
              <div>
                <Label>Pangkat</Label>
                <Input
                  value={form.pangkat}
                  onChange={(e) => setForm({ ...form, pangkat: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>User ID</Label>
                <Input
                  value={form.userId}
                  onChange={(e) => setForm({ ...form, userId: e.target.value })}
                />
              </div>
              <div>
                <Label>Password</Label>
                <Input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Batal
            </Button>
            <Button variant="default" onClick={save}>
              {editing ? "Simpan Perubahan" : "Simpan Akun"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
