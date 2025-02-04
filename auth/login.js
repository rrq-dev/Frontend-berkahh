document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm");
  const signupForm = document.getElementById("signupForm");
  const googleLoginBtn = document.getElementById("google-login-btn");

  // Menangani login dengan Google
  googleLoginBtn.addEventListener("click", () => {
    window.location.href =
      "https://backend-berkah.onrender.com/auth/google/login";
  });

  loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email-input").value;
    const password = document.getElementById("password-input").value;

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

      Swal.fire({
        title: "Login Successful!",
        text: `Welcome back!`,
        icon: "success",
        confirmButtonText: "OK",
      }).then(() => {
        localStorage.setItem("jwtToken", data.token);
        localStorage.setItem("userId", data.user.id);

        if (data.user.role === "admin") {
          window.location.href =
            "https://jumatberkah.vercel.app/admin/admin.html";
        } else {
          window.location.href = "https://jumatberkah.vercel.app/";
        }
      });
    } catch (error) {
      console.error("There was a problem with the fetch operation:", error);
      Swal.fire({
        title: "Login Failed",
        text: error.message,
        icon: "error",
        confirmButtonText: "OK",
      });
    }
  });

  // Handle Google OAuth Callback
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get("token");
  const error = urlParams.get("error");

  if (error) {
    Swal.fire({
      title: "Login Failed",
      text: decodeURIComponent(error),
      icon: "error",
      confirmButtonText: "OK",
    });
  } else if (token) {
    try {
      // Decode token untuk mendapatkan informasi user
      const tokenParts = token.split(".");
      const payload = JSON.parse(atob(tokenParts[1]));

      localStorage.setItem("jwtToken", token);
      localStorage.setItem("userId", payload.user_id);

      Swal.fire({
        title: "Login Successful!",
        text: "Welcome back!",
        icon: "success",
        confirmButtonText: "OK",
      }).then(() => {
        if (payload.role === "admin") {
          window.location.href =
            "https://jumatberkah.vercel.app/admin/admin.html";
        } else {
          window.location.href = "https://jumatberkah.vercel.app/";
        }
      });
    } catch (error) {
      console.error("Error processing token:", error);
      Swal.fire({
        title: "Login Failed",
        text: "Error processing login information",
        icon: "error",
        confirmButtonText: "OK",
      });
    }
  }

  // Registration functionality
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const name = document.getElementById("name-input").value;
    const email = document.getElementById("signup-email-input").value;
    const password = document.getElementById("signup-password-input").value;

    if (!name || !email || !password) {
      Swal.fire({
        title: "Registration Failed",
        text: "All fields are required.",
        icon: "error",
        confirmButtonText: "OK",
      });
      return;
    }

    try {
      const response = await fetch(
        "https://backend-berkah.onrender.com/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name,
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

      Swal.fire({
        title: "Registration Successful!",
        text: `Welcome, ${data.user}! You can now log in.`,
        icon: "success",
        confirmButtonText: "OK",
      }).then(() => {
        window.location.href = "login.html";
      });
    } catch (error) {
      console.error("There was a problem with the fetch operation:", error);
      Swal.fire({
        title: "Registration Failed",
        text: error.message,
        icon: "error",
        confirmButtonText: "OK",
      });
    }
  });
});
