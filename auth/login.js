document
  .getElementById("loginForm")
  .addEventListener("submit", async (event) => {
    event.preventDefault(); // Prevent default form submission

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
          body: JSON.stringify({ email, password }), // Send email and password
        }
      );

      if (!response.ok) {
        const errorMessage = await response.text();
        throw new Error(`Login failed: ${errorMessage}`);
      }

      const data = await response.json();
      const token = data.token; // Assume token is in the response
      const userId = data.user.id; // Get user ID from response
      const userRole = data.user.role; // Get user role from response

      // Save token and user info to local storage
      localStorage.setItem("jwtToken", token);
      localStorage.setItem("userId", userId); // Save user ID
      localStorage.setItem("userRole", userRole); // Save user role

      alert("Login successful! Welcome back!");
      window.location.href = "https://rrq-dev.github.io/jumatberkah.github.io/"; // Redirect to homepage
    } catch (error) {
      console.error("Error during login:", error);
      alert("Login failed: " + error.message);
    }
  });
