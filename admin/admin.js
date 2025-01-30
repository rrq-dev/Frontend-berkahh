document.addEventListener("DOMContentLoaded", () => {
  const addMasjidForm = document.getElementById("addMasjidForm");
  const masjidTableBody = document.querySelector("#masjidTable tbody");

  // Function to fetch and display masjid data
  async function fetchMasjids() {
    try {
      const response = await fetch(
        "https://backend-berkah.onrender.com/getlocation",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
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
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ name, address, description }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to add masjid");
      }

      const newMasjid = await response.json();
      fetchMasjids();
      addMasjidForm.reset();
    } catch (error) {
      console.error("Error adding masjid:", error);
    }
  });

  // Function to handle editing a masjid
  async function handleEdit(event) {
    const masjidId = event.target.getAttribute("data-id");
    const name = prompt("Enter new name:", "");
    const address = prompt("Enter new address:", "");
    const description = prompt("Enter new description:", "");

    if (name && address && description) {
      try {
        const response = await fetch(
          "https://backend-berkah.onrender.com/updatelocation",
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
            body: JSON.stringify({ id: masjidId, name, address, description }),
          }
        );

        if (!response.ok) {
          throw new Error("Failed to update masjid");
        }

        fetchMasjids();
      } catch (error) {
        console.error("Error updating masjid:", error);
      }
    }
  }

  // Function to handle deleting a masjid
  async function handleDelete(event) {
    const masjidId = event.target.getAttribute("data-id");
    if (confirm("Are you sure you want to delete this masjid?")) {
      try {
        const response = await fetch(
          "https://backend-berkah.onrender.com/deletelocation",
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
            body: JSON.stringify({ id: masjidId }),
          }
        );

        if (!response.ok) {
          throw new Error("Failed to delete masjid");
        }

        fetchMasjids();
      } catch (error) {
        console.error("Error deleting masjid:", error);
      }
    }
  }

  // Fetch and display masjids on page load
  fetchMasjids();
});
