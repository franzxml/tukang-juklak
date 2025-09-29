<?php
$page = $_GET['page'] ?? '';
if ($page === 'home') {
    header('Location: /home.php');
    exit;
}
?>
<!doctype html>
<html lang="id">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Dashboard Pemrograman Berorientasi Objek</title>
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
  <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css" rel="stylesheet">
  <style>
    :root{
      --bg: #f8f9fa;
      --text: #212529;
      --muted: #6c757d;
      --brand: #0d6efd;
      --accent: #6610f2;
    }
    body{
      background: var(--bg);
      color: var(--text);
      min-height:100vh;
    }
    .glass{background:rgba(255,255,255,.8);border:1px solid rgba(0,0,0,.05);backdrop-filter:blur(6px)}
    .brand{color:var(--brand)}
    .accent{color:var(--accent)}
    .card-link{background:#fff;border:1px solid rgba(0,0,0,.08);transition:.2s}
    .card-link:hover{background:#f1f3f5}
    a{text-decoration:none}
    .navbar{background:#fff !important;border-bottom:1px solid rgba(0,0,0,.05)}
  </style>
</head>
<body>
  <nav class="navbar navbar-expand-lg sticky-top py-3">
    <div class="container">
      <a class="navbar-brand fw-semibold text-dark" href="/">
        <i class="bi bi-braces brand"></i>
        <span class="ms-2">Pemrograman Berorientasi Objek</span>
      </a>
      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#nav">
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="nav">
        <ul class="navbar-nav ms-auto">
          <li class="nav-item"><a class="nav-link text-dark-50" href="?page=home">Home</a></li>
          <li class="nav-item"><a class="nav-link text-dark-50" href="#latihan">Latihan</a></li>
          <li class="nav-item"><a class="nav-link text-dark-50" href="#tugas">Tugas</a></li>
          <li class="nav-item"><a class="nav-link text-dark-50" href="#inheritance">Inheritance</a></li>
          <li class="nav-item"><a class="nav-link text-dark-50" href="#pertemuan5">Pertemuan 5</a></li>
          <li class="nav-item"><a class="nav-link text-dark-50" href="#pertemuan6">Praktikum 6</a></li>
          <li class="nav-item"><a class="nav-link text-dark-50" href="#tugas-abstraksi">Tugas Abstraksi & Polimorfisme</a></li>
        </ul>
      </div>
    </div>
  </nav>

  <header class="py-5 bg-light">
    <div class="container">
      <div class="row align-items-center g-4">
        <div class="col-lg-7">
          <h1 class="display-5 fw-bold">Halo! 👋</h1>
          <p class="lead text-muted">Ini adalah beranda indeks untuk latihan dan tugas. Dibuat oleh Frans Maylandgo Saragih.</p>
          <div class="d-flex gap-2">
            <a href="#latihan" class="btn btn-primary btn-lg"><i class="bi bi-rocket-takeoff"></i> Ke Latihan</a>
            <a href="#tugas" class="btn btn-outline-dark btn-lg"><i class="bi bi-journal-code"></i> Ke Tugas</a>
            <a href="#inheritance" class="btn btn-outline-dark btn-lg"><i class="bi bi-diagram-3"></i> Ke Inheritance</a>
            <a href="#pertemuan5" class="btn btn-outline-dark btn-lg"><i class="bi bi-people"></i> Ke Pertemuan 5</a>
            <a href="#pertemuan6" class="btn btn-outline-dark btn-lg"><i class="bi bi-flower3"></i> Ke Praktikum 6</a>
            <a href="#tugas-abstraksi" class="btn btn-outline-dark btn-lg"><i class="bi bi-journal-text"></i> Ke Tugas Abstraksi</a>
          </div>
        </div>
        <div class="col-lg-5">
          <div class="p-4 rounded-4 glass border">
            <div class="d-flex align-items-center mb-2">
              <i class="bi bi-info-circle brand fs-2"></i>
              <h2 class="h5 ms-2 mb-0 text-dark">Informasi</h2>
            </div>
            <ul class="small mb-0 text-muted">
              <li>Nama: Frans Maylandgo Saragih</li>
              <li>NIM: H1101241059</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </header>

  <main class="pb-5">
    <div class="container">
      <div class="row g-4">

        <!-- Latihan -->
        <section id="latihan" class="col-12">
          <div class="glass rounded-4 p-4">
            <div class="d-flex align-items-center mb-3">
              <i class="bi bi-mortarboard fs-3 brand"></i>
              <h2 class="h4 ms-2 mb-0 text-dark">Latihan pada pertemuan 3</h2>
            </div>
            <div class="row row-cols-1 row-cols-md-2 g-3">
              <div class="col">
                <a class="card-link rounded-3 p-3 d-flex justify-content-between align-items-center" href="/tugas_pertemuan_tiga/persegi_panjang.php">
                  <span><i class="bi bi-square"></i> Latihan Satu — Persegi Panjang</span>
                  <i class="bi bi-arrow-right-short fs-4"></i>
                </a>
              </div>
              <div class="col">
                <a class="card-link rounded-3 p-3 d-flex justify-content-between align-items-center" href="/tugas_pertemuan_tiga/class_produk.php">
                  <span><i class="bi bi-box-seam"></i> Latihan Dua — Class Produk</span>
                  <i class="bi bi-arrow-right-short fs-4"></i>
                </a>
              </div>
              <div class="col">
                <a class="card-link rounded-3 p-3 d-flex justify-content-between align-items-center" href="/tugas_pertemuan_tiga/mini_project_login.php">
                  <span><i class="bi bi-person-lock"></i> Latihan Tiga — Mini Project Login</span>
                  <i class="bi bi-arrow-right-short fs-4"></i>
                </a>
              </div>
              <div class="col">
                <a class="card-link rounded-3 p-3 d-flex justify-content-between align-items-center" href="/tugas_pertemuan_tiga/manajemen_perpustakaan.php">
                  <span><i class="bi bi-bookshelf"></i> Tugas Mandiri — Manajemen Perpustakaan</span>
                  <i class="bi bi-arrow-right-short fs-4"></i>
                </a>
              </div>
            </div>
          </div>
        </section>

        <!-- Tugas Properti, Method, Constructor -->
        <section id="tugas" class="col-12">
          <div class="glass rounded-4 p-4">
            <div class="d-flex align-items-center mb-3">
              <i class="bi bi-journal-text fs-3 accent"></i>
              <h2 class="h4 ms-2 mb-0 text-dark">Tugas Properti Method dan Constructor</h2>
            </div>
            <p class="text-muted">Tugas <em>Properti, Method,</em> &amp; <em>Constructor</em>:</p>
            <div class="row row-cols-1 row-cols-md-2 g-3">
              <div class="col">
                <a class="card-link rounded-3 p-3 d-flex justify-content-between align-items-center" href="/tugas_properti_method_dan_constructor/class_segitiga.php">
                  <span><i class="bi bi-triangle"></i> Class Segitiga</span>
                  <i class="bi bi-arrow-right-short fs-4"></i>
                </a>
              </div>
              <div class="col">
                <a class="card-link rounded-3 p-3 d-flex justify-content-between align-items-center" href="/tugas_properti_method_dan_constructor/objek_segitiga.php">
                  <span><i class="bi bi-bounding-box-circles"></i> Objek Segitiga (Untuk melihat output disini.)</span>
                  <i class="bi bi-arrow-right-short fs-4"></i>
                </a>
              </div>
            </div>
          </div>
        </section>

        <!-- Inheritance -->
        <section id="inheritance" class="col-12">
          <div class="glass rounded-4 p-4">
            <div class="d-flex align-items-center mb-3">
              <i class="bi bi-diagram-3 fs-3 brand"></i>
              <h2 class="h4 ms-2 mb-0 text-dark">Latihan Inheritance</h2>
            </div>
            <div class="row row-cols-1 row-cols-md-2 g-3">
              <div class="col">
                <a class="card-link rounded-3 p-3 d-flex justify-content-between align-items-center" href="/inheritance/latihan_inheritance.php">
                  <span><i class="bi bi-diagram-3"></i> Latihan Inheritance</span>
                  <i class="bi bi-arrow-right-short fs-4"></i>
                </a>
              </div>
            </div>
          </div>
        </section>

        <!-- Pertemuan 5 -->
        <section id="pertemuan5" class="col-12">
          <div class="glass rounded-4 p-4">
            <div class="d-flex align-items-center mb-3">
              <i class="bi bi-people fs-3 accent"></i>
              <h2 class="h4 ms-2 mb-0 text-dark">Pertemuan 5 — Class Mahasiswa</h2>
            </div>
            <div class="row row-cols-1 row-cols-md-2 g-3">
              <div class="col">
                <a class="card-link rounded-3 p-3 d-flex justify-content-between align-items-center" href="/pertemuan_5/class_mahasiswa.php">
                  <span><i class="bi bi-person-badge"></i> Class Mahasiswa</span>
                  <i class="bi bi-arrow-right-short fs-4"></i>
                </a>
              </div>
              <div class="col">
                <a class="card-link rounded-3 p-3 d-flex justify-content-between align-items-center" href="/pertemuan_5/class_mahasiswa_kedua.php">
                  <span><i class="bi bi-person-video3"></i> Class Mahasiswa Kedua</span>
                  <i class="bi bi-arrow-right-short fs-4"></i>
                </a>
              </div>
            </div>
          </div>
        </section>

        <!-- Pertemuan 6 -->
        <section id="pertemuan6" class="col-12">
          <div class="glass rounded-4 p-4">
            <div class="d-flex align-items-center mb-3">
              <i class="bi bi-flower3 fs-3 brand"></i>
              <h2 class="h4 ms-2 mb-0 text-dark">Praktikum 6 — Class Bunga</h2>
            </div>
            <div class="row row-cols-1 row-cols-md-2 g-3">
              <div class="col">
                <a class="card-link rounded-3 p-3 d-flex justify-content-between align-items-center" href="/pertemuan_6/class_bunga.php">
                  <span><i class="bi bi-flower3"></i> Class Bunga</span>
                  <i class="bi bi-arrow-right-short fs-4"></i>
                </a>
              </div>
            </div>
          </div>
        </section>

        <!-- Abstraksi & Polimorfisme -->
        <section id="tugas-abstraksi" class="col-12">
          <div class="glass rounded-4 p-4">
            <div class="d-flex align-items-center mb-3">
              <i class="bi bi-journal-check fs-3 brand"></i>
              <h2 class="h4 ms-2 mb-0 text-dark">Tugas Abstraksi & Polimorfisme</h2>
            </div>
            <p class="text-muted">Tugas mengenai <em>Abstraksi</em> dan <em>Polimorfisme</em>:</p>
            <div class="row row-cols-1 row-cols-md-2 g-3">
              <div class="col">
                <a class="card-link rounded-3 p-3 d-flex justify-content-between align-items-center" href="/tugas_polimorfisme_dan_abstraksi/soal_1.php">
                  <span><i class="bi bi-1-circle"></i> Soal 1 — Abstraksi</span>
                  <i class="bi bi-arrow-right-short fs-4"></i>
                </a>
              </div>
              <div class="col">
                <a class="card-link rounded-3 p-3 d-flex justify-content-between align-items-center" href="/tugas_polimorfisme_dan_abstraksi/soal_2.php">
                  <span><i class="bi bi-2-circle"></i> Soal 2 — Polimorfisme</span>
                  <i class="bi bi-arrow-right-short fs-4"></i>
                </a>
              </div>
              <div class="col">
                <a class="card-link rounded-3 p-3 d-flex justify-content-between align-items-center" href="/tugas_polimorfisme_dan_abstraksi/soal_3.php">
                  <span><i class="bi bi-3-circle"></i> Soal 3 — Studi Kasus Perpustakaan</span>
                  <i class="bi bi-arrow-right-short fs-4"></i>
                </a>
              </div>
            </div>
          </div>
        </section>

      </div>
    </div>
  </main>

  <footer class="py-4 mt-auto bg-light border-top">
    <div class="container text-center text-muted small">
      <div> <?php echo date('Y'); ?> Pemrograman Berorientasi Objek <i class="bi bi-heart-fill accent"></i></div>
      <div class="mt-1"><a class="text-decoration-underline text-muted" href="https://getbootstrap.com/">Bootstrap</a> · <a class="text-decoration-underline text-muted" href="https://icons.getbootstrap.com/">Bootstrap Icons</a></div>
    </div>
  </footer>

  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>