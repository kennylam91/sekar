"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import type { CronJobLog } from "@/types";

interface ScraperInfo {
  api: {
    key_configured: boolean;
    requests_limit: number | null;
    requests_remaining: number | null;
    last_checked_at: string | null;
    api_source: string | null;
  };
  groups: Array<{
    group_id: string;
    name: string | null;
    member_count: number | null;
    last_updated_at: string | null;
    posts_in_last_day: number;
    posts_in_last_month: number;
  }>;
}

interface CronLogsResponse {
  data: CronJobLog[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export default function AdminScraperPage() {
  const [scraperInfo, setScraperInfo] = useState<ScraperInfo | null>(null);
  const [cronLogs, setCronLogs] = useState<CronJobLog[]>([]);
  const [cronLogsTotal, setCronLogsTotal] = useState(0);
  const [cronLogsPage, setCronLogsPage] = useState(1);
  const [cronLogsTotalPages, setCronLogsTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [syncingGroups, setSyncingGroups] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"api" | "groups" | "logs">("api");

  const fetchScraperInfo = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/scraper");
      const data = await res.json();
      if (data.data) setScraperInfo(data.data);
    } catch {
      console.error("Failed to fetch scraper info");
    }
  }, []);

  const fetchCronLogs = useCallback(async (page: number) => {
    try {
      const res = await fetch(`/api/admin/cron-logs?page=${page}`);
      const data: CronLogsResponse = await res.json();
      setCronLogs(data.data || []);
      setCronLogsTotal(data.total || 0);
      setCronLogsPage(data.page || 1);
      setCronLogsTotalPages(data.totalPages || 1);
    } catch {
      console.error("Failed to fetch cron logs");
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      await Promise.all([fetchScraperInfo(), fetchCronLogs(1)]);
      setLoading(false);
    };
    init();
  }, [fetchScraperInfo, fetchCronLogs]);

  const handleSyncGroups = async () => {
    setSyncingGroups(true);
    setSyncMessage(null);
    try {
      const res = await fetch("/api/admin/scraper/sync-groups", {
        method: "POST",
      });
      const data = await res.json();
      if (res.ok) {
        setSyncMessage("Đồng bộ thông tin nhóm thành công!");
        await fetchScraperInfo();
      } else {
        setSyncMessage(`Lỗi: ${data.error}`);
      }
    } catch {
      setSyncMessage("Không thể đồng bộ thông tin nhóm");
    } finally {
      setSyncingGroups(false);
      setTimeout(() => setSyncMessage(null), 5000);
    }
  };

