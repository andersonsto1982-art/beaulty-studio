document.addEventListener('DOMContentLoaded', () => {
            const formReserva = document.getElementById('form-reserva');

            if (formReserva) {
                formReserva.addEventListener('submit', function(evento) {
                    evento.preventDefault();

                    // Coleta de todos os campos preenchidos
                    const nome = document.getElementById('nome').value.trim();
                    const servico = document.getElementById('servico').value;
                    const dataInput = document.getElementById('data').value;
                    const horario = document.getElementById('horario').value;

                    // Formatação da data de AAAA-MM-DD para DD/MM/AAAA
                    let dataFormatada = dataInput;
                    if (dataInput && dataInput.includes('-')) {
                        dataFormatada = dataInput.split('-').reverse().join('/');
                    }

                    const numeroWhatsapp = "5581997087849";

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