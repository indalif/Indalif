let totalesIngredientes = {};
let totalesPlasticos = {};
document.getElementById("producto").addEventListener("change", () => {
    const productoSeleccionado = document.getElementById("producto").value;
    filtrarTablaPorProducto(productoSeleccionado);
});
document.getElementById("producto-plastico").addEventListener("change", () => {
    const productoSeleccionado = document.getElementById("producto-plastico").value;
    filtrarTablaPorProducto(productoSeleccionado);
});
document.getElementById("agregar-btn").addEventListener("click", () => {
    const producto = document.getElementById("producto").value;
    const ingrediente = document.getElementById("ingrediente").value;
    const precioUnitario = parseFloat(document.getElementById("precio-unitario").value) || 0;
    const cantidadKg = parseFloat(document.getElementById("cantidad-kg").value) || 0;
    const cantidadUtilizo = parseFloat(document.getElementById("cantidad-utilizo").value) || 0;
    const rinde = parseFloat(document.getElementById("rinde").value) || 1;

    if (!producto || !ingrediente) {
        alert("Por favor, selecciona un producto y un ingrediente.");
        return;
    }

    const precio = (cantidadUtilizo * precioUnitario).toFixed(2);
    const totalIngredientes = (precio / rinde).toFixed(2);
    const ingredientesTableBody = document.getElementById("table-body");
    const newRow = `
        <tr data-producto="${producto}">
            <td>${producto}</td>
            <td>${ingrediente}</td>
            <td>${precioUnitario.toFixed(2)}</td>
            <td>${cantidadKg}</td>
            <td>${cantidadUtilizo}</td>
            <td>${precio}</td>
            <td>${rinde}</td>
            <td>${totalIngredientes}</td>
        </tr>
    `;
    ingredientesTableBody.insertAdjacentHTML("beforeend", newRow);

    enviarDatosAlServidor({
        producto,
        ingrediente,
        precio_unitario: precioUnitario,
        cantidad_kg: cantidadKg,
        cantidad_utilizo: cantidadUtilizo,
        rinde,
        total_ingredientes: parseFloat(totalIngredientes),
    });
    document.getElementById("ingredientes-form").reset();
});
document.getElementById("agregar-plastico-btn").addEventListener("click", () => {
    const producto = document.getElementById("producto-plastico").value;
    const tipoPlastico = document.getElementById("tipo-plastico").value;
    const precioPlastico = parseFloat(document.getElementById("precio-plastico").value) || 0;

    if (!producto || !tipoPlastico) {
        alert("Por favor, selecciona un producto y un tipo de plástico.");
        return;
    }
    const plasticosTableBody = document.getElementById("plasticos-table-body");
    const newRow = `
        <tr data-producto="${producto}">
            <td>${producto}</td>
            <td>${tipoPlastico}</td>
            <td>${precioPlastico.toFixed(2)}</td>
        </tr>
    `;
    plasticosTableBody.insertAdjacentHTML("beforeend", newRow);

    if (!totalesPlasticos[producto]) {
        totalesPlasticos[producto] = 0;
    }
    totalesPlasticos[producto] += precioPlastico;
    enviarDatosAlServidor({
        producto,
        tipo_plastico: tipoPlastico,
        precio_plastico: precioPlastico,
    });
    document.getElementById("plasticos-form").reset();
});
document.addEventListener("DOMContentLoaded", () => {
    // Ocultar todas las filas al inicio
    ocultarTodasLasFilas();
    
    // Escuchar cambios en los selects de productos
    document.getElementById("producto").addEventListener("change", manejarCambioProducto);
    document.getElementById("producto-plastico").addEventListener("change", manejarCambioProducto);
});
function manejarCambioProducto() {
    const productoSeleccionado = document.getElementById("producto").value;

    if (productoSeleccionado) {
        filtrarTablaPorProducto(productoSeleccionado);
    } else {
        ocultarTodasLasFilas();
    }
}
function filtrarTablaPorProducto(producto) {
    console.log("Filtrando tabla para producto:", producto);

    ocultarTodasLasFilas(); // Oculta todas las filas antes de mostrar las correctas

    document.querySelectorAll("#table-body tr, #plasticos-table-body tr").forEach(row => {
        const primeraCelda = row.cells[0]; // La celda donde está el nombre del producto
        if (primeraCelda && primeraCelda.textContent.trim() === producto) {
            row.style.display = ""; // Mostrar fila si coincide con el producto seleccionado
        }
    });

    recalcularTotalesProducto(producto);
}
function ocultarTodasLasFilas() {
    document.querySelectorAll("#table-body tr, #plasticos-table-body tr").forEach(row => {
        row.style.display = "none";
    });
}
document.addEventListener("DOMContentLoaded", () => {
    cargarTodosLosDatos(); // Carga los datos al inicio
});
function cargarDatosProducto(producto) {
    fetch(`/obtener_costos_producto/${producto}`)
        .then(response => response.json())
        .then(data => {
            mostrarDatosEnTablas(data.ingredientes, data.plasticos);
            recalcularTotalesProducto(producto); // Recalcular totales
        })
        .catch(error => console.error("Error al cargar datos del producto:", error));
}
function recalcularTotalesProducto(producto) {
    let totalIngredientes = 0;
    let totalPlasticos = 0;
    document.querySelectorAll(`#table-body tr[data-producto="${producto}"]`).forEach(row => {
        const costoIngrediente = parseFloat(row.children[7]?.textContent.trim()) || 0;
        totalIngredientes += costoIngrediente;
    });

    document.querySelectorAll(`#plasticos-table-body tr[data-producto="${producto}"]`).forEach(row => {
        totalPlasticos += parseFloat(row.children[2]?.textContent.trim()) || 0;
    });

    totalesIngredientes[producto] = totalIngredientes;
    totalesPlasticos[producto] = totalPlasticos;
    actualizarTotalPorPaquete(producto);
}
function enviarDatosAlServidor(datos) {
    fetch("/registrar_costos", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(datos),
    })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                console.error("Error al registrar costos:", data.error);
                alert("Hubo un error al registrar los costos.");
            } else {
                console.log("Costo registrado con éxito:", data);
            }
        })
        .catch(error => {
            console.error("Error al conectarse con el servidor:", error);
            alert("No se pudo conectar con el servidor.");
        });
}
function agregarEventosAcciones() {
    document.querySelectorAll(".edit-btn").forEach(btn => {
        btn.addEventListener("click", (e) => {
            const fila = e.target.closest("tr");
            habilitarEdicion(fila);
        });
    });
    document.querySelectorAll(".delete-btn").forEach(btn => {
        btn.addEventListener("click", (e) => {
            const fila = e.target.closest("tr");
            const id = fila.getAttribute("data-id");
            const producto = fila.getAttribute("data-producto");

            if (!id) {
                alert("No se puede eliminar el registro sin un ID válido.");
                return;
            }
            if (!confirm("¿Estás seguro de que deseas eliminar este registro?")) {
                return;
            }

            fetch(`/eliminar_costo/${id}`, {
                method: "DELETE",
            })
                .then(response => response.json())
                .then(data => {
                    if (data.error) {
                        console.error("Error al eliminar el costo:", data.error);
                        alert("Hubo un error al eliminar el costo.");
                    } else {
                        console.log("Costo eliminado con éxito:", data);
                        fila.remove();
                        actualizarTotalPorPaquete(producto);
                    }
                })
                .catch(error => {
                    console.error("Error al conectarse con el servidor:", error);
                    alert("No se pudo conectar con el servidor para eliminar el costo.");
                });
        });
    });
}
function cargarTodosLosDatos() {
    fetch("/obtener_todos_costos")
        .then(response => response.json())
        .then(data => {
            if (data.ingredientes && data.plasticos) {
                mostrarDatosEnTablas(data.ingredientes, data.plasticos);
            } else {
                console.error("Estructura de datos incorrecta:", data);
                mostrarDatosEnTablas([], []);
            }
        })
        .catch(error => {
            console.error("Error al cargar todos los datos:", error);
            mostrarDatosEnTablas([], []);
        });
}
function mostrarDatosEnTablas(ingredientes, plasticos) {
    const tableBody = document.getElementById("table-body");
    const plasticosTableBody = document.getElementById("plasticos-table-body");
    tableBody.innerHTML = "";
    plasticosTableBody.innerHTML = "";

    ingredientes.forEach(row => {
        console.log("Datos de fila:", row); // Verificar los valores recibidos

        const precioUnitario = parseFloat(row.precio_unitario) || 0;
        const precioTotal = (parseFloat(row.cantidad_utilizo) || 0) * precioUnitario;
        const totalIngredientes = (precioTotal / (parseFloat(row.rinde) || 1)).toFixed(2);

        const newRow = `
            <tr data-id="${row.id}" data-producto="${row.producto}" data-tabla="ingrediente">
                <td>${row.producto}</td>
                <td>${row.ingrediente}</td>
                <td class="precio">${precioUnitario.toFixed(2)}</td>
                <td>${row.cantidad_kg}</td>
                <td>${row.cantidad_utilizo}</td>
                <td>${precioTotal.toFixed(2)}</td>
                <td>${row.rinde}</td>
                <td>${totalIngredientes}</td>
                <td>
                    <button class="btn btn-warning btn-sm actualizar-btn">Editar</button>
                    <button class="btn btn-danger btn-sm delete-btn">Eliminar</button>
                </td>
            </tr>
        `;
        tableBody.insertAdjacentHTML("beforeend", newRow);
    });

    plasticos.forEach(row => {
        const precioPlastico = parseFloat(row.precio_plastico) || 0;

        const newRow = `
            <tr data-id="${row.id}" data-producto="${row.producto}" data-tabla="plastico">
                <td>${row.producto}</td>
                <td>${row.tipo_plastico}</td>
                <td class="precio">${precioPlastico.toFixed(2)}</td>
                <td>
                    <button class="btn btn-warning btn-sm actualizar-btn">Editar</button>
                    <button class="btn btn-danger btn-sm delete-btn">Eliminar</button>
                </td>
            </tr>
        `;
        plasticosTableBody.insertAdjacentHTML("beforeend", newRow);
    });

    agregarEventosAcciones();

    if (ingredientes.length > 0) {
        actualizarTotalPorPaquete(ingredientes[0].producto);
    }
}
function calcularTotalDesdeServidor(producto) {
    fetch(`/total_por_paquete/${producto}`)
        .then(response => response.json())
        .then(data => {
            const totalPorPaquete = parseFloat(data.total_por_paquete) || 0; // Convierte a número o usa 0
            document.getElementById("total-por-paquete").textContent =
                `Total por Paquete (${producto}): $${totalPorPaquete.toFixed(2)}`;
        })
        .catch(error => {
            console.error("Error al calcular total por paquete:", error);
            document.getElementById("total-por-paquete").textContent =
                `No se pudo calcular el total para ${producto}`;
        });
}
function agregarFilaTabla(datos) {
    const tabla = document.getElementById("table-body");
    const fila = document.createElement("tr");
    const precioTotal = datos.cantidad_utilizo * datos.precio_unitario;
    const totalIngredientes = (precioTotal / datos.rinde).toFixed(2);
    fila.innerHTML = `
        <td>${datos.producto}</td>
        <td>${datos.ingrediente}</td>
        <td>${datos.precio_unitario.toFixed(2)}</td>
        <td>${datos.cantidad_kg}</td>
        <td>${datos.cantidad_utilizo}</td>
        <td>${precioTotal.toFixed(2)}</td>
        <td>${datos.rinde}</td>
        <td>${totalIngredientes}</td>
        <td>
            <button class="btn btn-danger btn-sm delete-btn">Eliminar</button>
        </td>
    `;
    tabla.appendChild(fila);
}
function cargarDatosEnFormulario(fila) {
    const tipoFormulario = fila.parentNode.id === "table-body" ? "ingredientes" : "plasticos";
    if (tipoFormulario === "ingredientes") {
        document.getElementById("producto").value = fila.children[0].textContent;
        document.getElementById("ingrediente").value = fila.children[1].textContent;
        document.getElementById("precio-unitario").value = fila.children[2].textContent;
        document.getElementById("cantidad-kg").value = fila.children[3].textContent;
        document.getElementById("cantidad-utilizo").value = fila.children[4].textContent;
        document.getElementById("rinde").value = fila.children[6].textContent;
    } else if (tipoFormulario === "plasticos") {
        document.getElementById("producto-plastico").value = fila.children[0].textContent;
        document.getElementById("tipo-plastico").value = fila.children[1].textContent;
        document.getElementById("precio-plastico").value = fila.children[2].textContent;
    }
}
function recalcularTotalPlasticoPorProducto(producto) {
    let totalPlasticos = 0;
    document.querySelectorAll(`#plasticos-table-body tr[data-producto="${producto}"] .precio`).forEach(celda => {
        totalPlasticos += parseFloat(celda.textContent) || 0;
    });
    totalesPlasticos[producto] = totalPlasticos;
    actualizarTotalPorPaquete(producto);
}
document.addEventListener("click", (e) => {
    if (e.target.classList.contains("actualizar-btn")) {
        const fila = e.target.closest("tr");
        const tipo = fila.getAttribute("data-tabla");
        const id = fila.getAttribute("data-id");

        if (tipo === "ingrediente") {
            editarFilaIngrediente(fila, id);
        } else if (tipo === "plastico") {
            editarFilaPlastico(fila, id);
        }
    }

    if (e.target.classList.contains("guardar-btn")) {
        const fila = e.target.closest("tr");
        const id = fila.getAttribute("data-id");
        const tipo = fila.getAttribute("data-tabla");

        if (tipo === "ingrediente") {
            guardarFilaIngrediente(fila, id);
        } else if (tipo === "plastico") {
            guardarFilaPlastico(fila, id);
        }
    }
});
function editarFilaIngrediente(fila, id) {
    const celdas = fila.children;

    const producto = celdas[0].textContent;
    const ingrediente = celdas[1].textContent;
    const precioUnitario = parseFloat(celdas[2].textContent);
    const cantidadKg = parseFloat(celdas[3].textContent);
    const cantidadUtilizo = parseFloat(celdas[4].textContent);
    const rinde = parseFloat(celdas[6].textContent);

    fila.innerHTML = `
        <td><input type="text" value="${producto}"></td>
        <td><input type="text" value="${ingrediente}"></td>
        <td><input type="number" step="0.01" value="${precioUnitario}"></td>
        <td><input type="number" step="0.01" value="${cantidadKg}"></td>
        <td><input type="number" step="0.01" value="${cantidadUtilizo}"></td>
        <td></td>
        <td><input type="number" step="0.01" value="${rinde}"></td>
        <td></td>
        <td>
            <button class="btn btn-success btn-sm guardar-btn">Guardar</button>
        </td>
    `;
}
function guardarFilaIngrediente(fila, id) {
    const inputs = fila.querySelectorAll("input");
    const [productoInput, ingredienteInput, precioInput, kgInput, utilizoInput, rindeInput] = inputs;

    const producto = productoInput.value;
    const ingrediente = ingredienteInput.value;
    const precioUnitario = parseFloat(precioInput.value) || 0;
    const cantidadKg = parseFloat(kgInput.value) || 0;
    const cantidadUtilizo = parseFloat(utilizoInput.value) || 0;
    const rinde = parseFloat(rindeInput.value) || 1;

    const precioTotal = (cantidadUtilizo * precioUnitario).toFixed(2);
    const totalIngredientes = (precioTotal / rinde).toFixed(2);

    // Actualizar visualmente la fila
    fila.innerHTML = `
        <td>${producto}</td>
        <td>${ingrediente}</td>
        <td class="precio">${precioUnitario.toFixed(2)}</td>
        <td>${cantidadKg}</td>
        <td>${cantidadUtilizo}</td>
        <td>${precioTotal}</td>
        <td>${rinde}</td>
        <td>${totalIngredientes}</td>
        <td>
            <button class="btn btn-warning btn-sm actualizar-btn">Editar</button>
            <button class="btn btn-danger btn-sm delete-btn">Eliminar</button>
        </td>
    `;
    fila.setAttribute("data-producto", producto);

    // Enviar cambios al servidor
    fetch(`/actualizar_costo/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            producto,
            ingrediente,
            precio_unitario: precioUnitario,
            cantidad_kg: cantidadKg,
            cantidad_utilizo: cantidadUtilizo,
            rinde
        })
    })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                recalcularTotalesProducto(producto);
            } else {
                alert("Error al guardar los cambios");
                console.error(data.error);
            }
        });
}
function editarFilaPlastico(fila, id) {
    const celdas = fila.children;

    const producto = celdas[0].textContent;
    const tipoPlastico = celdas[1].textContent;
    const precioPlastico = parseFloat(celdas[2].textContent);

    fila.innerHTML = `
        <td><input type="text" value="${producto}"></td>
        <td><input type="text" value="${tipoPlastico}"></td>
        <td><input type="number" step="0.01" value="${precioPlastico}"></td>
        <td>
            <button class="btn btn-success btn-sm guardar-btn">Guardar</button>
        </td>
    `;
}
function guardarFilaPlastico(fila, id) {
    const inputs = fila.querySelectorAll("input");
    const [productoInput, tipoInput, precioInput] = inputs;

    const producto = productoInput.value;
    const tipoPlastico = tipoInput.value;
    const precioPlastico = parseFloat(precioInput.value) || 0;

    fila.innerHTML = `
        <td>${producto}</td>
        <td>${tipoPlastico}</td>
        <td class="precio">${precioPlastico.toFixed(2)}</td>
        <td>
            <button class="btn btn-warning btn-sm actualizar-btn">Editar</button>
            <button class="btn btn-danger btn-sm delete-btn">Eliminar</button>
        </td>
    `;
    fila.setAttribute("data-producto", producto);

    fetch(`/actualizar_plastico/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            producto,
            tipo_plastico: tipoPlastico,
            precio_plastico: precioPlastico
        })
    })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                recalcularTotalPlasticoPorProducto(producto);
            } else {
                alert("Error al guardar los cambios");
                console.error(data.error);
            }
        });
}
function actualizarTotalPorPaquete(producto) {
    let totalIngredientes = 0;
    let totalPlasticos = 0;

    document.querySelectorAll(`#table-body tr[data-producto="${producto}"]`).forEach(row => {
        const costoIngrediente = parseFloat(row.children[7]?.textContent.trim()) || 0; // Índice corregido
        totalIngredientes += costoIngrediente;
    });

    document.querySelectorAll(`#plasticos-table-body tr[data-producto="${producto}"]`).forEach(row => {
        const costoPlastico = parseFloat(row.children[2]?.textContent.trim()) || 0;
        totalPlasticos += costoPlastico;
    });

    const totalPaquete = totalIngredientes + totalPlasticos;
    document.getElementById("total-por-paquete").textContent =
        `Total por Paquete (${producto}): $${totalPaquete.toFixed(2)}`;
}
document.getElementById("form-actualizar-precio").addEventListener("submit", (e) => {
    e.preventDefault();
    const id = document.getElementById("fila-id").value;
    const tipo = document.getElementById("tipo-tabla").value;
    const nuevoPrecio = parseFloat(document.getElementById("nuevo-precio").value);
    if (isNaN(nuevoPrecio) || nuevoPrecio <= 0) {
        alert("Por favor, ingresa un precio válido.");
        return;
    }
    fetch("/actualizar_costo", {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            id,
            tipo, // Se envía "ingrediente" o "plastico"
            nuevoPrecio,
        }),
    })    
        .then((response) => {
            if (!response.ok) {
                console.error("Error en la solicitud:", response.statusText);
                throw new Error("No se pudo actualizar el costo.");
            }
            return response.json();
        })
        .then((data) => {
            if (data.error) {
                alert("Error al actualizar el costo.");
                console.error(data.error);
            } else {
                const fila = document.querySelector(`tr[data-id="${id}"]`);
                const producto = fila.getAttribute("data-producto");

                if (fila && tipo === "ingredientes") {
                    actualizarFilaIngredientes(fila, nuevoPrecio);
                } else if (fila && tipo === "plasticos") {
                    actualizarFilaPlasticos(fila, nuevoPrecio);
                }

                actualizarTotalPorPaquete(producto);
                document.getElementById("modal-actualizar-precio").style.display = "none";
            }
        })
        .catch((error) => {
            console.error("Error al conectarse con el servidor:", error);
            alert("No se pudo conectar con el servidor.");
        });
});
function actualizarFilaIngredientes(fila, nuevoPrecio) {
    const cantidadUtilizo = parseFloat(fila.children[3].textContent) || 0; // Índice corregido
    const rinde = parseFloat(fila.children[5].textContent) || 1; // Índice corregido

    const precioTotal = cantidadUtilizo * nuevoPrecio;
    const totalIngredientes = (precioTotal / rinde).toFixed(2);

    fila.children[2].textContent = nuevoPrecio.toFixed(2); // Actualiza solo el precio unitario
    fila.children[4].textContent = precioTotal.toFixed(2); // Recalcula precio total
    fila.children[6].textContent = totalIngredientes; // Recalcula total ingredientes
}
function actualizarFilaPlasticos(fila, nuevoPrecio) {
    fila.querySelector(".precio").textContent = nuevoPrecio.toFixed(2);
}