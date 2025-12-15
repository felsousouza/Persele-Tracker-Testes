// background.js (seu atual já funciona)
chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.local.set({ impressoes: [] });
});

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg.action === "registrarImpressao") {
        chrome.storage.local.get(["impressoes"], data => {
            const lista = data.impressoes || [];

            lista.push({
                plataforma: msg.plataforma,
                tipo: msg.tipo,
                etiquetas: msg.etiquetas,
                usuario: msg.usuario,
                timestamp: msg.timestamp,
                // opcional: sender.tab / sender.id para rastrear origem
            });

            chrome.storage.local.set({ impressoes: lista });
            console.log("Registro salvo:", lista);
        });
    }
});
