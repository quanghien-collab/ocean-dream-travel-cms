export default function Footer() {
  return (
    <footer className="mt-12 border-t border-slate-200/70 bg-white">
      <div className="container-od py-10 text-sm text-slate-600">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Ocean Dream Travel. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
