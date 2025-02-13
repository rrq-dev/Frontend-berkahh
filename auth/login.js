document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm");

  if (loginForm) {
    loginForm.addEventListener("submit", async (event) => {
      event.preventDefault();

      const email = document.getElementById("email-input").value; // Correct ID
      const password = document.getElementById("password-input").value; // Correct ID

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
            credentials: "include", // Tambahkan ini!
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          let errorMessage = "Login gagal. ";
          if (errorData.error) {
            errorMessage += errorData.error;
          } else if (errorData.message) {
            errorMessage += errorData.message;
          } else {
            errorMessage += `Status: ${response.status} - ${response.statusText}`;
          }
          throw new Error(errorMessage);
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
          icon: "error",
          title: "Login Gagal",
          text: error.message,
        });
      }
    });
  } else {
    console.error("Elemen loginForm tidak ditemukan!");
  }
});

function showLoading(message) {
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
