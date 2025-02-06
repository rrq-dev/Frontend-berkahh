document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm");
  const signupForm = document.getElementById("signupForm");
  const googleLoginBtn = document.getElementById("google-login-btn");

  // Menangani login dengan Google
  googleLoginBtn.addEventListener("click", () => {
    Swal.fire({
      title: "Menghubungkan ke Google...",
      html: "Mohon tunggu sebentar",
      allowOutsideClick: false,
      showConfirmButton: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    setTimeout(() => {
      window.location.href =
        "https://backend-berkah.onrender.com/auth/google/login";
    }, 800);
  });

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
        confirmButtonColor: "#007bff",
      });
      return;
    }

    try {
      Swal.fire({
        title: "Memproses...",
        allowOutsideClick: false,
        showConfirmButton: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      const response = await fetch(
        "https://backend-berkah.onrender.com/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email,
            password: password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Username atau password salah");
      }

      // Simpan data ke localStorage
      localStorage.setItem("jwtToken", data.token);
      localStorage.setItem("userId", data.user.id);
      localStorage.setItem("userRole", data.user.role);

      await Swal.fire({
        title: "Login Berhasil!",
        text: "Selamat datang kembali!",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
        timerProgressBar: true,
      });

      // Redirect berdasarkan role
      const redirectUrl =
        data.user.role === "admin"
          ? "https://jumatberkah.vercel.app/admin/admin.html"
          : "https://jumatberkah.vercel.app/";

      window.location.href = redirectUrl;
    } catch (error) {
      console.error("Error during login:", error);
      Swal.fire({
        title: "Login Gagal",
        text: error.message,
        icon: "error",
        confirmButtonText: "OK",
        confirmButtonColor: "#007bff",
      });
    }
  });

  // Handle Google OAuth Callback
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get("token");
  const error = urlParams.get("error");

  if (error) {
    Swal.fire({
      title: "Login Gagal",
      text: decodeURIComponent(error),
      icon: "error",
      confirmButtonText: "OK",
      confirmButtonColor: "#007bff",
    });
  } else if (token) {
    Swal.fire({
      title: "Memproses login...",
      html: "Mohon tunggu sebentar",
      allowOutsideClick: false,
      showConfirmButton: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    try {
      const tokenParts = token.split(".");
      const payload = JSON.parse(atob(tokenParts[1]));

      localStorage.setItem("jwtToken", token);
      localStorage.setItem("userId", payload.user_id);
      localStorage.setItem("userRole", payload.role);

      setTimeout(() => {
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
      }, 800);
    } catch (error) {
      console.error("Error processing token:", error);
      Swal.fire({
        title: "Login Gagal",
        text: "Error memproses informasi login",
        icon: "error",
        confirmButtonText: "OK",
        confirmButtonColor: "#007bff",
      });
    }
  }

  // Registration functionality
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
        confirmButtonColor: "#007bff",
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
        confirmButtonColor: "#007bff",
      });
      return;
    }

    try {
      Swal.fire({
        title: "Memproses registrasi...",
        html: "Mohon tunggu sebentar",
        allowOutsideClick: false,
        showConfirmButton: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      const response = await fetch(
        "https://backend-berkah.onrender.com/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: username,
            email: email,
            password: password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Registrasi gagal");
      }

      await Swal.fire({
        title: "Registrasi Berhasil!",
        text: "Silakan login dengan akun baru Anda",
        icon: "success",
        timer: 2000,
        showConfirmButton: false,
        timerProgressBar: true,
      });

      // Redirect ke halaman login
      window.location.href = "login.html";
    } catch (error) {
      console.error("Error during registration:", error);
      Swal.fire({
        title: "Registrasi Gagal",
        text: error.message || "Terjadi kesalahan saat registrasi",
        icon: "error",
        confirmButtonText: "OK",
        confirmButtonColor: "#007bff",
      });
    }
  });
});
