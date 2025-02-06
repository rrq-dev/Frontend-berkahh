document.addEventListener("DOMContentLoaded", () => {
  const searchBar = document.getElementById("search-bar");
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

  let loadingInstance = null;

  // Fungsi untuk menampilkan loading
  function showLoading() {
    const spinner = document.getElementById("loading-spinner");
    if (spinner) {
      spinner.style.display = "block";
    }
  }

  // Fungsi untuk menyembunyikan loading
  function hideLoading() {
    const spinner = document.getElementById("loading-spinner");
    if (spinner) {
      spinner.style.display = "none";
    }
  }

  // Perbaikan fungsi checkAuth untuk menangani role dengan lebih baik
  function checkAuth() {
    const token = localStorage.getItem("jwtToken");
    const userId = localStorage.getItem("userId");
    const userRole = localStorage.getItem("userRole");
    const isAuthenticated = !!(token && userId);

    return {
      isAuthenticated,
      token,
      userId,
      userRole,
      isAdmin: userRole === "admin",
      isUser: userRole === "user",
    };
  }

  // Fungsi untuk handle error dengan lebih baik
  async function handleError(error, customMessage = null) {
    console.error(error);
    await Swal.fire({
      icon: "error",
      title: "Error!",
      text: customMessage || error.message || "Terjadi kesalahan",
      confirmButtonColor: "#4CAF50",
    });
  }

  // Perbaikan fungsi fetchMasjidData
  async function fetchMasjidData(searchTerm = "") {
    try {
      const { token } = checkAuth();

      const url = new URL(
        "https://backend-berkah.onrender.com/retreive/data/location"
      );
      if (searchTerm) {
        url.searchParams.append("search", searchTerm);
      }

      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
          "Content-Type": "application/json",
          "Cache-Control": "no-cache",
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || "Gagal mengambil data lokasi masjid"
        );
      }

      const data = await response.json();
      console.log("Fetched masjid data:", data); // Debugging
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error("Error in fetchMasjidData:", error);
      throw error;
    }
  }

  // Fungsi untuk menampilkan daftar masjid
  function displayMasjidList(masjidData) {
    const masjidContainer = document.getElementById("masjid-list");
    if (!masjidContainer) return;

    try {
      console.log("Displaying masjid data:", masjidData); // Debugging

      if (!Array.isArray(masjidData) || masjidData.length === 0) {
        masjidContainer.innerHTML = `
          <div class="no-results">
            <i class="fas fa-mosque"></i>
            <p>Tidak ada masjid yang ditemukan</p>
          </div>
        `;
        return;
      }

      masjidContainer.innerHTML = "";
      masjidData.forEach((masjid) => {
        const masjidCard = createMasjidCard(masjid);
        masjidContainer.appendChild(masjidCard);
      });
    } catch (error) {
      console.error("Error in displayMasjidList:", error);
      masjidContainer.innerHTML = `
        <div class="error-message">
          <i class="fas fa-exclamation-circle"></i>
          <p>Terjadi kesalahan saat menampilkan data</p>
        </div>
      `;
    }
  }

  // Tambahan fungsi createMasjidCard
  function createMasjidCard(masjid) {
    const card = document.createElement("div");
    card.className = "masjid-card";

    card.innerHTML = `
      <div class="masjid-info">
        <h3>${masjid.name || "Nama tidak tersedia"}</h3>
        <p><i class="fas fa-map-marker-alt"></i> ${
          masjid.address || "Alamat tidak tersedia"
        }</p>
        <p><i class="fas fa-clock"></i> Waktu Sholat Jumat: ${
          masjid.friday_prayer_time || "Waktu tidak tersedia"
        }</p>
      </div>
      <div class="masjid-actions">
        <button onclick="showMasjidDetails('${masjid.id}')" class="detail-btn">
          <i class="fas fa-info-circle"></i> Detail
        </button>
      </div>
    `;

    return card;
  }

  // Fungsi untuk update auth links dan profile picture
  function updateAuthLinks() {
    const { isAuthenticated, role } = checkAuth();
    const logoutBtn = document.getElementById("logout-btn");
    const profileBtn = document.getElementById("profile-btn");
    const profilePicture = document.getElementById("profilePicture");

    if (isAuthenticated) {
      // User atau admin sudah login
      if (logoutBtn) {
        logoutBtn.innerHTML = '<i class="fas fa-sign-out-alt"></i> Logout';
        logoutBtn.onclick = logout;
        logoutBtn.href = "#";
      }

      // Tampilkan tombol Profile untuk semua user yang sudah login
      if (profileBtn) {
        profileBtn.style.display = "block";
        const profileLink = profileBtn.querySelector("a");
        if (profileLink) {
          profileLink.href = "/profile/profile.html";
          profileLink.innerHTML = '<i class="fas fa-user"></i> Profile';
        }
      }

      // Update profile picture
      if (profilePicture) {
        fetchAndUpdateProfilePicture();
      }
    } else {
      // Belum login
      if (logoutBtn) {
        logoutBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Sign in';
        logoutBtn.href = "/auth/login.html";
        logoutBtn.onclick = null;
      }

      if (profileBtn) {
        profileBtn.style.display = "none";
      }

      if (profilePicture) {
        profilePicture.src = "/assets/default-avatar.png";
      }
    }
  }

  // Fungsi untuk logout dengan animasi
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
        localStorage.clear(); // Menghapus semua data termasuk token
        Swal.fire({
          title: "Berhasil Logout",
          text: "Anda telah berhasil keluar",
          icon: "success",
          showConfirmButton: false,
          timer: 1000,
          timerProgressBar: true,
          didClose: () => {
            window.location.href = "https://jumatberkah.vercel.app/";
          },
        });
      }
    });
  }
  // Setup auto logout setelah periode tidak aktif
  function setupAutoLogout() {
    let timeout;

    const resetTimer = () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        Swal.fire({
          title: "Anda telah keluar karena tidak aktif",
          icon: "warning",
          confirmButtonColor: "#4CAF50",
        }).then(() => {
          localStorage.clear(); // Menghapus semua data termasuk token
          window.location.href = "../auth/login.html"; // Redirect ke halaman login
        });
      }, 15 * 60 * 1000); // 15 menit
    };

    // Reset timer saat ada interaksi
    window.onload = resetTimer;
    window.onmousemove = resetTimer;
    window.onkeypress = resetTimer;
  }

  // Perbaikan fungsi showWelcomeMessage
  function showWelcomeMessage() {
    const { isAuthenticated } = checkAuth();
    const hasShownWelcome = sessionStorage.getItem("hasShownWelcome");

    if (!hasShownWelcome) {
      const message = isAuthenticated
        ? "Selamat datang kembali!"
        : "Selamat datang di Aplikasi Jumat Berkah";

      Swal.fire({
        title: message,
        icon: "success",
        timer: 2000,
        timerProgressBar: true,
        showConfirmButton: false,
      });

      sessionStorage.setItem("hasShownWelcome", "true");
    }
  }

  // Perbaikan fungsi fetchAndDisplayProfileData dengan endpoint yang benar
  async function fetchAndDisplayProfileData() {
    try {
      await showLoading();
      const { token, userId } = checkAuth();

      const response = await fetch(
        "https://backend-berkah.onrender.com/retreive/data/user",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) throw new Error("Gagal mengambil data pengguna");

      const users = await response.json();
      const currentUser = users.find((u) => u.id === parseInt(userId));

      if (currentUser) {
        if (currentUser.profile_picture) {
          localStorage.setItem("profilePicture", currentUser.profile_picture);
        }
        await handleProfilePicture();

        // Update informasi profil
        const elements = {
          username: document.getElementById("username"),
          email: document.getElementById("email"),
          bio: document.getElementById("bio"),
          preferredMasjid: document.getElementById("preferredMasjid"),
        };

        if (elements.username)
          elements.username.textContent = currentUser.username || "-";
        if (elements.email)
          elements.email.textContent = currentUser.email || "-";
        if (elements.bio)
          elements.bio.textContent = currentUser.bio || "Belum ada bio";

        // Update preferred masjid dengan endpoint yang benar
        if (elements.preferredMasjid && currentUser.preferred_masjid) {
          try {
            const masjidData = await fetchMasjidData();
            const masjid = masjidData.find(
              (m) => m.id === parseInt(currentUser.preferred_masjid)
            );
            elements.preferredMasjid.textContent = masjid
              ? masjid.name
              : "Belum dipilih";
          } catch (error) {
            console.error("Error fetching masjid data:", error);
            elements.preferredMasjid.textContent = "Belum dipilih";
          }
        }
      }
    } catch (error) {
      console.error("Error fetching profile data:", error);
      throw error;
    } finally {
      hideLoading();
    }
  }

  // Perbaikan fungsi handleProfilePicture dengan validasi URL
  async function handleProfilePicture() {
    const profilePicture = document.getElementById("profilePicture");
    if (!profilePicture) return;

    try {
      const savedProfilePic = localStorage.getItem("profilePicture");
      const defaultAvatar =
        "https://jumatberkah.vercel.app/assets/default-avatar.png";

      if (savedProfilePic) {
        const imageUrl = savedProfilePic.startsWith("http")
          ? savedProfilePic
          : `https://backend-berkah.onrender.com${savedProfilePic}`;

        await new Promise((resolve, reject) => {
          const img = new Image();
          img.onload = () => {
            profilePicture.src = imageUrl;
            resolve();
          };
          img.onerror = () => {
            profilePicture.src = defaultAvatar;
            resolve();
          };
          img.src = imageUrl;
        });
      } else {
        profilePicture.src = defaultAvatar;
      }
    } catch (error) {
      console.error("Error loading profile picture:", error);
      profilePicture.src = defaultAvatar;
    }
  }

  // Fungsi untuk mengambil dan menampilkan data profil
  async function fetchAndUpdateProfilePicture() {
    const { token, userId } = checkAuth();
    const profilePicture = document.getElementById("profilePicture");

    if (!profilePicture) return;

    try {
      const response = await fetch(
        "https://backend-berkah.onrender.com/retreive/data/user",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) throw new Error("Failed to fetch user data");

      const users = await response.json();
      const currentUser = users.find((u) => u.id === parseInt(userId));

      if (currentUser && currentUser.profile_picture) {
        profilePicture.src = `https://backend-berkah.onrender.com${currentUser.profile_picture}`;
        // Update URL di localStorage jika diperlukan
        localStorage.setItem("profilePicture", currentUser.profile_picture);
      } else {
        profilePicture.src = "/assets/default-avatar.png";
      }
    } catch (error) {
      console.error("Error fetching profile picture:", error);
      profilePicture.src = "/assets/default-avatar.png";
    }
  }

  // Update fungsi untuk halaman edit profile
  function updateEditProfilePage(currentUser, masjidData) {
    const elements = {
      username: document.getElementById("username"),
      email: document.getElementById("email"),
      bio: document.getElementById("bio"),
      preferredMasjid: document.getElementById("preferredMasjid"),
      profilePicture: document.getElementById("profilePicture"),
      pictureInput: document.getElementById("pictureInput"),
    };

    // Update form fields
    if (elements.username) elements.username.value = currentUser.username || "";
    if (elements.email) elements.email.value = currentUser.email || "";
    if (elements.bio) elements.bio.value = currentUser.bio || "";

    // Update profile picture
    handleProfilePicture();

    // Handle profile picture change
    const changePictureBtn = document.querySelector(".change-picture-btn");
    if (changePictureBtn && elements.pictureInput) {
      changePictureBtn.addEventListener("click", () => {
        elements.pictureInput.click();
      });

      elements.pictureInput.addEventListener("change", async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
          // Validasi file
          if (!file.type.startsWith("image/")) {
            throw new Error("File harus berupa gambar");
          }

          if (file.size > 20 * 1024 * 1024) {
            throw new Error("Ukuran file maksimal 20MB");
          }

          // Preview image sebelum upload
          const reader = new FileReader();
          reader.onload = (e) => {
            if (elements.profilePicture) {
              elements.profilePicture.src = e.target.result;
            }
          };
          reader.readAsDataURL(file);

          // Prepare form data
          const formData = new FormData();
          formData.append("profile_picture", file);
          formData.append("user_id", localStorage.getItem("userId"));

          const token = localStorage.getItem("jwtToken");
          const response = await fetch(
            "https://backend-berkah.onrender.com/upload/profile-picture",
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${token}`,
              },
              body: formData,
            }
          );

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Gagal mengunggah gambar");
          }

          const result = await response.json();

          // Simpan URL gambar ke localStorage
          if (result.url) {
            localStorage.setItem("profilePicture", result.url);
            // Update tampilan gambar
            handleProfilePicture();
          }

          Swal.fire({
            icon: "success",
            title: "Berhasil!",
            text: "Foto profil berhasil diperbarui",
            timer: 1500,
            showConfirmButton: false,
          });
        } catch (error) {
          console.error("Error uploading image:", error);
          Swal.fire({
            icon: "error",
            title: "Error!",
            text: error.message || "Gagal mengunggah gambar",
            confirmButtonColor: "#4CAF50",
          });
        }
      });
    }

    if (elements.preferredMasjid) {
      elements.preferredMasjid.innerHTML =
        '<option value="">Pilih Masjid</option>';
      masjidData.forEach((masjid) => {
        const option = document.createElement("option");
        option.value = masjid.id;
        option.textContent = masjid.name;
        if (currentUser.preferred_masjid === masjid.id.toString()) {
          option.selected = true;
        }
        elements.preferredMasjid.appendChild(option);
      });
    }
  }

  // Perbaikan fungsi initialize
  async function initialize() {
    try {
      // Update auth links terlebih dahulu
      updateAuthLinks();

      // Tampilkan welcome message tanpa loading
      const { isAuthenticated } = checkAuth();
      if (isAuthenticated) {
        Swal.fire({
          title: "Selamat datang kembali!",
          icon: "success",
          timer: 2000,
          timerProgressBar: true,
          showConfirmButton: false,
        });
      } else {
        Swal.fire({
          title: "Selamat datang di Aplikasi Jumat Berkah",
          icon: "success",
          timer: 2000,
          timerProgressBar: true,
          showConfirmButton: false,
        });
      }

      // Setup auto logout
      setupAutoLogout();

      // Setup search functionality
      setupSearch();

      const isHomePage =
        window.location.pathname === "/" ||
        window.location.pathname.endsWith("index.html");

      if (isHomePage) {
        await loadMasjidData();
      }
    } catch (error) {
      console.error("Initialization error:", error);
      await handleError(error, "Terjadi kesalahan saat memuat halaman");
    }
  }

  // Fungsi baru untuk memuat data masjid
  async function loadMasjidData() {
    try {
      showLoading();
      const masjidData = await fetchMasjidData();

      if (!masjidData || masjidData.length === 0) {
        document.querySelector(".masjid-list").innerHTML = `
          <div class="no-results">
            <i class="fas fa-mosque"></i>
            <p>Tidak ada data masjid yang tersedia</p>
          </div>
        `;
        return;
      }

      displayMasjidList(masjidData);
    } catch (error) {
      console.error("Error loading masjid data:", error);
      document.querySelector(".masjid-list").innerHTML = `
        <div class="error-message">
          <i class="fas fa-exclamation-circle"></i>
          <p>Gagal memuat data masjid. Silakan coba lagi.</p>
        </div>
      `;
    } finally {
      hideLoading();
    }
  }

  // Perbaikan fungsi setupSearch
  function setupSearch() {
    const searchInput = document.getElementById("search-bar");
    const searchButton = document.getElementById("search-button");
    if (!searchInput || !searchButton) return;

    let debounceTimer;

    const performSearch = async (searchTerm) => {
      try {
        showLoading();
        const masjidData = await fetchMasjidData(searchTerm);
        displayMasjidList(masjidData);
      } catch (error) {
        await handleError(error, "Gagal mencari masjid");
      } finally {
        hideLoading();
      }
    };

    // Event listener untuk input
    searchInput.addEventListener("input", (e) => {
      const searchTerm = e.target.value.trim();
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => performSearch(searchTerm), 300);
    });

    // Event listener untuk button
    searchButton.addEventListener("click", () => {
      const searchTerm = searchInput.value.trim();
      performSearch(searchTerm);
    });
  }

  // Tambahan fungsi untuk menampilkan detail masjid
  function showMasjidDetails(masjidId) {
    const detailsContainer = document.getElementById("masjid-details");
    const detailsContent = detailsContainer.querySelector(".details-body");
    const closeButton = detailsContainer.querySelector(".close-details");

    // Fetch dan tampilkan detail masjid
    fetchMasjidDetails(masjidId)
      .then((masjid) => {
        if (detailsContent) {
          detailsContent.innerHTML = `
            <h2>${masjid.name}</h2>
            <p><i class="fas fa-map-marker-alt"></i> ${masjid.address}</p>
            <p><i class="fas fa-clock"></i> Waktu Sholat Jumat: ${
              masjid.friday_prayer_time
            }</p>
            <p><i class="fas fa-info-circle"></i> ${
              masjid.description || "Tidak ada deskripsi"
            }</p>
          `;
        }
        detailsContainer.style.display = "flex";
      })
      .catch((error) => {
        handleError(error, "Gagal memuat detail masjid");
      });

    // Event listener untuk tombol close
    if (closeButton) {
      closeButton.onclick = () => {
        detailsContainer.style.display = "none";
      };
    }
  }

  // Fungsi untuk fetch detail masjid
  async function fetchMasjidDetails(masjidId) {
    try {
      const { token } = checkAuth();
      const response = await fetch(
        `https://backend-berkah.onrender.com/retreive/data/location/${masjidId}`,
        {
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Gagal mengambil detail masjid");
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching masjid details:", error);
      throw error;
    }
  }

  // Navbar button effects untuk semua halaman
  if (navbarButtons) {
    navbarButtons.forEach((button) => {
      button.addEventListener("mouseover", () => {
        const randomColor = getRandomColor(); // Memanggil fungsi getRandomColor
        button.style.backgroundColor = randomColor;
      });

      button.addEventListener("mouseout", () => {
        button.style.backgroundColor = "";
      });
    });
  }

  // Event listener untuk DOM Content Loaded
  initialize().catch((error) => {
    console.error("Fatal initialization error:", error);
    handleError(error, "Terjadi kesalahan yang tidak diharapkan");
  });

  // Tambahkan CSS untuk loading spinner
  const style = document.createElement("style");
  style.textContent = `
    .loading-spinner {
        width: 40px;
        height: 40px;
        border: 4px solid #f3f3f3;
        border-top: 4px solid #3498db;
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin: 20px auto;
    }
    
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(style);
});
