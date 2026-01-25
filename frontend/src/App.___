import React, { useState } from 'react';
import axios from 'axios';
import { Upload, Database, Loader2, LayoutDashboard, LogIn, LogOut, FileSpreadsheet, ShieldCheck } from 'lucide-react';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginData, setLoginData] = useState({ user: '', pass: '' });
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState([]);
  const [loading, setLoading] = useState({ upload: false, fetch: false, login: false });

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
      alert("Usuário ou senha inválidos (Dica: admin / 123)");
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
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 flex items-center justify-center p-4">
        <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-white">
          <div className="bg-indigo-600 p-8 text-center text-white">
            <div className="bg-white/20 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <ShieldCheck size={32} />
            </div>
            <h2 className="text-2xl font-bold">Bem-vindo</h2>
            <p className="text-indigo-100 text-sm">Acesse o Portal de Consultórios</p>
          </div>
          <form onSubmit={handleLogin} className="p-8 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Usuário</label>
              <input
                type="text"
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                onChange={e => setLoginData({ ...loginData, user: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
              <input
                type="password"
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                onChange={e => setLoginData({ ...loginData, pass: e.target.value })}
              />
            </div>
            <button
              type="submit"
              disabled={loading.login}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-2"
            >
              {loading.login ? <Loader2 className="animate-spin" /> : <LogIn size={20} />}
              Entrar no Sistema
            </button>
          </form>
        </div>
      </div>
    );
  }

  // --- TELA PRINCIPAL (Dashboard Material) ---
  return (
    <div className="min-h-screen bg-[#f8faff] flex">
      {/* Sidebar Simples (Desktop) */}
      <aside className="hidden lg:flex w-64 bg-white border-r border-gray-100 flex-col p-6 space-y-8">
        <div className="flex items-center gap-3 text-indigo-600 font-black text-xl">
          <div className="bg-indigo-600 text-white p-2 rounded-lg"><LayoutDashboard size={20} /></div>
          Info Consultorios Align
        </div>
        <nav className="flex-1 space-y-2">
          <button className="w-full flex items-center gap-3 px-4 py-3 bg-indigo-50 text-indigo-700 rounded-xl font-medium">
            <FileSpreadsheet size={20} /> Upload Excel
          </button>
        </nav>
        <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 text-gray-500 hover:text-red-600 transition-colors font-medium">
          <LogOut size={20} /> Sair
        </button>
      </aside>

      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        <div className="max-w-5xl mx-auto space-y-8">

          {/* Top Bar Mobile */}
          <div className="lg:hidden flex justify-between items-center mb-6">
            <h1 className="font-bold text-indigo-600">Info Consultorios Align</h1>
            <button onClick={handleLogout} className="p-2 text-gray-500"><LogOut /></button>
          </div>

          {/* Upload Card */}
          <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-50">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Importar Nova Planilha</h2>
            <div className="grid md:grid-cols-3 gap-6 items-center">
              <div className="md:col-span-2">
                <label className="group relative flex items-center justify-center w-full h-40 border-2 border-dashed border-gray-200 rounded-[1.5rem] cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/30 transition-all">
                  <div className="text-center">
                    <Upload className="mx-auto text-gray-400 group-hover:text-indigo-500 transition-colors mb-2" size={32} />
                    <p className="text-gray-500">{file ? file.name : "Arraste ou clique para selecionar"}</p>
                  </div>
                  <input type="file" className="hidden" onChange={e => setFile(e.target.files[0])} />
                </label>
              </div>
              <div className="space-y-3">
                <button
                  onClick={handleUpload}
                  disabled={loading.upload || !file}
                  title="Enviar planilha para o servidor"
                  className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-200 text-white py-4 rounded-2xl font-bold shadow-lg shadow-indigo-100 transition-all active:scale-95"
                >
                  {loading.upload ? <Loader2 className="animate-spin mx-auto" /> : "Processar Arquivo"}
                </button>
                <button
                  onClick={fetchDadosMemoria}
                  title="Visualizar o que já está na memória"
                  className="w-full bg-white border border-gray-200 text-gray-700 py-4 rounded-2xl font-bold hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
                >
                  <Database size={18} /> Listar Memória
                </button>
              </div>
            </div>
          </div>

          {/* Table Card */}
          {preview.length > 0 && (
            <div className="bg-white rounded-[2rem] shadow-sm border border-gray-50 overflow-hidden">
              <div className="p-6 border-b border-gray-50 flex justify-between items-center">
                <h3 className="font-bold text-gray-700">Dados Carregados ({preview.length})</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50/50">
                      {Object.keys(preview[0]).map(key => (
                        <th key={key} className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">{key}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {preview.map((row, i) => (
                      <tr key={i} className="hover:bg-indigo-50/30 transition-colors group">
                        {Object.values(row).map((val, idx) => (
                          <td key={idx} className="px-6 py-4 text-sm text-gray-600 group-hover:text-indigo-600 transition-colors font-medium">{val}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;