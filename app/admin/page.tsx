export default function AdminDashboard() {
  return (
    <div className="card p-7">
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <p className="mt-2 text-slate-600">
        Đây là CMS realtime cho website du lịch. Vào <b>Site Settings</b> để sửa banner/trang chủ, vào <b>Tours</b> để quản lý tour.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="card p-5">
          <p className="text-sm text-slate-600">Luồng hoạt động</p>
          <p className="mt-1 font-medium">Admin → Save → Website cập nhật ngay</p>
          <p className="mt-2 text-sm text-slate-600">Không cần deploy lại, không đụng code.</p>
        </div>
        <div className="card p-5">
          <p className="text-sm text-slate-600">Nâng cấp nhanh</p>
          <p className="mt-1 text-sm text-slate-600">• Form booking lưu lead vào DB</p>
          <p className="mt-1 text-sm text-slate-600">• Chatbot tư vấn tour</p>
          <p className="mt-1 text-sm text-slate-600">• Thanh toán / đặt cọc</p>
        </div>
      </div>
    </div>
  );
}
