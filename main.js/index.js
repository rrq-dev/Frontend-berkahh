document.addEventListener("DOMContentLoaded", () => {
  const searchBar = document.getElementById("search-bar");
  const detailsContainer = document.getElementById("masjid-details");
  const navbarButtons = document.querySelectorAll(".navbar-button");
  const addressFilterDropdown = document.getElementById("address-filter"); // Dapatkan dropdown filter alamat

  // Handle Google OAuth Callback Token
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get("token");

  if (token) {
    try {
      // Decode token untuk mendapatkan informasi user
      const tokenParts = token.split(".");
      if (tokenParts.length !== 3) {
        throw new Error("Format token tidak valid");
      }

      const payload = JSON.parse(atob(tokenParts[1]));

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
  }

  const viewMapButton = document.getElementById("view-map");
  if (viewMapButton) {
    viewMapButton.addEventListener("click", () => {
      const embedLink =
        detailsContainer.querySelector(".embed-link").textContent;
      window.open(embedLink, "_blank");
    });
  }

  function showMasjidDetails(masjid) {
    const detailsContainer = document.getElementById("masjid-details");
    detailsContainer.style.display = "block";

    let embed_link = "";
    if (masjid.embed_link) {
      embed_link = `
              <iframe
                  src="${masjid.embed_link.replace(
                    "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15844.823009946409!2d107.55732785541993!3d-6.8659299999999925!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e68e6a068cc097b%3A0xa8987b4117b7e7e0!2sMasjid%20Jami%20At%20-%20Taufiq!5e0!3m2!1sid!2sid!4v1739146677156!5m2!1sid!2sid",
                    "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15842.958781268419!2d107.58811545541991!3d-6.921689699999987!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e68e625bd2312d5%3A0xfc2c9204afbcbb9f!2sMasjid%20Raya%20Bandung!5e0!3m2!1sid!2sid!4v1739146764012!5m2!1sid!2sid"
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

    masjidList.innerHTML = "";

    const selectedAddressFilter = addressFilterDropdown.value; // Ambil nilai filter alamat

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
      .sort((a, b) => b.score - a.score)
      .filter((masjid) => {
        // Filter berdasarkan alamat
        if (selectedAddressFilter === "all") {
          return true;
        } else if (selectedAddressFilter === "bandung") {
          return masjid.address.toLowerCase().includes("bandung");
        } else if (selectedAddressFilter === "non-bandung") {
          return !masjid.address.toLowerCase().includes("bandung");
        }
        return true;
      });

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
      let addressDisplay = masjid.address;

      if (masjid.embed_link) {
        embed_link_display = `<a href="${masjid.embed_link}" target="_blank" rel="noopener noreferrer" style="color: inherit; text-decoration: none;">
                                      <i class="fas fa-map-marker-alt"></i> ${addressDisplay}
                                  </a>`;
      } else {
        console.warn(`embed_link untuk masjid ${masjid.name} tidak tersedia.`);
        embed_link_display = `<p><i class="fas fa-map-marker-alt"></i> ${addressDisplay} (Peta tidak tersedia)</p>`;
      }

      if (!masjid.address.toLowerCase().includes("bandung")) {
        addressDisplay += ' <span style="color: red;">*</span>';
        embed_link_display = `<a href="${masjid.embed_link}" target="_blank" rel="noopener noreferrer" style="color: inherit; text-decoration: none;">
                                  <i class="fas fa-map-marker-alt"></i> ${addressDisplay}
                              </a>`;
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
        const clickedMasjid = masjidData.find((m) => m.id === masjid.id);
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
      if (logoutBtn) {
        logoutBtn.style.display = "block";
        logoutBtn.innerHTML = '<i class="fas fa-sign-out-alt"></i> Logout';
        logoutBtn.onclick = logout;
      }
      if (loginBtn) {
        loginBtn.style.display = "none";
      }
      if (profileBtn) {
        profileBtn.style.display = "block";
      }
    } else {
      if (logoutBtn) {
        logoutBtn.style.display = "none";
      }
      if (loginBtn) {
        loginBtn.style.display = "block";
        loginBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Login Admin';
      }
      if (profileBtn) {
        profileBtn.style.display = "none";
      }
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
        updateAuthLinks();
        Swal.fire({
          title: "Berhasil Logout",
          text: "Anda telah berhasil keluar",
          icon: "success",
          showConfirmButton: false,
          timer: 1500,
          timerProgressBar: true,
          didClose: () => {
            window.location.href = "https://jumatberkah.vercel.app/";
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

  async function fetchAndDisplayProfileData() {
    const token = localStorage.getItem("jwtToken");
    const userId = localStorage.getItem("userId");
    if (!token || !userId) {
      window.location.href = "../auth/login.html";
      return;
    }
    try {
      const userResponse = await fetch(
        "https://backend-berkah.onrender.com/retreive/data/user",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!userResponse.ok) {
        const message = `HTTP error! status: ${
          userResponse.status
        }, text: ${await userResponse.text()}`;
        throw new Error(`Gagal mengambil data user: ${message}`);
      }
      const users = await userResponse.json();
      const currentUser = users.find((u) => u.id === parseInt(userId));
      if (!currentUser) {
        throw new Error("User tidak ditemukan dalam data yang diterima");
      }

      const masjidResponse = await fetch(
        "https://backend-berkah.onrender.com/retreive/data/location"
      );
      if (!masjidResponse.ok) {
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
          currentUser.bio || "Belum diisi";
      } else if (window.location.pathname.includes("profile_edit.html")) {
        document.getElementById("username").value = currentUser.username || "";
        document.getElementById("email").value = currentUser.email || "";
        document.getElementById("bio").value = currentUser.bio || "";
      }
    } catch (error) {
      console.error("Error:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Gagal memuat data profil",
        confirmButtonColor: "#4CAF50",
      });
      throw error;
    }
  }

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
          preferred_masjid: "",
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
  }

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
  }

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
          console.error("Gagal fetch data masjid saat debounce:", error);
          Swal.fire({
            icon: "error",
            title: "Oops...",
            text: "Gagal memuat data masjid saat mencari.",
            confirmButtonColor: "#4CAF50",
          });
        } finally {
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
          if (loadingSpinner) loadingSpinner.style.display = "none";
        }
      });
    }
  }

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
  }

  if (addressFilterDropdown) {
    // Tambahkan event listener untuk dropdown filter alamat
    addressFilterDropdown.addEventListener("change", async () => {
      const searchTerm = searchBar.value; // Pertahankan search term
      try {
        await fetchMasjidData(searchTerm);
      } catch (error) {
        console.error(
          "Error fetching masjid data saat filter alamat berubah:",
          error
        );
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: "Gagal memuat data masjid saat memfilter alamat.",
          confirmButtonColor: "#4CAF50",
        });
      }
    });
  }

  if (window.location.pathname.includes("/profile/")) {
    const token = localStorage.getItem("jwtToken");
    if (!token) {
      window.location.href = "../auth/login.html";
      return;
    }
    fetchAndDisplayProfileData().catch((error) => {
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
