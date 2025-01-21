document.getElementById("register-btn").addEventListener("click", async () => {
  const username = document.getElementById("username-input").value;
  const email = document.getElementById("email-input").value;
  const password = document.getElementById("password-input").value;
  const confirmPassword = document.getElementById(
    "confirm-password-input"
  ).value;

  // Validasi password
  if (password !== confirmPassword) {
    alert("Passwords do not match.");
    return;
  }

  const data = {
    username,
    email,
    password,
    confirmPassword, // Pastikan ini ada
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
      alert(result.message);
      window.location.href = "login.html"; // Redirect to login page
    } else {
      alert(result.message);
    }
  } catch (error) {
    console.error("Error during registration:", error);
    alert("An error occurred. Please try again later.");
  }
});
