(function () {
  if (isAdminLoggedIn()) {
    window.location.replace("/admin");
    return;
  }

  const loginForm = document.getElementById("loginForm");
  const loginError = document.getElementById("loginError");

  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const user = document.getElementById("loginUser").value.trim();
    const pass = document.getElementById("loginPass").value;
    const submitBtn = loginForm.querySelector('button[type="submit"]');

    try {
      if (submitBtn) submitBtn.disabled = true;
      await adminLogin(user, pass);
      loginError.hidden = true;
      window.location.href = "/admin";
    } catch (err) {
      loginError.hidden = false;
      loginError.textContent = err.message || "Giriş uğursuz oldu";
    } finally {
      if (submitBtn) submitBtn.disabled = false;
    }
  });
})();
