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

  // Fungsi untuk update auth links dan profile picture
  function updateAuthLinks() {
    const logoutBtn = document.getElementById("logout-btn");
    const profileBtn = document.getElementById("profile-btn");
    const profilePicture = document.getElementById("profilePicture");
    const token = localStorage.getItem("jwtToken");

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

      // Update profile picture jika ada
      if (profilePicture) {
        const userId = localStorage.getItem("userId");
        fetch("https://backend-berkah.onrender.com/retreive/data/user", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
          .then((response) => response.json())
          .then((users) => {
            const user = users.find((u) => u.id === parseInt(userId));
            if (user && user.profile_picture) {
              profilePicture.src = `https://backend-berkah.onrender.com${user.profile_picture}`;
            }
          })
          .catch(console.error);
      }

      // Tambahkan animasi hover untuk tombol
      [logoutBtn, profileBtn].forEach((btn) => {
        if (btn) {
          btn.addEventListener("mouseover", () => {
            btn.style.transform = "translateY(-2px)";
          });
          btn.addEventListener("mouseout", () => {
            btn.style.transform = "translateY(0)";
          });
        }
      });
    } else {
      // User belum login
      logoutBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Sign in';
      logoutBtn.href = "auth/login.html";
      logoutBtn.onclick = null;

      // Sembunyikan tombol Profile
      if (profileBtn) {
        profileBtn.style.display = "none";
      }

      // Reset profile picture ke default
      if (profilePicture) {
        profilePicture.src = "../assets/default-avatar.png";
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
        // Tambahkan animasi fade out
        document.body.style.opacity = "0";
        document.body.style.transition = "opacity 0.5s";

        setTimeout(() => {
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
        }, 500);
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

      try {
        const token = localStorage.getItem("jwtToken");
        const userId = localStorage.getItem("userId");

        if (!token || !userId) {
          throw new Error("Token atau User ID tidak ditemukan");
        }

        // Validasi input
        const username = document.getElementById("username").value.trim();
        const email = document.getElementById("email").value.trim();
        const fullName = document.getElementById("fullName").value.trim();
        const phoneNumber = document.getElementById("phoneNumber").value.trim();
        const address = document.getElementById("address").value.trim();
        const preferredMasjid = document
          .getElementById("preferredMasjid")
          .value.trim();
        const bio = document.getElementById("bio")?.value.trim() || "";
        const oldPassword = document.getElementById("oldPassword")?.value || "";
        const newPassword = document.getElementById("newPassword")?.value || "";

        // Validasi dasar
        if (!username || !email || !fullName) {
          throw new Error("Mohon isi semua field yang wajib");
        }

        // Validasi email
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          throw new Error("Format email tidak valid");
        }

        // Buat objek data untuk update
        const updateData = {
          user_id: parseInt(userId),
          username,
          email,
          full_name: fullName,
          phone_number: phoneNumber,
          address,
          preferred_masjid: preferredMasjid,
          bio,
        };

        // Tambahkan password jika diisi
        if (oldPassword && newPassword) {
          if (newPassword.length < 6) {
            throw new Error("Password baru minimal 6 karakter");
          }
          updateData.old_password = oldPassword;
          updateData.new_password = newPassword;
        }

        // Tampilkan loading
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

        const responseData = await response.json();

        if (!response.ok) {
          throw new Error(responseData.message || "Gagal memperbarui profil");
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
        if (!file) return;

        try {
          // Validasi file
          if (!file.type.startsWith("image/")) {
            throw new Error("File harus berupa gambar");
          }

          if (file.size > 20 * 1024 * 1024) {
            throw new Error("Ukuran file maksimal 20MB");
          }

          // Preview image
          const reader = new FileReader();
          reader.onload = (e) => {
            const profilePicture = document.getElementById("profilePicture");
            if (profilePicture) {
              profilePicture.src = e.target.result;
            }
          };
          reader.readAsDataURL(file);

          // Prepare form data
          const formData = new FormData();
          formData.append("profile_picture", file);
          formData.append("user_id", localStorage.getItem("userId"));

          // Show loading
          Swal.fire({
            title: "Mengunggah Gambar",
            text: "Mohon tunggu...",
            allowOutsideClick: false,
            didOpen: () => {
              Swal.showLoading();
            },
          });

          const response = await fetch(
            "https://backend-berkah.onrender.com/profile-picture",
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${localStorage.getItem("jwtToken")}`,
              },
              body: formData,
            }
          );

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Gagal mengunggah gambar");
          }

          Swal.fire({
            icon: "success",
            title: "Berhasil!",
            text: "Foto profil berhasil diperbarui",
            confirmButtonColor: "#4CAF50",
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
      };

      input.click();
    });
  }

  // Update fungsi initialize dengan animasi
  async function initialize() {
    const token = localStorage.getItem("jwtToken");
    const isProfilePage = window.location.pathname.includes("/profile/");

    // Tambahkan animasi fade in saat load
    document.body.style.opacity = "0";
    document.body.style.transition = "opacity 0.5s";
    setTimeout(() => {
      document.body.style.opacity = "1";
    }, 100);

    // Update auth links dan profile picture
    updateAuthLinks();

    // Welcome message untuk user baru
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

    // Ambil data masjid untuk semua user
    if (!isProfilePage) {
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
