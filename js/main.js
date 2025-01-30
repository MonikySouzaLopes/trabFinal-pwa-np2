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
document.addEventListener("DOMContentLoaded", () => {
    // Captura elementos da interface
    const cameraView = document.getElementById("camera-view");
    const cameraSensor = document.getElementById("camera-sensor");
    const cameraOutputContainer = document.getElementById("camera-output-container");
    const cameraButton = document.getElementById("cameraButton");
    const captureButton = document.getElementById("captureButton");
    const cameraContainer = document.getElementById("camera-container");
    const addItemButton = document.getElementById("addItem");
    const itemInput = document.getElementById("itemInput");
    const itemList = document.getElementById("itemList");

    let shoppingList = JSON.parse(localStorage.getItem("shoppingList")) || [];

    // Configuração da câmera
    const configCamera = { video: { facingMode: "environment" }, audio: false };

    // Ajusta a posição da câmera se o container existir
    if (cameraContainer) {
        cameraContainer.style.display = "flex";
        cameraContainer.style.justifyContent = "center";
        cameraContainer.style.alignItems = "center";
        cameraContainer.style.marginTop = "20px";
    }

    // Função para iniciar a câmera
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

    // Função para capturar imagem e exibir na tela
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

    // Função para atualizar a lista de compras
    function atualizarLista() {
        if (!itemList) return;

        itemList.innerHTML = "";
        shoppingList.forEach((item, index) => {
            const li = document.createElement("li");
            li.textContent = item;

            const deleteButton = document.createElement("button");
            deleteButton.textContent = "❌";
            deleteButton.style.marginLeft = "10px";
            deleteButton.onclick = () => removerItem(index);

            li.appendChild(deleteButton);
            itemList.appendChild(li);
        });
    }

    // Função para adicionar item à lista
    function adicionarItem() {
        if (!itemInput) return;

        const item = itemInput.value.trim();
        if (item) {
            shoppingList.push(item);
            localStorage.setItem("shoppingList", JSON.stringify(shoppingList));
            atualizarLista();
            itemInput.value = "";
        }
    }

    // Função para remover item da lista
    function removerItem(index) {
        shoppingList.splice(index, 1);
        localStorage.setItem("shoppingList", JSON.stringify(shoppingList));
        atualizarLista();
    }

    // Adicionando eventos apenas se os elementos existirem
    if (addItemButton) addItemButton.addEventListener("click", adicionarItem);
    if (cameraButton) cameraButton.addEventListener("click", iniciarCamera);
    if (captureButton) captureButton.addEventListener("click", capturarImagem);

    // Atualiza a lista de compras e inicia a câmera ao carregar a página
    atualizarLista();
    iniciarCamera();
});
