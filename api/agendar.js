// api/agendar.js
import 'dotenv/config';
import mysql from 'mysql2/promise'; // Importado apenas UMA vez para evitar o erro de declaração!

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

    try {
        // 2. Conexão inteligente (Vercel vs Local)
        let connection;
        
        // Se houver a variável MYSQL_URL no ambiente (como na Vercel ou no .env local)
        if (process.env.MYSQL_URL) {
            connection = await mysql.createConnection(process.env.MYSQL_URL);
        } else {
            // Se NÃO houver (ambiente de desenvolvimento local padrão)
            connection = await mysql.createConnection({
                host: '127.0.0.1',
                user: 'beaulty_user',
                password: '@Nderson14121982', // Sua senha do banco local
                database: 'defaultdb',
                port: 17130
            });
        }

        // 3. Inserir o agendamento
        const query = `
            INSERT INTO agendamentos (cliente_name, data_agendamento, horario_agendamento) 
            VALUES (?, ?, ?)
        `;
        
        await connection.execute(query, [cliente_name, dataInput, horario_agendamento]);
        await connection.end();

        return res.status(200).json({ success: true, message: 'Agendamento realizado com sucesso!' });

    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ error: 'Este horário já foi preenchido. Escolha outro!' });
        }
        return res.status(500).json({ error: 'Erro interno no servidor: ' + error.message });
    }
}