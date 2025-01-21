// Fungsi untuk mengambil data masjid dari backend
async function fetchMasjidData() {
  try {
    const response = await fetch("https://backend-berkah.onrender.com/masjid");
    const masjidData = await response.json();

    if (response.ok) {
      displayMasjidCards(masjidData);
    } else {
      document.getElementById("error-message").style.display = "block";
    }
  } catch (error) {
    console.error("Error fetching masjid data:", error);
    document.getElementById("error-message").style.display = "block";
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

      const updateButton = document.createElement("button");
      updateButton.innerText = "Update Feedback";
      updateButton.onclick = () => updateFeedback(masjid.id);
      card.appendChild(updateButton);

      const deleteButton = document.createElement("button");
      deleteButton.innerText = "Delete Feedback";
      deleteButton.onclick = () => deleteFeedback(masjid.id);
      card.appendChild(deleteButton);
    }

    masjidContainer.appendChild(card);
  });
}

// Fungsi untuk memberikan feedback
async function giveFeedback(masjidId) {
  const feedback = prompt("Please provide your feedback:");
  if (feedback) {
    try {
      const response = await fetch(
        `https://backend-berkah.onrender.com/masjid/${masjidId}/feedback`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("jwtToken")}`,
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

// Fungsi untuk memperbarui feedback
async function updateFeedback(masjidId) {
  const feedback = prompt("Please provide your updated feedback:");
  if (feedback) {
    try {
      const response = await fetch(
        `https://backend-berkah.onrender.com/masjid/${masjidId}/feedback`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("jwtToken")}`,
          },
          body: JSON.stringify({ feedback }),
        }
      );

      if (response.ok) {
        alert("Feedback updated successfully!");
      } else {
        alert("Failed to update feedback.");
      }
    } catch (error) {
      console.error("Error updating feedback:", error);
      alert("An error occurred while updating feedback.");
    }
  }
}

// Fungsi untuk menghapus feedback
async function deleteFeedback(masjidId) {
  if (confirm("Are you sure you want to delete your feedback?")) {
    try {
      const response = await fetch(
        `https://backend-berkah.onrender.com/masjid/${masjidId}/feedback`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("jwtToken")}`,
          },
        }
      );

      if (response.ok) {
        alert("Feedback deleted successfully!");
      } else {
        alert("Failed to delete feedback.");
      }
    } catch (error) {
      console.error("Error deleting feedback:", error);
      alert("An error occurred while deleting feedback.");
    }
  }
}

// Fungsi untuk logout
async function logout() {
  try {
    const response = await fetch("https://backend-berkah.onrender.com/logout", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("jwtToken")}`,
      },
    });

    if (response.ok) {
      localStorage.removeItem("jwtToken");
      localStorage.removeItem("userId");
      localStorage.removeItem("userRole");
      alert("Logout successful!");
      window.location.reload(); // Reload halaman untuk memperbarui tampilan
    } else {
      alert("Failed to logout.");
    }
  } catch (error) {
    console.error("Error during logout:", error);
    alert("An error occurred while logging out.");
  }
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
