document.addEventListener("DOMContentLoaded", () => {
  const container = document.querySelector(".container");
  const signInForm = document.querySelector(".sign-in-form");
  const signUpForm = document.querySelector(".sign-up-form");
  const switchButtons = document.querySelectorAll(".switch-btn");
  const backBtn = document.getElementById("back-to-login");
  const googleButtons = document.querySelectorAll(".google-btn");

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

  // Reset forms function
  const resetForms = () => {
    if (signInForm) signInForm.reset();
    if (signUpForm) signUpForm.reset();
  };

  // Switch between sign in and sign up forms
  switchButtons.forEach((button) => {
    button.addEventListener("click", (e) => {
      e.preventDefault();
      container.classList.add("active");
      resetForms();
    });
  });

  // Back button handler
  if (backBtn) {
    backBtn.addEventListener("click", () => {
      container.classList.remove("active");
      resetForms();
    });
  }

  // Handle form submissions
  if (signInForm) {
    signInForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      try {
        showLoading();
        const email = signInForm.querySelector("input[type='email']").value;
        const password = signInForm.querySelector(
          "input[type='password']"
        ).value;

        // Add your sign in logic here
        console.log("Sign in:", { email, password });

        await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API call

        hideLoading();
        Swal.fire({
          title: "Success!",
          text: "Sign in successful",
          icon: "success",
          confirmButtonColor: "#a2d6b5",
        });
      } catch (error) {
        hideLoading();
        console.error("Sign in error:", error);
        Swal.fire({
          title: "Error",
          text: "Failed to sign in. Please try again.",
          icon: "error",
          confirmButtonColor: "#a2d6b5",
        });
      }
    });
  }

  if (signUpForm) {
    signUpForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      try {
        showLoading();
        const name = signUpForm.querySelector("input[type='text']").value;
        const email = signUpForm.querySelector("input[type='email']").value;
        const password = signUpForm.querySelector(
          "input[type='password']"
        ).value;

        // Add your sign up logic here
        console.log("Sign up:", { name, email, password });

        await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API call

        hideLoading();
        Swal.fire({
          title: "Success!",
          text: "Account created successfully",
          icon: "success",
          confirmButtonColor: "#a2d6b5",
        });
      } catch (error) {
        hideLoading();
        console.error("Sign up error:", error);
        Swal.fire({
          title: "Error",
          text: "Failed to create account. Please try again.",
          icon: "error",
          confirmButtonColor: "#a2d6b5",
        });
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

  // Handle successful login (callback dari Auth0)
  const token = urlParams.get("token");
  if (token) {
    // Simpan token
    localStorage.setItem("jwtToken", token);

    // Redirect ke halaman yang sesuai
    const userRole = parseJwt(token).role;
    const redirectUrl =
      userRole === "admin"
        ? "https://jumatberkah.vercel.app/admin/admin.html"
        : "https://jumatberkah.vercel.app/";

    window.location.href = redirectUrl;
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

// Helper function untuk parse JWT
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
