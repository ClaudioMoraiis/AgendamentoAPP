
import React, { useState, useEffect } from "react";
import HeaderNavigation from "../components/HeaderNavigation/HeaderNavigation";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { apiService } from "../services/api";
import { ROUTES } from "../constants/routes";
import "./Agendamento.css";

const Agendamento = () => {
  const [date, setDate] = useState(new Date());
  const [servicos, setServicos] = useState([]);
  const [profissionais, setProfissionais] = useState([]);
  const [servicoSelecionado, setServicoSelecionado] = useState("");
  const [profissionalSelecionado, setProfissionalSelecionado] = useState("");
  const [horariosDisponiveis, setHorariosDisponiveis] = useState([]);
  const [horarioSelecionado, setHorarioSelecionado] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingHorarios, setLoadingHorarios] = useState(false);
  const [agendamentoConfirmado, setAgendamentoConfirmado] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    carregarServicos();
    carregarProfissionais();
  }, []);

  useEffect(() => {
    if (servicoSelecionado && profissionalSelecionado && date) {
      carregarHorariosDisponiveis();
    } else {
      setHorariosDisponiveis([]);
      setHorarioSelecionado("");
    }
  }, [servicoSelecionado, profissionalSelecionado, date]);

  const carregarServicos = async () => {
    try {
      const response = await apiService.servicos.listar();
      setServicos(response || []);
    } catch (err) {
      console.error("Erro ao carregar serviços:", err);
      setError("Erro ao carregar serviços");
    }
  };

  const carregarProfissionais = async () => {
    try {
      const response = await apiService.profissionais.listar();
      const profissionaisAtivos = (response || []).filter(p => p.ativo === "TRUE" || p.ativo === true);
      setProfissionais(profissionaisAtivos);
    } catch (err) {
      console.error("Erro ao carregar profissionais:", err);
      setError("Erro ao carregar profissionais");
    }
  };

  const carregarHorariosDisponiveis = async () => {
    setLoadingHorarios(true);
    setError("");
    setHorarioSelecionado("");
    
    try {
      const dataFormatada = date.toISOString().split('T')[0]; // yyyy-MM-dd
      const response = await apiService.agendamentos.horariosDisponiveis(
        profissionalSelecionado,
        servicoSelecionado,
        dataFormatada
      );
      setHorariosDisponiveis(response || []);
    } catch (err) {
      console.error("Erro ao carregar horários disponíveis:", err);
      // Extrai a mensagem de erro do backend
      const mensagemErro = err.message || "Erro ao carregar horários disponíveis";
      setError(mensagemErro);
      setHorariosDisponiveis([]);
    } finally {
      setLoadingHorarios(false);
    }
  };

  const handleAgendar = async () => {
    if (!servicoSelecionado || !profissionalSelecionado || !horarioSelecionado) {
      setError("Por favor, selecione serviço, profissional e horário");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Formata data para dd/MM/yyyy
      const dia = String(date.getDate()).padStart(2, '0');
      const mes = String(date.getMonth() + 1).padStart(2, '0');
      const ano = date.getFullYear();
      const dataFormatada = `${dia}/${mes}/${ano}`;
      
      // Busca o valor do serviço selecionado
      const servicoSelecionadoObj = servicos.find(s => s.id === parseInt(servicoSelecionado));
      const valorServico = servicoSelecionadoObj?.valor || servicoSelecionadoObj?.preco || 0;
      
      // Busca o usuarioId do localStorage ou token decodificado
      const usuarioId = localStorage.getItem("usuarioId") || 10; // Default 10 se não encontrar
      
      await apiService.agendamentos.cadastrar({
        servicoId: parseInt(servicoSelecionado),
        horario: horarioSelecionado,
        data: dataFormatada,
        profissionalId: parseInt(profissionalSelecionado),
        usuarioId: parseInt(usuarioId),
        valor: valorServico,
        status: "CONFIRMADO",
        usuarioCadastrado: "true"
      });
      
      setAgendamentoConfirmado(true);
    } catch (err) {
      console.error("Erro ao agendar:", err);
      setError(err.message || "Erro ao realizar agendamento. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelar = () => {
    setAgendamentoConfirmado(false);
    setServicoSelecionado("");
    setProfissionalSelecionado("");
    setHorarioSelecionado("");
    setHorariosDisponiveis([]);
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    window.location.href = ROUTES.LOGIN;
  };

  return (
    <div className="agendamento-root">
      <HeaderNavigation 
        userType="CLIENT" 
        onLogout={handleLogout}
      />
    <main className="agendamento-main">
      <div className="agendamento-card">
        <h2 className="agendamento-section-title">Agendar Horário</h2>
        
        {error && (
          <div className="agendamento-error">
            <span className="material-symbols-outlined">error</span>
            <span>{error}</span>
          </div>
        )}

        <div className="agendamento-form-grid">
          <div>
            <label className="agendamento-label" htmlFor="service">Serviço</label>
            <select 
              className="agendamento-select" 
              id="service"
              value={servicoSelecionado}
              onChange={(e) => setServicoSelecionado(e.target.value)}
              disabled={agendamentoConfirmado}
            >
              <option value="">Selecione o serviço</option>
              {servicos.map(servico => (
                <option key={servico.id} value={servico.id}>
                  {servico.nome}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="agendamento-label" htmlFor="professional">Profissional</label>
            <select 
              className="agendamento-select" 
              id="professional"
              value={profissionalSelecionado}
              onChange={(e) => setProfissionalSelecionado(e.target.value)}
              disabled={agendamentoConfirmado}
            >
              <option value="">Selecione o profissional</option>
              {profissionais.map(profissional => (
                <option key={profissional.id} value={profissional.id}>
                  {profissional.nome}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="agendamento-calendar-card">
          <Calendar
            onChange={setDate}
            value={date}
            locale="pt-BR"
            className="agendamento-calendar-component"
            minDate={new Date()}
            disabled={agendamentoConfirmado}
          />
        </div>
        
        <div>
          <h3 className="agendamento-section-title">
            Horários Disponíveis para {date.toLocaleDateString("pt-BR")}
          </h3>
          
          {!servicoSelecionado || !profissionalSelecionado ? (
            <p className="agendamento-info-text">
              Selecione um serviço e profissional para visualizar os horários disponíveis.
            </p>
          ) : loadingHorarios ? (
            <div className="agendamento-loading">
              <div className="agendamento-spinner"></div>
              <p>Carregando horários...</p>
            </div>
          ) : horariosDisponiveis.length === 0 ? (
            <p className="agendamento-empty-text">
              Nenhum horário disponível para esta data.
            </p>
          ) : (
            <div className="agendamento-horarios">
              {horariosDisponiveis.map((hora) => (
                <button
                  key={hora}
                  className={`agendamento-horario-btn${horarioSelecionado === hora ? " selected" : ""}`}
                  disabled={agendamentoConfirmado}
                  onClick={() => setHorarioSelecionado(hora)}
                >
                  {hora}
                </button>
              ))}
            </div>
          )}
        </div>
        
        {!agendamentoConfirmado && (
          <div className="agendamento-footer">
            <button 
              className="agendamento-agendar-btn"
              onClick={handleAgendar}
              disabled={!horarioSelecionado || loading}
            >
              {loading ? "Agendando..." : "Agendar Horário"}
            </button>
          </div>
        )}
        
        {agendamentoConfirmado && (
          <div className="agendamento-confirmacao">
            <h3 className="agendamento-section-title">Confirmação de Agendamento</h3>
            <div className="agendamento-confirmacao-msg">
              <svg className="agendamento-confirmacao-icon" fill="currentColor" viewBox="0 0 20 20">
                <path clipRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" fillRule="evenodd"></path>
              </svg>
              <p className="agendamento-confirmacao-text">
                Seu horário foi agendado com sucesso para o dia {date.toLocaleDateString("pt-BR")} às {horarioSelecionado}.
              </p>
            </div>
            <div className="agendamento-confirmacao-actions">
              <button className="agendamento-cancelar-btn" onClick={handleCancelar}>
                Novo Agendamento
              </button>
              <button className="agendamento-reagendar-btn" onClick={() => window.location.href = ROUTES.MEUS_AGENDAMENTOS}>
                Ver Meus Agendamentos
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  </div>
  );
};

export default Agendamento;