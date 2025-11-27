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

    // ✅ CORRECTO: Tu API devuelve data.userPublicData
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

if (window.location.pathname.includes("Home.html")) {
  const token = localStorage.getItem("authToken");
  const userName = localStorage.getItem("userName");
  if (!token) window.location.href = "index.html";
  if (userName) document.getElementById("userName").textContent = userName;

  const projectList = document.getElementById("projectList");
  const modal = document.getElementById("projectModal");
  const modalTitle = document.getElementById("modalTitle");
  const projectForm = document.getElementById("projectForm");
  const projectIdInput = document.getElementById("projectId");
  const deleteBtn = document.getElementById("deleteBtn");
  const imageInput = document.getElementById("images");
  const preview = document.getElementById("preview");

  document.getElementById("logoutBtn").addEventListener("click", () => {
    localStorage.clear();
    window.location.href = "index.html";
  });
  
  document.getElementById("addProjectBtn").addEventListener("click", () => openModal());
  document.getElementById("closeModal").addEventListener("click", () => closeModal());
  modal.addEventListener("click", (e) => { if (e.target === modal) closeModal(); });

  function openModal(project = null) {
    projectForm.reset();
    preview.innerHTML = "";

    if (project) {
      modalTitle.textContent = "Editar Proyecto";
      projectIdInput.value = project._id;
      document.getElementById("title").value = project.title;
      document.getElementById("description").value = project.description;
      document.getElementById("technologies").value = project.technologies?.join(", ") || "";
      document.getElementById("repository").value = project.repository || "";
      document.getElementById("images").value = project.images?.join(", ") || "";
      deleteBtn.style.display = "block";

      // Preview de imágenes
      if (project.images?.length) {
        project.images.forEach((img) => {
          const imgEl = document.createElement("img");
          imgEl.src = img;
          imgEl.style.maxWidth = "200px";
          imgEl.style.margin = "5px";
          preview.appendChild(imgEl);
        });
      }
    } else {
      modalTitle.textContent = "Agregar Proyecto";
      deleteBtn.style.display = "none";
    }
    modal.classList.add("active");
  }

  function closeModal() {
    modal.classList.remove("active");
    projectForm.reset();
    preview.innerHTML = "";
  }

  // Preview en tiempo real de las URLs de imágenes
  imageInput.addEventListener("input", (e) => {
    const urls = e.target.value
      .split(",")
      .map(s => s.trim())
      .filter(Boolean);
    
    preview.innerHTML = "";
    
    urls.forEach((url) => {
      const img = document.createElement("img");
      img.src = url;
      img.style.maxWidth = "200px";
      img.style.margin = "5px";
      img.onerror = () => {
        img.alt = "URL inválida";
        img.style.border = "2px solid red";
      };
      preview.appendChild(img);
    });
  });

  async function loadProjects() {
    try {
      const res = await fetch(`${API_BASE}/projects`, {
        headers: { "auth-token": token },
      });

      if (!res.ok) throw new Error("Error al cargar proyectos");

      const data = await res.json();
      projectList.innerHTML = "";

      data.forEach((p) => {
        const card = document.createElement("div");
        card.classList.add("project-card");
        card.innerHTML = `
          <h3>${p.title}</h3>
          <p>${p.description}</p>
          <p><b>Tecnologias:</b> ${p.technologies?.join(", ") || "N/A"}</p>
          ${p.repository ? `<p><b>Repositorio:</b> <a href="${p.repository}" target="_blank">Ver enlace</a></p>` : ""}
          ${p.images?.length ? `<div class="image-gallery">${p.images.map(img => `<img src="${img}" alt="" style="max-width: 200px; margin: 5px;">`).join("")}</div>` : ""}
        `;

        card.addEventListener("dblclick", () => openModal(p));
        projectList.appendChild(card);
      });
    } catch (error) {
      console.error("Error al cargar proyectos:", error);
      alert("Error al cargar los proyectos.");
    }
  }

  projectForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const projectId = projectIdInput.value;
    const title = document.getElementById("title").value.trim();
    const description = document.getElementById("description").value.trim();
    const technologiesStr = document.getElementById("technologies").value.trim();
    const repository = document.getElementById("repository").value.trim();
    const imagesStr = document.getElementById("images").value.trim();

    const technologies = technologiesStr
      ? technologiesStr.split(",").map((t) => t.trim()).filter((t) => t)
      : [];
    
    const images = imagesStr
      ? imagesStr.split(",").map((url) => url.trim()).filter((url) => url)
      : [];

    const projectData = {
      title,
      description,
      technologies,
      repository: repository || undefined,
      images: images
    };

    try {
      let res;
      if (projectId) {
        res = await fetch(`${API_BASE}/projects/${projectId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json", "auth-token": token },
          body: JSON.stringify(projectData),
        });
      } else {
        res = await fetch(`${API_BASE}/projects`, {
          method: "POST",
          headers: { "Content-Type": "application/json", "auth-token": token },
          body: JSON.stringify(projectData),
        });
      }

      if (!res.ok) throw new Error("Error al guardar el proyecto");
      alert(projectId ? "Proyecto actualizado correctamente" : "Proyecto creado correctamente");

      closeModal();
      loadProjects();
    } catch (error) {
      console.error("Error al guardar proyecto:", error);
      alert("Error al guardar el proyecto. Por favor, intenta de nuevo.");
    }
  });

  deleteBtn.addEventListener("click", async () => {
    const projectId = projectIdInput.value;
    if (!projectId) return alert("No hay proyecto seleccionado para eliminar");

    if (!confirm("¿Estas seguro de eliminar este proyecto?")) return;

    try {
      const res = await fetch(`${API_BASE}/projects/${projectId}`, {
        method: "DELETE",
        headers: { "auth-token": token },
      });

      if (!res.ok) throw new Error("Error al eliminar proyecto");
      alert("Proyecto eliminado correctamente");

      closeModal();
      loadProjects();
    } catch (error) {
      console.error("Error al eliminar:", error);
      alert("Error al eliminar el proyecto.");
    }
  });

  loadProjects();
}