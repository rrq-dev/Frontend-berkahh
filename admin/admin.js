document.addEventListener("DOMContentLoaded", () => {
  // Inisialisasi elemen-elemen
  const searchBar = document.getElementById("search-bar");
  const logoutBtn = document.getElementById("logout-btn");
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

  // Update table with masjid data
  const updateTable = (data) => {
    if (!masjidTable) return;

    masjidTable.innerHTML = "";
    data.forEach((masjid) => {
      const row = masjidTable.insertRow();
      row.innerHTML = `
              <td>${masjid.name || "-"}</td>
              <td>${masjid.address || "-"}</td>
              <td>${masjid.description || "-"}</td>
              <td>
                  <button onclick="editMasjid(${
                    masjid.id
                  })" class="edit-button">
                      <i class="fas fa-edit"></i> Edit
                  </button>
                  <button onclick="deleteMasjid(${
                    masjid.id
                  })" class="delete-button">
                      <i class="fas fa-trash"></i> Hapus
                  </button>
              </td>
          `;
    });
  };

  // Update table with user data
  const updateUserTable = (data) => {
    if (!userTable) return;

    userTable.innerHTML = "";
    data.forEach((user) => {
      const row = userTable.insertRow();
      row.innerHTML = `
              <td>${user.username || "-"}</td>
              <td>${user.email || "-"}</td>
              <td>${user.role?.name || "-"}</td>
              <td>
                  <button onclick="editUser(${user.id})" class="edit-button">
                      <i class="fas fa-edit"></i> Edit
                  </button>
                  <button onclick="deleteUser(${
                    user.id
                  })" class="delete-button">
                      <i class="fas fa-trash"></i> Hapus
                  </button>
              </td>
          `;
    });
  };

  // Fetch and display masjid data
  const fetchMasjidData = async () => {
    if (!masjidTable) return;

    try {
      const loadingAlert = Swal.fire({
        title: "Memuat Data...",
        allowOutsideClick: false,
        showConfirmButton: false,
        willOpen: () => {
          Swal.showLoading();
        },
      });

      const response = await fetch(
        "https://backend-berkah.onrender.com/retreive/data/location"
      );
      const data = await response.json();

      loadingAlert.close();
      updateTable(data);
    } catch (error) {
      console.error("Error fetching masjid data:", error);
      Swal.fire({
        title: "Error!",
        text: "Gagal memuat data masjid",
        icon: "error",
        confirmButtonColor: "#007bff",
      });
    }
  };

  // Fetch and display user data
  const fetchUserData = async () => {
    if (!userTable) return;

    try {
      const loadingAlert = Swal.fire({
        title: "Memuat Data...",
        allowOutsideClick: false,
        showConfirmButton: false,
        willOpen: () => {
          Swal.showLoading();
        },
      });

      const response = await fetch(
        "https://backend-berkah.onrender.com/retreive/data/user"
      );
      const data = await response.json();

      loadingAlert.close();
      updateUserTable(data);
    } catch (error) {
      console.error("Error fetching user data:", error);
      Swal.fire({
        title: "Error!",
        text: "Gagal memuat data pengguna",
        icon: "error",
        confirmButtonColor: "#007bff",
      });
    }
  };

  // Add new masjid
  if (addMasjidForm) {
    addMasjidForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const masjidData = {
        name: document.getElementById("masjidName").value.trim(),
        address: document.getElementById("masjidAddress").value.trim(),
        description: document.getElementById("masjidContact").value.trim(),
      };

      if (!masjidData.name || !masjidData.address) {
        Swal.fire({
          title: "Peringatan!",
          text: "Nama dan alamat masjid harus diisi",
          icon: "warning",
          confirmButtonColor: "#007bff",
        });
        return;
      }

      try {
        const loadingAlert = Swal.fire({
          title: "Menyimpan Data...",
          allowOutsideClick: false,
          showConfirmButton: false,
          willOpen: () => {
            Swal.showLoading();
          },
        });

        const response = await fetch(
          "https://backend-berkah.onrender.com/createlocation",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(masjidData),
          }
        );

        if (!response.ok) throw new Error("Gagal menambahkan masjid");

        loadingAlert.close();
        await Swal.fire({
          title: "Berhasil!",
          text: "Data masjid berhasil ditambahkan",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
        });

        addMasjidForm.reset();
        fetchMasjidData();
      } catch (error) {
        console.error("Error adding masjid:", error);
        Swal.fire({
          title: "Error!",
          text: "Gagal menambahkan data masjid",
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
        `https://backend-berkah.onrender.com/retreive/data/location`
      );
      const locations = await response.json();
      const masjid = locations.find((loc) => loc.id === id);

      if (!masjid) {
        throw new Error("Data masjid tidak ditemukan");
      }

      const { value: formValues } = await Swal.fire({
        title: "Edit Data Masjid",
        html: `
                  <input id="swal-name" class="swal2-input" value="${
                    masjid.name
                  }" placeholder="Nama Masjid">
                  <input id="swal-address" class="swal2-input" value="${
                    masjid.address
                  }" placeholder="Alamat">
                  <input id="swal-description" class="swal2-input" value="${
                    masjid.description || ""
                  }" placeholder="Deskripsi">
              `,
        focusConfirm: false,
        showCancelButton: true,
        confirmButtonText: "Simpan",
        cancelButtonText: "Batal",
        confirmButtonColor: "#007bff",
        preConfirm: () => {
          const name = document.getElementById("swal-name").value.trim();
          const address = document.getElementById("swal-address").value.trim();
          const description = document
            .getElementById("swal-description")
            .value.trim();

          if (!name || !address) {
            Swal.showValidationMessage("Nama dan alamat harus diisi!");
            return false;
          }

          return { id, name, address, description };
        },
      });

      if (formValues) {
        const loadingAlert = Swal.fire({
          title: "Menyimpan Perubahan...",
          allowOutsideClick: false,
          showConfirmButton: false,
          willOpen: () => {
            Swal.showLoading();
          },
        });

        const updateResponse = await fetch(
          "https://backend-berkah.onrender.com/updatelocation",
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formValues),
          }
        );

        if (!updateResponse.ok) throw new Error("Gagal memperbarui data");

        loadingAlert.close();
        await Swal.fire({
          title: "Berhasil!",
          text: "Data masjid berhasil diperbarui",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
        });

        fetchMasjidData();
      }
    } catch (error) {
      console.error("Error updating masjid:", error);
      Swal.fire({
        title: "Error!",
        text: error.message || "Gagal memperbarui data masjid",
        icon: "error",
        confirmButtonColor: "#007bff",
      });
    }
  };

  // Delete masjid
  window.deleteMasjid = async (id) => {
    try {
      const result = await Swal.fire({
        title: "Konfirmasi Hapus",
        text: "Apakah Anda yakin ingin menghapus data masjid ini?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#dc3545",
        cancelButtonColor: "#6c757d",
        confirmButtonText: "Ya, Hapus!",
        cancelButtonText: "Batal",
      });

      if (result.isConfirmed) {
        const loadingAlert = Swal.fire({
          title: "Menghapus Data...",
          allowOutsideClick: false,
          showConfirmButton: false,
          willOpen: () => {
            Swal.showLoading();
          },
        });

        const response = await fetch(
          "https://backend-berkah.onrender.com/deletelocation",
          {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id }),
          }
        );

        if (!response.ok) throw new Error("Gagal menghapus data");

        loadingAlert.close();
        await Swal.fire({
          title: "Berhasil!",
          text: "Data masjid berhasil dihapus",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
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

  // Edit user
  window.editUser = async (id) => {
    try {
      const response = await fetch(
        `https://backend-berkah.onrender.com/retreive/data/user`
      );
      const users = await response.json();
      const user = users.find((u) => u.id === id);

      if (!user) {
        throw new Error("Data pengguna tidak ditemukan");
      }

      const { value: formValues } = await Swal.fire({
        title: "Edit Data Pengguna",
        html: `
                  <input id="swal-username" class="swal2-input" value="${
                    user.username
                  }" placeholder="Username">
                  <input id="swal-email" class="swal2-input" value="${
                    user.email
                  }" placeholder="Email">
                  <select id="swal-role" class="swal2-input">
                      <option value="1" ${
                        user.role.name === "admin" ? "selected" : ""
                      }>Admin</option>
                      <option value="2" ${
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
          const username = document
            .getElementById("swal-username")
            .value.trim();
          const email = document.getElementById("swal-email").value.trim();
          const roleId = document.getElementById("swal-role").value;

          if (!username || !email) {
            Swal.showValidationMessage("Username dan email harus diisi!");
            return false;
          }

          return { id, username, email, role_id: parseInt(roleId) };
        },
      });

      if (formValues) {
        const loadingAlert = Swal.fire({
          title: "Menyimpan Perubahan...",
          allowOutsideClick: false,
          showConfirmButton: false,
          willOpen: () => {
            Swal.showLoading();
          },
        });

        const updateResponse = await fetch(
          "https://backend-berkah.onrender.com/updateuser",
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formValues),
          }
        );

        if (!updateResponse.ok) throw new Error("Gagal memperbarui data");

        loadingAlert.close();
        await Swal.fire({
          title: "Berhasil!",
          text: "Data pengguna berhasil diperbarui",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
        });

        fetchUserData();
      }
    } catch (error) {
      console.error("Error updating user:", error);
      Swal.fire({
        title: "Error!",
        text: error.message || "Gagal memperbarui data pengguna",
        icon: "error",
        confirmButtonColor: "#007bff",
      });
    }
  };

  // Delete user
  window.deleteUser = async (id) => {
    try {
      const result = await Swal.fire({
        title: "Konfirmasi Hapus",
        text: "Apakah Anda yakin ingin menghapus pengguna ini?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#dc3545",
        cancelButtonColor: "#6c757d",
        confirmButtonText: "Ya, Hapus!",
        cancelButtonText: "Batal",
      });

      if (result.isConfirmed) {
        const loadingAlert = Swal.fire({
          title: "Menghapus Data...",
          allowOutsideClick: false,
          showConfirmButton: false,
          willOpen: () => {
            Swal.showLoading();
          },
        });

        const response = await fetch(
          "https://backend-berkah.onrender.com/deleteuser",
          {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id }),
          }
        );

        if (!response.ok) throw new Error("Gagal menghapus data");

        loadingAlert.close();
        await Swal.fire({
          title: "Berhasil!",
          text: "Pengguna berhasil dihapus",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
        });

        fetchUserData();
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      Swal.fire({
        title: "Error!",
        text: "Gagal menghapus pengguna",
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
        title: "Konfirmasi Logout",
        text: "Apakah Anda yakin ingin keluar?",
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

  // Initialize page based on current path
  if (isManageUserPage()) {
    fetchUserData();
  } else {
    fetchMasjidData();
  }
});
