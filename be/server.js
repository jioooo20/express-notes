// be/server.js

require('dotenv/config');
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');

const app = express();
const port = 3000;

const path = require('path');

//middleware dasar
app.use(cors());
app.use(express.json());

console.log('Konfigurasi database:', {
    host: process.env.DB_HOST,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});
//pool connection
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
})

//route dasar
app.get('/', async (req, res) => {
    await res.sendFile(path.join(__dirname, '../fe/index.html'));
});
app.listen(port, () => {
    console.log(`Server berjalan di http://localhost:${port}`);
})

app.use(express.static(path.join(__dirname, '../fe' || null)));


//ubah pool menjadi promise agar bisa pakai async/await
const promisePool = pool.promise();

//tes koneksi saat server dijalankan
app.get('/test-db', async (req, res) => {
    const [rows] = await promisePool.query('SELECT 1 + 1 AS hasil');
    res.json({ pesan: 'Koneksi ke database berhasil!', hasil: rows[0].hasil });
})

app.get('/catatan', async (req, res) => {
    const [rows] = await promisePool.query('SELECT * FROM catatan');
    res.json(rows);
})

app.get('/catatan/:id', async (req, res) => {
    const { id } = req.params;
    const [rows] = await promisePool.query('SELECT * FROM catatan WHERE id = ?', [id]);
    if (rows.length === 0) {
        return res.status(404).json({ error: 'Catatan tidak ditemukan' });
    }
    res.json(rows[0]);
})

app.post('/catatan', async (req, res) => {
    const { judul, isi } = req.body;
    const [rows] = await promisePool.query('INSERT INTO catatan (judul, isi) VALUES (?, ?)', [judul, isi]);
    res.status(201).json({ id: rows.insertId, judul, isi });
})

app.put('/catatan/:id', async (req, res) => {
    const { id } = req.params;
    const { judul, isi } = req.body;
    const [rows] = await promisePool.query('UPDATE catatan SET judul = ?, isi = ? WHERE id = ?', [judul, isi, id]);
    if (rows.affectedRows === 0) {
        return res.status(404).json({ error: 'Catatan tidak ditemukan' });
    }
    res.json({ id, judul, isi });
})

app.delete('/catatan/:id', async (req, res) => {
    const { id } = req.params;
    const [rows] = await promisePool.query('DELETE FROM catatan WHERE id = ?', [id]);
    if (rows.affectedRows === 0) {
        return res.status(404).json({ error: 'Catatan tidak ditemukan' });
    }
    res.json({ message: 'Catatan berhasil dihapus' });
})


// Middleware untuk menangani 404 (Route tidak ditemukan)
app.use((req, res, next) => {
    res.status(404).json({ error: 'Endpoint tidak ditemukan' });
});

// Middleware Global Error Handler (Menangani error 500)
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        error: 'Terjadi kesalahan pada server',
        message: err.message
    });
});