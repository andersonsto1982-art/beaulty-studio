// api/agendar.js
import 'dotenv/config';
import mysql from 'mysql2/promise';

export default async function handler(req, res) {
    // Permitir apenas requisições do tipo POST
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Método não permitido' });
    }

    const { cliente_name, dataInput, horario_agendamento } = req.body;

    // 1. Validação de Segurança contra datas passadas
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const dataAgendamento = new Date(dataInput + 'T00:00:00');

    if (dataAgendamento < hoje) {
        return res.status(400).json({ error: 'A data não pode ser anterior a hoje.' });
    }

    let connection; // Declarada aqui fora para podermos fechar no 'finally'

    try {
        // 2. Conexão inteligente (Vercel vs Local)
        if (process.env.MYSQL_URL) {
            connection = await mysql.createConnection(process.env.MYSQL_URL);
        } else {
            // Configurações do seu banco local
            connection = await mysql.createConnection({
                host: '127.0.0.1',
                user: 'beaulty_user',
                password: '@Nderson14121982', 
                database: 'defaultdb',
                port: 3306 // Corrigido para a porta padrão do seu MySQL local!
            });
        }

        // 3. Inserir o agendamento
        const query = `
            INSERT INTO agendamentos (cliente_name, data_agendamento, horario_agendamento) 
            VALUES (?, ?, ?)
        `;
        
        await connection.execute(query, [cliente_name, dataInput, horario_agendamento]);

        return res.status(200).json({ success: true, message: 'Agendamento realizado com sucesso!' });

    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ error: 'Este horário já foi preenchido. Escolha outro!' });
        }
        return res.status(500).json({ error: 'Erro interno no servidor: ' + error.message });
    } finally {
        // Garante que a conexão com o banco sempre será fechada, evitando travar o banco por excesso de conexões abertas
        if (connection) {
            await connection.end();
        }
    }
}