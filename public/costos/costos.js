let totalesIngredientes = {};
let totalesPlasticos = {};
document.getElementById("agregar-btn").addEventListener("click", () => {
    const producto = document.getElementById("producto").value;
    const ingrediente = document.getElementById("ingrediente").value;
    const cantidadBulto = parseFloat(document.getElementById("cantidad-bulto").value) || 0;
    const precioBulto = parseFloat(document.getElementById("precio-bulto").value) || 0;
    const cantidadKg = parseFloat(document.getElementById("cantidad-kg").value) || 0;
    const cantidadUtilizo = parseFloat(document.getElementById("cantidad-utilizo").value) || 0;
    const rinde = parseFloat(document.getElementById("rinde").value) || 1;

    if (!producto || !ingrediente) {
        alert("Por favor, selecciona un producto y un ingrediente.");
        return;
    }
    const precioUnitario = (cantidadBulto > 0 ? precioBulto / cantidadBulto : 0).toFixed(2);
    const precio = (cantidadUtilizo * precioUnitario).toFixed(2);
    const totalIngredientes = (precio / rinde).toFixed(2);
    const ingredientesTableBody = document.getElementById("table-body");
    const newRow = `
        <tr data-producto="${producto}">
            <td>${producto}</td>
            <td>${ingrediente}</td>
            <td>${cantidadBulto}</td>
            <td>${precioBulto}</td>
            <td>${precioUnitario}</td>
            <td>${cantidadKg}</td>
            <td>${cantidadUtilizo}</td>
            <td>${precio}</td>
            <td>${rinde}</td>
            <td>${totalIngredientes}</td>
        </tr>
    `;
    ingredientesTableBody.insertAdjacentHTML("beforeend", newRow);
    if (!totalesIngredientes[producto]) {
        totalesIngredientes[producto] = 0;
    }
    totalesIngredientes[producto] += parseFloat(totalIngredientes);
    actualizarTotalPorPaquete(producto);
    enviarDatosAlServidor({
        producto,
        ingrediente,
        cantidad_bulto: cantidadBulto,
        precio_bulto: precioBulto,
        cantidad_kg: cantidadKg,
        cantidad_utilizo: cantidadUtilizo,
        rinde,
        total_ingredientes: parseFloat(totalIngredientes),
    });
    filtrarTablaPorProducto(producto);
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
    actualizarTotalPorPaquete(producto);
    enviarDatosAlServidor({
        producto,
        tipo_plastico: tipoPlastico,
        precio_plastico: precioPlastico,
    });
    filtrarTablaPorProducto(producto);
    document.getElementById("plasticos-form").reset();
});
function filtrarTablaPorProducto(producto) {
    const ingredientesRows = document.querySelectorAll("#table-body tr");
    const plasticosRows = document.querySelectorAll("#plasticos-table-body tr");

    ingredientesRows.forEach(row => {
        row.style.display = row.getAttribute("data-producto") === producto ? "" : "none";
    });

    plasticosRows.forEach(row => {
        row.style.display = row.getAttribute("data-producto") === producto ? "" : "none";
    });

    actualizarTotalPorPaquete(producto);
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
    // Recalcular totales a partir de las filas en las tablas
    let totalIngredientes = 0;
    let totalPlasticos = 0;

    document.querySelectorAll(`#table-body tr[data-producto="${producto}"]`).forEach(row => {
        totalIngredientes += parseFloat(row.children[9]?.textContent.trim()) || 0;
    });

    document.querySelectorAll(`#plasticos-table-body tr[data-producto="${producto}"]`).forEach(row => {
        totalPlasticos += parseFloat(row.children[2]?.textContent.trim()) || 0;
    });

    totalesIngredientes[producto] = totalIngredientes;
    totalesPlasticos[producto] = totalPlasticos;

    actualizarTotalPorPaquete(producto); // Reflejar el total recalculado
}

