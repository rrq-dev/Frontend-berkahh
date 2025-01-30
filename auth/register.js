const registerForm = document.getElementById("registerForm");

registerForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const username = document.getElementById("username-input").value;
  const email = document.getElementById("email-input").value;
  const password = document.getElementById("password-input").value;
  const confirmPassword = document.getElementById(
    "confirm-password-input"
  ).value;

  // Validate input fields
  if (!username || !email || !password || !confirmPassword) {
    Swal.fire({
      title: "Registration Failed",
      text: "All fields are required.",
      icon: "error",
      confirmButtonText: "OK",
    });
    return;
  }

  // Validate password confirmation
  if (password !== confirmPassword) {
    Swal.fire({
      title: "Registration Failed",
      text: "Passwords do not match.",
      icon: "error",
      confirmButtonText: "OK",
    });
    return;
  }

  // Send data to backend
  try {
    const response = await fetch(
      "https://backend-berkah.onrender.com/register",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          email,
          password,
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Registration failed");
    }

    const data = await response.json();
    // Use SweetAlert for success notification
    Swal.fire({
      title: "Registration Successful!",
      text: `Welcome, ${data.user.username}!`,
      icon: "success",
      confirmButtonText: "OK",
    }).then(() => {
      localStorage.setItem("jwtToken", data.token); // Save token
      localStorage.setItem("userId", data.userId);
      // Redirect to user home page
      window.location.href = "login.html"; // Redirect to login page
    });
  } catch (error) {
    console.error("There was a problem with the fetch operation:", error);
    // Use SweetAlert for error notification
    Swal.fire({
      title: "Registration Failed",
      text: error.message,
      icon: "error",
      confirmButtonText: "OK",
    });
  }
});
