document.addEventListener("DOMContentLoaded", () => {
  const container = document.querySelector(".container");
  const signInForm = document.querySelector(".sign-in-form");
  const signUpForm = document.querySelector(".sign-up-form");
  const switchButtons = document.querySelectorAll(".switch-btn");
  const backBtn = document.getElementById("back-to-login");
  const googleButtons = document.querySelectorAll(".google-btn");
  const submitButtons = document.querySelectorAll('button[type="submit"]');

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

  // Reset forms function
  const resetForms = () => {
    if (signInForm) signInForm.reset();
    if (signUpForm) signUpForm.reset();
  };

  // Switch to login form with animation
  const switchToLogin = () => {
    container.classList.remove("active");
    resetForms();
  };

  // Switch form handlers
  switchButtons.forEach((button) => {
    button.addEventListener("click", (e) => {
      e.preventDefault();
      container.classList.toggle("active");
    });
  });

  // Back button handler
  if (backBtn) {
    backBtn.addEventListener("click", switchToLogin);
  }

  // Login function
  async function login(email, password) {
    try {
      const response = await fetch("http://localhost:8080/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Login failed");
      }

      const data = await response.json();
      return data;
    } catch (error) {
      throw error;
    }
  }

  // Register function
  async function register(name, email, password) {
    try {
      const response = await fetch("http://localhost:8080/register", {
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
      });

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

  // Update form submission handlers
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

        // Save token
        localStorage.setItem("jwtToken", data.token);

        hideLoading();
        await Swal.fire({
          title: "Success!",
          text: "Login successful",
          icon: "success",
          confirmButtonColor: "#a2d6b5",
        });

        // Redirect based on user role
        redirectBasedOnRole(data.token);
      } catch (error) {
        hideLoading();
        console.error("Login error:", error);
        Swal.fire({
          title: "Error",
          text: error.message || "Failed to login. Please try again.",
          icon: "error",
          confirmButtonColor: "#a2d6b5",
        });
      } finally {
        submitBtn.disabled = false;
      }
    });
  }

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

        await register(name, email, password);

        hideLoading();
        await Swal.fire({
          title: "Success!",
          text: "Account created successfully! Please login.",
          icon: "success",
          confirmButtonColor: "#a2d6b5",
        });

        // Switch to login form after successful registration
        switchToLogin();
      } catch (error) {
        hideLoading();
        console.error("Registration error:", error);
        Swal.fire({
          title: "Error",
          text: error.message || "Failed to create account. Please try again.",
          icon: "error",
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
  forgotPasswordLink.addEventListener("click", (e) => {
    e.preventDefault();
    window.location.href = "reset-password/reset-password.html";
  });

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

  // Helper function to redirect based on user role
  function redirectBasedOnRole(token) {
    try {
      const decoded = parseJwt(token);
      const redirectUrl =
        decoded.role === "admin"
          ? "https://jumatberkah.vercel.app/admin/admin.html"
          : "https://jumatberkah.vercel.app/";

      window.location.href = redirectUrl;
    } catch (error) {
      console.error("Error redirecting:", error);
      localStorage.removeItem("jwtToken");
    }
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
    title: "Please wait...",
    text: "Processing your request",
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
