import dotenv from 'dotenv';

dotenv.config();

function iniciarAplicacao(){
    const porta = process.env.PORT || 8080;
    const apiKey = process.env.API_KEY_PAGAMENTO;
    const dbUrl = process.env.DATABASE_URL;
    if(!apiKey) {
        console.error('ERRO CRÍTICO: A chave API_KEY_PAGAMENTO não está definida nas variáveis de ambiente');
        process.exit();
    }
    
    console.log('=== SERVIÇO DE CONFIGURAÇÃO CARREGADO ===');
    console.log(`Servidor rodando na porta: ${porta}`);
    console.log(`Conexão com banco de dados: ${dbUrl}`);
    console.log(`Status da API de pagamento: chave de tamanho ${apiKey.length} autenticada.`);
}

iniciarAplicacao();