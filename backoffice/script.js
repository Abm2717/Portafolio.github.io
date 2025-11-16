const API_BASE = "https://portfolio-api-three-black.vercel.app/api/v1";

// === REGISTRO ===
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

// === LOGIN ===
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

      msg.textContent = "✅ Inicio de sesión exitoso. Redirigiendo...";
      msg.style.color = "green";

      setTimeout(() => (window.location.href = "home.html"), 1000);
    } else {
      msg.textContent = "Credenciales incorrectas.";
      msg.style.color = "red";
    }
  } catch (error) {
    console.error("Error al iniciar sesión:", error);
    msg.textContent = "Error de conexión con el servidor.";
    msg.style.color = "red";
  }
});

// === HOME - GESTIÓN DE PROYECTOS ===
if (window.location.pathname.includes("home.html")) {
  const token = localStorage.getItem("authToken");
  const userName = localStorage.getItem("userName");

  // Verificar autenticación
  if (!token) {
    window.location.href = "index.html";
  }

  // Mostrar nombre de usuario
  if (userName) {
    document.getElementById("userName").textContent = userName;
  }

  const projectList = document.getElementById("projectList");
  const modal = document.getElementById("projectModal");
  const modalTitle = document.getElementById("modalTitle");
  const projectForm = document.getElementById("projectForm");
  const projectIdInput = document.getElementById("projectId");
  const deleteBtn = document.getElementById("deleteBtn");

  // Cerrar sesión
  document.getElementById("logoutBtn").addEventListener("click", () => {
    localStorage.clear();
    window.location.href = "index.html";
  });

  // Abrir modal para agregar proyecto
  document.getElementById("addProjectBtn").addEventListener("click", () => {
    openModal();
  });

  // Cerrar modal
  document.getElementById("closeModal").addEventListener("click", () => {
    closeModal();
  });

  // Cerrar modal al hacer click fuera
  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      closeModal();
    }
  });

  // Función para abrir modal
  function openModal(project = null) {
    if (project) {
      // Modo edición
      modalTitle.textContent = "Editar Proyecto";
      projectIdInput.value = project._id;
      document.getElementById("title").value = project.title;
      document.getElementById("description").value = project.description;
      document.getElementById("technologies").value = project.technologies?.join(", ") || "";
      document.getElementById("repository").value = project.repository || "";
      deleteBtn.style.display = "block";
    } else {
      // Modo agregar
      modalTitle.textContent = "Agregar Proyecto";
      projectForm.reset();
      projectIdInput.value = "";
      deleteBtn.style.display = "none";
    }
    modal.classList.add("active");
  }

  // Función para cerrar modal
  function closeModal() {
    modal.classList.remove("active");
    projectForm.reset();
  }

  // Cargar proyectos
  async function loadProjects() {
    try {
      const res = await fetch(`${API_BASE}/projects`, {
        headers: { "auth-token": token },
      });
      const data = await res.json();
      projectList.innerHTML = "";

      data.forEach((p) => {
        const card = document.createElement("div");
        card.classList.add("project-card");
        card.innerHTML = `
          <h3>${p.title}</h3>
          <p>${p.description}</p>
          <p class="tech-list"><b>Tecnologías:</b> ${p.technologies?.join(", ") || "N/A"}</p>
        `;
        
        // Doble click para editar
        card.addEventListener("dblclick", () => {
          openModal(p);
        });

        projectList.appendChild(card);
      });
    } catch (error) {
      console.error("Error al cargar proyectos:", error);
    }
  }


    



  // Cargar proyectos al inicio
  loadProjects();
}