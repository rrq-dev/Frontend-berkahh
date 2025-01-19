// main.js

async function fetchMasjidData() {
  try {
    const response = await fetch("path/to/masjid/data"); // Update with your actual path
    if (!response.ok) throw new Error("Network response was not ok");
    const masjidData = await response.json();
    renderMasjidCards(masjidData);
  } catch (error) {
    console.error("Error fetching masjid data:", error);
    document.getElementById("error-message").style.display = "block";
  }
}

function renderMasjidCards(data) {
  const container = document.getElementById("masjid-container");
  container.innerHTML = ""; // Clear existing cards
  data.forEach((masjid) => {
    const card = document.createElement("div");
    card.className = "masjid-card";
    card.innerHTML = `  
            <h3>${masjid.name}</h3>  
            <p>${masjid.description}</p>  
            <img src="${masjid.image}" alt="${masjid.name}" />  
        `;
    container.appendChild(card);
  });
}

document.getElementById("search-button").addEventListener("click", () => {
  const searchTerm = document.getElementById("search-box").value;
  const selectedLocation = document.getElementById("location-select").value;
  // Implement search functionality based on searchTerm and selectedLocation
  // You can filter the masjid data based on these values
});

// Initialize the app
document.addEventListener("DOMContentLoaded", fetchMasjidData);
