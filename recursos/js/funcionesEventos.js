export function obtenerFavoritos() {
    const favoritosGuardados = localStorage.getItem("eventosFavoritos");
    if (!favoritosGuardados) return [];
    return favoritosGuardados
        .split(",")
        .map(Number)
        .filter((id) => !isNaN(id));
}

export function estaGuardado(id) {
    return obtenerFavoritos().includes(Number(id));
}

export function alternarFavorito(id) {
    const favoritos = obtenerFavoritos();
    const identificador = Number(id);
    const indice = favoritos.indexOf(identificador);

    if (indice === -1) {
        favoritos.push(identificador);
    } else {
        favoritos.splice(indice, 1);
    }

    localStorage.setItem("eventosFavoritos", favoritos.join(","));
    window.dispatchEvent(new Event("favoritosActualizados"));
    return favoritos;
}

export function inicializarModuloEventos(contenedor, eventos) {
    if (!contenedor) return;

    contenedor.innerHTML = `
        <section class="seccion-filtro" id="seccion-eventos" aria-labelledby="titulo-eventos" hidden>
            <h2 class="seccion-filtro__titulo" id="titulo-eventos">Descubre los eventos top del año</h2>
            <form class="formulario-busqueda" action="#" method="get" role="search">
                <label class="formulario-busqueda__label" for="buscar-evento">Buscar evento:</label>
                <input class="formulario-busqueda__input" type="search" id="buscar-evento" name="q" placeholder="Ej: Estadio Kempes, BTS...">
                <fieldset class="formulario-busqueda__filtros">
                    <legend class="formulario-busqueda__leyenda">Filtrar por:</legend>
                    <label class="formulario-busqueda__opcion"><input type="radio" name="filtro-evento" value="popular"> Popular</label>
                    <label class="formulario-busqueda__opcion"><input type="radio" name="filtro-evento" value="artista"> Artista</label>
                    <label class="formulario-busqueda__opcion"><input type="radio" name="filtro-evento" value="recinto"> Recinto</label>
                    <label class="formulario-busqueda__opcion"><input type="radio" name="filtro-evento" value="fecha"> Fecha</label>
                </fieldset>
            </form>
        </section>
        <section class="seccion-resultados" id="resultados-eventos" aria-labelledby="titulo-resultados" hidden>
            <h2 class="seccion-resultados__titulo" id="titulo-resultados">Resultados</h2>
            <div class="seccion-resultados__grilla"></div>
        </section>
    `;

    const seccionBusqueda = contenedor.querySelector("#seccion-eventos");
    const inputBusqueda = contenedor.querySelector("#buscar-evento");
    const filtros = contenedor.querySelectorAll('input[name="filtro-evento"]');
    const seccionResultados = contenedor.querySelector("#resultados-eventos");
    const grillaResultados = contenedor.querySelector(".seccion-resultados__grilla");

    function mostrarModuloEventos() {
        seccionBusqueda.hidden = false;
        seccionBusqueda.scrollIntoView({ behavior: "smooth" });
    }

    function renderizarEventos(listaEventos) {
        grillaResultados.innerHTML = "";
        if (listaEventos.length === 0) {
            seccionResultados.hidden = true;
            return;
        }

        grillaResultados.innerHTML = listaEventos.map((evento) => {
            const guardado = estaGuardado(evento.id);
            return `
                <article class="tarjeta-evento">
                    <h3 class="tarjeta-evento__ranking">${evento.artista}</h3>
                    <ul class="tarjeta-evento__detalles">
                        <li class="tarjeta-evento__item">Recinto: ${evento.recinto}</li>
                        <li class="tarjeta-evento__item">Fecha: ${evento.fecha}</li>
                        <li class="tarjeta-evento__item">${evento.interesados} interesados</li>
                    </ul>
                    <button class="boton boton--secundario boton-favorito" type="button" data-evento-id="${evento.id}">
                        ${guardado ? "Quitar de guardados" : "Guardar evento"}
                    </button>
                    <button class="boton boton--secundario boton-ver-detalle-evento" type="button" data-evento-id="${evento.id}">
                        Ver detalles
                    </button>
                </article>
            `;
        }).join("");

        seccionResultados.hidden = false;
    }

    function aplicarFiltros() {
        const filtroSeleccionado = contenedor.querySelector('input[name="filtro-evento"]:checked');
        const textoBusqueda = inputBusqueda.value.toLowerCase().trim();

        if (!filtroSeleccionado) {
            seccionResultados.hidden = true;
            return;
        }

        const tipoFiltro = filtroSeleccionado.value;
        let eventosFiltrados = [];

        if (tipoFiltro === "popular") {
            eventosFiltrados = [...eventos].sort((a, b) => b.interesados - a.interesados);
        } else {
            if (textoBusqueda === "") {
                seccionResultados.hidden = true;
                return;
            }
            if (tipoFiltro === "artista") {
                eventosFiltrados = eventos.filter((e) => e.artista.toLowerCase().includes(textoBusqueda));
            } else if (tipoFiltro === "recinto") {
                eventosFiltrados = eventos.filter((e) => e.recinto.toLowerCase().includes(textoBusqueda));
            } else if (tipoFiltro === "fecha") {
                eventosFiltrados = eventos.filter((e) => e.fecha.toLowerCase().includes(textoBusqueda));
            }
        }

        renderizarEventos(eventosFiltrados);
    }

    inputBusqueda.addEventListener("input", aplicarFiltros);
    filtros.forEach((f) => f.addEventListener("change", aplicarFiltros));

    grillaResultados.addEventListener("click", (evento) => {
        if (!(evento.target instanceof Element)) return;
        const botonFav = evento.target.closest(".boton-favorito");
        if (botonFav) {
            alternarFavorito(Number(botonFav.dataset.eventoId));
            aplicarFiltros();
            return;
        }
        const botonDetalle = evento.target.closest(".boton-ver-detalle-evento");
        if (botonDetalle) {
            contenedor.dispatchEvent(new CustomEvent("abrirDetalleEvento", {
                detail: { id: botonDetalle.dataset.eventoId }
            }));
        }
    });

    document.addEventListener("click", (evento) => {
        if (!(evento.target instanceof Element)) return;
        const enlace = evento.target.closest('a[href="#seccion-eventos"]');
        if (enlace) {
            evento.preventDefault();
            mostrarModuloEventos();
        }
    });

    if (window.location.hash === "#seccion-eventos") {
        mostrarModuloEventos();
    }
}
