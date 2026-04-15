// be/server.js

const express = require('express');
const cors = require('cors');
require('dotenv').config();
const mysql = require('mysql2');

const app = express();
const port = 3000;

//middleware dasar
app.use(cors());
app.use(express.json());

//pool connection
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
})

//route dasar
app.get('/', (req, res) => {
    res.send('Server Catatanku Berjalan!');
});

app.listen(port, ()=>{
    console.log(`Server berjalan di http://localhost:${port}`);
})


//ubah pool menjadi promise agar bisa pakai async/await
const promisePool = pool.promise();

//tes koneksi saat server dijalankan
app.get('/test-db', async (req, res) => {
    try{
        const[rows] = await promisePool.query('SELECT 1 + 1 AS hasil');
        res.json({pesan: 'Koneksi ke database berhasil!', hasil: rows[0].hasil});
    }catch (error) {
        console.error('Gagal koneksi ke database: ', error);
        res.status(500).json({error: error.message});
    }
})

app.get('/catatan', async (req, res) => {
    try {
        const[rows] = await promisePool.query('SELECT * FROM catatan');
        res.json(rows);
    } catch (error) {
        console.error('Gagal mengambil catatan: ', error);
        res.status(500).json({error: error.message});
    }
})

app.get('/catatan/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const[rows] = await promisePool.query('SELECT * FROM catatan WHERE id = ?', [id]);
        if (rows.length === 0) {
            return res.status(404).json({error: 'Catatan tidak ditemukan'});
        }
        res.json(rows[0]);
    } catch (error) {
        console.error('Gagal mengambil catatan: ', error);
        res.status(500).json({error: error.message});
    }
})

app.post('/catatan', async (req, res) => {
    try {
        const { judul, isi } = req.body;
        const[rows] = await promisePool.query('INSERT INTO catatan (judul, isi) VALUES (?, ?)', [judul, isi]);
        res.status(201).json({ id: rows.insertId, judul, isi });
    } catch (error) {
        console.error('Gagal menambah catatan: ', error);
        res.status(500).json({error: error.message});

    }
})

app.put('/catatan/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { judul, isi } = req.body;
        const[rows] = await promisePool.query('UPDATE catatan SET judul = ?, isi = ? WHERE id = ?', [judul, isi, id]);
        if (rows.affectedRows === 0) {
            return res.status(404).json({error: 'Catatan tidak ditemukan'});
        }
        res.json({ id, judul, isi });
    } catch (error) {
        console.error('Gagal mengupdate catatan: ', error);
        res.status(500).json({error: error.message});
    }
})

app.delete('/catatan/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const[rows] = await promisePool.query('DELETE FROM catatan WHERE id = ?', [id]);
        if (rows.affectedRows === 0) {
            return res.status(404).json({error: 'Catatan tidak ditemukan'});
        }
        res.json({message: 'Catatan berhasil dihapus'});
    } catch (error) {
        console.error('Gagal menghapus catatan: ', error);
        res.status(500).json({error: error.message});
    }
})