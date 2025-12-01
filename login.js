const API_BASE = "https://portfolio-api-three-black.vercel.app/api/v1"; 

document.getElementById("loginForm")?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;
  const msg = document.getElementById("loginMsg");

  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    console.log("Status:", res.status, "Respuesta:", data);

    if (res.ok && data.token && data.userPublicData) {
      localStorage.setItem("authToken", data.token);
      localStorage.setItem("userId", data.userPublicData._id);
      localStorage.setItem("userEmail", data.userPublicData.email);
      localStorage.setItem("userName", data.userPublicData.name);
      localStorage.setItem("itsonId", data.userPublicData.itsonId);

      msg.textContent = "Inicio de sesion exitoso. Redirigiendo...";
      msg.style.color = "green";

      setTimeout(() => (window.location.href = "Home.html"), 1000);
    } else {
      msg.textContent = "Credenciales incorrectas.";
      msg.style.color = "red";
    }
  } catch (error) {
    console.error("Error al iniciar sesion:", error);
    msg.textContent = "Error de conexion con el servidor.";
    msg.style.color = "red";
  }
});