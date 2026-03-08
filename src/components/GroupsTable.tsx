"use client";

import type { FacebookGroup } from "@/types";

type Props = {
  groups: FacebookGroup[];
  togglingId: string | null;
  onEdit: (group: FacebookGroup) => void;
  onToggle: (id: string, enabled: boolean) => void;
  onDelete: (id: string) => void;
};

export default function GroupsTable({
  groups,
  togglingId,
  onEdit,
  onToggle,
  onDelete,
}: Props) {
  return (
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
              <td className="py-2.5 pr-3 font-mono text-xs">
                <a
                  href={`https://www.facebook.com/groups/${g.facebook_id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-600 hover:text-primary-800 hover:underline"
                >
                  {g.facebook_id}
                </a>
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
                  onClick={() => onToggle(g.id, !g.is_enabled)}
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
                  onClick={() => onEdit(g)}
                  className="text-primary-600 hover:text-primary-800 font-medium mr-3 transition-colors"
                >
                  Sửa
                </button>
                <button
                  onClick={() => onDelete(g.id)}
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
  );
}
