document.addEventListener("DOMContentLoaded", () => {
  const searchBar = document.getElementById("search-bar");
  const detailsContainer = document.getElementById("masjid-details");
  const navbarButtons = document.querySelectorAll(".navbar-button"); // Handle Google OAuth Callback Token

  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get("token");

  if (token) {
    try {
      // Decode token untuk mendapatkan informasi user
      const tokenParts = token.split(".");
      if (tokenParts.length !== 3) {
        throw new Error("Format token tidak valid");
      }

      const payload = JSON.parse(atob(tokenParts[1])); // Simpan token dan user info

      localStorage.setItem("jwtToken", token);
      localStorage.setItem("userId", payload.user_id);
      localStorage.setItem("userRole", payload.role); // Hapus token dari URL tanpa reload halaman

      window.history.replaceState({}, document.title, window.location.pathname); // Tampilkan pesan selamat datang untuk login Google

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
  function getRandomColor() {
    const letters = "0123456789ABCDEF";
    let color = "#";
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  } // Event listener untuk tombol "Lihat Peta"

  const viewMapButton = document.getElementById("view-map");
  if (viewMapButton) {
    viewMapButton.addEventListener("click", () => {
      const embedLink =
        detailsContainer.querySelector(".embed-link").textContent; // Ambil link embed
      window.open(embedLink, "_blank"); // Buka link di tab baru
    });
  }

  function showMasjidDetails(masjid) {
    const detailsContainer = document.getElementById("masjid-details");
    detailsContainer.style.display = "block"; // Pastikan ini ada

    let embed_link = "";
    if (masjid.embed_link) {
      embed_link = `
            <iframe 
                src="${masjid.embed_link.replace(
                  "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15844.823009946409!2d107.55732785541993!3d-6.8659299999999925!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e68e6a068cc097b%3A0xa8987b4117b7e7e0!2sMasjid%20Jami%20At%20-%20Taufiq!5e0!3m2!1sid!2sid!4v1739146677156!5m2!1sid!2sid",
                  "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15842.958781268419!2d107.58811545541991!3d-6.921689699999987!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e68e625bd2312d5%3A0xfc2c9204afbcbb9f!2sMasjid%20Raya%20Bandung!5e0!3m2!1sid!2sid!4v1739146764012!5m2!1sid!2sid" // Perbaikan: Ganti 6 jadi 7
                )}" 
                width="100%" 
                height="300" 
                frameborder="0" 
                style="border:0"
                allowfullscreen
            ></iframe>
        `;
    } else {
      console.warn(`embed_link untuk masjid ${masjid.name} tidak tersedia.`);
      embed_link = `<p>Peta tidak tersedia.</p>`;
    }

    detailsContainer.querySelector(".details-body").innerHTML = `
        <div class="details-header">
            <h2 class="details-title">${masjid.name}</h2>
        </div>
        <div class="details-info">
            <p class="details-address"><i class="fas fa-map-marker-alt"></i> ${
              masjid.address
            }</p>
            <p class="details-description">${
              masjid.description || "Tidak ada deskripsi"
            }</p>
        </div>
        <div class="details-map-container">
            ${embed_link}
        </div>
    `;
  }
  async function fetchMasjidData(searchTerm = "") {
    try {
      const apiUrl =
        "https://backend-berkah.onrender.com/retreive/data/location";
      const response = await fetch(apiUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const message = `HTTP error! status: ${
          response.status
        }, text: ${await response.text()}`;
        throw new Error(`Gagal mengambil data masjid: ${message}`);
      }

      const masjidData = await response.json();

      if (!window.location.pathname.includes("/profile/")) {
        displayMasjidList(masjidData, searchTerm);
      }

      return masjidData;
    } catch (error) {
      console.error("Error fetching masjid data:", error);
      if (!window.location.pathname.includes("/profile/")) {
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: "Gagal memuat data masjid!",
          confirmButtonColor: "#4CAF50",
        });
      }
      throw error;
    }
  }

  function displayMasjidList(masjidData, searchTerm = "") {
    const masjidList = document.getElementById("masjid-list");
    if (!masjidList) return;

    masjidList.innerHTML = ""; // Bersihkan daftar sebelum menampilkan hasil baru

    const filteredAndSortedData = masjidData
      .map((masjid) => {
        const name = masjid.name.toLowerCase();
        const search = searchTerm.toLowerCase();

        let score = 0;
        if (name === search) score = 100;
        else if (name.startsWith(search)) score = 75;
        else if (name.includes(search)) score = 50;

        return { ...masjid, score };
      })
      .filter((masjid) => masjid.score > 0)
      .sort((a, b) => b.score - a.score);

    if (filteredAndSortedData.length === 0) {
      masjidList.innerHTML = `
            <div class="no-results">
                <i class="fas fa-search"></i>
                <p>Masjid yang dicari tidak ditemukan</p>
            </div>
        `;
      return;
    }

    filteredAndSortedData.forEach((masjid) => {
      const masjidItem = document.createElement("div");
      masjidItem.className = "masjid-item";

      const highlightedName = searchTerm
        ? masjid.name.replace(
            new RegExp(searchTerm, "gi"),
            (match) => `<span class="highlight">${match}</span>`
          )
        : masjid.name;

      let embed_link_display = "";
      if (masjid.embed_link) {
        embed_link_display = `<a href="${masjid.embed_link}" target="_blank" rel="noopener noreferrer" style="color: inherit; text-decoration: none;">
                    <i class="fas fa-map-marker-alt"></i> ${masjid.address}
                </a>`;
      } else {
        console.warn(`embed_link untuk masjid ${masjid.name} tidak tersedia.`);
        embed_link_display = `<p><i class="fas fa-map-marker-alt"></i> ${masjid.address} (Peta tidak tersedia)</p>`;
      }

      masjidItem.innerHTML = `
            <div class="masjid-content">
                <h3>${highlightedName}</h3>
                <p>${embed_link_display}</p>
                <p><i class="fas fa-info-circle"></i> ${
                  masjid.description || "Tidak ada deskripsi"
                }</p>
                <button class="view-details-button" data-masjid-id="${
                  masjid.id
                }">
                    <i class="fas fa-eye"></i> Lihat Detail
                </button>
            </div>
        `;

      masjidItem.addEventListener("mouseover", () => {
        masjidItem.style.transform = "translateY(-5px)";
        masjidItem.style.boxShadow = "0 5px 15px rgba(0,0,0,0.3)";
        masjidItem.style.transition = "all 0.3s ease";
      });

      masjidItem.addEventListener("mouseout", () => {
        masjidItem.style.transform = "translateY(0)";
        masjidItem.style.boxShadow = "0 2px 5px rgba(0,0,0,0.1)";
      });

      const viewDetailsButton = masjidItem.querySelector(
        ".view-details-button"
      );
      viewDetailsButton.addEventListener("click", () => {
        // Ambil data masjid yang sesuai berdasarkan ID atau properti unik lainnya
        const clickedMasjid = masjidData.find((m) => m.id === masjid.id); // Ganti 'id' dengan properti unik masjid Anda
        if (clickedMasjid) {
          showMasjidDetails(clickedMasjid);
        } else {
          console.error("Masjid tidak ditemukan!");
        }
      });

      masjidList.appendChild(masjidItem);
    });
  }
  function updateAuthLinks() {
    const logoutBtn = document.querySelector(".logout-btn");
    const loginBtn = document.querySelector(".login-btn");
    const profileBtn = document.querySelector(".profile-btn");
    const token = localStorage.getItem("jwtToken");

    if (token) {
      logoutBtn.style.display = "block";
      logoutBtn.innerHTML = '<i class="fas fa-sign-out-alt"></i> Logout';
      logoutBtn.onclick = logout;
      loginBtn.style.display = "none";
      profileBtn.style.display = "none"; // Hide profile button when logged in
    } else {
      logoutBtn.style.display = "none";
      loginBtn.style.display = "block";
      loginBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Sign in';
      profileBtn.style.display = "none";
    }
  }

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
        localStorage.clear();
        updateAuthLinks(); // Call updateAuthLinks immediately after clearing localStorage
        Swal.fire({
          title: "Berhasil Logout",
          text: "Anda telah berhasil keluar",
          icon: "success",
          showConfirmButton: false,
          timer: 1500,
          timerProgressBar: true,
          didClose: () => {
            window.location.href = "https://jumatberkah.vercel.app/"; // Redirect after the Swal closes
          },
        });
      }
    });
  }

  const closeDetailsButton = document.querySelector(".close-details");
  if (closeDetailsButton) {
    closeDetailsButton.addEventListener("click", () => {
      detailsContainer.style.display = "none";
    });
  }
  // Fungsi untuk mengambil dan menampilkan data profil
  async function fetchAndDisplayProfileData() {
    const token = localStorage.getItem("jwtToken");
    const userId = localStorage.getItem("userId");
    if (!token || !userId) {
      window.location.href = "../auth/login.html";
      return;
    }
    try {
      // Fetch user data - Endpoint spesifik untuk user
      const userResponse = await fetch(
        "https://backend-berkah.onrender.com/retreive/data/user",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!userResponse.ok) {
        // Penanganan error HTTP response yang lebih informatif
        const message = `HTTP error! status: ${
          userResponse.status
        }, text: ${await userResponse.text()}`;
        throw new Error(`Gagal mengambil data user: ${message}`);
      }
      const users = await userResponse.json();
      const currentUser = users.find((u) => u.id === parseInt(userId));
      if (!currentUser) {
        throw new Error("User tidak ditemukan dalam data yang diterima");
      } // Fetch data masjid - Endpoint spesifik untuk lokasi masjid
      const masjidResponse = await fetch(
        "https://backend-berkah.onrender.com/retreive/data/location"
      );
      if (!masjidResponse.ok) {
        // Penanganan error HTTP response yang lebih informatif
        const message = `HTTP error! status: ${
          masjidResponse.status
        }, text: ${await masjidResponse.text()}`;
        throw new Error(`Gagal mengambil data masjid: ${message}`);
      }
      const masjidData = await masjidResponse.json();
      if (window.location.pathname.includes("profile.html")) {
        document.getElementById("username").textContent =
          currentUser.username || "-";
        document.getElementById("email").textContent = currentUser.email || "-";
        document.getElementById("bio").textContent =
          currentUser.bio || "Belum diisi"; // Bagian preferredMasjid di-comment out sesuai permintaan // document.getElementById("preferredMasjid").textContent = "Tidak ditampilkan";
      } else if (window.location.pathname.includes("profile_edit.html")) {
        document.getElementById("username").value = currentUser.username || "";
        document.getElementById("email").value = currentUser.email || "";
        document.getElementById("bio").value = currentUser.bio || ""; // Dropdown masjid di-comment out sesuai permintaan // const masjidSelect = document.getElementById("preferredMasjid"); // masjidSelect.innerHTML = '<option value="">Pilih Masjid</option>'; // masjidData.forEach((masjid) => { //  const option = document.createElement("option"); //  option.value = masjid.id; //  option.textContent = masjid.name; //  if (currentUser.preferred_masjid === masjid.id.toString()) { //   option.selected = true; //  } //  masjidSelect.appendChild(option); // });
      }
    } catch (error) {
      console.error("Error:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Gagal memuat data profil",
        confirmButtonColor: "#4CAF50",
      }); // Lempar kembali error untuk ditangani oleh fungsi pemanggil
      throw error;
    }
  } // Handle profile form submission

  const profileForm = document.getElementById("profileForm");
  if (profileForm) {
    profileForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      try {
        const token = localStorage.getItem("jwtToken");
        const userId = localStorage.getItem("userId");
        if (!token || !userId) {
          throw new Error("Token atau User ID tidak ditemukan");
        }
        const username = document.getElementById("username").value.trim();
        const email = document.getElementById("email").value.trim();
        const bio = document.getElementById("bio")?.value.trim() || "";

        if (!username || !email) {
          throw new Error("Mohon isi semua field yang wajib");
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          throw new Error("Format email tidak valid");
        }

        const updateData = {
          user_id: parseInt(userId),
          username,
          email,
          preferred_masjid: "", // preferred_masjid tidak digunakan lagi
          bio,
          full_name: "",
          phone_number: "",
          address: "",
        };
        Swal.fire({
          title: "Memperbarui Profil",
          text: "Mohon tunggu...",
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          },
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
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Gagal memperbarui profil");
        }
        await Swal.fire({
          icon: "success",
          title: "Berhasil!",
          text: "Profil berhasil diperbarui",
          timer: 1500,
          showConfirmButton: false,
          timerProgressBar: true,
        });
        window.location.href = "profile.html";
      } catch (error) {
        console.error("Error updating profile:", error);
        Swal.fire({
          icon: "error",
          title: "Error!",
          text: error.message || "Terjadi kesalahan saat memperbarui profil",
          confirmButtonColor: "#4CAF50",
        });
      }
    });
  } // Fungsi initialize dengan animasi fade-in

  async function initialize() {
    const token = localStorage.getItem("jwtToken");
    const isProfilePage = window.location.pathname.includes("/profile/");

    document.body.style.opacity = "0";
    document.body.style.transition = "opacity 0.5s";
    setTimeout(() => {
      document.body.style.opacity = "1";
    }, 100);

    updateAuthLinks();

    if (!token && !isProfilePage && !localStorage.getItem("welcomeShown")) {
      localStorage.setItem("welcomeShown", "true");
      Swal.fire({
        title: "Selamat Datang!",
        text: "di Aplikasi Jumat Berkah",
        icon: "success",
        confirmButtonColor: "#4CAF50",
        timer: 2000,
        timerProgressBar: true,
      });
    }

    if (!isProfilePage) {
      try {
        await fetchMasjidData();
      } catch (error) {
        console.error("Error fetching masjid data pada initialize:", error);
      }
    }
  } // Event listener untuk search bar dengan debounce

  if (searchBar && !window.location.pathname.includes("/profile/")) {
    let debounceTimer;
    searchBar.addEventListener("input", (e) => {
      const loadingSpinner = document.getElementById("loading-spinner");
      if (loadingSpinner) loadingSpinner.style.display = "block";
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(async () => {
        const searchTerm = e.target.value;
        try {
          await fetchMasjidData(searchTerm);
        } catch (error) {
          // Penanganan error fetchMasjidData dalam debounce
          console.error("Gagal fetch data masjid saat debounce:", error);
          Swal.fire({
            icon: "error",
            title: "Oops...",
            text: "Gagal memuat data masjid saat mencari.",
            confirmButtonColor: "#4CAF50",
          });
        } finally {
          // Pastikan loading spinner selalu disembunyikan
          if (loadingSpinner) loadingSpinner.style.display = "none";
        }
      }, 300);
    });

    const searchButton = document.getElementById("search-button");
    if (searchButton) {
      searchButton.addEventListener("click", async () => {
        const searchTerm = searchBar.value;
        try {
          await fetchMasjidData(searchTerm);
        } catch (error) {
          // Penanganan error fetchMasjidData saat klik tombol search
          console.error(
            "Gagal fetch data masjid saat tombol search diklik:",
            error
          );
          Swal.fire({
            icon: "error",
            title: "Oops...",
            text: "Gagal memuat data masjid saat mencari.",
            confirmButtonColor: "#4CAF50",
          });
        } finally {
          // Pastikan loading spinner selalu disembunyikan
          if (loadingSpinner) loadingSpinner.style.display = "none";
        }
      });
    }
  } // Efek warna navbar button

  if (navbarButtons) {
    navbarButtons.forEach((button) => {
      button.addEventListener("mouseover", () => {
        const randomColor = getRandomColor();
        button.style.backgroundColor = randomColor;
      });
      button.addEventListener("mouseout", () => {
        button.style.backgroundColor = "";
      });
    });
  } // Proteksi halaman profile

  if (window.location.pathname.includes("/profile/")) {
    const token = localStorage.getItem("jwtToken");
    if (!token) {
      window.location.href = "../auth/login.html";
      return;
    }
    fetchAndDisplayProfileData().catch((error) => {
      // Penanganan error jika fetchAndDisplayProfileData gagal saat inisialisasi halaman profile
      console.error("Gagal memuat data profil pada initialize:", error);
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: "Gagal memuat data profil.",
        confirmButtonColor: "#4CAF50",
      });
    });
  } else {
    initialize().catch(console.error);
  }
});
