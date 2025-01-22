let masjids = [];  
  
// Menampilkan data masjid  
function displayMasjids() {  
    const tbody = document.querySelector('#masjidTable tbody');  
    tbody.innerHTML = '';  
    masjids.forEach((masjid, index) => {  
        const row = document.createElement('tr');  
        row.innerHTML = `  
            <td>${masjid.name}</td>  
            <td>${masjid.address}</td>  
            <td>${masjid.contact}</td>  
            <td>  
                <button class="edit" onclick="editMasjid(${index})">Edit</button>  
                <button class="delete" onclick="deleteMasjid(${index})">Delete</button>  
            </td>  
        `;  
        tbody.appendChild(row);  
    });  
}  
  
// Menambahkan masjid baru  
document.getElementById('addMasjidForm').addEventListener('submit', function(event) {  
    event.preventDefault();  
    const name = document.getElementById('masjidName').value;  
    const address = document.getElementById('masjidAddress').value;  
    const contact = document.getElementById('masjidContact').value;  
    masjids.push({ name, address, contact });  
    displayMasjids();  
    document.getElementById('addMasjidForm').reset();  
});  
  
// Mengedit masjid  
function editMasjid(index) {  
    const name = prompt('Masukkan nama masjid baru:', masjids[index].name);  
    const address = prompt('Masukkan alamat baru:', masjids[index].address);  
    const contact = prompt('Masukkan kontak baru:', masjids[index].contact);  
    if (name && address && contact) {  
        masjids[index] = { name, address, contact };  
        displayMasjids();  
    }  
}  
  
// Menghapus masjid  
function deleteMasjid(index) {  
    if (confirm('Apakah Anda yakin ingin menghapus masjid ini?')) {  
        masjids.splice(index, 1);  
        displayMasjids();  
    }  
}  
  
// Logout  
document.querySelector('.auth-links a').addEventListener('click', function() {  
    alert('Anda telah logout.');  
    // Redirect ke halaman login atau home  
    window.location.href = 'index.html';  
});  