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

// Helper: cria e exibe modal custom (persistente enquanto a aba existir)
function mostrarModalConfirmacao(dados) {
    // Se já existe, não criar outro
    if (document.getElementById("persele-confirm-modal")) {
        console.log("[Persele] modal já existe — não duplicando.");
        return;
    }

    // Cria overlay
    const overlay = document.createElement("div");
    overlay.id = "persele-confirm-modal";
    overlay.style.position = "fixed";
    overlay.style.top = "0";
    overlay.style.left = "0";
    overlay.style.width = "100%";
    overlay.style.height = "100%";
    overlay.style.background = "rgba(0,0,0,0.4)";
    overlay.style.display = "flex";
    overlay.style.alignItems = "center";
    overlay.style.justifyContent = "center";
    overlay.style.zIndex = "2147483647"; // o maior z-index possível para evitar overlay sendo coberto

    // Modal box
    const box = document.createElement("div");
    box.style.background = "#fff";
    box.style.padding = "18px";
    box.style.borderRadius = "8px";
    box.style.boxShadow = "0 6px 18px rgba(0,0,0,0.15)";
    box.style.maxWidth = "480px";
    box.style.width = "90%";
    box.style.fontFamily = "Arial, sans-serif";
    box.style.color = "#111";

    // Mensagem
    const msg = document.createElement("div");
    msg.style.marginBottom = "12px";
    msg.style.fontSize = "15px";
    msg.innerText = `Deseja confirmar o registro de ${dados.etiquetas} etiquetas (${dados.plataforma} - ${dados.tipo})?`;

    // Botoes container
    const actions = document.createElement("div");
    actions.style.display = "flex";
    actions.style.justifyContent = "flex-end";
    actions.style.gap = "8px";

    // Botao cancelar
    const btnCancel = document.createElement("button");
    btnCancel.innerText = "Não, cancelar";
    btnCancel.style.padding = "8px 12px";
    btnCancel.style.border = "1px solid #ccc";
    btnCancel.style.background = "#fff";
    btnCancel.style.borderRadius = "6px";
    btnCancel.style.cursor = "pointer";

    // Botao confirmar
    const btnConfirm = document.createElement("button");
    btnConfirm.innerText = "Sim, registrar";
    btnConfirm.style.padding = "8px 12px";
    btnConfirm.style.border = "none";
    btnConfirm.style.background = "#28a745";
    btnConfirm.style.color = "#fff";
    btnConfirm.style.borderRadius = "6px";
    btnConfirm.style.cursor = "pointer";

    // Append elementos
    actions.appendChild(btnCancel);
    actions.appendChild(btnConfirm);
    box.appendChild(msg);
    box.appendChild(actions);
    overlay.appendChild(box);
    document.body.appendChild(overlay);

    // Foco no botão confirmar para acessibilidade (mas sem chamar confirm())
    btnConfirm.focus();

    // Click handlers
    btnCancel.addEventListener("click", () => {
        // Cancela e limpa pendência, remove modal
        limparPendencia();
        removerModal();
        console.log("[Persele] usuário cancelou o registro via modal.");
    });

    btnConfirm.addEventListener("click", () => {
        // Envia para o background salvar e limpa pendência
        chrome.runtime.sendMessage({
            action: "registrarImpressao",
            plataforma: dados.plataforma,
            tipo: dados.tipo,
            etiquetas: Number(dados.etiquetas),
            usuario: dados.usuario,
            timestamp: new Date().toISOString()
        }, (resp) => {
            console.log("[Persele] registro confirmado e enviado ao background (via modal).");
        });

        limparPendencia();
        removerModal();
    });

    // Impede que clique no overlay feche (forçando interação explícita)
    overlay.addEventListener("click", (ev) => {
        if (ev.target === overlay) {
            // opcional: não fecha ao clicar fora
            // podemos adicionar um pequeno efeito visual se quiser
            overlay.style.outline = "2px solid rgba(0,0,0,0.02)";
            setTimeout(() => overlay.style.outline = "none", 150);
        }
    });
}

