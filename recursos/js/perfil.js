import { cargarArtistas, cargarFanPacks, cargarEventos } from "./apiDatos.js";
import { obtenerFavoritos, alternarFavorito, inicializarModuloEventos } from "./funcionesEventos.js";
import { abrirDetalleEvento } from "./detalleEventos.js";
import { abrirDetalleFanPack, actualizarVistaDetalle } from "./detalleCatalogo.js";
import { calcularTotalReserva, validarDatosCheckout, generarTextoResumenPedido } from "./funcionesReservas.js";
import { mostrarNotificacion, actualizarContadorCarritoHeader } from "./notificaciones.js";

// Configuración compartida con el formulario de contacto del proyecto.
const FORMSPREE_ENDPOINT = "https://formspree.io/f/xdegpyby";
const WHATSAPP_SOPORTE = "5493548618742";

let artistasData = [];
let fanPacks = [];
let eventos = [];
const reservas = [];

// Elementos del DOM
const filtrosArtistas = document.querySelectorAll('input[name="filtro-artista"]');
const filtrosPacks = document.querySelectorAll('input[name="filtro-pack"]');
const grillaArtistas = document.querySelector("#grilla-artistas");
const grillaFanPacks = document.querySelector("#grilla-fanpacks");
const tablaReservas = document.querySelector("#tabla-reservas");
const listaEventosGuardados = document.querySelector("#lista-eventos-guardados");
const contenedorEventos = document.querySelector("#contenedor-modulo-eventos");

// Elementos de Checkout
const panelCheckout = document.querySelector("#panel-checkout-reservas");
const totalCheckout = document.querySelector("#total-checkout-reservas");
const formCheckout = document.querySelector("#form-checkout-reservas");
const btnConfirmarWhatsApp = document.querySelector("#btn-confirmar-whatsapp");

const seccionesOcultables = document.querySelectorAll(
    "#artistas-seguidos, #detalles-fanpack, #detalles-evento, #vista-detalle-fanpack"
);


function cargarReservas() {
    reservas.length = 0;
    fanPacks.forEach((pack) => {
        const reservaGuardada = localStorage.getItem(`reservaFanPack_${pack.id}`);
        if (reservaGuardada) {
            const datosReserva = reservaGuardada.split("|");
            reservas.push({
                id: pack.id,
                nombre: `${pack.nombre} (${pack.artista})`,
                cantidad: Number(datosReserva[0]),
                precio: Number(datosReserva[1]),
                modalidadRetiro: datosReserva[2] || "estadio"
            });
        }
    });
}

function guardarReservas() {
    reservas.forEach((reserva) => {
        localStorage.setItem(
            `reservaFanPack_${reserva.id}`,
            `${reserva.cantidad}|${reserva.precio}|${reserva.modalidadRetiro || "estadio"}`
        );
    });
}

function vaciarReservas() {
    reservas.forEach((reserva) => {
        localStorage.removeItem(`reservaFanPack_${reserva.id}`);
    });
    reservas.length = 0;
    actualizarContadorCarritoHeader();
    renderizarReservas();
    renderizarFanPacks();
}

function ocultarSecciones() {
    seccionesOcultables.forEach((seccion) => {
        seccion.style.display = "none";
        seccion.classList.add("seccion-oculta");
    });
}

function mostrarSeccion(seccion) {
    if (!seccion) return;
    ocultarSecciones();
    seccion.style.display = "block";
    seccion.classList.remove("seccion-oculta");
    seccion.scrollIntoView({ behavior: "smooth", block: "start" });
}