  const formatDate = (iso: string | null) => {
    if (!iso) return "—";
    return new Date(iso).toLocaleString("vi-VN");
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "success":
        return (
          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
            Thành công
          </span>
        );
      case "failed":
        return (
          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
            Thất bại
          </span>
        );
      case "error":
        return (
          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
            Lỗi
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
            {status}
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <Link
          href="/admin"
          className="text-sm text-gray-500 hover:text-primary-600 transition-colors"
        >
          ← Bảng điều khiển
        </Link>
      </div>

      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        Quản lý Facebook Scraper API
      </h1>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {(
          [
            { value: "api", label: "Token API" },
            { value: "groups", label: "Nhóm Facebook" },
            { value: "logs", label: "Lịch sử Cron" },
          ] as const
        ).map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab.value
                ? "bg-primary-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* API Token Tab */}
      {activeTab === "api" && scraperInfo && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Thông tin Token API (RapidAPI)
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
              <p className="text-sm text-gray-500 mb-1">Trạng thái API Key</p>
              {scraperInfo.api.key_configured ? (
                <span className="inline-flex items-center gap-1.5 text-green-700 font-medium">
                  <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
                  Đã cấu hình
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-red-600 font-medium">
                  <span className="w-2 h-2 rounded-full bg-red-500 inline-block" />
                  Chưa cấu hình
                </span>
              )}
            </div>
            <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
              <p className="text-sm text-gray-500 mb-1">Nguồn API</p>
              <p className="font-medium text-gray-800">
                {scraperInfo.api.api_source || "—"}
              </p>
            </div>
            <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
              <p className="text-sm text-blue-600 mb-1">Giới hạn requests</p>
              <p className="text-2xl font-bold text-blue-900">
                {scraperInfo.api.requests_limit !== null
                  ? scraperInfo.api.requests_limit.toLocaleString()
                  : "—"}
              </p>
            </div>
            <div className="p-4 rounded-lg bg-green-50 border border-green-200">
              <p className="text-sm text-green-600 mb-1">Requests còn lại</p>
              <p className="text-2xl font-bold text-green-900">
                {scraperInfo.api.requests_remaining !== null
                  ? scraperInfo.api.requests_remaining.toLocaleString()
                  : "—"}
              </p>
            </div>
          </div>
          {scraperInfo.api.requests_limit !== null &&
            scraperInfo.api.requests_remaining !== null && (
              <div className="mt-4">
                <p className="text-sm text-gray-500 mb-1">
                  Đã sử dụng:{" "}
                  {scraperInfo.api.requests_limit -
                    scraperInfo.api.requests_remaining}{" "}
                  /{scraperInfo.api.requests_limit} requests (
                  {Math.round(
                    ((scraperInfo.api.requests_limit -
                      scraperInfo.api.requests_remaining) /
                      scraperInfo.api.requests_limit) *
                      100,
                  )}
                  %)
                </p>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-primary-600 h-2 rounded-full"
                    style={{
                      width: `${Math.min(
                        100,
                        Math.round(
                          ((scraperInfo.api.requests_limit -
                            scraperInfo.api.requests_remaining) /
                            scraperInfo.api.requests_limit) *
                            100,
                        ),
                      )}%`,
                    }}
                  />
                </div>
              </div>
            )}
          {scraperInfo.api.last_checked_at && (
            <p className="mt-3 text-xs text-gray-400">
              Cập nhật lần cuối: {formatDate(scraperInfo.api.last_checked_at)}
            </p>
          )}
        </div>
      )}

      {/* Groups Tab */}
      {activeTab === "groups" && scraperInfo && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Nhóm Facebook đang theo dõi ({scraperInfo.groups.length})
            </h2>
            <div className="flex items-center gap-3">
              {syncMessage && (
                <p
                  className={`text-sm ${syncMessage.startsWith("Lỗi") || syncMessage.startsWith("Không") ? "text-red-600" : "text-green-600"}`}
                >
                  {syncMessage}
                </p>
              )}
              <button
                onClick={handleSyncGroups}
                disabled={syncingGroups}
                className="px-3 py-1.5 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors"
              >
                {syncingGroups ? "Đang đồng bộ..." : "Đồng bộ thông tin"}
              </button>
            </div>
          </div>

          {scraperInfo.groups.length === 0 ? (
            <p className="text-gray-500 text-sm">
              Chưa cấu hình nhóm Facebook nào (NEXT_CRON_FACEBOOK_GROUPS).
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 px-3 text-gray-500 font-medium">
                      ID Nhóm
                    </th>
                    <th className="text-left py-2 px-3 text-gray-500 font-medium">
                      Tên nhóm
                    </th>
                    <th className="text-right py-2 px-3 text-gray-500 font-medium">
                      Thành viên
                    </th>
                    <th className="text-right py-2 px-3 text-gray-500 font-medium">
                      Bài 24h qua
                    </th>
                    <th className="text-right py-2 px-3 text-gray-500 font-medium">
                      Bài 30 ngày qua
                    </th>
                    <th className="text-left py-2 px-3 text-gray-500 font-medium">
                      Cập nhật lúc
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {scraperInfo.groups.map((group) => (
                    <tr
                      key={group.group_id}
                      className="border-b border-gray-100 hover:bg-gray-50"
                    >
                      <td className="py-2 px-3 font-mono text-xs text-gray-600">
                        {group.group_id}
                      </td>
                      <td className="py-2 px-3 text-gray-800">
                        {group.name || (
                          <span className="text-gray-400 italic">Chưa có</span>
                        )}
                      </td>
                      <td className="py-2 px-3 text-right text-gray-700">
                        {group.member_count !== null
                          ? group.member_count.toLocaleString()
                          : "—"}
                      </td>
                      <td className="py-2 px-3 text-right font-medium text-blue-700">
                        {group.posts_in_last_day}
                      </td>
                      <td className="py-2 px-3 text-right font-medium text-purple-700">
                        {group.posts_in_last_month}
                      </td>
                      <td className="py-2 px-3 text-gray-400 text-xs">
                        {formatDate(group.last_updated_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Cron Logs Tab */}
      {activeTab === "logs" && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Lịch sử chạy Cron ({cronLogsTotal})
            </h2>
          </div>

          {cronLogs.length === 0 ? (
            <p className="text-gray-500 text-sm">Chưa có lịch sử cron job.</p>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-2 px-3 text-gray-500 font-medium">
                        Thời gian
                      </th>
                      <th className="text-left py-2 px-3 text-gray-500 font-medium">
                        ID Nhóm
                      </th>
                      <th className="text-left py-2 px-3 text-gray-500 font-medium">
                        Nguồn API
                      </th>
                      <th className="text-center py-2 px-3 text-gray-500 font-medium">
                        Trạng thái
                      </th>
                      <th className="text-right py-2 px-3 text-gray-500 font-medium">
                        Đã lấy
                      </th>
                      <th className="text-right py-2 px-3 text-gray-500 font-medium">
                        Tạo mới
                      </th>
                      <th className="text-right py-2 px-3 text-gray-500 font-medium">
                        Bỏ qua
                      </th>
                      <th className="text-right py-2 px-3 text-gray-500 font-medium">
                        Hành khách
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {cronLogs.map((log) => (
                      <tr
                        key={log.id}
                        className="border-b border-gray-100 hover:bg-gray-50"
                      >
                        <td className="py-2 px-3 text-gray-600 text-xs whitespace-nowrap">
                          {formatDate(log.run_at)}
                        </td>
                        <td className="py-2 px-3 font-mono text-xs text-gray-600">
                          {log.group_id || "—"}
                        </td>
                        <td className="py-2 px-3 text-gray-600 text-xs">
                          {log.api_source || "—"}
                        </td>
                        <td className="py-2 px-3 text-center">
                          {getStatusBadge(log.status)}
                        </td>
                        <td className="py-2 px-3 text-right text-gray-700">
                          {log.total_fetched}
                        </td>
                        <td className="py-2 px-3 text-right font-medium text-green-700">
                          {log.total_created}
                        </td>
                        <td className="py-2 px-3 text-right text-gray-500">
                          {log.total_skipped}
                        </td>
                        <td className="py-2 px-3 text-right font-medium text-blue-700">
                          {log.total_passenger_posts}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {cronLogsTotalPages > 1 && (
                <div className="flex justify-center gap-2 mt-4">
                  <button
                    onClick={() => {
                      const newPage = cronLogsPage - 1;
                      setCronLogsPage(newPage);
                      fetchCronLogs(newPage);
                    }}
                    disabled={cronLogsPage <= 1}
                    className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50 transition-colors"
                  >
                    ← Trước
                  </button>
                  <span className="px-3 py-1.5 text-sm text-gray-600">
                    {cronLogsPage} / {cronLogsTotalPages}
                  </span>
                  <button
                    onClick={() => {
                      const newPage = cronLogsPage + 1;
                      setCronLogsPage(newPage);
                      fetchCronLogs(newPage);
                    }}
                    disabled={cronLogsPage >= cronLogsTotalPages}
                    className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50 transition-colors"
                  >
                    Sau →
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
