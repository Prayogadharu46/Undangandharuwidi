/**
 * =========================================================================
 * SERVER.JS - Backend Express Undangan Pernikahan Digital Dharu & Widiya
 * =========================================================================
 * Fitur:
 * - REST API CRUD untuk Ucapan & RSVP (GET, POST, PUT, DELETE)
 * - Validasi input, sanitasi XSS, dan rate limit sederhana per IP
 * - Keamanan Edit/Delete berbasis ownerToken (localStorage) & Admin Override
 * - Halaman Admin (/admin) terlindungi password (.env)
 * - Export Data Ucapan ke format CSV (Excel-ready BOM) & JSON
 * - Penyimpanan permanen di data/ucapan.json (tidak hilang saat restart)
 */

const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'dharuwidi2027';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Path file data ucapan
const DATA_FILE = path.join(__dirname, 'data', 'ucapan.json');

// Pastikan folder data dan file ucapan.json tersedia
function ensureDataFile() {
  const dir = path.dirname(DATA_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2), 'utf8');
  }
}
ensureDataFile();

// Helper: Membaca data ucapan dari file JSON
function readUcapan() {
  try {
    ensureDataFile();
    const data = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(data || '[]');
  } catch (err) {
    console.error('Gagal membaca data ucapan:', err);
    return [];
  }
}

// Helper: Menyimpan data ucapan ke file JSON secara aman
function writeUcapan(list) {
  try {
    ensureDataFile();
    const tempFile = `${DATA_FILE}.tmp`;
    fs.writeFileSync(tempFile, JSON.stringify(list, null, 2), 'utf8');
    fs.renameSync(tempFile, DATA_FILE);
    return true;
  } catch (err) {
    console.error('Gagal menulis data ucapan:', err);
    return false;
  }
}

// Helper: Sanitasi string untuk mencegah serangan XSS
function sanitizeText(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
    .trim();
}

// Rate Limiting Sederhana per IP (In-Memory)
const rateLimitMap = new Map();
function simpleRateLimit(req, res, next) {
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 menit
  const maxRequests = 10; // maks 10 permintaan per menit

  const record = rateLimitMap.get(ip) || { count: 0, resetTime: now + windowMs };

  if (now > record.resetTime) {
    record.count = 1;
    record.resetTime = now + windowMs;
  } else {
    record.count += 1;
  }

  rateLimitMap.set(ip, record);

  if (record.count > maxRequests) {
    return res.status(429).json({
      error: 'Terlalu banyak permintaan. Silakan tunggu beberapa saat lagi.'
    });
  }

  next();
}

// Admin Token Store Sederhana
const adminSessions = new Set();
function isAdminAuthenticated(req) {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return false;
  const token = authHeader.replace(/^Bearer\s+/i, '').trim();
  return adminSessions.has(token);
}

// -------------------------------------------------------------------------
// ROUTE: API UCAPAN
// -------------------------------------------------------------------------

// GET /api/ucapan - Mengambil semua ucapan publik
app.get('/api/ucapan', (req, res) => {
  const list = readUcapan();
  // Urutkan dari yang terbaru (teratas)
  const sorted = [...list].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  // Jangan kirim ownerToken mentah ke publik demi keamanan
  const publicList = sorted.map(item => ({
    id: item.id,
    name: item.name,
    message: item.message,
    status: item.status,
    createdAt: item.createdAt
  }));
  res.json(publicList);
});

