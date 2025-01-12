function redirect(page) {
    const confirmRedirect = confirm("¿Estás seguro de que deseas continuar?");
    if (confirmRedirect) {
        window.location.href = page; // Redirige a la página correspondiente
    }
}
