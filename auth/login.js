document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm");
  const signupForm = document.getElementById("signupForm");
  const googleLoginBtn = document.getElementById("google-login-btn");

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

  // Pastikan elemen sudah ada sebelum menambahkan event listener
  if (loginForm) {
    // Tambahkan pengecekan apakah elemen ditemukan
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
  const forgotPasswordLink = document.getElementById("forgot-password-link");
  if (forgotPasswordLink) {
    forgotPasswordLink.addEventListener("click", async (event) => {
      event.preventDefault();

      Swal.fire({
        title: "Reset Password",
        input: "email", // Input email langsung
        inputPlaceholder: "Masukkan email Anda yang terdaftar",
        showCancelButton: true,
        confirmButtonText: "Kirim",
        cancelButtonText: "Batal",
        showLoaderOnConfirm: true,
        preConfirm: async (selectedEmail) => {
          if (!selectedEmail) {
            Swal.showValidationMessage(`Email harus diisi`);
            return false;
          }

          try {
            showLoading("Memproses Permintaan...");

            const resetResponse = await fetch(
              "https://backend-berkah.onrender.com/forgotpassword",
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({ email: selectedEmail }),
              }
            );

            if (!resetResponse.ok) {
              const errorData = await resetResponse.json();
              throw new Error(
                errorData.error || "Gagal memproses permintaan reset password."
              );
            }

            hideLoading();
            return resetResponse.json();
          } catch (error) {
            Swal.showValidationMessage(`${error}`);
            hideLoading();
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
            confirmButtonText: "OK",
          });
        }
      });
    });
  } else {
    console.error("Elemen forgot-password-link tidak ditemukan!");
  }

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
        throw new Error(errorData.error || "Registrasi gagal");
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
});
