"use client";

import { useState, useEffect, useCallback } from "react";
import type { DriverFacebookId } from "@/types";
import DriverFacebookIdsTable from "./DriverFacebookIdsTable";
import DriverFacebookIdFormModal from "./DriverFacebookIdFormModal";
import DeleteConfirmModal from "./DeleteConfirmModal";

export default function DriverFacebookIdsManager() {
  const [entries, setEntries] = useState<DriverFacebookId[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<DriverFacebookId | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchEntries = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/driver-facebook-ids");
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || "Lỗi tải danh sách");
      } else {
        setEntries(json.data ?? []);
      }
    } catch {
      setError("Lỗi kết nối");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  function openAdd() {
    setEditingEntry(null);
    setModalOpen(true);
  }

  function openEdit(entry: DriverFacebookId) {
    setEditingEntry(entry);
    setModalOpen(true);
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">
          Facebook ID tài xế
        </h2>
        <button
          onClick={openAdd}
          className="flex items-center gap-1.5 px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors"
        >
          <span className="text-base leading-none">+</span>
          Thêm tài xế
        </button>
      </div>

      <p className="text-sm text-gray-500 mb-4">
        Các Facebook ID được đăng ký ở đây sẽ được tự động nhận diện là bài
        đăng của tài xế khi cron job lấy bài từ Facebook.
      </p>

      {error && (
        <p className="mb-4 text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="w-6 h-6 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
        </div>
      ) : entries.length === 0 ? (
        <p className="text-sm text-gray-500 text-center py-8">
          Chưa có Facebook ID tài xế nào. Nhấn &ldquo;Thêm tài xế&rdquo; để bắt đầu.
        </p>
      ) : (
        <DriverFacebookIdsTable
          entries={entries}
          onEdit={openEdit}
          onDelete={setDeletingId}
        />
      )}

      <DriverFacebookIdFormModal
        open={modalOpen}
        editingEntry={editingEntry}
        onClose={() => setModalOpen(false)}
        onSaved={fetchEntries}
      />

      <DeleteConfirmModal
        itemId={deletingId}
        deleteUrl={(id) => `/api/admin/driver-facebook-ids/${id}`}
        confirmMessage="Bạn có chắc chắn muốn xóa Facebook ID tài xế này không? Hành động này không thể hoàn tác."
        onCancel={() => setDeletingId(null)}
        onDeleted={() => {
          setDeletingId(null);
          fetchEntries();
        }}
      />
    </div>
  );
}
