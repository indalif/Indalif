document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('materiaPrimaForm');
    const nuevoProductoInput = document.getElementById('nuevoProducto');
    const productoSelect = document.getElementById('producto');
    const agregarProductoButton = document.getElementById('agregarProducto');

    async function fetchDisponibilidadMateriaPrima() {
        try {
            const response = await fetch('/disponibilidad_materia_prima');
            if (!response.ok) {
                throw new Error('Error al obtener la disponibilidad');
            }
    
            const data = await response.json();
            const tableBody = document.getElementById('disponibilidadTableBody');
            tableBody.innerHTML = '';
    
            data.forEach(item => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${item.producto}</td>
                    <td>${item.lote}</td>
                    <td>${item.disponibilidad}</td>
                `;
                tableBody.appendChild(row);
            });
        } catch (error) {
            console.error('Error al obtener la disponibilidad:', error);
            alert('Error al cargar la disponibilidad de materia prima.');
        }
    }
    

    // Evento para agregar un nuevo producto al servidor y al select
    agregarProductoButton.addEventListener('click', async () => {
        const nuevoProducto = nuevoProductoInput.value.trim();

        if (nuevoProducto) {
            try {
                const response = await fetch('/agregar_producto', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ producto: nuevoProducto })
                });

                if (response.ok) {
                    // Agregar al select dinámicamente
                    const option = document.createElement('option');
                    option.value = nuevoProducto.toLowerCase();
                    option.textContent = nuevoProducto;
                    productoSelect.appendChild(option);

                    nuevoProductoInput.value = ''; // Limpiar el campo
                    alert('Producto agregado con éxito.');
                } else if (response.status === 409) {
                    alert('El producto ya existe.');
                } else {
                    alert('Error al agregar el producto.');
                }
            } catch (error) {
                console.error('Error en la solicitud:', error);
                alert('Error al enviar los datos. Inténtalo nuevamente.');
            }
        } else {
            alert('Ingrese un nombre válido para el producto.');
        }
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
    
        const producto = productoSelect.value;
        const tipo = document.getElementById('movimiento').value;
        const cantidad = parseInt(document.getElementById('cantidad').value, 10);
        const lote = document.getElementById('lote').value.trim();
    
        const movimientoData = { producto, tipo, cantidad, lote };
    
        try {
            const response = await fetch('/movimientos_materia_prima', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(movimientoData)
            });
    
            if (response.ok) {
                form.reset();
                fetchDisponibilidadMateriaPrima();
            } else {
                alert('Error al registrar el movimiento.');
            }
        } catch (error) {
            console.error('Error en la solicitud:', error);
            alert('Error al enviar los datos. Inténtalo nuevamente.');
        }
    });    
    // Cargar disponibilidad inicial de materia prima
    fetchDisponibilidadMateriaPrima();
});

const agregarProductoButton = document.getElementById('agregarProducto');


agregarProductoButton.addEventListener('click', () => {
    const nuevoProducto = nuevoProductoInput.value.trim();

    if (nuevoProducto) {
        // Agregar el producto al servidor
        fetch('/agregar_producto', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ producto: nuevoProducto })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Error al agregar producto');
            }
            return response.json();
        })
        .then(data => {
            alert('Producto agregado con éxito');
            nuevoProductoInput.value = ''; // Limpia el campo
            cargarProductos(); // Recargar productos en el select
        })
        .catch(error => {
            console.error('Error al agregar producto:', error);
            alert('Hubo un error al agregar el producto.');
        });
    } else {
        alert('Ingrese un nombre válido para el producto.');
    }
});


// Función para cargar los productos en el select
async function cargarProductos() {
    try {
        const response = await fetch('/productos');
        if (!response.ok) {
            throw new Error(`Error al obtener productos: ${response.statusText}`);
        }

        const productos = await response.json();
        console.log('Productos obtenidos:', productos); // Para depurar

        const productoSelect = document.getElementById('producto');

        // Limpia el select antes de agregar opciones
        productoSelect.innerHTML = `
            <option value="" disabled selected>Seleccione una opción</option>
        `;

        if (productos.length === 0) {
            console.warn('No hay productos disponibles en la base de datos.');
            return;
        }

        // Agrega cada producto al select
        productos.forEach(({ producto }) => {
            const option = document.createElement('option');
            option.value = producto.toLowerCase(); // Opcional: valor en minúsculas
            option.textContent = producto;
            productoSelect.appendChild(option);
        });
    } catch (error) {
        console.error('Error al cargar productos:', error);
    }
}

// Llama a la función cuando se carga la página
document.addEventListener('DOMContentLoaded', () => {
    cargarProductos();
    fetchDisponibilidadMateriaPrima();
});
