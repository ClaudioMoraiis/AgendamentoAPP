import React, { useState, useEffect } from "react";
import "./GerenciamentoProfissionais.css";
import LayoutPrincipal from "../LayoutPrincipal/LayoutPrincipal";
import { apiService } from "../services/api";

// Status options
const statusOptions = ["Todos", "ativo", "inativo"];

export default function GerenciamentoProfissionais() {
  const [profissionais, setProfissionais] = useState([]);
  const [especialidades, setEspecialidades] = useState([]); // array of names (strings) or objects
  const [busca, setBusca] = useState("");
  const [especialidadeFiltro, setEspecialidadeFiltro] = useState("Todos");
  const [statusFiltro, setStatusFiltro] = useState("Todos");
  const [modalOpen, setModalOpen] = useState(false);
  const [modalEditarOpen, setModalEditarOpen] = useState(false);
  const [profissionalEditando, setProfissionalEditando] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingProfissionais, setLoadingProfissionais] = useState(true);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [novoProfissional, setNovoProfissional] = useState({
    nome: "",
    email: "",
    telefone: "",
    especialidade: "",
    status: "ativo"
  });

  // Carrega profissionais da API ao montar
  useEffect(() => {
    carregarProfissionais();
    carregarEspecialidades();
  }, []);

  const carregarProfissionais = async () => {
    try {
      setLoadingProfissionais(true);
      const resp = await apiService.profissionais.listar();
      // resp expected to be an array of objects with nome, telefone, especialidade, email, status, id
      const list = Array.isArray(resp) ? resp.map(p => ({
        id: p.id,
        nome: p.nome,
        email: p.email,
        telefone: p.telefone,
        // store as-is (likely a string name) but ensure string when it's a primitive
        especialidade: typeof p.especialidade === 'string' ? p.especialidade : (p.especialidade ? String(p.especialidade) : ''),
        status: String(p.status)
      })) : [];
      console.log('👷 Profissionais carregados:', list.map(x => ({nome: x.nome, id: x.id}))); 
      setProfissionais(list);
    } catch (error) {
      console.error('❌ Erro ao carregar profissionais:', error);
      setMessage({ text: error.message || 'Erro ao carregar profissionais', type: 'error' });
      setProfissionais([]);
    } finally {
      setLoadingProfissionais(false);
    }
  };

  // Carrega especialidades da API (utiliza /especialidade/listar)
  const carregarEspecialidades = async () => {
    try {
      const resp = await apiService.especialidades.listar();
      // resp may be an array of strings or objects; normalize to array of strings (names)
      let list = [];
      if (Array.isArray(resp)) {
        list = resp.map(item => {
          if (!item) return '';
          if (typeof item === 'string') return item;
          // common field names: nome, descricao, label
          return item.nome || item.label || item.descricao || item.name || JSON.stringify(item);
        }).filter(Boolean);
      }
      setEspecialidades(list);
    } catch (error) {
      console.error('❌ Erro ao carregar especialidades:', error);
      // keep existing list empty; user can still use free-text if needed
      setEspecialidades([]);
    }
  };

  // Filtros combinados
  // Resolve especialidade for display: if it's already a string, return it; if it's an id, try to lookup in fetched list
  const getEspecialidadeLabel = (especialidadeValue) => {
    if (!especialidadeValue && especialidadeValue !== 0) return '';
    if (typeof especialidadeValue === 'string') return especialidadeValue;
    // number -> try to find matching record in especialidades (if we have object forms like {id,nome})
    const found = especialidades.find(e => {
      if (!e) return false;
      if (typeof e === 'string') return false;
      return Number(e.id) === Number(especialidadeValue) || String(e.id) === String(especialidadeValue);
    });
    if (found) return found.nome || found.label || JSON.stringify(found);
    return String(especialidadeValue);
  };

  const profissionaisFiltrados = profissionais.filter(profissional => {
    const espLabel = getEspecialidadeLabel(profissional.especialidade);
    const buscaMatch =
      profissional.nome.toLowerCase().includes(busca.toLowerCase()) ||
      profissional.email.toLowerCase().includes(busca.toLowerCase()) ||
      espLabel.toLowerCase().includes(busca.toLowerCase());
    const especialidadeMatch = especialidadeFiltro === "Todos" || espLabel === especialidadeFiltro;
    const statusMatch = statusFiltro === "Todos" || profissional.status === statusFiltro;
    return buscaMatch && especialidadeMatch && statusMatch;
  });

  // Estatísticas
  const totalProfissionais = profissionais.length;
  const profissionaisAtivos = profissionais.filter(p => p.status === 'ativo').length;
  const profissionaisInativos = profissionais.filter(p => p.status === 'inativo').length;

  // Funções
  const abrirModalNovo = () => {
    setNovoProfissional({ nome: "", email: "", telefone: "", especialidade: "", status: "ativo" });
    setModalOpen(true);
  };

  const fecharModalNovo = () => setModalOpen(false);

  const abrirModalEditar = (profissional) => {
    setProfissionalEditando({ ...profissional });
    setModalEditarOpen(true);
  };

  const fecharModalEditar = () => {
    setModalEditarOpen(false);
    setProfissionalEditando(null);
  };

  const salvarNovoProfissional = async (e) => {
    e.preventDefault();
    if (!novoProfissional.nome || !novoProfissional.email || !novoProfissional.especialidade) {
      setMessage({ text: "Preencha todos os campos obrigatórios!", type: "error" });
      return;
    }

    setLoading(true);
    setMessage({ text: "", type: "" });

    try {
      // Chama API para cadastrar profissional
      const payload = {
        nome: novoProfissional.nome,
        telefone: novoProfissional.telefone || "",
        especialidade: novoProfissional.especialidade,
        email: novoProfissional.email,
        status: novoProfissional.status || "true"
      };
      const response = await apiService.profissionais.criar(payload);

      // Se houver campo Erro, a apiService já lançou; caso retorne Sucesso, exibe
      let successMessage = 'Profissional cadastrado com sucesso';
      if (response && typeof response === 'object') {
        if (response.Sucesso) successMessage = response.Sucesso;
      }

      setMessage({ text: successMessage, type: 'success' });

      // Recarrega lista
      await carregarProfissionais();

      // Fecha modal após 1.5s
      setTimeout(() => {
        fecharModalNovo();
        setMessage({ text: "", type: "" });
      }, 1500);
    } catch (error) {
      console.error('❌ Erro ao cadastrar profissional:', error);
      setMessage({ text: error.message || 'Erro ao cadastrar profissional', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const salvarEdicaoProfissional = async (e) => {
    e.preventDefault();
    if (!profissionalEditando.nome || !profissionalEditando.email || !profissionalEditando.especialidade) {
      setMessage({ text: "Preencha todos os campos obrigatórios!", type: "error" });
      return;
    }

    setLoading(true);
    setMessage({ text: "", type: "" });

    try {
      const response = await apiService.profissionais.atualizar(profissionalEditando.id, {
        nome: profissionalEditando.nome,
        telefone: profissionalEditando.telefone,
        especialidade: profissionalEditando.especialidade,
        email: profissionalEditando.email,
        status: profissionalEditando.status
      });

      let successMessage = 'Profissional alterado com sucesso';
      if (response && typeof response === 'object' && response.Sucesso) {
        successMessage = response.Sucesso;
      }
      setMessage({ text: successMessage, type: 'success' });

      await carregarProfissionais();

      setTimeout(() => {
        fecharModalEditar();
        setMessage({ text: "", type: "" });
      }, 1500);
    } catch (error) {
      console.error('❌ Erro ao alterar profissional:', error);
      setMessage({ text: error.message || 'Erro ao alterar profissional', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const excluirProfissional = async (id) => {
    // find professional for name
    const p = profissionais.find(x => x.id === id) || {};
    if (!window.confirm(`Tem certeza que deseja excluir o profissional "${p.nome || ''}"?`)) return;

    setMessage({ text: "", type: "" });
    setLoading(true);
    try {
      const response = await apiService.profissionais.deletar(id);
      let successMessage = 'Profissional excluído com sucesso';
      if (response && typeof response === 'object' && response.Sucesso) {
        successMessage = response.Sucesso;
      }
      setMessage({ text: successMessage, type: 'success' });
      await carregarProfissionais();
      setTimeout(() => setMessage({ text: "", type: "" }), 2500);
      if (modalEditarOpen) fecharModalEditar();
    } catch (error) {
      console.error('❌ Erro ao excluir profissional:', error);
      setMessage({ text: error.message || 'Erro ao excluir profissional', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const alterarStatus = (id, novoStatus) => {
    setProfissionais(profissionais.map(profissional => 
      profissional.id === id ? { ...profissional, status: novoStatus } : profissional
    ));
  };

  const getStatusClass = (status) => status === 'ativo' ? 'gp-status-ativo' : 'gp-status-inativo';
  const getStatusText = (status) => status === 'ativo' ? 'Ativo' : 'Inativo';

  return (
    <LayoutPrincipal paginaAtiva="profissionais">
      <div className="gp-main">
        <div className="gp-container">
          {/* Cabeçalho */}
          <div className="gp-page-header">
            <h1>💈 Nossos Profissionais</h1>
            <button className="gp-btn-primary" onClick={abrirModalNovo}>
              <span className="material-symbols-outlined">person_add</span>
              Novo Profissional
            </button>
          </div>

          {/* Mensagem global */}
          {message.text && (
            <div style={{marginBottom: 16}}>
              <div
                className={`gp-message ${message.type}`}
                style={{
                  padding: '12px 14px',
                  borderRadius: 8,
                  backgroundColor: message.type === 'success' ? '#dcfce7' : '#fee2e2',
                  border: `1px solid ${message.type === 'success' ? '#86efac' : '#fecaca'}`,
                  color: message.type === 'success' ? '#166534' : '#dc2626'
                }}
              >
                {message.text}
              </div>
            </div>
          )}

          {/* Card de Resumo */}
          <div className="gp-resumo-card">
            <h3>📊 Resumo</h3>
            <div className="gp-resumo-grid">
              <div className="gp-resumo-item">
                <span className="gp-resumo-valor">{totalProfissionais}</span>
                <span className="gp-resumo-label">Total</span>
              </div>
              <div className="gp-resumo-item">
                <span className="gp-resumo-valor" style={{color: '#10b981'}}>{profissionaisAtivos}</span>
                <span className="gp-resumo-label">Ativos</span>
              </div>
              <div className="gp-resumo-item">
                <span className="gp-resumo-valor" style={{color: '#6b7280'}}>{profissionaisInativos}</span>
                <span className="gp-resumo-label">Inativos</span>
              </div>
              <div className="gp-resumo-item">
                <span className="gp-resumo-valor" style={{color: '#137fec'}}>
                  {totalProfissionais > 0 ? Math.round((profissionaisAtivos / totalProfissionais) * 100) : 0}%
                </span>
                <span className="gp-resumo-label">Ativação</span>
              </div>
            </div>
          </div>

          {/* Filtros */}
          <div className="gp-filtros-card">
            <div className="gp-filtros-grid">
              <div className="gp-filtro-group">
                <label>🔍 Buscar Profissionais</label>
                <div className="gp-search">
                  <span className="material-symbols-outlined gp-search-icon">search</span>
                  <input
                    type="text"
                    placeholder="Nome, email ou especialidade..."
                    value={busca}
                    onChange={e => setBusca(e.target.value)}
                    className="gp-search-input"
                  />
                </div>
              </div>
              <div className="gp-filtro-group">
                <label>🎯 Especialidade</label>
                <select 
                  value={especialidadeFiltro} 
                  onChange={e => setEspecialidadeFiltro(e.target.value)}
                  className="gp-select"
                >
                  {especialidades.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>
              <div className="gp-filtro-group">
                <label>📊 Status</label>
                <select 
                  value={statusFiltro} 
                  onChange={e => setStatusFiltro(e.target.value)}
                  className="gp-select"
                >
                  {statusOptions.map(opt => (
                    <option key={opt} value={opt}>
                      {opt === 'Todos' ? 'Todos os Status' : getStatusText(opt)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Tabela */}
          <div className="gp-table-container">
            <table className="gp-table">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th className="gp-hide-lg">Email</th>
                  <th className="gp-hide-md">Telefone</th>
                  <th>Especialidade</th>
                  <th>Status</th>
                  <th className="gp-actions">Ações</th>
                </tr>
              </thead>
              <tbody>
                {loadingProfissionais ? (
                  <tr>
                    <td colSpan="6" className="gp-empty-state">
                      <span className="material-symbols-outlined">hourglass_empty</span>
                      <p>Carregando profissionais...</p>
                    </td>
                  </tr>
                ) : profissionaisFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="gp-empty-state">
                      <span className="material-symbols-outlined">search_off</span>
                      <p>Nenhum profissional encontrado</p>
                    </td>
                  </tr>
                ) : (
                  profissionaisFiltrados.map(profissional => (
                    <tr key={profissional.id}>
                      <td className="gp-cell-name">{profissional.nome}</td>
                      <td className="gp-hide-lg">{profissional.email}</td>
                      <td className="gp-hide-md">{profissional.telefone}</td>
                      <td>{profissional.especialidade}</td>
                      <td>
                        <select
                          value={profissional.status}
                          onChange={(e) => alterarStatus(profissional.id, e.target.value)}
                          className="gp-status-select"
                        >
                          <option value="ativo">Ativo</option>
                          <option value="inativo">Inativo</option>
                        </select>
                      </td>
                      <td className="gp-cell-actions">
                        <div className="gp-actions-buttons">
                          <button 
                            className="gp-btn-action gp-btn-edit"
                            onClick={() => abrirModalEditar(profissional)}
                            title="Editar"
                          >
                            <span className="material-symbols-outlined">edit</span>
                          </button>
                          <button 
                            className="gp-btn-action gp-btn-delete"
                            onClick={() => excluirProfissional(profissional.id)}
                            title="Excluir"
                          >
                            <span className="material-symbols-outlined">delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Modal Novo Profissional */}
          {modalOpen && (
            <div className="gp-modal-overlay" onClick={fecharModalNovo}>
              <div className="gp-modal" onClick={e => e.stopPropagation()}>
                <h3>👨‍💼 Novo Profissional</h3>
                {/* feedback message inside modal */}
                {message.text && (
                  <div style={{marginBottom: 12}}>
                    <div style={{
                      padding: '10px', borderRadius: 6,
                      backgroundColor: message.type === 'success' ? '#dcfce7' : '#fee2e2',
                      border: `1px solid ${message.type === 'success' ? '#86efac' : '#fecaca'}`,
                      color: message.type === 'success' ? '#166534' : '#b91c1c'
                    }}>{message.text}</div>
                  </div>
                )}
                <form onSubmit={salvarNovoProfissional}>
                  <div className="gp-form-group">
                    <label>Nome Completo *</label>
                    <input
                      type="text"
                      value={novoProfissional.nome}
                      onChange={e => setNovoProfissional({ ...novoProfissional, nome: e.target.value })}
                      placeholder="Digite o nome completo"
                      required
                    />
                  </div>
                  <div className="gp-form-group">
                    <label>Email *</label>
                    <input
                      type="email"
                      value={novoProfissional.email}
                      onChange={e => setNovoProfissional({ ...novoProfissional, email: e.target.value })}
                      placeholder="exemplo@email.com"
                      required
                    />
                  </div>
                  <div className="gp-form-group">
                    <label>Telefone</label>
                    <input
                      type="text"
                      value={novoProfissional.telefone}
                      onChange={e => setNovoProfissional({ ...novoProfissional, telefone: e.target.value })}
                      placeholder="(00) 00000-0000"
                    />
                  </div>
                  <div className="gp-form-group">
                    <label>Especialidade *</label>
                    <select
                      value={novoProfissional.especialidade}
                      onChange={e => setNovoProfissional({ ...novoProfissional, especialidade: e.target.value })}
                      required
                    >
                      <option value="">Selecione uma especialidade</option>
                      {especialidades.length > 0 ? (
                        especialidades.map((esp, idx) => (
                          <option key={idx} value={typeof esp === 'string' ? esp : (esp.nome || esp.label || JSON.stringify(esp))}>
                            {typeof esp === 'string' ? esp : (esp.nome || esp.label || JSON.stringify(esp))}
                          </option>
                        ))
                      ) : (
                        // fallback to some common options if API returns nothing
                        <>
                          <option value="Corte Masculino">Corte Masculino</option>
                          <option value="Corte Feminino">Corte Feminino</option>
                          <option value="Colorização">Colorização</option>
                        </>
                      )}
                    </select>
                  </div>
                  <div className="gp-form-group">
                    <label>Status</label>
                    <select
                      value={novoProfissional.status}
                      onChange={e => setNovoProfissional({ ...novoProfissional, status: e.target.value })}
                    >
                      <option value="ativo">Ativo</option>
                      <option value="inativo">Inativo</option>
                    </select>
                  </div>
                  <div className="gp-modal-buttons">
                    <button type="button" onClick={fecharModalNovo} className="gp-btn-cancel">
                      Cancelar
                    </button>
                    <button type="submit" className="gp-btn-save" disabled={loading}>
                      {loading ? (
                        <><span className="material-symbols-outlined" style={{fontSize: '1.1rem', marginRight: '0.25rem'}}>hourglass_empty</span> Cadastrando...</>
                      ) : (
                        <><span className="material-symbols-outlined" style={{fontSize: '1.1rem', marginRight: '0.25rem'}}>save</span> Salvar Profissional</>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Modal Editar Profissional */}
          {modalEditarOpen && profissionalEditando && (
            <div className="gp-modal-overlay" onClick={fecharModalEditar}>
              <div className="gp-modal" onClick={e => e.stopPropagation()}>
                <h3>✏️ Editar Profissional</h3>
                {/* feedback message inside edit modal */}
                {message.text && (
                  <div style={{marginBottom: 12}}>
                    <div style={{
                      padding: '10px', borderRadius: 6,
                      backgroundColor: message.type === 'success' ? '#dcfce7' : '#fee2e2',
                      border: `1px solid ${message.type === 'success' ? '#86efac' : '#fecaca'}`,
                      color: message.type === 'success' ? '#166534' : '#b91c1c'
                    }}>{message.text}</div>
                  </div>
                )}
                <form onSubmit={salvarEdicaoProfissional}>
                  <div className="gp-form-group">
                    <label>Nome Completo *</label>
                    <input
                      type="text"
                      value={profissionalEditando.nome}
                      onChange={e => setProfissionalEditando({ ...profissionalEditando, nome: e.target.value })}
                      required
                    />
                  </div>
                  <div className="gp-form-group">
                    <label>Email *</label>
                    <input
                      type="email"
                      value={profissionalEditando.email}
                      onChange={e => setProfissionalEditando({ ...profissionalEditando, email: e.target.value })}
                      required
                    />
                  </div>
                  <div className="gp-form-group">
                    <label>Telefone</label>
                    <input
                      type="text"
                      value={profissionalEditando.telefone}
                      onChange={e => setProfissionalEditando({ ...profissionalEditando, telefone: e.target.value })}
                    />
                  </div>
                  <div className="gp-form-group">
                    <label>Especialidade *</label>
                    <select
                      value={profissionalEditando.especialidade}
                      onChange={e => setProfissionalEditando({ ...profissionalEditando, especialidade: e.target.value })}
                      required
                    >
                      {especialidades.length > 0 ? (
                        especialidades.map((esp, idx) => (
                          <option key={idx} value={typeof esp === 'string' ? esp : (esp.nome || esp.label || JSON.stringify(esp))}>
                            {typeof esp === 'string' ? esp : (esp.nome || esp.label || JSON.stringify(esp))}
                          </option>
                        ))
                      ) : (
                        <>
                          <option value="Corte Masculino">Corte Masculino</option>
                          <option value="Corte Feminino">Corte Feminino</option>
                          <option value="Colorização">Colorização</option>
                        </>
                      )}
                    </select>
                  </div>
                  <div className="gp-form-group">
                    <label>Status</label>
                    <select
                      value={profissionalEditando.status}
                      onChange={e => setProfissionalEditando({ ...profissionalEditando, status: e.target.value })}
                    >
                      <option value="ativo">Ativo</option>
                      <option value="inativo">Inativo</option>
                    </select>
                  </div>
                  <div className="gp-modal-buttons">
                    <button 
                      type="button" 
                      onClick={() => excluirProfissional(profissionalEditando.id)}
                      className="gp-btn-delete-modal"
                      disabled={loading}
                    >
                      <span className="material-symbols-outlined" style={{fontSize: '1.1rem', marginRight: '0.25rem'}}>delete</span>
                      {loading ? 'Processando...' : 'Excluir'}
                    </button>
                    <div className="gp-modal-buttons-right">
                      <button type="button" onClick={fecharModalEditar} className="gp-btn-cancel">
                        Cancelar
                      </button>
                      <button type="submit" className="gp-btn-save" disabled={loading}>
                        {loading ? (
                          <><span className="material-symbols-outlined" style={{fontSize: '1.1rem', marginRight: '0.25rem'}}>hourglass_empty</span> Salvando...</>
                        ) : (
                          <><span className="material-symbols-outlined" style={{fontSize: '1.1rem', marginRight: '0.25rem'}}>save</span> Salvar</>
                        )}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </LayoutPrincipal>
  );
}