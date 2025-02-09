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
  function getRandomColor() {
      const letters = '0123456789ABCDEF';
      let color = '#';
      for (let i = 0; i < 6; i++) {
          color += letters[Math.floor(Math.random() * 16)];
      }
      return color;
  }

  // Event listener untuk tombol "Lihat Peta"
  const viewMapButton = document.getElementById("view-map");
  if (viewMapButton) {
      viewMapButton.addEventListener("click", () => {
          const embedLink =
              detailsContainer.querySelector(".embed-link").textContent; // Ambil link embed
          window.open(embedLink, "_blank"); // Buka link di tab baru
      });
  }
  // Fungsi untuk menampilkan detail masjid
  function showMasjidDetails(masjid) {
      detailsContainer.style.display = "block";
      detailsContainer.querySelector(".details-body").innerHTML = `
                  <h2>${masjid.name}</h2>
                  <p>${masjid.address}</p>
                  <p class="embed-link">${masjid.embed_link}</p>
                  <button id="view-map" class="navbar-button">Lihat Peta</button>
              `;
      // Re-attach event listener after re-rendering details
      const viewMapButton = document.getElementById("view-map");
      if (viewMapButton) {
          viewMapButton.addEventListener("click", () => {
              const embedLink = detailsContainer.querySelector(".embed-link").textContent;
              window.open(embedLink, "_blank");
          });
      }
  }

  // Fungsi untuk mengambil data masjid tanpa perlu token (diambil dari kode terbaru user)
  async function fetchMasjidData(searchTerm = "") {
      try {
          // *** FIX 4: TRY DIFFERENT API ENDPOINTS - TEST ONE AT A TIME ***

          // Opsi 1: URL dengan spelling yang benar dari awal, dan path yang lebih logis (dari kode user sebelumnya)
          const apiUrl = "https://backend-berkah.onrender.com/retreive/data/location";

          // Opsi 2: URL lebih sederhana berdasarkan nama function backend (GetLocation)
          // const apiUrl = "https://backend-berkah.onrender.com/location";

          // Opsi 3: URL lebih eksplisit berdasarkan nama function backend (getLocation - camelCase to kebab-case)
          // const apiUrl = "https://backend-berkah.onrender.com/get-location";

          // Opsi 4: URL root API saja - untuk tes apakah root API respons
          // const apiUrl = "https://backend-berkah.onrender.com/";


          console.log("Fetching masjid data from:", apiUrl); // *** Tambahkan console.log untuk URL ***

          const response = await fetch(apiUrl, {
              method: "GET",
              headers: {
                  "Content-Type": "application/json",
              },
          });

          if (!response.ok) {
              throw new Error("Gagal mengambil data masjid"); // Error message lebih generik dari kode user
          }

          const masjidData = await response.json();

          // Hanya panggil displayMasjidList jika berada di halaman utama (dari kode user)
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
                  text: "Gagal memuat data masjid!", // Error message dari kode user
                  confirmButtonColor: "#4CAF50",
              });
          }
      }
  }


  // Fungsi untuk menampilkan daftar masjid dengan pencarian yang lebih responsif (dari kode user)
  function displayMasjidList(masjidData, searchTerm = "") {
      const masjidList = document.getElementById("masjid-list");
      if (!masjidList) return;

      masjidList.innerHTML = "";

      // Filter dan sort masjid berdasarkan relevansi pencarian
      const filteredAndSortedData = masjidData
          .map((masjid) => {
              const name = masjid.name.toLowerCase();
              const search = searchTerm.toLowerCase();

              // Hitung skor relevansi
              let score = 0;
              if (name === search) score = 100; // Match sempurna
              else if (name.startsWith(search)) score = 75; // Match di awal
              else if (name.includes(search)) score = 50; // Match sebagian

              return { ...masjid, score };
          })
          .filter((masjid) => masjid.score > 0) // Filter yang relevan saja
          .sort((a, b) => b.score - a.score); // Sort berdasarkan skor

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

          // Highlight teks yang cocok dengan pencarian
          const highlightedName = searchTerm
              ? masjid.name.replace(
                  new RegExp(searchTerm, "gi"),
                  (match) => `<span class="highlight">${match}</span>`
              )
              : masjid.name;

          // Membuat lokasi masjid menjadi link ke Google Maps
          const mapLink = masjid.embed_link; // Ambil embed_link dari data masjid

          masjidItem.innerHTML = `
              <div class="masjid-content">
                  <h3>${highlightedName}</h3>
                  <p>
                      <a href="${mapLink}" target="_blank" rel="noopener noreferrer" style="color: inherit; text-decoration: none;">
                          <i class="fas fa-map-marker-alt"></i> ${masjid.address}
                      </a>
                  </p>
                  <p><i class="fas fa-info-circle"></i> ${
                      masjid.description || "Tidak ada deskripsi"
                  }</p>
              </div>
          `;

          // Tambahkan efek hover dengan animasi yang lebih smooth
          masjidItem.addEventListener("mouseover", () => {
              masjidItem.style.transform = "translateY(-5px)";
              masjidItem.style.boxShadow = "0 5px 15px rgba(0,0,0,0.3)";
              masjidItem.style.transition = "all 0.3s ease";
          });

          masjidItem.addEventListener("mouseout", () => {
              masjidItem.style.transform = "translateY(0)";
              masjidItem.style.boxShadow = "0 2px 5px rgba(0,0,0,0.1)";
          });

          masjidItem.addEventListener("click", (event) => {
              // Cegah event click pada item masjid untuk menimpa link lokasi
              if (event.target.tagName !== 'A' && event.target.parentNode.tagName !== 'A') {
                  showMasjidDetails(masjid);
              }
          });


          masjidList.appendChild(masjidItem);
      });
  }


  // Fungsi untuk update auth links dan profile picture
  function updateAuthLinks() {
      const logoutBtn = document.querySelector(".logout-btn");
      const loginBtn = document.querySelector(".login-btn");
      const profileBtn = document.querySelector(".profile-btn");
      const token = localStorage.getItem("jwtToken");
      if (token) {
          // User sudah login
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
          // User belum login
          if (logoutBtn) {
              logoutBtn.style.display = "none";
          }
          if (loginBtn) {
              loginBtn.style.display = "block";
              loginBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Sign in';
          }
          if (profileBtn) {
              profileBtn.style.display = "none";
          }
      }
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
              // Hapus semua data user dari localStorage
              localStorage.clear();
              // Update tampilan navbar
              updateAuthLinks();
              // Tampilkan pesan sukses
              Swal.fire({
                  title: "Berhasil Logout",
                  text: "Anda telah berhasil keluar",
                  icon: "success",
                  showConfirmButton: false,
                  timer: 1500,
                  timerProgressBar: true,
                  didClose: () => {
                      // Redirect ke halaman utama
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

  // Fungsi untuk mengambil dan menampilkan data profil
  async function fetchAndDisplayProfileData() {
      const token = localStorage.getItem("jwtToken");
      const userId = localStorage.getItem("userId");
      if (!token || !userId) {
          window.location.href = "../auth/login.html";
          return;
      }
      try {
          // Fetch user data
          const userResponse = await fetch(
              "https://backend-berkah.onrender.com/retreive/data/user",
              {
                  headers: {
                      Authorization: `Bearer ${token}`,
                  },
              }
          );
          if (!userResponse.ok) throw new Error("Gagal mengambil data user");
          const users = await userResponse.json();
          const currentUser = users.find((u) => u.id === parseInt(userId));
          // Fetch masjid data (only if needed for other profile info)
          const masjidResponse = await fetch(
              "https://backend-berkah.onrender.com/retreive/data/location"
          );
          if (!masjidResponse.ok) throw new Error("Gagal mengambil data masjid");
          const masjidData = await masjidResponse.json();
          if (window.location.pathname.includes("profile.html")) {
              // Update profile page dengan data terbaru
              document.getElementById("username").textContent =
                  currentUser.username || "-";
              document.getElementById("email").textContent = currentUser.email || "-";
              document.getElementById("bio").textContent =
                  currentUser.bio || "Belum diisi";
              // *** FIX:  Don't display preferred masjid as requested ***
              // document.getElementById("preferredMasjid").textContent = "Tidak ditampilkan"; // Or any other default message  // <---- LINE 342 (Commented out)
          } else if (window.location.pathname.includes("profile_edit.html")) {
              // Update edit profile page
              document.getElementById("username").value = currentUser.username || "";
              document.getElementById("email").value = currentUser.email || "";
              document.getElementById("bio").value = currentUser.bio || "";
              // Populate masjid dropdown (Commented out as per user request to not display preferredMasjid)
              // const masjidSelect = document.getElementById("preferredMasjid");
              // masjidSelect.innerHTML = '<option value="">Pilih Masjid</option>';
              // masjidData.forEach((masjid) => {
              //  const option = document.createElement("option");
              //  option.value = masjid.id;
              //  option.textContent = masjid.name;
              //  if (currentUser.preferred_masjid === masjid.id.toString()) {
              //   option.selected = true;
              //  }
              //  masjidSelect.appendChild(option);
              // });
          }
      } catch (error) {
          console.error("Error:", error);
          Swal.fire({
              icon: "error",
              title: "Error",
              text: "Gagal memuat data profil",
              confirmButtonColor: "#4CAF50",
          });
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
              // const preferredMasjid = document  // Commented out as preferredMasjid is not used now
              //  .getElementById("preferredMasjid")
              //  .value.trim();
              const bio = document.getElementById("bio")?.value.trim() || "";
              // Validasi dasar
              if (!username || !email) {
                  throw new Error("Mohon isi semua field yang wajib");
              }
              // Validasi email
              if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                  throw new Error("Format email tidak valid");
              }
              // Buat objek data untuk update sesuai model UpdatedProfile
              const updateData = {
                  user_id: parseInt(userId),
                  username,
                  email,
                  preferred_masjid: "", // Set preferred_masjid to empty string as it's not used now
                  bio,
                  full_name: "",
                  phone_number: "",
                  address: "",
              };
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
              // Redirect ke halaman profile setelah berhasil update
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
  // Event listeners untuk search bar dengan debounce yang lebih responsif
  if (searchBar && !window.location.pathname.includes("/profile/")) {
      let debounceTimer;
      searchBar.addEventListener("input", (e) => {
          // Tampilkan loading indicator
          const loadingSpinner = document.getElementById("loading-spinner");
          if (loadingSpinner) loadingSpinner.style.display = "block";
          clearTimeout(debounceTimer);
          debounceTimer = setTimeout(async () => {
              const searchTerm = e.target.value;
              await fetchMasjidData(searchTerm);
              // Sembunyikan loading indicator
              if (loadingSpinner) loadingSpinner.style.display = "none";
          }, 300); // Reduced debounce time for better responsiveness
      });
      // Tambahkan event listener untuk tombol search
      const searchButton = document.getElementById("search-button");
      if (searchButton) {
          searchButton.addEventListener("click", async () => {
              const searchTerm = searchBar.value;
              await fetchMasjidData(searchTerm);
          });
      }
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
      fetchAndDisplayProfileData(); // Panggil fungsi saat halaman dimuat di dalam blok ini
  } else {
      initialize().catch(console.error); // Panggil initialize jika bukan di halaman profile
  }
});