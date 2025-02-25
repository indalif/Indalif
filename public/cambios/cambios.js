document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("cambios-form");
    const tablaCambios = document.getElementById("tabla-cambios");
    const clienteSelect = document.getElementById("cliente");
    let editId = null;
    async function cargarClientes() {
        try {
            const response = await fetch('/clientes');
            const data = await response.json();

            clienteSelect.innerHTML = '<option value="">Seleccione un cliente</option>';
            data.clientes.forEach(cliente => {
                const option = document.createElement("option");
                option.value = cliente.nombre;
                option.textContent = cliente.nombre;
                clienteSelect.appendChild(option);
            });
        } catch (error) {
            console.error("Error al cargar los clientes:", error);
        }
    }
    async function fetchCambios() {
        try {
            const response = await fetch('/traer_cambios');
            const cambios = await response.json();

            tablaCambios.innerHTML = '';
            cambios.forEach(cambio => {
                const fechaFormatted = cambio.fecha
                    ? cambio.fecha.split('T')[0].split('-').reverse().join('/')
                    : '';
                const fechaVencimientoFormatted = cambio.fecha_vencimiento
                    ? cambio.fecha_vencimiento.split('T')[0].split('-').reverse().join('/')
                    : '';
                const fila = document.createElement("tr");
                fila.innerHTML = `
                    <td>${cambio.producto}</td>
                    <td>${cambio.cantidad}</td>
                    <td>${parseFloat(cambio.precio).toFixed(2)}</td>
                    <td>${parseFloat(cambio.total).toFixed(2)}</td>
                    <td>${fechaFormatted}</td>
                    <td>${cambio.lote}</td>
                    <td>${fechaVencimientoFormatted}</td>
                    <td>${cambio.descripcion || ''}</td>
                    <td>${cambio.cliente}</td>
                    <td>
                        <button class="btn btn-edit btn-sm edit-btn" data-id="${cambio.id}">Editar</button>
                        <button class="btn btn-danger btn-sm delete-btn" data-id="${cambio.id}">Eliminar</button>
                    </td>
                `;
                tablaCambios.appendChild(fila);
            });

            document.querySelectorAll(".edit-btn").forEach(button =>
                button.addEventListener("click", handleEdit)
            );
            document.querySelectorAll(".delete-btn").forEach(button =>
                button.addEventListener("click", handleDelete)
            );
        } catch (error) {
            console.error("Error al obtener los cambios:", error);
        }
    }
    function handleEdit(event) {
        const id = event.target.dataset.id;
        const fila = event.target.closest("tr");
        const celdas = Array.from(fila.children);

        document.getElementById("producto").value = celdas[0].textContent;
        document.getElementById("cantidad").value = celdas[1].textContent;
        document.getElementById("precio").value = celdas[2].textContent;

        const fecha = celdas[4].textContent;
        document.getElementById("fecha").value = fecha ? fecha.split('/').reverse().join('-') : '';

        document.getElementById("lote").value = celdas[5].textContent;

        const fechaVencimiento = celdas[6].textContent;
        document.getElementById("fechaVencimiento").value = fechaVencimiento ? fechaVencimiento.split('/').reverse().join('-') : '';

        document.getElementById("descripcion").value = celdas[7].textContent;
        document.getElementById("cliente").value = celdas[8].textContent;

        editId = id;
    }
    async function handleDelete(event) {
        const id = event.target.dataset.id;
        if (confirm("¿Está seguro de que desea eliminar este cambio?")) {
            try {
                const response = await fetch(`/cambios/${id}`, { method: 'DELETE' });

                if (response.ok) {
                    alert("Cambio eliminado con éxito.");
                    fetchCambios();
                } else {
                    alert("Error al eliminar el cambio.");
                }
            } catch (error) {
                console.error("Error al eliminar el cambio:", error);
            }
        }
    }
    form.addEventListener("submit", async (event) => {
        event.preventDefault();
        const producto = document.getElementById("producto").value;
        const cantidad = parseInt(document.getElementById("cantidad").value, 10);
        const precio = parseFloat(document.getElementById("precio").value);
        const fecha = document.getElementById("fecha").value;
        const lote = document.getElementById("lote").value;
        const fechaVencimiento = document.getElementById("fechaVencimiento").value;
        const descripcion = document.getElementById("descripcion").value;
        const cliente = document.getElementById("cliente").value;
        const cambioData = {
            producto,
            cantidad,
            precio,
            fecha,
            lote,
            fecha_vencimiento: fechaVencimiento || null,
            descripcion: descripcion || null,
            cliente,
        };

        try {
            let response;
            if (editId) {
                response = await fetch(`/cambios/${editId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(cambioData)
                });
            } else {
                response = await fetch('/cambios', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(cambioData)
                });
            }
            const result = await response.json();
            if (response.ok) {
                alert(result.message);
                form.reset();
                editId = null;
                fetchCambios();
            } else {
                alert(result.error || "Error al guardar el cambio.");
            }
        } catch (error) {
            console.error("Error al guardar el cambio:", error);
        }
    });
    cargarClientes();
    fetchCambios();
});