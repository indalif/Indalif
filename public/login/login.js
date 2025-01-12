document.getElementById('loginForm').addEventListener('submit', function(event) {
    event.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    fetch('/iniciarSesion', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
    })
    .then(response => response.json())
    .then(data => {
        const messageElement = document.getElementById('message');
        const welcomeMessageElement = document.getElementById('welcomeMessage');
        if (data.success) {
            if (!data.autorizado) {
                messageElement.textContent = 'Error: Su cuenta no ha sido autorizada aún.';
                welcomeMessageElement.textContent = '';
            } else {
                messageElement.textContent = '';
                welcomeMessageElement.textContent = '¡Bienvenido, ' + data.username + '!';
        
                setTimeout(() => {
                    if (data.userType === 'empleado') {
                        window.location.href = '/inicio_empleado/inicio_empleado.html';
                    } else {
                        window.location.href = '/inicio/inicio.html';
                    }
                }, 1000);
            }
        } else {
            messageElement.textContent = 'Error: ' + data.message;
            welcomeMessageElement.textContent = '';
        }
        

        setTimeout(() => {
            messageElement.textContent = '';
            welcomeMessageElement.textContent = '';
        }, 5000);
    })
    .catch(error => {
        console.error('Error:', error);
        document.getElementById('message').textContent = 'Error en la conexión al servidor.';
    });
});
