import { openDB } from "idb";

let db;

async function createDB() {
    try {
        db = await openDB('banco', 1, {
            upgrade(db, oldVersion) {
                if (oldVersion < 1) {
                    const store = db.createObjectStore('compras', {
                        keyPath: 'id',
                        autoIncrement: true
                    });
                    store.createIndex('nome', 'nome', { unique: false });
                }
            }
        });
        console.log("Banco de dados criado e aberto.");
    } catch (e) {
        console.error("Erro ao criar o banco de dados:", e.message);
    }
}

window.addEventListener("DOMContentLoaded", async () => {
    await createDB();

    const addItemButton = document.getElementById("addItem");
    if (addItemButton) {
        addItemButton.addEventListener("click", addData);
    } else {
        console.error("Elemento #addItem não encontrado no HTML.");
    }

    const itemList = document.getElementById("itemList");
    if (itemList) {
        itemList.addEventListener("click", getData);
    } else {
        console.error("Elemento #itemList não encontrado no HTML.");
    }
});

async function getData() {
    if (!db) {
        console.error("O banco de dados não foi inicializado.");
        return;
    }

    const tx = db.transaction("compras", "readonly");
    const store = tx.objectStore("compras");
    const items = await store.getAll();

    const itemList = document.getElementById("itemList");
    if (!itemList) {
        console.error("Elemento #itemList não encontrado.");
        return;
    }

    itemList.innerHTML = items.map(item => `
        <div class="compra">
            <img src="${item.imagem || ''}" alt="Imagem do item">
            <p class="nome">${item.nome}</p>
        </div>
    `).join("");
}

async function addData() {
    const nomeInput = document.getElementById("itemInput");
    if (!nomeInput) {
        console.error("Elemento #itemInput não encontrado.");
        return;
    }

    const nome = nomeInput.value.trim();
    if (!nome) {
        console.warn("Nenhum nome foi inserido.");
        return;
    }

    const cameraOutput = document.getElementById("camera--output");
    const imagem = cameraOutput ? cameraOutput.src : "";

    if (!db) {
        console.error("Banco de dados não foi inicializado.");
        return;
    }

    const tx = db.transaction("compras", "readwrite");
    const store = tx.objectStore("compras");

    try {
        await store.add({ nome, imagem });
        await tx.done;
        nomeInput.value = "";
        getData();
        console.log("Registro adicionado com sucesso!");
    } catch (error) {
        console.error("Erro ao adicionar registro:", error);
    }
}
