export async function obtenerDatosJSON(ruta) {
    try {
        const respuesta = await fetch(ruta);
        if (!respuesta.ok) {
            throw new Error(`Error HTTP ${respuesta.status} al cargar ${ruta}`);
        }
        return await respuesta.json();
    } catch (error) {
        console.error("Fallo en la obtención de datos:", error);
        throw error;
    }
}

export async function cargarArtistas() {
    return await obtenerDatosJSON("./recursos/datos/datosArtistas.json");
}

export async function cargarFanPacks() {
    return await obtenerDatosJSON("./recursos/datos/datosFanPacks.json");
}

export async function cargarEventos() {
    return await obtenerDatosJSON("./recursos/datos/datosEventos.json");
}
