document.addEventListener("DOMContentLoaded", () => {
  const masjidList = document.getElementById("masjid-list");
  const searchBar = document.getElementById("search-bar");
  const errorMessage = document.getElementById("error-message");
  const detailsContainer = document.getElementById("masjid-details");
  const navbarButtons = document.querySelectorAll(".navbar-button");

  // Cek apakah pengguna sudah login
  const token = localStorage.getItem("jwtToken");
  if (!token) {
    Swal.fire({
      title: "Session Expired",
      text: "Please log in again.",
      icon: "warning",
      confirmButtonText: "OK",
    }).then(() => {
      window.location.href =
        "https://rrq-dev.github.io/jumatberkah.github.io/auth/login.html"; // Redirect ke halaman login jika belum login
    });
  }

  // Fungsi untuk mengambil semua lokasi masjid
  async function fetchMasjidData(searchTerm = "") {
    try {
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

      if (response.status === 401) {
        Swal.fire({
          title: "Session Expired",
          text: "Please log in again.",
          icon: "warning",
          confirmButtonText: "OK",
        }).then(() => {
          window.location.href =
            "https://rrq-dev.github.io/jumatberkah.github.io/auth/login.html";
        });
        return;
      }

      if (!response.ok) {
        const errorMessage = await response.text(); // Ambil pesan error dari respons
        throw new Error(`Error: ${errorMessage}`);
      }

      const masjidData = await response.json(); // Parse JSON dari respons
      displayMasjidList(masjidData, searchTerm); // Tampilkan daftar masjid
    } catch (error) {
      console.error("Error fetching masjid data:", error);
      Swal.fire({
        title: "Error",
        text: "Error loading masjid data.",
        icon: "error",
        confirmButtonText: "OK",
      });
    }
  }

  // Fungsi untuk menampilkan daftar masjid
  function displayMasjidList(masjidData, searchTerm = "") {
    masjidList.innerHTML = ""; // Kosongkan daftar sebelum menambahkan yang baru

    const filteredData = masjidData.filter((masjid) =>
      masjid.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Sortir data agar hasil pencarian muncul di atas
    filteredData.sort((a, b) => {
      const aMatch = a.name.toLowerCase().indexOf(searchTerm.toLowerCase());
      const bMatch = b.name.toLowerCase().indexOf(searchTerm.toLowerCase());
      return aMatch - bMatch;
    });

    filteredData.forEach((masjid) => {
      const masjidItem = document.createElement("div");
      masjidItem.className = "masjid-item";
      masjidItem.innerHTML = `        
              <h3>${masjid.name}</h3>        
              <p>${masjid.address}</p>        
              <p>${masjid.description}</p>        
              <button class="view-details" data-id="${masjid.id}">View Details</button>        
          `;

      // Event listener untuk hover pada masjid item
      masjidItem.addEventListener("mouseover", () => {
        const randomColor = getRandomColor();
        masjidItem.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.2)";
        masjidItem.style.border = `2px solid ${randomColor}`;
      });

      masjidItem.addEventListener("mouseout", () => {
        masjidItem.style.boxShadow = "";
        masjidItem.style.border = "";
      });

      masjidList.appendChild(masjidItem);
    });

    // Menambahkan event listener untuk tombol View Details
    const viewDetailsButtons = document.querySelectorAll(".view-details");
    viewDetailsButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const masjidId = button.getAttribute("data-id");
        fetchMasjidById(masjidId);
      });
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
            Authorization: `Bearer ${token}`, // Sertakan token di header
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 401) {
        Swal.fire({
          title: "Session Expired",
          text: "Please log in again.",
          icon: "warning",
          confirmButtonText: "OK",
        }).then(() => {
          window.location.href =
            "https://rrq-dev.github.io/jumatberkah.github.io/auth/login.html";
        });
        return;
      }

      if (!response.ok) {
        const errorMessage = await response.text(); // Ambil pesan error dari respons
        throw new Error(`Error: ${errorMessage}`);
      }

      const masjidDetails = await response.json(); // Parse JSON dari respons
      displayMasjidDetails(masjidDetails); // Tampilkan detail masjid
    } catch (error) {
      console.error("Error fetching masjid details:", error);
      Swal.fire({
        title: "Error",
        text: "Error loading masjid details.",
        icon: "error",
        confirmButtonText: "OK",
      });
    }
  }

  // Fungsi untuk menampilkan detail masjid
  function displayMasjidDetails(masjid) {
    detailsContainer.innerHTML = `        
          <h2>${masjid.name}</h2>        
          <p>Address: ${masjid.address}</p>        
          <p>Description: ${masjid.description}</p>        
      `;
    detailsContainer.style.display = "block"; // Tampilkan detail
  }

  // Event listener untuk input pencarian
  searchBar.addEventListener("input", () => {
    const searchTerm = searchBar.value;
    fetchMasjidData(searchTerm);
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

  // Fungsi untuk logout
  function logout() {
    localStorage.removeItem("jwtToken");
    localStorage.removeItem("userId");
    localStorage.removeItem("userRole");
    Swal.fire({
      title: "Logout Successful",
      icon: "success",
      confirmButtonText: "OK",
    }).then(() => {
      window.location.href = "https://rrq-dev.github.io/jumatberkah.github.io"; // Redirect ke halaman utama
    });
  }

  // Menangani tampilan tombol logout jika pengguna sudah login
  function updateAuthLinks() {
    const logoutBtn = document.getElementById("logout-btn");
    if (localStorage.getItem("jwtToken")) {
      logoutBtn.innerText = "Logout";
      logoutBtn.onclick = logout; // Set fungsi logout
    } else {
      logoutBtn.innerText = "Sign in";
      logoutBtn.href = "auth/login.html"; // Redirect ke halaman login
    }
  }

  // Menambahkan event listener untuk hover pada navbar buttons
  navbarButtons.forEach((button) => {
    button.addEventListener("mouseover", () => {
      const randomColor = getRandomColor();
      button.style.backgroundColor = randomColor;
    });

    button.addEventListener("mouseout", () => {
      button.style.backgroundColor = ""; // Mengembalikan warna asli saat mouse keluar
    });
  });

  // Inisialisasi
  window.onload = function () {
    updateAuthLinks(); // Perbarui tampilan tombol login/logout
    fetchMasjidData(); // Ambil semua masjid saat halaman dimuat
  };
});
