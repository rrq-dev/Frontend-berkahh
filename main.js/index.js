document.addEventListener("DOMContentLoaded", () => {
  const masjidList = document.getElementById("masjid-list");
  const searchBar = document.getElementById("search-bar");
  const searchButton = document.getElementById("search-button");
  const errorMessage = document.getElementById("error-message");

  // Cek apakah pengguna sudah login
  const token = localStorage.getItem("jwtToken");
  if (!token) {
    window.location.href = "auth/login.html"; // Redirect ke halaman login jika belum login
  }

  // Fungsi untuk mengambil semua lokasi masjid dari backend
  async function fetchMasjidData() {
    try {
      const response = await fetch(
        "https://backend-berkah.onrender.com/getlocationbyid",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch masjid data");
      }

      const masjidData = await response.json();
      displayMasjidList(masjidData);
    } catch (error) {
      console.error("Error fetching masjid data:", error);
      errorMessage.innerText = "Error loading masjid data.";
      errorMessage.style.display = "block";
    }
  }

  // Fungsi untuk menampilkan daftar masjid
  function displayMasjidList(masjidData) {
    masjidList.innerHTML = ""; // Kosongkan daftar sebelum menambahkan yang baru

    masjidData.forEach((masjid) => {
      const masjidItem = document.createElement("div");
      masjidItem.className = "masjid-item";
      masjidItem.innerHTML = `  
              <h3>${masjid.name}</h3>  
              <p>${masjid.address}</p>  
              <p>${masjid.description}</p>  
              <button onclick="fetchMasjidById(${masjid.id})">View Details</button>  
          `;
      masjidList.appendChild(masjidItem);
    });
  }

  // Fungsi untuk mengambil data masjid berdasarkan ID
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
        throw new Error("Failed to fetch masjid details");
      }

      const masjidDetails = await response.json();
      displayMasjidDetails(masjidDetails);
    } catch (error) {
      console.error("Error fetching masjid details:", error);
      errorMessage.innerText = "Error loading masjid details.";
      errorMessage.style.display = "block";
    }
  }

  // Fungsi untuk menampilkan detail masjid
  function displayMasjidDetails(masjid) {
    const detailsContainer = document.getElementById("masjid-details");
    detailsContainer.innerHTML = `  
          <h2>${masjid.name}</h2>  
          <p>Address: ${masjid.address}</p>  
          <p>Description: ${masjid.description}</p>  
      `;
    detailsContainer.style.display = "block"; // Tampilkan detail
  }

  // Event listener untuk tombol pencarian
  searchButton.addEventListener("click", () => {
    const searchTerm = searchBar.value.toLowerCase();
    const masjidItems = document.querySelectorAll(".masjid-item");

    masjidItems.forEach((item) => {
      const title = item.querySelector("h3").innerText.toLowerCase();
      if (title.includes(searchTerm)) {
        item.style.display = "block"; // Tampilkan item yang cocok
      } else {
        item.style.display = "none"; // Sembunyikan item yang tidak cocok
      }
    });
  });
  // Ambil data masjid saat halaman dimuat
  fetchMasjidData();
});

// Fungsi untuk menghasilkan warna acak
function getRandomColor() {
  const letters = "0123456789ABCDEF";
  let color = "#";
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

// Menambahkan event listener untuk hover pada navbar links
const navLinks = document.querySelectorAll(".navbar .nav-links a");

navLinks.forEach((link) => {
  link.addEventListener("mouseover", () => {
    link.style.backgroundColor = getRandomColor(); // Mengubah warna latar belakang saat hover
  });

  link.addEventListener("mouseout", () => {
    link.style.backgroundColor = ""; // Mengembalikan warna latar belakang saat mouse keluar
  });
});

// Menambahkan event listener untuk hover pada auth links
const authLinks = document.querySelectorAll(".auth-links a");

authLinks.forEach((link) => {
  link.addEventListener("mouseover", () => {
    link.style.backgroundColor = getRandomColor(); // Mengubah warna latar belakang saat hover
  });

  link.addEventListener("mouseout", () => {
    link.style.backgroundColor = ""; // Mengembalikan warna latar belakang saat mouse keluar
  });
});

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
  updateAuthLinks(); // Perbarui tampilan tombol login/logout
};
