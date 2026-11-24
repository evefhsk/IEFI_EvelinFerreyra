import { cargarEventos } from "./apiDatos.js";
import { inicializarModuloEventos } from "./funcionesEventos.js";
import { abrirDetalleEvento } from "./detalleEventos.js";
import { mostrarNotificacion } from "./notificaciones.js";

const contenedorEventos = document.querySelector("#contenedor-modulo-eventos");

function mostrarSeccion(seccion) {
    if (!seccion) return;
    seccion.style.display = "block";
    seccion.classList.remove("seccion-oculta");
    seccion.scrollIntoView({ behavior: "smooth", block: "start" });
}

async function iniciarInicio() {
    try {
        const eventos = await cargarEventos();
        inicializarModuloEventos(contenedorEventos, eventos);

        if (contenedorEventos) {
            contenedorEventos.addEventListener("abrirDetalleEvento", (evento) => {
                abrirDetalleEvento(evento.detail.id, eventos, mostrarSeccion);
            });
        }
    } catch {
        mostrarNotificacion("No se pudieron cargar los eventos. Intentá recargar la página.", "error");
    }
}

iniciarInicio();