document.getElementById("producto").addEventListener("change", () => {
    const productoSeleccionado = document.getElementById("producto").value;
    if (productoSeleccionado) {
        cargarDatosProducto(productoSeleccionado); // Recarga datos del producto
    } else {
        cargarTodosLosDatos();
        document.getElementById("total-por-paquete").textContent = "Selecciona un producto para ver el total.";
    }
});

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
            if (Array.isArray(data)) {
                mostrarDatosEnTablas(data); 
            } else {
                console.error("Los datos no son un arreglo:", data);
                mostrarDatosEnTablas([]); 
            }
        })
        .catch(error => {
            console.error("Error al cargar todos los datos:", error);
            mostrarDatosEnTablas([]); 
        });
}
function mostrarDatosEnTablas(ingredientes, plasticos) {
    const tableBody = document.getElementById("table-body");
    const plasticosTableBody = document.getElementById("plasticos-table-body");
    tableBody.innerHTML = "";
    plasticosTableBody.innerHTML = "";
    ingredientes.forEach(row => {
        const precioUnitario = row.cantidad_bulto > 0 ? row.precio_bulto / row.cantidad_bulto : 0;
        const precioTotal = row.cantidad_utilizo * precioUnitario;
        const totalIngredientes = (precioTotal / row.rinde).toFixed(2);

        const newRow = `
            <tr data-id="${row.id}" data-producto="${row.producto}" data-tabla="ingredientes">
                <td>${row.producto}</td>
                <td>${row.ingrediente}</td>
                <td>${row.cantidad_bulto}</td>
                <td class="precio">${row.precio_bulto}</td>
                <td>${precioUnitario.toFixed(2)}</td>
                <td>${row.cantidad_kg}</td>
                <td>${row.cantidad_utilizo}</td>
                <td>${precioTotal.toFixed(2)}</td>
                <td>${row.rinde}</td>
                <td>${totalIngredientes}</td>
                <td>
                    <button class="btn btn-warning btn-sm actualizar-btn">Actualizar</button>
                    <button class="btn btn-danger btn-sm delete-btn">Eliminar</button>
                </td>
            </tr>
        `;
        tableBody.insertAdjacentHTML("beforeend", newRow);
    });
    plasticos.forEach(row => {
        const newRow = `
            <tr data-id="${row.id}" data-producto="${row.producto}" data-tabla="plasticos">
                <td>${row.producto}</td>
                <td>${row.tipo_plastico}</td>
                <td class="precio">${parseFloat(row.precio_plastico).toFixed(2)}</td>
                <td>
                    <button class="btn btn-warning btn-sm actualizar-btn">Actualizar</button>
                    <button class="btn btn-danger btn-sm delete-btn">Eliminar</button>
                </td>
            </tr>
        `;
        plasticosTableBody.insertAdjacentHTML("beforeend", newRow);
    });
    agregarEventosAcciones();
    actualizarTotalPorPaquete(producto);
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
document.getElementById("producto-plastico").addEventListener("change", () => {
    const productoSeleccionado = document.getElementById("producto-plastico").value;
    if (productoSeleccionado) {
        cargarDatosProducto(productoSeleccionado); 
    } else {
        cargarTodosLosDatos(); 
        document.getElementById("total-por-paquete").textContent = "Total por Paquete: $0.00";
    }
});
function agregarFilaTabla(datos) {
    const tabla = document.getElementById("table-body");
    const fila = document.createElement("tr");
    const precioUnitario = datos.precio_bulto / datos.cantidad_bulto;
    const precioTotal = datos.cantidad_utilizo * precioUnitario;
    const totalIngredientes = (precioTotal / datos.rinde).toFixed(2);
    fila.innerHTML = `
        <td>${datos.producto}</td>
        <td>${datos.ingrediente}</td>
        <td>${datos.cantidad_bulto}</td>
        <td>${datos.precio_bulto}</td>
        <td>${precioUnitario.toFixed(2)}</td>
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
        document.getElementById("cantidad-bulto").value = fila.children[2].textContent;
        document.getElementById("precio-bulto").value = fila.children[3].textContent;
        document.getElementById("cantidad-kg").value = fila.children[5].textContent;
        document.getElementById("cantidad-utilizo").value = fila.children[6].textContent;
        document.getElementById("rinde").value = fila.children[8].textContent;
    } else if (tipoFormulario === "plasticos") {
        document.getElementById("producto-plastico").value = fila.children[0].textContent;
        document.getElementById("tipo-plastico").value = fila.children[1].textContent;
        document.getElementById("precio-plastico").value = fila.children[2].textContent;
    }
}
document.getElementById("close-modal").addEventListener("click", () => {
    document.getElementById("modal-actualizar-precio").style.display = "none";
});
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
        const id = fila.getAttribute("data-id");
        const tipo = fila.getAttribute("data-tabla");
        const precioCelda = fila.querySelector(".precio");
        const precioActual = parseFloat(precioCelda.textContent);
        console.log("ID:", id, "Tipo de tabla:", tipo, "Precio actual:", precioActual);
        if (tipo !== "ingredientes" && tipo !== "plasticos") {
            console.error("Tipo de tabla inválido.");
            return;
        }
        abrirModalActualizarPrecio(id, tipo, precioActual);
    }
});
function actualizarTotalPorPaquete(producto) {
    let totalIngredientes = 0;
    let totalPlasticos = 0;

    // Sumar total de ingredientes desde la tabla
    document.querySelectorAll(`#table-body tr[data-producto="${producto}"]`).forEach(row => {
        const costoIngrediente = parseFloat(row.children[9]?.textContent.trim()) || 0; // Índice ajustado según la columna
        totalIngredientes += costoIngrediente;
    });

    // Sumar total de plásticos desde la tabla
    document.querySelectorAll(`#plasticos-table-body tr[data-producto="${producto}"]`).forEach(row => {
        const costoPlastico = parseFloat(row.children[2]?.textContent.trim()) || 0; // Índice ajustado según la columna
        totalPlasticos += costoPlastico;
    });

    // Calcular y mostrar el total por paquete
    const totalPaquete = totalIngredientes + totalPlasticos;
    document.getElementById("total-por-paquete").textContent =
        `Total por Paquete (${producto}): $${totalPaquete.toFixed(2)}`;
}

function abrirModalActualizarPrecio(id, tipo, precioActual) {
    const modal = document.getElementById("modal-actualizar-precio");
    modal.style.display = "flex";    
    document.getElementById("fila-id").value = id;
    document.getElementById("tipo-tabla").value = tipo;
    document.getElementById("nuevo-precio").value = precioActual;
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
            tipo, 
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
    const cantidadBulto = parseFloat(fila.children[2].textContent) || 0;
    const cantidadUtilizo = parseFloat(fila.children[6].textContent) || 0;
    const rinde = parseFloat(fila.children[8].textContent) || 1;

    const precioUnitario = cantidadBulto > 0 ? nuevoPrecio / cantidadBulto : 0;
    const precioTotal = cantidadUtilizo * precioUnitario;
    const totalIngredientes = (precioTotal / rinde).toFixed(2);

    fila.querySelector(".precio").textContent = nuevoPrecio.toFixed(2);
    fila.children[4].textContent = precioUnitario.toFixed(2); 
    fila.children[7].textContent = precioTotal.toFixed(2);   
    fila.children[9].textContent = totalIngredientes;       
}

function actualizarFilaPlasticos(fila, nuevoPrecio) {
    fila.querySelector(".precio").textContent = nuevoPrecio.toFixed(2);
}
