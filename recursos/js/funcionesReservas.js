export function calcularTotalReserva(reservas) {
    if (!Array.isArray(reservas)) return 0;
    return reservas.reduce((acumulador, item) => {
        const precio = Number(item.precio) || 0;
        const cantidad = Number(item.cantidad) || 0;
        return acumulador + precio * cantidad;
    }, 0);
}

export function validarDatosCheckout({ nombre, email, telefono }) {
    const errores = [];

    if (!nombre || nombre.trim().length < 3) {
        errores.push("Ingresá tu nombre completo (mínimo 3 caracteres).");
    }

    const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !regexEmail.test(email.trim())) {
        errores.push("Ingresá un correo electrónico válido.");
    }

    const soloDigitos = (telefono || "").replace(/\D/g, "");
    if (soloDigitos.length < 8) {
        errores.push("Ingresá un teléfono válido de al menos 8 dígitos.");
    }

    return {
        valido: errores.length === 0,
        errores
    };
}

export function generarTextoResumenPedido(datosCliente, reservas) {
    const total = calcularTotalReserva(reservas);
    const lineas = reservas.map(
        (r) => `- ${r.nombre} x${r.cantidad} ($${(r.precio * r.cantidad).toLocaleString("es-AR")}) [${r.modalidadRetiro || "estadio"}]`
    );

    return [
        `Hola SoundDay! Quiero confirmar mi reserva de Fan Packs:`,
        `Cliente: ${datosCliente.nombre}`,
        `Email: ${datosCliente.email}`,
        `Teléfono: ${datosCliente.telefono}`,
        `Detalle del pedido:`,
        ...lineas,
        `Total a abonar: $${total.toLocaleString("es-AR")}`
    ].join("\n");
}
