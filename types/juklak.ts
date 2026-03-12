export interface Activity {
  id?: number;
  tempId: string;
  waktu_kegiatan: string;
  waktu_selesai: string | null;
  nama_kegiatan: string;
  tempat: string;
  penanggung_jawab: string;
  perlengkapan: string;
  teknis: string;
  position?: number;
}

export interface JuklakEvent {
  id?: number;
  judul_acara: string;
  tanggal_acara: string;
  tempat?: string;
  waktu_mulai?: string;
  waktu_selesai?: string | null;
  dresscode?: string;
}

export interface Dresscode {
  baju: string;
  celana: string;
  aksesoris: string;
}
