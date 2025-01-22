// Fungsi untuk mengambil data masjid berdasarkan ID dari backend
async function fetchMasjidById(masjidId) {
  try {
    const token = localStorage.getItem("jwtToken"); // Ambil token dari local storage
    const response = await fetch(
      `https://backend-berkah.onrender.com/masjid/${masjidId}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`, // Sertakan token di header
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      const errorMessage = await response.text(); // Ambil pesan error dari response
      throw new Error(`Error: ${errorMessage}`);
    }

    const masjidData = await response.json();
    displayMasjidDetails(masjidData); // Tampilkan detail masjid
  } catch (error) {
    console.error("Error fetching masjid data:", error);
    document.getElementById("error-message").innerText =
      "Error loading masjid: " + error.message;
    document.getElementById("error-message").style.display = "block";
  }
}

// Fungsi untuk menampilkan detail masjid
function displayMasjidDetails(masjid) {
  const masjidContainer = document.getElementById("masjid-details");
  masjidContainer.innerHTML = `  
      <h3>${masjid.name}</h3>  
      <p>Location: ${masjid.location}</p>  
      <p>Description: ${masjid.description}</p>  
  `;
}

// Fungsi untuk mengambil semua masjid dari backend
async function fetchAllMasjid() {
  try {
    const token = localStorage.getItem("jwtToken"); // Ambil token dari local storage
    const response = await fetch(
      "https://backend-berkah.onrender.com/getlocation",
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`, // Sertakan token di header
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      const errorMessage = await response.text(); // Ambil pesan error dari response
      throw new Error(`Error: ${errorMessage}`);
    }

    const masjidData = await response.json();
    displayMasjidCards(masjidData); // Tampilkan semua masjid
  } catch (error) {
    console.error("Error fetching masjid data:", error);
    document.getElementById("error-message").innerText =
      "Error loading masjid list: " + error.message;
    document.getElementById("error-message").style.display = "block";
  }
}

// Fungsi untuk menampilkan kartu masjid
function displayMasjidCards(masjidData) {
  const masjidContainer = document.getElementById("masjid-container");
  masjidContainer.innerHTML = ""; // Kosongkan kontainer sebelum menambahkan kartu baru

  masjidData.forEach((masjid) => {
    const card = document.createElement("div");
    card.className = "masjid-card";
    card.innerHTML = `  
          <h3>${masjid.name}</h3>  
          <p>${masjid.location}</p>  
          <p>${masjid.description}</p>  
          <button onclick="fetchMasjidById(${masjid.id})">View Details</button>  
      `;

    masjidContainer.appendChild(card);
  });
}

// Fungsi untuk logout
function logout() {
  localStorage.removeItem("jwtToken");
  localStorage.removeItem("userId");
  localStorage.removeItem("userRole");
  alert("Logout successful!");
  window.location.href = "https://rrq-dev.github.io/jumatberkah.github.io"; // Redirect ke halaman utama
}

// Menangani tampilan tombol logout jika pengguna sudah login
function updateAuthLinks() {
  const logoutBtn = document.getElementById("logout-btn");
  if (localStorage.getItem("jwtToken")) {
    logoutBtn.innerText = "Logout";
    logoutBtn.onclick = logout; // Set fungsi logout
  } else {
    logoutBtn.innerText = "Sign in";
    logoutBtn.href =
      "https://rrq-dev.github.io/jumatberkah.github.io/auth/login"; // Redirect ke halaman login
  }
}

// Inisialisasi
window.onload = function () {
  fetchAllMasjid(); // Ambil semua masjid saat halaman dimuat
  updateAuthLinks(); // Perbarui tampilan tombol login/logout
};
