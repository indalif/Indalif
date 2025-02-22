document.addEventListener('DOMContentLoaded', () => {
    console.log("Script cargado y DOM listo");
    resetDailySummary();
    updateTransactionHistory();
    updateSummary(); // Se mantiene la actualización automática
    loadTransactions();
    loadBilletes();
});
let totalIncome = 0;  
let totalExpenses = 0;
function resetDailySummary() {
    const today = new Date().toISOString().slice(0, 10); // Fecha actual en formato YYYY-MM-DD
    fetch(`/transactions/date/${today}`)
        .then(response => response.json())
        .then(transactions => {
            if (!transactions || transactions.length === 0) {
                totalIncome = 0;
                totalExpenses = 0;
                document.getElementById('netTotal').innerText = `Total Neto: $0.00`;
                console.log("Resumen diario inicializado a 0 para un día nuevo.");
            } else {
                console.log("Transacciones encontradas para el día actual, actualizando el resumen...");
                updateSummary();
            }
        })
        .catch(error => {
            console.error('Error al reiniciar el resumen diario:', error);
        });
}
function updateSummary() {
    fetch('/summary')
        .then(response => response.json())
        .then(summaryData => {
            let incomeTotal = 0;
            let expenseTotal = 0;

            summaryData.forEach(row => {
                if (row.type === 'Ingreso') {
                    incomeTotal = parseFloat(row.total);
                } else if (row.type === 'Egreso') {
                    expenseTotal = parseFloat(row.total);
                }
            });

            totalIncome = incomeTotal;
            totalExpenses = expenseTotal;
            const netTotal = totalIncome - totalExpenses;
            document.getElementById('netTotal').innerText = `Total Neto: $${netTotal.toFixed(2)}`;
        })
        .catch(error => console.error('Error al obtener el resumen:', error));
}
function addIncome() {
    const description = document.getElementById('incomeDescription').value;
    const amount = parseFloat(document.getElementById('incomeAmount').value);
    const method = document.getElementById('incomeMethod').value;
    if (isNaN(amount) || amount <= 0) {
        alert('Por favor, ingresa un monto válido para el ingreso.');
        return;
    }
    const transaction = {
        type: 'Ingreso',
        description,
        amount,
        method,
        date: new Date()
    };
    saveTransaction(transaction);
    totalIncome += amount;
    updateSummary();
    document.getElementById('incomeDescription').value = '';
    document.getElementById('incomeAmount').value = '';
    document.getElementById('incomeMethod').selectedIndex = 0;
}
function addExpense() {
    const description = document.getElementById('expenseDescription').value;
    const amount = parseFloat(document.getElementById('expenseAmount').value);
    const method = document.getElementById('expenseMethod').value;
    if (isNaN(amount) || amount <= 0) {
        alert('Por favor, ingresa un monto válido para el egreso.');
        return;
    }
    const transaction = {
        type: 'Egreso',
        description,
        amount,
        method,
        date: new Date()
    };
    saveTransaction(transaction);
    totalExpenses += amount;
    updateSummary();
    document.getElementById('expenseDescription').value = '';
    document.getElementById('expenseAmount').value = '';
    document.getElementById('expenseMethod').selectedIndex = 0;
}
function saveTransaction(transaction) {
    fetch('/transactions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(transaction)
    })
    .then(response => response.json())
    .then(data => {
        console.log(data.message);
        updateTransactionHistory();
        updateSummary();
    })
    .catch(error => {
        console.error('Error al guardar la transacción:', error);
    });
}
function updateTransactionHistory() {
    fetch('/transactions')
        .then(response => {
            if (!response.ok) {
                throw new Error(`Error al obtener transacciones: ${response.statusText}`);
            }
            return response.json();
        })
        .then(transactions => {
            console.log("Datos recibidos del servidor:", transactions);

            const transactionHistory = document.getElementById('transactionHistory');
            transactionHistory.innerHTML = '';

            if (!transactions || transactions.length === 0) {
                transactionHistory.innerHTML = '<tr><td colspan="5">No hay transacciones registradas.</td></tr>';
                return;
            }
            transactions.forEach(transaction => {
                const amount = parseFloat(transaction.amount);
                if (isNaN(amount)) {
                    console.error(`Transacción inválida, el valor de 'amount' no es un número:`, transaction);
                    return;
                }
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${new Date(transaction.date).toLocaleDateString('es-ES')}</td>
                    <td>${transaction.description}</td>
                    <td>${amount.toFixed(2)}</td> <!-- Formatear el valor numérico -->
                    <td>${transaction.method}</td>
                    <td>${transaction.type}</td>
                `;
                transactionHistory.appendChild(row);
            });
        })
        .catch(error => {
            console.error('Error al obtener las transacciones:', error);
        });
}
function closeDay() {
    const today = new Date().toISOString().slice(0, 10);

    fetch('/transactions')
        .then(response => response.json())
        .then(transactions => {
            let dailyIncome = 0;
            let dailyExpenses = 0;
            const dailyTransactions = transactions.filter(transaction => {
                const transactionDate = new Date(transaction.date).toISOString().slice(0, 10);
                return transactionDate === today;
            });

            if (dailyTransactions.length === 0) {
                alert('No hay transacciones para el día actual.');
                resetDailyTotals();
                return;
            }

            dailyTransactions.forEach(transaction => {
                const amount = parseFloat(transaction.amount);
                if (transaction.type === 'Ingreso') {
                    dailyIncome += amount;
                } else if (transaction.type === 'Egreso') {
                    dailyExpenses += amount;
                }
            });

            const netTotal = dailyIncome - dailyExpenses;
            document.getElementById('netTotal').innerText = `Total Neto del Día: $${netTotal.toFixed(2)}`;
            alert('El día ha sido cerrado con éxito.');
            resetDailyTotals();
        })
        .catch(error => {
            console.error('Error al cerrar el día:', error);
            alert('Hubo un error al cerrar el día.');
        });
}
function resetDailyTotals() {
    const netTotalEl = document.getElementById('netTotal');
    if (netTotalEl) netTotalEl.innerText = 'Total Neto del Día: $0.00';
    console.log('Totales diarios restablecidos a 0.');
}
function calculateCash() {
    const bill100 = parseInt(document.getElementById('bill100').value) || 0;
    const bill200 = parseInt(document.getElementById('bill200').value) || 0;
    const bill500 = parseInt(document.getElementById('bill500').value) || 0;
    const bill1000 = parseInt(document.getElementById('bill1000').value) || 0;
    const bill2000 = parseInt(document.getElementById('bill2000').value) || 0;
    const bill10000 = parseInt(document.getElementById('bill10000').value) || 0;
    const bill20000 = parseInt(document.getElementById('bill20000').value) || 0; // Nuevo billete de 20,000

    const totalCash = (bill100 * 100) + (bill200 * 200) + (bill500 * 500) + 
                      (bill1000 * 1000) + (bill2000 * 2000) + (bill10000 * 10000) + (bill20000 * 20000);

    const netTotal = totalIncome - totalExpenses; 
    const cashResult = document.getElementById('cashResult');
    if (totalCash === netTotal) {
        cashResult.innerHTML = `<span class="text-success">El efectivo en caja coincide con el total neto del día: $${totalCash.toFixed(2)}</span>`;
    } else {
        cashResult.innerHTML = `<span class="text-danger">El efectivo en caja ($${totalCash.toFixed(2)}) no coincide con el total neto del día ($${netTotal.toFixed(2)}).</span>`;
    }
}
function viewHistoryByDate() {
    const historyDate = document.getElementById('historyDate').value;
    if (!historyDate) {
        alert("Por favor, selecciona una fecha.");
        return;
    }
    fetch(`/transactions/date/${historyDate}`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Error al obtener transacciones: ${response.statusText}`);
            }
            return response.json();
        })
        .then(transactions => {
            const transactionHistory = document.getElementById('transactionHistory');
            transactionHistory.innerHTML = ''; 
            if (!transactions || transactions.length === 0) {
                transactionHistory.innerHTML = '<tr><td colspan="5">No hay transacciones para esta fecha.</td></tr>';
                return;
            }
            const filteredTransactions = transactions.filter(transaction => {
                const transactionDate = new Date(transaction.date).toISOString().slice(0, 10);
                return transactionDate === historyDate;
            });
            filteredTransactions.forEach(transaction => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${new Date(transaction.date).toLocaleDateString('es-ES')}</td>
                    <td>${transaction.description}</td>
                    <td>${parseFloat(transaction.amount).toFixed(2)}</td>
                    <td>${transaction.method}</td>
                    <td>${transaction.type}</td>
                `;
                transactionHistory.appendChild(row);
            });

            if (filteredTransactions.length === 0) {
                transactionHistory.innerHTML = '<tr><td colspan="5">No hay transacciones para esta fecha.</td></tr>';
            }
        })
        .catch(error => {
            console.error('Error al obtener las transacciones:', error);
        });
}
function closeMonth() {
    const year = document.getElementById('year').value;
    const month = document.getElementById('month').value;

    fetch('/transactions')
        .then(response => response.json())
        .then(transactions => {
            const monthlyTransactions = transactions.filter(transaction => {
                const transactionDate = new Date(transaction.date);
                return (
                    transactionDate.getFullYear() === parseInt(year) &&
                    (transactionDate.getMonth() + 1).toString().padStart(2, '0') === month
                );
            });
            let monthlyIncome = 0;
            let monthlyExpenses = 0;
            monthlyTransactions.forEach(transaction => {
                const amount = parseFloat(transaction.amount);
                if (transaction.type === 'Ingreso') {
                    monthlyIncome += amount;
                } else if (transaction.type === 'Egreso') {
                    monthlyExpenses += amount;
                }
            });
            const netTotal = monthlyIncome - monthlyExpenses;
            const monthlyClosureResult = document.getElementById('monthlyClosureResult');
            monthlyClosureResult.innerHTML = `
                <p><strong>Total Ingresos del Mes:</strong> $${monthlyIncome.toFixed(2)}</p>
                <p><strong>Total Egresos del Mes:</strong> $${monthlyExpenses.toFixed(2)}</p>
                <p><strong>Total Neto del Mes:</strong> $${netTotal.toFixed(2)}</p>
            `;
            const transactionHistory = document.getElementById('transactionHistory');
            transactionHistory.innerHTML = ''; 
            if (monthlyTransactions.length === 0) {
                transactionHistory.innerHTML = '<tr><td colspan="5">No hay transacciones para este mes.</td></tr>';
                return;
            }
            monthlyTransactions.forEach(transaction => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${new Date(transaction.date).toLocaleDateString('es-ES')}</td>
                    <td>${transaction.description}</td>
                    <td>${parseFloat(transaction.amount).toFixed(2)}</td>
                    <td>${transaction.method}</td>
                    <td>${transaction.type}</td>
                `;
                transactionHistory.appendChild(row);
            });
        })
        .catch(error => {
            console.error('Error al obtener las transacciones para el cierre mensual:', error);
            alert('Hubo un error al realizar el cierre mensual.');
        });
}
let isEditing = false;
function loadBilletes() {
    fetch('/billetes')
        .then(response => response.json())
        .then(data => {
            if (data && !isEditing) {
                document.getElementById('bill100').value = data.billete_100;
                document.getElementById('bill200').value = data.billete_200;
                document.getElementById('bill500').value = data.billete_500;
                document.getElementById('bill1000').value = data.billete_1000;
                document.getElementById('bill2000').value = data.billete_2000;
                document.getElementById('bill10000').value = data.billete_10000;
                document.getElementById('bill20000').value = data.billete_20000;
                updateTotal();
            }
        })
        .catch(error => console.error('Error al cargar los billetes:', error));
}
function updateTotal() {
    const bill100 = parseInt(document.getElementById('bill100').value) || 0;
    const bill200 = parseInt(document.getElementById('bill200').value) || 0;
    const bill500 = parseInt(document.getElementById('bill500').value) || 0;
    const bill1000 = parseInt(document.getElementById('bill1000').value) || 0;
    const bill2000 = parseInt(document.getElementById('bill2000').value) || 0;
    const bill10000 = parseInt(document.getElementById('bill10000').value) || 0;
    const bill20000 = parseInt(document.getElementById('bill20000').value) || 0;

    const total = (bill100 * 100) + (bill200 * 200) + (bill500 * 500) +
                  (bill1000 * 1000) + (bill2000 * 2000) + (bill10000 * 10000) + (bill20000 * 20000);
    document.getElementById('cashResult').innerText = `Total en billetes: $${total.toFixed(2)}`;
}
document.querySelectorAll('input[type=number]').forEach(input => {
    input.addEventListener('focus', () => isEditing = true);
    input.addEventListener('blur', () => {
        isEditing = false;
        saveBilletes();
    });
});
function saveBilletes() {
    const billetes = {
        billete_100: parseInt(document.getElementById('bill100').value) || 0,
        billete_200: parseInt(document.getElementById('bill200').value) || 0,
        billete_500: parseInt(document.getElementById('bill500').value) || 0,
        billete_1000: parseInt(document.getElementById('bill1000').value) || 0,
        billete_2000: parseInt(document.getElementById('bill2000').value) || 0,
        billete_10000: parseInt(document.getElementById('bill10000').value) || 0,
        billete_20000: parseInt(document.getElementById('bill20000').value) || 0
    };

    fetch('/billetes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(billetes)
    })
    .then(response => response.json())
    .then(data => console.log(data.message))
    .catch(error => console.error('Error al guardar billetes:', error));
}
