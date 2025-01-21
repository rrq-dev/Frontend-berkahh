const registerForm = document.getElementById("registerForm");

registerForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const username = document.getElementById("username-input").value;
  const email = document.getElementById("email-input").value;
  const password = document.getElementById("password-input").value;
  const confirmPassword = document.getElementById(
    "confirm-password-input"
  ).value; // Ambil nilai konfirmasi password

  // Kirim data ke backend
  fetch("https://backend-berkah.onrender.com/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      username,
      email,
      password,
      confirm_password: confirmPassword, // Ganti confirmPassword dengan confirm_password
    }),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Registration failed");
      }
      return response.json();
    })
    .then((data) => {
      alert("Registration successful!, " + data.user.username);
      localStorage.setItem("jwtToken", data.token); // Simpan token
      localStorage.setItem("userId", data.userId);
      // Redirect to user home page
      window.location.href =
        "https://rrq-dev.github.io/jumatberkah.github.io/login"; // Redirect ke halaman beranda
    })
    .catch((error) => {
      console.error("There was a problem with the fetch operation:", error);
      alert("Registration failed: " + error.message);
    });
});
