"use client";

import { useState, useEffect, useCallback } from "react";
import type { FacebookGroup } from "@/types";
import GroupsTable from "./GroupsTable";
import GroupFormModal from "./GroupFormModal";
import DeleteConfirmModal from "./DeleteConfirmModal";

export default function FacebookGroupsManager() {
  const [groups, setGroups] = useState<FacebookGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<FacebookGroup | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

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
    setModalOpen(true);
  }

  function openEdit(group: FacebookGroup) {
    setEditingGroup(group);
    setModalOpen(true);
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
        <GroupsTable
          groups={groups}
          togglingId={togglingId}
          onEdit={openEdit}
          onToggle={handleToggle}
          onDelete={setDeletingId}
        />
      )}

      <GroupFormModal
        open={modalOpen}
        editingGroup={editingGroup}
        onClose={() => setModalOpen(false)}
        onSaved={fetchGroups}
      />

      <DeleteConfirmModal
        itemId={deletingId}
        deleteUrl={(id) => `/api/admin/facebook-groups/${id}`}
        confirmMessage="Bạn có chắc chắn muốn xóa nhóm này không? Hành động này không thể hoàn tác."
        onCancel={() => setDeletingId(null)}
        onDeleted={() => {
          setDeletingId(null);
          fetchGroups();
        }}
      />
    </div>
  );
}
