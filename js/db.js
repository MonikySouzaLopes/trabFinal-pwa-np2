import { openDB } from "idb";

let db;

async function createDB() {
    try {
        db = await openDB('shoppingDB', 1, {
            upgrade(db) {
                if (!db.objectStoreNames.contains('shoppingList')) {
                    const store = db.createObjectStore('shoppingList', {
                        keyPath: 'id',
                        autoIncrement: true
                    });
                    store.createIndex('name', 'name', { unique: false });
                    console.log("Banco de dados de Lista de Compras criado!");
                }
            }
        });
        console.log("Banco de dados aberto.");
    } catch (e) {
        console.error("Erro ao criar o banco de dados:", e.message);
    }
}

// Aguarda o carregamento do DOM antes de inicializar
document.addEventListener("DOMContentLoaded", async () => {
    await createDB();
    
    const addItemButton = document.getElementById("addItem");
    const itemInput = document.getElementById("itemInput");
    const itemList = document.getElementById("itemList");

    if (addItemButton) {
        addItemButton.addEventListener("click", addData);
    }

    if (itemInput && itemList) {
        getData();
    }
});

async function getData() {
    if (!db) {
        console.error("O banco de dados ainda não foi inicializado.");
        return;
    }
    const tx = db.transaction('shoppingList', 'readonly');
    const store = tx.objectStore('shoppingList');
    const value = await store.getAll();

    const itemList = document.getElementById("itemList");
    if (!itemList) return;
    
    itemList.innerHTML = "";

    if (value.length > 0) {
        value.forEach(item => {
            const listItem = document.createElement("li");
            listItem.textContent = item.name;

            const deleteButton = document.createElement("button");
            deleteButton.textContent = "❌";
            deleteButton.style.marginLeft = "10px";
            deleteButton.onclick = () => removerItem(item.id);

            listItem.appendChild(deleteButton);
            itemList.appendChild(listItem);
        });
    } else {
        console.log("Não há itens na lista de compras!");
    }
}

async function addData() {
    const itemInput = document.getElementById("itemInput");
    if (!itemInput) return;

    let name = itemInput.value.trim();
    if (!name) return;

    if (!db) {
        console.error("Banco de dados não inicializado.");
        return;
    }

    const tx = db.transaction('shoppingList', 'readwrite');
    const store = tx.objectStore('shoppingList');
    try {
        await store.add({ name });
        await tx.done;
        console.log('Item adicionado com sucesso!');
        itemInput.value = "";
        getData();
    } catch (error) {
        console.error('Erro ao adicionar item:', error);
    }
}

async function removerItem(id) {
    if (!db) {
        console.error("Banco de dados não inicializado.");
        return;
    }

    const tx = db.transaction('shoppingList', 'readwrite');
    const store = tx.objectStore('shoppingList');
    try {
        await store.delete(id);
        console.log('Item removido com sucesso!');
        getData();
    } catch (error) {
        console.error('Erro ao remover item:', error);
    }
}