// Helper: remove modal se existir
function removerModal() {
    const existing = document.getElementById("persele-confirm-modal");
    if (existing && existing.parentNode) {
        existing.parentNode.removeChild(existing);
        console.log("[Persele] modal removido.");
    }
}

// --- Se estivermos na página de lista (onde o usuário clica "Imprimir Etiquetas")
// opcional: você pode deixar a página original já abrir imprimir.html with params,
// então aqui só garantimos log do clique (manter compatibilidade)
if (location.href.includes("persele_lista.html") || location.href.includes("persele_lista")) {
    if (!window.__PERSELE_LISTENER_ADDED__) {
        window.__PERSELE_LISTENER_ADDED__ = true;

        document.addEventListener("click", function (e) {
            if (e.target && e.target.id === "btnImprimirEtiquetas") {
                console.log("[Persele] Botão de imprimir detectado na lista.");

                // Aqui a página já abre a imprimir.html com params (se for o caso).
                // Não registramos nada aqui — o registro só ocorre após onafterprint na página de impressão.
            }
        });
    }
}

// --- Se estivermos na página de impressão, detecta fechamento do diálogo de impressão
if (location.href.includes("persele_imprimir.html") || location.href.includes("imprimir.html")) {

    // Pega dados da URL
    const dadosImpressao = lerParamsImpressao();
    console.log("[Persele] página de impressão — dados:", dadosImpressao);

    // Função que será chamada quando detectarmos que o diálogo de impressão foi fechado
    function handleAfterPrint() {
        try {
            // Ao invés de usar window.confirm (que desaparece ao trocar de aba),
            // vamos salvar a pendência e exibir um modal persistente in-page.
            salvarPendencia(dadosImpressao);
            mostrarModalConfirmacao(dadosImpressao);
        } catch (err) {
            console.warn("[Persele] erro ao tratar afterprint/modal:", err);
        }
    }

    // Usa onafterprint (padrão)
    window.addEventListener("afterprint", function () {
        console.log("[Persele] evento afterprint disparado.");
        handleAfterPrint();
    });

    // Fallback: alguns navegadores/versões usam matchMedia('print')
    try {
        const mm = window.matchMedia("print");
        if (typeof mm.addEventListener === "function") {
            mm.addEventListener("change", function (e) {
                if (!e.matches) {
                    // antes estava em modo impressão e agora saiu -> considerar como fechamento
                    console.log("[Persele] matchMedia print change -> saiu do modo impressão.");
                    handleAfterPrint();
                }
            });
        } else if (typeof mm.addListener === "function") {
            mm.addListener(function (e) {
                if (!e.matches) {
                    console.log("[Persele] matchMedia (old) -> saiu do modo impressão.");
                    handleAfterPrint();
                }
            });
        }
    } catch (e) {
        console.warn("[Persele] matchMedia fallback não suportado:", e);
    }

    // Se a página carregar e existir uma pendência (ex.: usuário abriu o diálogo, mudou de aba e voltou),
    // reapresentamos o modal automaticamente.
    document.addEventListener("DOMContentLoaded", () => {
        const pend = obterPendencia();
        if (pend) {
            console.log("[Persele] pendência encontrada no carregamento — exibindo modal novamente.");
            mostrarModalConfirmacao(pend);
        }
    });

    // Também reapresenta o modal quando a aba fica visível novamente
    document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "visible") {
            const pend = obterPendencia();
            if (pend) {
                console.log("[Persele] aba ficou visível e há pendência — reexibindo modal.");
                // Remover modal antigo se houver e criar outro (evita duplicatas)
                removerModal();
                mostrarModalConfirmacao(pend);
            }
        }
    });

    // Observação: Caso você queira mostrar um modal customizado em vez de window.confirm,
    // é possível injetar um elemento DOM aqui e mostrar a confirmação de forma mais bonita.
}
