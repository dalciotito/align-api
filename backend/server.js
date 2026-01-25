const express = require('express');
const multer = require('multer');
const xlsx = require('xlsx');
const cors = require('cors');
const jwt = require('jsonwebtoken');

const app = express();
const upload = multer({ storage: multer.memoryStorage() });
const SECRET_KEY = "sua_chave_secreta";


const allowedOrigins = [
  'http://localhost:5173',
  'https://align-api.onrender.com',
  'https://align-api-1.onrender.com'
];

app.use(cors({
  origin: function (origin, callback) {
    // Permite requests sem origem (como apps mobile ou curl)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      return callback(new Error('CORS não permite este domínio'), false);
    }
    return callback(null, true);
  }
}));

app.use(express.json());

let database = []; // Simulação de banco de dados em memória

// Middleware de Autenticação
const auth = (req, res, next) => {
  const token = req.headers['authorization'];
  if (!token) return res.status(401).json({ message: "Acesso negado" });
  next();
};

// Login Simples
app.post('/login', (req, res) => {
  const { user, pass } = req.body;
  console.log('login')
  if (user === 'admin' && pass === '1234') {
    const token = jwt.sign({ id: 1 }, SECRET_KEY);
    return res.json({ token });
  }
  res.status(401).json({ message: "Dados inválidos" });
});

// Upload e Validação
app.post('/upload', upload.single('file'), (req, res) => {
  const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const data = xlsx.utils.sheet_to_json(sheet);

  const colunasObrigatorias = ['ID', 'Doutor', 'Segmento', 'Endereço', 'Cidade', 'Estado', 'Bairro', 'CEP', 'WhatsApp'];
  const colunasArquivo = Object.keys(data[0] || {});

  console.log('colunas arquivo: ', colunasArquivo)

  const valid = colunasObrigatorias.every(c => colunasArquivo.includes(c));
  if (!valid) {
    console.log('erro validação colunas')
    return res.status(400).json({ message: "Colunas inválidas no Excel" });
  }

  const erros = [];
  const dadosTratados = data.map((item, index) => {
    // 1. Limpeza (remove tudo que não é número)
    const cepLimpo = item.CEP ? String(item.CEP).replace(/\D/g, '') : '';
    const whatsappLimpo = item.WhatsApp ? String(item.WhatsApp).replace(/\D/g, '') : '';

    // 2. Validação básica de comprimento
    if (cepLimpo.length !== 8) {
      erros.push(`Linha ${index + 2}: CEP inválido (${cepLimpo})`);
    }

    // Valida WhatsApp (mínimo 10 dígitos para fixo ou 11 para celular com DDD)
    if (whatsappLimpo.length < 10 || whatsappLimpo.length > 13) {
      erros.push(`Linha ${index + 2}: WhatsApp inválido (${whatsappLimpo})`);
    }

    return {
      ...item,
      CEP: cepLimpo,
      WhatsApp: whatsappLimpo
    };
  });

  // Se houver erros críticos, você pode optar por bloquear o upload
  if (erros.length > 0) {
    console.log('Erro no arquivo importado: ', erros)

    return res.status(422).json({
      message: "Existem erros de validação nos dados",
      errors: erros
    });
  }

  database = dadosTratados;
  res.json({ message: "Upload concluído", preview: database });
});

// Métodos de Consulta
app.get('/estados', (req, res) => {
  const estados = [...new Set(database.map(item => item.Estado))];
  res.json(estados);
});

app.get('/cidades/:estado', (req, res) => {
  const { estado } = req.params;
  const dados = database.filter(item => item.Estado.toLowerCase() === estado.toLowerCase());
  const cidades = [...new Set(dados.map(item => item.Cidade))];
  res.json(cidades);
});

app.get('/cidades', (req, res) => {
  const cidades = [...new Set(database.map(item => item.Cidade))];
  res.json(cidades);
});

app.get('/enderecos/:cidade', (req, res) => {
  const { cidade } = req.params;
  const enderecos = database.filter(item => item.Cidade.toLowerCase() === cidade.toLowerCase());
  res.json(enderecos);
});

app.get('/consultar/:estado/:cidade', (req, res) => {
  const { estado, cidade } = req.params;

  console.log(`consultando cidade: ${cidade} - estado: ${estado}`)
  const filtrados = database.filter(item =>
    item.Estado.toLowerCase() === estado.toLowerCase() &&
    item.Cidade.toLowerCase() === cidade.toLowerCase()
  );
  res.json({
    total: filtrados.length,
    dados: filtrados
  });
});

app.get('/consultar/:id', (req, res) => {
  const { id } = req.params;

  console.log(`consultando id: ${id}`)

  const filtrados = database.filter(item => String(item.ID) === String(id));
  res.json({
    total: filtrados.length,
    dados: filtrados
  });
});

app.get('/consulta-cep/:cep', (req, res) => {
  const { cep } = req.params;
  console.log(`consultando cep: ${cep}`)

  const filtrados = database.filter(item => String(item.CEP) === String(cep));
  res.json({
    total: filtrados.length,
    dados: filtrados
  });
})

// Método para listar todos os dados carregados em memória
app.get('/listar-dados', (req, res) => {
  if (database.length === 0) {
    return res.status(200).json({
      message: "Nenhum dado carregado na memória no momento.",
      dados: []
    });
  }
  res.json({
    total: database.length,
    dados: database
  });
});
app.listen(3001, () => console.log("Backend rodando na porta 3001"));