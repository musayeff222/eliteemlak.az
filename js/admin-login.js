(function () {
  if (isAdminLoggedIn()) {
    window.location.replace("/admin");
    return;
  }

  const loginForm = document.getElementById("loginForm");
  const loginError = document.getElementById("loginError");

  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const user = document.getElementById("loginUser").value.trim();
    const pass = document.getElementById("loginPass").value;

    if (adminLogin(user, pass)) {
      loginError.hidden = true;
      window.location.href = "/admin";
    } else {
      loginError.hidden = false;
    }
  });
})();
