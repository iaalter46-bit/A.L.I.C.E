const starsDiv = document.getElementById("p10");
for (let i = 1; i <= 5; i++) {
  const span = document.createElement("span");
  span.innerHTML = "★";
  span.classList.add("star");
  span.dataset.value = i;
  span.addEventListener("click", () => {
    const all = starsDiv.querySelectorAll(".star");
    all.forEach(s => s.classList.remove("selected"));
    for (let j = 0; j < i; j++) all[j].classList.add("selected");
    starsDiv.dataset.selected = i;
  });
  starsDiv.appendChild(span);
}

document.getElementById("encuestaIDEAD").addEventListener("submit", async e => {
  e.preventDefault();

  const payload = {
    nombre: document.getElementById("nombre").value,
    p1: document.getElementById("p1").value,
    p2: document.getElementById("p2").value,
    p3: document.getElementById("p3").value,
    p4: document.getElementById("p4").value,
    p5: document.getElementById("p5").value,
    p6: document.getElementById("p6").value,
    p7: document.getElementById("p7").value,
    p8: document.getElementById("p8").value,
    p9: document.getElementById("p9").value,
    p10: document.getElementById("p10").dataset.selected || 0,
    comentario: document.getElementById("comentario").value
  };

  try {
    const res = await fetch("https://script.google.com/macros/s/AKfycbwPxEzcmoJCf9OGn-WxtLfUdN6MYjCH6L1-KLgWLcYfO12gaiYQSvzbCukeLLAEwlHc/exec", {
      method: "POST",
      body: JSON.stringify(payload)
    });

    document.getElementById("estado").innerText = res.ok
      ? "✅ ¡Gracias por participar en la encuesta!"
      : "❌ Error al enviar tus respuestas.";
  } catch (err) {
    document.getElementById("estado").innerText = "⚠️ Error de conexión.";
  }
});
