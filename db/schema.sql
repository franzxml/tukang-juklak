-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    nama VARCHAR(255) NOT NULL,
    password VARCHAR(255),
    role VARCHAR(50) DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Juklak Events Table
CREATE TABLE IF NOT EXISTS juklak_events (
    id SERIAL PRIMARY KEY,
    judul_acara VARCHAR(255) NOT NULL,
    tanggal_acara DATE NOT NULL,
    tempat VARCHAR(255),
    waktu_mulai TIME,
    waktu_selesai TIME,
    dresscode TEXT,
    owner_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Juklak Activities Table
CREATE TABLE IF NOT EXISTS juklak_activities (
    id SERIAL PRIMARY KEY,
    event_id INTEGER NOT NULL REFERENCES juklak_events(id) ON DELETE CASCADE,
    waktu_kegiatan TIME NOT NULL,
    waktu_selesai TIME,
    nama_kegiatan VARCHAR(255) NOT NULL,
    tempat VARCHAR(255),
    penanggung_jawab TEXT,
    perlengkapan TEXT,
    teknis TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Edit Requests Table
CREATE TABLE IF NOT EXISTS edit_requests (
    id SERIAL PRIMARY KEY,
    event_id INTEGER NOT NULL REFERENCES juklak_events(id) ON DELETE CASCADE,
    requester_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
