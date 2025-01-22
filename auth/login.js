// Fungsi untuk menangani pengiriman form login
document
  .getElementById("loginForm")
  .addEventListener("submit", async (event) => {
    event.preventDefault(); // Mencegah pengiriman form default

    const email = document.getElementById("email-input").value;
    const password = document.getElementById("password-input").value;

    try {
      const response = await fetch(
        "https://backend-berkah.onrender.com/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }), // Mengirimkan email dan password
        }
      );

      if (!response.ok) {
        const errorMessage = await response.text();
        throw new Error(`Login failed: ${errorMessage}`);
      }

      const data = await response.json();
      const token = data.token; // Asumsikan token ada di dalam response

      // Simpan token ke local storage
      localStorage.setItem("jwtToken", token);

      // Redirect ke halaman utama setelah login berhasil
      window.location.href = "https://rrq-dev.github.io/jumatberkah.github.io/"; // Ganti dengan URL halaman utama Anda
    } catch (error) {
      console.error("Error during login:", error);
      alert("Login failed: " + error.message);
    }
  });

// Fungsi untuk mengambil data masjid setelah login
async function fetchMasjidData() {
  const token = localStorage.getItem("jwtToken");
  if (!token) {
    window.location.href = "auth/login.html"; // Redirect ke halaman login jika token tidak ada
    return;
  }

  try {
    const response = await fetch(
      "https://backend-berkah.onrender.com/getlocationbyid",
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`, // Menambahkan token ke header
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      const errorMessage = await response.text();
      throw new Error(`Error fetching masjid data: ${errorMessage}`);
    }

    const masjidData = await response.json();
    displayMasjidList(masjidData); // Panggil fungsi untuk menampilkan data masjid
  } catch (error) {
    console.error("Error fetching masjid data:", error);
    document.getElementById("error-message").innerText =
      "Error loading masjid data.";
    document.getElementById("error-message").style.display = "block";
  }
}

// Fungsi untuk menampilkan daftar masjid
function displayMasjidList(masjidData) {
  const masjidList = document.getElementById("masjid-list");
  masjidList.innerHTML = ""; // Kosongkan daftar sebelum menambahkan yang baru

  masjidData.forEach((masjid) => {
    const masjidItem = document.createElement("div");
    masjidItem.className = "masjid-item";
    masjidItem.innerHTML = `  
          <h3>${masjid.name}</h3>  
          <p>${masjid.address}</p>  
          <p>${masjid.description}</p>  
      `;
    masjidList.appendChild(masjidItem);
  });
}

// Panggil fetchMasjidData saat halaman dimuat
document.addEventListener("DOMContentLoaded", fetchMasjidData);
