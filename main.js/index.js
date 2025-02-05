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

  // Fungsi untuk mengambil data masjid tanpa perlu token
  async function fetchMasjidData(searchTerm = "") {
    try {
      const response = await fetch(
        "https://backend-berkah.onrender.com/retreive/data/location",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Gagal mengambil data masjid");
      }

      const masjidData = await response.json();

      // Hanya panggil displayMasjidList jika berada di halaman utama
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
    }
  }

  // Fungsi untuk menampilkan daftar masjid
  function displayMasjidList(masjidData, searchTerm = "") {
    const masjidList = document.getElementById("masjid-list");
    if (!masjidList) return;

    masjidList.innerHTML = "";

    const filteredData = masjidData.filter((masjid) =>
      masjid.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (filteredData.length === 0) {
      masjidList.innerHTML = `
        <div class="no-results">
          <i class="fas fa-search"></i>
          <p>Masjid yang dicari tidak ditemukan</p>
        </div>
      `;
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
        </div>
      `;

      // Tambahkan efek hover
      masjidItem.addEventListener("mouseover", () => {
        masjidItem.style.transform = "translateY(-5px)";
        masjidItem.style.boxShadow = "0 5px 15px rgba(0,0,0,0.3)";
      });

      masjidItem.addEventListener("mouseout", () => {
        masjidItem.style.transform = "translateY(0)";
        masjidItem.style.boxShadow = "0 2px 5px rgba(0,0,0,0.1)";
      });

      masjidList.appendChild(masjidItem);
    });
  }

  // Fungsi untuk cek autentikasi dan role
  function checkAuth() {
    const token = localStorage.getItem("jwtToken");
    const userId = localStorage.getItem("userId");
    const role = localStorage.getItem("role"); // Tambahkan role
    const isAuthenticated = !!(token && userId);

    return {
      isAuthenticated,
      token,
      userId,
      role,
      isAdmin: role === "admin",
      isUser: role === "user",
    };
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
  // Fungsi untuk menampilkan loading state
  function showLoading() {
    Swal.fire({
      title: "Memuat...",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });
  }

  // Fungsi untuk mengambil dan menampilkan data profil
  async function fetchAndDisplayProfileData() {
    const { isAuthenticated, token, userId } = checkAuth();

    if (!isAuthenticated) {
      Swal.fire({
        icon: "error",
        title: "Akses Ditolak",
        text: "Silakan login terlebih dahulu",
        confirmButtonColor: "#4CAF50",
      }).then(() => {
        window.location.href = "../auth/login.html";
      });
      return;
    }

    try {
      showLoading();

      const [userResponse, masjidResponse] = await Promise.all([
        fetch("https://backend-berkah.onrender.com/retreive/data/user", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
        fetch("https://backend-berkah.onrender.com/retreive/data/location"),
      ]);

      if (!userResponse.ok || !masjidResponse.ok) {
        throw new Error("Gagal mengambil data");
      }

      const [users, masjidData] = await Promise.all([
        userResponse.json(),
        masjidResponse.json(),
      ]);

      const currentUser = users.find((u) => u.id === parseInt(userId));
      if (!currentUser) throw new Error("User tidak ditemukan");

      Swal.close();

      // Update halaman sesuai dengan path
      if (window.location.pathname.includes("profile.html")) {
        updateProfilePage(currentUser, masjidData);
      } else if (window.location.pathname.includes("profile_edit.html")) {
        updateEditProfilePage(currentUser, masjidData);
      }
    } catch (error) {
      console.error("Error:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message || "Gagal memuat data profil",
        confirmButtonColor: "#4CAF50",
      });
    }
  }

  // Fungsi untuk update halaman profile
  function updateProfilePage(currentUser, masjidData) {
    const elements = {
      username: document.getElementById("username"),
      email: document.getElementById("email"),
      bio: document.getElementById("bio"),
      preferredMasjid: document.getElementById("preferredMasjid"),
      profilePicture: document.getElementById("profilePicture"),
    };

    if (elements.username)
      elements.username.textContent = currentUser.username || "-";
    if (elements.email) elements.email.textContent = currentUser.email || "-";
    if (elements.bio)
      elements.bio.textContent = currentUser.bio || "Belum diisi";

    if (elements.preferredMasjid) {
      const preferredMasjid = masjidData.find(
        (m) => m.id === parseInt(currentUser.preferred_masjid)
      );
      elements.preferredMasjid.textContent = preferredMasjid
        ? preferredMasjid.name
        : "Belum diisi";
    }

    if (elements.profilePicture) {
      if (currentUser.profile_picture) {
        const profilePicUrl = currentUser.profile_picture.startsWith("http")
          ? currentUser.profile_picture
          : `https://backend-berkah.onrender.com${currentUser.profile_picture}`;
        elements.profilePicture.src = profilePicUrl;
      } else {
        elements.profilePicture.src = "/assets/default-avatar.png";
      }
    }
  }

  // Fungsi untuk menangani profile picture
  function handleProfilePicture() {
    const profilePicture = document.getElementById("profilePicture");
    if (profilePicture) {
      const savedProfilePic = localStorage.getItem("profilePicture");
      if (savedProfilePic) {
        profilePicture.src = savedProfilePic.startsWith("http")
          ? savedProfilePic
          : `https://backend-berkah.onrender.com${savedProfilePic}`;
      } else {
        profilePicture.src = "../assets/default-avatar.png";
      }
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

  // Handle form submission dengan debounce
  const profileForm = document.getElementById("editProfileForm");
  if (profileForm) {
    let isSubmitting = false;
    profileForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (isSubmitting) return;

      isSubmitting = true;
      try {
        const token = localStorage.getItem("jwtToken");
        const userId = localStorage.getItem("userId");

        if (!token || !userId) {
          throw new Error("Token atau User ID tidak ditemukan");
        }

        const formData = {
          user_id: parseInt(userId),
          username: document.getElementById("username").value.trim(),
          email: document.getElementById("email").value.trim(),
          preferred_masjid: document
            .getElementById("preferredMasjid")
            .value.trim(),
          bio: document.getElementById("bio")?.value.trim() || "",
          full_name: "",
          phone_number: "",
          address: "",
        };

        // Validasi
        if (!formData.username || !formData.email) {
          throw new Error("Mohon isi semua field yang wajib");
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
          throw new Error("Format email tidak valid");
        }

        showLoading();

        const response = await fetch(
          "https://backend-berkah.onrender.com/updateprofile",
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(formData),
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
      } finally {
        isSubmitting = false;
      }
    });
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

  // Fungsi untuk menampilkan welcome message
  function showWelcomeMessage() {
    const hasShownWelcome = localStorage.getItem("hasShownWelcome");
    const token = localStorage.getItem("jwtToken");

    if (!token && !hasShownWelcome) {
      Swal.fire({
        title: "Selamat Datang!",
        text: "di Aplikasi Jumat Berkah",
        icon: "success",
        confirmButtonColor: "#4CAF50",
        timer: 2000,
        timerProgressBar: true,
      });
      localStorage.setItem("hasShownWelcome", "true");
    }
  }

  // Fungsi untuk inisialisasi
  async function initialize() {
    const { isAuthenticated } = checkAuth();
    const isProfilePage = window.location.pathname.includes("/profile/");

    // Tambahkan animasi fade in saat load
    document.body.style.opacity = "0";
    document.body.style.transition = "opacity 0.5s";
    setTimeout(() => {
      document.body.style.opacity = "1";
    }, 100);

    // Update auth links dan profile picture
    updateAuthLinks();
    handleProfilePicture();

    // Setup auto logout
    setupAutoLogout();

    // Welcome message untuk user baru
    showWelcomeMessage();

    if (isProfilePage) {
      if (isAuthenticated) {
        await fetchAndDisplayProfileData();
      } else {
        Swal.fire({
          icon: "error",
          title: "Akses Ditolak",
          text: "Silakan login terlebih dahulu",
          confirmButtonColor: "#4CAF50",
        }).then(() => {
          window.location.href = "../auth/login.html";
        });
      }
    } else {
      // Halaman non-profile
      try {
        await fetchMasjidData();
      } catch (error) {
        console.error("Error fetching masjid data:", error);
      }
    }
  }

  // Event listeners untuk search bar dengan debounce
  if (searchBar && !window.location.pathname.includes("/profile/")) {
    let debounceTimer;
    searchBar.addEventListener("input", () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        const searchTerm = searchBar.value;
        fetchMasjidData(searchTerm);
      }, 300);
    });
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

  // Inisialisasi
  initialize().catch(console.error);
});
