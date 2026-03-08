"use client";

import { useState, useEffect } from "react";
import type { FacebookGroup } from "@/types";

type FormData = {
  facebook_id: string;
  name: string;
  posts_in_last_month: string;
  total_members: string;
  note: string;
};

const emptyForm = (): FormData => ({
  facebook_id: "",
  name: "",
  posts_in_last_month: "0",
  total_members: "0",
  note: "",
});

const routeOptions = (
  (process.env.NEXT_PUBLIC_ROUTE_OPTIONS ?? "")
    .split("\n")
    .map((value) => value.split(",")).flat()
    .map((value) => value.trim().toUpperCase())
    .filter((value) => value)
);

type Props = {
  open: boolean;
  editingGroup: FacebookGroup | null;
  onClose: () => void;
  onSaved: () => void;
};

export default function GroupFormModal({
  open,
  editingGroup,
  onClose,
  onSaved,
}: Props) {
  const [form, setForm] = useState<FormData>(emptyForm());
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [selectedRoutes, setSelectedRoutes] = useState<string[]>([]);

  function handleRoutesChange(event: React.ChangeEvent<HTMLSelectElement>) {
    const options = Array.from(event.target.selectedOptions, (opt) => opt.value);
    setSelectedRoutes(options);
  }

  useEffect(() => {
    if (!open) return;
    setFormError(null);
    if (editingGroup) {
      setForm({
        facebook_id: editingGroup.facebook_id,
        name: editingGroup.name,
        posts_in_last_month: String(editingGroup.posts_in_last_month),
        total_members: String(editingGroup.total_members),
        note: editingGroup.note ?? "",
      });
      setSelectedRoutes(editingGroup.routes);
    } else {
      setForm(emptyForm());
      setSelectedRoutes([]);
    }
  }, [open, editingGroup]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    setSaving(true);

    const payload = {
      facebook_id: form.facebook_id.trim(),
      name: form.name.trim(),
      posts_in_last_month: parseInt(form.posts_in_last_month) || 0,
      total_members: parseInt(form.total_members) || 0,
      note: form.note.trim() || null,
      routes: selectedRoutes,
    };

    try {
      const url = editingGroup
        ? `/api/admin/facebook-groups/${editingGroup.id}`
        : "/api/admin/facebook-groups";
      const method = editingGroup ? "PUT" : "POST";

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
          {editingGroup ? "Chỉnh sửa nhóm" : "Thêm nhóm Facebook"}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Facebook ID <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              disabled={!!editingGroup}
              value={form.facebook_id}
              onChange={(e) =>
                setForm((f) => ({ ...f, facebook_id: e.target.value }))
              }
              placeholder="vd: 142026696530246"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tên nhóm <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="vd: Xe Buôn Ma Thuột - Hà Nội"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bài trong tháng
              </label>
              <input
                type="number"
                min="0"
                value={form.posts_in_last_month}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    posts_in_last_month: e.target.value,
                  }))
                }
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tổng thành viên
              </label>
              <input
                type="number"
                min="0"
                value={form.total_members}
                onChange={(e) =>
                  setForm((f) => ({ ...f, total_members: e.target.value }))
                }
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tuyến 
            </label>
            <select
              multiple
              value={selectedRoutes}
              onChange={handleRoutesChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 h-auto"
            >
              {routeOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            {routeOptions.length === 0 && (
              <p className="text-xs text-red-500 mt-1">
                Chưa cấu hình tuyến nào (NEXT_PUBLIC_ROUTE_OPTIONS).
              </p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              Giữ phím Ctrl/Cmd để chọn nhiều tuyến.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ghi chú
            </label>
            <textarea
              value={form.note}
              onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
              rows={4}
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
              {saving ? "Đang lưu..." : editingGroup ? "Cập nhật" : "Thêm"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
