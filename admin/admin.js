(() => {
  const endpoint = "/api/admin-cache";
  const status = document.querySelector("[data-status]");
  const loginForm = document.querySelector("[data-login-form]");
  const dashboard = document.querySelector("[data-dashboard]");
  const password = document.querySelector("#adminPassword");
  const togglePassword = document.querySelector("[data-toggle-password]");
  const purgeButton = document.querySelector("[data-purge]");
  const clearBrowserButton = document.querySelector("[data-clear-browser]");
  const logoutButton = document.querySelector("[data-logout]");

  const setStatus = (message, tone = "") => {
    status.textContent = message;
    if (tone) status.dataset.tone = tone;
    else delete status.dataset.tone;
  };

  const setView = authenticated => {
    loginForm.hidden = authenticated;
    dashboard.hidden = !authenticated;
    if (!authenticated) password.focus();
  };

  const request = async payload => {
    const result = await fetch(endpoint, {
      method: "POST",
      credentials: "same-origin",
      cache: "no-store",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = await result.json().catch(() => ({ message: "Phản hồi máy chủ không hợp lệ." }));
    if (!result.ok) throw new Error(data.message || `HTTP ${result.status}`);
    return data;
  };

  const checkSession = async () => {
    try {
      const result = await fetch(endpoint, { credentials: "same-origin", cache: "no-store" });
      const data = await result.json();
      if (!data.configured) {
        setStatus("Chưa cấu hình biến môi trường bảo mật trên Netlify.", "error");
        loginForm.hidden = true;
        return;
      }
      setView(Boolean(data.authenticated));
      setStatus(data.authenticated ? "Đã đăng nhập. Hệ thống sẵn sàng." : "Hãy đăng nhập để quản trị cache.", data.authenticated ? "success" : "");
    } catch {
      setStatus("Không kết nối được chức năng quản trị. Trang này chỉ hoạt động sau khi deploy lên Netlify.", "error");
      loginForm.hidden = true;
    }
  };

  togglePassword.addEventListener("click", () => {
    const visible = password.type === "text";
    password.type = visible ? "password" : "text";
    togglePassword.textContent = visible ? "Hiện" : "Ẩn";
    togglePassword.setAttribute("aria-label", visible ? "Hiện mật khẩu" : "Ẩn mật khẩu");
  });

  loginForm.addEventListener("submit", async event => {
    event.preventDefault();
    const submit = loginForm.querySelector('[type="submit"]');
    submit.disabled = true;
    setStatus("Đang xác thực…");
    try {
      await request({ action: "login", password: password.value });
      password.value = "";
      setView(true);
      setStatus("Đăng nhập thành công.", "success");
    } catch (error) {
      setStatus(error.message, "error");
      password.select();
    } finally { submit.disabled = false; }
  });

  purgeButton.addEventListener("click", async () => {
    if (!confirm("Xóa toàn bộ CDN cache của website trên Netlify?")) return;
    purgeButton.disabled = true;
    setStatus("Đang gửi yêu cầu purge đến Netlify…");
    try {
      const data = await request({ action: "purge" });
      const time = data.purgedAt ? new Date(data.purgedAt).toLocaleString("vi-VN") : "vừa xong";
      setStatus(`Đã xóa CDN cache lúc ${time}.`, "success");
    } catch (error) {
      if (/hết hạn/i.test(error.message)) setView(false);
      setStatus(error.message, "error");
    } finally { purgeButton.disabled = false; }
  });

  clearBrowserButton.addEventListener("click", async () => {
    clearBrowserButton.disabled = true;
    setStatus("Đang xóa cache trên trình duyệt này…");
    try {
      if ("caches" in window) {
        const keys = await caches.keys();
        await Promise.all(keys.map(key => caches.delete(key)));
      }
      if ("serviceWorker" in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        await Promise.all(registrations.map(registration => registration.unregister()));
      }
      localStorage.clear();
      sessionStorage.clear();
      location.replace(`/admin/?refreshed=${Date.now()}`);
    } catch (error) {
      setStatus(`Không thể xóa hoàn toàn cache trình duyệt: ${error.message}`, "error");
      clearBrowserButton.disabled = false;
    }
  });

  logoutButton.addEventListener("click", async () => {
    try { await request({ action: "logout" }); } catch { /* Cookie vẫn tự hết hạn. */ }
    setView(false);
    setStatus("Đã đăng xuất.");
  });

  checkSession();
})();
