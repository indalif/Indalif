document.getElementById('registerForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const userType = document.getElementById('userType').value;

    const messageElement = document.getElementById('message');
    fetch('/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password, userType })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Error en la respuesta del servidor');
        }
        return response.json();
    })
    .then(data => {
        if (data.id) {
            // Mostrar el mensaje inmediatamente
            messageElement.innerHTML = '<span style="color: green;">Usuario registrado con éxito. Enviando correo de autorización...</span>';
            document.getElementById('registerForm').reset();

            // Enviar correo de autorización
            return fetch('/send-authorization-email', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, email: 'fabricaaranda@gmail.com', userType })
            }).then(() => {
                messageElement.innerHTML = '<span style="color: green;">Usuario registrado y correo de autorización enviado.</span>';
            });
        } else {
            messageElement.innerHTML = '<span style="color: red;">Error al registrar el usuario.</span>';
        }
    })
    .catch(error => {
        console.error('Error:', error);
        messageElement.innerHTML = '<span style="color: red;">Error en la conexión al servidor.</span>';
    })
    .finally(() => {
        setTimeout(() => {
            messageElement.textContent = '';
        }, 5000);
    });
});
