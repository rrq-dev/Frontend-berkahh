// Fungsi untuk memuat data masjid dari backend
async function loadMasjidData(token) {
  try {
    const response = await fetch(
      "https://backend-berkah.onrender.com/getlocation",
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Response Error:", errorText);
      throw new Error("Gagal memuat data masjid.");
    }

    const result = await response.json(); // Parsing JSON dari respons API

    if (result.status !== "success") {
      throw new Error(result.message || "Terjadi kesalahan pada API.");
    }

    const masjidData = result.data; // Ambil array data dari properti `data`

    const masjidContainer = document.getElementById("masjid-container");

    // Hapus konten sebelumnya
    masjidContainer.innerHTML = "";

    // Tambahkan setiap masjid ke kontainer
    masjidData.forEach((masjid) => {
      const masjidCard = createMasjidCard(masjid);
      masjidContainer.appendChild(masjidCard);
    });
  } catch (error) {
    console.error("Error saat memuat data:", error);
    alert("Terjadi kesalahan saat memuat data masjid.");
  }
}

// Fungsi untuk memuat data lokasi dari backend
async function loadLocations(token) {
  try {
    const response = await fetch(
      "https://backend-berkah.onrender.com/getlocation",
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Response Error:", errorText);
      throw new Error("Gagal memuat data lokasi.");
    }

    const result = await response.json(); // Parsing JSON dari respons API

    if (result.status !== "success") {
      throw new Error(result.message || "Terjadi kesalahan pada API.");
    }

    const locations = result.data; // Ambil array data dari properti `data`

    const locationSelect = document.getElementById("location-select");

    // Hapus konten sebelumnya
    locationSelect.innerHTML = "";

    // Tambahkan setiap lokasi ke dropdown
    locations.forEach((location) => {
      const option = document.createElement("option");
      option.value = location.id; // Asumsi lokasi memiliki field 'id'
      option.textContent = location.name; // Asumsi lokasi memiliki field 'name'
      locationSelect.appendChild(option);
    });
  } catch (error) {
    console.error("Error saat memuat data:", error);
    alert("Terjadi kesalahan saat memuat data lokasi.");
  }
}

// Fungsi untuk membuat elemen kartu masjid
function createMasjidCard(masjid) {
  const card = document.createElement("div");
  card.className = "masjid-card";
  card.innerHTML = `    
    <h3>${masjid.name}</h3>    
    <p>${masjid.description}</p>    
    <img src="${masjid.image}" alt="${masjid.name}" />    
  `;
  return card;
}

document.getElementById("search-button").addEventListener("click", () => {
  const searchTerm = document.getElementById("search-box").value;
  const selectedLocation = document.getElementById("location-select").value;
  // Implement search functionality based on searchTerm and selectedLocation
  // You can filter the masjid data based on these values
});
