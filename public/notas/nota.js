let clientesData = [];
document.addEventListener('DOMContentLoaded', async () => {
    try {
        const response = await fetch('/clientes');
        const data = await response.json();

        console.log('Clientes recibidos:', data);

        if (!Array.isArray(data.clientes)) {
            throw new Error('La respuesta no contiene un array de clientes');
        }

        clientesData = data.clientes;  // Guardamos el array completo para después

        const clienteSelect = document.getElementById('cliente');
        clienteSelect.innerHTML = '<option value="">Seleccione un cliente</option>';
        data.clientes.forEach(cliente => {
            let option = document.createElement('option');
            option.value = cliente.id;
            option.textContent = cliente.nombre;
            clienteSelect.appendChild(option);
        });

        // Escuchamos el cambio del cliente para mostrar su dirección
        clienteSelect.addEventListener('change', () => {
            const clienteId = clienteSelect.value;
            const cliente = clientesData.find(c => c.id.toString() === clienteId);
            const direccionInput = document.getElementById('direccion');
            if (cliente) {
                direccionInput.value = cliente.direccion || 'Sin dirección registrada';
            } else {
                direccionInput.value = '';
            }
        });

    } catch (error) {
        console.error('Error obteniendo clientes:', error);
    }
});
let productosLista = [];
document.getElementById('agregarProducto').addEventListener('click', function (event) {
    event.preventDefault();
    const producto = document.getElementById('producto').value;
    const cantidad = document.getElementById('cantidad').value;
    const presentacion = document.getElementById('presentacion').options[document.getElementById('presentacion').selectedIndex].text;
    const descripcion = document.getElementById('descripcion').value.trim();

    if (!producto || !cantidad || !presentacion) {
        alert('Por favor, completa todos los campos.');
        return;
    }

    let editIndex = this.getAttribute('data-edit-index');
    if (editIndex !== null) {
        editIndex = parseInt(editIndex);
        productosLista[editIndex] = { producto, cantidad, presentacion, descripcion };
        this.innerHTML = '<i class="fas fa-plus me-2"></i>Agregar Producto';
        this.removeAttribute('data-edit-index');
    } else {
        productosLista.push({ producto, cantidad, presentacion, descripcion });
    }

    actualizarListaProductos();
    document.getElementById('producto').value = '';
    document.getElementById('cantidad').value = '';
    document.getElementById('presentacion').selectedIndex = 0;
    document.getElementById('descripcion').value = '';
});
document.getElementById('notaPedidoForm').addEventListener('submit', async function (event) {
    event.preventDefault();

    const numero_nota = document.getElementById('numero_nota').value;
    const clienteId = document.getElementById('cliente').value;
    const clienteNombre = document.getElementById('cliente').selectedOptions[0]?.text || '';
    const fecha = document.getElementById('fecha').value;
    const fechaEntrega = document.getElementById('fecha_entrega').value;

    if (!numero_nota || !clienteId || !fecha || !fechaEntrega || productosLista.length === 0) {
        return;
    }

    try {
        const response = await fetch('/notas-pedido', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ numero_nota, cliente_id: clienteId, fecha, fecha_entrega: fechaEntrega, productos: productosLista })
        });

        if (!response.ok) throw new Error('Error al guardar la nota de pedido.');

        const data = await response.json();
        alert('Nota de pedido guardada con éxito!');
        cargarNotas();
        console.log('Limpiando formulario...');
        document.getElementById('notaPedidoForm').reset(); // Intenta primero con reset()
        document.getElementById('numero_nota').value = '';
        document.getElementById('cliente').value = '';
        document.getElementById('fecha').value = '';
        document.getElementById('fecha_entrega').value = '';
        document.getElementById('producto').value = '';
        document.getElementById('cantidad').value = '';
        document.getElementById('presentacion').value = '';
        productosLista = [];
        document.getElementById('listaProductos').innerHTML = '';
        const notaVisual = document.getElementById('notaVisual');
        if (notaVisual) {
            notaVisual.style.display = 'none';
        }

        console.log('Formulario limpio.');

    } catch (error) {
        console.error('Error:', error);
    }
});
function imprimirNota(button) {
    let notaDiv = button.parentElement;
    let numeroNota = notaDiv.querySelector("h5").innerText.replace("Número de Nota:", "").trim();
    let cliente = notaDiv.querySelector("p:nth-of-type(1)").innerText.replace("Cliente:", "").trim();
    let direccion = notaDiv.querySelector("p:nth-of-type(2)").innerText.replace("Dirección:", "").trim();
    let fecha = notaDiv.querySelector("p:nth-of-type(3)").innerText.replace("Fecha:", "").trim();
    let fechaEntrega = notaDiv.querySelector("p:nth-of-type(4)").innerText.replace("Fecha de Entrega:", "").trim();
    let productos = Array.from(notaDiv.querySelectorAll("ul li")).map(li => {
        let partes = li.innerText.match(/^(.*?) - Cantidad: (\d+), Presentación: (.+?)(?: - (.*))?$/);
        return partes ? { producto: partes[1], cantidad: partes[2], presentacion: partes[3], descripcion: partes[4] || "" } : null;
    }).filter(p => p !== null);
    let contenidoHTML = `
    <html>
        <head>
            <title>Nota de Pedido</title>
            <style>
                @page { size: A5; margin: 10mm; }
                body { font-family: Arial, sans-serif; text-align: center; }
                .nota-container {
                    width: 90%;
                    max-width: 140mm;
                    margin: auto;
                    padding: 10px;
                    border: 2px solid black;
                    text-align: left;
                }
                .nota-header {
                    text-align: center;
                    font-weight: bold;
                    font-size: 25px;
                    border-bottom: 2px solid black;
                    padding-bottom: 8px;
                    margin-bottom: 10px;
                }
                .nota-info {
                    font-size: 15px;
                    margin-bottom: 12px;
                    line-height: 1.6;
                }
                .productos-table {
                    width: 100%;
                    border-collapse: collapse;
                    font-size: 15px;
                }
                .productos-table th, .productos-table td {
                    border: 1px solid black;
                    padding: 6px;
                    text-align: center;
                }
                .productos-table th {
                    background-color: #f2f2f2;
                    font-weight: bold;
                }
                .firma {
                    font-weight: bold;
                    text-align: left;
                    margin-top: 15px;
                    padding-top: 10px;
                    border-top: 2px solid black;
                }
                .firma-espacio {
                    display: block;
                    margin-top: 25px;
                    text-align: center;
                    font-size: 16px;
                    font-weight: bold;
                }
            </style>
        </head>
        <body onload="window.print(); window.close();">
            <div class="nota-container">
                <div class="nota-header">NOTA DE PEDIDO</div>
                <div class="nota-info">
                    <p><strong>N° Nota:</strong> ${numeroNota}</p>
                    <p><strong>Cliente:</strong> ${cliente}</p>
                    <p><strong>Dirección:</strong> ${direccion}</p>
                    <p><strong>Fecha:</strong> ${fecha}</p>
                    <p><strong>Fecha de Entrega:</strong> ${fechaEntrega}</p>
                </div>
                <table class="productos-table">
                    <tr>
                        <th>Producto</th>
                        <th>Cantidad</th>
                        <th>Presentación</th>
                        <th>Descripción</th>
                    </tr>
                    ${productos.map(p => `
                        <tr>
                            <td>${p.producto}</td>
                            <td>${p.cantidad}</td>
                            <td>${p.presentacion}</td>
                            <td>${p.descripcion ? p.descripcion : ""}</td>
                        </tr>
                    `).join("")}
                </table>
                <div class="firma">
                    <span class="firma-espacio">Firma del Encargado: ________________________</span>
                </div>
            </div>
        </body>
        </html>
    `;

    let ventanaImpresion = window.open('', '_blank');
    ventanaImpresion.document.write(contenidoHTML);
    ventanaImpresion.document.close();
}
async function cargarNotas() {
    try {
        const response = await fetch('/notas-pedido');
        const data = await response.json();

        console.log('📌 Notas recibidas:', data);

        if (!Array.isArray(data.notas)) {
            throw new Error('❌ La respuesta no contiene un array de notas.');
        }

        const listaNotas = document.getElementById('listaNotas');
        listaNotas.innerHTML = ''; // ✅ Limpia la lista antes de cargar nuevas notas

        const formatFecha = (fechaISO) => {
            if (!fechaISO) return 'Fecha no disponible';
            const fecha = new Date(fechaISO);
            const dia = fecha.getUTCDate().toString().padStart(2, '0');
            const mes = (fecha.getUTCMonth() + 1).toString().padStart(2, '0');
            const anio = fecha.getUTCFullYear();
            return `${dia}/${mes}/${anio}`;
        };

        data.notas.forEach(nota => {
            let div = document.createElement('div');
            div.classList.add('border', 'p-3', 'mb-2');
            div.setAttribute('data-id', nota.id);

            let productos = [];

            try {
                if (Array.isArray(nota.productos)) {
                    productos = nota.productos;
                } else if (typeof nota.productos === 'string') {
                    productos = JSON.parse(nota.productos);
                    if (!Array.isArray(productos)) throw new Error("Productos no es un array después de parsear.");
                } else {
                    throw new Error("Formato desconocido de productos.");
                }
            } catch (error) {
                console.error("❌ Error parseando productos en nota ID", nota.id, ":", error);
                productos = [];
            }

            console.log("✅ Productos en nota ID", nota.id, ":", productos); // 🔍 DEBUG

            let productosHTML = productos.length > 0
                ? productos.map(p => `<li>${p.producto} - Cantidad: ${p.cantidad}, Presentación: ${p.presentacion}${p.descripcion ? " - " + p.descripcion : ""}</li>`).join("")
                : '<li class="text-warning">⚠️ No hay productos registrados</li>';

            div.innerHTML = `
                <h5>Número de Nota: ${nota.numero_nota}</h5>
                <p><strong>Cliente:</strong> ${nota.nombre_cliente}</p>
                <p><strong>Dirección:</strong> ${nota.direccion_cliente || 'Sin dirección registrada'}</p>
                <p><strong>Fecha:</strong> ${formatFecha(nota.fecha)}</p>
                <p><strong>Fecha de Entrega:</strong> ${formatFecha(nota.fecha_entrega)}</p>
                <h6>Productos:</h6>
                <ul>${productosHTML}</ul>
                <button onclick="imprimirNota(this)" class="btn btn-primary w-100 mt-3">
                    <i class="fas fa-print me-2"></i> Imprimir
                </button>
                <button onclick="marcarComoEntregado(this)" class="btn btn-success w-100 mt-3">
                    <i class="fas fa-check-circle me-2"></i> Marcar como Entregado
                </button>
                <button onclick="cargarNotaParaEditar(${nota.id})" class="btn btn-warning w-100 mt-3">
                    <i class="fas fa-edit me-2"></i> Editar
                </button>
            `;

            listaNotas.appendChild(div);
        });

    } catch (error) {
        console.error('🚨 Error obteniendo notas de pedido:', error);
        alert("Hubo un error al cargar las notas de pedido. Inténtalo nuevamente.");
    }
}
function editarNota(numeroNota, clienteId, fecha, fechaEntrega, productos) {
    document.getElementById('numero_nota').value = numeroNota;
    document.getElementById('cliente').value = clienteId;
    document.getElementById('fecha').value = fecha;
    document.getElementById('fecha_entrega').value = fechaEntrega;

    productosLista = productos; // Asignar productos al editar
    console.log('Productos cargados para edición:', productosLista);

    actualizarListaProductos();
}
async function marcarComoEntregado(button) {
    let pedidoDiv = button.parentElement;
    let pedidoId = pedidoDiv.getAttribute('data-id');

    if (!pedidoId) {
        console.error("Error: No se encontró el ID del pedido.");
        return;
    }

    let confirmar = confirm("¿Está seguro de que desea marcar este pedido como entregado?");
    if (!confirmar) return;

    try {
        const response = await fetch(`/notas-pedido/${pedidoId}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' }
        });

        if (!response.ok) {
            throw new Error("Error al eliminar la nota de pedido");
        }
        pedidoDiv.remove();
        alert("Pedido marcado como entregado y eliminado correctamente.");
    } catch (error) {
        console.error("Error al eliminar el pedido:", error);
    }
}
document.addEventListener('DOMContentLoaded', cargarNotas, marcarComoEntregado);
function agregarBotonEditar(notaDiv, nota) {
    let botonEditar = document.createElement('button');
    botonEditar.classList.add('btn', 'btn-warning', 'w-100', 'mt-2');
    botonEditar.innerHTML = '<i class="fas fa-edit me-2"></i> Editar';
    botonEditar.addEventListener('click', () => cargarNotaParaEditar(nota));
    notaDiv.appendChild(botonEditar);
}
function formatFechaParaInput(fechaISO) {
    return fechaISO ? fechaISO.split('T')[0] : '';
}
async function cargarNotaParaEditar(notaId) {
    try {
        const response = await fetch(`/notas-pedido/${notaId}`);
        const nota = await response.json();

        document.getElementById('numero_nota').value = nota.numero_nota;
        document.getElementById('cliente').value = nota.cliente_id;
        document.getElementById('fecha').value = formatFechaParaInput(nota.fecha);
        document.getElementById('fecha_entrega').value = formatFechaParaInput(nota.fecha_entrega);

        if (Array.isArray(nota.productos)) {
            productosLista = nota.productos;
        } else if (typeof nota.productos === "string") {
            try {
                productosLista = JSON.parse(nota.productos);
            } catch (error) {
                console.error("Error parseando productos:", error);
                productosLista = [];
            }
        } else {
            productosLista = [];
        }
        console.log("🔍 Productos cargados para edición:", productosLista);
        actualizarListaProductos();

        let btnEditar = document.getElementById('guardarNotaEditada');
        let btnGuardar = document.getElementById('guardarNota');

        if (btnEditar && btnGuardar) {
            btnEditar.style.display = 'block';
            btnGuardar.style.display = 'none';
        } else {
            console.error('Error: No se encontró el botón de edición o guardado.');
        }

        document.getElementById('guardarNotaEditada').setAttribute('data-id', nota.id);
    } catch (error) {
        console.error('Error al cargar la nota para editar:', error);
    }
}
function actualizarListaProductos() {
    console.log("Lista de productos:", productosLista);

    const listaProductos = document.getElementById('listaProductos');
    listaProductos.innerHTML = '';

    if (!Array.isArray(productosLista) || productosLista.length === 0) {
        listaProductos.innerHTML = '<li class="text-danger">No hay productos registrados</li>';
        return;
    }

    productosLista.forEach((producto, index) => {
        let item = document.createElement('li');
        item.classList.add('list-group-item');
        item.innerHTML = `
            ${producto.producto} - Cantidad: ${producto.cantidad}, Presentación: ${producto.presentacion}, Descripción: ${producto.descripcion || "Sin descripción"} 
            <button class="btn btn-sm btn-warning me-2" onclick="editarProducto(${index})">
                <i class="fas fa-edit"></i>
            </button>
            <button class="btn btn-sm btn-danger ms-2" onclick="eliminarProducto(${index})">
                <i class="fas fa-trash-alt"></i>
            </button>
        `;
        listaProductos.appendChild(item);
    });
}
function editarProducto(index) {
    const producto = productosLista[index];

    document.getElementById('producto').value = producto.producto;
    document.getElementById('cantidad').value = producto.cantidad;
    document.getElementById('presentacion').value = [...document.getElementById('presentacion').options]
        .find(option => option.text === producto.presentacion)?.value || "";
    document.getElementById('descripcion').value = producto.descripcion || ""; // ✅ Se asegura que la descripción no se pierda

    document.getElementById('agregarProducto').setAttribute('data-edit-index', index);
    document.getElementById('agregarProducto').innerHTML = `<i class="fas fa-save me-2"></i>Actualizar Producto`;

    event.preventDefault();
}
function eliminarProducto(index) {
    if (confirm('¿Estás seguro de eliminar este producto?')) {
        productosLista.splice(index, 1);
        actualizarListaProductos();
    }
}
async function guardarNotaEditada(event) {
    event.preventDefault();

    const notaId = document.getElementById('guardarNotaEditada').getAttribute('data-id');
    if (!notaId) {
        console.error("❌ No se encontró el ID de la nota para actualizar.");
        return;
    }

    const numero_nota = document.getElementById('numero_nota').value;
    const clienteId = document.getElementById('cliente').value;
    const fecha = document.getElementById('fecha').value;
    const fechaEntrega = document.getElementById('fecha_entrega').value;

    if (!numero_nota || !clienteId || !fecha || !fechaEntrega || productosLista.length === 0) {
        console.error("❌ Campos incompletos al intentar actualizar la nota.");
        return;
    }

    const datosActualizados = {
        numero_nota,
        cliente_id: clienteId,
        fecha,
        fecha_entrega: fechaEntrega,
        productos: productosLista.map(p => ({
            producto: p.producto,
            cantidad: p.cantidad,
            presentacion: p.presentacion,
            descripcion: p.descripcion || ""  // ✅ Se asegura de que la descripción siempre esté
        }))
    };

    console.log("📌 Enviando datos actualizados:", datosActualizados);

    try {
        const response = await fetch(`/notas-pedido/${notaId}`, {
            method: 'PUT',
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(datosActualizados)
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Error al actualizar la nota de pedido: ${errorText}`);
        }

        alert('✅ Nota de pedido actualizada con éxito.');
        cargarNotas();
        document.getElementById('notaPedidoForm').reset();
        productosLista = [];
        document.getElementById('listaProductos').innerHTML = '';

        let btnEditar = document.getElementById('guardarNotaEditada');
        let btnGuardar = document.getElementById('guardarNota');

        if (btnEditar && btnGuardar) {
            btnEditar.style.display = 'none';
            btnGuardar.style.display = 'block';
        }

    } catch (error) {
        console.error("🚨 Error al actualizar la nota:", error);
    }
}
document.getElementById('guardarNotaEditada').addEventListener('click', guardarNotaEditada);