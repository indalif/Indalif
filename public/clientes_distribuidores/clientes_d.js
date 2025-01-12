const clientesTable = document.getElementById('clientes-table');

// Función para cargar datos de los clientes desde el backend
function cargarClientes() {
    fetch('/traer_clientes', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Error al obtener los datos de los clientes.');
            }
            return response.json();
        })
        .then(clientes => {
            clientesTable.innerHTML = ''; // Limpiar la tabla antes de rellenarla

            if (clientes.length === 0) {
                clientesTable.innerHTML = `
                    <tr>
                        <td colspan="7" class="text-center">No hay clientes registrados.</td>
                    </tr>`;
                return;
            }

            clientes.forEach((cliente, index) => {
                const row = document.createElement('tr');

                row.innerHTML = `
                    <td>${index + 1}</td>
                    <td>${cliente.empresa_distribuidor || 'Sin Empresa'}</td>
                    <td>${cliente.nombre_cliente}</td>
                    <td>${cliente.nombre_local}</td>
                    <td>${cliente.direccion}</td>
                    <td>${cliente.ciudad}</td>
                    <td>${cliente.telefono}</td>
                `;
                clientesTable.appendChild(row);
            });
        })
        .catch(error => {
            console.error('Error al cargar los clientes:', error);
            clientesTable.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center text-danger">Error al cargar los datos de los clientes.</td>
                </tr>`;
        });
}


// Ejecutar la función cargarClientes cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    cargarClientes();
});
setInterval(cargarClientes, 3000);