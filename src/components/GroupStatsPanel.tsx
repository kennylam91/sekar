"use client";

import { useState, useEffect, useCallback } from "react";
import type { GroupStats } from "@/types";

function Pct({ pct, total }: { pct: number; total: number }) {
  if (total === 0) return <span className="text-gray-300">—</span>;
  return (
    <span
      className={
        pct >= 70
          ? "text-green-600 font-medium"
          : pct >= 40
            ? "text-yellow-600"
            : "text-gray-500"
      }
    >
      {pct}%
    </span>
  );
}

export default function GroupStatsPanel() {
  const [stats, setStats] = useState<GroupStats[]>([]);
  const [dateLabels, setDateLabels] = useState<string[]>([]);
  const [dailyDays, setDailyDays] = useState<7 | 14>(14);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/facebook-groups/stats");
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || "Lỗi tải thống kê");
      } else {
        setStats(json.data ?? []);
        setDateLabels(json.dateLabels ?? []);
      }
    } catch {
      setError("Lỗi kết nối");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10">
        <p className="text-red-500">{error}</p>
        <button
          onClick={fetchStats}
          className="mt-3 text-sm text-primary-600 hover:underline"
        >
          Thử lại
        </button>
      </div>
    );
  }

  if (stats.length === 0) {
    return (
      <p className="text-center py-10 text-gray-400">Chưa có dữ liệu nhóm.</p>
    );
  }

  // "2026-03-16" → "03/16"
  const shortDate = (d: string) => d.slice(5).replace("-", "/");

  // Slice to selected range (API always returns 14 days, oldest first)
  const visibleLabels = dateLabels.slice(-dailyDays);

  return (
    <div className="space-y-8">
      {/* Summary table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 sm:p-6">
        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">
          Tổng quan theo nhóm
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                <th className="pb-2 pr-4">Nhóm</th>
                <th className="pb-2 pr-3 text-right">Hôm nay</th>
                <th className="pb-2 pr-3 text-right">% Khách</th>
                <th className="pb-2 pr-3 text-right whitespace-nowrap">
                  Tháng này
                </th>
                <th className="pb-2 pr-3 text-right">% Khách</th>
                <th className="pb-2 pr-3 text-right">Tất cả</th>
                <th className="pb-2 text-right">% Khách</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {stats.map((g) => (
                <tr key={g.group_id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-2.5 pr-4 font-medium text-gray-900 max-w-[200px] truncate">
                    {g.name}
                  </td>
                  <td className="py-2.5 pr-3 text-right tabular-nums text-gray-700">
                    {g.today.total}
                  </td>
                  <td className="py-2.5 pr-3 text-right tabular-nums">
                    <Pct pct={g.today.passenger_pct} total={g.today.total} />
                  </td>
                  <td className="py-2.5 pr-3 text-right tabular-nums text-gray-700">
                    {g.month.total}
                  </td>
                  <td className="py-2.5 pr-3 text-right tabular-nums">
                    <Pct pct={g.month.passenger_pct} total={g.month.total} />
                  </td>
                  <td className="py-2.5 pr-3 text-right tabular-nums text-gray-700">
                    {g.alltime.total}
                  </td>
                  <td className="py-2.5 text-right tabular-nums">
                    <Pct
                      pct={g.alltime.passenger_pct}
                      total={g.alltime.total}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Daily breakdown */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
            Bài đăng hàng ngày
          </h3>
          <select
            value={dailyDays}
            onChange={(e) => setDailyDays(Number(e.target.value) as 7 | 14)}
            className="text-xs border border-gray-200 rounded-md px-2 py-1 text-gray-600 bg-white focus:outline-none focus:ring-1 focus:ring-primary-400"
          >
            <option value={7}>7 ngày gần nhất</option>
            <option value={14}>14 ngày gần nhất</option>
          </select>
        </div>
        <div className="overflow-x-auto">
          <table className="text-xs">
            <thead>
              <tr className="border-b border-gray-100 text-gray-500">
                <th className="pb-2 pr-4 text-left font-medium whitespace-nowrap">
                  Nhóm
                </th>
                {visibleLabels.map((d) => (
                  <th
                    key={d}
                    className="pb-2 px-1.5 text-right font-medium whitespace-nowrap"
                  >
                    {shortDate(d)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {stats.map((g) => (
                <tr key={g.group_id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-2 pr-4 font-medium text-gray-800 whitespace-nowrap max-w-[160px] truncate">
                    {g.name}
                  </td>
                  {g.daily
                    .filter((d) => visibleLabels.includes(d.date))
                    .map((d) => (
                      <td
                        key={d.date}
                        className="py-2 px-1.5 text-right tabular-nums"
                        title={`${d.date}: ${d.passenger} khách / ${d.total} bài`}
                      >
                        {d.total === 0 ? (
                          <span className="text-gray-200">0/0</span>
                        ) : (
                          <span
                            className={
                              d.total >= 10
                                ? "font-semibold text-primary-700"
                                : d.total >= 5
                                  ? "text-primary-600"
                                  : "text-gray-600"
                            }
                          >
                            {d.passenger}/{d.total}
                          </span>
                        )}
                      </td>
                    ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs text-gray-400">
          Mỗi ô: <span className="font-medium">khách / tổng</span>. Rê chuột vào ô để xem ngày và số liệu chi tiết.
        </p>
      </div>
    </div>
  );
}
