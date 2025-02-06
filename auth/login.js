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

  // Handle login form submission
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

  // Handle registration form submission
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

      // Reset form dan redirect ke login
      signupForm.reset();
      document.getElementById("flip").checked = false;
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

  // Handle Forgot Password
  const forgotPasswordLink = document.getElementById("forgot-password-link");
  const resetPasswordForm = document.getElementById("resetPasswordForm");
  const resetPasswordModal = document.getElementById("resetPasswordModal");

  // Tampilkan modal reset password
  forgotPasswordLink.addEventListener("click", (e) => {
    e.preventDefault();
    resetPasswordModal.style.display = "block";
  });

  // Tutup modal ketika mengklik di luar modal
  window.addEventListener("click", (e) => {
    if (e.target === resetPasswordModal) {
      resetPasswordModal.style.display = "none";
    }
  });

  // Handle reset password form submission
  resetPasswordForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("reset-email-input").value;

    try {
      Swal.fire({
        title: "Memproses...",
        text: "Mengirim link reset password",
        allowOutsideClick: false,
        showConfirmButton: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      const response = await fetch(
        "https://backend-berkah.onrender.com/reset-password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Gagal mengirim reset password");
      }

      // Tutup modal
      resetPasswordModal.style.display = "none";

      // Tampilkan pesan sukses
      await Swal.fire({
        title: "Berhasil!",
        text: "Link reset password telah dikirim ke email Anda",
        icon: "success",
        confirmButtonText: "OK",
        confirmButtonColor: "#007bff",
      });

      // Reset form
      resetPasswordForm.reset();
    } catch (error) {
      console.error("Error during password reset:", error);
      Swal.fire({
        title: "Gagal",
        text: error.message || "Terjadi kesalahan saat reset password",
        icon: "error",
        confirmButtonText: "OK",
        confirmButtonColor: "#007bff",
      });
    }
  });

  // Handle token reset password dari URL
  const urlParams = new URLSearchParams(window.location.search);
  const resetToken = urlParams.get("token");

  if (resetToken) {
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
      preConfirm: () => {
        const newPassword = document.getElementById("new-password").value;
        const confirmPassword =
          document.getElementById("confirm-password").value;

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
            confirmButtonColor: "#007bff",
          });

          // Redirect ke halaman login
          window.location.href = "login.html";
        } catch (error) {
          console.error("Error updating password:", error);
          Swal.fire({
            title: "Gagal",
            text: error.message || "Gagal memperbarui password",
            icon: "error",
            confirmButtonText: "OK",
            confirmButtonColor: "#007bff",
          });
        }
      }
    });
  }
});
