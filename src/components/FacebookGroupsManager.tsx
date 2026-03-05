"use client";

import { useState, useEffect, useCallback } from "react";
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

export default function FacebookGroupsManager() {
  const [groups, setGroups] = useState<FacebookGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<FacebookGroup | null>(null);
  const [form, setForm] = useState<FormData>(emptyForm());
  const [formError, setFormError] = useState<string | null>(null);

  // Delete confirmation
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const fetchGroups = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/facebook-groups");
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || "Lỗi tải danh sách nhóm");
      } else {
        setGroups(json.data ?? []);
      }
    } catch {
      setError("Lỗi kết nối");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  function openAdd() {
    setEditingGroup(null);
    setForm(emptyForm());
    setFormError(null);
    setModalOpen(true);
  }

  function openEdit(group: FacebookGroup) {
    setEditingGroup(group);
    setForm({
      facebook_id: group.facebook_id,
      name: group.name,
      posts_in_last_month: String(group.posts_in_last_month),
      total_members: String(group.total_members),
      note: group.note ?? "",
    });
    setFormError(null);
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditingGroup(null);
    setFormError(null);
  }

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
        closeModal();
        await fetchGroups();
      }
    } catch {
      setFormError("Lỗi kết nối");
    } finally {
      setSaving(false);
    }
  }

  async function handleToggle(id: string, is_enabled: boolean) {
    setTogglingId(id);
    try {
      const res = await fetch(`/api/admin/facebook-groups/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_enabled }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || "Lỗi cập nhật trạng thái");
      } else {
        setGroups((prev) =>
          prev.map((g) => (g.id === id ? { ...g, is_enabled } : g)),
        );
      }
    } catch {
      setError("Lỗi kết nối");
    } finally {
      setTogglingId(null);
    }
  }

  async function handleDelete(id: string) {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/facebook-groups/${id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || "Lỗi xóa nhóm");
      } else {
        setDeletingId(null);
        await fetchGroups();
      }
    } catch {
      setError("Lỗi kết nối");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Nhóm Facebook</h2>
        <button
          onClick={openAdd}
          className="flex items-center gap-1.5 px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors"
        >
          <span className="text-base leading-none">+</span>
          Thêm nhóm
        </button>
      </div>

      {error && (
        <p className="mb-4 text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="w-6 h-6 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
        </div>
      ) : groups.length === 0 ? (
        <p className="text-sm text-gray-500 text-center py-8">
          Chưa có nhóm Facebook nào. Nhấn &ldquo;Thêm nhóm&rdquo; để bắt đầu.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                <th className="pb-2 pr-3">Facebook ID</th>
                <th className="pb-2 pr-3">Tên nhóm</th>
                <th className="pb-2 pr-3 text-right whitespace-nowrap">
                  Bài/tháng
                </th>
                <th className="pb-2 pr-3 text-right whitespace-nowrap">
                  Thành viên
                </th>
                <th className="pb-2 pr-3">Ghi chú</th>
                <th className="pb-2 pr-3 text-center">Kích hoạt</th>
                <th className="pb-2 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {groups.map((g) => (
                <tr key={g.id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-2.5 pr-3 font-mono text-xs text-gray-600">
                    {g.facebook_id}
                  </td>
                  <td className="py-2.5 pr-3 font-medium text-gray-900">
                    {g.name}
                  </td>
                  <td className="py-2.5 pr-3 text-right text-gray-600">
                    {g.posts_in_last_month.toLocaleString()}
                  </td>
                  <td className="py-2.5 pr-3 text-right text-gray-600">
                    {g.total_members.toLocaleString()}
                  </td>
                  <td className="py-2.5 pr-3 text-gray-500 max-w-[180px] truncate">
                    {g.note || "—"}
                  </td>
                  <td className="py-2.5 pr-3 text-center">
                    <button
                      onClick={() => handleToggle(g.id, !g.is_enabled)}
                      disabled={togglingId === g.id}
                      aria-label={g.is_enabled ? "Vô hiệu hóa" : "Kích hoạt"}
                      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none disabled:opacity-50 ${
                        g.is_enabled ? "bg-primary-600" : "bg-gray-300"
                      }`}
                    >
                      <span
                        className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${
                          g.is_enabled ? "translate-x-5" : "translate-x-0.5"
                        }`}
                      />
                    </button>
                  </td>
                  <td className="py-2.5 text-right whitespace-nowrap">
                    <button
                      onClick={() => openEdit(g)}
                      className="text-primary-600 hover:text-primary-800 font-medium mr-3 transition-colors"
                    >
                      Sửa
                    </button>
                    <button
                      onClick={() => setDeletingId(g.id)}
                      className="text-red-500 hover:text-red-700 font-medium transition-colors"
                    >
                      Xóa
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add/Edit Modal */}
      {modalOpen && (
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
                  onChange={(e) =>
                    setForm((f) => ({ ...f, name: e.target.value }))
                  }
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
                      setForm((f) => ({
                        ...f,
                        total_members: e.target.value,
                      }))
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ghi chú
                </label>
                <textarea
                  value={form.note}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, note: e.target.value }))
                  }
                  rows={2}
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
                  onClick={closeModal}
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
      )}

      {/* Delete Confirmation Modal */}
      {deletingId && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-5 sm:p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              Xác nhận xóa
            </h3>
            <p className="text-sm text-gray-600 mb-5">
              Bạn có chắc chắn muốn xóa nhóm này không? Hành động này không thể
              hoàn tác.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setDeletingId(null)}
                className="px-4 py-2 text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={() => handleDelete(deletingId)}
                disabled={saving}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-60"
              >
                {saving ? "Đang xóa..." : "Xóa"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
