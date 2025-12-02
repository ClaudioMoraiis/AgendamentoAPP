import React, { useState, useEffect } from "react";
import LayoutPrincipal from "../LayoutPrincipal/LayoutPrincipal";
import { apiService } from "../services/api";
import "./GerenciamentoAgendamentos.css";

const API_BASE_URL = "http://localhost:8080";

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

// profissionais will be loaded from the backend (/profissional/listar)
const profissionaisFallback = ["Todos"];
const periodos = ["Hoje", "Esta semana", "Este mês", "Próxima semana", "Personalizado"];

export default function GerenciamentoAgendamentos() {
  const [agendamentos, setAgendamentos] = useState(agendamentosIniciais);
  const [profissionaisRaw, setProfissionaisRaw] = useState([]); // raw objects from API
  const [profissionais, setProfissionais] = useState(profissionaisFallback); // names array used in selects
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
    status: "confirmado",
    usuarioCadastrado: false
  });
  const [message, setMessage] = useState({ text: '', type: '' });
  const [saving, setSaving] = useState(false);
  const [servicos, setServicos] = useState(servicosComValores);
  const [loadingServicos, setLoadingServicos] = useState(false);
  
  // Estados para modal de busca de clientes
  const [modalClientesOpen, setModalClientesOpen] = useState(false);
  const [clientes, setClientes] = useState([]);
  const [loadingClientes, setLoadingClientes] = useState(false);
  const [buscaCliente, setBuscaCliente] = useState('');
  const [modoEdicao, setModoEdicao] = useState(false); // Controla se está no modo novo ou editar

  useEffect(() => {
    carregarServicos();
    carregarProfissionais();
    carregarAgendamentos();
  }, []);

  const carregarProfissionais = async () => {
    try {
      const resp = await apiService.profissionais.listar();
      if (Array.isArray(resp)) {
        // Normalize raw list (ensure 'ativo' boolean when backend returns status as 'TRUE'/'FALSE')
        const normalizedRaw = resp.map(p => ({
          ...p,
          ativo: p.ativo === true || String(p.status || '').toUpperCase() === 'TRUE'
        }));
        // Keep raw list and also a names list for selects
        setProfissionaisRaw(normalizedRaw);
        const names = normalizedRaw.map(p => p.nome || p.name || String(p)).filter(Boolean);
        setProfissionais(["Todos", ...names]);
      } else {
        console.warn('Resposta inesperada de profissional/listar:', resp);
      }
    } catch (err) {
      console.error('Erro ao carregar profissionais:', err);
      // keep fallback 'Todos' only
      setProfissionaisRaw([]);
      setProfissionais(["Todos"]);
    }
  };

  const carregarAgendamentos = async () => {
    try {
      const resp = await apiService.agendamentos.listar();
      if (Array.isArray(resp)) {
        // Normalize API response to match UI structure (keep IDs for editing)
        const normalized = resp.map(a => ({
          id: a.id,
          cliente: a.usuarioNome || '',
          servico: a.servico || '',
          valor: typeof a.valor === 'number' ? `R$ ${a.valor.toFixed(2).replace('.', ',')}` : String(a.valor || ''),
          profissional: a.nomeProfissional || '',
          data: a.data || '',
          horario: a.horarioInicio || a.horario || '',
          status: (a.status || 'pendente').toLowerCase(),
          // Keep IDs to avoid re-lookup when editing
          usuarioId: a.usuarioId,
          profissionalId: a.profissionalId,
          servicoId: a.servicoId
        }));
        setAgendamentos(normalized);
        console.log('📅 Agendamentos carregados:', normalized.length);
      } else {
        console.warn('Resposta inesperada de agendamento/listar:', resp);
      }
    } catch (err) {
      console.error('Erro ao carregar agendamentos:', err);
      setAgendamentos([]);
    }
  };

  const carregarClientes = async () => {
    try {
      setLoadingClientes(true);
      const resp = await apiService.usuarios.listar();
      console.log('👥 Clientes carregados:', resp);
      setClientes(Array.isArray(resp) ? resp : []);
    } catch (err) {
      console.error('Erro ao carregar clientes:', err);
      setClientes([]);
    } finally {
      setLoadingClientes(false);
    }
  };

  const abrirModalClientes = (isEdit = false) => {
    setModoEdicao(isEdit);
    setBuscaCliente('');
    carregarClientes();
    setModalClientesOpen(true);
  };

  const selecionarCliente = (cliente) => {
    const nomeCliente = cliente.nome || cliente.name || '';
    if (modoEdicao) {
      setAgendamentoEditando({ ...agendamentoEditando, cliente: nomeCliente });
    } else {
      setNovoAgendamento({ ...novoAgendamento, cliente: nomeCliente });
    }
    setModalClientesOpen(false);
  };

  const carregarServicos = async () => {
    try {
      setLoadingServicos(true);
      const resp = await apiService.servicos.listar();
      if (Array.isArray(resp)) {
        const normalized = resp.map(s => {
          const nome = s.nome || s.titulo || s.name || s.descricao || s.label || '';
          let valor = '';
          if (s.valor !== undefined && s.valor !== null) {
            if (typeof s.valor === 'number') {
              valor = `R$ ${s.valor.toFixed(2).replace('.', ',')}`;
            } else {
              valor = String(s.valor);
            }
          } else if (s.preco !== undefined && s.preco !== null) {
            const p = Number(s.preco);
            if (!isNaN(p)) valor = `R$ ${p.toFixed(2).replace('.', ',')}`;
            else valor = String(s.preco);
          }
          return {
            id: s.id,
            nome: nome,
            valor: valor,
            duracao: s.duracao || s.tempo || ''
          };
        });
        setServicos(normalized);
      } else {
        console.warn('Resposta inesperada de servicos/listar:', resp);
      }
    } catch (err) {
      console.error('Erro ao carregar serviços:', err);
    } finally {
      setLoadingServicos(false);
    }
  };

  // Função para lidar com a seleção de serviço
  const handleServicoChange = (servicoIdOrNome, isEditando = false) => {
    // Try to find by ID first (if it's a number or numeric string)
    let servicoSelecionado = servicos.find(s => String(s.id) === String(servicoIdOrNome));
    
    // If not found by ID, try by name (backward compatibility)
    if (!servicoSelecionado) {
      servicoSelecionado = servicos.find(s => s.nome === servicoIdOrNome);
    }
    
    // If still not found, try trimmed comparison
    if (!servicoSelecionado) {
      servicoSelecionado = servicos.find(s => String(s.nome || '').trim() === String(servicoIdOrNome || '').trim());
    }
    
    if (servicoSelecionado) {
      if (isEditando) {
        setAgendamentoEditando({
          ...agendamentoEditando,
          servico: servicoSelecionado.nome,
          servicoId: servicoSelecionado.id,
          valor: servicoSelecionado.valor
        });
      } else {
        setNovoAgendamento({
          ...novoAgendamento,
          servico: servicoSelecionado.nome,
          servicoId: servicoSelecionado.id,
          valor: servicoSelecionado.valor
        });
      }
    } else {
      // Fallback: update servico name even if not found in list
      if (isEditando) {
        setAgendamentoEditando({
          ...agendamentoEditando,
          servico: servicoIdOrNome
        });
      } else {
        setNovoAgendamento({
          ...novoAgendamento,
          servico: servicoIdOrNome
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
      status: "confirmado",
      usuarioCadastrado: false
    });
    setModalOpen(true);
  };

  const fecharModalNovo = () => {
    setModalOpen(false);
  };

  const abrirModalEditar = (agendamento) => {
    setAgendamentoEditando({ 
      ...agendamento,
      usuarioCadastrado: agendamento.usuarioCadastrado !== undefined ? agendamento.usuarioCadastrado : true
    });
    setModalEditarOpen(true);
  };

  const fecharModalEditar = () => {
    setModalEditarOpen(false);
    setAgendamentoEditando(null);
  };

  const salvarNovoAgendamento = async (e) => {
    e.preventDefault();
    setMessage({ text: '', type: '' });
    if (!novoAgendamento.cliente || !novoAgendamento.servico || !novoAgendamento.profissional) {
      setMessage({ text: 'Preencha todos os campos obrigatórios!', type: 'error' });
      return;
    }

    setSaving(true);

    try {
      // Resolve usuarioId via /usuario/id/{nome}
      const usuarioNome = novoAgendamento.cliente;
      let usuarioResp = null;
      try {
        // try apiService helper if exists
        if (apiService.usuarios.buscarPorNome) {
          usuarioResp = await apiService.usuarios.buscarPorNome(usuarioNome);
        } else {
          // fallback endpoint
          usuarioResp = await fetch(`http://localhost:8080/usuario/id/${encodeURIComponent(usuarioNome)}`, {
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('authToken')}` }
          }).then(r => r.ok ? r.json() : null);
        }
      } catch (uErr) {
        console.error('Erro lookup usuario:', uErr);
      }

      console.log('🔎 usuário lookup result:', usuarioResp);

      let usuarioId = null;
      if (usuarioResp) {
        // Backend may return different shapes. Try common possibilities.
        if (typeof usuarioResp === 'object' && usuarioResp.id) {
          usuarioId = usuarioResp.id;
        } else if (Array.isArray(usuarioResp) && usuarioResp.length > 0 && usuarioResp[0].id) {
          usuarioId = usuarioResp[0].id;
        } else if (typeof usuarioResp === 'object' && usuarioResp.Sucesso) {
          // Some endpoints return { Sucesso: "13" }
          const parsed = parseInt(String(usuarioResp.Sucesso).replace(/\D/g, ''), 10);
          if (!isNaN(parsed)) usuarioId = parsed;
        } else if (typeof usuarioResp === 'string') {
          const parsed = parseInt(usuarioResp.replace(/\D/g, ''), 10);
          if (!isNaN(parsed)) usuarioId = parsed;
        }
      }

      // Resolve servicoId via /servico/id?name=...&price=...
      const servicoNome = novoAgendamento.servico;
      const valorStr = novoAgendamento.valor || '';
      const price = parseFloat((valorStr.replace('R$', '').replace(/\./g, '').replace(',', '.') || '').trim()) || 0;
      let servicoResp = null;
      try {
        servicoResp = await apiService.servicos.buscarIdPorNomePreco(servicoNome, price);
      } catch (sErr) {
        console.error('Erro lookup servico:', sErr);
      }
      console.log('🔎 servico lookup result:', servicoResp);
      let servicoId = null;
      if (servicoResp) {
        if (typeof servicoResp === 'object' && servicoResp.id) servicoId = servicoResp.id;
        else if (Array.isArray(servicoResp) && servicoResp.length > 0 && servicoResp[0].id) servicoId = servicoResp[0].id;
      }

      // Resolve profissionalId via /profissional/{codigo}
      // Resolve profissionalId: first try to find in cached professionals, then fallback to API lookup
      let profissionalId = null;
      const profissionalNome = novoAgendamento.profissional;
      if (profissionaisRaw && profissionaisRaw.length > 0) {
        const found = profissionaisRaw.find(p => {
          const nome = (p.nome || p.name || '').toString();
          return nome.toLowerCase() === (profissionalNome || '').toLowerCase();
        });
        if (found && (found.id || found.codigo)) {
          profissionalId = found.id || found.codigo;
        }
      }

      console.log('🔎 profissional resolved from cache:', profissionalId);

      if (!profissionalId) {
        const profissionalCodigo = novoAgendamento.profissional;
        let profResp = null;
        try {
          profResp = await apiService.profissionais.buscarPorCodigo(profissionalCodigo);
        } catch (pErr) {
          console.error('Erro lookup profissional:', pErr);
        }
        if (profResp) {
          if (typeof profResp === 'object' && profResp.id) profissionalId = profResp.id;
          else if (Array.isArray(profResp) && profResp.length > 0 && profResp[0].id) profissionalId = profResp[0].id;
        }
      }

      console.log('🔎 profissional final id:', profissionalId);

      // Format date for backend (many Spring apps expect dd/MM/yyyy)
      const formatDateForBackend = (isoDate) => {
        if (!isoDate) return isoDate;
        const parts = String(isoDate).split('-'); // expect YYYY-MM-DD
        if (parts.length !== 3) return isoDate;
        const [y, m, d] = parts;
        return `${d}/${m}/${y}`;
      };

      const dataFormatted = formatDateForBackend(novoAgendamento.data);
      console.log('🔎 data formatted for backend:', dataFormatted);

      // If usuarioCadastrado was checked but lookup failed, abort early
      if (novoAgendamento.usuarioCadastrado && !usuarioId) {
        setMessage({ text: 'Marca "Usuário com cadastro" selecionada, mas não foi possível localizar o usuário. Verifique o nome e tente novamente.', type: 'error' });
        setSaving(false);
        return;
      }

      // Fallback: if servicoId not resolved by lookup, try local servicos list
      if (!servicoId) {
        const localServ = servicos.find(s => (s.nome || '').toLowerCase() === (servicoNome || '').toLowerCase());
        if (localServ && localServ.id) servicoId = localServ.id;
      }

      // Format horario to HH:mm (remove seconds if present)
      let horarioFormatado = novoAgendamento.horario;
      if (horarioFormatado && horarioFormatado.length > 5) {
        horarioFormatado = horarioFormatado.substring(0, 5);
      }

      // Compose payload (use formatted date)
      const payload = {
        servicoId: servicoId,
        horario: horarioFormatado,
        data: dataFormatted,
        profissionalId: profissionalId,
        usuarioId: usuarioId || 0,
        valor: price,
        usuarioCadastrado: !!novoAgendamento.usuarioCadastrado,
        status: (novoAgendamento.status || 'CONFIRMADO').toUpperCase()
      };

      // If usuarioCadastrado is false, add nomeUsuario field
      if (!novoAgendamento.usuarioCadastrado) {
        payload.nomeUsuario = novoAgendamento.cliente;
      }

      console.log('🔄 Enviando payload de agendamento:', payload);

      // Call registrar endpoint (admin)
      let resp = null;
      try {
        if (apiService.agendamentos.registrar) {
          resp = await apiService.agendamentos.registrar(payload);
        } else {
          resp = await apiService.agendamentos.criar(payload);
        }
        console.log('✅ registrar response:', resp);
      } catch (err) {
        console.error('Erro ao registrar agendamento:', err);
        const errMsg = err && err.message ? err.message : 'Erro ao registrar agendamento';
        setMessage({ text: errMsg, type: 'error' });
        setSaving(false);
        return;
      }

      // If registrar returned an object with {status, data}, handle HTTP codes explicitly
      if (resp && typeof resp === 'object' && 'status' in resp) {
        const { status, data } = resp;
        if (status >= 400) {
          // extract error message from data
          let errorMessage = 'Erro ao registrar agendamento';
          if (data) {
            if (typeof data === 'string') errorMessage = data;
            else if (data.Erro) errorMessage = data.Erro;
            else if (data.message) errorMessage = data.message;
            else if (data.description) errorMessage = data.description;
            else if (data.Sucesso) errorMessage = data.Sucesso;
            else {
              const vals = Object.values(data || {});
              const firstStr = vals.find(v => typeof v === 'string' && v.trim());
              if (firstStr) errorMessage = firstStr;
            }
          }
          setMessage({ text: errorMessage, type: 'error' });
          setSaving(false);
          return;
        }

        // success path (2xx)
        const successText = data && data.Sucesso ? data.Sucesso : 'Agendamento cadastrado com sucesso';
        setMessage({ text: successText, type: 'success' });

        // close immediately on 202, otherwise show brief success then close
        if (status === 202) {
          if (data && data.id) {
            const novoRegistro = { ...novoAgendamento, id: data.id };
            setAgendamentos(prev => [...prev, novoRegistro]);
          }
          fecharModalNovo();
        } else {
          let novoRegistro = { ...novoAgendamento };
          if (data && data.id) novoRegistro.id = data.id;
          setAgendamentos(prev => [...prev, novoRegistro]);
          setTimeout(() => {
            setMessage({ text: '', type: '' });
            fecharModalNovo();
          }, 1500);
        }

      } else {
        // backward-compatible: resp is the data itself
        const successText = typeof resp === 'object' && resp.Sucesso ? resp.Sucesso : 'Agendamento cadastrado com sucesso';
        setMessage({ text: successText, type: 'success' });

        let novoRegistro = { ...novoAgendamento };
        if (resp && resp.id) novoRegistro.id = resp.id;
        setAgendamentos(prev => [...prev, novoRegistro]);
        setTimeout(() => {
          setMessage({ text: '', type: '' });
          fecharModalNovo();
        }, 1500);
      }

    } finally {
      setSaving(false);
    }
  };

  const salvarEdicaoAgendamento = async (e) => {
    e.preventDefault();
    setMessage({ text: '', type: '' });
    if (!agendamentoEditando.cliente || !agendamentoEditando.servico || !agendamentoEditando.profissional) {
      setMessage({ text: 'Preencha todos os campos obrigatórios!', type: 'error' });
      return;
    }

    setSaving(true);

    try {
      // Use existing usuarioId if available, otherwise lookup
      let usuarioId = agendamentoEditando.usuarioId || null;

      // Only lookup if usuarioId not already present
      if (!usuarioId && agendamentoEditando.usuarioCadastrado) {
        const usuarioNome = agendamentoEditando.cliente;
        let usuarioResp = null;

        try {
          if (apiService.usuarios.buscarPorNome) {
            usuarioResp = await apiService.usuarios.buscarPorNome(usuarioNome);
          } else {
            const url = `${API_BASE_URL}/usuario/id/${encodeURIComponent(usuarioNome)}`;
            const token = localStorage.getItem("authToken");
            const response = await fetch(url, {
              method: 'GET',
              headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
            });
            if (response.ok) {
              const contentType = response.headers.get('content-type');
              usuarioResp = contentType && contentType.includes('application/json') 
                ? await response.json() 
                : await response.text();
            }
          }
        } catch (err) {
          console.warn('Usuario lookup failed:', err);
        }

        console.log('🔎 usuario lookup result:', usuarioResp);

        if (usuarioResp) {
          if (typeof usuarioResp === 'object' && usuarioResp.id) {
            usuarioId = usuarioResp.id;
          } else if (Array.isArray(usuarioResp) && usuarioResp.length > 0 && usuarioResp[0].id) {
            usuarioId = usuarioResp[0].id;
          } else if (typeof usuarioResp === 'object' && usuarioResp.Sucesso) {
            const parsed = parseInt(String(usuarioResp.Sucesso).replace(/\D/g, ''), 10);
            if (!isNaN(parsed)) usuarioId = parsed;
          } else if (typeof usuarioResp === 'string') {
            const parsed = parseInt(usuarioResp.replace(/\D/g, ''), 10);
            if (!isNaN(parsed)) usuarioId = parsed;
          }
        }

        // If usuarioCadastrado was checked but lookup failed, abort early
        if (!usuarioId) {
          setMessage({ text: 'Marca "Usuário com cadastro" selecionada, mas não foi possível localizar o usuário. Verifique o nome e tente novamente.', type: 'error' });
          setSaving(false);
          return;
        }
      }

      // Use existing servicoId if available, otherwise lookup
      let servicoId = agendamentoEditando.servicoId || null;

      if (!servicoId) {
        const servicoNome = agendamentoEditando.servico;
        const valorStr = agendamentoEditando.valor || '';
        const price = parseFloat((valorStr.replace('R$', '').replace(/\./g, '').replace(',', '.') || '').trim()) || 0;
        let servicoResp = null;
        try {
          servicoResp = await apiService.servicos.buscarIdPorNomePreco(servicoNome, price);
        } catch (sErr) {
          console.error('Erro lookup servico:', sErr);
        }
        console.log('🔎 servico lookup result:', servicoResp);
        if (servicoResp) {
          if (typeof servicoResp === 'object' && servicoResp.id) servicoId = servicoResp.id;
          else if (Array.isArray(servicoResp) && servicoResp.length > 0 && servicoResp[0].id) servicoId = servicoResp[0].id;
        }

        // Fallback: if servicoId not resolved by lookup, try local servicos list
        if (!servicoId) {
          const localServ = servicos.find(s => (s.nome || '').toLowerCase() === (servicoNome || '').toLowerCase());
          if (localServ && localServ.id) servicoId = localServ.id;
        }
      }

      // Use existing profissionalId if available, otherwise lookup
      let profissionalId = agendamentoEditando.profissionalId || null;

      if (!profissionalId) {
        const profissionalNome = agendamentoEditando.profissional;
        if (profissionaisRaw && profissionaisRaw.length > 0) {
          const found = profissionaisRaw.find(p => {
            const nome = (p.nome || p.name || '').toString();
            return nome.toLowerCase() === (profissionalNome || '').toLowerCase();
          });
          if (found && (found.id || found.codigo)) {
            profissionalId = found.id || found.codigo;
          }
        }

        console.log('🔎 profissional resolved from cache:', profissionalId);

        if (!profissionalId) {
          const profissionalCodigo = agendamentoEditando.profissional;
          let profResp = null;
          try {
            profResp = await apiService.profissionais.buscarPorCodigo(profissionalCodigo);
          } catch (pErr) {
            console.error('Erro lookup profissional:', pErr);
          }
          if (profResp) {
            if (typeof profResp === 'object' && profResp.id) profissionalId = profResp.id;
            else if (Array.isArray(profResp) && profResp.length > 0 && profResp[0].id) profissionalId = profResp[0].id;
          }
        }

        console.log('🔎 profissional final id:', profissionalId);
      }

      // Format date to dd/MM/yyyy
      let dataFormatada = agendamentoEditando.data;
      if (dataFormatada && dataFormatada.includes('-')) {
        const [ano, mes, dia] = dataFormatada.split('-');
        dataFormatada = `${dia}/${mes}/${ano}`;
      }

      // Extract numeric valor
      let valorNumerico = 0;
      if (typeof agendamentoEditando.valor === 'number') {
        valorNumerico = agendamentoEditando.valor;
      } else if (typeof agendamentoEditando.valor === 'string') {
        const cleaned = agendamentoEditando.valor.replace(/[^\d,]/g, '').replace(',', '.');
        valorNumerico = parseFloat(cleaned) || 0;
      }

      // Format horario to HH:mm (remove seconds if present)
      let horarioFormatado = agendamentoEditando.horario;
      if (horarioFormatado && horarioFormatado.length > 5) {
        horarioFormatado = horarioFormatado.substring(0, 5);
      }

      const payload = {
        servicoId,
        horario: horarioFormatado,
        data: dataFormatada,
        profissionalId,
        usuarioId: usuarioId || 0,
        valor: valorNumerico,
        status: (agendamentoEditando.status || 'confirmado').toUpperCase(),
        usuarioCadastrado: !!agendamentoEditando.usuarioCadastrado
      };

      // If usuarioCadastrado is false, add nomeUsuario field
      if (!agendamentoEditando.usuarioCadastrado) {
        payload.nomeUsuario = agendamentoEditando.cliente;
      }

      console.log('🔄 Atualizando agendamento:', agendamentoEditando.id, payload);

      const resp = await apiService.agendamentos.atualizar(agendamentoEditando.id, payload);

      // Check if response includes {status, data} structure
      if (resp && typeof resp === 'object' && 'status' in resp) {
        const { status, data } = resp;

        // Handle error responses (4xx)
        if (status >= 400 && status < 500) {
          let errorMessage = 'Erro ao atualizar agendamento';
          if (data) {
            if (typeof data === 'string') errorMessage = data;
            else if (data.message) errorMessage = data.message;
            else if (data.error) errorMessage = data.error;
            else if (data.Erro) errorMessage = data.Erro;
            else {
              const vals = Object.values(data || {});
              const firstStr = vals.find(v => typeof v === 'string' && v.trim());
              if (firstStr) errorMessage = firstStr;
            }
          }
          setMessage({ text: errorMessage, type: 'error' });
          setSaving(false);
          return;
        }

        // Success path (2xx)
        const successText = data && data.Sucesso ? data.Sucesso : 'Agendamento atualizado com sucesso!';
        setMessage({ text: successText, type: 'success' });

        // Reload agendamentos list
        await carregarAgendamentos();

        setTimeout(() => {
          setMessage({ text: '', type: '' });
          fecharModalEditar();
        }, 1500);

      } else {
        // Backward-compatible: resp is the data itself
        const successText = typeof resp === 'object' && resp.Sucesso ? resp.Sucesso : 'Agendamento atualizado com sucesso!';
        setMessage({ text: successText, type: 'success' });

        await carregarAgendamentos();

        setTimeout(() => {
          setMessage({ text: '', type: '' });
          fecharModalEditar();
        }, 1500);
      }

    } catch (err) {
      console.error('Erro ao atualizar agendamento:', err);
      let errorMessage = 'Erro ao atualizar agendamento';
      if (err.message) errorMessage = err.message;
      setMessage({ text: errorMessage, type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const excluirAgendamento = async (id) => {
    if (window.confirm("Tem certeza que deseja excluir este agendamento?")) {
      try {
        await apiService.agendamentos.deletar(id);
        setMessage({ text: 'Agendamento excluído com sucesso!', type: 'success' });
        // Reload list
        await carregarAgendamentos();
        // Close modal if open
        if (modalEditarOpen) {
          setTimeout(() => {
            setMessage({ text: '', type: '' });
            fecharModalEditar();
          }, 1500);
        } else {
          setTimeout(() => {
            setMessage({ text: '', type: '' });
          }, 2000);
        }
      } catch (err) {
        console.error('Erro ao excluir agendamento:', err);
        let errorMessage = 'Erro ao excluir agendamento';
        if (err.message) errorMessage = err.message;
        setMessage({ text: errorMessage, type: 'error' });
      }
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

        {/* Mensagem global */}
        {message.text && (
          <div style={{ marginBottom: 16 }}>
            <div
              className={`ga-message ${message.type}`}
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
                <form onSubmit={salvarNovoAgendamento}>
              <div className="ga-modal-form-fields">
                <div className="ga-form-group">
                  <label>Cliente *</label>
                  <div className="ga-input-with-icon">
                    <input
                      type="text"
                      value={novoAgendamento.cliente}
                      onChange={(e) => setNovoAgendamento({ ...novoAgendamento, cliente: e.target.value })}
                      placeholder="Nome do cliente"
                      required
                    />
                    <button 
                      type="button" 
                      className="ga-btn-search"
                      onClick={() => abrirModalClientes(false)}
                      title="Buscar cliente cadastrado"
                    >
                      <span className="material-symbols-outlined">search</span>
                    </button>
                  </div>
              </div>

              <div className="ga-form-group ga-checkbox-row">
                <input
                  id="usuarioCadastrado"
                  type="checkbox"
                  checked={!!novoAgendamento.usuarioCadastrado}
                  onChange={(e) => setNovoAgendamento({ ...novoAgendamento, usuarioCadastrado: e.target.checked })}
                />
                <label htmlFor="usuarioCadastrado">Usuário com cadastro</label>
              </div>

              <div className="ga-form-group">
                <label>Serviço *</label>
                <select
                  value={novoAgendamento.servicoId || ""}
                  onChange={(e) => handleServicoChange(e.target.value, false)}
                  required
                >
                  <option value="">Selecione um serviço</option>
                  {servicos.map(servico => (
                    <option key={servico.id} value={servico.id}>
                      {servico.nome} - {servico.valor} {servico.duracao ? `(${servico.duracao})` : ''}
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
                  {profissionais.filter(p => p !== 'Todos').map((profName, idx) => (
                    <option key={profName + idx} value={profName}>{profName}</option>
                  ))}
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
            <form onSubmit={salvarEdicaoAgendamento}>
              <div className="ga-modal-form-fields">
                <div className="ga-form-group">
                  <label>Cliente *</label>
                  <div className="ga-input-with-icon">
                    <input
                      type="text"
                      value={agendamentoEditando.cliente}
                      onChange={(e) => setAgendamentoEditando({ ...agendamentoEditando, cliente: e.target.value })}
                      placeholder="Nome do cliente"
                      required
                    />
                    <button 
                      type="button" 
                      className="ga-btn-search"
                      onClick={() => abrirModalClientes(true)}
                      title="Buscar cliente cadastrado"
                    >
                      <span className="material-symbols-outlined">search</span>
                    </button>
                  </div>
                </div>

                <div className="ga-checkbox-group">
                <input
                  id="usuarioCadastradoEdit"
                  type="checkbox"
                  checked={!!agendamentoEditando.usuarioCadastrado}
                  onChange={(e) => setAgendamentoEditando({ ...agendamentoEditando, usuarioCadastrado: e.target.checked })}
                />
                <label htmlFor="usuarioCadastradoEdit">Usuário com cadastro</label>
              </div>

              <div className="ga-form-group">
                <label>Serviço *</label>
                <select
                  key={`servico-edit-${agendamentoEditando.servicoId || agendamentoEditando.servico}`}
                  value={agendamentoEditando.servicoId || ""}
                  onChange={(e) => handleServicoChange(e.target.value, true)}
                  required
                >
                  <option value="">Selecione um serviço</option>
                  {servicos.map(servico => (
                    <option key={servico.id} value={servico.id}>
                      {servico.nome} - {servico.valor} {servico.duracao ? `(${servico.duracao})` : ''}
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
                  onChange={(e) => setAgendamentoEditando({ 
                    ...agendamentoEditando, 
                    profissional: e.target.value,
                    profissionalId: null // Clear cached ID to force lookup
                  })}
                  required
                >
                  <option value="">Selecione um profissional</option>
                  {profissionais.filter(p => p !== 'Todos').map((profName, idx) => (
                    <option key={profName + idx} value={profName}>{profName}</option>
                  ))}
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
              </div>

              <div className="ga-modal-buttons">
                <button type="button" onClick={fecharModalEditar} className="ga-btn-cancel">
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

      {/* Modal Buscar Clientes */}
      {modalClientesOpen && (
        <div className="ga-modal-overlay" onClick={() => setModalClientesOpen(false)}>
          <div className="ga-modal ga-modal-clientes" onClick={(e) => e.stopPropagation()}>
            <h3>Selecionar Cliente</h3>
            
            <div className="ga-search-box">
              <span className="material-symbols-outlined">search</span>
              <input
                type="text"
                value={buscaCliente}
                onChange={(e) => setBuscaCliente(e.target.value)}
                placeholder="Buscar por nome, email ou CPF..."
                autoFocus
              />
            </div>

            <div className="ga-clientes-list">
              {loadingClientes ? (
                <div className="ga-loading">Carregando clientes...</div>
              ) : (
                clientes
                  .filter(c => {
                    if (!buscaCliente) return true;
                    const busca = buscaCliente.toLowerCase();
                    const nome = (c.nome || c.name || '').toLowerCase();
                    const email = (c.email || '').toLowerCase();
                    const cpf = (c.cpf || '').replace(/\D/g, '');
                    return nome.includes(busca) || email.includes(busca) || cpf.includes(busca);
                  })
                  .map(cliente => (
                    <div 
                      key={cliente.id} 
                      className="ga-cliente-item"
                      onDoubleClick={() => selecionarCliente(cliente)}
                    >
                      <div className="ga-cliente-info">
                        <div className="ga-cliente-nome">{cliente.nome || cliente.name}</div>
                        <div className="ga-cliente-detalhes">
                          {cliente.email && <span>{cliente.email}</span>}
                          {cliente.celular && <span className="ga-cliente-telefone">{cliente.celular}</span>}
                        </div>
                      </div>
                      <button 
                        type="button"
                        className="ga-btn-selecionar"
                        onClick={() => selecionarCliente(cliente)}
                      >
                        Selecionar
                      </button>
                    </div>
                  ))
              )}
              {!loadingClientes && clientes.length === 0 && (
                <div className="ga-empty-state">Nenhum cliente cadastrado</div>
              )}
            </div>

            <div className="ga-modal-buttons">
              <button 
                type="button" 
                onClick={() => setModalClientesOpen(false)} 
                className="ga-btn-cancel"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </LayoutPrincipal>
  );
}