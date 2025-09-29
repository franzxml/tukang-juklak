<?php
abstract class Kendaraan {
    abstract public function jalan();
}

class Mobil extends Kendaraan {
    public function jalan() {
        echo "Mobil berjalan dengan 4 roda\n";
    }
}

class Motor extends Kendaraan {
    public function jalan() {
        echo "Motor berjalan dengan 2 roda\n";
    }
}

$mobil = new Mobil();
$motor = new Motor();

$mobil->jalan();
$motor->jalan();