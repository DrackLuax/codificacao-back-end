import express from 'express';

const app = express();
app.use(express.json());

process.on('uncaughtException', (err) =>{
    console.error('[ERRO DE PROCESSO - uncaughtException]: ', err.message);
});

process.on('unhandledRejection', (reason) =>{
    console.error('[PROMISE REJEITADA - unhandledRejection]: ', reason);
});

app.get('/sucesso', (req, res) => {
    res.json({success: true, message: 'Operação Realizada com Sucesso!'});
});

app.get('/erro-sincrono', (req, res, next) => {
    try{
        throw new Error('Falha ao Processar a Regra de Negócio!');
    } catch(erro){
        next(erro);
    }
});

app.get('/erro-assincrono', async (req, res, next) =>{
    try{
        await Promise.reject(new Error('Erro na consulta no Banco de Dados externo'));
    }catch(erro){
        next(erro);
    }
});