"use client";

import { useState } from "react";

type Props = {
  groupId: string | null;
  onCancel: () => void;
  onDeleted: () => void;
};

export default function DeleteConfirmModal({
  groupId,
  onCancel,
  onDeleted,
}: Props) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    if (!groupId) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/facebook-groups/${groupId}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || "Lỗi xóa nhóm");
      } else {
        onDeleted();
      }
    } catch {
      setError("Lỗi kết nối");
    } finally {
      setSaving(false);
    }
  }

  if (!groupId) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-5 sm:p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-2">Xác nhận xóa</h3>
        <p className="text-sm text-gray-600 mb-5">
          Bạn có chắc chắn muốn xóa nhóm này không? Hành động này không thể hoàn
          tác.
        </p>

        {error && (
          <p className="mb-4 text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        <div className="flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Hủy
          </button>
          <button
            onClick={handleDelete}
            disabled={saving}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-60"
          >
            {saving ? "Đang xóa..." : "Xóa"}
          </button>
        </div>
      </div>
    </div>
  );
}
