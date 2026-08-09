const URL_SERVIDOR_IA = 'https://old-paper-7c3f.andrew1430000f.workers.dev/';
const STORAGE_KEY = 'painel_sac_notas_v1';

// Mensagens originais de fábrica
const MENSAGENS_PADRAO = {
    nota1: "Olá, seja bem-vindo ao Serviço de Atendimento ao cliente da i_mais® . Me chamo Andrew Owens e darei continuidade ao seu atendimento.",
    nota2: "⏳ Um momento, por favor… estou realizando a verificação para você ✅🔎",
    nota3: "Poderia informar seu CPF por favor. 😊",
    nota4: "Seu atendimento foi concluído! 🎉 Sua opinião é muito importante para nós. Pode dedicar 15 segundos para avaliar como foi sua experiência?",
    nota5: "Posso ajudar com algo mais?",
    nota6: "Como não tive seu retorno, vou encerrar nosso chamado por agora. Mas fique tranquilo(a)! Seu histórico está salvo. Quando puder falar, é só mandar um 'Oi' aqui que a gente continua de onde parou. Tenha um ótimo dia! 😊✨",
    nota7: "Pedimos desculpas pela demora. Devido à alta demanda, não foi possível responder antes. Se ainda precisar, entre em contato.",
    nota8: "ℹ️ Manutenção na região identificada. Equipe trabalhando para normalizar o sinal. 🔗 Acompanhe o status no link.",
    nota9: "Solicitação de suporte aberta. Cliente não retornou às mensagens enviadas.",
    nota10: "Protocolo finalizado por ausência de resposta. Permanecemos à disposição.",
    nota11: "",
    nota12: ""
};

// Carrega as mensagens salvas ou carrega o padrão
function carregarMensagens() {
    const salvas = localStorage.getItem(STORAGE_KEY);
    const notas = salvas ? JSON.parse(salvas) : MENSAGENS_PADRAO;

    for (let i = 1; i <= 12; i++) {
        const el = document.getElementById(`nota${i}`);
        if (el) {
            el.value = notas[`nota${i}`] !== undefined ? notas[`nota${i}`] : (MENSAGENS_PADRAO[`nota${i}`] || "");
            
            // Salva alterações em tempo real quando o usuário digita na nota
            el.addEventListener('input', () => {
                salvarNotasDoPainel();
            });
        }
    }
}

// Salva o estado atual das 12 notas
function salvarNotasDoPainel() {
    const notas = {};
    for (let i = 1; i <= 12; i++) {
        const el = document.getElementById(`nota${i}`);
        if (el) notas[`nota${i}`] = el.value;
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notas));
}

// Função de copiar texto
function copiarTexto(id, btnElement) {
    var textArea = document.getElementById(id);
    if (!textArea) return;

    textArea.select();
    navigator.clipboard.writeText(textArea.value).then(() => {
        exibirFeedback(btnElement, id);
    }).catch(() => {
        document.execCommand("copy");
        exibirFeedback(btnElement, id);
    });
}

function exibirFeedback(btnElement, id) {
    if (id === 'nota13') {
        var msgIA = document.getElementById('msg13');
        msgIA.style.color = "var(--accent)";
        msgIA.textContent = "✅ Copiado com sucesso!";
        setTimeout(() => msgIA.textContent = "", 1500);
    } else if (btnElement) {
        var container = btnElement.closest('.note-footer');
        var msg = container ? container.querySelector('.msg-status') : null;
        if (msg) {
            msg.textContent = "✅ Copiado!";
            setTimeout(() => msg.textContent = "", 1200);
        }
    }
}

