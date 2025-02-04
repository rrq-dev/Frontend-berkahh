document.addEventListener("DOMContentLoaded", () => {
  // Inisialisasi elemen-elemen yang mungkin ada di kedua halaman
  const searchBar = document.getElementById("search-bar");
  const logoutBtn = document.getElementById("logout-btn");

  // Inisialisasi elemen-elemen khusus halaman admin
  const addMasjidForm = document.getElementById("addMasjidForm");
  const masjidTable = document
    .getElementById("masjidTable")
    ?.getElementsByTagName("tbody")[0];
  const userTable = document
    .getElementById("userTable")
    ?.getElementsByTagName("tbody")[0];

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
      window.location.href = "https://jumatberkah.vercel.app/auth/login.html";
    });
    return;
  }

  // Fungsi untuk menentukan halaman saat ini
  const isManageUserPage = () => {
    return window.location.pathname.includes("manage_user.html");
  };

  // Fetch and display masjid data
  const fetchMasjidData = async () => {
    if (!masjidTable) return; // Skip jika tidak ada masjidTable

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
    if (!masjidTable) return;

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
  if (addMasjidForm) {
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
  }

  // Edit masjid
  window.editMasjid = async (id) => {
    try {
      const response = await fetch(
        `https://backend-berkah.onrender.com/getlocation?id=${id}`,
        {
          headers: {
            "Content-Type": "application/json",
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

  // Update table with user data
  const updateUserTable = (data) => {
    if (!userTable) return; // Skip jika tidak ada userTable

    userTable.innerHTML = "";
    data.forEach((user) => {
      const row = userTable.insertRow();
      row.innerHTML = `
        <td>${user.username}</td>
        <td>${user.email}</td>
        <td>${user.role.name}</td>
        <td>
          <button onclick="editUser('${user.id}')" class="edit-button">
            <i class="fas fa-edit"></i> Edit
          </button>
          <button onclick="deleteUser('${user.id}')" class="delete-button">
            <i class="fas fa-trash"></i> Hapus
          </button>
        </td>
      `;
    });
  };

  // Fetch user data
  const fetchUserData = async () => {
    if (!userTable) return; // Skip jika tidak ada userTable

    try {
      Swal.fire({
        title: "Memuat Data...",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      const response = await fetch(
        "https://backend-berkah.onrender.com/retreive/data/user",
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) throw new Error("Failed to fetch data");

      const data = await response.json();
      updateUserTable(data);
      Swal.close();
    } catch (error) {
      console.error("Error fetching data:", error);
      Swal.fire({
        title: "Error!",
        text: "Gagal memuat data user",
        icon: "error",
        confirmButtonColor: "#007bff",
      });
    }
  };

  // Edit user
  window.editUser = async (id) => {
    try {
      const response = await fetch(
        `https://backend-berkah.onrender.com/retreive/data/user?id=${id}`,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) throw new Error("Failed to fetch user data");

      const user = await response.json();

      const { value: formValues } = await Swal.fire({
        title: "Edit User",
        html: `
          <input id="swal-username" class="swal2-input" value="${
            user.username
          }" placeholder="Username">
          <input id="swal-email" class="swal2-input" value="${
            user.email
          }" placeholder="Email">
          <select id="swal-role" class="swal2-input">
            <option value="admin" ${
              user.role.name === "admin" ? "selected" : ""
            }>Admin</option>
            <option value="user" ${
              user.role.name === "user" ? "selected" : ""
            }>User</option>
          </select>
        `,
        focusConfirm: false,
        showCancelButton: true,
        confirmButtonText: "Simpan",
        cancelButtonText: "Batal",
        confirmButtonColor: "#007bff",
        preConfirm: () => {
          return {
            id: id,
            username: document.getElementById("swal-username").value,
            email: document.getElementById("swal-email").value,
            role: document.getElementById("swal-role").value,
          };
        },
      });

      if (formValues) {
        const updateResponse = await fetch(
          "https://backend-berkah.onrender.com/updateuser",
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(formValues),
          }
        );

        if (!updateResponse.ok) throw new Error("Failed to update user");

        Swal.fire({
          title: "Berhasil!",
          text: "Data user berhasil diperbarui",
          icon: "success",
          confirmButtonColor: "#007bff",
          timer: 1500,
        });

        fetchUserData();
      }
    } catch (error) {
      console.error("Error updating user:", error);
      Swal.fire({
        title: "Error!",
        text: "Gagal memperbarui data user",
        icon: "error",
        confirmButtonColor: "#007bff",
      });
    }
  };

  // Delete user
  window.deleteUser = async (id) => {
    try {
      const result = await Swal.fire({
        title: "Hapus User?",
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
          "https://backend-berkah.onrender.com/deleteuser",
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ id: id }),
          }
        );

        if (!response.ok) throw new Error("Failed to delete user");

        Swal.fire({
          title: "Terhapus!",
          text: "Data user berhasil dihapus",
          icon: "success",
          confirmButtonColor: "#007bff",
          timer: 1500,
        });

        fetchUserData();
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      Swal.fire({
        title: "Error!",
        text: "Gagal menghapus data user",
        icon: "error",
        confirmButtonColor: "#007bff",
      });
    }
  };

  // Search functionality
  if (searchBar) {
    searchBar.addEventListener("input", (e) => {
      const searchTerm = e.target.value.toLowerCase();
      const targetTable = isManageUserPage() ? userTable : masjidTable;

      if (targetTable) {
        const rows = targetTable.getElementsByTagName("tr");
        Array.from(rows).forEach((row) => {
          const text = row.textContent.toLowerCase();
          row.style.display = text.includes(searchTerm) ? "" : "none";
        });
      }
    });
  }

  // Logout functionality
  if (logoutBtn) {
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
            window.location.href =
              "https://jumatberkah.vercel.app/auth/login.html";
          });
        }
      });
    });
  }

  // Inisialisasi halaman berdasarkan path
  if (isManageUserPage()) {
    // Jika di halaman manage user, hanya load data user
    fetchUserData();
  } else {
    // Jika di halaman admin (masjid), load kedua data
    fetchMasjidData();
    fetchUserData();
  }
});
