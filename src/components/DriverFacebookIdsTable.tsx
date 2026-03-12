"use client";

import type { DriverFacebookId } from "@/types";

type Props = {
  entries: DriverFacebookId[];
  onEdit: (entry: DriverFacebookId) => void;
  onDelete: (id: string) => void;
};

export default function DriverFacebookIdsTable({
  entries,
  onEdit,
  onDelete,
}: Props) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
            <th className="pb-2 pr-3">Facebook ID</th>
            <th className="pb-2 pr-3">Tên tài xế</th>
            <th className="pb-2 pr-3">Ghi chú</th>
            <th className="pb-2 text-right">Thao tác</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {entries.map((entry) => (
            <tr key={entry.id} className="hover:bg-gray-50 transition-colors">
              <td className="py-2.5 pr-3 font-mono text-xs">
                <a
                  href={
                    /^\d+$/.test(entry.facebook_id)
                      ? `https://www.facebook.com/profile.php?id=${entry.facebook_id}`
                      : `https://www.facebook.com/${entry.facebook_id}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-600 hover:text-primary-800 hover:underline"
                >
                  {entry.facebook_id}
                </a>
              </td>
              <td className="py-2.5 pr-3 font-medium text-gray-900">
                {entry.name || "—"}
              </td>
              <td className="py-2.5 pr-3 text-gray-500 max-w-[220px] truncate">
                {entry.note || "—"}
              </td>
              <td className="py-2.5 text-right whitespace-nowrap">
                <button
                  onClick={() => onEdit(entry)}
                  className="text-primary-600 hover:text-primary-800 font-medium mr-3 transition-colors"
                >
                  Sửa
                </button>
                <button
                  onClick={() => onDelete(entry.id)}
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
