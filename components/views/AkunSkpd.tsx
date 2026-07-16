"use client";

import { useMemo, useState } from "react";
import { Plus, Search, Pencil, Trash2 } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { Button, Card, EmptyState, SectionHead } from "@/components/ui";
import Modal, { DialogBody, DialogFoot, DialogHead } from "@/components/Modal";
import { Skpd } from "@/lib/types";
import { uid } from "@/lib/format";

const emptySkpd: Omit<Skpd, "id"> = {
  nama: "",
  kepala: "",
  nip: "",
  pangkat: "",
  userId: "",
  password: "",
};

export default function AkunSkpd() {
  const { skpdList, setSkpdList, toast } = useApp();
  const [query, setQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Skpd | null>(null);
  const [form, setForm] = useState<Omit<Skpd, "id">>(emptySkpd);

  const rows = useMemo(() => {
    const q = query.toLowerCase();
    return skpdList.filter(
      (s) => s.nama.toLowerCase().includes(q) || s.kepala.toLowerCase().includes(q)
    );
  }, [skpdList, query]);

  function openNew() {
    setEditing(null);
    setForm(emptySkpd);
    setDialogOpen(true);
  }

  function openEdit(s: Skpd) {
    setEditing(s);
    setForm({ ...s });
    setDialogOpen(true);
  }

  function remove(id: string) {
    setSkpdList((list) => list.filter((x) => x.id !== id));
    toast("Akun SKPD dihapus");
  }

  function save() {
    const nama = form.nama.trim();
    const nip = form.nip.trim();
    if (!nama || !nip) {
      toast("Nama SKPD dan NIP wajib diisi", "err");
      return;
    }
    if (editing) {
      setSkpdList((list) =>
        list.map((x) => (x.id === editing.id ? { ...x, ...form, nama, nip } : x))
      );
      toast("Perubahan akun disimpan");
    } else {
      setSkpdList((list) => [{ id: uid(), ...form, nama, nip }, ...list]);
      toast("Akun dibuat");
    }
    setDialogOpen(false);
  }

  return (
    <div>
      <SectionHead
        title="Akun SKPD"
        desc="Buat dan kelola akun seluruh SKPD. NIP Kepala SKPD otomatis menjadi User ID; password digenerate otomatis."
      />
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative min-w-[220px] max-w-[360px] flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-[15px] w-[15px] -translate-y-1/2 text-muted-fg" />
          <input
            className="pl-9"
            placeholder="Cari SKPD atau kepala…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div className="flex-1" />
        <Button variant="primary" onClick={openNew}>
          <Plus className="h-[15px] w-[15px]" />
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
                          <Pencil className="h-[15px] w-[15px]" />
                        </button>
                        <button
                          onClick={() => remove(s.id)}
                          className="grid h-8 w-8 place-items-center rounded-[7px] text-muted-fg hover:bg-[hsl(8_70%_96%)] hover:text-danger"
                        >
                          <Trash2 className="h-[15px] w-[15px]" />
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

      <Modal open={dialogOpen} onClose={() => setDialogOpen(false)} width="wide">
        <DialogHead
          title={editing ? "Edit Akun SKPD" : "Tambah Akun SKPD"}
          desc="NIP Kepala SKPD otomatis menjadi User ID. Password digenerate sistem."
        />
        <DialogBody>
          <div>
            <div>
              <label>Nama SKPD</label>
              <input
                value={form.nama}
                onChange={(e) => setForm({ ...form, nama: e.target.value })}
              />
            </div>
            <div>
              <label>Nama Kepala SKPD</label>
              <input
                value={form.kepala}
                onChange={(e) => setForm({ ...form, kepala: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label>NIP Kepala SKPD</label>
                <input
                  value={form.nip}
                  onChange={(e) => setForm({ ...form, nip: e.target.value })}
                />
              </div>
              <div>
                <label>Pangkat</label>
                <input
                  value={form.pangkat}
                  onChange={(e) => setForm({ ...form, pangkat: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label>User ID</label>
                <input
                  value={form.userId}
                  onChange={(e) => setForm({ ...form, userId: e.target.value })}
                />
              </div>
              <div>
                <label>Password</label>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                />
              </div>
            </div>
          </div>
        </DialogBody>
        <DialogFoot>
          <Button variant="outline" onClick={() => setDialogOpen(false)}>
            Batal
          </Button>
          <Button variant="primary" onClick={save}>
            {editing ? "Simpan Perubahan" : "Simpan Akun"}
          </Button>
        </DialogFoot>
      </Modal>
    </div>
  );
}
