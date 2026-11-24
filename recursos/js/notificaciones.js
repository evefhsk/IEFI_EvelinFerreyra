export function mostrarNotificacion(mensaje, tipo = "exito") {
    let banner = document.getElementById("notificacion-global");

    if (!banner) {
        banner = document.createElement("div");
        banner.id = "notificacion-global";
        banner.setAttribute("role", "alert");
        banner.className = "notificacion-toast";
        document.body.appendChild(banner);
    }

    banner.textContent = mensaje;
    banner.classList.remove("notificacion-toast--error", "notificacion-toast--exito");
    banner.classList.add(
        tipo === "error" ? "notificacion-toast--error" : "notificacion-toast--exito",
        "notificacion-toast--visible"
    );

    clearTimeout(banner._temporizador);
    banner._temporizador = setTimeout(() => {
        banner.classList.remove("notificacion-toast--visible");
    }, 5000);

    actualizarContadorCarritoHeader();
}

export function actualizarContadorCarritoHeader() {
    const contador = document.getElementById("contador-carrito-header");
    if (!contador) return;

    let totalUnidades = 0;
    for (let i = 0; i < localStorage.length; i++) {
        const clave = localStorage.key(i);
        if (clave && clave.startsWith("reservaFanPack_")) {
            const valor = localStorage.getItem(clave);
            const cantidad = valor ? Number(valor.split("|")[0]) : 0;
            if (!isNaN(cantidad)) totalUnidades += cantidad;
        }
    }
    contador.textContent = String(totalUnidades);
}

actualizarContadorCarritoHeader();
window.addEventListener("storage", actualizarContadorCarritoHeader);
