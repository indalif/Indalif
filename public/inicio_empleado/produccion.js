document.addEventListener("DOMContentLoaded", () => {
    const formProduccion = document.getElementById("formProduccion");
    const tablaProduccion = document.getElementById("tablaProduccion");
    const filtroFecha = document.getElementById("filtroFecha");
    const btnFiltrar = document.getElementById("btnFiltrar");
    let editId = null;
    const formatearFecha = (fechaISO) => {
        const fecha = new Date(fechaISO);
        const dia = fecha.getUTCDate().toString().padStart(2, '0'); // Usar UTC
        const mes = (fecha.getUTCMonth() + 1).toString().padStart(2, '0'); // Usar UTC
        const anio = fecha.getUTCFullYear();
        return `${dia}/${mes}/${anio}`;
    };
    const cargarProduccion = async (fecha = null) => {
        try {
            const url = fecha
                ? `/traer_produccion?fecha=${fecha}`
                : '/traer_produccion';
            const response = await fetch(url, { method: 'GET' });
            if (!response.ok) {
                throw new Error('Error al obtener los datos de producción.');
            }
            const data = await response.json();
            tablaProduccion.innerHTML = "";
            data.forEach(item => {
                const fila = `
                <tr>
                    <td>${item.producto}</td>
                    <td>${formatearFecha(item.fecha)}</td>
                    <td>${item.produccion}</td>
                    <td>${formatearFecha(item.fecha_vencimiento)}</td>
                    <td>${item.numero_lote}</td>
                    <td>
                        <button class="btn btn-warning btn-sm" onclick="editarRegistro(${item.id}, '${item.producto}', '${item.fecha}', ${item.produccion}, '${item.fecha_vencimiento}', '${item.numero_lote}')">Editar</button>
                        <button class="btn btn-danger btn-sm" onclick="eliminarRegistro(${item.id})">Eliminar</button>
                    </td>
                </tr>
            `;
                tablaProduccion.insertAdjacentHTML('beforeend', fila);
            });
        } catch (error) {
            console.error('Error al cargar la producción:', error);
        }
    };
    cargarProduccion();
    btnFiltrar.addEventListener("click", () => {
        const fecha = filtroFecha.value;
        cargarProduccion(fecha);
    });
    formProduccion.addEventListener("submit", async (e) => {
        e.preventDefault();

        const producto = document.getElementById("producto").value;
        const fecha = document.getElementById("fecha").value;
        const produccionDia = document.getElementById("produccionDia").value;
        const fechaVencimiento = document.getElementById("fechaVencimiento").value;
        const numeroLote = document.getElementById("numeroLote").value;

        if (!producto || !fecha || !produccionDia || !fechaVencimiento || !numeroLote) {
            alert("Todos los campos son obligatorios.");
            return;
        }

        const registro = {
            producto,
            fecha,
            produccion: produccionDia,
            fecha_vencimiento: fechaVencimiento,
            numero_lote: numeroLote
        };

        try {
            let response;
            if (editId) {
                response = await fetch(`/produccion/${editId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(registro)
                });
                editId = null;
            } else {
                response = await fetch('/produccion', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(registro)
                });
            }
            if (response.ok) {
                alert(editId ? 'Producción actualizada con éxito.' : 'Producción registrada con éxito.');
                formProduccion.reset();
                cargarProduccion();
            } else {
                const error = await response.json();
                alert(`Error: ${error.message}`);
            }
        } catch (error) {
            console.error('Error al registrar o editar la producción:', error);
        }
    });

    window.editarRegistro = (id, producto, fecha, produccion, fechaVencimiento, numeroLote) => {
        document.getElementById("producto").value = producto;
        document.getElementById("fecha").value = fecha;
        document.getElementById("produccionDia").value = produccion;
        document.getElementById("fechaVencimiento").value = fechaVencimiento;
        document.getElementById("numeroLote").value = numeroLote;

        editId = id;
        window.scrollTo(0, 0);
    };

    window.eliminarRegistro = async (id) => {
        if (!confirm("¿Estás seguro de que deseas eliminar este registro?")) {
            return;
        }

        try {
            const response = await fetch(`/produccion/${id}`, { method: 'DELETE' });

            if (response.ok) {
                alert('Producción eliminada con éxito.');
                cargarProduccion();
            } else {
                const error = await response.json();
                alert(`Error: ${error.message}`);
            }
        } catch (error) {
            console.error('Error al eliminar la producción:', error);
        }
    };
});