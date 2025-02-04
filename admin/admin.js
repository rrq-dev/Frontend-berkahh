document.addEventListener("DOMContentLoaded", () => {
  const addMasjidForm = document.getElementById("addMasjidForm");
  const searchBar = document.getElementById("search-bar");
  const masjidTable = document
    .getElementById("masjidTable")
    .getElementsByTagName("tbody")[0];
  const logoutBtn = document.getElementById("logout-btn");

  // Check authentication
  const token = localStorage.getItem("jwtToken");
  const userRole = localStorage.getItem("userRole");

  if (!token || userRole !== "admin") {
    Swal.fire({
      title: "Akses Ditolak!",
      text: "Anda harus login sebagai admin",
      icon: "error",
      confirmButtonColor: "#007bff",
    }).then(() => {
      window.location.href = "../auth/login.html";
    });
    return;
  }

  // Fetch and display masjid data
  const fetchMasjidData = async () => {
    try {
      Swal.fire({
        title: "Memuat Data...",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      const response = await fetch(
        "https://backend-berkah.onrender.com/getlocation",
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) throw new Error("Failed to fetch data");

      const data = await response.json();
      updateTable(data);
      Swal.close();
    } catch (error) {
      console.error("Error fetching data:", error);
      Swal.fire({
        title: "Error!",
        text: "Gagal memuat data masjid",
        icon: "error",
        confirmButtonColor: "#007bff",
      });
    }
  };

  // Update table with masjid data
  const updateTable = (data) => {
    masjidTable.innerHTML = "";
    data.forEach((masjid) => {
      const row = masjidTable.insertRow();
      row.innerHTML = `
        <td>${masjid.name}</td>
        <td>${masjid.address}</td>
        <td>${masjid.description}</td>
        <td>
          <button onclick="editMasjid('${masjid.id}')" class="edit-button">
            <i class="fas fa-edit"></i> Edit
          </button>
          <button onclick="deleteMasjid('${masjid.id}')" class="delete-button">
            <i class="fas fa-trash"></i> Hapus
          </button>
        </td>
      `;
    });
  };

  // Add new masjid
  addMasjidForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const masjidData = {
      name: document.getElementById("masjidName").value,
      address: document.getElementById("masjidAddress").value,
      description: document.getElementById("masjidContact").value,
    };

    try {
      Swal.fire({
        title: "Menambahkan Masjid...",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      const response = await fetch(
        "https://backend-berkah.onrender.com/createlocation",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(masjidData),
        }
      );

      if (!response.ok) throw new Error("Failed to add masjid");

      Swal.fire({
        title: "Berhasil!",
        text: "Masjid berhasil ditambahkan",
        icon: "success",
        confirmButtonColor: "#007bff",
        timer: 1500,
      });

      addMasjidForm.reset();
      fetchMasjidData();
    } catch (error) {
      console.error("Error adding masjid:", error);
      Swal.fire({
        title: "Error!",
        text: "Gagal menambahkan masjid",
        icon: "error",
        confirmButtonColor: "#007bff",
      });
    }
  });

  // Edit masjid
  window.editMasjid = async (id) => {
    try {
      const response = await fetch(
        `https://backend-berkah.onrender.com/retreive/data?id=${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) throw new Error("Failed to fetch masjid data");

      const masjid = await response.json();

      const { value: formValues } = await Swal.fire({
        title: "Edit Masjid",
        html: `
          <input id="swal-name" class="swal2-input" value="${masjid.name}" placeholder="Nama Masjid">
          <input id="swal-address" class="swal2-input" value="${masjid.address}" placeholder="Alamat">
          <input id="swal-description" class="swal2-input" value="${masjid.description}" placeholder="Deskripsi">
        `,
        focusConfirm: false,
        showCancelButton: true,
        confirmButtonText: "Simpan",
        cancelButtonText: "Batal",
        confirmButtonColor: "#007bff",
        preConfirm: () => {
          return {
            id: id,
            name: document.getElementById("swal-name").value,
            address: document.getElementById("swal-address").value,
            description: document.getElementById("swal-description").value,
          };
        },
      });

      if (formValues) {
        const updateResponse = await fetch(
          "https://backend-berkah.onrender.com/updatelocation",
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(formValues),
          }
        );

        if (!updateResponse.ok) throw new Error("Failed to update masjid");

        Swal.fire({
          title: "Berhasil!",
          text: "Data masjid berhasil diperbarui",
          icon: "success",
          confirmButtonColor: "#007bff",
          timer: 1500,
        });

        fetchMasjidData();
      }
    } catch (error) {
      console.error("Error updating masjid:", error);
      Swal.fire({
        title: "Error!",
        text: "Gagal memperbarui data masjid",
        icon: "error",
        confirmButtonColor: "#007bff",
      });
    }
  };

  // Delete masjid
  window.deleteMasjid = async (id) => {
    try {
      const result = await Swal.fire({
        title: "Hapus Masjid?",
        text: "Data yang dihapus tidak dapat dikembalikan!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#dc3545",
        cancelButtonColor: "#6c757d",
        confirmButtonText: "Ya, Hapus!",
        cancelButtonText: "Batal",
      });

      if (result.isConfirmed) {
        const response = await fetch(
          "https://backend-berkah.onrender.com/deletelocation",
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ id: id }),
          }
        );

        if (!response.ok) throw new Error("Failed to delete masjid");

        Swal.fire({
          title: "Terhapus!",
          text: "Data masjid berhasil dihapus",
          icon: "success",
          confirmButtonColor: "#007bff",
          timer: 1500,
        });

        fetchMasjidData();
      }
    } catch (error) {
      console.error("Error deleting masjid:", error);
      Swal.fire({
        title: "Error!",
        text: "Gagal menghapus data masjid",
        icon: "error",
        confirmButtonColor: "#007bff",
      });
    }
  };

  // Search functionality
  searchBar.addEventListener("input", (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const rows = masjidTable.getElementsByTagName("tr");

    Array.from(rows).forEach((row) => {
      const text = row.textContent.toLowerCase();
      row.style.display = text.includes(searchTerm) ? "" : "none";
    });
  });

  // Logout functionality
  logoutBtn.addEventListener("click", () => {
    Swal.fire({
      title: "Logout?",
      text: "Anda akan keluar dari sistem",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#dc3545",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Ya, Logout!",
      cancelButtonText: "Batal",
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.removeItem("jwtToken");
        localStorage.removeItem("userId");
        localStorage.removeItem("userRole");

        Swal.fire({
          title: "Berhasil Logout!",
          text: "Anda akan dialihkan ke halaman login",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
        }).then(() => {
          window.location.href = "../auth/login.html";
        });
      }
    });
  });

  // Initial load
  fetchMasjidData();
});
