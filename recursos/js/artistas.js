import { cargarArtistas, cargarFanPacks } from "./apiDatos.js";
import { renderizarArtistas, filtrarArtistas } from "./funcionesArtistas.js";
import { mostrarNotificacion } from "./notificaciones.js";

let artistasData = [];
let fanPacks = [];

const contenedorArtistas = document.getElementById("artistas-app");
const catalogoSeccion = document.getElementById("catalogo-seccion");
const detalleSeccion = document.getElementById("detalle-artista");
const inputBusqueda = document.getElementById("buscar-artista");
const filtrosGenero = document.querySelectorAll('input[name="genero"]');

const detalleImagen = document.getElementById("detalle-artista-imagen");
const detalleNombre = document.getElementById("detalle-artista-nombre");
const detalleDescripcion = document.getElementById("detalle-artista-descripcion");
const detalleRecinto = document.getElementById("detalle-artista-recinto");
const detalleFecha = document.getElementById("detalle-artista-fecha");
const detallePuertas = document.getElementById("detalle-artista-puertas");
const detalleInicio = document.getElementById("detalle-artista-inicio");
const detalleAccesos = document.getElementById("detalle-artista-accesos");
const detalleElementos = document.getElementById("detalle-artista-elementos");
const detalleSetlist = document.getElementById("detalle-artista-setlist");

const contenedorPack = document.getElementById("contenedor-fanpack-dinamico");
const listaFanpacksArtista = document.getElementById("lista-fanpacks-artista");
const btnSeguir = document.querySelector(".boton-accion-negro");

async function iniciarArtistas() {
    try {
        [artistasData, fanPacks] = await Promise.all([cargarArtistas(), cargarFanPacks()]);
        renderizarArtistas(contenedorArtistas, artistasData);
    } catch {
        mostrarNotificacion("Error al cargar el catálogo de artistas.", "error");
    }
}

function mostrarDetalleArtista(id) {
    const artista = artistasData.find((a) => a.id === Number(id));
    if (!artista) return;

    detalleImagen.src = artista.detalleImagen || artista.imagen;
    detalleImagen.alt = `Tour de ${artista.nombre}`;
    detalleNombre.textContent = artista.nombre;
    detalleDescripcion.textContent = artista.descripcion;
    detalleRecinto.textContent = artista.recinto;
    detalleFecha.textContent = artista.fecha;
    detallePuertas.textContent = artista.puertas;
    detalleInicio.textContent = artista.inicio;
    detalleAccesos.textContent = artista.accesos;
    detalleElementos.textContent = artista.elementos;

    detalleSetlist.innerHTML = artista.setlist
        .map((cancion) => `<li class="canciones-lista__item">${cancion}</li>`)
        .join("");

    const fanpacksDelArtista = fanPacks.filter((pack) => pack.artista === artista.nombre);

    if (contenedorPack && listaFanpacksArtista) {
        contenedorPack.style.display = "block";
        listaFanpacksArtista.innerHTML = fanpacksDelArtista.length > 0
            ? fanpacksDelArtista.map((pack) => `
                <div class="pack-compra">
                    <div class="pack-compra__cabecera">
                        <div class="pack-compra__miniatura">
                            <img src="${pack.imagen}" alt="${pack.nombre}">
                        </div>
                        <div class="pack-compra__datos">
                            <h4 class="pack-compra__nombre">${pack.nombre}</h4>
                            <p class="pack-compra__descripcion">${pack.descripcion}</p>
                        </div>
                    </div>
                    <form class="pack-compra__form" data-id-pack="${pack.id}">
                        <label class="visually-hidden" for="retiro-${pack.id}">Modalidad de retiro</label>
                        <select class="pack-compra__select" name="modalidad-retiro" id="retiro-${pack.id}" required>
                            <option value="estadio">Retiro: En estadio (Día del show)</option>
                            <option value="domicilio">Envío postal a domicilio</option>
                        </select>
                        <div class="pack-compra__pie">
                            <span class="pack-compra__precio">$${Number(pack.precio).toLocaleString("es-AR")}</span>
                            <button class="boton-pack-agregar" type="submit">+ Agregar al Carrito</button>
                        </div>
                    </form>
                </div>
            `).join("")
            : `<p>Aún no hay Fan Packs disponibles para esta gira.</p>`;
    }

    catalogoSeccion.classList.add("seccion-oculta");
    detalleSeccion.classList.remove("seccion-oculta");
    detalleSeccion.scrollIntoView({ behavior: "smooth", block: "start" });
    window.location.hash = "detalle-artista";
    cargarEstadoSeguir();
}

