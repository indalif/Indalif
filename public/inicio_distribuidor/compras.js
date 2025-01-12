const products = [
    "Tapas Tradicionales",
    "Tapas Caseras",
    "Tapas Verdes",
    "Pascualinas Tradicional",
    "Pascualina Casera",
    "Pascualinas Verdes",
    "Fideos al Huevo",
    "Fideos con Espinaca",
    "Ñoquis",
    "Ravioles de Ricota y Jamón",
    "Ravioles de Verdura y Pollo",
    "Tapas de Lasagna",
];
const productList = document.getElementById("product-list");
const cartItems = document.getElementById("cart-items");
let cart = [];
let selectedProduct = "";
products.forEach((product, index) => {
    const col = document.createElement("div");
    col.className = "col-md-4 mb-3";

    const card = document.createElement("div");
    card.className = "card h-100";
    card.innerHTML = `
        <div class="card-body text-center">
            <h5 class="card-title">${product}</h5>
            <button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#productModal" onclick="selectProduct('${product}')">Agregar</button>
        </div>
    `;
    col.appendChild(card);
    productList.appendChild(col);
});
function selectProduct(product) {
    selectedProduct = product;
    document.getElementById("selected-product-name").innerText = `Producto seleccionado: ${product}`;
}
document.getElementById("add-to-cart").addEventListener("click", () => {
    const quantity = parseInt(document.getElementById("product-quantity").value, 10);

    if (quantity > 0) {
        const existingProduct = cart.find(item => item.product === selectedProduct);
        if (existingProduct) {
            existingProduct.quantity += quantity;
        } else {
            cart.push({ product: selectedProduct, quantity });
        }

        updateCartUI();
        const productModal = bootstrap.Modal.getInstance(document.getElementById("productModal"));
        productModal.hide();
    }
});
function updateCartUI() {
    cartItems.innerHTML = "<h3>Carrito:</h3>";
    cart.forEach(item => {
        const div = document.createElement("div");
        div.className = "mb-2";
        div.innerText = `${item.product} - Cantidad: ${item.quantity}`;
        cartItems.appendChild(div);
    });
}
document.getElementById("confirm-purchase").addEventListener("click", () => {
    const sellerName = document.getElementById("seller-name").value.trim();
    const companyName = document.getElementById("company-name").value.trim();
    const clientName = document.getElementById("client-name").value.trim();
    const localName = document.getElementById("local-name").value.trim();
    const address = document.getElementById("address").value.trim();
    const city = document.getElementById("city").value.trim();
    const phone = document.getElementById("phone").value.trim();

    if (sellerName && companyName && clientName && localName && address && city && phone && cart.length > 0) {
        const pedido = {
            vendedor: sellerName,
            empresa: companyName,
            productos: cart,
            cliente: {
                nombre_cliente: clientName,
                nombre_local: localName,
                direccion: address,
                ciudad: city,
                telefono: phone
            }
        };
        fetch('/pedidos', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(pedido)
        })
        .then(response => {
            if (response.ok) {
                return response.json();
            } else {
                throw new Error("Error al registrar el pedido");
            }
        })
        .then(data => {
            alert("Pedido realizado con éxito!");
            cart = [];
            updateCartUI();
            document.querySelectorAll("input").forEach(input => input.value = "");
            const checkoutModal = bootstrap.Modal.getInstance(document.getElementById("checkoutModal"));
            checkoutModal.hide();
        })
        .catch(error => {
            alert("Hubo un problema al realizar el pedido. Por favor, inténtelo de nuevo.");
        });
    } else {
        alert("Por favor, complete todos los campos y agregue al menos un producto al carrito.");
    }
});



