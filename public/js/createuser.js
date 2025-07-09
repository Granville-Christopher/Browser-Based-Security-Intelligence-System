document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("authenticateUserForm");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const submitBtn = form.querySelector("button[type='submit']");
    const originalText = submitBtn.textContent;

    submitBtn.textContent = "Authenticating...";
    submitBtn.disabled = true;

    const formData = new FormData(form);
    const payload = Object.fromEntries(formData.entries());

    try {
      const response = await fetch("/api/admin/create-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "CSRF-Token": payload._csrf, // Send CSRF token in header
        },
        body: JSON.stringify({
          userId: payload.userId,
          pin: payload.pin,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        showToast(data.message || "User created!", "success");
        form.reset();
      } else {
        showToast(data.message || "Failed to create user.", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Network error occurred.", "error");
    } finally {
      submitBtn.textContent = originalText;
      submitBtn.disabled = false;
    }
  });

  function showToast(msg, type = "info") {
    const toast = document.createElement("div");
    toast.textContent = msg;
    toast.className =
      "toast px-4 py-2 rounded fixed top-4 right-4 z-50 text-white " +
      {
        success: "bg-green-600",
        error: "bg-red-600",
        info: "bg-blue-600",
      }[type];

    document.body.appendChild(toast);
    setTimeout(() => {
      toast.remove();
    }, 3000);
  }
});
