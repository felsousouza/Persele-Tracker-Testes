// content.js - Persele Tracker
console.log("%c[Persele Tracker] content.js ativo", "color: green; font-weight: bold;", location.href);

function lerUsuarioLogado() {
    try {
        return sessionStorage.getItem("persele_usuario_logado") || "";
    } catch (e) {
        return "";
    }
}

// util: lê parâmetros da URL (usado pela página de impressão)
function lerParamsImpressao() {
    try {
        const params = new URLSearchParams(location.search);
        return {
            plataforma: params.get("plataforma") || "",
            tipo: params.get("tipo") || "",
            etiquetas: Number(params.get("etiquetas") || 0),
            usuario: lerUsuarioLogado()
        };
    } catch (e) {
        return { plataforma: "", tipo: "", etiquetas: 0 };
    }
}

// Helper: salva registro pendente em sessionStorage
function salvarPendencia(dados) {
    try {
        sessionStorage.setItem("persele_registro_pendente", JSON.stringify(dados));
        console.log("[Persele] pendência salva em sessionStorage:", dados);
    } catch (e) {
        console.warn("[Persele] falha ao salvar pendência:", e);
    }
}

// Helper: recupera registro pendente
function obterPendencia() {
    try {
        const raw = sessionStorage.getItem("persele_registro_pendente");
        return raw ? JSON.parse(raw) : null;
    } catch (e) {
        return null;
    }
}

// Helper: remove pendência
function limparPendencia() {
    try {
        sessionStorage.removeItem("persele_registro_pendente");
        console.log("[Persele] pendência removida.");
    } catch (e) {
        console.warn("[Persele] falha ao limpar pendência:", e);
    }
}

// --- Página de lista (mantido)
if (location.href.includes("persele_lista.html") || location.href.includes("persele_lista")) {
    if (!window.__PERSELE_LISTENER_ADDED__) {
        window.__PERSELE_LISTENER_ADDED__ = true;

        document.addEventListener("click", function (e) {
            if (e.target && e.target.id === "btnImprimirEtiquetas") {
                console.log("[Persele] Botão de imprimir detectado na lista.");

                const dados = {
                    plataforma: document.getElementById("plataformaSelect")?.value || "",
                    tipo: document.getElementById("tipoSelect")?.value || "",
                    etiquetas: Number(document.getElementById("qtdEtiquetas")?.textContent || 0),
                    usuario: lerUsuarioLogado(),
                    timestamp: new Date().toISOString()
                };

                // 🔹 AGORA a pendência nasce aqui
                salvarPendencia(dados);
                console.log("[Persele] pendência criada na lista:", dados);
            }
        });
    }
}

// --- NOVO: escuta confirmação vinda do SITE (persele_lista.html)
document.addEventListener("persele:confirmacaoImpressao", (event) => {

    const confirmado = event.detail?.confirmado;
    const pendencia = obterPendencia();

    if (!pendencia) {
        console.warn("[Persele] confirmação recebida, mas não há pendência.");
        return;
    }

    if (!confirmado) {
        console.log("[Persele] usuário optou por NÃO registrar a impressão.");
        limparPendencia();
        return;
    }

    // Usuário confirmou → registra
    chrome.runtime.sendMessage({
        action: "registrarImpressao",
        plataforma: pendencia.plataforma,
        tipo: pendencia.tipo,
        etiquetas: Number(pendencia.etiquetas),
        usuario: pendencia.usuario,
        timestamp: pendencia.timestamp
    }, () => {
        console.log("[Persele] registro confirmado via modal do site.");
    });

    limparPendencia();
});
