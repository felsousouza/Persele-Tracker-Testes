****Este projeto esta com todas as linhas de codigo geradas por IA, de acordo com minhas orientações e direcionamentos. O objetivo dele é que eu possa aprender na prática a como pensar como um desenvolvedor sem ficar preso ao meu "desconhecimento" prático de escrever códigos. Após a finalização dele, irei fazer um estudo em video destrinchando cada etapa do desenvolvimento, das linhas de código para entender tudo, afinal a IA esta escrevendo, mas eu sou o Master do projeto. ***
📦 Persele Tracker – Coletor de Impressões de Etiquetas
📌 Visão Geral

O Persele Tracker é uma extensão para Google Chrome criada para registrar impressões de etiquetas realizadas no sistema Persele, armazenando informações importantes como:

Plataforma do pedido
Tipo de pedido
Quantidade de etiquetas impressas
Data e hora da impressão

O objetivo principal do projeto é criar um histórico confiável de impressões, permitindo posteriormente:

Auditoria
Geração de relatórios
Exportação dos dados para planilhas (XLSX)

🎯 Objetivo Atual da Extensão

No estado atual, a extensão se propõe a:
Detectar quando o usuário realiza uma impressão de etiquetas
Solicitar confirmação explícita do usuário
Registrar a impressão somente após a confirmação
Armazenar os dados localmente no navegador
Permitir a exportação dos registros em XLSX
Nenhuma impressão é registrada automaticamente.

  Fluxo de Funcionamento Atual

1️⃣ Página de Lista (persele_lista.html)
Esta página simula o comportamento do sistema Persele original.

O usuário segue o fluxo:
Seleciona a plataforma (Mercado Livre, Amazon, Shopee, etc.)
Seleciona o tipo de pedido
O sistema simula uma quantidade de etiquetas
O usuário clica em “Imprimir Etiquetas”
Uma nova aba é aberta com a página de impressão
⚠️ Nenhum registro é salvo neste momento

2️⃣ Página de Impressão (persele_imprimir.html)
Esta página representa a tela real de impressão do Persele.

Exibe os dados recebidos via URL
O usuário abre o painel de impressão (CTRL + P)
O usuário imprime ou fecha o painel de impressão
Quando o painel de impressão é fechado:
A extensão detecta o evento (afterprint)
Um modal de confirmação da extensão é exibido na página

3️⃣ Confirmação da Impressão
A extensão exibe uma pergunta clara ao usuário:
“Deseja confirmar o registro da impressão dessas etiquetas?”
Opções:
✅ Sim, registrar
A impressão é salva no storage da extensão
❌ Não, cancelar
Nada é registrado
📌 A confirmação é obrigatória
📌 Se o usuário trocar de aba ou minimizar o navegador, a confirmação reaparece ao retornar

💾 Armazenamento dos Dados
Os registros são salvos em:
chrome.storage.local

Os dados persistem mesmo se:
O navegador for fechado
O computador for desligado
Os registros não são apagados automaticamente

Cada registro contém:
{
  "plataforma": "Mercado Livre",
  "tipo": "Full",
  "etiquetas": 27,
  "timestamp": "2025-01-01T14:32:10.000Z"
}

📤 Exportação dos Dados
A extensão possui um popup com a opção:
Exportar XLSX
Essa função:
Lê todos os registros armazenados
Gera um arquivo .xlsx
Inclui:
Plataforma
Tipo de pedido
Quantidade de etiquetas
Data e hora da impressão

🧩 Estrutura do Projeto
persele-tracker/
│
├── background.js        # Responsável por salvar os registros
├── content.js           # Detecta páginas, impressão e confirmação
├── manifest.json        # Configuração da extensão (Manifest V3)
│
├── popup.html           # Interface simples do popup
├── popup.js             # Exportação para XLSX
│
├── persele_lista.html   # Página de teste (simula lista do Persele)
└── persele_imprimir.html# Página de teste (simula impressão)

🚧 Observações Importantes

As páginas persele_lista.html e persele_imprimir.html são ambiente de testes
Elas existem para simular o Persele real
A lógica da extensão foi pensada para ser adaptada futuramente ao site original, com ajustes mínimos
Nenhuma modificação é feita diretamente no backend do Persele