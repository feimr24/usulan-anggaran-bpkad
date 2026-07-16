"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, Save } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { Button, Card, EmptyState } from "@/components/ui";
import Modal, { DialogBody, DialogFoot, DialogHead } from "@/components/Modal";
import { SubKegiatan } from "@/lib/types";
import { uid } from "@/lib/format";

const emptyForm: Omit<SubKegiatan, "id"> = {
  nama: "",
  deskripsi: "",
};

export default function SubKegiatanView() {
  const { toast } = useApp();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<SubKegiatan | null>(null);
  const [form, setForm] = useState<Omit<SubKegiatan, "id">>(emptyForm);
  const [query, setQuery] = useState("");

  // Data dummy untuk sub kegiatan - dalam implementasi nyata akan disimpan di context
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
  ]);

  const filteredData = subKegiatanList.filter((s) =>
    s.nama.toLowerCase().includes(query.toLowerCase()) ||
    s.deskripsi.toLowerCase().includes(query.toLowerCase())
  );

  function openNew() {
    setEditing(null);
    setForm(emptyForm);
    setDialogOpen(true);
  }

  function openEdit(s: SubKegiatan) {
    setEditing(s);
    setForm({ ...s });
    setDialogOpen(true);
  }

  function remove(id: string) {
    setSubKegiatanList((list) => list.filter((x) => x.id !== id));
    toast("Sub Kegiatan dihapus");
  }

  function save() {
    if (!form.nama) {
      toast("Nama wajib diisi", "err");
      return;
    }
    const data = { ...form, deskripsi: form.deskripsi.trim() || "—" };
    if (editing) {
      setSubKegiatanList((list) =>
        list.map((x) => (x.id === editing.id ? { ...x, ...data } : x))
      );
      toast("Sub Kegiatan diperbarui");
    } else {
      setSubKegiatanList((list) => [...list, { id: uid(), ...data }]);
      toast("Sub Kegiatan disimpan");
    }
    setDialogOpen(false);
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
          <input
            className="pl-3"
            placeholder="Cari nama atau deskripsi sub kegiatan…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div className="flex-1" />
        <Button variant="primary" onClick={openNew}>
          <Plus className="h-[15px] w-[15px]" />
          Tambah Sub Kegiatan
        </Button>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                {["Nama Sub Kegiatan", "Deskripsi", ""].map(
                  (h, i) => (
                    <th
                      key={i}
                      className={`border-b border-border px-4 py-[11px] text-left text-xs font-semibold uppercase tracking-[0.04em] text-muted-fg ${
                        i === 2 ? "text-right" : ""
                      }`}
                    >
                      {i === 2 ? "Aksi" : h}
                    </th>
                  )
                )}
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
                <EmptyState
                  colSpan={3}
                  message="Tidak ada sub kegiatan yang cocok."
                />
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal open={dialogOpen} onClose={() => setDialogOpen(false)} width="wide">
        <DialogHead
          title={editing ? "Edit Sub Kegiatan" : "Tambah Sub Kegiatan"}
          desc="Sub kegiatan akan muncul pada dropdown saat SKPD melakukan input usulan."
        />
        <DialogBody>
          <div className="space-y-3">
            <div>
              <label>Nama Sub Kegiatan</label>
              <input
                value={form.nama}
                onChange={(e) => setForm({ ...form, nama: e.target.value })}
                placeholder="Contoh: Pengelolaan Pendidikan Dasar"
              />
            </div>
            <div>
              <label>Deskripsi</label>
              <textarea
                rows={3}
                value={form.deskripsi}
                onChange={(e) => setForm({ ...form, deskripsi: e.target.value })}
                placeholder="Deskripsi singkat tentang sub kegiatan"
              />
            </div>
          </div>
        </DialogBody>
        <DialogFoot>
          <Button variant="outline" onClick={() => setDialogOpen(false)}>
            Batal
          </Button>
          <Button variant="primary" onClick={save}>
            <Save className="h-[15px] w-[15px]" />
            {editing ? "Simpan Perubahan" : "Simpan Sub Kegiatan"}
          </Button>
        </DialogFoot>
      </Modal>
    </div>
  );
}