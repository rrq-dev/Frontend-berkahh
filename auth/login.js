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

  function hideLoading() {
    Swal.close();
  }

  // Fungsi decode JWT
  function decodeJwt(token) {
    try {
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map(function (c) {
            return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
          })
          .join("")
      );

      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error("Error decoding JWT:", error);
      return null;
    }
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

  // Tangani token dari URL setelah redirect dari Google atau login biasa
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get("token");

  if (token) {
    localStorage.setItem("jwtToken", token);

    const decodedToken = decodeJwt(token);
    let userRole = null;
    if (decodedToken) {
      userRole = decodedToken.role;
    } else {
      console.error("Token tidak valid atau tidak memiliki informasi role.");
      window.location.href = "/login.html"; // Redirect ke halaman login jika token tidak valid
      return;
    }

    const redirectUrl =
      userRole === "admin"
        ? "https://jumatberkah.vercel.app/admin/admin.html"
        : "https://jumatberkah.vercel.app/";

    window.location.href = redirectUrl;

    window.history.replaceState({}, document.title, window.location.pathname);

    // Permintaan ke backend setelah login (contoh)
    fetch("https://backend-berkah.onrender.com/api/protected", {
      // Ganti dengan endpoint Anda
      method: "GET",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("jwtToken")}`,
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Gagal mengambil data protected.");
        }
        return response.json();
      })
      .then((data) => {
        console.log("Data protected:", data);
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  }

  // Login Form
  if (loginForm) {
    loginForm.addEventListener("submit", async (event) => {
      event.preventDefault();

      const email = document.getElementById("email").value; // Pastikan ID ini benar
      const password = document.getElementById("password").value; // Pastikan ID ini benar

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
        console.error("Error during login:", error); // Tambahkan pesan error yang lebih spesifik
        hideLoading();
        Swal.fire({
          icon: "error",
          title: "Login Gagal",
          text: error.message,
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
    console.error("Elemen forgotPasswordLink tidak ditemukan!");
  }

  if (forgotForm) {
    forgotForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const email = document.getElementById("email-input").value;

      try {
        showLoading("Memproses...");
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

        hideLoading();
        Swal.fire({
          icon: "success",
          title: "Permintaan reset password berhasil dikirim.",
          text: "Silakan periksa email Anda untuk instruksi lebih lanjut.",
          confirmButtonText: "OK",
        }).then(() => {
          window.location.href = "login.html";
        });
      } catch (error) {
        console.error("Error during forgot password request:", error);
        hideLoading();
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
