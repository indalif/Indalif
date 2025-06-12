let clienteActivoId = null;
document.getElementById('clienteForm').addEventListener('submit', function (e) {
    e.preventDefault();
    const idCliente = document.getElementById('idCliente').value;
    const nombre = document.getElementById('nombre').value;
    const cuit = document.getElementById('cuit').value;
    const direccion = document.getElementById('direccion').value;

    if (idCliente) {
        fetch(`/clientes/${idCliente}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({
                'nombre': nombre,
                'cuit': cuit,
                'direccion': direccion
            })
        })
            .then(response => response.json())
            .then(data => {
                console.log('Cliente editado:', data);
                document.getElementById('clienteForm').reset();
                document.getElementById('idCliente').value = '';
                cargarClientes();
            })
            .catch(error => console.error('Error:', error));
    } else {
        fetch('/clientes', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({
                'nombre': nombre,
                'cuit': cuit,
                'direccion': direccion
            })
        })
            .then(response => response.json())
            .then(data => {
                console.log('Cliente agregado:', data);
                cargarClientes();
            })
            .catch(error => console.error('Error:', error));
    }
});
document.getElementById('nombreCliente').addEventListener('input', function (event) {
    const filtroNombre = event.target.value;
    cargarClientes(filtroNombre);
});
function cargarClientes(filtroNombre = '') {
    fetch(`/clientes?nombre=${filtroNombre}`)
        .then(response => response.json())
        .then(data => {
            const lista = document.getElementById('listaClientes');
            lista.innerHTML = '';
            if (data.clientes.length === 0) {
                lista.innerHTML = '<li class="list-group-item">No se encontraron clientes</li>';
            } else {
                data.clientes.forEach(cliente => {
                    const li = document.createElement('li');
                    li.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-center');
                    li.innerHTML = `
                          <span><strong>Nombre:</strong> ${cliente.nombre} <br><strong>CUIT:</strong> ${cliente.cuit} <br><strong>Dirección:</strong> ${cliente.direccion}</span>
                        <div>
                            <button class="btn" title="Editar" onclick="editarCliente(${cliente.id}, '${cliente.nombre}', '${cliente.cuit}', '${cliente.direccion}')"><i class="bi bi-pencil icon-btn"></i></button>
                            <button class="btn" title="Eliminar" onclick="eliminarCliente(${cliente.id})"><i class="bi bi-trash icon-btn"></i></button>
                            <button class="btn btn-primary btn-sm" title="Ver Cambios" onclick="verCambios(${cliente.id}, '${cliente.nombre}')">Cambios</button>
                            <button class="btn btn-primary btn-sm" onclick="abrirPlazosPago(${cliente.id})">Plazos de Pago</button>
                            <button class="btn btn-primary btn-sm" onclick="abrirMercaderia(${cliente.id})">Mercadería</button>
                            <button class="btn btn-primary btn-sm" onclick="verMetricas(${cliente.id}, '${cliente.nombre}')">Ver Métricas</button>
                        </div>
                    `;
                    lista.appendChild(li);
                });
            }
        })
        .catch(error => console.error('Error cargando clientes:', error));
}
function verCambios(idCliente, nombreCliente) {
    const modal = new bootstrap.Modal(document.getElementById('cambiosModal'))
    const titulo = document.getElementById('modalTitle');
    const cuerpo = document.getElementById('modalBody');

    titulo.textContent = `Cambios del Cliente: ${nombreCliente}`;
    cuerpo.innerHTML = `<p>Cargando cambios...</p>`;

    fetch(`/cambios/cliente/${idCliente}`)
        .then(response => response.json())
        .then(data => {
            if (data.length > 0) {
                let contenido = `<table class="table table-bordered">
                    <thead>
                        <tr>
                            <th>Producto</th>
                            <th>Cantidad</th>
                            <th>Precio</th>
                            <th>Total</th>
                            <th>Fecha</th>
                            <th>Lote</th>
                            <th>Fecha Vencimiento</th>
                            <th>Descripción</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${data.map(cambio => `
                            <tr>
                                <td>${cambio.producto}</td>
                                <td>${cambio.cantidad}</td>
                                <td>${parseFloat(cambio.precio).toFixed(2)}</td>
                                <td>${(cambio.cantidad * parseFloat(cambio.precio)).toFixed(2)}</td>
                                <td>${new Date(cambio.fecha).toLocaleDateString('es-ES')}</td>
                                <td>${cambio.lote}</td>
                                <td>${cambio.fecha_vencimiento ? new Date(cambio.fecha_vencimiento).toLocaleDateString('es-ES') : ''}</td>
                                <td>${cambio.descripcion || ''}</td>
                            </tr>`).join('')}
                    </tbody>
                </table>`;
                cuerpo.innerHTML = contenido;
            } else {
                cuerpo.innerHTML = '<p>No se encontraron cambios para este cliente.</p>';
            }
        })
        .catch(error => {
            console.error('Error al cargar los cambios del cliente:', error);
            cuerpo.innerHTML = `<p>Error al cargar los cambios.</p>`;
        });

    modal.show();
}
function editarCliente(id, nombre, cuit, direccion) {
    document.getElementById('idCliente').value = id;
    document.getElementById('nombre').value = nombre;
    document.getElementById('cuit').value = cuit;
    document.getElementById('direccion').value = direccion;
    document.getElementById('submitBtn').textContent = 'Editar Cliente';
}
function eliminarCliente(id) {
    fetch(`/clientes/${id}`, { method: 'DELETE' })
        .then(response => {
            if (!response.ok) {
                throw new Error('Error al eliminar cliente');
            }
            return response.json();
        })
        .then(data => {
            console.log('Cliente eliminado:', data);
            cargarClientes();
        })
        .catch(error => {
            console.error('Error:', error);
        });
}
document.getElementById('nombreCliente').addEventListener('input', function (event) {
    const filtroNombre = event.target.value;
    cargarClientes(filtroNombre);
});
cargarClientes();
const formatearFecha = (fechaISO) => {
    const fecha = new Date(fechaISO);
    const dia = fecha.getUTCDate().toString().padStart(2, '0');
    const mes = (fecha.getUTCMonth() + 1).toString().padStart(2, '0');
    const anio = fecha.getUTCFullYear();
    return `${dia}/${mes}/${anio}`;
};
function abrirPlazosPago(idCliente) {
    clienteActivoId = idCliente;
    const modal = new bootstrap.Modal(document.getElementById('plazosPagoModal'));
    document.getElementById('plazosPagoForm').reset();
    document.getElementById('plazosPagoTabla').innerHTML = '';
    cargarPlazosPago(idCliente);
    modal.show();
    document.getElementById('plazosPagoForm').onsubmit = function (e) {
        e.preventDefault();
        guardarPlazosPago(idCliente);
    };
}
function guardarPlazosPago(idCliente) {
    const formaPago = document.getElementById('formaPago').value;
    const totalPagar = document.getElementById('totalPagar').value;
    const fechaPago = new Date(document.getElementById('fechaPago').value + 'T00:00:00Z').toISOString();
    const fechaEmision = new Date(document.getElementById('fechaEmision').value + 'T00:00:00Z').toISOString();
    const pago = document.getElementById('pago').value || null;
    const numeroComprobante = document.getElementById('numeroComprobante').value || null;

    fetch(`/plazos-pago`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idCliente, formaPago, totalPagar, fecha: fechaPago, pago, numeroComprobante, fechaEmision })
    })
        .then(response => {
            if (!response.ok) throw new Error('Error al guardar plazo de pago');
            return response.json();
        })
        .then(() => {
            document.getElementById('plazosPagoForm').reset();
            cargarPlazosPago(idCliente);
        })
        .catch(error => console.error('Error al guardar plazos de pago:', error));
}
function cargarPlazosPago(idCliente) {
    fetch(`/plazos-pago/${idCliente}`)
        .then(response => {
            if (!response.ok) throw new Error('Error al cargar plazos de pago');
            return response.json();
        })
        .then(data => {
            const tabla = document.getElementById('plazosPagoTabla');
            tabla.innerHTML = '';
            let totalDeuda = 0;

            if (data.length === 0) {
                tabla.innerHTML = '<tr><td colspan="9">No se encontraron registros</td></tr>';
                document.getElementById('totalDeuda').textContent = '0.00';
                return;
            }

            // ORDENAR por fecha de pago (plazo.fecha) en orden descendente
            data.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

            data.forEach(plazo => {
                const total = parseFloat(plazo.totalPagar) || 0;
                const pago = parseFloat(plazo.pago) || 0;
                const debe = total - pago;

                if (debe > 0) totalDeuda += debe;

                const fila = `
            <tr>
                <td>${plazo.formaPago}</td>
                <td>${total.toFixed(2)}</td>
                <td>${formatearFecha(plazo.fechaEmision)}</td>
                <td>${formatearFecha(plazo.fecha)}</td>
                <td>${pago.toFixed(2)}</td>
                <td>${plazo.numeroComprobante || '-'}</td>
                <td>${debe === 0 ? '<span class="text-success">Saldada</span>' : debe.toFixed(2)}</td>
                <td>
                    ${debe > 0
                        ? `<button class="btn btn-success btn-sm" onclick="abrirRegistrarPago(${plazo.idPlazo}, ${debe})">Registrar Pago</button>`
                        : '<span class="text-muted">Pago completo</span>'}
                </td>
            </tr>
        `;

                tabla.insertAdjacentHTML('beforeend', fila);
            });

            document.getElementById('totalDeuda').textContent = totalDeuda.toFixed(2);
        })
        .catch(error => console.error('Error al cargar plazos de pago:', error));
}
function registrarPago(idPlazo, montoPago) {
    console.log('Datos recibidos para registrar el pago:', { idPlazo, montoPago });

    if (!idPlazo || !montoPago || isNaN(montoPago)) {
        console.error('Datos inválidos para registrar el pago:', { idPlazo, montoPago });
        alert('Los datos para registrar el pago no son válidos.');
        return;
    }

    fetch(`/plazos-pago/registrar-pago`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idPlazo, montoPago }),
    })
        .then((response) => {
            if (!response.ok) throw new Error('Error al registrar el pago');
            return response.json();
        })
        .then((data) => {
            alert('Pago registrado con éxito.');
            console.log('Respuesta del servidor:', data);
            if (clienteActivoId) cargarPlazosPago(clienteActivoId);
        })
        .catch((error) => console.error('Error al registrar el pago:', error));
}
function abrirRegistrarPago(idPlazo, saldoPendiente) {
    if (!idPlazo) {
        console.error('ID del plazo de pago no válido:', idPlazo);
        alert('No se puede registrar un pago porque el ID del plazo es inválido.');
        return;
    }

    const nuevoPago = prompt(`Registrar pago. Saldo pendiente: ${saldoPendiente.toFixed(2)}\nIngrese el monto a pagar:`);
    const montoPago = parseFloat(nuevoPago);

    if (isNaN(montoPago) || montoPago <= 0) {
        alert('Debe ingresar un monto válido.');
        return;
    }

    if (montoPago > saldoPendiente) {
        alert('El monto ingresado supera el saldo pendiente.');
        return;
    }
    registrarPago(idPlazo, montoPago);
}
let mercaderiaData = []; // Guarda los datos para filtrar
function cargarMercaderia(idCliente) {
    const tabla = document.getElementById('mercaderiaTabla');
    tabla.innerHTML = '<tr><td colspan="5" class="text-center">Cargando...</td></tr>';

    fetch(`/mercaderiaCliente/${idCliente}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Error al obtener los datos de la mercadería.');
            }
            return response.json();
        })
        .then(data => {
            mercaderiaData = data; // Guarda los datos para aplicar filtros
            renderizarTabla(data); // Renderiza la tabla
        })
        .catch(error => {
            tabla.innerHTML = '<tr><td colspan="5" class="text-center text-danger">Error al cargar la mercadería.</td></tr>';
            console.error('Error al cargar la mercadería:', error);
        });
}
function renderizarTabla(data) {
    const tabla = document.getElementById('mercaderiaTabla');
    if (data.length === 0) {
        tabla.innerHTML = '<tr><td colspan="6" class="text-center">No hay mercadería registrada.</td></tr>';
        return;
    }

    // Ordenar por fecha descendente (más reciente primero)
    data.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

    tabla.innerHTML = '';
    data.forEach(item => {
        const precio = parseFloat(item.precio) || 0;
        const cantidad = parseInt(item.cantidad, 10) || 0;
        const fechaCorregida = new Date(item.fecha);
        fechaCorregida.setMinutes(fechaCorregida.getMinutes() + fechaCorregida.getTimezoneOffset()); // Ajuste UTC

        const fila = `
            <tr data-id="${item.idMercaderia}">
                <td>${item.descripcion}</td>
                <td>${precio.toFixed(2)}</td>
                <td>${cantidad}</td>
                <td>${(precio * cantidad).toFixed(2)}</td>
                <td>${fechaCorregida.toLocaleDateString()}</td>
                <td>
                    <button class="btn btn-danger btn-sm" onclick="eliminarMercaderia(${item.idMercaderia})">
                        Eliminar
                    </button>
                </td>
            </tr>
        `;
        tabla.insertAdjacentHTML('beforeend', fila);
    });
}
function filtrarProducto() {
    const filtro = document.getElementById('filtroProducto').value;
    let datosFiltrados = filtro ? mercaderiaData.filter(item => item.descripcion === filtro) : mercaderiaData;

    // Ordenar los datos filtrados por fecha descendente
    datosFiltrados.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

    renderizarTabla(datosFiltrados);
}
function abrirMercaderia(idCliente) {
    clienteActivoId = idCliente;
    document.getElementById('mercaderiaForm').reset();
    cargarMercaderia(clienteActivoId);
    const modal = new bootstrap.Modal(document.getElementById('mercaderiaModal'));
    modal.show();
}
document.getElementById('mercaderiaForm').addEventListener('submit', function (e) {
    e.preventDefault();

    const producto = document.getElementById('producto').value.trim();
    const precio = parseFloat(document.getElementById('precio').value);
    const cantidad = parseInt(document.getElementById('cantidad').value, 10);
    const fecha = document.getElementById('fecha').value;

    if (!producto || isNaN(precio) || isNaN(cantidad) || !fecha) {
        alert('Por favor, complete todos los campos.');
        return;
    }

    fetch('/mercaderiaCliente', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            idCliente: clienteActivoId,
            descripcion: producto,
            precio,
            cantidad,
            fecha
        })
    })
        .then(response => response.json())
        .then(data => {
            if (data.message) {
                alert('Mercadería agregada con éxito.');
                cargarMercaderia(clienteActivoId); // Actualizar la tabla
            }
        })
        .catch(error => console.error('Error al guardar la mercadería:', error));
});
function eliminarMercaderia(idMercaderia) {
    if (!confirm('¿Está seguro de eliminar este registro?')) return;

    fetch(`/mercaderiaCliente/${idMercaderia}`, { method: 'DELETE' })
        .then(response => {
            if (!response.ok) {
                throw new Error('Error al eliminar mercadería.');
            }
            return response.json();
        })
        .then(data => {
            alert('Registro eliminado con éxito.');
            // Recargar la tabla tras eliminar
            cargarMercaderia(clienteActivoId);
        })
        .catch(error => {
            console.error('Error al eliminar la mercadería:', error);
            alert('No se pudo eliminar el registro.');
        });
}
function verMetricas(idCliente, nombreCliente) {
    const contenedor = document.createElement('div');

    contenedor.innerHTML = `
        <label>Desde: <input type="date" id="filtroDesde" class="form-control mb-2"></label>
        <label>Hasta: <input type="date" id="filtroHasta" class="form-control mb-2"></label>
        <button class="btn btn-primary mb-3" onclick="cargarMetricasCliente(${idCliente}, '${nombreCliente}')">Ver Métricas</button>
        <div id="resultadoMetricas"></div>
    `;

    const body = document.getElementById('metricasBody');
    body.innerHTML = '';
    body.appendChild(contenedor);

    new bootstrap.Modal(document.getElementById('metricasModal')).show();
}
function cargarMetricasCliente(idCliente, nombreCliente) {
    const desde = document.getElementById('filtroDesde').value;
    const hasta = document.getElementById('filtroHasta').value;

    if (!desde || !hasta) {
        alert("Seleccione ambas fechas.");
        return;
    }

    fetch(`/metricas/${idCliente}?desde=${desde}&hasta=${hasta}`)
        .then(res => res.json())
        .then(data => {
            const resultado = document.getElementById('resultadoMetricas');

            const totalCambios = parseFloat(data.totalCambios) || 0;
            const totalMercaderia = parseFloat(data.totalMercaderia) || 0;
            const totalACobrar = totalMercaderia - totalCambios;

            let html = `
    <div class="text-end mb-2">
        <button class="btn btn-sm btn-primary" onclick="capturarMetricas()">📸 Descargar captura</button>
    </div>
    <h5 class="text-center mb-2">Métricas de <strong>${nombreCliente}</strong></h5>
    <div class="row align-items-start">
        <div class="col-md-6">
            <h6 class="mb-2">Totales</h6>
            <ul class="mb-3" style="font-size: 0.95rem;">
                <li><strong>Total Mercadería:</strong> $${totalMercaderia.toFixed(2)}</li>
                <li><strong>Total Cambios:</strong> $${totalCambios.toFixed(2)}</li>
                <li><strong>Total a Cobrar:</strong> $${totalACobrar.toFixed(2)}</li>
            </ul>
        </div>
        <div class="col-md-6 text-center">
            <canvas id="graficoMetricas" style="max-width: 240px; margin: auto;"></canvas>
        </div>
    </div>

    <div class="row mt-1">
        <div class="col">
            <h6 class="mb-2">Detalle Cambios (acumulado por producto)</h6>
            <ul class="mb-2" style="font-size: 0.9rem;">
                ${data.cambios.length
                    ? data.cambios.map(c => `
                            <li>${c.producto}: ${c.cantidad} unidades a promedio $${parseFloat(c.precio).toFixed(2)}</li>
                        `).join('')
                    : '<li>No hay cambios</li>'
                }
            </ul>

            <h6 class="mb-2">Detalle Mercadería (acumulado por producto)</h6>
            <ul class="mb-2" style="font-size: 0.9rem;">
                ${data.mercaderia.length
                    ? data.mercaderia.map(m => `
                            <li>${m.descripcion}: ${m.cantidad} unidades a promedio $${parseFloat(m.precio).toFixed(2)}</li>
                        `).join('')
                    : '<li>No hay mercadería</li>'
                }
            </ul>
            `;

            resultado.innerHTML = html;
            // Crear el gráfico después de insertar el canvas
            const canvas = document.getElementById('graficoMetricas');
            if (!canvas) {
                console.error('Canvas para el gráfico no encontrado');
                return;
            }

            const ctx = canvas.getContext('2d');

            if (window.graficoMetricas instanceof Chart) {
                window.graficoMetricas.destroy();
            }

            window.graficoMetricas = new Chart(ctx, {
                type: 'pie', // podés cambiar a 'doughnut' si preferís tipo donut
                data: {
                    labels: ['Mercadería', 'Cambios'],
                    datasets: [{
                        data: [totalMercaderia, totalCambios],
                        backgroundColor: ['#ffda77', '#f67280']
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: {
                                color: '#5b1f0a',
                                font: { size: 14 }
                            }
                        },
                        title: {
                            display: true,
                            text: 'Distribución Mercadería vs. Cambios',
                            color: '#5b1f0a',
                            font: { size: 18 }
                        }
                    }
                }
            });
        })
        .catch(err => {
            console.error('Error al obtener métricas:', err);
            alert('Error al cargar métricas');
        });
}
function capturarMetricas() {
    const container = document.getElementById('resultadoMetricas');
    if (!container) {
        alert("No se encontró el área de métricas para capturar.");
        return;
    }

    html2canvas(container, {
        scale: 2, // Mejora la resolución
        useCORS: true
    }).then(canvas => {
        const link = document.createElement('a');
        link.download = 'metricas_cliente.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
    }).catch(err => {
        console.error('Error al capturar imagen:', err);
        alert("Ocurrió un error al generar la captura.");
    });
}
