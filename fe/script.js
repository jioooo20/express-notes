// fe/script.js

async function ambilData() {
    const response = await fetch('http://localhost:3000/catatan', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        },

    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Gagal Ambil Data');
    }
    return await response.json();
}

async function tambahData(judul, isi) {
    const response = await fetch('http://localhost:3000/catatan', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ judul, isi })
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Gagal Menambah');
    }

    return await response.json();
}

async function hapusData(id) {
    const response = await fetch('http://localhost:3000/catatan/' + id, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id })
    })
}

function tampilkanData(catatan) {
    const container = document.querySelector('.daftar-catatan')
    container.innerHTML = '';

    if (!catatan || catatan.length === 0) {
        container.innerHTML = '<P>Belum ada catatan.</p>';
        return;
    }

    const table = document.createElement('table');
    table.className = 'table table-bordered border-primary';

    table.innerHTML = `
    <thead class="table-primary">
            <tr>
                <th>Judul</th>
                <th>Isi</th>
                <th>Aksi</th>
            </tr>
        </thead>
        <tbody>
        </tbody>
    `;

    const tbody = table.querySelector('tbody');

    catatan.forEach(c => {
        const tr = document.createElement('tr');

        const btnDelete = document.createElement('button');
        btnDelete.className = 'btn btn-danger';
        btnDelete.textContent = 'Hapus';
        btnDelete.onclick = async () => {
            if (confirm('Yakin hapus data?')) {
                await hapusData(c.id);
                const dataTerbaru = await ambilData();
                tampilkanData(dataTerbaru);
            }
        }

        tr.innerHTML = `
        <td>${c.judul}</td>
        <td>${c.isi}</td>
        <td></td>
        `;

        tr.cells[2].appendChild(btnDelete);
        tbody.appendChild(tr);

    });
    container.appendChild(table);
}

document.getElementById('form-catatan').addEventListener('submit', async (e) => {
    e.preventDefault();

    const judul = document.getElementById('judul').value;
    const isi = document.getElementById('isi').value;

    try {
        await tambahData(judul, isi);
        e.target.reset();

        const dataTerbaru = await ambilData();
        tampilkanData(dataTerbaru);
    } catch (error) {
        alert(error.message);
    }
});

document.addEventListener('DOMContentLoaded', async () => {
    try {
        const data = await ambilData();
        tampilkanData(data);
    } catch (error) {
        console.error(error.message)
    }
});



// window.onload = tambahData;