document
  .getElementById("registerForm")
  .addEventListener("submit", async (event) => {
    event.preventDefault(); // Mencegah pengiriman form default

    const formData = new FormData(event.target);
    const data = {
      username: formData.get("username"),
      email: formData.get("email"),
      password: formData.get("password"),
      confirmPassword: formData.get("confirmPassword"),
    };

    try {
      const response = await fetch(
        "https://backend-berkah.onrender.com/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        }
      );

      const result = await response.json();

      if (response.ok) {
        alert(result.message); // Tampilkan pesan sukses
        window.location.href = "login.html"; // Redirect ke halaman login
      } else {
        alert(result.message); // Tampilkan pesan kesalahan
      }
    } catch (error) {
      console.error("Error during registration:", error);
      alert("An error occurred. Please try again later.");
    }
  });
