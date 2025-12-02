import React, { useState, useEffect } from "react";
import "./GerenciamentoHorarios.css";
import LayoutPrincipal from "../LayoutPrincipal/LayoutPrincipal";
import { apiService } from "../services/api";

export default function GerenciamentoHorarios() {
  const [horarios, setHorarios] = useState([]);
  const [profissionais, setProfissionais] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalEditarOpen, setModalEditarOpen] = useState(false);
  const [novoHorario, setNovoHorario] = useState({
    profissionalId: "",
    diaSemana: [],
    horaInicio: "",
    horaFinal: ""
  });
  const [horarioEditando, setHorarioEditando] = useState({
    id: null,
    profissionalId: "",
    diaSemana: [],
    horaInicio: "",
    horaFinal: ""
  });
  
  // Estados para notificações
  const [notification, setNotification] = useState({ show: false, message: "", type: "" });

  // Dias da semana
  const diasSemana = [
    { label: "Segunda", value: "seg" },
    { label: "Terça", value: "ter" },
    { label: "Quarta", value: "qua" },
    { label: "Quinta", value: "qui" },
    { label: "Sexta", value: "sex" },
    { label: "Sábado", value: "sab" },
    { label: "Domingo", value: "dom" }
  ];

  // Função para mostrar notificação
  const showNotification = (message, type = "success") => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: "", type: "" });
    }, 4000);
  };

  // Carrega os horários e profissionais da API quando o componente monta
  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      setLoading(true);
      const [horariosResp, profissionaisResp] = await Promise.all([
        apiService.horarios.listar().catch(err => { console.error('Erro ao carregar horários:', err); return []; }),
        apiService.profissionais.listar().catch(err => { console.error('Erro ao carregar profissionais:', err); return []; })
      ]);

      console.log('✅ Horários carregados:', horariosResp);
      console.log('✅ Profissionais carregados:', profissionaisResp);

      // Processar horários vindos da API no formato:
      // {id, nome, diaSemana: "SEG,TER,QUA", horaInicial, horaFinal}
      const horariosProcessados = (horariosResp || []).map(h => ({
        id: h.id,
        profissionalId: h.profissionalId || null, // Se não vier, será null
        profissionalNome: h.nome || '',
        diaSemana: h.diaSemana ? h.diaSemana.split(',').map(d => d.trim().toLowerCase()) : [],
        horaInicio: h.horaInicial ? h.horaInicial.substring(0, 5) : '', // Remove segundos (08:00:00 -> 08:00)
        horaFinal: h.horaFinal ? h.horaFinal.substring(0, 5) : ''
      }));

      setHorarios(horariosProcessados);
      setProfissionais(profissionaisResp || []);
    } catch (error) {
      console.error('❌ Erro ao carregar dados:', error);
      const errorMessage = error.message || 'Erro ao carregar dados. Tente novamente.';
      showNotification(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  const openModal = () => setModalOpen(true);
  const closeModal = () => { 
    setModalOpen(false); 
    setNovoHorario({ profissionalId: "", diaSemana: [], horaInicio: "", horaFinal: "" }); 
  };
  
  const abrirModalEditar = (horario) => {
    setHorarioEditando({ 
      id: horario.id,
      profissionalId: horario.profissionalId,
      diaSemana: Array.isArray(horario.diaSemana) ? horario.diaSemana : [],
      horaInicio: horario.horaInicio,
      horaFinal: horario.horaFinal
    });
    setModalEditarOpen(true);
  };
  
  const closeModalEditar = () => { 
    setModalEditarOpen(false); 
    setHorarioEditando({ id: null, profissionalId: "", diaSemana: [], horaInicio: "", horaFinal: "" }); 
  };

  const toggleDiaSemana = (dia, isEdit = false) => {
    if (isEdit) {
      const dias = horarioEditando.diaSemana.includes(dia)
        ? horarioEditando.diaSemana.filter(d => d !== dia)
        : [...horarioEditando.diaSemana, dia];
      setHorarioEditando({ ...horarioEditando, diaSemana: dias });
    } else {
      const dias = novoHorario.diaSemana.includes(dia)
        ? novoHorario.diaSemana.filter(d => d !== dia)
        : [...novoHorario.diaSemana, dia];
      setNovoHorario({ ...novoHorario, diaSemana: dias });
    }
  };

  const salvarHorario = async (e) => {
    e.preventDefault();
    if (!novoHorario.profissionalId || novoHorario.diaSemana.length === 0 || 
        !novoHorario.horaInicio || !novoHorario.horaFinal) {
      showNotification("Preencha todos os campos antes de salvar!", "error");
      return;
    }
    
    try {
      const horarioData = {
        profissionalId: parseInt(novoHorario.profissionalId),
        diaSemana: novoHorario.diaSemana,
        horaInicio: novoHorario.horaInicio,
        horaFinal: novoHorario.horaFinal
      };
      
      console.log('➕ Criando horário:', horarioData);
      await apiService.horarios.criar(horarioData);
      showNotification('Horário criado com sucesso!', 'success');
      await carregarDados();
      closeModal();
    } catch (error) {
      console.error('❌ Erro ao criar horário:', error);
      const errorMessage = error.message || 'Erro ao criar horário. Tente novamente.';
      showNotification(errorMessage, 'error');
    }
  };

  const salvarEdicaoHorario = async (e) => {
    e.preventDefault();
    if (!horarioEditando.profissionalId || horarioEditando.diaSemana.length === 0 || 
        !horarioEditando.horaInicio || !horarioEditando.horaFinal) {
      showNotification("Preencha todos os campos antes de salvar!", "error");
      return;
    }
    
    try {
      const horarioData = {
        profissionalId: parseInt(horarioEditando.profissionalId),
        diaSemana: horarioEditando.diaSemana,
        horaInicio: horarioEditando.horaInicio,
        horaFinal: horarioEditando.horaFinal
      };
      
      console.log('🔄 Atualizando horário ID:', horarioEditando.id);
      console.log('📝 Dados enviados:', horarioData);
      
      await apiService.horarios.atualizar(horarioEditando.id, horarioData);
      showNotification('Horário atualizado com sucesso!', 'success');
      await carregarDados();
      closeModalEditar();
    } catch (error) {
      console.error('❌ Erro ao atualizar horário:', error);
      const errorMessage = error.message || 'Erro ao atualizar horário. Tente novamente.';
      showNotification(errorMessage, 'error');
    }
  };

  const excluirHorario = async () => {
    if (window.confirm("Tem certeza que deseja excluir este horário?")) {
      try {
        await apiService.horarios.deletar(horarioEditando.id);
        showNotification('Horário excluído com sucesso!', 'success');
        await carregarDados();
        closeModalEditar();
      } catch (error) {
        console.error('❌ Erro ao excluir horário:', error);
        const errorMessage = error.message || 'Erro ao excluir horário. Tente novamente.';
        showNotification(errorMessage, 'error');
      }
    }
  };

  // Função para obter nome do profissional
  const getNomeProfissional = (horario) => {
    // Primeiro tenta usar o nome que já vem da API
    if (horario.profissionalNome) {
      return horario.profissionalNome;
    }
    // Fallback: buscar pelo ID na lista de profissionais
    if (horario.profissionalId) {
      const prof = profissionais.find(p => p.id === horario.profissionalId);
      return prof ? prof.nome : `ID: ${horario.profissionalId}`;
    }
    return 'Não informado';
  };

  // Função para formatar array de dias da semana
  const formatarDias = (dias) => {
    if (!Array.isArray(dias)) return '';
    return dias.map(d => {
      const dia = diasSemana.find(ds => ds.value === d);
      return dia ? dia.label : d;
    }).join(', ');
  };

  return (
    <LayoutPrincipal paginaAtiva="horarios">
      {/* Notificação Toast */}
      {notification.show && (
        <div 
          className={`notification-toast ${notification.type}`}
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '16px 24px',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            zIndex: 1000,
            minWidth: '300px',
            fontSize: '14px',
            fontWeight: '500',
            backgroundColor: notification.type === 'success' ? '#10b981' : '#ef4444',
            color: 'white',
            border: `1px solid ${notification.type === 'success' ? '#059669' : '#dc2626'}`,
            animation: 'slideInRight 0.3s ease-out'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="material-symbols-outlined">
              {notification.type === 'success' ? 'check_circle' : 'error'}
            </span>
            {notification.message}
          </div>
        </div>
      )}
      
      <div className="gh-main">
        <div className="gh-main-content">
          <div className="gh-header">
            <h2>Horários de Profissionais</h2>
            <button className="gh-btn-primary" onClick={openModal}>
              <span className="material-symbols-outlined">add</span>
              Novo horário
            </button>
          </div>
          <div className="gh-table-card">
            <table>
              <thead>
                <tr>
                  <th>Profissional</th>
                  <th>Dias da Semana</th>
                  <th>Horário Início</th>
                  <th>Horário Final</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '20px' }}>
                      Carregando horários...
                    </td>
                  </tr>
                ) : horarios.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '20px' }}>
                      Nenhum horário cadastrado
                    </td>
                  </tr>
                ) : (
                  horarios.map((h) => (
                    <tr key={h.id}>
                      <td>{getNomeProfissional(h)}</td>
                      <td>{formatarDias(h.diaSemana)}</td>
                      <td>{h.horaInicio}</td>
                      <td>{h.horaFinal}</td>
                      <td>
                        <button 
                          className="gh-link-edit" 
                          onClick={() => abrirModalEditar(h)}
                        >
                          Editar
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      {/* Modal de novo horário */}
      {modalOpen && (
        <div className="gh-modal-overlay" onClick={closeModal}>
          <div
            className="gh-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <h3>Novo Horário</h3>
            <form onSubmit={salvarHorario}>
              <label>Profissional *</label>
              <select
                value={novoHorario.profissionalId}
                onChange={(e) => setNovoHorario({ ...novoHorario, profissionalId: e.target.value })}
                required
              >
                <option value="">Selecione um profissional</option>
                {profissionais.map(prof => (
                  <option key={prof.id} value={prof.id}>
                    {prof.nome}
                  </option>
                ))}
              </select>

              <label>Dias da Semana *</label>
              <div className="gh-dias-grid">
                {diasSemana.map(dia => (
                  <label key={dia.value} className="gh-dia-checkbox">
                    <input
                      type="checkbox"
                      checked={novoHorario.diaSemana.includes(dia.value)}
                      onChange={() => toggleDiaSemana(dia.value)}
                    />
                    <span>{dia.label}</span>
                  </label>
                ))}
              </div>

              <div className="gh-horario-row">
                <div className="gh-horario-field">
                  <label>Hora Início *</label>
                  <input
                    type="time"
                    value={novoHorario.horaInicio}
                    onChange={(e) => setNovoHorario({ ...novoHorario, horaInicio: e.target.value })}
                    required
                  />
                </div>

                <div className="gh-horario-field">
                  <label>Hora Final *</label>
                  <input
                    type="time"
                    value={novoHorario.horaFinal}
                    onChange={(e) => setNovoHorario({ ...novoHorario, horaFinal: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="gh-modal-buttons">
                <button type="button" onClick={closeModal} className="cancelar">
                  Cancelar
                </button>
                <button type="submit" className="salvar">
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de editar horário */}
      {modalEditarOpen && (
        <div className="gh-modal-overlay" onClick={closeModalEditar}>
          <div
            className="gh-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <h3>Editar Horário</h3>
            <form onSubmit={salvarEdicaoHorario}>
              <label>Profissional *</label>
              <select
                value={horarioEditando.profissionalId}
                onChange={(e) => setHorarioEditando({ ...horarioEditando, profissionalId: e.target.value })}
                required
              >
                <option value="">Selecione um profissional</option>
                {profissionais.map(prof => (
                  <option key={prof.id} value={prof.id}>
                    {prof.nome}
                  </option>
                ))}
              </select>

              <label>Dias da Semana *</label>
              <div className="gh-dias-grid">
                {diasSemana.map(dia => (
                  <label key={dia.value} className="gh-dia-checkbox">
                    <input
                      type="checkbox"
                      checked={horarioEditando.diaSemana.includes(dia.value)}
                      onChange={() => toggleDiaSemana(dia.value, true)}
                    />
                    <span>{dia.label}</span>
                  </label>
                ))}
              </div>

              <div className="gh-horario-row">
                <div className="gh-horario-field">
                  <label>Hora Início *</label>
                  <input
                    type="time"
                    value={horarioEditando.horaInicio}
                    onChange={(e) => setHorarioEditando({ ...horarioEditando, horaInicio: e.target.value })}
                    required
                  />
                </div>

                <div className="gh-horario-field">
                  <label>Hora Final *</label>
                  <input
                    type="time"
                    value={horarioEditando.horaFinal}
                    onChange={(e) => setHorarioEditando({ ...horarioEditando, horaFinal: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="gh-modal-buttons">
                <button 
                  type="button" 
                  onClick={excluirHorario} 
                  className="excluir"
                >
                  Excluir
                </button>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button type="button" onClick={closeModalEditar} className="cancelar">
                    Cancelar
                  </button>
                  <button type="submit" className="salvar">
                    Salvar
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
    </LayoutPrincipal>
  );
}
