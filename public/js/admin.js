document.addEventListener("DOMContentLoaded", () => {
  const signupForm = document.querySelector('form[action="/admin/signup"]');

  signupForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = signupForm.email.value.trim();
    const password = signupForm.password.value.trim();
    const confirmPassword = signupForm.confirm_password.value.trim();

    // Basic validation
    if (!email || !password || !confirmPassword) {
      showToast("All fields are required", "error");
      return;
    }

    if (password !== confirmPassword) {
      showToast("Passwords do not match", "error");
      return;
    }

    try {
      const res = await fetch("/api/admin/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const result = await res.json();

      if (res.ok) {
        showToast(result.message || "Sign up successful!", "success");
        signupForm.reset();
        setTimeout(() => {
          window.location.href = "/api/admin/admin";
        }, 1000);
      } else {
        showToast(result.message || "Sign up failed", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Server error", "error");
    }
  });

  function showToast(message, type = "info") {
    const toastContainer =
      document.getElementById("toast-container") || createToastContainer();
    const toast = document.createElement("div");

    const bg =
      {
        success: "bg-green-600",
        error: "bg-red-600",
        info: "bg-blue-600",
      }[type] || "bg-gray-800";

    toast.className = `text-white px-4 py-3 rounded shadow-md ${bg} animate-fadeInOut transition-opacity duration-500`;
    toast.innerText = message;
    toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.classList.add("opacity-0");
      setTimeout(() => toast.remove(), 500);
    }, 3000);
  }

  function createToastContainer() {
    const div = document.createElement("div");
    div.id = "toast-container";
    div.className = "fixed top-6 right-6 z-50 space-y-2";
    document.body.appendChild(div);
    return div;
  }

  
});

function toggleVisibility(inputId, iconElement) {
    const input = document.getElementById(inputId);
    if (input.type === "password") {
      input.type = "text";
      iconElement.textContent = "🙈"; // eye-off emoji
    } else {
      input.type = "password";
      iconElement.textContent = "👁️"; // eye emoji
    }
  }