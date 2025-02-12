document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm");
  const signupForm = document.getElementById("signupForm");
  const forgotPasswordLink = document.getElementById("forgot-password-link");

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
    forgotPasswordLink.addEventListener("click", async (event) => {
      event.preventDefault();

      Swal.fire({
        title: "Reset Password",
        input: "email",
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
