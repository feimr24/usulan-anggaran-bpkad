"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, Save } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { Button, Card, EmptyState, SectionHead } from "@/components/ui";
import Modal, { DialogBody, DialogFoot, DialogHead } from "@/components/Modal";
import { Jadwal } from "@/lib/types";
import { TAHAP } from "@/lib/data";
import { uid } from "@/lib/format";

const emptyForm: Omit<Jadwal, "id"> = {
  tahun: "",
  tahap: "",
  buka: "",
  tutup: "",
  ket: "",
  aktif: true, // Selalu true - jadwal baru otomatis aktif
};

function toLocalInput(s: string) {
  return s ? s.replace(" ", "T") : "";
}

export default function JadwalUsulan() {
  const { jadwalList, setJadwalList, tahunAnggaranList, toast } = useApp();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Jadwal | null>(null);
  const [form, setForm] = useState<Omit<Jadwal, "id">>(emptyForm);
  const [activeTab, setActiveTab] = useState<'aktif' | 'tidak-aktif'>('aktif');

  const filteredJadwal = jadwalList.filter((j) =>
    activeTab === 'aktif' ? j.aktif : !j.aktif
  );

  function openNew() {
    setEditing(null);
    setForm(emptyForm);
    setDialogOpen(true);
  }

  function openEdit(j: Jadwal) {
    setEditing(j);
    setForm({ ...j });
    setDialogOpen(true);
  }

  function remove(id: string) {
    setJadwalList((list) => list.filter((x) => x.id !== id));
    toast("Jadwal dihapus");
  }

  function save() {
    if (!form.tahun || !form.tahap) {
      toast("Tahun anggaran dan tahap wajib diisi", "err");
      return;
    }
    const data = { ...form, ket: form.ket.trim() || "—" };

    if (editing) {
      setJadwalList((list) =>
        list.map((x) => (x.id === editing.id ? { ...x, ...data } : x))
      );
      toast("Jadwal diperbarui");
    } else {
      // Jadwal baru otomatis aktif, nonaktifkan semua jadwal aktif lainnya
      setJadwalList((list) =>
        list.map((x) => ({ ...x, aktif: false }))
      );
      setJadwalList((list) => [...list, { id: uid(), ...data, aktif: true }]);
      toast("Jadwal disimpan dan diaktifkan");
    }
    setDialogOpen(false);
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-serif text-2xl font-medium tracking-tight">Jadwal Usulan</h1>
        <p className="mt-1 text-sm text-muted-fg">
          Tetapkan tahun anggaran dan jendela waktu pengusulan per tahap. Hanya satu jadwal yang dapat aktif.
        </p>
      </div>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === 'aktif'
                ? 'bg-primary text-primary-fg'
                : 'bg-muted text-muted-fg hover:bg-[hsl(36_24%_92%)]'
            }`}
            onClick={() => setActiveTab('aktif')}
          >
            Jadwal Aktif
          </button>
          <button
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === 'tidak-aktif'
                ? 'bg-primary text-primary-fg'
                : 'bg-muted text-muted-fg hover:bg-[hsl(36_24%_92%)]'
            }`}
            onClick={() => setActiveTab('tidak-aktif')}
          >
            Jadwal Tidak Aktif
          </button>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex-1" />
          <Button variant="primary" onClick={openNew}>
            <Plus className="h-[15px] w-[15px]" />
            Tambah Jadwal Usulan
          </Button>
        </div>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                {["Tahun Anggaran", "Tahap", "Buka", "Tutup", "Status", "Keterangan", ""].map(
                  (h, i) => (
                    <th
                      key={i}
                      className={`border-b border-border px-4 py-[11px] text-left text-xs font-semibold uppercase tracking-[0.04em] text-muted-fg ${
                        i === 6 ? "text-right" : ""
                      }`}
                    >
                      {i === 6 ? "Aksi" : h}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {filteredJadwal.length ? (
                filteredJadwal.map((j) => (
                  <tr key={j.id} className="border-b border-[hsl(34_16%_92%)] last:border-none hover:bg-[hsl(36_24%_97%)]">
                    <td className="px-4 py-3 text-sm font-medium">{j.tahun}</td>
                    <td className="px-4 py-3 text-sm">{j.tahap}</td>
                    <td className="mono px-4 py-3 text-sm text-muted-fg">{j.buka}</td>
                    <td className="mono px-4 py-3 text-sm text-muted-fg">{j.tutup}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-block rounded-full px-2.5 py-1 text-xs font-medium ${
                        j.aktif
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-muted text-muted-fg border border-border'
                      }`}>
                        {j.aktif ? 'Aktif' : 'Tidak Aktif'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-fg">{j.ket}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => openEdit(j)}
                          className="grid h-8 w-8 place-items-center rounded-[7px] text-muted-fg hover:bg-muted hover:text-fg"
                        >
                          <Pencil className="h-[15px] w-[15px]" />
                        </button>
                        <button
                          onClick={() => remove(j.id)}
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
                  colSpan={7}
                  message={activeTab === 'aktif' ? "Belum ada jadwal usulan aktif." : "Belum ada jadwal usulan tidak aktif."}
                />
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal open={dialogOpen} onClose={() => setDialogOpen(false)} width="wide">
        <DialogHead
          title={editing ? "Edit Jadwal Usulan" : "Tambah Jadwal Usulan"}
          desc="Tahun anggaran menentukan periode usulan aktif untuk seluruh SKPD."
        />
        <DialogBody>
          <div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label>Tahun Anggaran</label>
                <select
                  value={form.tahun}
                  onChange={(e) => setForm({ ...form, tahun: e.target.value })}
                >
                  <option value="" disabled>
                    Pilih tahun…
                  </option>
                  {tahunAnggaranList.map((t) => (
                    <option key={t.id} value={t.tahun}>
                      {t.tahun}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label>Tahap Usulan</label>
                <select
                  value={form.tahap}
                  onChange={(e) => setForm({ ...form, tahap: e.target.value })}
                >
                  <option value="" disabled>
                    Pilih tahap…
                  </option>
                  {TAHAP.map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label>Buka Usulan</label>
                <input
                  type="datetime-local"
                  value={toLocalInput(form.buka)}
                  onChange={(e) =>
                    setForm({ ...form, buka: e.target.value.replace("T", " ") })
                  }
                />
              </div>
              <div>
                <label>Tutup Usulan</label>
                <input
                  type="datetime-local"
                  value={toLocalInput(form.tutup)}
                  onChange={(e) =>
                    setForm({ ...form, tutup: e.target.value.replace("T", " ") })
                  }
                />
              </div>
            </div>
            <div>
              <label>Keterangan</label>
              <textarea
                rows={2}
                value={form.ket}
                onChange={(e) => setForm({ ...form, ket: e.target.value })}
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
            {editing ? "Simpan Perubahan" : "Simpan Jadwal"}
          </Button>
        </DialogFoot>
      </Modal>
    </div>
  );
}
