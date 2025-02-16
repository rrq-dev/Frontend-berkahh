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

  // --- FITUR PENGINGAT WAKTU SHOLAT ---
  function getWaktuSholat(kodeKota, tanggal) {
    const apiUrl = `https://api.myquran.com/v2/sholat/jadwal/${kodeKota}/${tanggal}`; // Contoh endpoint, sesuaikan dengan API

    fetch(apiUrl)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        if (data.status === "OK") {
          tampilkanWaktuSholat(data.data.jadwal); // Asumsi struktur data, sesuaikan
        } else {
          console.error("Gagal mengambil data waktu sholat:", data);
          // Optionally handle error display on UI if needed, but not with Swal.fire here as it might interrupt initial page load
        }
      })
      .catch((error) => {
        console.error("Error saat mengambil data waktu sholat:", error);
        // Optionally handle error display on UI, but not with Swal.fire here
      });
  }

  function tampilkanWaktuSholat(jadwalSholat) {
    document.getElementById(
      "waktu-subuh"
    ).textContent = `Subuh: ${jadwalSholat.Subuh}`; // Sesuaikan nama field Subuh
    document.getElementById(
      "waktu-dzuhur"
    ).textContent = `Dzuhur: ${jadwalSholat.Dzuhur}`; // Sesuaikan nama field Dzuhur
    document.getElementById(
      "waktu-ashar"
    ).textContent = `Ashar: ${jadwalSholat.Ashar}`; // Sesuaikan nama field Ashar
    document.getElementById(
      "waktu-maghrib"
    ).textContent = `Maghrib: ${jadwalSholat.Maghrib}`; // Sesuaikan nama field Maghrib
    document.getElementById(
      "waktu-isya"
    ).textContent = `Isya: ${jadwalSholat.Isya}`; // Sesuaikan nama field Isya

    alertPengingatSholat(jadwalSholat);
  }

  function alertPengingatSholat(jadwalSholat) {
    const sekarang = new Date(); // Waktu sekarang
    const namaWaktuSholat = ["Subuh", "Dzuhur", "Ashar", "Maghrib", "Isya"];
    const waktuSholatArray = [
      jadwalSholat.Subuh,
      jadwalSholat.Dzuhur,
      jadwalSholat.Ashar,
      jadwalSholat.Maghrib,
      jadwalSholat.Isya,
    ]; // Sesuaikan nama field

    for (let i = 0; i < namaWaktuSholat.length; i++) {
      const waktuSholatString = waktuSholatArray[i];
      if (!waktuSholatString || waktuSholatString === "-") continue; // Skip if time is not available or '-'

      const [jam, menit] = waktuSholatString.split(":");
      const waktuSholat = new Date();
      waktuSholat.setHours(parseInt(jam));
      waktuSholat.setMinutes(parseInt(menit));
      waktuSholat.setSeconds(0);
      waktuSholat.setMilliseconds(0); // Ensure milliseconds are also 0 for accurate comparison

      // Jika waktu sholat hari ini sudah lewat, atur untuk besok (opsional)
      if (waktuSholat < sekarang) {
        waktuSholat.setDate(sekarang.getDate() + 1); // Atur ke besok
      }

      const selisihWaktu = waktuSholat - sekarang;

      if (selisihWaktu > 0) {
        // Only set timeout for future prayer times
        setTimeout(() => {
          Swal.fire({
            title: `Waktunya Sholat ${namaWaktuSholat[i]}!`,
            text: `Mari tunaikan ibadah sholat ${namaWaktuSholat[i]}.`,
            icon: "info", // You can change icon: 'success', 'warning', 'error', 'info'
            timer: 15000, // Alert will close after 15 seconds (optional)
            timerProgressBar: true, // Show progress bar during timer (optional)
            showConfirmButton: false, // Hide confirm button (optional, for auto-closing alerts)
          });
        }, selisihWaktu);
      }
    }
  }

  // // Menangani login dengan Google
  // googleLoginBtn.addEventListener("click", () => {
  //   showLoading("Menghubungkan ke Google...");
  //   setTimeout(() => {
  //     window.location.href =
  //       "https://backend-berkah.onrender.com/auth/google/login";
  //   }, 800); // Anda bisa hilangkan setTimeout ini jika tidak diperlukan
  // });

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
  // handle reset form
  const forgotPasswordLink = document.getElementById("forgot-password-link");
  if (forgotPasswordLink) {
    forgotPasswordLink.addEventListener("click", (event) => {
      event.preventDefault(); // Mencegah navigasi default link

      Swal.fire({
        title: "Reset Password",
        input: "email",
        inputLabel: "Masukkan email Anda",
        inputPlaceholder: "contoh@email.com",
        showCancelButton: true,
        confirmButtonText: "Kirim",
        cancelButtonText: "Batal",
        showLoaderOnConfirm: true, // Tampilkan loading saat konfirmasi
        preConfirm: async (email) => {
          if (!email) {
            Swal.showValidationMessage(`Email harus diisi`);
            return false;
          }
          try {
            const response = await fetch(
              "https://backend-berkah.onrender.com/reset-password",
              {
                // Ganti dengan endpoint Anda
                method: "POST",
                headers: {
                  "Content-Type": "application/json", // Important
                },
                body: "email=" + email, // Format body request yang benar
              }
            );

            if (!response.ok) {
              const errorData = await response.json();
              throw new Error(
                errorData.error || "Gagal mengirim permintaan reset password."
              );
            }

            return response.json(); // Mengembalikan data respon jika sukses
          } catch (error) {
            Swal.showValidationMessage(`${error}`);
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
