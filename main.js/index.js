document.addEventListener("DOMContentLoaded", () => {
  const masjidList = document.getElementById("masjid-list");
  const searchBar = document.getElementById("search-bar");
  const searchButton = document.getElementById("search-button");

  // Cek apakah pengguna sudah login
  const token = localStorage.getItem("jwtToken");
  if (!token) {
    window.location.href = "login.html"; // Redirect ke halaman login jika belum login
  }

  // Fungsi untuk mengambil semua lokasi masjid
  async function fetchAllMasjid() {
    try {
      const response = await fetch(
        "https://backend-berkah.onrender.com/getlocation",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorMessage = await response.text();
        throw new Error(`Error: ${errorMessage}`);
      }

      const masjidData = await response.json();
      displayMasjidList(masjidData);
    } catch (error) {
      console.error("Error fetching masjid data:", error);
      document.getElementById("error-message").innerText =
        "Error loading masjid list: " + error.message;
      document.getElementById("error-message").style.display = "block";
    }
  }

  // Fungsi untuk menampilkan daftar masjid
  function displayMasjidList(masjidData) {
    masjidList.innerHTML = ""; // Kosongkan daftar sebelum menambahkan

    masjidData.forEach((masjid) => {
      const listItem = document.createElement("li");
      listItem.innerHTML = `  
              <strong>${masjid.name}</strong>  
              <button onclick="fetchMasjidById(${masjid.id})">View Details</button>  
          `;
      masjidList.appendChild(listItem);
    });
  }

  // Fungsi untuk mengambil lokasi masjid berdasarkan ID
  async function fetchMasjidById(masjidId) {
    try {
      const response = await fetch(
        `https://backend-berkah.onrender.com/getlocation?id=${masjidId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorMessage = await response.text();
        throw new Error(`Error: ${errorMessage}`);
      }

      const masjidData = await response.json();
      displayMasjidDetails(masjidData);
    } catch (error) {
      console.error("Error fetching masjid data:", error);
      alert("Error loading masjid data.");
    }
  }

  // Fungsi untuk menampilkan detail masjid
  function displayMasjidDetails(masjid) {
    const detailsContainer = document.getElementById("masjid-details");
    detailsContainer.innerHTML = `  
          <h3>${masjid.name}</h3>  
          <p>Address: ${masjid.address}</p>  
          <p>Description: ${masjid.description}</p>  
      `;
    detailsContainer.style.display = "block"; // Tampilkan detail
  }

  // Ambil semua masjid saat halaman dimuat
  fetchAllMasjid();
});

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
