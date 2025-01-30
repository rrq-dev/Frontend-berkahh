document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm");

  loginForm.addEventListener("submit", async (event) => {
    event.preventDefault(); // Prevent default form submission

    const email = document.getElementById("email-input").value;
    const password = document.getElementById("password-input").value;

    // Validate input fields
    if (!email || !password) {
      Swal.fire({
        title: "Login Failed",
        text: "Email and password are required.",
        icon: "error",
        confirmButtonText: "OK",
      });
      return;
    }

    try {
      const response = await fetch(
        "https://backend-berkah.onrender.com/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            password,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Login failed");
      }

      const data = await response.json();
      // Use SweetAlert for success notification
      Swal.fire({
        title: "Login Successful!",
        text: `Welcome back!`,
        icon: "success",
        confirmButtonText: "OK",
      }).then(() => {
        localStorage.setItem("jwtToken", data.token); // Save token
        localStorage.setItem("userId", data.user.id); // Save user ID

        // Check user role and redirect accordingly
        if (data.user.role === "admin") {
          window.location.href =
            "https://rrq-dev.github.io/jumatberkah.github.io/admin/admin.html"; // Redirect to admin dashboard
        } else {
          window.location.href =
            "https://rrq-dev.github.io/jumatberkah.github.io/"; // Redirect to main page
        }
      });
    } catch (error) {
      console.error("There was a problem with the fetch operation:", error);
      // Use SweetAlert for error notification
      Swal.fire({
        title: "Login Failed",
        text: error.message,
        icon: "error",
        confirmButtonText: "OK",
      });
    }
  });
});
