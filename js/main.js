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

        cameraSensor.width = cameraView.videoWidth;
        cameraSensor.height = cameraView.videoHeight;
        cameraSensor.getContext("2d").drawImage(cameraView, 0, 0);
        cameraOutput.src = cameraSensor.toDataURL("image/webp");
        cameraOutput.classList.add("taken");
    });

    cameraStart();
};