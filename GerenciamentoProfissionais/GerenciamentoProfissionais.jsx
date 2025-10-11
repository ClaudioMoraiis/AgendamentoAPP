import React, { useState } from "react";
import "./GerenciamentoProfissionais.css";
import LayoutPrincipal from "../LayoutPrincipal/LayoutPrincipal";

const profissionaisIniciais = [
  { id: 1, nome: "João Barber", email: "joao.barber@email.com", telefone: "(11) 98765-4321", especialidade: "Corte Masculino", status: "ativo" },
  { id: 2, nome: "Maria Style", email: "maria.style@email.com", telefone: "(21) 91234-5678", especialidade: "Colorização", status: "ativo" },
  { id: 3, nome: "Pedro Master", email: "pedro.master@email.com", telefone: "(31) 99876-5432", especialidade: "Barba e Estilo", status: "inativo" },
  { id: 4, nome: "Ana Cabeleireira", email: "ana.cabelo@email.com", telefone: "(41) 91234-5678", especialidade: "Corte Feminino", status: "ativo" },
  { id: 5, nome: "Carlos Tesoura", email: "carlos.tesoura@email.com", telefone: "(51) 98765-4321", especialidade: "Corte Social", status: "ativo" },
];

const especialidades = ["Todos", "Corte Masculino", "Corte Feminino", "Colorização", "Barba e Estilo", "Corte Social"];
const statusOptions = ["Todos", "ativo", "inativo"];

export default function GerenciamentoProfissionais() {
  const [profissionais, setProfissionais] = useState(profissionaisIniciais);
  const [busca, setBusca] = useState("");
  const [especialidadeFiltro, setEspecialidadeFiltro] = useState("Todos");
  const [statusFiltro, setStatusFiltro] = useState("Todos");
  const [modalOpen, setModalOpen] = useState(false);
  const [modalEditarOpen, setModalEditarOpen] = useState(false);
  const [profissionalEditando, setProfissionalEditando] = useState(null);
  const [novoProfissional, setNovoProfissional] = useState({
    nome: "",
    email: "",
    telefone: "",
    especialidade: "",
    status: "ativo"
  });

  // Filtros combinados
  const profissionaisFiltrados = profissionais.filter(profissional => {
    const buscaMatch =
      profissional.nome.toLowerCase().includes(busca.toLowerCase()) ||
      profissional.email.toLowerCase().includes(busca.toLowerCase()) ||
      profissional.especialidade.toLowerCase().includes(busca.toLowerCase());
    const especialidadeMatch = especialidadeFiltro === "Todos" || profissional.especialidade === especialidadeFiltro;
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

  const salvarNovoProfissional = (e) => {
    e.preventDefault();
    if (!novoProfissional.nome || !novoProfissional.email || !novoProfissional.especialidade) {
      alert("Preencha todos os campos obrigatórios!");
      return;
    }
    const novoId = Math.max(...profissionais.map(p => p.id), 0) + 1;
    const profissionalComId = { ...novoProfissional, id: novoId };
    setProfissionais([...profissionais, profissionalComId]);
    fecharModalNovo();
  };

  const salvarEdicaoProfissional = (e) => {
    e.preventDefault();
    if (!profissionalEditando.nome || !profissionalEditando.email || !profissionalEditando.especialidade) {
      alert("Preencha todos os campos obrigatórios!");
      return;
    }
    const novosProfissionais = profissionais.map(profissional => 
      profissional.id === profissionalEditando.id ? profissionalEditando : profissional
    );
    setProfissionais(novosProfissionais);
    fecharModalEditar();
  };

  const excluirProfissional = (id) => {
    if (window.confirm("Tem certeza que deseja excluir este profissional?")) {
      setProfissionais(profissionais.filter(profissional => profissional.id !== id));
      if (modalEditarOpen) fecharModalEditar();
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
                {profissionaisFiltrados.length === 0 ? (
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
                      <option value="Corte Masculino">Corte Masculino</option>
                      <option value="Corte Feminino">Corte Feminino</option>
                      <option value="Colorização">Colorização</option>
                      <option value="Barba e Estilo">Barba e Estilo</option>
                      <option value="Corte Social">Corte Social</option>
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
                    <button type="submit" className="gp-btn-save">
                      <span className="material-symbols-outlined" style={{fontSize: '1.1rem', marginRight: '0.25rem'}}>save</span>
                      Salvar Profissional
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
                      <option value="Corte Masculino">Corte Masculino</option>
                      <option value="Corte Feminino">Corte Feminino</option>
                      <option value="Colorização">Colorização</option>
                      <option value="Barba e Estilo">Barba e Estilo</option>
                      <option value="Corte Social">Corte Social</option>
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
                    >
                      <span className="material-symbols-outlined" style={{fontSize: '1.1rem', marginRight: '0.25rem'}}>delete</span>
                      Excluir
                    </button>
                    <div className="gp-modal-buttons-right">
                      <button type="button" onClick={fecharModalEditar} className="gp-btn-cancel">
                        Cancelar
                      </button>
                      <button type="submit" className="gp-btn-save">
                        <span className="material-symbols-outlined" style={{fontSize: '1.1rem', marginRight: '0.25rem'}}>save</span>
                        Salvar
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