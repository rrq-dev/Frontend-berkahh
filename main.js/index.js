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

  // Pindahkan deklarasi fetchUserProfile ke atas sebelum digunakan
  async function fetchUserProfile() {
    try {
      const token = localStorage.getItem("jwtToken");
      const userId = localStorage.getItem("userId");

      if (!token || !userId) {
        throw new Error("Token atau User ID tidak ditemukan");
      }

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Timeout")), 5000)
      );

      const fetchPromise = fetch(
        `https://backend-berkah.onrender.com/retreive/data/user`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const response = await Promise.race([fetchPromise, timeoutPromise]);

      if (!response.ok) {
        throw new Error("Gagal mengambil data profil");
      }

      const users = await response.json();
      return users.find((user) => user.id === parseInt(userId));
    } catch (error) {
      console.error("Error fetching user profile:", error);
      return null; // Return null jika terjadi error
    }
  }

  // Update fungsi updateAuthLinks untuk menangani error dengan lebih baik
  async function updateAuthLinks() {
    const logoutBtn = document.getElementById("logout-btn");
    const adminBtn = document.getElementById("admin-btn");
    const profileBtn = document.getElementById("profile-btn");
    const token = localStorage.getItem("jwtToken");
    const userRole = localStorage.getItem("userRole");

    if (!logoutBtn) return; // Guard clause jika elemen tidak ditemukan

    if (token) {
      // User sudah login
      logoutBtn.innerHTML = '<i class="fas fa-sign-out-alt"></i> Logout';
      logoutBtn.onclick = logout;
      logoutBtn.href = "#"; // Hapus href karena menggunakan onclick

      // Tampilkan tombol Edit Profile
      if (profileBtn) {
        profileBtn.style.display = "block";
        const profileLink = profileBtn.querySelector("a");
        if (profileLink) {
          profileLink.innerHTML =
            '<i class="fas fa-user-edit"></i> Edit Profile';
        }
      }

      if (userRole === "admin" && adminBtn) {
        adminBtn.style.display = "block";
        adminBtn.onclick = () => {
          window.location.href = "../admin/admin.html";
        };
      }
    } else {
      // User belum login
      logoutBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Sign in';
      logoutBtn.href = "../auth/login.html";
      logoutBtn.onclick = null; // Hapus onclick handler

      // Sembunyikan tombol Edit Profile
      if (profileBtn) {
        profileBtn.style.display = "none";
      }

      if (adminBtn) {
        adminBtn.style.display = "none";
      }
    }
  }

  // Inisialisasi dengan async/await
  async function initialize() {
    updateAuthLinks();
    await fetchMasjidData();

    // Tampilkan pesan selamat datang hanya jika tidak ada token di URL
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("token");

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
  }

  // Panggil initialize
  initialize().catch(console.error);

  // Tambahkan ini untuk memuat data profil
  fetchUserProfile()
    .then((userProfile) => {
      if (userProfile) {
        console.log("User profile loaded:", userProfile);
      }
    })
    .catch((error) => {
      console.error("Error loading profile:", error);
    });

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
});

document.addEventListener("DOMContentLoaded", () => {
  // Inisialisasi elemen-elemen
  const profileForm = document.getElementById("profileForm");
  const usernameInput = document.getElementById("username");
  const emailInput = document.getElementById("email");
  const fullNameInput = document.getElementById("fullName");
  const phoneNumberInput = document.getElementById("phoneNumber");
  const addressInput = document.getElementById("address");
  const preferredMasjidInput = document.getElementById("preferredMasjid");
  const bioInput = document.getElementById("bio");
  const oldPasswordInput = document.getElementById("oldPassword");
  const newPasswordInput = document.getElementById("newPassword");
  const logoutBtn = document.getElementById("logout-btn");
  const profilePicture = document.getElementById("profilePicture");
  const changePictureBtn = document.querySelector(".change-picture-btn");

  // Cek autentikasi
  const token = localStorage.getItem("jwtToken");
  const userId = localStorage.getItem("userId");

  // Handle form submission
  profileForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Validasi input
    if (!usernameInput.value.trim() || !emailInput.value.trim()) {
      Swal.fire({
        title: "Error!",
        text: "Username dan email harus diisi",
        icon: "error",
        confirmButtonColor: "#007bff",
      });
      return;
    }

    // Prepare update data
    const updateData = {
      user_id: parseInt(userId),
      username: usernameInput.value.trim(),
      email: emailInput.value.trim(),
      full_name: fullNameInput.value.trim(),
      phone_number: phoneNumberInput.value.trim(),
      address: addressInput.value.trim(),
      preferred_masjid: preferredMasjidInput.value.trim(),
      bio: bioInput.value.trim(),
    };

    // Add password if provided
    if (oldPasswordInput.value && newPasswordInput.value) {
      if (newPasswordInput.value.length < 6) {
        Swal.fire({
          title: "Error!",
          text: "Password baru minimal 6 karakter",
          icon: "error",
          confirmButtonColor: "#007bff",
        });
        return;
      }
      updateData.old_password = oldPasswordInput.value;
      updateData.new_password = newPasswordInput.value;
    }

    try {
      // Show loading
      const loadingAlert = Swal.fire({
        title: "Menyimpan Perubahan...",
        allowOutsideClick: false,
        showConfirmButton: false,
        willOpen: () => {
          Swal.showLoading();
        },
      });

      // Send update request
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
        throw new Error(errorData.error || "Gagal memperbarui profil");
      }

      // Close loading and show success
      loadingAlert.close();
      await Swal.fire({
        title: "Berhasil!",
        text: "Profil berhasil diperbarui",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });

      // Redirect to home
      window.location.href = "../index.html";
    } catch (error) {
      console.error("Error updating profile:", error);
      Swal.fire({
        title: "Error!",
        text: error.message,
        icon: "error",
        confirmButtonColor: "#007bff",
      });
    }
  });

  // Handle logout
  logoutBtn.addEventListener("click", () => {
    Swal.fire({
      title: "Apakah Anda yakin?",
      text: "Anda akan keluar dari aplikasi",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#007bff",
      cancelButtonColor: "#dc3545",
      confirmButtonText: "Ya, Logout!",
      cancelButtonText: "Batal",
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.removeItem("jwtToken");
        localStorage.removeItem("userId");
        localStorage.removeItem("userRole");
        window.location.href = "../auth/login.html";
      }
    });
  });

  // Handle profile picture change
  changePictureBtn.addEventListener("click", () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";

    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (file) {
        // Validate file size (max 2MB)
        if (file.size > 2 * 1024 * 1024) {
          Swal.fire({
            title: "Error!",
            text: "Ukuran file maksimal 2MB",
            icon: "error",
            confirmButtonColor: "#007bff",
          });
          return;
        }

        try {
          // Show preview
          const reader = new FileReader();
          reader.onload = (e) => {
            profilePicture.src = e.target.result;
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
            confirmButtonColor: "#007bff",
          });
        }
      }
    };

    input.click();
  });

  // Load initial profile data
  fetchUserProfile();

  // Update navbar
  const updateNavbar = () => {
    const token = localStorage.getItem("jwtToken");
    if (!token) {
      window.location.href = "../auth/login.html";
    }
  };

  // Check authentication status periodically
  setInterval(updateNavbar, 5000);
});
