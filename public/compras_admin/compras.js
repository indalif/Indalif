const pedidosTable = document.getElementById('pedidos-table');
function cargarPedidos() {
    fetch('/traer_pedidos', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Error al obtener los pedidos.');
            }
            return response.json();
        })
        .then(pedidos => {
            pedidosTable.innerHTML = ''; // Limpiar la tabla antes de rellenarla

            if (pedidos.length === 0) {
                pedidosTable.innerHTML = `
                    <tr>
                        <td colspan="7" class="text-center">No hay pedidos registrados.</td>
                    </tr>`;
                return;
            }

            pedidos.forEach((pedido, index) => {
                const row = document.createElement('tr');
                const productosFormateados = formatearProductos(pedido.producto);

                row.innerHTML = `
                    <td>${index + 1}</td>
                    <td>${pedido.vendedor}</td>
                    <td>${pedido.empresa}</td>
                    <td>${productosFormateados}</td>
                    <td>${pedido.fecha ? new Date(pedido.fecha).toLocaleString() : 'Fecha no disponible'}</td>
                    <td>
                        <select class="form-select" onchange="actualizarEstado(${pedido.id}, this.value)">
                            <option value="En Proceso" ${pedido.estado === 'En Proceso' ? 'selected' : ''}>En Proceso</option>
                            <option value="Finalizado" ${pedido.estado === 'Finalizado' ? 'selected' : ''}>Finalizado</option>
                        </select>
                    </td>
                    <td>
                        <button class="btn btn-primary btn-sm" onclick="imprimirPedido(${pedido.id})">
                            <i class="fas fa-print"></i> Imprimir
                        </button>
                    </td>
                `;
                pedidosTable.appendChild(row);
            });
        })
        .catch(error => {
            console.error('Error al cargar pedidos:', error);
            pedidosTable.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center text-danger">Error al cargar los pedidos.</td>
                </tr>`;
        });
}

function imprimirPedido(id) {
    fetch(`/traer_pedido/${id}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Error al obtener el pedido.');
            }
            return response.json();
        })
        .then(pedido => {
            const ventanaImpresion = window.open('', '_blank');
            const productosFormateados = formatearProductos(pedido.producto);

            ventanaImpresion.document.write(`
                <html>
                    <head>
                        <title>Pedido #${pedido.id}</title>
                        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/css/bootstrap.min.css" rel="stylesheet">
                    </head>
                    <body>
                        <div class="container mt-5">
                            <h1 class="text-center">Pedido #${pedido.id}</h1>
                            <p><strong>Vendedor:</strong> ${pedido.vendedor}</p>
                            <p><strong>Empresa:</strong> ${pedido.empresa}</p>
                            <p><strong>Fecha:</strong> ${pedido.fecha ? new Date(pedido.fecha).toLocaleString() : 'Fecha no disponible'}</p>
                            <p><strong>Productos:</strong><br>${productosFormateados}</p>
                            <p><strong>Estado:</strong> ${pedido.estado}</p>
                        </div>
                        <script>
                            window.print();
                        </script>
                    </body>
                </html>
            `);

            ventanaImpresion.document.close();
        })
        .catch(error => {
            console.error('Error al imprimir el pedido:', error);
        });
}

function actualizarEstado(id, estado) {
    fetch('/actualizar_estado', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, estado }),
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Error al actualizar el estado.');
            }
            return response.json();
        })
        .then(() => {
            if (estado === 'Finalizado') {
                cargarPedidos(); 
            }
        })
        .catch(error => {
            console.error('Error al actualizar el estado:', error);
        });
}
function formatearProductos(productosJson) {
    try {
        const productos = typeof productosJson === 'string' ? JSON.parse(productosJson) : productosJson;
        return productos
            .map(p => `${p.product} (Cantidad: ${p.quantity})`)
            .join('<br>');
    } catch (e) {
        console.error('Error al formatear productos:', e);
        return 'Datos inválidos';
    }
}
cargarPedidos();
setInterval(cargarPedidos, 3500);