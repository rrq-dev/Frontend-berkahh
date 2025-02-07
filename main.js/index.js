document.addEventListener("DOMContentLoaded", async () => {
  const searchBar = document.getElementById("search-bar");
  const profileForm = document.getElementById("profileForm");
  const logoutBtn = document.querySelector(".logout-btn");
  const loginBtn = document.querySelector(".login-btn");
  const profileBtn = document.querySelector(".profile-btn");

  // Tangani token OAuth & Perbarui Navbar
  handleOAuthToken();
  updateAuthLinks();

  // Ambil Data Masjid jika bukan halaman profil
  if (!window.location.pathname.includes("/profile/")) {
    await fetchMasjidData();
  }

  // Event listener untuk pencarian masjid
  if (searchBar) {
    searchBar.addEventListener("input", (e) => fetchMasjidData(e.target.value));
  }

  // Event listener untuk submit profil
  if (profileForm) {
    profileForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      await updateProfile();
    });
  }

  // Logout handler
  if (logoutBtn) {
    logoutBtn.addEventListener("click", logout);
  }
});

// 🛠 Menangani Token OAuth
function handleOAuthToken() {
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get("token");

  if (token) {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      localStorage.setItem("jwtToken", token);
      localStorage.setItem("userId", payload.user_id);
      localStorage.setItem("userRole", payload.role);
      window.history.replaceState({}, document.title, window.location.pathname);

      Swal.fire({
        title: "Login Berhasil!",
        text: "Selamat datang kembali!",
        icon: "success",
        timer: 2000,
        showConfirmButton: false,
        timerProgressBar: true,
      });
    } catch (error) {
      Swal.fire({
        title: "Login Gagal",
        text: "Error memproses informasi login",
        icon: "error",
        confirmButtonText: "OK",
      });
    }
  }
}

// 🔄 Update Navbar Berdasarkan Status Login
function updateAuthLinks() {
  const token = localStorage.getItem("jwtToken");
  const logoutBtn = document.querySelector(".logout-btn");
  const loginBtn = document.querySelector(".login-btn");
  const profileBtn = document.querySelector(".profile-btn");

  if (token) {
    logoutBtn.style.display = "block";
    loginBtn.style.display = "none";
    profileBtn.style.display = "block";
  } else {
    logoutBtn.style.display = "none";
    loginBtn.style.display = "block";
    profileBtn.style.display = "none";
  }
}

// 🚀 Mengambil Data Masjid dengan Query
async function fetchMasjidData(searchTerm = "") {
  try {
    const response = await fetch(
      `https://backend-berkah.onrender.com/retreive/data/location?q=${searchTerm}`
    );
    if (!response.ok) throw new Error("Gagal mengambil data masjid");

    const masjidData = await response.json();
    displayMasjidList(masjidData, searchTerm);
  } catch (error) {
    Swal.fire({
      icon: "error",
      title: "Oops...",
      text: "Gagal memuat data masjid!",
    });
  }
}

// 📌 Menampilkan Daftar Masjid
function displayMasjidList(masjidData, searchTerm = "") {
  const masjidList = document.getElementById("masjid-list");
  if (!masjidList) return;

  masjidList.innerHTML = "";
  const filteredData = masjidData.filter((m) =>
    m.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (filteredData.length === 0) {
    masjidList.innerHTML = `<div class="no-results"><i class="fas fa-search"></i><p>Masjid tidak ditemukan</p></div>`;
    return;
  }

  filteredData.forEach((masjid) => {
    const masjidItem = document.createElement("div");
    masjidItem.className = "masjid-item";
    masjidItem.innerHTML = `
      <div class="masjid-content">
        <h3>${masjid.name}</h3>
        <p><i class="fas fa-map-marker-alt"></i> ${masjid.address}</p>
        <p><i class="fas fa-info-circle"></i> ${
          masjid.description || "Tidak ada deskripsi"
        }</p>
      </div>`;
    masjidList.appendChild(masjidItem);
  });
}

// 🔄 Fungsi Logout
function logout() {
  Swal.fire({
    title: "Apakah Anda yakin?",
    text: "Anda akan keluar dari aplikasi",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Ya, Logout!",
  }).then((result) => {
    if (result.isConfirmed) {
      localStorage.clear();
      updateAuthLinks();
      Swal.fire({
        title: "Logout Berhasil",
        text: "Anda telah keluar",
        icon: "success",
        timer: 1500,
      }).then(() => {
        window.location.href = "https://jumatberkah.vercel.app/";
      });
    }
  });
}

// ✍️ Fungsi Update Profil
async function updateProfile() {
  try {
    const token = localStorage.getItem("jwtToken");
    const userId = localStorage.getItem("userId");

    if (!token || !userId)
      throw new Error("Token atau User ID tidak ditemukan");

    const username = document.getElementById("username").value.trim();
    const email = document.getElementById("email").value.trim();
    const preferredMasjid = document
      .getElementById("preferredMasjid")
      .value.trim();
    const bio = document.getElementById("bio").value.trim() || "";

    if (!username || !email)
      throw new Error("Mohon isi semua field yang wajib");

    const updateData = {
      id: parseInt(userId),
      username,
      email,
      preferred_masjid: preferredMasjid,
      bio,
    };

    Swal.fire({
      title: "Memperbarui Profil",
      text: "Mohon tunggu...",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    const response = await fetch(
      "https://backend-berkah.onrender.com/updateprofile",
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updateData),
      }
    );

    if (!response.ok) throw new Error("Gagal memperbarui profil");

    Swal.fire({
      icon: "success",
      title: "Berhasil!",
      text: "Profil diperbarui",
      timer: 1500,
    });

    window.location.href = "profile.html";
  } catch (error) {
    Swal.fire({
      icon: "error",
      title: "Error!",
      text: error.message || "Gagal memperbarui profil",
    });
  }
}
