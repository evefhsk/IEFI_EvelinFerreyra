import { mostrarNotificacion } from "./notificaciones.js";

const formularioContacto = document.getElementById("id-form-contacto");
const dialogoMensaje = document.getElementById("id-contacto-dialogo");

const FORMSPREE_ENDPOINT = "https://formspree.io/f/xdegpyby";
const WHATSAPP_SOPORTE = "5493548618742";

if (formularioContacto) {
    formularioContacto.addEventListener("submit", async (evento) => {
        evento.preventDefault();

        const formData = new FormData(formularioContacto);
        const nombre = (formData.get("nombre") || "").toString().trim();
        const email = (formData.get("email") || "").toString().trim();
        const motivo = (formData.get("motivo") || "").toString().trim();
        const mensaje = (formData.get("mensaje") || "").toString().trim();

        if (nombre.length < 3 || !email.includes("@") || mensaje.length < 10) {
            mostrarNotificacion("Completá correctamente tu nombre, email y un mensaje de al menos 10 caracteres.", "error");
            return;
        }

        try {
            const respuesta = await fetch(FORMSPREE_ENDPOINT, {
                method: "POST",
                body: formData,
                headers: { Accept: "application/json" }
            });

            if (!respuesta.ok) {
                throw new Error("No se pudo enviar el correo");
            }

            const textoWhatsApp = encodeURIComponent(
                `Hola SoundDay! Soy ${nombre} (${email}). Motivo: ${motivo}. Consulta: ${mensaje}`
            );

            dialogoMensaje.innerHTML = `
                ¡Mensaje enviado por correo con éxito! 
                <a href="https://wa.me/${WHATSAPP_SOPORTE}?text=${textoWhatsApp}" target="_blank" rel="noopener noreferrer" style="text-decoration: underline; margin-left: 8px;">
                    También podés enviarlo por WhatsApp
                </a>
            `;
            mostrarNotificacion("Consulta enviada por email correctamente.");
            formularioContacto.reset();
        } catch {
            mostrarNotificacion("Hubo un problema al enviar el correo. Podés contactarnos directo por WhatsApp.", "error");
        }
    });
}
