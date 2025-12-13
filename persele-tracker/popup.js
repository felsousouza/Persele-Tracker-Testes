// === Função para obter apenas registros do dia atual ===
function registrosDoDia(registros) {
    const hoje = new Date().toLocaleDateString("pt-BR");

    return registros.filter(reg => {
        const dataReg = new Date(reg.timestamp).toLocaleDateString("pt-BR");
        return dataReg === hoje;
    });
}

// === Carrega os registros e monta a lista ===
function carregarLista() {
    chrome.storage.local.get(["impressoes"], data => {
        const lista = data.impressoes || [];
        const listaDia = registrosDoDia(lista);

        const div = document.getElementById("listaDia");
        div.innerHTML = "";

        if (listaDia.length === 0) {
            div.innerHTML = "<p>Nenhuma impressão registrada hoje.</p>";
            return;
        }

        listaDia.forEach((item, index) => {
            const linha = document.createElement("div");
            linha.style.display = "flex";
            linha.style.alignItems = "center";
            linha.style.justifyContent = "space-between";
            linha.style.marginBottom = "6px";

            linha.innerHTML = `
                <span><strong>${index + 1}º</strong> — 
                ${item.etiquetas} etiquetas — 
                ${item.plataforma} (${item.tipo})</span>

                <button data-id="${item.timestamp}" class="btnExcluir">
                    Excluir
                </button>
            `;

            div.appendChild(linha);
        });

        // adiciona eventos aos botões
        document.querySelectorAll(".btnExcluir").forEach(btn => {
            btn.addEventListener("click", () => excluirRegistro(btn.dataset.id));
        });
    });
}

// === Excluir registro individual ===
function excluirRegistro(timestamp) {
    chrome.storage.local.get(["impressoes"], data => {

        const novaLista = data.impressoes.filter(
            item => item.timestamp !== timestamp
        );

        chrome.storage.local.set({ impressoes: novaLista }, () => {
            carregarLista();
        });

    });
}

// === Gerar XLSX com TODOS os registros (não só do dia) ===
document.getElementById("btnGerarXLSX").addEventListener("click", () => {

    chrome.storage.local.get(["impressoes"], data => {

        const lista = data.impressoes || [];

        if (lista.length === 0) {
            alert("Nenhum registro encontrado.");
            return;
        }

        const linhas = lista.map(item => ({
            Plataforma: item.plataforma,
            Tipo: item.tipo,
            Etiquetas: item.etiquetas,
            "Data/Hora Impressão": new Date(item.timestamp).toLocaleString("pt-BR")
        }));

        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(linhas);
        XLSX.utils.book_append_sheet(wb, ws, "Impressões");

        XLSX.writeFile(wb, "registros_impressao.xlsx");
    });

});

// carrega automaticamente ao abrir o popup
carregarLista();
