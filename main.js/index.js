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

  // Deklarasi fungsi updateAuthLinks di awal
  function updateAuthLinks() {
    const logoutBtn = document.getElementById("logout-btn");
    const profileBtn = document.getElementById("profile-btn");
    const token = localStorage.getItem("jwtToken");
    const userRole = localStorage.getItem("userRole");

    if (!logoutBtn) return;

    if (token) {
      // User sudah login
      logoutBtn.innerHTML = '<i class="fas fa-sign-out-alt"></i> Logout';
      logoutBtn.onclick = logout;
      logoutBtn.href = "#";

      // Tampilkan tombol Profile
      if (profileBtn) {
        profileBtn.style.display = "block";
        const profileLink = profileBtn.querySelector("a");
        if (profileLink) {
          profileLink.href = "profile/profile.html";
          profileLink.innerHTML = '<i class="fas fa-user"></i> Profile';
        }
      }
    } else {
      // User belum login
      logoutBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Sign in';
      logoutBtn.href = "auth/login.html";
      logoutBtn.onclick = null;

      // Sembunyikan tombol Profile
      if (profileBtn) {
        profileBtn.style.display = "none";
      }
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
      // Hanya tampilkan alert error jika di halaman utama
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
    if (!masjidList) return; // Guard clause jika elemen tidak ditemukan

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

  // Fungsi untuk mengambil dan menampilkan data profil user
  async function fetchUserProfile() {
    try {
      const token = localStorage.getItem("jwtToken");
      const userId = localStorage.getItem("userId");

      if (!token || !userId) {
        console.log("Token atau User ID tidak ditemukan");
        return null;
      }

      const response = await fetch(
        "https://backend-berkah.onrender.com/retreive/data/user",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Gagal mengambil data profil");
      }

      const users = await response.json();
      const userProfile = users.find((user) => user.id === parseInt(userId));

      if (!userProfile) {
        throw new Error("Profil pengguna tidak ditemukan");
      }

      // Jika berada di halaman profile, tampilkan data
      if (window.location.pathname.includes("/profile/")) {
        // Update informasi pribadi
        document.getElementById("username").textContent =
          userProfile.username || "-";
        document.getElementById("fullName").textContent =
          userProfile.full_name || "-";
        document.getElementById("email").textContent = userProfile.email || "-";
        document.getElementById("phoneNumber").textContent =
          userProfile.phone_number || "-";

        // Update alamat
        document.getElementById("address").textContent =
          userProfile.address || "-";

        // Update masjid favorit
        document.getElementById("preferredMasjid").textContent =
          userProfile.preferred_masjid || "-";

        // Update foto profil jika ada
        const profilePicture = document.getElementById("profilePicture");
        if (profilePicture && userProfile.profile_picture) {
          profilePicture.src = userProfile.profile_picture;
        }
      }

      return userProfile;
    } catch (error) {
      console.error("Error fetching user profile:", error);
      if (window.location.pathname.includes("/profile/")) {
        Swal.fire({
          title: "Error!",
          text: "Gagal memuat data profil",
          icon: "error",
          confirmButtonColor: "#4CAF50",
        });
      }
      return null;
    }
  }

  // Handle profile form submission
  const profileForm = document.getElementById("profileForm");
  if (profileForm) {
    profileForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const formData = new FormData(profileForm);
      const updateData = {
        user_id: parseInt(localStorage.getItem("userId")),
        username: formData.get("username"),
        email: formData.get("email"),
        full_name: formData.get("fullName"),
        phone_number: formData.get("phoneNumber"),
        address: formData.get("address"),
        preferred_masjid: formData.get("preferredMasjid"),
        bio: formData.get("bio"),
      };

      const oldPassword = formData.get("oldPassword");
      const newPassword = formData.get("newPassword");
      if (oldPassword && newPassword) {
        if (newPassword.length < 6) {
          Swal.fire({
            title: "Error!",
            text: "Password baru minimal 6 karakter",
            icon: "error",
            confirmButtonColor: "#4CAF50",
          });
          return;
        }
        updateData.old_password = oldPassword;
        updateData.new_password = newPassword;
      }

      try {
        const response = await fetch(
          "https://backend-berkah.onrender.com/updateprofile",
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("jwtToken")}`,
            },
            body: JSON.stringify(updateData),
          }
        );

        if (!response.ok) {
          throw new Error("Gagal memperbarui profil");
        }

        await Swal.fire({
          title: "Berhasil!",
          text: "Profil berhasil diperbarui",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
        });

        window.location.href = "../index.html";
      } catch (error) {
        console.error("Error updating profile:", error);
        Swal.fire({
          title: "Error!",
          text: error.message,
          icon: "error",
          confirmButtonColor: "#4CAF50",
        });
      }
    });
  }

  // Handle profile picture change
  const changePictureBtn = document.querySelector(".change-picture-btn");
  if (changePictureBtn) {
    changePictureBtn.addEventListener("click", () => {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "image/*";

      input.onchange = async (e) => {
        const file = e.target.files[0];
        if (file) {
          if (file.size > 2 * 1024 * 1024) {
            Swal.fire({
              title: "Error!",
              text: "Ukuran file maksimal 2MB",
              icon: "error",
              confirmButtonColor: "#4CAF50",
            });
            return;
          }

          try {
            const reader = new FileReader();
            reader.onload = (e) => {
              document.getElementById("profilePicture").src = e.target.result;
            };
            reader.readAsDataURL(file);

            // TODO: Implement image upload to server
            // const formData = new FormData();
            // formData.append("profile_picture", file);
            // ... upload logic ...
          } catch (error) {
            console.error("Error uploading image:", error);
            Swal.fire({
              title: "Error!",
              text: "Gagal mengunggah gambar",
              icon: "error",
              confirmButtonColor: "#4CAF50",
            });
          }
        }
      };

      input.click();
    });
  }

  // Update fungsi initialize
  async function initialize() {
    const token = localStorage.getItem("jwtToken");
    const isProfilePage = window.location.pathname.includes("/profile/");

    // Update auth links untuk semua halaman
    updateAuthLinks();

    // Jika tidak ada token dan bukan di halaman profile, tampilkan welcome message
    if (!token && !isProfilePage) {
      Swal.fire({
        title: "Selamat Datang!",
        text: "di Aplikasi Jumat Berkah",
        icon: "success",
        confirmButtonColor: "#4CAF50",
        timer: 2000,
        timerProgressBar: true,
      });
    }

    // Jika ada token, coba ambil data user
    if (token) {
      try {
        await fetchUserProfile();
      } catch (error) {
        console.error("Error fetching profile:", error);
      }
    }

    // Ambil data masjid untuk semua user (dengan atau tanpa token)
    if (!isProfilePage) {
      try {
        await fetchMasjidData();
      } catch (error) {
        console.error("Error fetching masjid data:", error);
      }
    }
  }

  // Event listeners hanya untuk halaman utama
  if (searchBar && !window.location.pathname.includes("/profile/")) {
    searchBar.addEventListener("input", () => {
      const searchTerm = searchBar.value;
      fetchMasjidData(searchTerm);
    });
  }

  // Navbar button effects untuk semua halaman
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

  // Cek autentikasi untuk halaman profile
  if (window.location.pathname.includes("/profile/")) {
    const token = localStorage.getItem("jwtToken");
    if (!token) {
      window.location.href = "../auth/login.html";
      return;
    }
  }

  // Inisialisasi
  initialize().catch(console.error);
});
