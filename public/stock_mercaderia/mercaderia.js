const stockData = {
    "tapas-tradicionales": 100,
    "tapas-caseras": 100,
    "tapas-verdes": 100,
    "pascualinas-tradicionales": 100,
    "pascualinas-caseras": 100,
    "pascualinas-verdes": 100,
    "fideos-al-huevo": 100,
    "fideos-con-espinaca": 100,
    "ñoquis": 100,
    "ravioles-ricota-jamon": 100,
    "ravioles-vp": 100,
    "tapas-lasagna": 100,
};

function updateStockDisplay(productId) {
    const stockInfoElement = document.querySelector(`#${productId} .stock-info`);
    stockInfoElement.textContent = `Stock actual: ${stockData[productId]}`;
}

document.addEventListener("DOMContentLoaded", () => {
    Object.keys(stockData).forEach(productId => updateStockDisplay(productId));
});

function submitIngresoForm() {
    const product = document.getElementById("product").value;
    const productionDate = document.getElementById("production-date").value;
    const expiryDate = document.getElementById("expiry-date").value;
    const loteNumber = document.getElementById("lote-number").value;
    const quantity = parseInt(document.getElementById("quantity").value);

    if (product && productionDate && expiryDate && loteNumber && quantity > 0) {
        fetch('/mercaderia/ingreso', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                producto: product,
                fecha_produccion: productionDate,
                fecha_vencimiento: expiryDate,
                lote: loteNumber,
                cantidad: quantity
            })
        })
        .then(response => response.json())
        .then(data => {
            console.log(data.message);
            document.getElementById("product").value = '';
            document.getElementById("production-date").value = '';
            document.getElementById("expiry-date").value = '';
            document.getElementById("lote-number").value = '';
            document.getElementById("quantity").value = '';
            fetchProductData(product);
        })
        .catch(error => console.error('Error:', error));
    } else {
        alert("Por favor, complete todos los campos correctamente.");
    }
}

function submitEgresoForm(event, productName) {
    event.preventDefault();
    const form = event.currentTarget;
    const lote = form.querySelector(`#egreso-lote-${productName}`).value;
    const fechaVencimiento = form.querySelector(`#egreso-date-${productName}`).value;
    const cantidad = parseInt(form.querySelector(`#egreso-quantity-${productName}`).value);

    if (!lote || !fechaVencimiento || cantidad <= 0) {
        alert('Por favor, completa todos los campos con valores válidos.');
        return;
    }

    console.log(`Producto: ${productName}, Lote: ${lote}, Fecha: ${fechaVencimiento}, Cantidad: ${cantidad}`);

    fetch('/mercaderia/egreso', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            producto: productName,
            lote: lote,
            fecha_vencimiento: fechaVencimiento,
            cantidad: cantidad
        })
    })
    .then(response => response.json())
    .then(data => {
        fetchProductData(productName);
        form.querySelector(`#egreso-lote-${productName}`).value = '';
        form.querySelector(`#egreso-date-${productName}`).value = '';
        form.querySelector(`#egreso-quantity-${productName}`).value = '';
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Hubo un problema al registrar el egreso.');
    });
}
function realizarEgreso(productoSeleccionado, fechaVencimientoSeleccionada, cantidadEgreso) {
    const stockDetalles = document.querySelector(`#${productoSeleccionado} .stock-detalles`);
    stockDetalles.innerHTML = '';
    let cantidadRestanteEgreso = cantidadEgreso;

    if (!stockData[productoSeleccionado] || !Array.isArray(stockData[productoSeleccionado])) {
        alert(`El producto "${productoSeleccionado}" no se encuentra en el stock o no está correctamente configurado.`);
        return;
    }

    stockData[productoSeleccionado].forEach(item => {
        if (item.fecha_vencimiento === fechaVencimientoSeleccionada && cantidadRestanteEgreso > 0) {
            if (item.cantidad >= cantidadRestanteEgreso) {
                item.cantidad -= cantidadRestanteEgreso;
                cantidadRestanteEgreso = 0;
            } else {
                cantidadRestanteEgreso -= item.cantidad;
                item.cantidad = 0;
            }
        }
        const stockItem = document.createElement("div");
        stockItem.textContent = `Fecha de vencimiento: ${item.fecha_vencimiento} - Cantidad: ${item.cantidad}`;
        stockDetalles.appendChild(stockItem);
    });

    if (cantidadRestanteEgreso > 0) {
        alert('La cantidad seleccionada para el egreso supera la cantidad disponible en el stock.');
    }
    updateStockDisplay(productoSeleccionado);
}

function openTab(event, productId) {
    const tabContents = document.querySelectorAll(".tab-content");
    tabContents.forEach(tabContent => tabContent.style.display = "none");

    const tabButtons = document.querySelectorAll(".tab-button");
    tabButtons.forEach(tabButton => tabButton.classList.remove("active"));

    document.getElementById(productId).style.display = "block";
    event.currentTarget.classList.add("active");

    fetchProductData(productId);
}

function fetchProductData(product) {
    fetch(`/mercaderia/${product}`)
        .then(response => response.json())
        .then(data => {
            updateStockDisplay(product, data);
        })
        .catch(error => console.error('Error al obtener los datos de mercadería:', error));
}
function updateStockDisplay(product, data) {
    const stockInfo = document.querySelector(`#${product} .stock-info`);
    const stockDetalles = document.querySelector(`#${product} .stock-detalles`);

    const totalStock = data.reduce((sum, item) => sum + item.cantidad, 0);
    stockInfo.textContent = `Stock actual: ${totalStock}`;

    stockDetalles.innerHTML = "";
    data.forEach(item => {
        // Tomar la fecha original y quitar cualquier hora o información extra
        const [year, month, day] = item.fecha_vencimiento.split('T')[0].split('-'); // Extraer AAAA-MM-DD
        const formattedDate = `${day}/${month}/${year}`; // Formato DD/MM/AAAA

        const stockItem = document.createElement("div");
        stockItem.textContent = `Lote: ${item.lote} - Fecha de vencimiento: ${formattedDate} - Cantidad: ${item.cantidad}`;
        stockDetalles.appendChild(stockItem);
    });
}

