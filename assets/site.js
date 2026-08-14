(() => {
  "use strict";

  const html = document.documentElement;
  const body = document.body;

  const reducedMotion =
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* =========================================================
     YEAR
     ========================================================= */

  document.querySelectorAll("[data-year]").forEach((element) => {
    element.textContent = new Date().getFullYear();
  });

  /* =========================================================
     PRELOADER
     Không chờ window.load.
     Chỉ hiện đầy đủ lần đầu trong session.
     ========================================================= */

  const preloader = document.querySelector(".preloader");

  if (html.classList.contains("preloader-seen")) {
    preloader?.remove();
    body.classList.remove("is-loading");
  } else if (preloader) {
    const startedAt = performance.now();
    let finished = false;

    const finishPreloader = () => {
      if (finished) return;

      finished = true;

      const elapsed = performance.now() - startedAt;

      const minimumVisibleTime = reducedMotion ? 0 : 360;
      const wait = Math.max(0, minimumVisibleTime - elapsed);

      window.setTimeout(() => {
        body.classList.remove("is-loading");

        preloader.classList.add("is-exiting");

        try {
          sessionStorage.setItem("ph-preloader-seen", "1");
        } catch (error) {
          /* Session storage can be disabled. */
        }

        window.setTimeout(() => {
          preloader.remove();
        }, reducedMotion ? 20 : 590);
      }, wait);
    };

    if (document.readyState === "loading") {
      document.addEventListener(
        "DOMContentLoaded",
        finishPreloader,
        { once: true }
      );
    } else {
      finishPreloader();
    }

    /* Absolute fail-safe. */
    window.setTimeout(finishPreloader, 1100);
  } else {
    body.classList.remove("is-loading");
  }

  /* =========================================================
     MOBILE MENU
     ========================================================= */

  const menuToggle = document.querySelector(".menu-toggle");
  const nav = document.querySelector(".nav");

  const closeMenu = () => {
    if (!nav || !menuToggle) return;

    nav.classList.remove("open");
    menuToggle.setAttribute("aria-expanded", "false");
  };

  menuToggle?.addEventListener("click", () => {
    if (!nav) return;

    const isOpen = nav.classList.toggle("open");

    menuToggle.setAttribute(
      "aria-expanded",
      String(isOpen)
    );
  });

  document.querySelectorAll(".nav a").forEach((link) => {
    link.addEventListener("click", closeMenu);
  });

  document.addEventListener("click", (event) => {
    if (!nav || !menuToggle) return;

    if (
      nav.classList.contains("open") &&
      !nav.contains(event.target) &&
      !menuToggle.contains(event.target)
    ) {
      closeMenu();
    }
  });

  /* =========================================================
     ACTIVE NAVIGATION
     ========================================================= */

  const normalizePath = (path) => {
    let value = path || "/";

    value = value.replace(/index\.html$/i, "");

    if (!value.startsWith("/")) {
      value = `/${value}`;
    }

    if (!value.endsWith("/")) {
      value += "/";
    }

    return value;
  };

  const currentPath =
    normalizePath(window.location.pathname);

  document
    .querySelectorAll(".nav-link, .nav-cta")
    .forEach((link) => {
      const linkURL =
        new URL(
          link.getAttribute("href"),
          window.location.origin
        );

      if (linkURL.origin !== window.location.origin) {
        return;
      }

      const linkPath =
        normalizePath(linkURL.pathname);

      let active = false;

      if (linkPath === "/") {
        active = currentPath === "/";
      } else {
        active =
          currentPath === linkPath ||
          currentPath.startsWith(linkPath);
      }

      if (active) {
        link.classList.add("active");
        link.setAttribute("aria-current", "page");
      }
    });

  /* =========================================================
     HEADER + SCROLL PROGRESS
     ========================================================= */

  const header =
    document.querySelector(".site-header");

  const scrollProgress =
    document.querySelector(".scroll-progress");

  let scrollFrameRequested = false;

  const updateScrollUI = () => {
    const scrollTop = window.scrollY;

    const documentHeight =
      document.documentElement.scrollHeight -
      window.innerHeight;

    header?.classList.toggle(
      "scrolled",
      scrollTop > 24
    );

    if (scrollProgress) {
      const ratio =
        documentHeight > 0
          ? Math.min(
              Math.max(scrollTop / documentHeight, 0),
              1
            )
          : 0;

      scrollProgress.style.transform =
        `scaleX(${ratio})`;
    }

    scrollFrameRequested = false;
  };

  window.addEventListener(
    "scroll",
    () => {
      if (scrollFrameRequested) return;

      scrollFrameRequested = true;

      window.requestAnimationFrame(updateScrollUI);
    },
    { passive: true }
  );

  updateScrollUI();

  /* =========================================================
     SMOOTH IN-PAGE ANCHORS
     ========================================================= */

  document
    .querySelectorAll('a[href^="#"]')
    .forEach((link) => {
      link.addEventListener("click", (event) => {
        const selector =
          link.getAttribute("href");

        if (
          !selector ||
          selector === "#" ||
          !document.querySelector(selector)
        ) {
          return;
        }

        event.preventDefault();

        const target =
          document.querySelector(selector);

        const offset =
          window.innerWidth <= 980
            ? 78
            : 76;

        const top =
          target.getBoundingClientRect().top +
          window.scrollY -
          offset;

        window.scrollTo({
          top: Math.max(0, top),
          behavior:
            reducedMotion
              ? "auto"
              : "smooth"
        });

        closeMenu();
      });
    });

  /* =========================================================
     GA4
     Hiện để trống vì bạn chưa tạo Measurement ID.
     Khi có ID, gửi cho mình rồi mình sẽ viết lại nguyên file.
     ========================================================= */

  const GA4_ID = "";

  if (GA4_ID) {
    const script =
      document.createElement("script");

    script.async = true;

    script.src =
      `https://www.googletagmanager.com/gtag/js?id=${GA4_ID}`;

    document.head.appendChild(script);

    window.dataLayer =
      window.dataLayer || [];

    window.gtag = function () {
      window.dataLayer.push(arguments);
    };

    window.gtag("js", new Date());

    window.gtag(
      "config",
      GA4_ID,
      {
        anonymize_ip: true
      }
    );
  }

  const track = (
    eventName,
    parameters = {}
  ) => {
    if (
      typeof window.gtag === "function"
    ) {
      window.gtag(
        "event",
        eventName,
        parameters
      );
    }
  };

  document
    .querySelectorAll('a[href^="tel:"]')
    .forEach((link) => {
      link.addEventListener("click", () => {
        track("click_phone", {
          phone:
            link
              .getAttribute("href")
              .replace("tel:", "")
        });
      });
    });

  document
    .querySelectorAll('a[href^="mailto:"]')
    .forEach((link) => {
      link.addEventListener("click", () => {
        track("click_email");
      });
    });

  document
    .querySelectorAll("[data-map]")
    .forEach((link) => {
      link.addEventListener("click", () => {
        track(
          "click_google_maps",
          {
            location:
              link.dataset.map || ""
          }
        );
      });
    });

  document
    .querySelectorAll("[data-project]")
    .forEach((link) => {
      link.addEventListener("click", () => {
        track(
          "click_project",
          {
            project:
              link.dataset.project || ""
          }
        );
      });
    });

  document
    .querySelectorAll("form")
    .forEach((form) => {
      form.addEventListener("submit", () => {
        track(
          "form_submit",
          {
            form_name:
              form.getAttribute("name") ||
              "contact"
          }
        );
      });
    });
})();