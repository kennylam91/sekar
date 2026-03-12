"use client";

import { useState, useEffect } from "react";
import type { DriverFacebookId } from "@/types";

type FormData = {
  facebook_id: string;
  name: string;
  note: string;
};

const emptyForm = (): FormData => ({
  facebook_id: "",
  name: "",
  note: "",
});

type Props = {
  open: boolean;
  editingEntry: DriverFacebookId | null;
  onClose: () => void;
  onSaved: () => void;
};

export default function DriverFacebookIdFormModal({
  open,
  editingEntry,
  onClose,
  onSaved,
}: Props) {
  const [form, setForm] = useState<FormData>(emptyForm());
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setFormError(null);
    if (editingEntry) {
      setForm({
        facebook_id: editingEntry.facebook_id,
        name: editingEntry.name ?? "",
        note: editingEntry.note ?? "",
      });
    } else {
      setForm(emptyForm());
    }
  }, [open, editingEntry]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    setSaving(true);

    const payload = {
      facebook_id: form.facebook_id.trim(),
      name: form.name.trim() || null,
      note: form.note.trim() || null,
    };

    try {
      const url = editingEntry
        ? `/api/admin/driver-facebook-ids/${editingEntry.id}`
        : "/api/admin/driver-facebook-ids";
      const method = editingEntry ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) {
        setFormError(json.error || "Lỗi hệ thống");
      } else {
        onClose();
        onSaved();
      }
    } catch {
      setFormError("Lỗi kết nối");
    } finally {
      setSaving(false);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-5 sm:p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">
          {editingEntry ? "Chỉnh sửa tài xế Facebook" : "Thêm Facebook ID tài xế"}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Facebook ID <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              disabled={!!editingEntry}
              value={form.facebook_id}
              onChange={(e) =>
                setForm((f) => ({ ...f, facebook_id: e.target.value }))
              }
              placeholder="vd: 100001234567890"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-gray-50"
              required
            />
            <p className="mt-1 text-xs text-gray-500">
              Nhập ID hồ sơ Facebook của tài xế (phần số trong URL hồ sơ).
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tên tài xế
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="vd: Nguyễn Văn A"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ghi chú
            </label>
            <textarea
              value={form.note}
              onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
              rows={3}
              placeholder="Ghi chú tùy chọn..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
            />
          </div>

          {formError && (
            <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">
              {formError}
            </p>
          )}

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors disabled:opacity-60"
            >
              {saving ? "Đang lưu..." : editingEntry ? "Cập nhật" : "Thêm"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
