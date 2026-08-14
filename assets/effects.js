(() => {
  "use strict";

  const reducedMotion =
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (reducedMotion) {
    return;
  }

  const body = document.body;

  const effectMode =
    body.dataset.effects || "motion";

  /* =========================================================
     SCRIPT LOADER
     ========================================================= */

  const loadScript = (
    src,
    globalName = ""
  ) => {
    return new Promise(
      (resolve, reject) => {
        if (
          globalName &&
          window[globalName]
        ) {
          resolve();
          return;
        }

        const existing =
          document.querySelector(
            `script[src="${src}"]`
          );

        if (existing) {
          existing.addEventListener(
            "load",
            resolve,
            { once: true }
          );

          existing.addEventListener(
            "error",
            reject,
            { once: true }
          );

          return;
        }

        const script =
          document.createElement("script");

        script.src = src;
        script.async = true;

        script.onload = resolve;
        script.onerror = reject;

        document.head.appendChild(script);
      }
    );
  };

  /* =========================================================
     GSAP
     ========================================================= */

  const initGSAP = () => {
    if (
      typeof window.gsap === "undefined"
    ) {
      return;
    }

    const gsap = window.gsap;

    if (
      typeof window.ScrollTrigger !==
      "undefined"
    ) {
      gsap.registerPlugin(
        window.ScrollTrigger
      );
    }

    /* Hero entrance */
    gsap.from(
      ".hero .availability, .page-hero .availability",
      {
        y: 15,
        opacity: 0,
        duration: 0.55,
        ease: "power2.out"
      }
    );

    gsap.from(
      ".hero-title .line-inner",
      {
        y: 55,
        opacity: 0,
        duration: 0.9,
        stagger: 0.09,
        ease: "power4.out"
      }
    );

    gsap.from(
      ".hero-description, .hero-meta, .hero .actions, .page-hero .actions",
      {
        y: 24,
        opacity: 0,
        duration: 0.72,
        stagger: 0.08,
        delay: 0.15,
        ease: "power3.out"
      }
    );

    gsap.from(
      ".hero-visual",
      {
        y: 25,
        scale: 0.96,
        opacity: 0,
        duration: 0.95,
        delay: 0.08,
        ease: "power3.out"
      }
    );

    if (
      typeof window.ScrollTrigger !==
      "undefined"
    ) {
      document
        .querySelectorAll(
          ".reveal"
        )
        .forEach((element) => {
          gsap.from(
            element,
            {
              y: 42,
              opacity: 0,
              duration: 0.8,
              ease: "power3.out",
              scrollTrigger: {
                trigger: element,
                start: "top 88%",
                once: true
              }
            }
          );
        });

      document
        .querySelectorAll(
          ".reveal-card"
        )
        .forEach(
          (element, index) => {
            gsap.from(
              element,
              {
                y: 55,
                opacity: 0,
                scale: 0.98,
                duration: 0.82,
                delay:
                  (index % 4) * 0.035,
                ease: "power3.out",
                scrollTrigger: {
                  trigger: element,
                  start: "top 90%",
                  once: true
                }
              }
            );
          }
        );
    }

    /* Desktop pointer effects only */
    const desktopPointer =
      window.innerWidth >= 1100 &&
      window.matchMedia(
        "(pointer: fine)"
      ).matches;

    if (desktopPointer) {
      const cursor =
        document.querySelector(
          ".cursor"
        );

      const cursorDot =
        document.querySelector(
          ".cursor-dot"
        );

      if (cursor && cursorDot) {
        const ringX =
          gsap.quickTo(
            cursor,
            "x",
            {
              duration: 0.22,
              ease: "power3.out"
            }
          );

        const ringY =
          gsap.quickTo(
            cursor,
            "y",
            {
              duration: 0.22,
              ease: "power3.out"
            }
          );

        const dotX =
          gsap.quickSetter(
            cursorDot,
            "x",
            "px"
          );

        const dotY =
          gsap.quickSetter(
            cursorDot,
            "y",
            "px"
          );

        window.addEventListener(
          "mousemove",
          (event) => {
            dotX(event.clientX);
            dotY(event.clientY);

            ringX(event.clientX);
            ringY(event.clientY);
          },
          { passive: true }
        );

        document
          .querySelectorAll(
            "a, button, .tilt-card"
          )
          .forEach((element) => {
            element.addEventListener(
              "mouseenter",
              () => {
                cursor.classList.add(
                  "active"
                );
              }
            );

            element.addEventListener(
              "mouseleave",
              () => {
                cursor.classList.remove(
                  "active"
                );
              }
            );
          });
      }

      document
        .querySelectorAll(
          ".magnetic"
        )
        .forEach((element) => {
          element.addEventListener(
            "mousemove",
            (event) => {
              const rect =
                element.getBoundingClientRect();

              const x =
                event.clientX -
                rect.left -
                rect.width / 2;

              const y =
                event.clientY -
                rect.top -
                rect.height / 2;

              gsap.to(
                element,
                {
                  x: x * 0.11,
                  y: y * 0.11,
                  duration: 0.3,
                  ease: "power2.out"
                }
              );
            }
          );

          element.addEventListener(
            "mouseleave",
            () => {
              gsap.to(
                element,
                {
                  x: 0,
                  y: 0,
                  duration: 0.55,
                  ease:
                    "elastic.out(1, 0.5)"
                }
              );
            }
          );
        });

      document
        .querySelectorAll(
          ".tilt-card"
        )
        .forEach((card) => {
          card.addEventListener(
            "mousemove",
            (event) => {
              const rect =
                card.getBoundingClientRect();

              const x =
                (
                  event.clientX -
                  rect.left
                ) /
                  rect.width -
                0.5;

              const y =
                (
                  event.clientY -
                  rect.top
                ) /
                  rect.height -
                0.5;

              gsap.to(
                card,
                {
                  rotateY: x * 5,
                  rotateX: y * -5,
                  transformPerspective:
                    1100,
                  duration: 0.4,
                  ease: "power2.out"
                }
              );
            }
          );

          card.addEventListener(
            "mouseleave",
            () => {
              gsap.to(
                card,
                {
                  rotateY: 0,
                  rotateX: 0,
                  duration: 0.65,
                  ease:
                    "elastic.out(1, 0.55)"
                }
              );
            }
          );
        });
    }
  };

  const loadGSAP = async () => {
    try {
      await loadScript(
        "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js",
        "gsap"
      );

      await loadScript(
        "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js",
        "ScrollTrigger"
      );

      initGSAP();
    } catch (error) {
      console.warn(
        "GSAP effects were skipped.",
        error
      );
    }
  };

  /* Start GSAP early, but it never blocks HTML rendering. */
  window.setTimeout(
    loadGSAP,
    60
  );

  /* =========================================================
     THREE.JS
     Only body[data-effects="full"] loads it.
     ========================================================= */

  const initThree = () => {
    if (
      effectMode !== "full" ||
      typeof window.THREE ===
        "undefined"
    ) {
      return;
    }

    const canvas =
      document.getElementById(
        "webgl"
      );

    if (!canvas) return;

    const connection =
      navigator.connection ||
      navigator.mozConnection ||
      navigator.webkitConnection;

    if (connection?.saveData) {
      return;
    }

    const THREE = window.THREE;

    const scene =
      new THREE.Scene();

    const camera =
      new THREE.PerspectiveCamera(
        60,
        window.innerWidth /
          window.innerHeight,
        0.1,
        100
      );

    camera.position.z = 7;

    const renderer =
      new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: false,
        powerPreference:
          "high-performance"
      });

    const isMobile =
      window.innerWidth < 700;

    const lowMemory =
      navigator.deviceMemory &&
      navigator.deviceMemory <= 2;

    renderer.setPixelRatio(
      Math.min(
        window.devicePixelRatio,
        isMobile ? 1 : 1.2
      )
    );

    renderer.setSize(
      window.innerWidth,
      window.innerHeight
    );

    const group =
      new THREE.Group();

    scene.add(group);

    let count;

    if (lowMemory) {
      count = 140;
    } else if (isMobile) {
      count = 220;
    } else {
      count = 760;
    }

    const positions =
      new Float32Array(
        count * 3
      );

    const colors =
      new Float32Array(
        count * 3
      );

    const colorA =
      new THREE.Color(
        "#7c5cff"
      );

    const colorB =
      new THREE.Color(
        "#20d9ff"
      );

    const colorC =
      new THREE.Color(
        "#83ffcb"
      );

    for (
      let index = 0;
      index < count;
      index += 1
    ) {
      const radius =
        2.2 +
        Math.random() * 2.8;

      const theta =
        Math.random() *
        Math.PI *
        2;

      const phi =
        Math.acos(
          2 * Math.random() - 1
        );

      positions[index * 3] =
        radius *
        Math.sin(phi) *
        Math.cos(theta);

      positions[index * 3 + 1] =
        radius *
        Math.sin(phi) *
        Math.sin(theta);

      positions[index * 3 + 2] =
        radius *
        Math.cos(phi);

      const targetColor =
        Math.random() > 0.5
          ? colorB
          : colorC;

      const mixed =
        colorA
          .clone()
          .lerp(
            targetColor,
            Math.random()
          );

      colors[index * 3] =
        mixed.r;

      colors[index * 3 + 1] =
        mixed.g;

      colors[index * 3 + 2] =
        mixed.b;
    }

    const geometry =
      new THREE.BufferGeometry();

    geometry.setAttribute(
      "position",
      new THREE.BufferAttribute(
        positions,
        3
      )
    );

    geometry.setAttribute(
      "color",
      new THREE.BufferAttribute(
        colors,
        3
      )
    );

    const material =
      new THREE.PointsMaterial({
        size:
          isMobile
            ? 0.026
            : 0.032,
        vertexColors: true,
        transparent: true,
        opacity: 0.64,
        blending:
          THREE.AdditiveBlending,
        depthWrite: false
      });

    const particles =
      new THREE.Points(
        geometry,
        material
      );

    group.add(particles);

    if (!lowMemory) {
      const wireGeometry =
        new THREE.IcosahedronGeometry(
          2.35,
          1
        );

      const wireMaterial =
        new THREE.MeshBasicMaterial({
          color: 0x7c5cff,
          wireframe: true,
          transparent: true,
          opacity: 0.032
        });

      const wire =
        new THREE.Mesh(
          wireGeometry,
          wireMaterial
        );

      group.add(wire);

      wire.userData.isWire = true;
    }

    const mouse = {
      x: 0,
      y: 0
    };

    if (
      window.matchMedia(
        "(pointer: fine)"
      ).matches
    ) {
      window.addEventListener(
        "pointermove",
        (event) => {
          mouse.x =
            (
              event.clientX /
              window.innerWidth -
              0.5
            ) *
            2;

          mouse.y =
            (
              event.clientY /
              window.innerHeight -
              0.5
            ) *
            2;
        },
        { passive: true }
      );
    }

    const clock =
      new THREE.Clock();

    const frameInterval =
      1000 / 30;

    let lastFrameTime = 0;

    const animate = (
      currentTime = 0
    ) => {
      window.requestAnimationFrame(
        animate
      );

      if (
        document.hidden ||
        currentTime -
          lastFrameTime <
          frameInterval
      ) {
        return;
      }

      lastFrameTime =
        currentTime;

      const time =
        clock.getElapsedTime();

      particles.rotation.y =
        time * 0.018;

      particles.rotation.x =
        Math.sin(
          time * 0.14
        ) * 0.052;

      const wire =
        group.children.find(
          (item) =>
            item.userData.isWire
        );

      if (wire) {
        wire.rotation.y =
          -time * 0.024;

        wire.rotation.z =
          time * 0.014;
      }

      group.rotation.y +=
        (
          mouse.x * 0.1 -
          group.rotation.y
        ) *
        0.018;

      group.rotation.x +=
        (
          -mouse.y * 0.07 -
          group.rotation.x
        ) *
        0.018;

      const maxScroll =
        Math.max(
          document
            .documentElement
            .scrollHeight -
            window.innerHeight,
          1
        );

      const scrollRatio =
        window.scrollY /
        maxScroll;

      group.position.y =
        scrollRatio * 1.1 -
        0.3;

      group.position.x =
        Math.sin(
          scrollRatio *
            Math.PI *
            2
        ) *
        0.26;

      renderer.render(
        scene,
        camera
      );
    };

    canvas.classList.add(
      "ready"
    );

    window.requestAnimationFrame(
      animate
    );

    let resizeTimer = null;

    window.addEventListener(
      "resize",
      () => {
        window.clearTimeout(
          resizeTimer
        );

        resizeTimer =
          window.setTimeout(
            () => {
              camera.aspect =
                window.innerWidth /
                window.innerHeight;

              camera.updateProjectionMatrix();

              renderer.setSize(
                window.innerWidth,
                window.innerHeight
              );

              renderer.setPixelRatio(
                Math.min(
                  window.devicePixelRatio,
                  window.innerWidth <
                    700
                    ? 1
                    : 1.2
                )
              );
            },
            130
          );
      }
    );
  };

  const loadThree = async () => {
    if (effectMode !== "full") {
      return;
    }

    try {
      await loadScript(
        "https://cdn.jsdelivr.net/npm/three@0.161.0/build/three.min.js",
        "THREE"
      );

      initThree();
    } catch (error) {
      console.warn(
        "Three.js background was skipped.",
        error
      );
    }
  };

  const runThreeWhenIdle = () => {
    if (
      "requestIdleCallback" in
      window
    ) {
      window.requestIdleCallback(
        loadThree,
        {
          timeout: 1400
        }
      );
    } else {
      window.setTimeout(
        loadThree,
        850
      );
    }
  };

  runThreeWhenIdle();
})();