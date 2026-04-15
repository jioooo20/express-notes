// fe/script.js

async function tambahData() {
    try {
        const response = await fetch('http://localhost:3000/catatan', );
        const data = await response.json(); 
        console.log(data); //console
    }catch (error) {
        console.error('Gagal ambil data: ', error);
    }
}

window.onload = tambahData;