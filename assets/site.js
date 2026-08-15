(() => {
  "use strict";
  const root = document.documentElement;
  const body = document.body;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const safeStorage = {
    get(key, fallback) { try { return localStorage.getItem(key) || fallback; } catch (_) { return fallback; } },
    set(key, value) { try { localStorage.setItem(key, value); } catch (_) {} }
  };

  /* Theme */
  const themeButton = document.getElementById("themeToggle");
  const themeIcon = themeButton?.querySelector("[data-theme-icon]");
  const themeMeta = document.querySelector('meta[name="theme-color"]');
  let currentTheme = safeStorage.get("ph-theme", root.dataset.theme || "dark");
  const applyTheme = (theme, persist = true) => {
    currentTheme = theme === "light" ? "light" : "dark";
    root.dataset.theme = currentTheme;
    if (themeIcon) themeIcon.textContent = currentTheme === "dark" ? "☀" : "☾";
    if (themeButton) {
      const label = currentTheme === "dark" ? "Chuyển sang chế độ sáng" : "Chuyển sang chế độ tối";
      themeButton.setAttribute("aria-label", label);
      themeButton.setAttribute("title", label);
    }
    if (themeMeta) themeMeta.setAttribute("content", currentTheme === "dark" ? "#07090d" : "#f4f7fb");
    if (persist) safeStorage.set("ph-theme", currentTheme);
  };
  applyTheme(currentTheme, false);
  themeButton?.addEventListener("click", () => applyTheme(currentTheme === "dark" ? "light" : "dark"));

  /* Year */
  document.querySelectorAll("[data-year]").forEach(el => el.textContent = new Date().getFullYear());

  /* Preloader - preserves original visual but never waits for window.load */
  const preloader = document.querySelector(".preloader");
  let alreadySeen = false;
  try { alreadySeen = sessionStorage.getItem("ph-preloader-seen") === "1"; } catch (_) {}
  if (alreadySeen) {
    root.classList.add("preloader-seen");
    preloader?.remove();
    body.classList.remove("is-loading");
  } else if (preloader) {
    const started = performance.now();
    let finished = false;
    const finish = () => {
      if (finished) return;
      finished = true;
      const minimum = reduceMotion ? 0 : 520;
      const wait = Math.max(0, minimum - (performance.now() - started));
      setTimeout(() => {
        preloader.classList.add("is-exiting");
        body.classList.remove("is-loading");
        try { sessionStorage.setItem("ph-preloader-seen", "1"); } catch (_) {}
        setTimeout(() => preloader.remove(), reduceMotion ? 20 : 700);
      }, wait);
    };
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", finish, { once:true });
    else finish();
    setTimeout(finish, 1300);
  } else body.classList.remove("is-loading");

  /* Navigation */
  const menuToggle = document.querySelector(".menu-toggle");
  const nav = document.querySelector(".nav");
  const closeMenu = () => {
    nav?.classList.remove("open");
    menuToggle?.setAttribute("aria-expanded", "false");
  };
  menuToggle?.addEventListener("click", () => {
    const open = nav?.classList.toggle("open") || false;
    menuToggle.setAttribute("aria-expanded", String(open));
    menuToggle.textContent = open ? "×" : "☰";
  });
  document.querySelectorAll(".nav a").forEach(a => a.addEventListener("click", closeMenu));

  const norm = p => {
    p = (p || "/").replace(/index\.html$/i, "");
    if (!p.startsWith("/")) p = "/" + p;
    if (!p.endsWith("/")) p += "/";
    return p;
  };
  const current = norm(location.pathname);
  document.querySelectorAll(".nav-link").forEach(link => {
    const path = norm(new URL(link.href, location.origin).pathname);
    const active = path === "/" ? current === "/" : (current === path || current.startsWith(path));
    if (active) { link.classList.add("active"); link.setAttribute("aria-current", "page"); }
  });

  /* Scroll progress / header */
  const header = document.querySelector(".site-header");
  const progress = document.querySelector(".scroll-progress");
  let ticking = false;
  const updateScroll = () => {
    const top = scrollY;
    const h = Math.max(document.documentElement.scrollHeight - innerHeight, 1);
    header?.classList.toggle("scrolled", top > 28);
    if (progress) progress.style.transform = `scaleX(${Math.min(1, Math.max(0, top / h))})`;
    ticking = false;
  };
  addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(updateScroll); } }, { passive:true });
  updateScroll();

  /* Analytics hook - fill only after GA4 ID exists. */
  const GA4_ID = "";
  if (GA4_ID) {
    const s = document.createElement("script"); s.async = true; s.src = `https://www.googletagmanager.com/gtag/js?id=${GA4_ID}`; document.head.appendChild(s);
    window.dataLayer = window.dataLayer || [];
    window.gtag = function(){ dataLayer.push(arguments); };
    gtag("js", new Date()); gtag("config", GA4_ID);
  }
  const track = (name, params={}) => { if (typeof window.gtag === "function") gtag("event", name, params); };
  document.querySelectorAll('a[href^="tel:"]').forEach(a => a.addEventListener("click", () => track("click_phone", { phone:a.getAttribute("href").replace("tel:","") })));
  document.querySelectorAll('a[href^="mailto:"]').forEach(a => a.addEventListener("click", () => track("click_email")));
  document.querySelectorAll("[data-map]").forEach(a => a.addEventListener("click", () => track("click_google_maps", { location:a.dataset.map || "" })));
  document.querySelectorAll("[data-project]").forEach(a => a.addEventListener("click", () => track("click_project", { project:a.dataset.project || "" })));
  document.querySelectorAll("form").forEach(f => f.addEventListener("submit", () => track("form_submit", { form_name:f.getAttribute("name") || "contact" })));

  /* Effects are progressively enhanced. HTML remains visible if CDNs fail. */
  const loadScript = (src, globalName) => new Promise((resolve, reject) => {
    if (globalName && window[globalName]) return resolve();
    const old = document.querySelector(`script[src="${src}"]`);
    if (old) { old.addEventListener("load", resolve, {once:true}); old.addEventListener("error", reject, {once:true}); return; }
    const s = document.createElement("script"); s.src = src; s.async = true; s.onload = resolve; s.onerror = reject; document.head.appendChild(s);
  });

  const fallbackHero = () => {
    body.classList.add("no-gsap");
    document.querySelectorAll(".hero-title .line-inner").forEach(el => {
      el.style.opacity = "1"; el.style.transform = "none"; el.style.clipPath = "none";
    });
  };

  const initGSAP = () => {
    if (!window.gsap) return fallbackHero();
    const gsap = window.gsap;
    if (window.ScrollTrigger) gsap.registerPlugin(window.ScrollTrigger);

    gsap.from(".availability, .hero-description, .hero-actions, .hero-meta", { y:24, opacity:0, duration:.72, stagger:.08, ease:"power3.out", delay:.08 });
    gsap.from(".hero-visual", { scale:.94, opacity:0, y:20, duration:.95, ease:"power3.out", delay:.08 });

    if (window.ScrollTrigger) {
      document.querySelectorAll(".section-kicker, .section-title, .section-copy, .reveal").forEach(el => gsap.from(el, { y:42, opacity:0, duration:.82, ease:"power3.out", scrollTrigger:{ trigger:el, start:"top 88%", once:true } }));
      document.querySelectorAll(".reveal-card, .business-card, .location-card, .case-card, .price-card, .process-card").forEach((el,i) => gsap.from(el, { y:56, opacity:0, scale:.985, duration:.82, delay:(i%3)*.035, ease:"power3.out", scrollTrigger:{ trigger:el, start:"top 90%", once:true } }));
    }

    const fine = innerWidth >= 1100 && matchMedia("(pointer:fine)").matches;
    if (fine) {
      const cursor = document.querySelector(".cursor"); const dot = document.querySelector(".cursor-dot");
      if (cursor && dot) {
        const rx = gsap.quickTo(cursor,"x",{duration:.22,ease:"power3.out"}); const ry = gsap.quickTo(cursor,"y",{duration:.22,ease:"power3.out"});
        const dx = gsap.quickSetter(dot,"x","px"); const dy = gsap.quickSetter(dot,"y","px");
        addEventListener("mousemove", e => { dx(e.clientX); dy(e.clientY); rx(e.clientX); ry(e.clientY); }, {passive:true});
        document.querySelectorAll("a,button,.tilt-card").forEach(el => { el.addEventListener("mouseenter",()=>cursor.classList.add("active")); el.addEventListener("mouseleave",()=>cursor.classList.remove("active")); });
      }
      document.querySelectorAll(".magnetic").forEach(el => {
        el.addEventListener("mousemove", e => { const r=el.getBoundingClientRect(); gsap.to(el,{x:(e.clientX-r.left-r.width/2)*.12,y:(e.clientY-r.top-r.height/2)*.12,duration:.3,ease:"power2.out"}); });
        el.addEventListener("mouseleave",()=>gsap.to(el,{x:0,y:0,duration:.55,ease:"elastic.out(1,.5)"}));
      });
      document.querySelectorAll(".tilt-card").forEach(card => {
        card.addEventListener("mousemove",e=>{const r=card.getBoundingClientRect(); const x=(e.clientX-r.left)/r.width-.5; const y=(e.clientY-r.top)/r.height-.5; gsap.to(card,{rotateY:x*5.5,rotateX:y*-5.5,transformPerspective:1100,duration:.42,ease:"power2.out"});});
        card.addEventListener("mouseleave",()=>gsap.to(card,{rotateY:0,rotateX:0,duration:.7,ease:"elastic.out(1,.55)"}));
      });
    }
  };

  const loadGSAP = async () => {
    if (reduceMotion) return fallbackHero();
    try {
      await loadScript("https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js","gsap");
      await loadScript("https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js","ScrollTrigger");
      initGSAP();
    } catch (e) { fallbackHero(); }
  };
  setTimeout(loadGSAP, 40);

  /* Adaptive Three.js: full home, lite landing/case pages, off for articles. */
  const initThree = () => {
    if (!window.THREE) return;
    const mode = body.dataset.effects || "motion";
    if (mode === "motion") return;
    const canvas = document.getElementById("webgl"); if (!canvas) return;
    const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    if (conn?.saveData) return;
    const THREE = window.THREE;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, innerWidth/innerHeight,.1,100); camera.position.z=7;
    const renderer = new THREE.WebGLRenderer({canvas,alpha:true,antialias:false,powerPreference:"high-performance"});
    const mobile = innerWidth < 700; const lowMemory = navigator.deviceMemory && navigator.deviceMemory <= 2;
    renderer.setPixelRatio(Math.min(devicePixelRatio, mobile ? 1 : 1.2)); renderer.setSize(innerWidth,innerHeight);
    const group = new THREE.Group(); scene.add(group);
    const count = mode === "full" ? (lowMemory?150:(mobile?230:760)) : (lowMemory?90:(mobile?120:280));
    const pos = new Float32Array(count*3); const col = new Float32Array(count*3);
    const a=new THREE.Color("#7c5cff"), b=new THREE.Color("#20d9ff"), c=new THREE.Color("#83ffcb");
    for(let i=0;i<count;i++){const r=2.2+Math.random()*2.8,t=Math.random()*Math.PI*2,p=Math.acos(2*Math.random()-1);pos[i*3]=r*Math.sin(p)*Math.cos(t);pos[i*3+1]=r*Math.sin(p)*Math.sin(t);pos[i*3+2]=r*Math.cos(p);const m=a.clone().lerp(Math.random()>.5?b:c,Math.random());col[i*3]=m.r;col[i*3+1]=m.g;col[i*3+2]=m.b;}
    const geo=new THREE.BufferGeometry(); geo.setAttribute("position",new THREE.BufferAttribute(pos,3)); geo.setAttribute("color",new THREE.BufferAttribute(col,3));
    const mat=new THREE.PointsMaterial({size:mobile?.026:.032,vertexColors:true,transparent:true,opacity:mode==="full"?.64:.48,blending:THREE.AdditiveBlending,depthWrite:false});
    const particles=new THREE.Points(geo,mat); group.add(particles);
    let wire=null;
    if(mode==="full" && !lowMemory){wire=new THREE.Mesh(new THREE.IcosahedronGeometry(2.35,1),new THREE.MeshBasicMaterial({color:0x7c5cff,wireframe:true,transparent:true,opacity:.032}));group.add(wire);}
    const mouse={x:0,y:0}; if(matchMedia("(pointer:fine)").matches) addEventListener("pointermove",e=>{mouse.x=(e.clientX/innerWidth-.5)*2;mouse.y=(e.clientY/innerHeight-.5)*2;},{passive:true});
    const clock=new THREE.Clock(), interval=1000/30; let last=0;
    const animate=(now=0)=>{requestAnimationFrame(animate);if(document.hidden||now-last<interval)return;last=now;const time=clock.getElapsedTime();particles.rotation.y=time*.018;particles.rotation.x=Math.sin(time*.14)*.052;if(wire){wire.rotation.y=-time*.024;wire.rotation.z=time*.014;}group.rotation.y+=(mouse.x*.1-group.rotation.y)*.018;group.rotation.x+=(-mouse.y*.07-group.rotation.x)*.018;const max=Math.max(document.documentElement.scrollHeight-innerHeight,1),ratio=scrollY/max;group.position.y=ratio*1.1-.3;group.position.x=Math.sin(ratio*Math.PI*2)*.26;renderer.render(scene,camera);};
    canvas.classList.add("is-ready"); requestAnimationFrame(animate);
    let timer; addEventListener("resize",()=>{clearTimeout(timer);timer=setTimeout(()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);renderer.setPixelRatio(Math.min(devicePixelRatio,innerWidth<700?1:1.2));},140);});
  };
  const loadThree = async () => {
    if (reduceMotion || (body.dataset.effects||"motion") === "motion") return;
    try { await loadScript("https://cdn.jsdelivr.net/npm/three@0.161.0/build/three.min.js","THREE"); initThree(); } catch (_) {}
  };
  if ("requestIdleCallback" in window) requestIdleCallback(loadThree,{timeout:1500}); else setTimeout(loadThree,900);
})();