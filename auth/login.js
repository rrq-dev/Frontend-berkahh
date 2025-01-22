// login.js

document
  .getElementById("loginForm")
  .addEventListener("submit", async (event) => {
    event.preventDefault(); // Mencegah pengiriman form default

    const email = document.getElementById("email-input").value;
    const password = document.getElementById("password-input").value;

    try {
      const response = await fetch(
        "https://backend-berkah.onrender.com/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }), // Mengirimkan email dan password
        }
      );

      if (!response.ok) {
        const errorMessage = await response.text();
        throw new Error(`Login failed: ${errorMessage}`);
      }

      const data = await response.json();
      const token = data.token; // Asumsikan token ada di dalam response

      // Simpan token ke local storage
      localStorage.setItem("jwtToken", token);
      localStorage.setItem("userId", data.user.id); // Simpan user ID
      localStorage.setItem("userRole", data.user.role); // Simpan role pengguna

      alert("Login successful! Welcome back!");
      window.location.href = "https://rrq-dev.github.io/jumatberkah.github.io/"; // Redirect ke halaman beranda
    } catch (error) {
      console.error("Error during login:", error);
      alert("Login failed: " + error.message);
    }
  });
