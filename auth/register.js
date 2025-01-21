document.addEventListener("DOMContentLoaded", () => {
  // Event listener untuk tombol register
  document.getElementById("register-btn").addEventListener("click", () => {
    const username = document.getElementById("username-input").value;
    const email = document.getElementById("email-input").value;
    const password = document.getElementById("password-input").value;
    const confirmPassword = document.getElementById(
      "confirm-password-input"
    ).value;

    if (username && email && password && confirmPassword) {
      if (password === confirmPassword) {
        registerUser(username, email, password);
      } else {
        alert("Passwords do not match.");
      }
    } else {
      alert("Please fill in all fields.");
    }
  });
});

// Fungsi untuk mendaftar pengguna
async function registerUser(username, email, password) {
  try {
    const response = await fetch(
      "https://backend-berkah.onrender.com/register",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, email, password }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Registration Error:", errorText);
      throw new Error("Registration failed. Please try again.");
    }

    const result = await response.json();
    alert("Registration successful! You can now log in.");
    // Redirect to login page or perform other actions
  } catch (error) {
    console.error("Error during registration:", error);
    alert(error.message);
  }
}
