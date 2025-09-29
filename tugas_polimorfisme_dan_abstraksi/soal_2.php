<?php
interface BangunDatar {
    public function luas();
}

class Persegi implements BangunDatar {
    private $sisi;
    public function __construct($sisi) {
        $this->sisi = $sisi;
    }
    public function luas() {
        return $this->sisi * $this->sisi;
    }
}

class Lingkaran implements BangunDatar {
    private $jari;
    public function __construct($jari) {
        $this->jari = $jari;
    }
    public function luas() {
        return pi() * $this->jari * $this->jari;
    }
}

$bangun = [new Persegi(5), new Lingkaran(7)];
foreach ($bangun as $b) {
    echo "Luas: " . $b->luas() . "\n";
}