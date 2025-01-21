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
          body: JSON.stringify({ email, password }), // Payload sesuai dengan LoginInput
        }
      );

      const result = await response.json();

      if (response.ok) {
        alert("Login successful! Welcome back!");
        localStorage.setItem("jwtToken", result.token); // Simpan token ke local storage
        localStorage.setItem("userId", result.userId); // Simpan userId jika ada
        window.location.href = "user_home.html"; // Redirect ke halaman beranda
      } else {
        alert(result.message || "Login failed. Please try again."); // Tampilkan pesan kesalahan
      }
    } catch (error) {
      console.error("Error during login:", error);
      alert("An error occurred. Please try again later.");
    }
  });
