document.addEventListener('DOMContentLoaded', () => {
    const formReserva = document.getElementById('form-reserva');

    if (formReserva) {
        formReserva.addEventListener('submit', function (evento) {
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

                // 2. Verificar se a data escolhida é menor que a data de hoje
                if (dataAgendamento < hoje) {
                    // Aqui você trata o erro (ex: exibe um alerta, limpa o campo, etc.)
                    alert("A data do agendamento não pode ser anterior ao dia de hoje!");
                    // Opcional: interromper a execução do código aqui se necessário
                    return;
                }

                // 3. Se a data for válida, formata para o padrão DD/MM/AAAA
                dataFormatada = dataInput.split('-').reverse().join('/');
            }

            const numeroWhatsapp = nZap; // Número de telefone do WhatsApp (com código do país e DDD)

            // ==========================================================
            // FORMATAÇÃO ESTILIZADA DA MENSAGEM DO WHATSAPP
            // ==========================================================
            // Usamos asteriscos (*) para aplicar negrito nativo no Whats
            let mensagem = "✨ NOVA SOLICITAÇÃO DE AGENDAMENTO ✨\n";
            mensagem += "--------------------------------------\n\n";
            mensagem += "👤 Cliente: " + nome + "\n";
            mensagem += "💅 Serviço: " + servico + "\n";
            mensagem += "📅 Data: " + dataFormatada + "\n";
            mensagem += "⏰ Horário: " + horario + "\n\n";
            mensagem += "--------------------------------------\n";
            mensagem += "Enviado automaticamente pelo site Beaulty Studio.";

            // Converte os caracteres especiais e quebras de linha para formato de URL
            const mensagemCodificada = encodeURIComponent(mensagem);

            // Monta o link final usando a API oficial estável
            const linkFinal = "https://api.whatsapp.com/send?phone=" + numeroWhatsapp + "&text=" + mensagemCodificada;

            // Redireciona o usuário na mesma janela (evita bloqueio de pop-up)
            window.location.href = linkFinal;
        });
    } else {
        console.error("Formulário não encontrado no DOM!");
    }
});

// script.js (Front-end)

async function enviarAgendamento() {
    const dados = {
        cliente_name: document.getElementById('nome').value,
        dataInput: document.getElementById('data').value, // Formato AAAA-MM-DD
        horario_agendamento: document.getElementById('horario').value
    };

    // Faz a chamada segura para a rota da Vercel
    const resposta = await fetch('/api/agendar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dados)
    });

    const resultado = await resposta.json();

    if (resposta.ok) {
        alert("Sucesso: " + resultado.message);
    } else {
        // Aqui exibe o erro se for data passada ou horário duplicado
        alert("Erro: " + resultado.error);
    }
}