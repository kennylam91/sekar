import Link from "next/link";
import PostForm from "@/components/PostForm";
import { getCurrentUser } from "@/lib/auth";

export default async function CreatePostPage() {
  const user = await getCurrentUser();
  const isDriver = user?.role === "driver";

  return (
    <div className="max-w-lg mx-auto">
      <div className="mb-6">
        <Link
          href="/"
          className="text-sm text-gray-500 hover:text-primary-600 transition-colors"
        >
          ← Về trang chủ
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 sm:p-6">
        <h1 className="text-xl font-bold text-gray-900 mb-1">
          {isDriver ? "Đăng bài tìm hành khách" : "Đăng bài tìm xe"}
        </h1>
        <p className="text-sm text-gray-500 mb-5">
          {isDriver
            ? "Mô tả tuyến đường và thông tin liên hệ để hành khách tìm thấy bạn."
            : "Mô tả nơi bạn muốn đi và thông tin liên hệ để tài xế liên hệ bạn."}
        </p>

        <PostForm isDriver={isDriver} />
      </div>
    </div>
  );
}
