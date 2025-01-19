// Get modal and buttons
const modal = document.getElementById("loginModal");
const openModalBtn = document.querySelector(".open-modal-btn");
const closeModalBtn = document.querySelector(".close-btn");
const loginForm = document.getElementById("loginForm");

// Backend API endpoint
const backendLoginURL = "https://your-backend-url.com/login"; // Ganti dengan URL backend Anda

// Function to open modal
const openModal = () => {
  if (modal) {
    modal.classList.add("visible");
    document.body.style.overflow = "hidden"; // Prevent scrolling
  }
};

// Function to close modal
const closeModal = () => {
  if (modal) {
    modal.classList.remove("visible");
    document.body.style.overflow = "auto"; // Re-enable scrolling
  }
};

// Open modal when button is clicked
if (openModalBtn) {
  openModalBtn.addEventListener("click", openModal);
}

// Close modal when "X" button is clicked
if (closeModalBtn) {
  closeModalBtn.addEventListener("click", closeModal);
}

// Close modal when clicking outside the modal content
window.addEventListener("click", (e) => {
  if (e.target === modal) {
    closeModal();
  }
});

// Close modal when pressing the "Esc" key
window.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && modal.classList.contains("visible")) {
    closeModal();
  }
});

// Handle login form submission
if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = new FormData(loginForm);
    const loginData = {
      username: formData.get("username"),
      password: formData.get("password"),
    };

    try {
      const response = await fetch(backendLoginURL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(loginData),
      });

      const result = await response.json();

      if (response.ok) {
        alert("Login successful!");
        closeModal();
        // Lakukan tindakan setelah login sukses (misalnya redirect)
      } else {
        alert(result.message || "Login failed!");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Something went wrong. Please try again.");
    }
  });
}
