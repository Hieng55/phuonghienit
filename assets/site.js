(() => {
  "use strict";

  // Điền Measurement ID sau khi tạo GA4.
  // Ví dụ: const GA4_ID = "G-ABC1234567";
  const GA4_ID = "";

  if (GA4_ID) {
    const script = document.createElement("script");
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA4_ID}`;
    document.head.appendChild(script);

    window.dataLayer = window.dataLayer || [];
    window.gtag = function () {
      window.dataLayer.push(arguments);
    };

    window.gtag("js", new Date());
    window.gtag("config", GA4_ID);
  }

  const track = (eventName, params = {}) => {
    if (typeof window.gtag === "function") {
      window.gtag("event", eventName, params);
    }
  };

  document.querySelectorAll('a[href^="tel:"]').forEach((el) => {
    el.addEventListener("click", () => {
      track("click_phone", {
        phone: el.getAttribute("href").replace("tel:", "")
      });
    });
  });

  document.querySelectorAll('a[href^="mailto:"]').forEach((el) => {
    el.addEventListener("click", () => {
      track("click_email");
    });
  });

  document.querySelectorAll("[data-map]").forEach((el) => {
    el.addEventListener("click", () => {
      track("click_google_maps", {
        location: el.dataset.map
      });
    });
  });

  document.querySelectorAll("[data-project]").forEach((el) => {
    el.addEventListener("click", () => {
      track("click_project", {
        project: el.dataset.project
      });
    });
  });

  document.querySelectorAll("form").forEach((form) => {
    form.addEventListener("submit", () => {
      track("form_submit", {
        form_name: form.getAttribute("name") || "contact"
      });
    });
  });

  const menuButton = document.querySelector(".menu-button");
  const nav = document.querySelector(".nav");

  if (menuButton && nav) {
    menuButton.addEventListener("click", () => {
      nav.classList.toggle("open");
      menuButton.setAttribute(
        "aria-expanded",
        nav.classList.contains("open") ? "true" : "false"
      );
    });
  }

  const year = document.querySelector("[data-year]");
  if (year) year.textContent = new Date().getFullYear();
})();