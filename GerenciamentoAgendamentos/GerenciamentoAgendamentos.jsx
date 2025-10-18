import React, { useState } from "react";
import LayoutPrincipal from "../LayoutPrincipal/LayoutPrincipal";
import "./GerenciamentoAgendamentos.css";

const servicosComValores = [
  { nome: "Corte de Cabelo", valor: "R$ 45,00", duracao: "30 min" },
  { nome: "Barba", valor: "R$ 30,00", duracao: "20 min" },
  { nome: "Corte e Barba", valor: "R$ 70,00", duracao: "50 min" },
  { nome: "Design de Sobrancelhas", valor: "R$ 25,00", duracao: "15 min" },
  { nome: "Pacote Completo", valor: "R$ 90,00", duracao: "60 min" },
];

const agendamentosIniciais = [
  { 
    id: 1,
    cliente: "Carlos Silva", 
    servico: "Corte de Cabelo", 
    valor: "R$ 45,00", 
    profissional: "João Barber",
    data: "2024-01-15",
    horario: "09:00",
    status: "confirmado"
  },
  { 
    id: 2,
    cliente: "Ana Souza", 
    servico: "Corte e Barba", 
    valor: "R$ 70,00", 
    profissional: "Maria Style",
    data: "2024-01-15",
    horario: "10:30",
    status: "confirmado"
  },
  { 
    id: 3,
    cliente: "Ricardo Almeida", 
    servico: "Barba", 
    valor: "R$ 30,00", 
    profissional: "João Barber",
    data: "2024-01-15",
    horario: "11:15",
    status: "pendente"
  },
  { 
    id: 4,
    cliente: "Fernanda Costa", 
    servico: "Design de Sobrancelhas", 
    valor: "R$ 25,00", 
    profissional: "Maria Style",
    data: "2024-01-16",
    horario: "14:00",
    status: "confirmado"
  },
  { 
    id: 5,
    cliente: "Lucas Pereira", 
    servico: "Pacote Completo", 
    valor: "R$ 90,00", 
    profissional: "Pedro Master",
    data: "2024-01-16",
    horario: "15:30",
    status: "cancelado"
  },
  { 
    id: 6,
    cliente: "Mariana Oliveira", 
    servico: "Corte de Cabelo", 
    valor: "R$ 45,00", 
    profissional: "João Barber",
    data: "2024-01-17",
    horario: "08:45",
    status: "confirmado"
  },
];

const profissionais = ["Todos", "João Barber", "Maria Style", "Pedro Master"];
const periodos = ["Hoje", "Esta semana", "Este mês", "Próxima semana", "Personalizado"];