function renderizarArtistas() {
    const filtro = document.querySelector('input[name="filtro-artista"]:checked');
    if (!filtro || !grillaArtistas) return;

    const datosSeguidos = localStorage.getItem("artistasSeguidos");
    const nombresSeguidos = datosSeguidos ? datosSeguidos.split("|") : [];

    const artistasFiltrados = artistasData.filter((artista) => {
        const estaSeguido = nombresSeguidos.includes(artista.nombre);
        const coincideGenero = filtro.value === "todos" || artista.genero === filtro.value;
        return estaSeguido && coincideGenero;
    });

    if (artistasFiltrados.length === 0) {
        const mensaje = nombresSeguidos.length === 0
            ? "Aún no seguís a ningún artista. ¡Explorá el catálogo para agregarlos!"
            : "No hay artistas seguidos en este género.";
        grillaArtistas.innerHTML = `
            <li class="perfil-mensaje-vacio" style="grid-column: 1 / -1; text-align: center; padding: 30px; color: var(--color-texto-secundario); font-size: 1.1rem;">
                ${mensaje}
            </li>
        `;
        return;
    }

    grillaArtistas.innerHTML = artistasFiltrados.map((artista) => `
        <li class="perfil-item-grid">
            <figure>
                <img class="perfil-imagen-grid" src="${artista.imagen}" alt="Foto de ${artista.nombre}">
                <figcaption class="perfil-figcaption">${artista.nombre}</figcaption>
            </figure>
        </li>
    `).join("");
}

function renderizarFanPacks() {
    const filtro = document.querySelector('input[name="filtro-pack"]:checked');
    if (!filtro || !grillaFanPacks) return;

    const packsFiltrados = fanPacks.filter(
        (pack) => filtro.value === "todos" || pack.genero === filtro.value
    );

    if (packsFiltrados.length === 0) {
        grillaFanPacks.innerHTML = `<li class="perfil-mensaje-vacio">No hay Fan Packs disponibles en este género.</li>`;
        return;
    }

    grillaFanPacks.innerHTML = packsFiltrados.map((pack) => {
        const reservaExistente = reservas.find((r) => r.id === pack.id);
        return `
            <li class="perfil-item-grid">
                <figure>
                    <img class="perfil-imagen-grid" src="${pack.imagen}" alt="Fan Pack de ${pack.artista}">
                </figure>
                <h3 class="perfil-subtitulo perfil-subtitulo--pequeno">${pack.nombre}</h3>
                <p class="perfil-texto">Artista: ${pack.artista}</p>
                <p class="perfil-texto">${pack.descripcion}</p>
                <p class="perfil-texto">Precio: $${pack.precio.toLocaleString("es-AR")}</p>
                <button class="perfil-boton perfil-boton--pequeno boton-ver-detalle" type="button" data-pack-id="${pack.id}">
                    Ver detalles
                </button>
                ${reservaExistente ? `
                    <div class="contenedor-acciones-carrito">
                        <span class="perfil-texto">Reservado (${reservaExistente.cantidad} un.)</span>
                        <button class="perfil-boton perfil-boton--pequeno boton-agregar-pack" type="button" data-pack-id="${pack.id}">
                            Agregar otra unidad
                        </button>
                        <button class="perfil-boton perfil-boton--pequeno boton-quitar-pack" type="button" data-pack-id="${pack.id}">
                            Sacar de carrito
                        </button>
                    </div>
                ` : `
                    <button class="perfil-boton perfil-boton--pequeno boton-agregar-pack" type="button" data-pack-id="${pack.id}">
                        + Agregar
                    </button>
                `}
            </li>
        `;
    }).join("");
}

function agregarFanPack(id) {
    const pack = fanPacks.find((item) => item.id === Number(id));
    if (!pack) return;

    const reservaExistente = reservas.find((r) => r.id === pack.id);
    if (reservaExistente) {
        reservaExistente.cantidad++;
    } else {
        reservas.push({
            id: pack.id,
            nombre: `${pack.nombre} (${pack.artista})`,
            cantidad: 1,
            precio: pack.precio,
            modalidadRetiro: "estadio"
        });
    }

    guardarReservas();
    renderizarReservas();
    renderizarFanPacks();
    actualizarVistaDetalle(pack.id, fanPacks, reservas);
    mostrarNotificacion(`"${pack.nombre}" agregado a tus reservas.`);
}