// POST /api/ucapan - Menambah ucapan baru
app.post('/api/ucapan', simpleRateLimit, (req, res) => {
  let { name, message, status, ownerToken } = req.body;

  if (!name || !message) {
    return res.status(400).json({ error: 'Nama dan Ucapan wajib diisi!' });
  }

  const cleanName = sanitizeText(name);
  const cleanMessage = sanitizeText(message);

  if (cleanName.length === 0 || cleanMessage.length === 0) {
    return res.status(400).json({ error: 'Nama dan Ucapan tidak boleh kosong!' });
  }

  if (cleanName.length > 50) {
    return res.status(400).json({ error: 'Nama maksimal 50 karakter.' });
  }

  if (cleanMessage.length > 300) {
    return res.status(400).json({ error: 'Ucapan maksimal 300 karakter.' });
  }

  const validStatuses = ['Hadir', 'Tidak Hadir', 'Masih Ragu'];
  if (!validStatuses.includes(status)) {
    status = 'Hadir';
  }

  // Jika client tidak mengirim ownerToken, buat token unik
  if (!ownerToken || typeof ownerToken !== 'string') {
    ownerToken = crypto.randomBytes(16).toString('hex');
  }

  const newEntry = {
    id: `ucp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    name: cleanName,
    message: cleanMessage,
    status: status,
    createdAt: new Date().toISOString(),
    ownerToken: ownerToken
  };

  const list = readUcapan();
  list.unshift(newEntry);
  writeUcapan(list);

  res.status(201).json({
    message: 'Ucapan berhasil dikirim!',
    item: {
      id: newEntry.id,
      name: newEntry.name,
      message: newEntry.message,
      status: newEntry.status,
      createdAt: newEntry.createdAt
    },
    ownerToken: newEntry.ownerToken
  });
});

// PUT /api/ucapan/:id - Edit ucapan (oleh pemilik perangkat atau admin)
app.put('/api/ucapan/:id', simpleRateLimit, (req, res) => {
  const { id } = req.params;
  const { message, status, ownerToken } = req.body;
  const isAdmin = isAdminAuthenticated(req);

  const list = readUcapan();
  const index = list.findIndex(item => item.id === id);

  if (index === -1) {
    return res.status(404).json({ error: 'Ucapan tidak ditemukan.' });
  }

  const target = list[index];

  // Periksa apakah request berasal dari admin atau pemilik asli
  if (!isAdmin && (!ownerToken || ownerToken !== target.ownerToken)) {
    return res.status(403).json({ error: 'Anda tidak memiliki izin untuk mengedit ucapan ini.' });
  }

  if (message) {
    const cleanMessage = sanitizeText(message);
    if (cleanMessage.length > 300) {
      return res.status(400).json({ error: 'Ucapan maksimal 300 karakter.' });
    }
    target.message = cleanMessage;
  }

  if (status) {
    const validStatuses = ['Hadir', 'Tidak Hadir', 'Masih Ragu'];
    if (validStatuses.includes(status)) {
      target.status = status;
    }
  }

  target.updatedAt = new Date().toISOString();
  list[index] = target;
  writeUcapan(list);

  res.json({
    message: 'Ucapan berhasil diperbarui!',
    item: {
      id: target.id,
      name: target.name,
      message: target.message,
      status: target.status,
      createdAt: target.createdAt,
      updatedAt: target.updatedAt
    }
  });
});

// DELETE /api/ucapan/:id - Hapus ucapan (oleh pemilik perangkat atau admin)
app.delete('/api/ucapan/:id', simpleRateLimit, (req, res) => {
  const { id } = req.params;
  const ownerToken = req.headers['x-owner-token'] || req.query.ownerToken;
  const isAdmin = isAdminAuthenticated(req);

  const list = readUcapan();
  const index = list.findIndex(item => item.id === id);

  if (index === -1) {
    return res.status(404).json({ error: 'Ucapan tidak ditemukan.' });
  }

  const target = list[index];

  // Periksa otorisasi
  if (!isAdmin && (!ownerToken || ownerToken !== target.ownerToken)) {
    return res.status(403).json({ error: 'Anda tidak memiliki izin untuk menghapus ucapan ini.' });
  }

  list.splice(index, 1);
  writeUcapan(list);

  res.json({ message: 'Ucapan berhasil dihapus!' });
});

// -------------------------------------------------------------------------
// ROUTE: ADMIN API & EXPORT
// -------------------------------------------------------------------------

// POST /api/admin/login - Login admin dengan password
app.post('/api/admin/login', (req, res) => {
  const { password } = req.body;
  if (!password) {
    return res.status(400).json({ error: 'Password wajib diisi.' });
  }

  if (password === ADMIN_PASSWORD) {
    const token = crypto.randomBytes(24).toString('hex');
    adminSessions.add(token);
    return res.json({ success: true, token: token });
  } else {
    return res.status(401).json({ error: 'Password admin salah!' });
  }
});

// GET /api/admin/check - Cek validitas sesi admin
app.get('/api/admin/check', (req, res) => {
  if (isAdminAuthenticated(req)) {
    return res.json({ authenticated: true });
  }
  res.status(401).json({ authenticated: false });
});

// GET /api/admin/export/json - Download data ucapan dalam format JSON
app.get('/api/admin/export/json', (req, res) => {
  if (!isAdminAuthenticated(req)) {
    return res.status(403).json({ error: 'Akses ditolak. Silakan login sebagai admin.' });
  }
  const list = readUcapan();
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', 'attachment; filename="data-ucapan-dharu-widiya.json"');
  res.send(JSON.stringify(list, null, 2));
});

// GET /api/admin/export/csv - Download data ucapan dalam format CSV (Excel-ready BOM)
app.get('/api/admin/export/csv', (req, res) => {
  if (!isAdminAuthenticated(req)) {
    return res.status(403).json({ error: 'Akses ditolak. Silakan login sebagai admin.' });
  }
  const list = readUcapan();

  // UTF-8 BOM agar Excel menampilkan aksen/karakter Indonesia dengan benar
  let csvContent = '\uFEFF"ID","Nama","Ucapan","Status Kehadiran","Waktu Pengiriman"\n';

  list.forEach(item => {
    const escapeCsv = (val) => `"${String(val || '').replace(/"/g, '""')}"`;
    const row = [
      escapeCsv(item.id),
      escapeCsv(item.name),
      escapeCsv(item.message),
      escapeCsv(item.status),
      escapeCsv(new Date(item.createdAt).toLocaleString('id-ID'))
    ].join(',');
    csvContent += row + '\n';
  });

  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="data-ucapan-dharu-widiya.csv"');
  res.send(csvContent);
});

// Route akses halaman admin
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// Serve frontend statis dari folder public
app.use(express.static(path.join(__dirname, 'public')));

// Fallback untuk route yang tidak ditemukan -> kembali ke index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Jalankan Server
app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`  UNDANGAN PERNIKAHAN DIGITAL: PRAYOGA & WIDIYA`);
  console.log(`  Server aktif di : http://localhost:${PORT}`);
  console.log(`  Panel Admin di  : http://localhost:${PORT}/admin`);
  console.log(`=======================================================`);
});
