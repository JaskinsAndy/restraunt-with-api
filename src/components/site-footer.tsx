export function SiteFooter() {
  return (
    <footer className="relative border-t border-white/10 bg-slate-950/80 px-6 py-12 text-sm text-slate-300 sm:px-12 lg:px-24">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" />
      <div className="mx-auto flex max-w-6xl flex-col gap-8 sm:flex-row sm:justify-between">
        <div className="space-y-3">
          <p className="text-xs uppercase tracking-[0.4em] text-teal-100">Gasthaus Quell</p>
          <p className="max-w-sm text-sm text-slate-300">
            Kaiser-Franz-Josef-Strasse 9, 5640 Bad Gastein - Salzburg, Austria
          </p>
          <p className="text-sm text-slate-400">
            Copyright {new Date().getFullYear()} Gasthaus Quell. Crafted with respect for alpine terroir.
          </p>
        </div>
        <div className="grid gap-4 text-sm sm:grid-cols-2">
          <div className="space-y-1">
            <p className="font-heading text-white">Reservations</p>
            <p>+43 6434 111 222</p>
            <p>concierge@gasthausquell.at</p>
          </div>
          <div className="space-y-1">
            <p className="font-heading text-white">Hours</p>
            <p>Tuesday - Saturday</p>
            <p>17:30 - 23:30</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
