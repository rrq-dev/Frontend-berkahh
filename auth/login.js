async function loginUser(email, password) {
  try {
    const response = await fetch("https://backend-berkah.onrender.com/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Login Error:", errorText);
      throw new Error("Login failed. Please check your credentials.");
    }

    const result = await response.json();

    // Simpan token dan role di localStorage
    localStorage.setItem("jwtToken", result.token);
    localStorage.setItem("userRole", result.user.role);

    alert("Login successful!");
    // Redirect to the desired page after successful login
    window.location.href = "https://rrq-dev.github.io/jumatberkah.github.io/"; // Ganti dengan URL yang sesuai
  } catch (error) {
    console.error("Error during login:", error);
    alert(error.message);
  }
}

// Event listener untuk tombol login
document.getElementById("login-btn").addEventListener("click", () => {
  const email = document.getElementById("email-input").value;
  const password = document.getElementById("password-input").value;

  if (email && password) {
    loginUser(email, password);
  } else {
    alert("Please enter both email and password.");
  }
});
