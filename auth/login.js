document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm");
  const signupForm = document.getElementById("signupForm");
  const googleLoginBtn = document.getElementById("google-login-btn");
  const resetForm = document.getElementById("resetForm"); // Ensure resetForm is defined

  // Fungsi untuk menampilkan loading overlay
  function showLoading(message = "Memproses...") {
    Swal.fire({
      title: message,
      allowOutsideClick: false,
      showConfirmButton: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });
  }

  // Fungsi untuk menutup loading overlay
  function hideLoading() {
    Swal.close();
  }

  // --- Bagian Login ---
  if (loginForm) {
    loginForm.addEventListener("submit", async (event) => {
      event.preventDefault();

      const email = document.getElementById("email-input").value;
      const password = document.getElementById("password-input").value;

      if (!email || !password) {
        Swal.fire({
          title: "Login Gagal",
          text: "Email dan password harus diisi.",
          icon: "error",
          confirmButtonText: "OK",
        });
        return;
      }

      try {
        showLoading("Memproses Login...");

        const response = await fetch(
          "https://backend-berkah.onrender.com/login",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ email, password }),
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          // Improved error handling for login:
          let errorMessage = "Login gagal. Periksa email dan password Anda.";
          if (errorData && errorData.message) {
            // Check if backend returns a more specific message
            errorMessage = errorData.message;
          }
          throw new Error(errorMessage);
        }

        const data = await response.json();

        localStorage.setItem("jwtToken", data.token);
        localStorage.setItem("userId", data.user.id);
        localStorage.setItem("userRole", data.user.role);

        hideLoading();

        Swal.fire({
          title: "Login Berhasil!",
          text: "Selamat datang kembali!",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
          timerProgressBar: true,
        }).then(() => {
          const redirectUrl =
            data.user.role === "admin"
              ? "https://jumatberkah.vercel.app/admin/admin.html"
              : "https://jumatberkah.vercel.app/";
          window.location.href = redirectUrl;
        });
      } catch (error) {
        console.error("Error during login:", error);
        hideLoading();
        Swal.fire({
          title: "Login Gagal",
          text: error.message,
          icon: "error",
          confirmButtonText: "OK",
        });
      }
    });
  } else {
    console.error("Elemen loginForm tidak ditemukan!");
  }

  // --- Bagian Lupa Password (Reset Password Request) ---
  const forgotPasswordLink = document.getElementById("forgot-password-link");
  if (forgotPasswordLink) {
    forgotPasswordLink.addEventListener("click", async (event) => {
      event.preventDefault(); // Mencegah navigasi default link

      Swal.fire({
        title: "Reset Password",
        input: "email",
        inputLabel: "Masukkan email Anda",
        inputPlaceholder: "contoh@email.com",
        showCancelButton: true,
        confirmButtonText: "Kirim",
        cancelButtonText: "Batal",
        showLoaderOnConfirm: true, // Tampilkan loading saat konfirmasi
        preConfirm: async (email) => {
          if (!email) {
            Swal.showValidationMessage(`Email harus diisi`);
            return false;
          }
          try {
            const response = await fetch(
              "https://backend-berkah.onrender.com/reset-password",
              {
                // Ganti dengan endpoint Anda
                method: "POST",
                headers: {
                  "Content-Type": "application/json", // Ubah Content-Type
                },
                body: "email=" + email, // Format body request yang benar (x-www-form-urlencoded)
              }
            );

            if (!response.ok) {
              const errorData = await response.json(); // Improved error handling for reset password request:
              let errorMessage = "Gagal mengirim permintaan reset password.";
              if (errorData && errorData.message) {
                errorMessage = errorData.message; // Use backend message if available
              }
              throw new Error(errorMessage);
            }

            return response.json(); // Mengembalikan data respon jika sukses
          } catch (error) {
            Swal.showValidationMessage(`${error}`);
            return false;
          }
        },
        allowOutsideClick: () => !Swal.isLoading(),
      }).then((result) => {
        if (result.isConfirmed) {
          Swal.fire({
            icon: "success",
            title: "Permintaan reset password berhasil dikirim.",
            text: "Silakan periksa email Anda untuk instruksi lebih lanjut.",
          });
        }
      });
    });
  } else {
    console.error("Elemen forgot-password-link tidak ditemukan!");
  }

  // --- Bagian Reset Password Form Submission ---
  if (resetForm) {
    resetForm.addEventListener("submit", async (event) => {
      event.preventDefault();

      const newPassword = document.getElementById("new-password").value;
      const confirmPassword = document.getElementById("confirm-password").value;

      if (!newPassword || !confirmPassword) {
        Swal.fire({
          title: "Gagal Reset Password",
          text: "Password baru dan konfirmasi password harus diisi.",
          icon: "error",
          confirmButtonText: "OK",
        });
        return;
      }

      if (newPassword !== confirmPassword) {
        Swal.fire({
          title: "Gagal Reset Password",
          text: "Password baru dan konfirmasi password tidak sama.",
          icon: "error",
          confirmButtonText: "OK",
        });
        return;
      }

      // Ambil token dari URL (asumsi token ada di query parameter 'token')
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get("token");

      if (!token) {
        Swal.fire({
          title: "Gagal Reset Password",
          text: "Token reset password tidak valid.",
          icon: "error",
          confirmButtonText: "OK",
        });
        return;
      }

      try {
        showLoading("Mengatur Password Baru...");

        const response = await fetch(
          "https://backend-berkah.onrender.com/new-password", // Endpoint new-password Anda
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              token: token, // Kirim token
              password: newPassword, // Kirim password baru (gunakan 'password' bukan 'newPassword' untuk konsistensi endpoint)
            }),
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          // Improved error handling for new password submission:
          let errorMessage = "Gagal mengatur password baru.";
          if (errorData && errorData.message) {
            errorMessage = errorData.message; // Use backend message if available
          }
          throw new Error(errorMessage);
        }

        hideLoading();

        Swal.fire({
          title: "Password Berhasil Diperbarui!",
          text: "Password baru Anda telah berhasil diatur. Silakan login dengan password baru Anda.",
          icon: "success",
          confirmButtonText: "OK",
        }).then(() => {
          window.location.href = "login.html"; // Redirect ke halaman login setelah berhasil
        });
      } catch (error) {
        console.error("Error saat mengatur password baru:", error);
        hideLoading();
        Swal.fire({
          title: "Gagal Reset Password",
          text: error.message,
          icon: "error",
          confirmButtonText: "OK",
        });
      }
    });
  } else {
    console.error("Elemen resetForm tidak ditemukan!"); // Consider adding resetForm definition at the beginning if not already defined in HTML
  }

  // --- Bagian Google OAuth Callback (sama seperti sebelumnya) ---
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get("token");
  const error = urlParams.get("error");

  if (error) {
    Swal.fire({
      title: "Login Gagal",
      text: decodeURIComponent(error),
      icon: "error",
      confirmButtonText: "OK",
    });
  } else if (token) {
    showLoading("Memproses login..."); // Tampilkan loading saat callback Google

    try {
      const tokenParts = token.split(".");
      const payload = JSON.parse(atob(tokenParts[1]));

      localStorage.setItem("jwtToken", token);
      localStorage.setItem("userId", payload.user_id);
      localStorage.setItem("userRole", payload.role);

      hideLoading(); // Tutup loading setelah token diproses

      Swal.fire({
        title: "Login Berhasil!",
        text: "Selamat datang kembali!",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
        timerProgressBar: true,
      }).then(() => {
        const redirectUrl =
          payload.role === "admin"
            ? "https://jumatberkah.vercel.app/admin/admin.html"
            : "https://jumatberkah.vercel.app/";

        window.location.href = redirectUrl;
      });
    } catch (error) {
      console.error("Error processing token:", error);
      hideLoading(); // Pastikan loading ditutup jika error
      Swal.fire({
        title: "Login Gagal",
        text: "Error memproses informasi login",
        icon: "error",
        confirmButtonText: "OK",
      });
    }
  }

  // --- Bagian Registrasi (sama seperti sebelumnya) ---
  if (signupForm) {
    signupForm.addEventListener("submit", async (event) => {
      event.preventDefault();

      const username = document.getElementById("name-input").value;
      const email = document.getElementById("signup-email-input").value;
      const password = document.getElementById("signup-password-input").value;

      if (!username || !email || !password) {
        Swal.fire({
          title: "Registrasi Gagal",
          text: "Semua field harus diisi.",
          icon: "error",
          confirmButtonText: "OK",
        });
        return;
      }

      // Validasi password minimal 6 karakter
      if (password.length < 6) {
        Swal.fire({
          title: "Registrasi Gagal",
          text: "Password minimal 6 karakter",
          icon: "error",
          confirmButtonText: "OK",
        });
        return;
      }

      try {
        showLoading("Memproses registrasi...");

        const response = await fetch(
          "https://backend-berkah.onrender.com/register",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ username, email, password }),
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          // Improved error handling for registration:
          let errorMessage = "Registrasi gagal";
          if (errorData && errorData.message) {
            errorMessage = errorData.message; // Use backend message if available
          }
          throw new Error(errorMessage);
        }

        hideLoading(); // Tutup loading sebelum notifikasi sukses

        await Swal.fire({
          title: "Registrasi Berhasil!",
          text: "Silakan login dengan akun baru Anda",
          icon: "success",
          timer: 2000,
          showConfirmButton: false,
          timerProgressBar: true,
        });

        // Redirect ke halaman login setelah notifikasi
        window.location.href = "login.html";
      } catch (error) {
        console.error("Error during registration:", error);
        hideLoading(); // Pastikan loading ditutup jika error
        Swal.fire({
          title: "Registrasi Gagal",
          text: error.message || "Terjadi kesalahan saat registrasi",
          icon: "error",
          confirmButtonText: "OK",
        });
      }
    });
  }
});
