// Service Worker
if ("serviceWorker" in navigator) {
    window.addEventListener("load", async () => {
        try {
            let reg = await navigator.serviceWorker.register("/sw.js", { type: "module" });
            console.log("Service worker registrado!", reg);
        } catch (err) {
            console.error("Falha ao registrar o service worker: ", err);
        }
    });
}

window.onload = function () {
    const cameraView = document.querySelector("#camera-view");
    const cameraOutput = document.querySelector("#camera-output");
    const cameraSensor = document.querySelector("#camera-sensor");
    const cameraTrigger = document.querySelector("#camera--trigger");

    if (!cameraView || !cameraOutput || !cameraSensor || !cameraTrigger) {
        console.error("Um ou mais elementos da câmera não foram encontrados.");
        return;
    }

    function cameraStart() {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            console.error("API da câmera não suportada pelo navegador.");
            return;
        }
    
        navigator.mediaDevices
            .getUserMedia({ video: { facingMode: "user" }, audio: false })
            .then((stream) => {
                cameraView.srcObject = stream;
            })
            .catch((error) => {
                console.error("Erro ao acessar a câmera.", error);
            });
    }
    

    cameraTrigger.addEventListener("click", () => {
        if (!cameraView.srcObject) {
            console.error("A câmera não está ativa.");
            return;
        }
        console.log("oi")

        cameraSensor.width = cameraView.videoWidth;
        cameraSensor.height = cameraView.videoHeight;
        cameraSensor.getContext("2d").drawImage(cameraView, 0, 0);
        cameraOutput.src = cameraSensor.toDataURL("image/webp");
        cameraOutput.classList.add("taken");
        addData(cameraOutput.src)
    });

    cameraStart();
};

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

async function addData(foto) {
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

    if (!db) {
        console.error("Banco de dados não foi inicializado.");
        return;
    }

    const tx = db.transaction("compras", "readwrite");
    const store = tx.objectStore("compras");

    try {
        await store.add({ nome, foto });
        await tx.done;
        nomeInput.value = "";
        getData();
        console.log("Registro adicionado com sucesso!");
    } catch (error) {
        console.error("Erro ao adicionar registro:", error);
    }
}
