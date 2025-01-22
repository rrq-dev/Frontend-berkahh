// Fungsi untuk mengambil data masjid dari backend
async function fetchMasjidData() {
  try {
    const token = localStorage.getItem("jwtToken"); // Ambil token dari local storage
    const response = await fetch(
      "https://backend-berkah.onrender.com/getlocation",
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`, // Sertakan token di header
          "Content-Type": "application/json",
        },
      }
    );

    // Cek apakah respons berhasil
    if (!response.ok) {
      const errorMessage = await response.text(); // Ambil pesan error dari respons
      throw new Error(`Error: ${response.status} - ${errorMessage}`);
    }

    const masjidData = await response.json(); // Parse JSON dari respons
    displayMasjidCards(masjidData); // Tampilkan data masjid
  } catch (error) {
    console.error("Error fetching masjid data:", error);
    document.getElementById("error-message").innerText =
      "Error loading masjid list: " + error.message;
    document.getElementById("error-message").style.display = "block"; // Tampilkan pesan error
  }
}

// Fungsi untuk menampilkan kartu masjid
function displayMasjidCards(masjidData) {
  const masjidContainer = document.getElementById("masjid-container");
  masjidContainer.innerHTML = ""; // Kosongkan kontainer sebelum menambahkan kartu baru

  masjidData.forEach((masjid) => {
    const card = document.createElement("div");
    card.className = "masjid-card";
    card.innerHTML = `  
          <h3>${masjid.name}</h3>  
          <p>${masjid.location}</p>  
          <p>${masjid.description}</p>  
      `;

    // Jika pengguna sudah login, tambahkan tombol feedback
    if (localStorage.getItem("jwtToken")) {
      const feedbackButton = document.createElement("button");
      feedbackButton.innerText = "Give Feedback";
      feedbackButton.onclick = () => giveFeedback(masjid.id);
      card.appendChild(feedbackButton);
    }

    masjidContainer.appendChild(card);
  });
}

// Fungsi untuk memberikan feedback
async function giveFeedback(masjidId) {
  const feedback = prompt("Please provide your feedback:");
  if (feedback) {
    try {
      const token = localStorage.getItem("jwtToken");
      const response = await fetch(
        `https://backend-berkah.onrender.com/masjid/${masjidId}/feedback`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ feedback }),
        }
      );

      if (response.ok) {
        alert("Feedback submitted successfully!");
      } else {
        alert("Failed to submit feedback.");
      }
    } catch (error) {
      console.error("Error submitting feedback:", error);
      alert("An error occurred while submitting feedback.");
    }
  }
}

// Fungsi untuk logout
function logout() {
  // Hapus token dari local storage
  localStorage.removeItem("jwtToken");
  localStorage.removeItem("userId");
  localStorage.removeItem("userRole");
  alert("Logout successful!");

  // Redirect ke halaman utama
  window.location.href = "index.html"; // Ganti dengan URL halaman utama Anda
}

// Menangani tampilan tombol logout jika pengguna sudah login
function updateAuthLinks() {
  const logoutBtn = document.getElementById("logout-btn");
  if (localStorage.getItem("jwtToken")) {
    logoutBtn.innerText = "Logout";
    logoutBtn.onclick = logout; // Set fungsi logout
  } else {
    logoutBtn.innerText = "Sign in";
    logoutBtn.href = "auth/login.html"; // Redirect ke halaman login
  }
}

// Inisialisasi
window.onload = function () {
  fetchMasjidData();
  updateAuthLinks();
};
