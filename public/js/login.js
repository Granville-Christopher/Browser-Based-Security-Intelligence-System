document.addEventListener("DOMContentLoaded", function () {
  const loginForm = document.getElementById("login");
  if (!loginForm) {
    console.error("Login form not found");
    return;
  }

  const pinInput = loginForm.querySelector('input[name="pin"]');

  // Allow only numeric input, max length 8
  pinInput.addEventListener("input", function () {
    this.value = this.value.replace(/[^0-9]/g, "");
    if (this.value.length > 8) {
      this.value = this.value.slice(0, 8);
    }
  });

  loginForm.addEventListener("submit", async function (e) {
    e.preventDefault();
    const pin = pinInput.value;

    if (pin.length < 8) {
      showToast("PIN must be at least 8 digits.", "error");
      return;
    }

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin }),
      });

      const result = await response.json();

      if (response.ok) {
        showToast(result.message || "Login successful!", "success");
        setTimeout(() => {
          window.location.href = "/security/dashboard";
        }, 1000);
      } else {
        showToast(result.message || "Invalid PIN.", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Something went wrong. Please try again.", "error");
    }
  });

  // Toast Function
  function showToast(message, type = "info") {
    const toastContainer = document.getElementById("toast-container");
    const toast = document.createElement("div");

    const bgColor =
      {
        success: "bg-green-600",
        error: "bg-red-600",
        info: "bg-blue-600",
      }[type] || "bg-gray-800";

    toast.className = `text-white px-4 py-3 rounded shadow-md ${bgColor} animate-fadeInOut transition-opacity duration-500`;
    toast.innerText = message;

    toastContainer.appendChild(toast);

    // Auto remove after 3 seconds
    setTimeout(() => {
      toast.classList.add("opacity-0");
      setTimeout(() => toast.remove(), 500);
    }, 3000);
  }
});
