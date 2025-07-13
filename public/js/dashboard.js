function saveSettings() {
  const email = document.getElementById("notificationEmail").value;
  const sensitivity = document.getElementById("alertSensitivity").value;
  const notifications = document.getElementById("enableNotifications").checked;
  const timezone = document.getElementById("timezone").value;
  const autoUpdate = document.getElementById("autoUpdate").checked;
  const dailySummary = document.getElementById("dailySummary").checked;

  const settings = {
    email,
    sensitivity,
    notifications,
    timezone,
    autoUpdate,
    dailySummary,
  };

  localStorage.setItem("systemSettings", JSON.stringify(settings));

  const confirmEl = document.getElementById("saveConfirmation");
  confirmEl.classList.remove("hidden");
  confirmEl.style.opacity = 1;
  setTimeout(() => {
    confirmEl.style.opacity = 0;
    setTimeout(() => confirmEl.classList.add("hidden"), 500);
  }, 2000);
}

function loadSettings() {
  const saved = JSON.parse(localStorage.getItem("systemSettings"));
  if (!saved) return;

  document.getElementById("notificationEmail").value = saved.email || "";
  document.getElementById("alertSensitivity").value =
    saved.sensitivity || "Medium";
  document.getElementById("enableNotifications").checked =
    !!saved.notifications;
  document.getElementById("timezone").value = saved.timezone || "UTC";
  document.getElementById("autoUpdate").checked = !!saved.autoUpdate;
  document.getElementById("dailySummary").checked = !!saved.dailySummary;
}

function showSection(sectionId) {
  localStorage.setItem("activeSection", sectionId);
  const current = document.querySelector(".section:not(.hidden)");
  const next = document.getElementById(sectionId);

  // Always close sidebar and show main content on small screens when a sidebar item is clicked
  if (window.innerWidth < 768) {
    const sidebar = document.getElementById("sidebar");
    const mainContent = document.getElementById("mainContent");
    sidebar.classList.add("hidden");
    mainContent.classList.remove("hidden");
  }

  if (current === next) return;

  if (current) {
    current.classList.remove("show");
    setTimeout(() => {
      current.classList.add("hidden");
      next.classList.remove("hidden");
      setTimeout(() => next.classList.add("show"), 10);
    }, 400);
  } else {
    next.classList.remove("hidden");
    setTimeout(() => next.classList.add("show"), 10);
  }
}

function toggleDarkMode() {
  document.body.classList.toggle("dark");
  const isDark = document.body.classList.contains("dark");
  localStorage.setItem("theme", isDark ? "dark" : "light");
}

function applySavedTheme() {
  const theme = localStorage.getItem("theme");
  if (theme === "dark") {
    document.body.classList.add("dark");
  }
}

function setupSidebarToggle() {
  const hamburgerMenu = document.getElementById("hamburgerMenu");
  const sidebar = document.getElementById("sidebar");
  const mainContent = document.getElementById("mainContent");

  function showSidebar() {
    sidebar.classList.remove("hidden");
    mainContent.classList.add("hidden");
  }

  function hideSidebar() {
    sidebar.classList.add("hidden");
    mainContent.classList.remove("hidden");
  }

  hamburgerMenu.addEventListener("click", () => {
    if (sidebar.classList.contains("hidden")) {
      showSidebar();
    } else {
      hideSidebar();
    }
  });

  // Hide sidebar on resize to medium and up, show main content
  window.addEventListener("resize", () => {
    if (window.innerWidth >= 768) {
      sidebar.classList.remove("hidden");
      mainContent.classList.remove("hidden");
    } else {
      hideSidebar();
    }
  });

  // Initialize sidebar state based on window size
  if (window.innerWidth < 768) {
    hideSidebar();
  } else {
    sidebar.classList.remove("hidden");
    mainContent.classList.remove("hidden");
  }
}

applySavedTheme();
loadSettings();
const savedSection = localStorage.getItem("activeSection") || "dashboard";
showSection(savedSection);
lucide.createIcons();
setupSidebarToggle();
