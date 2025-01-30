

// Verifica se o navegador suporta Service Workers
if ('serviceWorker' in navigator) {
    window.addEventListener('load', async () => {
        try {
            let reg = await navigator.serviceWorker.register('/sw.js', { type: "module" });
            console.log('Service worker registrado com sucesso:', reg);
        } catch (err) {
            console.log('Falha ao registrar o service worker:', err);
        }
    });
}

// Aguarda o carregamento do DOM
document.addEventListener("DOMContentLoaded", async () => {
    const cameraView = document.getElementById("camera-view");
    const cameraSensor = document.getElementById("camera-sensor");
    const cameraOutputContainer = document.getElementById("camera-output-container");
    const cameraButton = document.getElementById("cameraButton");
    const captureButton = document.getElementById("captureButton");
    const cameraContainer = document.getElementById("camera-container");
    const addItemButton = document.getElementById("addItem");
    const itemInput = document.getElementById("itemInput");
    const itemList = document.getElementById("itemList");

    // Lista de compras obtida do IndexedDB
    let shoppingList = await getData();

    const configCamera = { video: { facingMode: "environment" }, audio: false };

    function iniciarCamera() {
        if (!cameraView) return;
        
        navigator.mediaDevices.getUserMedia(configCamera)
            .then((stream) => {
                cameraView.srcObject = stream;
                cameraView.style.display = "block";
            })
            .catch((error) => {
                console.error("Erro ao acessar a câmera:", error);
                alert("Permita o acesso à câmera nas configurações do navegador.");
            });
    }

    function capturarImagem() {
        if (!cameraSensor || !cameraView || !cameraOutputContainer) return;

        cameraSensor.width = cameraView.videoWidth / 3;
        cameraSensor.height = cameraView.videoHeight / 3;
        cameraSensor.getContext("2d").drawImage(cameraView, 0, 0, cameraSensor.width, cameraSensor.height);
        
        const img = document.createElement("img");
        img.src = cameraSensor.toDataURL("image/webp");
        img.style.width = "100px";
        img.style.height = "75px";
        img.style.margin = "5px";
        img.style.border = "1px solid #000";

        cameraOutputContainer.appendChild(img);
    }

    function atualizarLista() {
        if (!itemList) return;

        itemList.innerHTML = "";
        shoppingList.forEach((item) => {
            const li = document.createElement("li");
            li.textContent = item.nome;

            const deleteButton = document.createElement("button");
            deleteButton.textContent = "❌";
            deleteButton.style.marginLeft = "10px";
            deleteButton.onclick = async () => {
                await remover(item.id);
                shoppingList = await getData();
                atualizarLista();
            };

            li.appendChild(deleteButton);
            itemList.appendChild(li);
        });
    }

    async function adicionarItem() {
        if (!itemInput) return;

        const item = itemInput.value.trim();
        if (item) {
            await addData(item);
            shoppingList = await getData();
            atualizarLista();
            itemInput.value = "";
        }
    }

    if (addItemButton) addItemButton.addEventListener("click", adicionarItem);
    if (cameraButton) cameraButton.addEventListener("click", iniciarCamera);
    if (captureButton) captureButton.addEventListener("click", capturarImagem);

    atualizarLista();
    iniciarCamera();
});
