document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.querySelector("form");
  const passwordInput = loginForm.querySelector('input[name="password"]');

  const toggleBtn = document.createElement("span");
  toggleBtn.innerHTML = "👁️";
  toggleBtn.style.cursor = "pointer";
  toggleBtn.style.position = "absolute";
  toggleBtn.style.right = "1rem";
  toggleBtn.style.top = "50%";
  toggleBtn.style.transform = "translateY(-50%)";
  toggleBtn.style.fontSize = "1.2rem";

  const wrapper = document.createElement("div");
  wrapper.style.position = "relative";
  passwordInput.parentNode.insertBefore(wrapper, passwordInput);
  wrapper.appendChild(passwordInput);
  wrapper.appendChild(toggleBtn);

  toggleBtn.addEventListener("click", () => {
    passwordInput.type =
      passwordInput.type === "password" ? "text" : "password";
    toggleBtn.textContent = passwordInput.type === "password" ? "👁️" : "🙈";
  });

  function showToast(message, type = "info") {
    const toast = document.createElement("div");
    toast.textContent = message;
    toast.className = `fixed bottom-5 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded shadow-lg text-white z-50 transition duration-300 ease-in-out text-lg ${
      type === "success"
        ? "bg-green-600"
        : type === "error"
        ? "bg-red-600"
        : "bg-blue-600"
    }`;

    document.body.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transform += " translateY(20px)";
    }, 3000);
    setTimeout(() => toast.remove(), 3600);
  }

  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = loginForm.email.value.trim();
    const password = loginForm.password.value.trim();

    if (!email || !password) {
      return showToast("Please fill in all fields", "error");
    }

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const result = await res.json();

      if (res.ok) {
        showToast(result.message || "Login successful!", "success");
        setTimeout(() => {
          window.location.href = "/api/admin/admin";
        }, 1000);
      } else {
        showToast(result.message || "Login failed", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Server error occurred", "error");
    }
  });
});