function volverAlCatalogo(evento) {
    evento.preventDefault();
    detalleSeccion.classList.add("seccion-oculta");
    catalogoSeccion.classList.remove("seccion-oculta");
    window.location.hash = "catalogo-seccion";
}

function actualizarGrillaArtistas(texto, generoActivo) {
    const artistasFiltrados = filtrarArtistas(artistasData, generoActivo, texto);
    if (artistasFiltrados.length === 0) {
        contenedorArtistas.innerHTML = `
            <p style="grid-column: 1 / -1; text-align: center; color: var(--color-texto-secundario); padding: 40px 0; font-size: 1.1rem;">
                No se encontraron artistas con ese nombre o género. ¡Intentá con "Coldplay", "BTS" o "The Beatles"!
            </p>
        `;
    } else {
        renderizarArtistas(contenedorArtistas, artistasFiltrados);
    }
}

inputBusqueda?.addEventListener("input", () => {
    const generoActivo = document.querySelector('input[name="genero"]:checked').value;
    actualizarGrillaArtistas(inputBusqueda.value, generoActivo);
});

filtrosGenero.forEach((filtro) => {
    filtro.addEventListener("change", () => {
        actualizarGrillaArtistas(inputBusqueda.value, filtro.value);
    });
});

document.addEventListener("click", (evento) => {
    if (!(evento.target instanceof Element)) return;

    const botonVer = evento.target.closest(".tarjeta-artista__boton");
    if (botonVer) {
        mostrarDetalleArtista(botonVer.dataset.id);
        return;
    }

    const botonVolver = evento.target.closest(".boton-volver");
    if (botonVolver) {
        volverAlCatalogo(evento);
        return;
    }

    const btnSeguirClick = evento.target.closest(".boton-accion-negro");
    if (btnSeguirClick && !detalleSeccion.classList.contains("seccion-oculta")) {
        const nombreArtista = detalleNombre.textContent;
        let seguidos = localStorage.getItem("artistasSeguidos");
        seguidos = seguidos ? seguidos.split("|") : [];

        if (seguidos.includes(nombreArtista)) {
            seguidos = seguidos.filter((a) => a !== nombreArtista);
            mostrarNotificacion(`Dejaste de seguir a ${nombreArtista}.`);
        } else {
            seguidos.push(nombreArtista);
            mostrarNotificacion(`Ahora seguís a ${nombreArtista}.`);
        }

        localStorage.setItem("artistasSeguidos", seguidos.join("|"));
        cargarEstadoSeguir();
    }
});

function cargarEstadoSeguir() {
    if (!btnSeguir) return;
    const nombreArtista = detalleNombre.textContent;
    const datos = localStorage.getItem("artistasSeguidos");
    const seguidos = datos ? datos.split("|") : [];

    if (seguidos.includes(nombreArtista)) {
        btnSeguir.textContent = "✓ Siguiendo";
        btnSeguir.style.backgroundColor = "var(--color-primario-activo)";
    } else {
        btnSeguir.textContent = "+ Seguir";
        btnSeguir.style.backgroundColor = "#000000";
    }
}

listaFanpacksArtista?.addEventListener("submit", (evento) => {
    if (!evento.target.matches(".pack-compra__form")) return;
    evento.preventDefault();

    const idPack = Number(evento.target.dataset.idPack);
    const pack = fanPacks.find((p) => p.id === idPack);
    if (!pack) return;

    const modalidad = evento.target.querySelector("select").value;
    const claveReserva = `reservaFanPack_${pack.id}`;
    const reservaGuardada = localStorage.getItem(claveReserva);
    const cantidad = reservaGuardada ? Number(reservaGuardada.split("|")[0]) + 1 : 1;

    localStorage.setItem(claveReserva, `${cantidad}|${pack.precio}|${modalidad}`);
    mostrarNotificacion(
        `"${pack.nombre}" agregado a tus reservas (${modalidad === "estadio" ? "Retiro en estadio" : "Envío a domicilio"}).`
    );
    evento.target.reset();
});

iniciarArtistas();
