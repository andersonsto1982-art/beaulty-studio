// script.js (Front-end)

// Função para abrir o modal correto
function abrirGaleria(idModal) {
    const modal = document.getElementById(idModal);
    if (modal) {
        modal.style.display = "block";
        // Bloqueia a rolagem da página de fundo enquanto o modal estiver aberto
        document.body.style.overflow = "hidden";
    }
}

// Função para fechar o modal
function fecharGaleria(idModal) {
    const modal = document.getElementById(idModal);
    if (modal) {
        modal.style.display = "none";
        // Devolve a rolagem normal para a página de fundo
        document.body.style.overflow = "auto";
    }
}

// Opcional: Fecha o modal se o usuário clicar no fundo escuro fora da caixinha
window.onclick = function(event) {
    if (event.target.classList.contains('modal-galeria')) {
        event.target.style.display = "none";
        document.body.style.overflow = "auto";
    }
}

// Função que faz a ponte segura com o banco de dados na Vercel
async function salvarNoBanco(nome, servico, dataInput, horario) {
    const dados = {
        cliente_name: nome,
        servico: servico, // Adicionado caso queira salvar o serviço no banco também
        dataInput: dataInput, // Formato AAAA-MM-DD (ideal para o MySQL)
        horario_agendamento: horario
    };

    // Faz a chamada segura para a rota da Vercel
    const resposta = await fetch('/api/agendar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dados)
    });

    const resultado = await resposta.json();

    if (resposta.ok) {
        return { sucesso: true, message: resultado.message };
    } else {
        return { sucesso: false, erro: resultado.error };
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const formReserva = document.getElementById('form-reserva');

    if (formReserva) {
        // Transformamos a função em "async" para poder esperar a resposta do banco de dados
        formReserva.addEventListener('submit', async function (evento) {
            evento.preventDefault();

            // Coleta de todos os campos preenchidos
            const nome = document.getElementById('nome').value.trim();
            const servico = document.getElementById('servico').value;
            const dataInput = document.getElementById('data').value;
            const horario = document.getElementById('horario').value;

            const codP = "55";
            const ddd = "81";
            const pref = "99708";
            const suf = "7849";
            const nZap = codP + ddd + pref + suf;

            // Formatação da data de AAAA-MM-DD para DD/MM/AAAA
            let dataFormatada = dataInput;

            if (dataInput && dataInput.includes('-')) {
                // 1. Criar objetos de data para comparação (zerando as horas)
                const hoje = new Date();
                hoje.setHours(0, 0, 0, 0);

                // O formato 'AAAA-MM-DD' é ideal para o construtor do Date
                const dataAgendamento = new Date(dataInput + 'T00:00:00');

                // 2. Verificar se a data escolhida é menor que a data de hoje (Validação Visual rápida)
                if (dataAgendamento < hoje) {
                    alert("A data do agendamento não pode ser anterior ao dia de hoje!");
                    return;
                }

                // 3. Se a data for válida, formata para o padrão DD/MM/AAAA
                dataFormatada = dataInput.split('-').reverse().join('/');
            }

            // ==========================================================
            // PASSO NOVO: CONEXÃO COM O BANCO ANTES DO WHATSAPP
            // ==========================================================
            // Mostra um aviso visual rápido ou muda o texto do botão para "Agendando..." se desejar
            
            const resultadoBanco = await salvarNoBanco(nome, servico, dataInput, horario);

            if (!resultadoBanco.sucesso) {
                // Se o banco rejeitar (ex: horário duplicado), o fluxo para aqui e avisa o cliente
                alert("Não foi possível agendar: " + resultadoBanco.erro);
                return; 
            }

            // Se o código chegou até aqui, significa que salvou no MySQL com sucesso!
            // Agora geramos a mensagem para enviar no WhatsApp da dona do Studio.

            const numeroWhatsapp = nZap; 

            // ==========================================================
            // FORMATAÇÃO ESTILIZADA DA MENSAGEM DO WHATSAPP
            // ==========================================================
            let mensagem = "✨ NOVA SOLICITAÇÃO DE AGENDAMENTO ✨\n";
            mensagem += "--------------------------------------\n\n";
            mensagem += "👤 Cliente: " + nome + "\n";
            mensagem += "💅 Serviço: " + servico + "\n";
            mensagem += "📅 Data: " + dataFormatada + "\n";
            mensagem += "⏰ Horário: " + horario + "\n\n";
            mensagem += "--------------------------------------\n";
            mensagem += "Confirmado e registrado no Beaulty Studio.";

            // Converte os caracteres especiais e quebras de linha para formato de URL
            const mensagemCodificada = encodeURIComponent(mensagem);

            // Monta o link final usando a API oficial estável
            const linkFinal = "https://api.whatsapp.com/send?phone=" + numeroWhatsapp + "&text=" + mensagemCodificada;

            // Redireciona o usuário para o WhatsApp
            window.location.href = linkFinal;
        });
    } else {
        console.error("Formulário não encontrado no DOM!");
    }
});