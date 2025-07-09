document.addEventListener("DOMContentLoaded", () => {
  const blockBtn = document.getElementById("blockAccessBtn");
  const grantBtn = document.getElementById("grantAccessBtn");
  const deleteBtn = document.getElementById("deleteUserBtn");
  const csrfToken = document
    .querySelector('meta[name="csrf-token"]')
    ?.getAttribute("content");
  const userSection = document.getElementById("user-section");
  const userId = userSection?.getAttribute("data-user-id");

  const showToast = (msg, type = "info") => {
    const container = document.getElementById("toast-container");
    if (!container) return;

    const toast = document.createElement("div");

    toast.className = `text-white px-4 py-3 rounded shadow-md transition-opacity duration-300 ${
      type === "success"
        ? "bg-green-600"
        : type === "error"
        ? "bg-red-600"
        : "bg-gray-800"
    }`;
    toast.innerText = msg;

    container.appendChild(toast);
    setTimeout(() => {
      toast.classList.add("opacity-0");
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  };

  const sendRequest = async (action, clickedBtn) => {
    if (!csrfToken) {
      showToast("CSRF token is missing", "error");
      return;
    }
    if (!userId) {
      showToast("User ID is missing", "error");
      return;
    }

    // Disable only clicked button
    const originalText = clickedBtn.textContent;
    clickedBtn.textContent = "Processing...";
    clickedBtn.disabled = true;

    // Dim section
    userSection.classList.add("opacity-50", "pointer-events-none");

    try {
      const res = await fetch(`/api/admin/user/${userId}/${action}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "CSRF-Token": csrfToken,
        },
      });

      const data = await res.json();

      if (res.ok) {
        showToast(data.message, "success");
        setTimeout(() => {
          window.location.href = "/api/admin/viewusers";
        }, 1500);
      } else {
        showToast(data.message || "Something went wrong.", "error");
        resetUI(clickedBtn, originalText);
      }
    } catch (err) {
      console.error(err);
      showToast("Something went wrong", "error");
      resetUI(clickedBtn, originalText);
    }
  };

  const resetUI = (btn, originalText) => {
    btn.textContent = originalText;
    btn.disabled = false;
    userSection.classList.remove("opacity-50", "pointer-events-none");
  };

  blockBtn.addEventListener("click", () => sendRequest("block", blockBtn));
  grantBtn.addEventListener("click", () => sendRequest("grant", grantBtn));
  deleteBtn.addEventListener("click", () => {
    if (confirm("Are you sure you want to delete this user?")) {
      sendRequest("delete", deleteBtn);
    }
  });
});
