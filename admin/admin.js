document.addEventListener("DOMContentLoaded", () => {
  const addMasjidForm = document.getElementById("addMasjidForm");
  const masjidTableBody = document.querySelector("#masjidTable tbody");
  const searchBar = document.getElementById("search-bar");
  const errorMessage = document.getElementById("error-message");
  const detailsContainer = document.getElementById("masjid-details");
  const navbarButtons = document.querySelectorAll(".navbar-button");

  // Retrieve the token from localStorage
  const token = localStorage.getItem("jwtToken");

  // Function to fetch and display all masjids
  async function fetchMasjids() {
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
        throw new Error("Failed to fetch masjids");
      }

      const masjids = await response.json();
      renderMasjids(masjids);
    } catch (error) {
      console.error("Error fetching masjids:", error);
      Swal.fire({
        title: "Error",
        text: error.message,
        icon: "error",
        confirmButtonText: "OK",
      });
    }
  }

  // Function to render masjid data in the table
  function renderMasjids(masjids) {
    masjidTableBody.innerHTML = "";
    masjids.forEach((masjid) => {
      const row = document.createElement("tr");
      row.innerHTML = `
                  <td>${masjid.name}</td>
                  <td>${masjid.address}</td>
                  <td>${masjid.description}</td>
                  <td>
                      <button class="edit-button" data-id="${masjid.id}">Edit</button>
                      <button class="delete-button" data-id="${masjid.id}">Delete</button>
                  </td>
              `;
      masjidTableBody.appendChild(row);
    });

    // Add event listeners to edit and delete buttons
    const editButtons = document.querySelectorAll(".edit-button");
    editButtons.forEach((button) => {
      button.addEventListener("click", handleEdit);
    });

    const deleteButtons = document.querySelectorAll(".delete-button");
    deleteButtons.forEach((button) => {
      button.addEventListener("click", handleDelete);
    });
  }

  // Function to handle form submission for adding a new masjid
  addMasjidForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const name = document.getElementById("masjidName").value;
    const address = document.getElementById("masjidAddress").value;
    const description = document.getElementById("masjidContact").value;

    try {
      const response = await fetch(
        "https://backend-berkah.onrender.com/createlocation",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ name, address, description }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to add masjid");
      }

      const newMasjid = await response.json();
      Swal.fire({
        title: "Success",
        text: "Masjid added successfully!",
        icon: "success",
        confirmButtonText: "OK",
      });
      fetchMasjids();
      addMasjidForm.reset();
    } catch (error) {
      console.error("Error adding masjid:", error);
      Swal.fire({
        title: "Error",
        text: error.message,
        icon: "error",
        confirmButtonText: "OK",
      });
    }
  });

  // Function to handle editing a masjid
  async function handleEdit(event) {
    const masjidId = event.target.getAttribute("data-id");

    const { value: name } = await Swal.fire({
      title: "Enter new name",
      input: "text",
      inputValue: "",
      showCancelButton: true,
      inputValidator: (value) => {
        if (!value) {
          return "You need to write something!";
        }
      },
    });

    const { value: address } = await Swal.fire({
      title: "Enter new address",
      input: "text",
      inputValue: "",
      showCancelButton: true,
      inputValidator: (value) => {
        if (!value) {
          return "You need to write something!";
        }
      },
    });

    const { value: description } = await Swal.fire({
      title: "Enter new description",
      input: "text",
      inputValue: "",
      showCancelButton: true,
      inputValidator: (value) => {
        if (!value) {
          return "You need to write something!";
        }
      },
    });

    if (name && address && description) {
      try {
        const response = await fetch(
          "https://backend-berkah.onrender.com/updatelocation",
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ id: masjidId, name, address, description }),
          }
        );

        if (!response.ok) {
          throw new Error("Failed to update masjid");
        }

        Swal.fire({
          title: "Success",
          text: "Masjid updated successfully!",
          icon: "success",
          confirmButtonText: "OK",
        });
        fetchMasjids();
      } catch (error) {
        console.error("Error updating masjid:", error);
        Swal.fire({
          title: "Error",
          text: error.message,
          icon: "error",
          confirmButtonText: "OK",
        });
      }
    }
  }

  // Function to handle deleting a masjid
  async function handleDelete(event) {
    const masjidId = event.target.getAttribute("data-id");

    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        const response = await fetch(
          "https://backend-berkah.onrender.com/deletelocation",
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ id: masjidId }),
          }
        );

        if (!response.ok) {
          throw new Error("Failed to delete masjid");
        }

        Swal.fire({
          title: "Deleted!",
          text: "Masjid has been deleted.",
          icon: "success",
          confirmButtonText: "OK",
        });
        fetchMasjids();
      } catch (error) {
        console.error("Error deleting masjid:", error);
        Swal.fire({
          title: "Error",
          text: error.message,
          icon: "error",
          confirmButtonText: "OK",
        });
      }
    }
  }

  // Function to fetch a masjid by ID
  async function fetchMasjidById(masjidId) {
    try {
      const response = await fetch(
        `https://backend-berkah.onrender.com/getlocation?id=${masjidId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch masjid details");
      }

      const masjidDetails = await response.json();
      displayMasjidDetails(masjidDetails);
    } catch (error) {
      console.error("Error fetching masjid details:", error);
      Swal.fire({
        title: "Error",
        text: error.message,
        icon: "error",
        confirmButtonText: "OK",
      });
    }
  }

  // Function to display masjid details
  function displayMasjidDetails(masjid) {
    detailsContainer.innerHTML = `
              <h2>${masjid.name}</h2>
              <p>Address: ${masjid.address}</p>
              <p>Description: ${masjid.description}</p>
          `;
    detailsContainer.style.display = "block"; // Show details
  }

  // Function to handle logout
  function logout() {
    localStorage.removeItem("jwtToken");
    localStorage.removeItem("userId");
    localStorage.removeItem("userRole");
    Swal.fire({
      title: "Logout Successful",
      icon: "success",
      confirmButtonText: "OK",
    }).then(() => {
      window.location.href = "https://rrq-dev.github.io/jumatberkah.github.io"; // Redirect to main page
    });
  }

  // Function to update authentication links
  function updateAuthLinks() {
    const logoutBtn = document.getElementById("logout-btn");
    if (localStorage.getItem("jwtToken")) {
      logoutBtn.innerText = "Logout";
      logoutBtn.onclick = logout; // Set logout function
    } else {
      logoutBtn.innerText = "Sign in";
      logoutBtn.href = "auth/login.html"; // Redirect to login page
    }
  }

  // Fetch and display masjids on page load
  fetchMasjids();
  updateAuthLinks();
});
