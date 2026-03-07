export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-8 py-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-slate-900 rounded flex items-center justify-center">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-5 h-5"
            >
              <path d="M12 2L19 7V17L12 22L5 17V7L12 2Z" />
              <path d="M12 22V12" />
              <path d="M5 17L12 12L19 17" />
              <path d="M12 12L12 2" />
            </svg>
          </div>
          <span className="text-xl font-bold tracking-tight uppercase">Catur</span>
        </div>
        <div className="hidden md:flex gap-8 font-medium">
          <a href="#" className="hover:text-slate-600 transition-colors">Main</a>
          <a href="#" className="hover:text-slate-600 transition-colors">Belajar</a>
          <a href="#" className="hover:text-slate-600 transition-colors">Peringkat</a>
        </div>
        <button className="bg-slate-900 text-white px-5 py-2 rounded-full font-medium hover:bg-slate-800 transition-all">
          Masuk
        </button>
      </nav>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-8 pt-20 pb-32 grid md:grid-cols-2 gap-12 items-center">
        <div className="space-y-8">
          <h1 className="text-6xl md:text-7xl font-extrabold tracking-tight leading-[1.1]">
            Asah Strategi <br />
            <span className="text-slate-400 italic">di Atas Papan.</span>
          </h1>
          <p className="text-xl text-slate-600 max-w-lg leading-relaxed">
            Mainkan catur secara daring dengan teman atau lawan komputer yang menantang. Tingkatkan kemampuanmu dari pemula hingga grandmaster.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <button className="bg-slate-900 text-white text-lg px-8 py-4 rounded-xl font-bold hover:scale-[1.02] transition-transform shadow-lg shadow-slate-200">
              Mulai Bermain
            </button>
            <button className="border-2 border-slate-200 bg-white text-slate-900 text-lg px-8 py-4 rounded-xl font-bold hover:bg-slate-50 transition-colors">
              Pelajari Dasar
            </button>
          </div>
          <div className="flex items-center gap-6 pt-8 border-t border-slate-200">
            <div>
              <p className="text-2xl font-bold">10k+</p>
              <p className="text-sm text-slate-500 uppercase tracking-wider">Pemain Aktif</p>
            </div>
            <div className="w-px h-10 bg-slate-200"></div>
            <div>
              <p className="text-2xl font-bold">50k+</p>
              <p className="text-sm text-slate-500 uppercase tracking-wider">Game Hari Ini</p>
            </div>
          </div>
        </div>

        {/* Visual Element (Chessboard Placeholder) */}
        <div className="relative aspect-square bg-slate-200 rounded-3xl overflow-hidden shadow-2xl border-8 border-white group">
          <div className="absolute inset-0 grid grid-cols-8 grid-rows-8 opacity-40">
            {[...Array(64)].map((_, i) => (
              <div 
                key={i} 
                className={`${(Math.floor(i / 8) + i) % 2 === 0 ? 'bg-white' : 'bg-slate-400'}`}
              />
            ))}
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
             {/* Simplified Chess Piece Icon */}
             <svg
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-48 h-48 text-slate-900 drop-shadow-xl"
            >
              <path d="M19,22H5V20H19V22M17,10C17,8.11 15.8,6.5 14.12,5.88L13,2H11L9.88,5.88C8.2,6.5 7,8.11 7,10C7,11.23 7.5,12.33 8.32,13.12L7,19H17L15.68,13.12C16.5,12.33 17,11.23 17,10Z" />
            </svg>
          </div>
          <div className="absolute bottom-6 right-6 bg-white/90 backdrop-blur px-4 py-2 rounded-lg border border-slate-100 shadow-sm">
             <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Papan Aktif</p>
             <p className="text-sm font-semibold">Tantangan Klasik</p>
          </div>
        </div>
      </main>

      {/* Footer Minimal */}
      <footer className="border-t border-slate-200 py-12 px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-slate-500 text-sm">
            © 2026 Catur. Dibuat dengan semangat kompetisi.
          </p>
          <div className="flex gap-6 text-sm font-medium text-slate-600">
            <a href="#" className="hover:text-slate-900">Privasi</a>
            <a href="#" className="hover:text-slate-900">Syarat</a>
            <a href="#" className="hover:text-slate-900">Kontak</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