function quitarFanPack(id) {
    const pack = fanPacks.find((item) => item.id === Number(id));
    if (!pack) return;

    const indice = reservas.findIndex((r) => r.id === pack.id);
    if (indice !== -1) {
        reservas.splice(indice, 1);
        localStorage.removeItem(`reservaFanPack_${pack.id}`);
    }

    renderizarReservas();
    renderizarFanPacks();
    actualizarVistaDetalle(pack.id, fanPacks, reservas);
    mostrarNotificacion(`"${pack.nombre}" eliminado del carrito.`);
}

function renderizarReservas() {
    if (!tablaReservas) return;

    if (reservas.length === 0) {
        tablaReservas.innerHTML = `
            <tr>
                <td colspan="5">
                    <p>Todavía no tenés Fan Packs reservados.</p>
                    <a href="#detalles-fanpack" class="perfil-boton-tabla">Ver Fan Packs disponibles</a>
                </td>
            </tr>
        `;
        panelCheckout?.classList.add("seccion-oculta");
        return;
    }

    tablaReservas.innerHTML = reservas.map((reserva) => {
        const precioFinal = reserva.precio * reserva.cantidad;
        return `
            <tr>
                <td>${reserva.nombre}</td>
                <td>${reserva.cantidad}</td>
                <td>$${precioFinal.toLocaleString("es-AR")}</td>
                <td><span class="perfil-badge">Reservado</span></td>
                <td>
                    <button type="button" class="perfil-boton-tabla boton-ver-pack-reservado" data-pack-id="${reserva.id}">
                        Ver pack
                    </button>
                </td>
            </tr>
        `;
    }).join("");

    if (panelCheckout && totalCheckout) {
        panelCheckout.classList.remove("seccion-oculta");
        const total = calcularTotalReserva(reservas);
        totalCheckout.textContent = `Total de la reserva: $${total.toLocaleString("es-AR")}`;
    }
}

function renderizarEventosGuardados() {
    if (!listaEventosGuardados) return;
    const favoritos = obtenerFavoritos();
    const eventosGuardados = eventos.filter((e) => favoritos.includes(Number(e.id)));
    if (eventosGuardados.length === 0) {
        listaEventosGuardados.innerHTML = `<p class="perfil-mensaje-vacio">Todavía no guardaste ningún evento.</p>`;
        return;
    }
    listaEventosGuardados.innerHTML = eventosGuardados.map((evento) => `
        <article class="perfil-evento-item">
            <div class="perfil-evento-info">
                <span class="perfil-evento-titulo">${evento.artista}</span>
                <span class="perfil-evento-detalle">${evento.recinto}</span>
            </div>
            <div class="perfil-evento-acciones">
                <span class="perfil-evento-fecha">${evento.fecha}</span>
                <button type="button" class="perfil-boton-tabla boton-ver-detalle-evento" data-evento-id="${evento.id}">
                    Ver detalles
                </button>
                <button type="button" class="perfil-boton-tabla boton-quitar-evento" data-evento-id="${evento.id}">
                    Quitar de guardados
                </button>
            </div>
        </article>
    `).join("");
}


function obtenerDatosFormularioCheckout() {
    const nombre = document.querySelector("#checkout-nombre")?.value || "";
    const email = document.querySelector("#checkout-email")?.value || "";
    const telefono = document.querySelector("#checkout-telefono")?.value || "";
    return { nombre, email, telefono };
}
formCheckout?.addEventListener("submit", async (evento) => {
    evento.preventDefault();
    if (reservas.length === 0) return;
    const datosCliente = obtenerDatosFormularioCheckout();
    const validacion = validarDatosCheckout(datosCliente);
    if (!validacion.valido) {
        mostrarNotificacion(validacion.errores[0], "error");
        return;
    }
    const resumen = generarTextoResumenPedido(datosCliente, reservas);
    try {
        const respuesta = await fetch(FORMSPREE_ENDPOINT, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json"
            },
            body: JSON.stringify({
                nombre: datosCliente.nombre,
                email: datosCliente.email,
                telefono: datosCliente.telefono,
                pedido: resumen
            })
        });
        if (!respuesta.ok) throw new Error("Error en el envío");
        mostrarNotificacion("¡Reserva confirmada! Te enviamos el comprobante por correo electrónico.");
        vaciarReservas();
    } catch {
        mostrarNotificacion("No se pudo enviar el correo. Podés confirmar tu pedido directo por WhatsApp.", "error");
    }
});
btnConfirmarWhatsApp?.addEventListener("click", () => {
    if (reservas.length === 0) return;
    const datosCliente = obtenerDatosFormularioCheckout();
    const validacion = validarDatosCheckout(datosCliente);
    if (!validacion.valido) {
        mostrarNotificacion(validacion.errores[0], "error");
        return;
    }
    const resumen = generarTextoResumenPedido(datosCliente, reservas);
    const urlWhatsApp = `https://wa.me/${WHATSAPP_SOPORTE}?text=${encodeURIComponent(resumen)}`;
    window.open(urlWhatsApp, "_blank", "noopener,noreferrer");
    mostrarNotificacion("Abriendo WhatsApp con el resumen de tu reserva...");
    vaciarReservas();

});

