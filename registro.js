const API_BASE = "https://portfolio-api-three-black.vercel.app/api/v1"; 

document.getElementById("registerForm")?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const name = document.getElementById("regName").value;
  const email = document.getElementById("regEmail").value;
  const password = document.getElementById("regPassword").value;
  const itsonId = document.getElementById("regItson").value;

  try {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, itsonId }),
    });

    const data = await res.json();
    const msg = document.getElementById("registerMsg");

    if (res.ok) {
      msg.textContent = "Usuario registrado correctamente.";
      msg.style.color = "green";
      setTimeout(() => (window.location.href = "index.html"), 1500);
    } else {
      msg.textContent = data.message || "Error al registrar.";
      msg.style.color = "red";
    }
  } catch (error) {
    alert("Error al registrar usuario.");
  }
});