// Função de IA
async function melhorarTexto() {
    var textArea = document.getElementById('nota13');
    var texto = textArea.value.trim();
    var msg = document.getElementById('msg13');
    var btn = document.getElementById('btnMelhorar');

    if (!texto) {
        msg.style.color = "var(--danger)";
        msg.textContent = "Escreva algo antes de melhorar.";
        return;
    }

    btn.disabled = true;
    btn.textContent = "Melhorando...";
    msg.textContent = "";

    try {
        var resposta = await fetch(URL_SERVIDOR_IA, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ texto: texto })
        });

        var dados = await resposta.json();

        if (dados.textoMelhorado) {
            textArea.value = dados.textoMelhorado;
            msg.style.color = "var(--accent)";
            msg.textContent = "✨ Texto melhorado com sucesso!";
        } else {
            msg.style.color = "var(--danger)";
            msg.textContent = "Não foi possível melhorar o texto.";
        }
    } catch (erro) {
        msg.style.color = "var(--danger)";
        msg.textContent = "Erro de conexão. Tente novamente.";
    }

    btn.disabled = false;
    btn.textContent = "✨ Melhorar com IA";

    setTimeout(function() {
        msg.textContent = "";
    }, 3000);
}

// LÓGICA DO MODAL DE GERENCIAMENTO DE MENSAGENS
document.addEventListener('DOMContentLoaded', () => {
    carregarMensagens();

    const modal = document.getElementById('modalGerenciar');
    const btnGerenciar = document.getElementById('btnGerenciar');
    const btnCloseModal = document.getElementById('btnCloseModal');
    const btnSalvar = document.getElementById('btnSalvarMensagens');
    const btnRestaurar = document.getElementById('btnRestaurarPadrao');
    const editorList = document.getElementById('editorMensagensList');

    // Abre o Modal e carrega as caixas de texto
    btnGerenciar.addEventListener('click', () => {
        editorList.innerHTML = '';
        for (let i = 1; i <= 12; i++) {
            const valAtual = document.getElementById(`nota${i}`).value;
            const item = document.createElement('div');
            item.className = 'editor-item';
            item.innerHTML = `
                <label class="mono">NOTA Nº ${String(i).padStart(2, '0')}</label>
                <textarea id="edit_nota${i}">${valAtual}</textarea>
            `;
            editorList.appendChild(item);
        }
        modal.classList.add('active');
    });

    // Fecha o Modal
    btnCloseModal.addEventListener('click', () => modal.classList.remove('active'));

    // Salva as alterações feitas no Modal
    btnSalvar.addEventListener('click', () => {
        for (let i = 1; i <= 12; i++) {
            const novoVal = document.getElementById(`edit_nota${i}`).value;
            document.getElementById(`nota${i}`).value = novoVal;
        }
        salvarNotasDoPainel();
        modal.classList.remove('active');
    });

    // Restaura o padrão original do sistema
    btnRestaurar.addEventListener('click', () => {
        if (confirm("Tem certeza que deseja restaurar todas as mensagens para os textos padrão originais?")) {
            localStorage.removeItem(STORAGE_KEY);
            carregarMensagens();
            modal.classList.remove('active');
        }
    });

    // Drag & Drop
    let draggedCard = null;
    const cards = document.querySelectorAll('.nota-card');

    cards.forEach(card => {
        card.addEventListener('dragstart', (e) => {
            draggedCard = card;
            card.classList.add('dragging');
            e.dataTransfer.effectAllowed = 'move';
        });

        card.addEventListener('dragend', () => {
            card.classList.remove('dragging');
            draggedCard = null;
            salvarNotasDoPainel();
        });

        card.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
        });

        card.addEventListener('drop', (e) => {
            e.preventDefault();
            if (!draggedCard || draggedCard === card) return;

            const sourceTextarea = draggedCard.querySelector('textarea');
            const targetTextarea = card.querySelector('textarea');

            if (sourceTextarea && targetTextarea) {
                const tempValue = sourceTextarea.value;
                sourceTextarea.value = targetTextarea.value;
                targetTextarea.value = tempValue;
                salvarNotasDoPainel();
            }
        });

        const textarea = card.querySelector('textarea');
        if (textarea) {
            textarea.addEventListener('mousedown', (e) => e.stopPropagation());
        }
    });
});