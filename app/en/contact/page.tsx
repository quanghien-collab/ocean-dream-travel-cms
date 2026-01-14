export const metadata = {
  title: "Contact | Ocean Dream Travel",
  description: "Register for travel consultation with Ocean Dream Travel."
};

export default function ContactPageEN() {
  return (
    <main className="container-od py-12">
      <h1 className="text-3xl font-semibold mb-4">Consultation Registration</h1>

      <div className="grid lg:grid-cols-2 gap-10">

        <div className="card p-6 space-y-4">
          <input className="input" placeholder="Full name" />
          <input className="input" placeholder="Phone number" />
          <input className="input" placeholder="Email (optional)" />
          <textarea className="input min-h-[120px]" placeholder="Your travel needs..." />
          <button className="btn btn-primary w-full">Send request</button>
        </div>

        <div className="card p-6">
          <h2 className="text-xl font-semibold mb-4">Ocean Dream Travel</h2>
          <ul className="space-y-2">
            <li>📞 Hotline: 0909 909 199</li>
            <li>💬 Zalo: 0909 909 199</li>
            <li>✉ ocean-dream-travel@com.vn</li>
          </ul>
        </div>

      </div>
    </main>
  );
}
