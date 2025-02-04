document.addEventListener("DOMContentLoaded", () => {
  const masjidList = document.getElementById("masjid-list");
  const searchBar = document.getElementById("search-bar");
  const errorMessage = document.getElementById("error-message");
  const detailsContainer = document.getElementById("masjid-details");
  const navbarButtons = document.querySelectorAll(".navbar-button");

  // Handle Google OAuth Callback Token
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get("token");

  if (token) {
    try {
      // Decode token untuk mendapatkan informasi user
      const tokenParts = token.split(".");
      if (tokenParts.length !== 3) {
        throw new Error("Invalid token format");
      }

      const payload = JSON.parse(atob(tokenParts[1]));

      // Simpan token dan user info
      localStorage.setItem("jwtToken", token);
      localStorage.setItem("userId", payload.user_id);
      localStorage.setItem("userRole", payload.role);

      // Hapus token dari URL tanpa reload halaman
      window.history.replaceState({}, document.title, window.location.pathname);

      // Tampilkan pesan selamat datang untuk login Google
      Swal.fire({
        title: "Login Berhasil!",
        text: "Selamat datang kembali!",
        icon: "success",
        timer: 2000,
        showConfirmButton: false,
        timerProgressBar: true,
      });
    } catch (error) {
      console.error("Error processing token:", error);
      Swal.fire({
        title: "Login Gagal",
        text: "Error memproses informasi login",
        icon: "error",
        confirmButtonText: "OK",
      });
    }
  }

  // Fungsi untuk mengambil semua lokasi masjid
  async function fetchMasjidData(searchTerm = "") {
    try {
      const token = localStorage.getItem("jwtToken");
      const response = await fetch(
        "https://backend-berkah.onrender.com/retreive/data/location",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
        }
      );

      if (!response.ok) {
        const errorMessage = await response.text();
        throw new Error(`Error: ${errorMessage}`);
      }

      const masjidData = await response.json();
      displayMasjidList(masjidData, searchTerm);
    } catch (error) {
      console.error("Error fetching masjid data:", error);
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Gagal memuat data masjid!",
        confirmButtonColor: "#4CAF50",
      });
    }
  }

  // Fungsi untuk menampilkan daftar masjid
  function displayMasjidList(masjidData, searchTerm = "") {
    masjidList.innerHTML = "";

    const filteredData = masjidData.filter((masjid) =>
      masjid.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    filteredData.sort((a, b) => {
      const aMatch = a.name.toLowerCase().indexOf(searchTerm.toLowerCase());
      const bMatch = b.name.toLowerCase().indexOf(searchTerm.toLowerCase());
      return aMatch - bMatch;
    });

    if (filteredData.length === 0) {
      Swal.fire({
        icon: "info",
        title: "Tidak Ada Hasil",
        text: "Masjid yang dicari tidak ditemukan",
        confirmButtonColor: "#4CAF50",
      });
    }

    filteredData.forEach((masjid) => {
      const masjidItem = document.createElement("div");
      masjidItem.className = "masjid-item";
      masjidItem.innerHTML = `        
        <h3>${masjid.name}</h3>        
        <p>${masjid.address}</p>        
        <p>${masjid.description}</p>        
      `;

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
  }

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
    Swal.fire({
      title: "Apakah Anda yakin?",
      text: "Anda akan keluar dari aplikasi",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#4CAF50",
      cancelButtonColor: "#d33",
      confirmButtonText: "Ya, Logout!",
      cancelButtonText: "Batal",
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.removeItem("jwtToken");
        localStorage.removeItem("userId");
        localStorage.removeItem("userRole");
        Swal.fire({
          title: "Berhasil Logout",
          text: "Anda telah berhasil keluar",
          icon: "success",
          confirmButtonColor: "#4CAF50",
        }).then(() => {
          window.location.href = "https://jumatberkah.vercel.app/";
        });
      }
    });
  }

  // Menangani tampilan tombol logout dan admin berdasarkan role
  function updateAuthLinks() {
    const logoutBtn = document.getElementById("logout-btn");
    const adminBtn = document.getElementById("admin-btn");
    const token = localStorage.getItem("jwtToken");
    const userRole = localStorage.getItem("userRole");

    if (token) {
      logoutBtn.innerText = "Logout";
      logoutBtn.onclick = logout;

      // Tampilkan tombol admin jika user adalah admin
      if (userRole === "admin" && adminBtn) {
        adminBtn.style.display = "block";
        adminBtn.onclick = () => {
          window.location.href = "admin/admin.html";
        };
      }
    } else {
      logoutBtn.innerText = "Sign in";
      logoutBtn.href = "auth/login.html";
      if (adminBtn) {
        adminBtn.style.display = "none";
      }
    }
  }

  // Event listener untuk input pencarian
  searchBar.addEventListener("input", () => {
    const searchTerm = searchBar.value;
    fetchMasjidData(searchTerm);
  });

  // Menambahkan event listener untuk hover pada navbar buttons
  navbarButtons.forEach((button) => {
    button.addEventListener("mouseover", () => {
      const randomColor = getRandomColor();
      button.style.backgroundColor = randomColor;
    });

    button.addEventListener("mouseout", () => {
      button.style.backgroundColor = "";
    });
  });

  // Inisialisasi
  window.onload = function () {
    updateAuthLinks();
    fetchMasjidData();

    // Tampilkan pesan selamat datang hanya jika tidak ada token di URL
    if (!token) {
      Swal.fire({
        title: "Selamat Datang!",
        text: "di Aplikasi Jumat Berkah",
        icon: "success",
        confirmButtonColor: "#4CAF50",
        timer: 2000,
        timerProgressBar: true,
      });
    }
  };
});
