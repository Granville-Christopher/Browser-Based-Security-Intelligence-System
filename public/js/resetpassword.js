document.addEventListener("DOMContentLoaded", function () {
  const getOtpForm = document.getElementById("get-otp-form");
  const resetPasswordForm = document.getElementById("reset-password-form");
  const getOtpButton = getOtpForm.querySelector("button[type='submit']");
  const resetButton = resetPasswordForm.querySelector("button[type='submit']");
  const csrfToken = document
    .querySelector('meta[name="csrf-token"]')
    ?.getAttribute("content");

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

    setTimeout(() => {
      toast.classList.add("opacity-0");
      setTimeout(() => toast.remove(), 500);
    }, 3000);
  }

  // Toggle visibility for password fields with icons
  window.togglePasswordVisibility = function (inputId) {
    const input = document.getElementById(inputId);
    const toggleBtn = event.currentTarget;

    const isPassword = input.type === "password";
    input.type = isPassword ? "text" : "password";
    toggleBtn.innerHTML = isPassword ? "🙈" : "👁️";
  };

  // Handle Get OTP form submission
  getOtpForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = getOtpForm.email.value.trim();

    if (!email) {
      showToast("Please enter your email.", "error");
      return;
    }

    // Disable button and show "Please wait..."
    getOtpButton.disabled = true;
    getOtpButton.textContent = "Please wait...";

    try {
      const response = await fetch("/api/admin/get-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "CSRF-Token": csrfToken,
        },
        credentials: "include",
        body: JSON.stringify({ email }),
      });

      const result = await response.json();

      if (response.ok) {
        showToast(result.message || "OTP sent to your email.", "success");
      } else {
        showToast(result.message || "Failed to send OTP.", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Something went wrong. Please try again.", "error");
    } finally {
      getOtpButton.disabled = false;
      getOtpButton.textContent = "Get OTP";
    }
  });

  // Handle Reset Password form submission
  resetPasswordForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = resetPasswordForm.email.value.trim();
    const otp = resetPasswordForm.otp.value.trim();
    const newPassword = resetPasswordForm.new_password.value;
    const confirmNewPassword = resetPasswordForm.confirm_new_password.value;

    if (!email || !otp || !newPassword || !confirmNewPassword) {
      showToast("Please fill in all fields.", "error");
      return;
    }

    if (newPassword !== confirmNewPassword) {
      showToast("Passwords do not match.", "error");
      return;
    }

    // Disable button and show "Authenticating..."
    resetButton.disabled = true;
    resetButton.textContent = "Authenticating...";

    try {
      const response = await fetch("/api/admin/resetpassword", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "CSRF-Token": csrfToken,
        },
        credentials: "include",
        body: JSON.stringify({ email, otp, newPassword }),
      });

      const result = await response.json();

      if (response.ok) {
        showToast(result.message || "Password reset successful.", "success");
        resetPasswordForm.reset();
        window.location.href = "/api/admin/login";
      } else {
        showToast(result.message || "Failed to reset password.", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Something went wrong. Please try again.", "error");
    } finally {
      resetButton.disabled = false;
      resetButton.textContent = "Reset Password";
    }
  });
});
