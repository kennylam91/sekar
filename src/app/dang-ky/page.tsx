"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SignupPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [usernameError, setUsernameError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const validateUsername = (value: string): string => {
    if (value.length < 3) return "Tên đăng nhập phải ít nhất 3 ký tự";
    if (value.length > 50) return "Tên đăng nhập tối đa 50 ký tự";
    if (!/^[a-zA-Z0-9_.-]+$/.test(value))
      return "Chỉ được dùng chữ cái, số, dấu gạch dưới, dấu chấm và dấu gạch ngang";
    return "";
  };

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setUsername(value);
    if (usernameError) setUsernameError(validateUsername(value));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const uErr = validateUsername(username);
    if (uErr) {
      setUsernameError(uErr);
      return;
    }

    if (password !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Đăng ký thất bại");
        return;
      }

      router.push("/");
      router.refresh();
    } catch {
      setError("Lỗi kết nối. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-4">
      <div className="mb-6">
        <Link
          href="/"
          className="text-sm text-gray-500 hover:text-primary-600 transition-colors"
        >
          ← Về trang chủ
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 sm:p-6">
        <h1 className="text-xl font-bold text-gray-900 mb-1">Đăng ký tài xế</h1>
        <p className="text-sm text-gray-500 mb-5">
          Tạo tài khoản để đăng bài tìm hành khách và nhận thông báo khi có hành
          khách mới.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tên đăng nhập
            </label>
            <input
              type="text"
              value={username}
              onChange={handleUsernameChange}
              onBlur={() => setUsernameError(validateUsername(username))}
              placeholder="Ít nhất 3 ký tự, không có khoảng trắng"
              className={`w-full border rounded-lg px-3 py-2.5 text-sm focus:ring-2 outline-none ${
                usernameError
                  ? "border-red-400 focus:ring-red-400 focus:border-red-400"
                  : "border-gray-300 focus:ring-primary-500 focus:border-primary-500"
              }`}
              required
              maxLength={50}
              autoFocus
            />
            {usernameError && (
              <p className="mt-1 text-xs text-red-600">{usernameError}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mật khẩu
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Ít nhất 6 ký tự"
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
              required
              minLength={6}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Xác nhận mật khẩu
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Nhập lại mật khẩu"
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
              required
              minLength={6}
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? "Đang tạo tài khoản..." : "Đăng ký"}
          </button>
        </form>

        <div className="mt-5 pt-5 border-t border-gray-100 text-center">
          <p className="text-sm text-gray-500">
            Đã có tài khoản?{" "}
            <Link
              href="/dang-nhap"
              className="text-primary-600 font-medium hover:underline"
            >
              Đăng nhập
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