filtrosArtistas.forEach((f) => f.addEventListener("change", renderizarArtistas));
filtrosPacks.forEach((f) => f.addEventListener("change", renderizarFanPacks));
document.addEventListener("click", (evento) => {
    if (!(evento.target instanceof Element)) return;
    const botonDetalle = evento.target.closest(".boton-ver-detalle");
    if (botonDetalle) {
        abrirDetalleFanPack(botonDetalle.dataset.packId, fanPacks, reservas, mostrarSeccion);
        return;
    }
    const botonVerPack = evento.target.closest(".boton-ver-pack-reservado");
    if (botonVerPack) {
        abrirDetalleFanPack(botonVerPack.dataset.packId, fanPacks, reservas, mostrarSeccion);
        return;
    }
    const botonDetalleEvento = evento.target.closest(".boton-ver-detalle-evento");
    if (botonDetalleEvento) {
        abrirDetalleEvento(botonDetalleEvento.dataset.eventoId, eventos, mostrarSeccion);
        return;
    }
    const botonAgregar = evento.target.closest(".boton-agregar-pack");
    if (botonAgregar) {
        agregarFanPack(botonAgregar.dataset.packId);
        return;
    }
    const botonQuitarPack = evento.target.closest(".boton-quitar-pack");
    if (botonQuitarPack) {
        quitarFanPack(botonQuitarPack.dataset.packId);
        return;
    }
    const botonQuitarEvento = evento.target.closest(".boton-quitar-evento");
    if (botonQuitarEvento) {
        alternarFavorito(Number(botonQuitarEvento.dataset.eventoId));
        return;
    }
    const enlace = evento.target.closest("a");
    if (!enlace) return;
    const destino = enlace.getAttribute("href");
    const destinosPermitidos = ["#artistas-seguidos", "#detalles-fanpack", "#detalles-evento", "#eventos-perfil", "#seccion-carrito"];
    if (!destinosPermitidos.includes(destino)) return;
    evento.preventDefault();
    const seccion = document.querySelector(destino);
    if (seccion) {
        mostrarSeccion(seccion);
        window.location.hash = destino;
    }
});
window.addEventListener("favoritosActualizados", renderizarEventosGuardados);
window.addEventListener("storage", (evento) => {
    if (evento.key === "eventosFavoritos") renderizarEventosGuardados();
    if (evento.key === "artistasSeguidos") renderizarArtistas();
    if (evento.key && evento.key.startsWith("reservaFanPack_")) {
        cargarReservas();
        renderizarReservas();
        renderizarFanPacks();
    }
});

async function iniciarPerfil() {
    ocultarSecciones();
    try {
        [artistasData, fanPacks, eventos] = await Promise.all([
            cargarArtistas(),
            cargarFanPacks(),
            cargarEventos()
        ]);
        cargarReservas();
        renderizarArtistas();
        renderizarFanPacks();
        renderizarReservas();
        renderizarEventosGuardados();
        inicializarModuloEventos(contenedorEventos, eventos);
    } catch {
        mostrarNotificacion("Error al cargar los datos del perfil.", "error");
    }
}
iniciarPerfil();