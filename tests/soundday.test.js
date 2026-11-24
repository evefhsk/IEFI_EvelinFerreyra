import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { filtrarArtistas } from "../recursos/js/funcionesArtistas.js";
import {
    calcularTotalReserva,
    validarDatosCheckout
} from "../recursos/js/funcionesReservas.js";

describe("Pruebas unitarias de SoundDay", () => {
    const artistasMock = [
        { id: 1, nombre: "Coldplay", genero: "pop", tour: "Music of the Spheres" },
        { id: 2, nombre: "BTS", genero: "pop", tour: "ARIRANG World Tour" },
        { id: 3, nombre: "The Beatles", genero: "rock", tour: "Revival Historic Show" }
    ];

    it("filtrarArtistas filtra correctamente por género y texto de búsqueda", () => {
        const soloRock = filtrarArtistas(artistasMock, "rock", "");
        assert.equal(soloRock.length, 1);
        assert.equal(soloRock[0].nombre, "The Beatles");

        const busquedaNombre = filtrarArtistas(artistasMock, "todos", "bts");
        assert.equal(busquedaNombre.length, 1);
        assert.equal(busquedaNombre[0].id, 2);
    });

    it("calcularTotalReserva suma correctamente subtotales según cantidad y precio", () => {
        const carrito = [
            { id: 1, precio: 35000, cantidad: 2 },
            { id: 5, precio: 48000, cantidad: 1 }
        ];
        assert.equal(calcularTotalReserva(carrito), 118000);
        assert.equal(calcularTotalReserva([]), 0);
    });

    it("validarDatosCheckout detecta errores en campos inválidos y aprueba datos válidos", () => {
        const invalido = validarDatosCheckout({
            nombre: "Ca",
            email: "correo-sin-arroba",
            telefono: "123"
        });
        assert.equal(invalido.valido, false);
        assert.equal(invalido.errores.length, 3);

        const valido = validarDatosCheckout({
            nombre: "Carla Rinaldi",
            email: "carla@gmail.com",
            telefono: "3511234567"
        });
        assert.equal(valido.valido, true);
    });
});
