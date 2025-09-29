<?php
abstract class ItemPerpustakaan {
    abstract public function pinjam();
}

class Buku extends ItemPerpustakaan {
    private $judul;
    public function __construct($judul) {
        $this->judul = $judul;
    }
    public function pinjam() {
        echo "Buku \"$this->judul\" berhasil dipinjam.\n";
    }
}

class Majalah extends ItemPerpustakaan {
    private $nama;
    public function __construct($nama) {
        $this->nama = $nama;
    }
    public function pinjam() {
        echo "Majalah \"$this->nama\" berhasil dipinjam.\n";
    }
}

$items = [
    new Buku("Pemrograman Berorientasi Objek"),
    new Majalah("Teknologi Masa Kini"),
    new Buku("Basis Data Lanjut")
];

foreach ($items as $item) {
    $item->pinjam();
}