export default function GerenciamentoAgendamentos() {
  const [agendamentos, setAgendamentos] = useState(agendamentosIniciais);
  const [busca, setBusca] = useState("");
  const [profissionalFiltro, setProfissionalFiltro] = useState("Todos");
  const [periodoFiltro, setPeriodoFiltro] = useState("Esta semana");
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [modalEditarOpen, setModalEditarOpen] = useState(false);
  const [agendamentoEditando, setAgendamentoEditando] = useState(null);
  
  const [novoAgendamento, setNovoAgendamento] = useState({
    cliente: "",
    servico: "",
    valor: "",
    profissional: "",
    data: "",
    horario: "",
    status: "confirmado"
  });

  // Função para lidar com a seleção de serviço
  const handleServicoChange = (servicoNome, isEditando = false) => {
    const servicoSelecionado = servicosComValores.find(s => s.nome === servicoNome);
    
    if (servicoSelecionado) {
      if (isEditando) {
        setAgendamentoEditando({
          ...agendamentoEditando,
          servico: servicoSelecionado.nome,
          valor: servicoSelecionado.valor
        });
      } else {
        setNovoAgendamento({
          ...novoAgendamento,
          servico: servicoSelecionado.nome,
          valor: servicoSelecionado.valor
        });
      }
    }
  };

  // Filtros combinados
  const agendamentosFiltrados = agendamentos.filter(agendamento => {
    // Filtro de busca
    const buscaMatch = 
      agendamento.cliente.toLowerCase().includes(busca.toLowerCase()) ||
      agendamento.servico.toLowerCase().includes(busca.toLowerCase()) ||
      agendamento.profissional.toLowerCase().includes(busca.toLowerCase());

    // Filtro de profissional
    const profissionalMatch = 
      profissionalFiltro === "Todos" || 
      agendamento.profissional === profissionalFiltro;

    // Filtro de período
    const hoje = new Date();
    const dataAgendamento = new Date(agendamento.data);
    
    let periodoMatch = true;
    switch (periodoFiltro) {
      case "Hoje":
        periodoMatch = dataAgendamento.toDateString() === hoje.toDateString();
        break;
      case "Esta semana":
        const inicioSemana = new Date(hoje);
        inicioSemana.setDate(hoje.getDate() - hoje.getDay());
        const fimSemana = new Date(inicioSemana);
        fimSemana.setDate(inicioSemana.getDate() + 6);
        periodoMatch = dataAgendamento >= inicioSemana && dataAgendamento <= fimSemana;
        break;
      case "Este mês":
        const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
        const fimMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);
        periodoMatch = dataAgendamento >= inicioMes && dataAgendamento <= fimMes;
        break;
      case "Próxima semana":
        const inicioProxima = new Date(hoje);
        inicioProxima.setDate(hoje.getDate() + (7 - hoje.getDay()));
        const fimProxima = new Date(inicioProxima);
        fimProxima.setDate(inicioProxima.getDate() + 6);
        periodoMatch = dataAgendamento >= inicioProxima && dataAgendamento <= fimProxima;
        break;
      case "Personalizado":
        if (dataInicio && dataFim) {
          const inicio = new Date(dataInicio);
          const fim = new Date(dataFim);
          // Adiciona 23:59:59 ao fim do dia para incluir todo o dia final
          fim.setHours(23, 59, 59, 999);
          periodoMatch = dataAgendamento >= inicio && dataAgendamento <= fim;
        } else {
          // Se não há datas definidas, mostra todos
          periodoMatch = true;
        }
        break;
      default:
        periodoMatch = true;
    }

    return buscaMatch && profissionalMatch && periodoMatch;
  });

  const abrirModalNovo = () => {
    setNovoAgendamento({
      cliente: "",
      servico: "",
      valor: "",
      profissional: "",
      data: "",
      horario: "",
      status: "confirmado"
    });
    setModalOpen(true);
  };

  const fecharModalNovo = () => {
    setModalOpen(false);
  };

  const abrirModalEditar = (agendamento) => {
    setAgendamentoEditando({ ...agendamento });
    setModalEditarOpen(true);
  };

  const fecharModalEditar = () => {
    setModalEditarOpen(false);
    setAgendamentoEditando(null);
  };

  const salvarNovoAgendamento = (e) => {
    e.preventDefault();
    if (!novoAgendamento.cliente || !novoAgendamento.servico || !novoAgendamento.profissional) {
      alert("Preencha todos os campos obrigatórios!");
      return;
    }
    
    const novoId = Math.max(...agendamentos.map(a => a.id)) + 1;
    const agendamentoComId = { ...novoAgendamento, id: novoId };
    
    setAgendamentos([...agendamentos, agendamentoComId]);
    fecharModalNovo();
  };

  const salvarEdicaoAgendamento = (e) => {
    e.preventDefault();
    if (!agendamentoEditando.cliente || !agendamentoEditando.servico || !agendamentoEditando.profissional) {
      alert("Preencha todos os campos obrigatórios!");
      return;
    }

    const novosAgendamentos = agendamentos.map(agendamento =>
      agendamento.id === agendamentoEditando.id ? agendamentoEditando : agendamento
    );
    
    setAgendamentos(novosAgendamentos);
    fecharModalEditar();
  };

  const excluirAgendamento = (id) => {
    if (window.confirm("Tem certeza que deseja excluir este agendamento?")) {
      const novosAgendamentos = agendamentos.filter(agendamento => agendamento.id !== id);
      setAgendamentos(novosAgendamentos);
    }
  };

  const alterarStatus = (id, novoStatus) => {
    const novosAgendamentos = agendamentos.map(agendamento =>
      agendamento.id === id ? { ...agendamento, status: novoStatus } : agendamento
    );
    setAgendamentos(novosAgendamentos);
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'confirmado': return 'ga-status-confirmado';
      case 'pendente': return 'ga-status-pendente';
      case 'cancelado': return 'ga-status-cancelado';
      case 'concluido': return 'ga-status-concluido';
      default: return 'ga-status-pendente';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'confirmado': return 'Confirmado';
      case 'pendente': return 'Pendente';
      case 'cancelado': return 'Cancelado';
      case 'concluido': return 'Concluído';
      default: return status;
    }
  };

  return (
    <LayoutPrincipal paginaAtiva="agendamentos">
      <div className="ga-container">
        {/* Cabeçalho */}
        <div className="ga-page-header">
          <h1>Agendamentos</h1>
          <button className="ga-btn-primary" onClick={abrirModalNovo}>
            <span className="material-symbols-outlined">add</span>
            Novo Agendamento
          </button>
        </div>

        {/* Filtros */}
        <div className="ga-filtros-card">
          <h3>Filtros</h3>
          <div className="ga-filtros-grid">
            <div className="ga-filtro-group">
              <label>Buscar</label>
              <div className="ga-search">
                <span className="material-symbols-outlined ga-search-icon">search</span>
                <input
                  type="text"
                  placeholder="Buscar por cliente, serviço..."
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  className="ga-search-input"
                />
              </div>
            </div>

            <div className="ga-filtro-group">
              <label>Profissional</label>
              <select 
                value={profissionalFiltro} 
                onChange={(e) => setProfissionalFiltro(e.target.value)}
                className="ga-select"
              >
                {profissionais.map(prof => (
                  <option key={prof} value={prof}>{prof}</option>
                ))}
              </select>
            </div>

            <div className="ga-filtro-group">
              <label>Período</label>
              <select 
                value={periodoFiltro} 
                onChange={(e) => {
                  setPeriodoFiltro(e.target.value);
                  // Limpa as datas se não for período personalizado
                  if (e.target.value !== "Personalizado") {
                    setDataInicio("");
                    setDataFim("");
                  }
                }}
                className="ga-select"
              >
                {periodos.map(periodo => (
                  <option key={periodo} value={periodo}>{periodo}</option>
                ))}
              </select>
            </div>

            {/* Campos de data personalizada */}
            {periodoFiltro === "Personalizado" && (
              <>
                <div className="ga-filtro-group">
                  <label>Data Início</label>
                  <input
                    type="date"
                    value={dataInicio}
                    onChange={(e) => setDataInicio(e.target.value)}
                    className="ga-input"
                    placeholder="Data inicial"
                  />
                </div>
                <div className="ga-filtro-group">
                  <label>Data Fim</label>
                  <input
                    type="date"
                    value={dataFim}
                    onChange={(e) => setDataFim(e.target.value)}
                    className="ga-input"
                    placeholder="Data final"
                    min={dataInicio} // Não permite data fim menor que início
                  />
                </div>
              </>
            )}
          </div>
          
          {/* Indicador de resultados */}
          {periodoFiltro === "Personalizado" && dataInicio && dataFim && (
            <div className="ga-results-indicator">
              <span className="ga-results-text">
                Exibindo {agendamentosFiltrados.length} agendamento(s) entre {' '}
                {new Date(dataInicio).toLocaleDateString('pt-BR')} e {' '}
                {new Date(dataFim).toLocaleDateString('pt-BR')}
              </span>
            </div>
          )}
        </div>

        {/* Tabela */}
        <div className="ga-table-container">
          <table className="ga-table">
            <thead>
              <tr>
                <th>Cliente</th>
                <th>Serviço</th>
                <th className="ga-hide-md">Valor</th>
                <th>Profissional</th>
                <th className="ga-hide-lg">Data/Hora</th>
                <th>Status</th>
                <th className="ga-actions">Ações</th>
              </tr>
            </thead>
            <tbody>
              {agendamentosFiltrados.map((agendamento) => (
                <tr key={agendamento.id}>
                  <td className="ga-cell-name">{agendamento.cliente}</td>
                  <td>{agendamento.servico}</td>
                  <td className="ga-hide-md">{agendamento.valor}</td>
                  <td>{agendamento.profissional}</td>
                  <td className="ga-hide-lg">
                    {new Date(agendamento.data).toLocaleDateString('pt-BR')} - {agendamento.horario}
                  </td>
                  <td>
                    <span className={`ga-status ${getStatusClass(agendamento.status)}`}>
                      {getStatusText(agendamento.status)}
                    </span>
                  </td>
                  <td className="ga-cell-actions">
                    <div className="ga-actions-buttons">
                      <button 
                        className="ga-btn-action ga-btn-edit"
                        onClick={() => abrirModalEditar(agendamento)}
                        title="Editar"
                      >
                        <span className="material-symbols-outlined">edit</span>
                      </button>
                      <button 
                        className="ga-btn-action ga-btn-delete"
                        onClick={() => excluirAgendamento(agendamento.id)}
                        title="Excluir"
                      >
                        <span className="material-symbols-outlined">delete</span>
                      </button>
                      <select 
                        value={agendamento.status} 
                        onChange={(e) => alterarStatus(agendamento.id, e.target.value)}
                        className="ga-status-select"
                        title="Alterar status"
                      >
                        <option value="pendente">Pendente</option>
                        <option value="confirmado">Confirmado</option>
                        <option value="concluido">Concluído</option>
                        <option value="cancelado">Cancelado</option>
                      </select>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Resumo */}
        <div className="ga-resumo-card">
          <h3>Resumo do Período</h3>
          <div className="ga-resumo-grid">
            <div className="ga-resumo-item">
              <span className="ga-resumo-valor">{agendamentosFiltrados.length}</span>
              <span className="ga-resumo-label">Total de Agendamentos</span>
            </div>
            <div className="ga-resumo-item">
              <span className="ga-resumo-valor">
                {agendamentosFiltrados.filter(a => a.status === 'confirmado').length}
              </span>
              <span className="ga-resumo-label">Confirmados</span>
            </div>
            <div className="ga-resumo-item">
              <span className="ga-resumo-valor">
                {agendamentosFiltrados.filter(a => a.status === 'concluido').length}
              </span>
              <span className="ga-resumo-label">Concluídos</span>
            </div>
            <div className="ga-resumo-item">
              <span className="ga-resumo-valor">
                R$ {agendamentosFiltrados
                  .filter(a => a.status === 'concluido')
                  .reduce((total, a) => total + parseFloat(a.valor.replace('R$ ', '').replace(',', '.')), 0)
                  .toFixed(2)
                  .replace('.', ',')}
              </span>
              <span className="ga-resumo-label">Valor Total</span>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Novo Agendamento */}
      {modalOpen && (
        <div className="ga-modal-overlay" onClick={fecharModalNovo}>
          <div className="ga-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Novo Agendamento</h3>
            <form onSubmit={salvarNovoAgendamento}>
              <div className="ga-form-group">
                <label>Cliente *</label>
                <input
                  type="text"
                  value={novoAgendamento.cliente}
                  onChange={(e) => setNovoAgendamento({ ...novoAgendamento, cliente: e.target.value })}
                  placeholder="Nome do cliente"
                  required
                />
              </div>

              <div className="ga-form-group">
                <label>Serviço *</label>
                <select
                  value={novoAgendamento.servico}
                  onChange={(e) => handleServicoChange(e.target.value, false)}
                  required
                >
                  <option value="">Selecione um serviço</option>
                  {servicosComValores.map(servico => (
                    <option key={servico.nome} value={servico.nome}>
                      {servico.nome} - {servico.valor} ({servico.duracao})
                    </option>
                  ))}
                </select>
              </div>

              <div className="ga-form-group">
                <label>Valor</label>
                <input
                  type="text"
                  value={novoAgendamento.valor}
                  readOnly
                  className="ga-input-readonly"
                  placeholder="Valor será preenchido automaticamente"
                />
              </div>

              <div className="ga-form-group">
                <label>Profissional *</label>
                <select
                  value={novoAgendamento.profissional}
                  onChange={(e) => setNovoAgendamento({ ...novoAgendamento, profissional: e.target.value })}
                  required
                >
                  <option value="">Selecione um profissional</option>
                  <option value="João Barber">João Barber</option>
                  <option value="Maria Style">Maria Style</option>
                  <option value="Pedro Master">Pedro Master</option>
                </select>
              </div>

              <div className="ga-form-row">
                <div className="ga-form-group">
                  <label>Data *</label>
                  <input
                    type="date"
                    value={novoAgendamento.data}
                    onChange={(e) => setNovoAgendamento({ ...novoAgendamento, data: e.target.value })}
                    required
                  />
                </div>

                <div className="ga-form-group">
                  <label>Horário *</label>
                  <input
                    type="time"
                    value={novoAgendamento.horario}
                    onChange={(e) => setNovoAgendamento({ ...novoAgendamento, horario: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="ga-form-group">
                <label>Status</label>
                <select
                  value={novoAgendamento.status}
                  onChange={(e) => setNovoAgendamento({ ...novoAgendamento, status: e.target.value })}
                >
                  <option value="pendente">Pendente</option>
                  <option value="confirmado">Confirmado</option>
                  <option value="concluido">Concluído</option>
                </select>
              </div>

              <div className="ga-modal-buttons">
                <button type="button" onClick={fecharModalNovo} className="ga-btn-cancel">
                  Cancelar
                </button>
                <button type="submit" className="ga-btn-save">
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Editar Agendamento */}
      {modalEditarOpen && agendamentoEditando && (
        <div className="ga-modal-overlay" onClick={fecharModalEditar}>
          <div className="ga-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Editar Agendamento</h3>
            <form onSubmit={salvarEdicaoAgendamento}>
              <div className="ga-form-group">
                <label>Cliente *</label>
                <input
                  type="text"
                  value={agendamentoEditando.cliente}
                  onChange={(e) => setAgendamentoEditando({ ...agendamentoEditando, cliente: e.target.value })}
                  required
                />
              </div>

              <div className="ga-form-group">
                <label>Serviço *</label>
                <select
                  value={agendamentoEditando.servico}
                  onChange={(e) => handleServicoChange(e.target.value, true)}
                  required
                >
                  <option value="">Selecione um serviço</option>
                  {servicosComValores.map(servico => (
                    <option key={servico.nome} value={servico.nome}>
                      {servico.nome} - {servico.valor} ({servico.duracao})
                    </option>
                  ))}
                </select>
              </div>

              <div className="ga-form-group">
                <label>Valor</label>
                <input
                  type="text"
                  value={agendamentoEditando.valor}
                  readOnly
                  className="ga-input-readonly"
                />
              </div>

              <div className="ga-form-group">
                <label>Profissional *</label>
                <select
                  value={agendamentoEditando.profissional}
                  onChange={(e) => setAgendamentoEditando({ ...agendamentoEditando, profissional: e.target.value })}
                  required
                >
                  <option value="João Barber">João Barber</option>
                  <option value="Maria Style">Maria Style</option>
                  <option value="Pedro Master">Pedro Master</option>
                </select>
              </div>

              <div className="ga-form-row">
                <div className="ga-form-group">
                  <label>Data *</label>
                  <input
                    type="date"
                    value={agendamentoEditando.data}
                    onChange={(e) => setAgendamentoEditando({ ...agendamentoEditando, data: e.target.value })}
                    required
                  />
                </div>

                <div className="ga-form-group">
                  <label>Horário *</label>
                  <input
                    type="time"
                    value={agendamentoEditando.horario}
                    onChange={(e) => setAgendamentoEditando({ ...agendamentoEditando, horario: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="ga-form-group">
                <label>Status</label>
                <select
                  value={agendamentoEditando.status}
                  onChange={(e) => setAgendamentoEditando({ ...agendamentoEditando, status: e.target.value })}
                >
                  <option value="pendente">Pendente</option>
                  <option value="confirmado">Confirmado</option>
                  <option value="concluido">Concluído</option>
                  <option value="cancelado">Cancelado</option>
                </select>
              </div>

              <div className="ga-modal-buttons">
                <button 
                  type="button" 
                  onClick={() => excluirAgendamento(agendamentoEditando.id)}
                  className="ga-btn-delete-modal"
                >
                  Excluir
                </button>
                <div className="ga-modal-buttons-right">
                  <button type="button" onClick={fecharModalEditar} className="ga-btn-cancel">
                    Cancelar
                  </button>
                  <button type="submit" className="ga-btn-save">
                    Salvar
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </LayoutPrincipal>
  );
}