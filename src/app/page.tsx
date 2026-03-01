import Link from "next/link";
import PostList from "@/components/PostList";
import NotificationInit from "@/components/NotificationInit";
import { getCurrentUser } from "@/lib/auth";
import { fetchPosts } from "@/lib/posts";

export default async function HomePage() {
  const user = await getCurrentUser();
  const isDriver = user?.role === "driver";
  const isAdmin = user?.role === "admin";

  // Fetch initial posts for SSR
  const initialData = await fetchPosts({
    page: 1,
    filter: "today",
    user,
  });

  return (
    <div>
      {/* FCM initialization for drivers */}
      {isDriver && <NotificationInit />}

      {/* Hero section */}
      <div className="mb-6">
        {isDriver ? (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 sm:p-5">
            <h1 className="text-lg font-bold text-blue-900 mb-1">
              👋 Xin chào, {user?.displayName || user?.username}!
            </h1>
            <p className="text-sm text-blue-700">
              Bạn đang xem bài đăng từ <strong>hành khách</strong>. Tìm hành
              khách phù hợp để kết nối nhé!
            </p>
          </div>
        ) : isAdmin ? (
          <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 sm:p-5">
            <h1 className="text-lg font-bold text-purple-900 mb-1">
              Bảng tin chung
            </h1>
            <p className="text-sm text-purple-700">
              Xem tất cả bài đăng từ tài xế.{" "}
              <Link href="/admin" className="underline font-medium">
                Mở trang quản trị →
              </Link>
            </p>
          </div>
        ) : (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 sm:p-5">
            <h1 className="text-lg font-bold text-green-900 mb-1">
              Tìm xe ghép, xe tiện chuyến?
            </h1>
            <p className="text-sm text-green-700 mb-3">
              Xem bài đăng từ <strong>tài xế</strong> có tuyến đường phù hợp,
              hoặc tự đăng bài để tài xế liên hệ bạn.
            </p>
            <div className="flex flex-wrap gap-2">
              <Link
                href="/dang-bai"
                className="inline-flex items-center gap-1 bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
              >
                + Đăng bài
              </Link>
              <Link
                href="/dang-ky"
                className="inline-flex items-center gap-1 bg-white border border-green-300 text-green-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-50 transition-colors"
              >
                Bạn là tài xế? Đăng ký ngay
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Post list */}
      <PostList initialData={initialData} />
    </div>
  );
}
