document.addEventListener("DOMContentLoaded", () => {
  const signInForm = document.querySelector("#loginForm");
  const signUpForm = document.querySelector("#registerForm");
  const googleButtons = document.querySelectorAll(".google-btn");
  const submitButtons = document.querySelectorAll('button[type="submit"]');
  const backToLoginBtn = document.getElementById("backToLogin");

  // Handle error dari URL parameter
  const urlParams = new URLSearchParams(window.location.search);
  const error = urlParams.get("error");
  const errorDescription = urlParams.get("error_description");

  if (error) {
    console.error("Login error:", error, errorDescription); // Untuk debugging
    let errorMessage = "Kode otorisasi tidak ditemukan";

    switch (error) {
      case "no_code":
        errorMessage = "Kode otorisasi tidak ditemukan";
        break;
      case "invalid_state":
        errorMessage = "Sesi login tidak valid, silakan coba lagi";
        break;
      case "unauthorized":
        errorMessage = "Akses tidak diizinkan";
        break;
      default:
        errorMessage = errorDescription || "Terjadi kesalahan saat login";
    }

    // Tampilkan error dengan SweetAlert2
    Swal.fire({
      title: "Login Gagal",
      text: errorMessage,
      icon: "error",
      confirmButtonText: "OK",
      confirmButtonColor: "#2e7d32",
    }).then(() => {
      // Bersihkan URL dari parameter error
      const newUrl = window.location.pathname;
      window.history.replaceState({}, document.title, newUrl);
    });
  }

  // Check if user is logged in
  const token = localStorage.getItem("jwtToken");
  if (token) {
    redirectBasedOnRole(token);
  }

  async function login(email, password) {
    try {
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
        throw new Error(errorData.message || "Login failed");
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  }

  function redirectBasedOnRole(data) {
    localStorage.setItem("jwtToken", data.token);
    localStorage.setItem(
      "userData",
      JSON.stringify({
        name: data.name,
        email: data.email,
        role: data.role,
      })
    );

    if (data.role === "admin") {
      window.location.href = "https://jumatberkah.vercel.app/admin/admin.html";
    } else {
      window.location.href = "https://jumatberkah.vercel.app/";
    }
  }

  if (signInForm) {
    signInForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const submitBtn = signInForm.querySelector('button[type="submit"]');
      submitBtn.disabled = true;

      try {
        showLoading();
        const email = signInForm.querySelector('input[type="email"]').value;
        const password = signInForm.querySelector(
          'input[type="password"]'
        ).value;

        const data = await login(email, password);

        hideLoading();
        await Swal.fire({
          title: "Login Berhasil!",
          text: "Selamat datang kembali!",
          icon: "success",
          showConfirmButton: false,
          timer: 1500,
        });

        redirectBasedOnRole(data);
      } catch (error) {
        hideLoading();
        console.error("Login error:", error);
        Swal.fire({
          title: "Gagal Login",
          text: error.message || "Gagal masuk. Silakan coba lagi.",
          icon: "error",
        });
      } finally {
        submitBtn.disabled = false;
      }
    });
  }

  // Register function
  async function register(name, email, password) {
    try {
      const response = await fetch(
        "https://backend-berkah.onrender.com/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name,
            email,
            password,
            role: "user", // default role
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Registration failed");
      }

      const data = await response.json();
      return data;
    } catch (error) {
      throw error;
    }
  }

  // Register form submission
  if (signUpForm) {
    signUpForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const submitBtn = signUpForm.querySelector('button[type="submit"]');
      submitBtn.disabled = true;

      try {
        showLoading();
        const name = signUpForm.querySelector('input[type="text"]').value;
        const email = signUpForm.querySelector('input[type="email"]').value;
        const password = signUpForm.querySelector(
          'input[type="password"]'
        ).value;

        const data = await register(name, email, password);

        hideLoading();
        await Swal.fire({
          title: "Registrasi Berhasil!",
          text: "Akun Anda telah dibuat. Silakan login.",
          icon: "success",
          background: "#0a170f",
          color: "#e0f1e5",
          iconColor: "#a2d6b5",
          showConfirmButton: true,
          confirmButtonColor: "#a2d6b5",
        });

        window.location.href = "login.html";
      } catch (error) {
        hideLoading();
        console.error("Registration error:", error);
        Swal.fire({
          title: "Gagal Registrasi",
          text: error.message || "Gagal membuat akun. Silakan coba lagi.",
          icon: "error",
          background: "#0a170f",
          color: "#e0f1e5",
          confirmButtonColor: "#a2d6b5",
        });
      } finally {
        submitBtn.disabled = false;
      }
    });
  }

  // Handle Google authentication
  googleButtons.forEach((button) => {
    button.addEventListener("click", async () => {
      try {
        showLoading();
        // Redirect to Google auth endpoint
        window.location.href =
          "https://backend-berkah.onrender.com/auth/google/login";
      } catch (error) {
        hideLoading();
        console.error("Google auth error:", error);
        Swal.fire({
          title: "Error",
          text: "Failed to authenticate with Google. Please try again.",
          icon: "error",
          confirmButtonColor: "#a2d6b5",
        });
      }
    });
  });

  // Handle forgot password
  const forgotPasswordLink = document.getElementById("forgot-password-link");
  if (forgotPasswordLink) {
    forgotPasswordLink.addEventListener("click", (e) => {
      e.preventDefault();
      window.location.href = "reset-password/reset-password.html";
    });
  }

  // Handle reset password token jika ada
  const resetToken = urlParams.get("resetToken");
  if (resetToken) {
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

  // Toggle password visibility
  document.querySelectorAll(".toggle-password").forEach((toggle) => {
    toggle.addEventListener("click", function () {
      const passwordInput = this.previousElementSibling;
      const type =
        passwordInput.getAttribute("type") === "password" ? "text" : "password";
      passwordInput.setAttribute("type", type);
      this.classList.toggle("fa-eye");
      this.classList.toggle("fa-eye-slash");
    });
  });

  // Back to login button click event
  if (backToLoginBtn) {
    backToLoginBtn.addEventListener("click", () => {
      window.location.href = "login.html";
    });
  }

  // Helper function to parse JWT
  function parseJwt(token) {
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
      console.error("Error parsing JWT:", error);
      return {};
    }
  }
});

// Helper function untuk generate random string
function generateRandomString(length) {
  const possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let text = "";
  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

// Add these CSS keyframes to your CSS file
const style = document.createElement("style");
style.textContent = `
    @keyframes slideIn {
        0% {
            opacity: 0;
            transform: translateX(100%);
        }
        100% {
            opacity: 1;
            transform: translateX(0);
        }
    }

    @keyframes slideOut {
        0% {
            opacity: 1;
            transform: translateX(0);
        }
        100% {
            opacity: 0;
            transform: translateX(-100%);
        }
    }
`;
document.head.appendChild(style);

// Loading state functions
function showLoading() {
  Swal.fire({
    title: "Mohon tunggu...",
    html: "Sedang memproses permintaan Anda",
    allowOutsideClick: false,
    showConfirmButton: false,
    willOpen: () => {
      Swal.showLoading();
    },
    background: "#0a170f",
    color: "#e0f1e5",
  });
}

function hideLoading() {
  Swal.close();
}
