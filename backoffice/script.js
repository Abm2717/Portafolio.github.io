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

if (window.location.pathname.includes("home.html")) {
  const token = localStorage.getItem("authToken");
  const userName = localStorage.getItem("userName");
  const userId = localStorage.getItem("userId");

  if (!token) {
    window.location.href = "index.html";
  }

  if (userName) {
    document.getElementById("userName").textContent = userName;
  }

  const projectList = document.getElementById("projectList");
  const modal = document.getElementById("projectModal");
  const modalTitle = document.getElementById("modalTitle");
  const projectForm = document.getElementById("projectForm");
  const projectIdInput = document.getElementById("projectId");
  const deleteBtn = document.getElementById("deleteBtn");

  document.getElementById("logoutBtn").addEventListener("click", () => {
    localStorage.clear();
    window.location.href = "index.html";
  });

  document.getElementById("addProjectBtn").addEventListener("click", () => {
    openModal();
  });

  document.getElementById("closeModal").addEventListener("click", () => {
    closeModal();
  });

  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      closeModal();
    }
  });

  
  function openModal(project = null) {
    if (project) {
      modalTitle.textContent = "Editar Proyecto";
      projectIdInput.value = project._id;
      document.getElementById("title").value = project.title;
      document.getElementById("description").value = project.description;
      document.getElementById("technologies").value = project.technologies?.join(", ") || "";
      document.getElementById("repository").value = project.repository || "";
      deleteBtn.style.display = "block";
    } else {
      modalTitle.textContent = "Agregar Proyecto";
      projectForm.reset();
      projectIdInput.value = "";
      deleteBtn.style.display = "none";
    }
    modal.classList.add("active");
  }

  function closeModal() {
    modal.classList.remove("active");
    projectForm.reset();
  }

  async function loadProjects() {
    try {
      const res = await fetch(`${API_BASE}/projects`, {
        headers: { "auth-token": token },
      });
      
      if (!res.ok) {
        throw new Error("Error al cargar proyectos");
      }

      const data = await res.json();
      projectList.innerHTML = "";

      data.forEach((p) => {
        const card = document.createElement("div");
        card.classList.add("project-card");
        card.innerHTML = `
          <h3>${escapeHtml(p.title)}</h3>
          <p>${escapeHtml(p.description)}</p>
          <p class="tech-list"><b>Tecnologías:</b> ${p.technologies?.map(t => escapeHtml(t)).join(", ") || "N/A"}</p>
          ${p.repository ? `<p class="tech-list"><b>Repositorio:</b> <a href="${escapeHtml(p.repository)}" target="_blank">Ver enlace</a></p>` : ""}
        `;
        
        
        card.addEventListener("dblclick", () => {
          openModal(p);
        });

        projectList.appendChild(card);
      });
    } catch (error) {
      console.error("Error al cargar proyectos:", error);
      alert("Error al cargar los proyectos. Por favor, intenta de nuevo.");
    }
  }


  projectForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const projectId = projectIdInput.value;
    const title = document.getElementById("title").value.trim();
    const description = document.getElementById("description").value.trim();
    const technologiesStr = document.getElementById("technologies").value.trim();
    const repository = document.getElementById("repository").value.trim();

    const technologies = technologiesStr 
      ? technologiesStr.split(",").map(t => t.trim()).filter(t => t)
      : [];

  
    const projectData = {
      title,
      description,
      technologies,
      repository: repository || undefined,
      images: [] 
    };

    try {
      let res;
      
      if (projectId) {
        
        res = await fetch(`${API_BASE}/projects/${projectId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "auth-token": token,
          },
          body: JSON.stringify(projectData),
        });
      } else {
        
        res = await fetch(`${API_BASE}/projects`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "auth-token": token,
          },
          body: JSON.stringify(projectData),
        });
      }

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Error al guardar el proyecto");
      }

      const savedProject = await res.json();
      console.log("Proyecto guardado:", savedProject);

      alert(projectId ? "Proyecto actualizado correctamente" : "Proyecto creado correctamente");

      closeModal();
      loadProjects();

    } catch (error) {
      console.error("Error al guardar proyecto:", error);
      alert(error.message || "Error al guardar el proyecto. Por favor, intenta de nuevo.");
    }
  });

  deleteBtn.addEventListener("click", async () => {
    const projectId = projectIdInput.value;

    if (!projectId) {
      alert("No hay proyecto seleccionado para eliminar");
      return;
    }

    const confirmDelete = confirm("¿Estás seguro de que deseas eliminar este proyecto? Esta acción no se puede deshacer.");
    
    if (!confirmDelete) {
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/projects/${projectId}`, {
        method: "DELETE",
        headers: {
          "auth-token": token,
        },
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Error al eliminar el proyecto");
      }

      console.log("Proyecto eliminado correctamente");
      alert("Proyecto eliminado correctamente");

    
      closeModal();
      loadProjects();

    } catch (error) {
      console.error("Error al eliminar proyecto:", error);
      alert(error.message || "Error al eliminar el proyecto. Por favor, intenta de nuevo.");
    }
  });
  
  loadProjects();
}