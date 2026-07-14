// api/agendar.js
import mysql from 'mysql2/promise';

export default async function handler(req, res) {
    // Permitir apenas requisições do tipo POST (para salvar dados)
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Método não permitido' });
    }

    const { cliente_name, dataInput, horario_agendamento } = req.body;

    // 1. Validação de Segurança contra datas passadas (feita no Servidor)
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const dataAgendamento = new Date(dataInput + 'T00:00:00');

    if (dataAgendamento < hoje) {
        return res.status(400).json({ error: 'A data não pode ser anterior a hoje.' });
    }

    try {
        // 2. Conectar ao seu MySQL na Nuvem usando Variáveis de Ambiente (oculta as senhas)
        const connection = await mysql.createConnection(process.env.MYSQL_URL);

        // 3. Inserir o agendamento no banco beaulty_studio
        const query = `
            INSERT INTO agendamentos (cliente_name, data_agendamento, horario_agendamento) 
            VALUES (?, ?, ?)
        `;
        
        await connection.execute(query, [cliente_name, dataInput, horario_agendamento]);
        await connection.end();

        // Retornar sucesso para o cliente
        return res.status(200).json({ success: true, message: 'Agendamento realizado com sucesso!' });

    } catch (error) {
        // Se a Unique Key que criamos antes barrar o horário duplicado, vai cair aqui
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ error: 'Este horário já foi preenchido. Escolha outro!' });
        }
        return res.status(500).json({ error: 'Erro interno no servidor: ' + error.message });
    }
}