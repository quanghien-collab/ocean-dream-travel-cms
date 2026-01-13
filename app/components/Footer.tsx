export default function Footer() {
  return (
    <footer className="border-t bg-white">
      <div className="container-od py-6 text-center text-sm text-slate-500">
        © {new Date().getFullYear()} Ocean Dream Travel. All rights reserved.
      </div>
    </footer>
  );
}
