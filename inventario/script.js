let inventory = [];

function addItem() {
    const itemName = document.getElementById('itemName').value;
    const itemQuantity = parseInt(document.getElementById('itemQuantity').value);

    if (itemName && !isNaN(itemQuantity)) {
        const existingItem = inventory.find(item => item.name === itemName);

        if (existingItem) {
            existingItem.quantity += itemQuantity;
        } else {
            inventory.push({ name: itemName, quantity: itemQuantity });
        }

        updateInventoryTable();
        document.getElementById('itemName').value = '';
        document.getElementById('itemQuantity').value = '';
    } else {
        alert('Por favor, ingresa un nombre y una cantidad válida.');
    }
}

function deleteItem(index) {
    inventory.splice(index, 1);
    updateInventoryTable();
}

function updateInventoryTable() {
    const tbody = document.querySelector('#inventoryTable tbody');
    tbody.innerHTML = '';

    inventory.forEach((item, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${item.name}</td>
            <td>${item.quantity}</td>
            <td><button onclick="deleteItem(${index})">Eliminar</button></td>
        `;
        tbody.appendChild(row);
    });
}