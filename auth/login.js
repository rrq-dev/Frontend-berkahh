document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm");
  const signupForm = document.getElementById("signupForm");
  const forgotForm = document.getElementById("forgotForm");
  // Fungsi loading
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

  // Google Login
  const googleLoginButton = document.getElementById("googleLoginButton");

  if (googleLoginButton) {
    googleLoginButton.addEventListener("click", () => {
      window.location.href =
        "https://backend-berkah.onrender.com/auth/google/login";
    });
  } else {
    console.error("Tombol Google Login tidak ditemukan!");
  }

  // Handle Redirect and Token from URL
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get("token");

  if (token) {
    localStorage.setItem("jwtToken", token); // Simpan token di localStorage
    // Redirect atau lakukan tindakan lain setelah login Google berhasil
    const userRole = localStorage.getItem("userRole"); // Ambil role dari localStorage (setelah login biasa)
    const redirectUrl =
      userRole === "admin"
        ? "https://jumatberkah.vercel.app/admin/admin.html" // Redirect admin
        : "https://jumatberkah.vercel.app/"; // Redirect user biasa
    window.location.href = redirectUrl;

    // Bersihkan parameter token dari URL setelah disimpan
    window.history.replaceState({}, document.title, window.location.pathname);
  }

  function hideLoading() {
    Swal.close();
  }

  // Login
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
          throw new Error(
            errorData.error || "Login gagal. Periksa email dan password Anda."
          );
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

  // Lupa Password
  if (forgotPasswordLink) {
    forgotPasswordLink.addEventListener("click", (event) => {
      event.preventDefault();
      window.location.href = "reset_form.html";
    });
  } else {
    console.error("Elemen forgot-password-link tidak ditemukan!");
  }

  // Forgot Password Form Submit (disatukan di sini)
  if (forgotForm) {
    forgotForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const email = document.getElementById("email-input").value;

      try {
        const response = await fetch(
          "https://backend-berkah.onrender.com/forgotpassword",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ email }),
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.error || "Gagal memproses permintaan reset password."
          );
        }

        Swal.fire({
          icon: "success",
          title: "Permintaan reset password berhasil dikirim.",
          text: "Silakan periksa email Anda untuk instruksi lebih lanjut.",
          confirmButtonText: "OK",
        }).then(() => {
          window.location.href = "login.html"; // Redirect ke halaman login setelah sukses
        });
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Gagal",
          text: error.message,
        });
      }
    });
  } else {
    console.error("Elemen forgotForm tidak ditemukan!");
  }

  // Registrasi
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
          throw new Error(errorData.error || "Registrasi gagal");
        }

        hideLoading();

        await Swal.fire({
          title: "Registrasi Berhasil!",
          text: "Silakan login dengan akun baru Anda",
          icon: "success",
          timer: 2000,
          showConfirmButton: false,
          timerProgressBar: true,
        });

        window.location.href = "login.html";
      } catch (error) {
        console.error("Error during registration:", error);
        hideLoading();
        Swal.fire({
          title: "Registrasi Gagal",
          text: error.message || "Terjadi kesalahan saat registrasi",
          icon: "error",
          confirmButtonText: "OK",
        });
      }
    });
  } else {
    console.error("Elemen signupForm tidak ditemukan!");
  }
});
