document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm");
  const signupForm = document.getElementById("signupForm");
  const googleLoginBtn = document.getElementById("google-login-btn");
  const forgotPasswordLink = document.getElementById("forgot-password-link");

  // Handle token dari URL (untuk Google OAuth dan reset password)
  const params = new URLSearchParams(window.location.search);
  const token = params.get("token");
  const resetToken = params.get("resetToken");

  if (token) {
    // Simpan token
    localStorage.setItem("jwtToken", token);

    // Tampilkan loading
    Swal.fire({
      title: "Memproses Login...",
      text: "Mohon tunggu sebentar",
      allowOutsideClick: false,
      showConfirmButton: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    // Verifikasi token dengan backend
    fetch("https://backend-berkah.onrender.com/test-auth", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        // Simpan data user
        if (data.user_id) localStorage.setItem("userId", data.user_id);
        if (data.role) localStorage.setItem("userRole", data.role);

        // Tampilkan pesan sukses
        Swal.fire({
          title: "Login Berhasil!",
          text: "Selamat datang kembali!",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
          timerProgressBar: true,
        }).then(() => {
          // Redirect berdasarkan role
          const redirectUrl =
            data.role === "admin"
              ? "https://jumatberkah.vercel.app/admin/admin.html"
              : "https://jumatberkah.vercel.app/";
          window.location.href = redirectUrl;
        });
      })
      .catch((error) => {
        console.error("Error verifying token:", error);
        localStorage.clear();
        Swal.fire({
          title: "Login Gagal",
          text: "Terjadi kesalahan saat verifikasi",
          icon: "error",
          confirmButtonText: "OK",
          confirmButtonColor: "#2e7d32",
        }).then(() => {
          window.location.href = "login.html";
        });
      });
  } else if (resetToken) {
    // Handle reset password
    Swal.fire({
      title: "Update Password Baru",
      html: `
        <input type="password" id="new-password" class="swal2-input" placeholder="Password baru">
        <input type="password" id="confirm-password" class="swal2-input" placeholder="Konfirmasi password">
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: "Update Password",
      cancelButtonText: "Batal",
      confirmButtonColor: "#2e7d32",
      cancelButtonColor: "#dc3545",
      preConfirm: () => {
        const newPassword = document.getElementById("new-password").value;
        const confirmPassword =
          document.getElementById("confirm-password").value;

        if (!newPassword || !confirmPassword) {
          Swal.showValidationMessage("Semua field harus diisi");
          return false;
        }

        if (newPassword.length < 6) {
          Swal.showValidationMessage("Password minimal 6 karakter");
          return false;
        }

        if (newPassword !== confirmPassword) {
          Swal.showValidationMessage("Password tidak cocok");
          return false;
        }

        return { newPassword };
      },
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await fetch(
            "https://backend-berkah.onrender.com/update-password",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                token: resetToken,
                new_password: result.value.newPassword,
              }),
            }
          );

          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.error || "Gagal update password");
          }

          await Swal.fire({
            title: "Berhasil!",
            text: "Password berhasil diperbarui",
            icon: "success",
            confirmButtonText: "OK",
            confirmButtonColor: "#2e7d32",
          });

          window.location.href = "login.html";
        } catch (error) {
          console.error("Error updating password:", error);
          Swal.fire({
            title: "Gagal",
            text: error.message || "Gagal memperbarui password",
            icon: "error",
            confirmButtonText: "OK",
            confirmButtonColor: "#2e7d32",
          });
        }
      }
    });
  }

  // Handle login dengan Google
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

    // Redirect ke endpoint Google OAuth
    setTimeout(() => {
      window.location.href =
        "https://backend-berkah.onrender.com/auth/google/login";
    }, 800);
  });

  // Handle login form biasa
  loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email-input").value.trim();
    const password = document.getElementById("password-input").value;

    if (!email || !password) {
      Swal.fire({
        title: "Login Gagal",
        text: "Email dan password harus diisi.",
        icon: "error",
        confirmButtonText: "OK",
        confirmButtonColor: "#2e7d32",
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
        confirmButtonColor: "#2e7d32",
      });
    }
  });

  // Handle forgot password
  forgotPasswordLink.addEventListener("click", (e) => {
    e.preventDefault();
    window.location.href = "reset-password/reset-password.html";
  });
});
