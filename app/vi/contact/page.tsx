export const metadata = {
  title: "Liên hệ tư vấn | Ocean Dream Travel",
  description: "Đăng ký tư vấn tour du lịch, nghỉ dưỡng cao cấp cùng Ocean Dream Travel."
};

export default function ContactPageVI() {
  return (
    <main className="container-od py-12">
      {/* HEADER */}
      <div className="max-w-2xl mb-10">
        <h1 className="text-3xl font-semibold mb-3">Đăng ký tư vấn</h1>
        <p className="text-slate-600">
          Để lại thông tin, đội ngũ Ocean Dream Travel sẽ liên hệ ngay để tư vấn tour phù hợp nhất cho bạn.
        </p>
      </div>

      {/* CONTENT */}
      <div className="grid lg:grid-cols-2 gap-10 items-start">

        {/* FORM */}
        <div className="card p-6">
          <div className="space-y-4">
            <div>
              <label className="label">Họ và tên</label>
              <input className="input" placeholder="Nhập họ tên của bạn" />
            </div>

            <div>
              <label className="label">Số điện thoại</label>
              <input className="input" placeholder="Nhập số điện thoại" />
            </div>

            <div>
              <label className="label">Email (tuỳ chọn)</label>
              <input className="input" placeholder="Nhập email nếu có" />
            </div>

            <div>
              <label className="label">Nhu cầu tư vấn</label>
              <textarea
                className="input min-h-[120px]"
                placeholder="Ví dụ: Tour Phú Quốc 4N3Đ cho gia đình 4 người..."
              />
            </div>

            <button className="btn btn-primary w-full">
              Gửi yêu cầu tư vấn
            </button>

            <p className="text-xs text-slate-500 text-center">
              (Bản demo: form sẽ chuyển về trang chủ. Lucky có thể nâng cấp lưu DB + gửi email tự động.)
            </p>
          </div>
        </div>

        {/* INFO */}
        <div className="card p-6">
          <h2 className="text-xl font-semibold mb-4">Ocean Dream Travel</h2>

          <ul className="space-y-3 text-slate-700">
            <li>📞 Hotline: <b>0909 909 199</b></li>
            <li>💬 Zalo: <b>0909 909 199</b></li>
            <li>✉ Email: <b>ocean-dream-travel@com.vn</b></li>
          </ul>

          <div className="mt-6 text-sm text-slate-500">
            Chúng tôi chuyên tổ chức tour nghỉ dưỡng cao cấp, resort 5 sao, tour gia đình và tour trải nghiệm.
          </div>
        </div>

      </div>
    </main>
  );
}
