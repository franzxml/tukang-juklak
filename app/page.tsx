import Link from "next/link";
import Image from "next/image";

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white font-sans text-zinc-900">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-zinc-100 bg-white/80 px-6 py-4 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-black"></div>
            <span className="text-xl font-bold tracking-tight">Tukang Juklak</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/login" className="text-sm font-medium hover:text-black">
              Masuk
            </Link>
            <Link
              href="/login"
              className="rounded-full bg-black px-5 py-2 text-sm font-semibold text-white transition-all hover:bg-zinc-800"
            >
              Mulai Sekarang
            </Link>
          </div>
        </div>
      </nav>

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative overflow-hidden px-6 py-24 sm:py-32 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <div className="mb-8 flex justify-center">
              <span className="rounded-full bg-zinc-100 px-4 py-1.5 text-sm font-medium text-zinc-600">
                🚀 Solusi Juklak Terpadu untuk Panitia
              </span>
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl text-black">
              Tinggalkan Google Dokumen, Buat Juklak Kepanitiaan Lebih Terstruktur!
            </h1>
            <p className="mt-8 text-lg leading-8 text-zinc-600">
              Kelola susunan acara, penanggung jawab, dan teknis pelaksanaan dalam satu platform yang rapi. 
              Mudah dibagikan, bisa diajukan edit, dan siap cetak kapan saja.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link
                href="/login"
                className="rounded-full bg-black px-8 py-4 text-base font-semibold text-white shadow-sm transition-all hover:bg-zinc-800 hover:scale-105"
              >
                Mulai Sekarang — Gratis
              </Link>
              <a href="#features" className="text-sm font-semibold leading-6 text-zinc-900">
                Pelajari fitur <span aria-hidden="true">→</span>
              </a>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="bg-zinc-50 py-24 sm:py-32">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-base font-semibold leading-7 text-zinc-600 uppercase tracking-widest">Fitur Unggulan</h2>
              <p className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl text-black">Semua yang Anda Butuhkan untuk Juklak Profesional</p>
            </div>
            <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
              <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
                {/* Feature 1 */}
                <div className="flex flex-col">
                  <dt className="flex items-center gap-x-3 text-lg font-bold text-black">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-black">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-6 w-6 text-white">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 0 1 0 3.75H5.625a1.875 1.875 0 0 1 0-3.75Z" />
                      </svg>
                    </div>
                    Format Terstandar
                  </dt>
                  <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-zinc-600">
                    <p className="flex-auto text-sm">Input data yang terorganisir mulai dari waktu, penanggung jawab, hingga teknis pelaksanaan. Tidak ada lagi format berantakan.</p>
                  </dd>
                </div>
                {/* Feature 2 */}
                <div className="flex flex-col">
                  <dt className="flex items-center gap-x-3 text-lg font-bold text-black">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-black">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-6 w-6 text-white">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
                      </svg>
                    </div>
                    Kolaborasi & Akses Edit
                  </dt>
                  <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-zinc-600">
                    <p className="flex-auto text-sm">Bagikan link ke panitia lain. Mereka bisa melihat secara publik atau mengajukan akses edit untuk membantu menyusun acara.</p>
                  </dd>
                </div>
                {/* Feature 3 */}
                <div className="flex flex-col">
                  <dt className="flex items-center gap-x-3 text-lg font-bold text-black">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-black">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-6 w-6 text-white">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0 1 10.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0 .229 2.523a1.125 1.125 0 0 1-1.12 1.227H7.231a1.125 1.125 0 0 1-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0 0 21 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 0 0-1.913-.247M6.34 18H5.25A2.25 2.25 0 0 1 3 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 0 1 1.913-.247m10.5 0a48.536 48.536 0 0 0-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.658" />
                      </svg>
                    </div>
                    Export PDF Mudah
                  </dt>
                  <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-zinc-600">
                    <p className="flex-auto text-sm">Cetak juklak menjadi dokumen PDF resmi yang rapi hanya dengan satu klik. Siap untuk dipresentasikan atau dicetak fisik.</p>
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </section>

        {/* Call to Action Section */}
        <section className="py-24 sm:py-32">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="relative isolate overflow-hidden bg-black px-6 py-24 text-center shadow-2xl rounded-3xl sm:px-16">
              <h2 className="mx-auto max-w-2xl text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Siap menyusun acara Anda hari ini?
              </h2>
              <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-zinc-300">
                Bergabunglah dengan ratusan panitia yang telah beralih ke Tukang Juklak untuk manajemen acara yang lebih baik.
              </p>
              <div className="mt-10 flex items-center justify-center gap-x-6">
                <Link
                  href="/login"
                  className="rounded-full bg-white px-8 py-4 text-base font-semibold text-black shadow-sm transition-all hover:bg-zinc-100 hover:scale-105"
                >
                  Mulai Sekarang
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-100 bg-white py-12">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <div className="flex items-center gap-2 text-black">
              <div className="h-6 w-6 rounded-md bg-black"></div>
              <span className="text-lg font-bold tracking-tight">Tukang Juklak</span>
            </div>
            <p className="text-sm text-zinc-500">
              © {new Date().getFullYear()} Tukang Juklak. Build for efficiency.
            </p>
            <div className="flex gap-6">
              <a href="#" className="text-sm text-zinc-500 hover:text-black">Dokumentasi</a>
              <a href="#" className="text-sm text-zinc-500 hover:text-black">Kontak</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
