import React, { useState } from 'react';
import axios from 'axios';
import {
  Upload, Database, Loader2, LogOut, ShieldCheck,
  FileSpreadsheet, Map, MapPin, Search, List
} from 'lucide-react';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginData, setLoginData] = useState({ user: '', pass: '' });
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState([]);
  const [loading, setLoading] = useState({ upload: false, fetch: false, login: false });
  const [apiResult, setApiResult] = useState(null); // Para mostrar o JSON da API
  const [estadoBusca, setEstadoBusca] = useState('');
  const [cidadeBusca, setCidadeBusca] = useState('');
  const [viewMode, setViewMode] = useState('tabela'); // 'tabela' ou 'api'

  // --- Funções de Teste de API ---
  const testApi = async (endpoint, label) => {
    setLoading(prev => ({ ...prev, api: true }));
    setApiResult(`Chamando ${label}...`);
    setViewMode('api');
    try {
      const res = await axios.get(`http://localhost:3001${endpoint}`);
      setApiResult(res.data);
      // Se for a lista geral, também atualiza a tabela principal
      if (endpoint === '/listar-dados') setPreview(res.data.dados || []);
    } catch (err) {
      setApiResult({ erro: "Certifique-se que o backend está rodando na porta 3001", detalhes: err.message });
    } finally {
      setLoading(prev => ({ ...prev, api: false }));
    }
  };
  // --- Lógica de Autenticação ---
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(prev => ({ ...prev, login: true }));
    try {
      // Simulação de chamada de API para o seu backend
      const res = await axios.post('http://localhost:3001/login', loginData);
      localStorage.setItem('token', res.data.token);
      setIsLoggedIn(true);
    } catch (err) {
      alert("Usuário ou senha inválidos");
    } finally {
      setLoading(prev => ({ ...prev, login: false }));
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    setPreview([]);
  };

  // --- Lógica de Dados ---
  const handleUpload = async () => {
    if (!file) return;
    setLoading(prev => ({ ...prev, upload: true }));
    setViewMode('tabela');
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await axios.post('http://localhost:3001/upload', formData);
      setPreview(res.data.data || res.data.preview);
    } catch (err) {
      alert("Erro na validação. Verifique as colunas.");
    } finally {
      setLoading(prev => ({ ...prev, upload: false }));
    }
  };

  const fetchDadosMemoria = async () => {
    setLoading(prev => ({ ...prev, fetch: true }));
    try {
      const res = await axios.get('http://localhost:3001/listar-dados');
      setPreview(res.data.dados);
    } catch (err) {
      alert("Erro ao conectar ao servidor.");
    } finally {
      setLoading(prev => ({ ...prev, fetch: false }));
    }
  };

  // --- TELA DE LOGIN (Material Design) ---
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-indigo-50 flex items-center justify-center p-4">
        <div className="bg-white w-full max-w-md rounded-[2rem] shadow-xl overflow-hidden animate-in fade-in zoom-in duration-300">
          <div className="bg-indigo-600 p-8 text-center text-white">
            <ShieldCheck className="mx-auto mb-4" size={48} />
            <h2 className="text-2xl font-bold tracking-tight">Info Consultorios Align</h2>
          </div>
          <form onSubmit={handleLogin} className="p-8 space-y-4">
            <input type="text" placeholder="Usuário" className="w-full p-4 rounded-2xl border border-gray-100 bg-gray-50 outline-none focus:ring-2 focus:ring-indigo-500 transition-all" onChange={e => setLoginData({ ...loginData, user: e.target.value })} />
            <input type="password" placeholder="Senha" className="w-full p-4 rounded-2xl border border-gray-100 bg-gray-50 outline-none focus:ring-2 focus:ring-indigo-500 transition-all" onChange={e => setLoginData({ ...loginData, pass: e.target.value })} />
            <button className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 active:scale-95 transition-all">Entrar</button>
          </form>
        </div>
      </div>
    );
  }

  // --- TELA PRINCIPAL (Dashboard Material) ---
  return (
    <div className="min-h-screen bg-[#F8FAFF] p-4 md:p-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* Header */}
        <header className="flex justify-between items-center bg-white p-6 rounded-[2rem] shadow-sm">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2 rounded-xl text-white"><FileSpreadsheet size={24} /></div>
            <h1 className="text-xl font-black text-gray-800 tracking-tight">Info Consultorios Align<span className="text-indigo-600 font-medium text-sm ml-2">v1.0</span></h1>
          </div>
          <button onClick={() => setIsLoggedIn(false)} className="p-3 text-gray-400 hover:bg-red-50 hover:text-red-500 rounded-2xl transition-all"><LogOut /></button>
        </header>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Coluna Esquerda: Upload e Testes de API */}
          <div className="lg:col-span-1 space-y-6">

            {/* Card de Upload */}
            <section className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2"><Upload size={18} /> Importar Dados</h3>
              <input type="file" onChange={e => setFile(e.target.files[0])} className="text-xs mb-4 w-full file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-indigo-50 file:text-indigo-700" />
              <button onClick={() => handleUpload('/upload', 'Upload')} className="w-full bg-indigo-600 text-white py-3 rounded-2xl font-bold hover:shadow-indigo-200 shadow-md transition-all active:scale-95">Processar Excel</button>
            </section>

            {/* Card de Testes de API */}
            <section className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2 text-indigo-600"><Search size={18} /> Testar Endpoints</h3>
              <div className="grid grid-cols-1 gap-3">
                <button onClick={() => testApi('/estados', 'Estados')} className="flex items-center gap-3 p-3 rounded-2xl bg-emerald-50 text-emerald-700 font-semibold hover:bg-emerald-100 transition-all border border-emerald-100 shadow-sm"><Map size={18} /> Listar Estados</button>
                <button onClick={() => testApi('/cidades', 'Cidades')} className="flex items-center gap-3 p-3 rounded-2xl bg-amber-50 text-amber-700 font-semibold hover:bg-amber-100 transition-all border border-amber-100 shadow-sm"><MapPin size={18} /> Listar Cidades</button>
                <button onClick={() => testApi('/listar-dados', 'Todos os Dados')} className="flex items-center gap-3 p-3 rounded-2xl bg-blue-50 text-blue-700 font-semibold hover:bg-blue-100 transition-all border border-blue-100 shadow-sm"><List size={18} /> Listar Memória</button>
              </div>



              {/* Seção: Consulta Combinada (Estado + Cidade) */}
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-[10px] text-gray-400 uppercase font-bold mb-3 tracking-widest text-indigo-600">
                  Busca Avançada
                </p>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Estado"
                      maxLength="100"
                      className="p-3 rounded-xl border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all uppercase"
                      value={estadoBusca}
                      onChange={(e) => setEstadoBusca(e.target.value)}
                    />
                    <input
                      type="text"
                      placeholder="Cidade"
                      className="p-3 rounded-xl border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                      value={cidadeBusca}
                      onChange={(e) => setCidadeBusca(e.target.value)}
                    />
                  </div>

                  <button
                    onClick={() => {
                      if (!estadoBusca || !cidadeBusca) return alert("Preencha Estado e Cidade");
                      // Chamada para o novo endpoint ou lógica de filtro
                      testApi(`/consultar/${estadoBusca}/${cidadeBusca}`, `Busca em ${cidadeBusca}-${estadoBusca}`);
                    }}
                    className="w-full bg-slate-800 text-white p-3 rounded-xl hover:bg-black active:scale-95 transition-all shadow-md flex items-center justify-center gap-2 font-bold text-sm"
                  >
                    <Search size={16} />
                    Filtrar Consultórios
                  </button>
                </div>
              </div>
            </section>
          </div>

          {/* Coluna Direita: Alternância Dinâmica */}
          <div className="lg:col-span-2">
            {preview.length > 0 ? (
              <div className="space-y-4">
                {/* Abas de Navegação (Tabs) - Estilo Material Design */}
                <div className="flex bg-gray-200/50 p-1 rounded-2xl w-fit">
                  <button
                    onClick={() => setViewMode('tabela')}
                    className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${viewMode === 'tabela' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                    Visualizar Tabela
                  </button>
                  <button
                    onClick={() => setViewMode('api')}
                    className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${viewMode === 'api' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                    Resposta JSON
                  </button>
                </div>

                {/* Renderização Condicional do Conteúdo */}
                {viewMode === 'tabela' ? (
                  <div className="bg-white rounded-[2rem] shadow-sm overflow-hidden border border-gray-100 animate-in fade-in slide-in-from-right-4 duration-500">
                    <div className="p-6 border-b border-gray-50 flex justify-between items-center">
                      <h3 className="font-bold text-gray-800">Base de Dados Carregada</h3>
                      <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold">{preview.length} itens</span>
                    </div>
                    <div className="overflow-x-auto max-h-[600px]">
                      <table className="w-full text-left border-collapse">
                        <thead className="sticky top-0 bg-indigo-600 text-white">
                          <tr>
                            {Object.keys(preview[0] || {}).map(k => <th key={k} className="p-4 text-[10px] uppercase">{k}</th>)}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {preview.map((row, i) => (
                            <tr key={i} className="hover:bg-indigo-50/50 transition-colors">
                              {Object.values(row).map((v, j) => <td key={j} className="p-4 text-xs text-gray-600">{v}</td>)}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <div className="bg-slate-900 rounded-[2rem] p-8 shadow-2xl border border-slate-800 animate-in fade-in slide-in-from-left-4 duration-500 min-h-[400px]">
                    <div className="flex justify-between items-center mb-6">
                      <p className="text-xs text-emerald-400 font-mono font-bold uppercase tracking-widest">HTTP Response Console</p>
                      <div className="flex gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500/50"></div>
                        <div className="w-3 h-3 rounded-full bg-amber-500/50"></div>
                        <div className="w-3 h-3 rounded-full bg-emerald-500/50"></div>
                      </div>
                    </div>
                    <pre className="text-emerald-400 font-mono text-sm leading-relaxed overflow-x-auto whitespace-pre-wrap">
                      {apiResult ? JSON.stringify(apiResult, null, 2) : "// Nenhuma chamada realizada"}
                    </pre>
                  </div>
                )}
              </div>
            ) : (
              /* Estado Vazio - Só aparece se não houve upload ainda */
              <div className="h-full min-h-[400px] flex flex-col items-center justify-center bg-white rounded-[2rem] border-2 border-dashed border-gray-100 p-12 text-center animate-pulse">
                <div className="bg-indigo-50 p-6 rounded-full mb-4 text-indigo-200">
                  <Database size={64} />
                </div>
                <h3 className="text-gray-400 font-medium">Aguardando importação de arquivo Excel...</h3>
                <p className="text-gray-300 text-sm mt-2">Os dados aparecerão aqui após o processamento.</p>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

export default App;