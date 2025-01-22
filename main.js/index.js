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

    const masjidData = await response.json();

    if (response.ok) {
      displayMasjidCards(masjidData);
    } else {
      document.getElementById(
        "error-message"
      ).innerText = `Error loading masjid list: ${masjidData.message}`;
      document.getElementById("error-message").style.display = "block";
    }
  } catch (error) {
    console.error("Error fetching masjid data:", error);
    document.getElementById("error-message").innerText =
      "Error fetching masjid data.";
    document.getElementById("error-message").style.display = "block";
  }
}

// Fungsi untuk mengambil data lokasi berdasarkan ID
async function fetchLocationById(locationId) {
  try {
    const token = localStorage.getItem("jwtToken"); // Ambil token dari local storage
    const response = await fetch(
      `https://backend-berkah.onrender.com/getlocation/${locationId}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`, // Sertakan token di header
          "Content-Type": "application/json",
        },
      }
    );

    const locationData = await response.json();

    if (response.ok) {
      displayLocationDetails(locationData);
    } else {
      alert(`Error loading location: ${locationData.message}`);
    }
  } catch (error) {
    console.error("Error fetching location data:", error);
    alert("An error occurred while fetching location data.");
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
          <button onclick="fetchLocationById(${masjid.id})">View Details</button>  
      `;

    masjidContainer.appendChild(card);
  });
}

// Fungsi untuk menampilkan detail lokasi
function displayLocationDetails(location) {
  const detailsContainer = document.getElementById("location-details");
  detailsContainer.innerHTML = `  
      <h2>${location.name}</h2>  
      <p>Address: ${location.address}</p>  
      <p>Description: ${location.description}</p>  
  `;
  detailsContainer.style.display = "block"; // Tampilkan detail
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
  localStorage.removeItem("jwtToken");
  localStorage.removeItem("userId");
  localStorage.removeItem("userRole");
  alert("Logout successful!");
  window.location.href = "https://rrq-dev.github.io/jumatberkah.github.io/"; // Redirect ke halaman utama
}

// Menangani tampilan tombol logout jika pengguna sudah login
function updateAuthLinks() {
  const logoutBtn = document.getElementById("logout-btn");
  if (localStorage.getItem("jwtToken")) {
    logoutBtn.innerText = "Logout";
    logoutBtn.onclick = logout; // Set fungsi logout
  } else {
    logoutBtn.innerText = "Sign in";
    logoutBtn.href =
      "https://rrq-dev.github.io/jumatberkah.github.io/auth/login"; // Redirect ke halaman login
  }
}

// Inisialisasi
window.onload = function () {
  fetchMasjidData();
  updateAuthLinks();
};
