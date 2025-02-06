const API_BASE_URL = "https://backend-berkah.onrender.com";
const ENDPOINTS = {
  GET_LOCATION: "/retreive/data/location",
  UPDATE_PROFILE: "/updateprofile",
  UPLOAD_PROFILE_PICTURE: "/upload/profile-picture",
  GET_USERS: "/retreive/data/user",
  UPDATE_USER: "/updateuser",
  DELETE_USER: "/deleteuser",
};

const DEBOUNCE_DELAY = 300; // milliseconds

// Fungsi debounce untuk search
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

document.addEventListener("DOMContentLoaded", () => {
  const searchBar = document.getElementById("search-bar");
  const detailsContainer = document.getElementById("masjid-details");
  const navbarButtons = document.querySelectorAll(".navbar-button");
  const editProfileForm = document.getElementById("editProfileForm");

  // Handle Google OAuth Callback Token
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get("token");

  if (token) {
    try {
      const tokenParts = token.split(".");
      if (tokenParts.length !== 3) {
        throw new Error("Invalid token format");
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

  let loadingInstance = null;

  function showLoading() {
    if (loadingInstance) return loadingInstance;

    loadingInstance = Swal.fire({
      title: "Mohon Tunggu...",
      allowOutsideClick: false,
      showConfirmButton: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });
    return loadingInstance;
  }

  function hideLoading() {
    if (loadingInstance) {
      Swal.close();
      loadingInstance = null;
    }
  }

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

  async function handleError(error, customMessage = null) {
    console.error(error);
    const message = customMessage || error.message || "Terjadi kesalahan";

    await Swal.fire({
      icon: "error",
      title: "Error!",
      text: message,
      confirmButtonColor: "#4CAF50",
    });
  }

  async function baseFetch(endpoint, options = {}) {
    const token = localStorage.getItem("jwtToken");
    const url = `${API_BASE_URL}${endpoint}`;

    try {
      const defaultHeaders = {
        "Content-Type": "application/json",
        Authorization: token ? `Bearer ${token}` : "",
        "X-Requested-With": "XMLHttpRequest",
      };

      // Jika options.body adalah FormData, jangan set Content-Type
      if (options.body instanceof FormData) {
        delete defaultHeaders["Content-Type"];
      }

      const response = await fetch(url, {
        method: options.method || "GET",
        mode: "cors",
        credentials: "include",
        headers: {
          ...defaultHeaders,
          ...options.headers,
        },
        body: options.body,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`
        );
      }

      return await response.json();
    } catch (error) {
      console.error("Fetch error:", error);
      throw error;
    }
  }

  async function fetchMasjidData(searchTerm = "") {
    try {
      showLoading();
      const endpoint = searchTerm
        ? `${ENDPOINTS.GET_LOCATION}?search=${encodeURIComponent(searchTerm)}`
        : ENDPOINTS.GET_LOCATION;

      const data = await baseFetch(endpoint);
      console.log("Data masjid:", data);
      return data;
    } catch (error) {
      console.error("Error fetching masjid data:", error);
      await handleError(error, "Gagal mengambil data masjid");
      return [];
    } finally {
      hideLoading();
    }
  }

  async function fetchUserData() {
    try {
      const data = await baseFetch(ENDPOINTS.GET_USERS);
      const userId = localStorage.getItem("userId");
      const currentUser = data.find((u) => u.id === parseInt(userId));

      if (!currentUser) {
        throw new Error("User tidak ditemukan");
      }

      return currentUser;
    } catch (error) {
      console.error("Error fetching user data:", error);
      await handleError(error, "Gagal mengambil data user");
      throw error;
    }
  }

  async function updateProfile(formData) {
    try {
      return await baseFetch(ENDPOINTS.UPDATE_PROFILE, {
        method: "PUT",
        body: formData,
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      throw error;
    }
  }

  async function uploadProfilePicture(file) {
    try {
      if (!file.type.startsWith("image/")) {
        throw new Error("File harus berupa gambar");
      }

      if (file.size > 20 * 1024 * 1024) {
        throw new Error("Ukuran file maksimal 20MB");
      }

      const formData = new FormData();
      formData.append("profile_picture", file);
      formData.append("user_id", localStorage.getItem("userId"));

      return await baseFetch(ENDPOINTS.UPLOAD_PROFILE_PICTURE, {
        method: "POST",
        body: formData,
      });
    } catch (error) {
      console.error("Error uploading profile picture:", error);
      throw error;
    }
  }

  async function fetchMasjidDetail(masjidId) {
    try {
      return await baseFetch(`${ENDPOINTS.GET_LOCATION}/${masjidId}`);
    } catch (error) {
      console.error("Error fetching masjid detail:", error);
      throw new Error("Gagal mengambil detail masjid");
    }
  }

  async function fetchAndDisplayProfileData() {
    try {
      showLoading();
      const userData = await fetchUserData();

      const elements = {
        username: document.getElementById("username"),
        email: document.getElementById("email"),
        bio: document.getElementById("bio"),
        preferredMasjid: document.getElementById("preferredMasjid"),
        profilePicture: document.getElementById("profilePicture"),
      };

      if (elements.username)
        elements.username.textContent = userData.username || "-";
      if (elements.email) elements.email.textContent = userData.email || "-";
      if (elements.bio)
        elements.bio.textContent = userData.bio || "Belum ada bio";

      if (elements.profilePicture && userData.profile_picture) {
        const imageUrl = userData.profile_picture.startsWith("http")
          ? userData.profile_picture
          : `${API_BASE_URL}${userData.profile_picture}`;

        elements.profilePicture.src = imageUrl;
        elements.profilePicture.onerror = () => {
          elements.profilePicture.src = "/assets/default-avatar.png";
        };
      }

      if (userData.preferred_masjid) {
        try {
          const masjidData = await fetchMasjidDetail(userData.preferred_masjid);
          if (elements.preferredMasjid) {
            elements.preferredMasjid.textContent = masjidData.name;
          }
        } catch (error) {
          console.error("Error fetching preferred masjid:", error);
          if (elements.preferredMasjid) {
            elements.preferredMasjid.textContent = "Belum dipilih";
          }
        }
      }
    } catch (error) {
      console.error("Error in fetchAndDisplayProfileData:", error);
      await handleError(error, "Gagal memuat data profil");
    } finally {
      hideLoading();
    }
  }

  // Setup form handlers
  if (editProfileForm) {
    editProfileForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      try {
        showLoading();

        const formData = new FormData(editProfileForm);
        formData.append("user_id", localStorage.getItem("userId"));

        await updateProfile(formData);

        await Swal.fire({
          icon: "success",
          title: "Berhasil!",
          text: "Profil berhasil diperbarui",
          timer: 1500,
          showConfirmButton: false,
        });

        window.location.href = "profile.html";
      } catch (error) {
        await handleError(error, "Gagal mengupdate profil");
      } finally {
        hideLoading();
      }
    });
  }

  // Setup profile picture upload
  const pictureInput = document.getElementById("pictureInput");
  const changePictureBtn = document.querySelector(".change-picture-btn");

  if (changePictureBtn && pictureInput) {
    changePictureBtn.addEventListener("click", () => {
      pictureInput.click();
    });

    pictureInput.addEventListener("change", async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      try {
        showLoading();
        const response = await uploadProfilePicture(file);

        if (response.url) {
          const profilePicture = document.getElementById("profilePicture");
          if (profilePicture) {
            profilePicture.src = `${API_BASE_URL}${response.url}`;
          }
        }

        await Swal.fire({
          icon: "success",
          title: "Berhasil!",
          text: "Foto profil berhasil diperbarui",
          timer: 1500,
          showConfirmButton: false,
        });
      } catch (error) {
        await handleError(error, "Gagal mengupload foto profil");
      } finally {
        hideLoading();
      }
    });
  }

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
                <button onclick="showMasjidDetails('${
                  masjid.id
                }')" class="detail-btn">
                    <i class="fas fa-info-circle"></i> Detail
                </button>
            </div>
        `;

    return card;
  }

  function getRandomColor() {
    const colors = ["#4CAF50", "#45a049", "#57c75e", "#39843d", "#66bb6a"];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  function checkLoginStatus() {
    const { isAuthenticated } = checkAuth();
    const logoutBtn = document.querySelector(".logout-btn");
    const profileBtn = document.querySelector(".profile-btn");
    const loginBtn = document.querySelector(".login-btn");

    if (isAuthenticated) {
      if (loginBtn) loginBtn.style.display = "none";
      if (logoutBtn) logoutBtn.style.display = "flex";
      if (profileBtn) profileBtn.style.display = "flex";
      return true;
    } else {
      if (loginBtn) loginBtn.style.display = "flex";
      if (logoutBtn) logoutBtn.style.display = "none";
      if (profileBtn) profileBtn.style.display = "none";
      return false;
    }
  }

  function displayMasjidList(masjidData, searchTerm = "") {
    const searchContainer = document.querySelector(".search-container");
    let masjidContainer = document.querySelector(".masjid-container");

    if (!masjidContainer) {
      masjidContainer = document.createElement("div");
      masjidContainer.className = "masjid-container";
      searchContainer.parentNode.insertBefore(
        masjidContainer,
        searchContainer.nextSibling
      );
    }

    masjidContainer.innerHTML = "";

    if (!Array.isArray(masjidData) || masjidData.length === 0) {
      masjidContainer.innerHTML = `
                <div class="no-data">
                    <i class="fas fa-mosque"></i>
                    <p>Tidak ada masjid ditemukan</p>
                </div>
            `;
      return;
    }

    let filteredMasjid = masjidData;
    if (searchTerm) {
      filteredMasjid = masjidData.filter(
        (masjid) =>
          masjid.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          masjid.address.toLowerCase().includes(searchTerm.toLowerCase())
      );

      filteredMasjid.sort((a, b) => {
        const aMatch = a.name
          .toLowerCase()
          .startsWith(searchTerm.toLowerCase());
        const bMatch = b.name
          .toLowerCase()
          .startsWith(searchTerm.toLowerCase());
        return bMatch - aMatch;
      });
    }

    filteredMasjid.forEach((masjid) => {
      const card = createMasjidCard(masjid);
      masjidContainer.appendChild(card);
    });
  }

  async function showMasjidDetails(masjidId) {
    if (!detailsContainer) return;

    try {
      showLoading();
      const masjid = await fetchMasjidDetail(masjidId);

      detailsContainer.style.display = "flex";
      const detailsContent = detailsContainer.querySelector(".details-content");

      if (detailsContent) {
        detailsContent.innerHTML = `
                    <button class="close-details">
                        <i class="fas fa-times"></i>
                    </button>
                    <h2>${masjid.name}</h2>
                    <p><i class="fas fa-map-marker-alt"></i> ${
                      masjid.address
                    }</p>
                    <p><i class="fas fa-clock"></i> Waktu Sholat Jumat: ${
                      masjid.friday_prayer_time
                    }</p>
                    <p><i class="fas fa-info-circle"></i> ${
                      masjid.description || "Tidak ada deskripsi"
                    }</p>
                `;

        const closeButton = detailsContent.querySelector(".close-details");
        if (closeButton) {
          closeButton.onclick = () => {
            detailsContainer.style.display = "none";
          };
        }
      }
    } catch (error) {
      console.error("Error in showMasjidDetails:", error);
      await handleError(error, "Gagal memuat detail masjid");
    } finally {
      hideLoading();
    }
  }

  function logout() {
    Swal.fire({
      title: "Apakah Anda yakin ingin keluar?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Ya, Keluar",
      cancelButtonText: "Batal",
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.clear();
        Swal.fire({
          title: "Berhasil Keluar",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
        }).then(() => {
          window.location.href = "/auth/login.html";
        });
      }
    });
  }

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
          localStorage.clear();
          window.location.href = "../auth/login.html";
        });
      }, 15 * 60 * 1000); // 15 menit
    };

    window.onload = resetTimer;
    window.onmousemove = resetTimer;
    window.onkeypress = resetTimer;
  }

  function showWelcomeMessage() {
    const hasShownWelcome = sessionStorage.getItem("hasShownWelcome");
    const isAuthenticated = checkAuth().isAuthenticated;

    if (!hasShownWelcome) {
      Swal.fire({
        title: isAuthenticated
          ? "Selamat datang kembali!"
          : "Selamat Datang di Aplikasi Jumat Berkah",
        icon: "success",
        timer: 2000,
        timerProgressBar: true,
        showConfirmButton: false,
      });
      sessionStorage.setItem("hasShownWelcome", "true");
    }
  }

  // Initialize
  async function initialize() {
    try {
      const isLoggedIn = checkLoginStatus();
      showWelcomeMessage();

      const isHomePage =
        window.location.pathname === "/" ||
        window.location.pathname.endsWith("index.html");

      if (isHomePage) {
        const masjidData = await fetchMasjidData();
        displayMasjidList(masjidData);

        if (searchBar) {
          const debouncedSearch = debounce((value) => {
            displayMasjidList(masjidData, value.trim());
          }, DEBOUNCE_DELAY);

          searchBar.addEventListener("input", (e) => {
            debouncedSearch(e.target.value);
          });
        }
      }

      if (window.location.pathname.includes("profile.html")) {
        await fetchAndDisplayProfileData();
      }

      setupAutoLogout();
    } catch (error) {
      console.error("Initialization error:", error);
      await handleError(error, "Terjadi kesalahan saat memuat halaman");
    }
  }

  // Event listeners for navbar buttons
  if (navbarButtons) {
    navbarButtons.forEach((button) => {
      button.addEventListener("mouseover", () => {
        button.style.backgroundColor = getRandomColor();
      });

      button.addEventListener("mouseout", () => {
        button.style.backgroundColor = "";
      });
    });
  }

  // Start initialization
  initialize().catch((error) => {
    console.error("Fatal initialization error:", error);
    handleError(error, "Terjadi kesalahan yang tidak diharapkan");
  });
});
