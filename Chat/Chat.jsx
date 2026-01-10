import { useState, useEffect, useRef } from 'react';
import LayoutPrincipal from '../LayoutPrincipal/LayoutPrincipal';
import './Chat.css';

const Chat = () => {
  const [conversas, setConversas] = useState([]);
  const [conversaSelecionada, setConversaSelecionada] = useState(null);
  const [mensagens, setMensagens] = useState([]);
  const [novaMensagem, setNovaMensagem] = useState('');
  const [busca, setBusca] = useState('');
  const [abaAtiva, setAbaAtiva] = useState('conversas'); // 'conversas' ou 'clientes'
  const [clientesAtivos, setClientesAtivos] = useState([]);
  const mensagensEndRef = useRef(null);
  const [usuarioAtual, setUsuarioAtual] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  // Simula dados iniciais (substituir por chamadas à API)
  useEffect(() => {
    // Obter dados do usuário logado
    const usuarioLogado = JSON.parse(localStorage.getItem('usuario') || '{}');
    const userEmail = localStorage.getItem('userEmail') || '';
    const userRole = localStorage.getItem('role') || '';
    
    setUsuarioAtual(usuarioLogado);
    
    // Verificar se é admin - mesma lógica do Login.jsx
    const adminStatus = 
      userEmail.toUpperCase() === 'ADM@GMAIL.COM' ||
      userRole === 'admin' ||
      usuarioLogado?.tipo === 'ADMIN' || 
      usuarioLogado?.role === 'ADMIN' ||
      usuarioLogado?.perfil === 'ADMIN' ||
      usuarioLogado?.tipoUsuario === 'ADMIN' ||
      String(usuarioLogado?.tipo || '').toUpperCase() === 'ADMIN' ||
      String(usuarioLogado?.role || '').toUpperCase() === 'ADMIN';
    
    console.log('👤 Usuário:', usuarioLogado);
    console.log('📧 Email:', userEmail);
    console.log('🎭 Role:', userRole);
    console.log('🔐 É Admin?', adminStatus);
    
    setIsAdmin(adminStatus);

    // Carregar conversas existentes
    carregarConversas(adminStatus);
    
    // Se for admin, carregar clientes ativos
    if (adminStatus) {
      carregarClientesAtivos();
    }

    // TODO: Configurar WebSocket para mensagens em tempo real
    // const ws = new WebSocket('ws://localhost:8080/chat');
    // ws.onmessage = (event) => {
    //   const novaMensagem = JSON.parse(event.data);
    //   handleNovaMensagemRecebida(novaMensagem);
    // };
  }, []);

  // Scroll automático para última mensagem
  useEffect(() => {
    mensagensEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mensagens]);

  const carregarConversas = async (isAdminUser) => {
    // TODO: Substituir por chamada real à API
    // const response = await api.get('/api/chat/conversas');
    
    if (isAdminUser) {
      // Admin vê todas as conversas com clientes
      const conversasMock = [
        {
          id: 1,
          clienteId: 101,
          clienteNome: 'João Silva',
          clienteFoto: null,
          ultimaMensagem: 'Olá, gostaria de reagendar minha consulta',
          dataUltimaMensagem: new Date(Date.now() - 3600000),
          naoLidas: 2,
          online: true
        },
        {
          id: 2,
          clienteId: 102,
          clienteNome: 'Maria Santos',
          clienteFoto: null,
          ultimaMensagem: 'Obrigada pelo atendimento!',
          dataUltimaMensagem: new Date(Date.now() - 7200000),
          naoLidas: 0,
          online: false
        },
        {
          id: 3,
          clienteId: 103,
          clienteNome: 'Pedro Oliveira',
          clienteFoto: null,
          ultimaMensagem: 'Qual o horário disponível amanhã?',
          dataUltimaMensagem: new Date(Date.now() - 86400000),
          naoLidas: 1,
          online: true
        }
      ];
      setConversas(conversasMock);
    } else {
      // Cliente vê apenas conversa com o Admin
      const conversaAdminMock = [
        {
          id: 1,
          clienteId: 0, // ID do admin
          clienteNome: 'Administrador',
          clienteFoto: null,
          ultimaMensagem: 'Olá! Como posso ajudar?',
          dataUltimaMensagem: new Date(Date.now() - 3600000),
          naoLidas: 0,
          online: true
        }
      ];
      setConversas(conversaAdminMock);
      // Auto-selecionar a conversa com o admin
      setTimeout(() => {
        selecionarConversa(conversaAdminMock[0]);
      }, 100);
    }
  };

  const carregarClientesAtivos = async () => {
    // TODO: Substituir por chamada real à API
    // const response = await api.get('/api/chat/clientes-ativos');
    
    // Dados mockados
    const clientesMock = [
      { id: 101, nome: 'João Silva', online: true, ultimoAcesso: new Date() },
      { id: 102, nome: 'Maria Santos', online: false, ultimoAcesso: new Date(Date.now() - 3600000) },
      { id: 103, nome: 'Pedro Oliveira', online: true, ultimoAcesso: new Date() },
      { id: 104, nome: 'Ana Costa', online: true, ultimoAcesso: new Date() },
      { id: 105, nome: 'Carlos Mendes', online: false, ultimoAcesso: new Date(Date.now() - 7200000) }
    ];
    
    setClientesAtivos(clientesMock);
  };

  const carregarMensagens = async (conversaId) => {
    // TODO: Substituir por chamada real à API
    // const response = await api.get(`/api/chat/conversas/${conversaId}/mensagens`);
    
    // Dados mockados
    const mensagensMock = [
      {
        id: 1,
        remetenteId: 101,
        remetente: 'João Silva',
        conteudo: 'Olá, boa tarde!',
        dataEnvio: new Date(Date.now() - 7200000),
        lida: true
      },
      {
        id: 2,
        remetenteId: usuarioAtual?.id || 1,
        remetente: 'Você',
        conteudo: 'Boa tarde, João! Como posso ajudar?',
        dataEnvio: new Date(Date.now() - 7000000),
        lida: true
      },
      {
        id: 3,
        remetenteId: 101,
        remetente: 'João Silva',
        conteudo: 'Gostaria de reagendar minha consulta de amanhã, se possível.',
        dataEnvio: new Date(Date.now() - 3600000),
        lida: true
      }
    ];
    
    setMensagens(mensagensMock);
  };

  const selecionarConversa = (conversa) => {
    setConversaSelecionada(conversa);
    carregarMensagens(conversa.id);
    
    // Marcar mensagens como lidas
    if (conversa.naoLidas > 0) {
      marcarComoLida(conversa.id);
    }
  };

  const iniciarNovaConversa = (cliente) => {
    // Verificar se já existe conversa com este cliente
    const conversaExistente = conversas.find(c => c.clienteId === cliente.id);
    
    if (conversaExistente) {
      selecionarConversa(conversaExistente);
      setAbaAtiva('conversas');
    } else {
      // Criar nova conversa
      const novaConversa = {
        id: Date.now(),
        clienteId: cliente.id,
        clienteNome: cliente.nome,
        clienteFoto: null,
        ultimaMensagem: '',
        dataUltimaMensagem: new Date(),
        naoLidas: 0,
        online: cliente.online
      };
      
      setConversas([novaConversa, ...conversas]);
      setConversaSelecionada(novaConversa);
      setMensagens([]);
      setAbaAtiva('conversas');
    }
  };

  const marcarComoLida = async (conversaId) => {
    // TODO: Implementar chamada à API
    // await api.put(`/api/chat/conversas/${conversaId}/marcar-lida`);
    
    setConversas(conversas.map(c => 
      c.id === conversaId ? { ...c, naoLidas: 0 } : c
    ));
  };

  const enviarMensagem = async () => {
    if (!novaMensagem.trim() || !conversaSelecionada) return;
    
    const mensagem = {
      id: Date.now(),
      remetenteId: usuarioAtual?.id || 1,
      remetente: 'Você',
      conteudo: novaMensagem,
      dataEnvio: new Date(),
      lida: false
    };

    // TODO: Enviar via WebSocket ou API
    // await api.post(`/api/chat/conversas/${conversaSelecionada.id}/mensagens`, mensagem);
    // ou
    // ws.send(JSON.stringify(mensagem));

    setMensagens([...mensagens, mensagem]);
    setNovaMensagem('');

    // Atualizar última mensagem na lista de conversas
    setConversas(conversas.map(c => 
      c.id === conversaSelecionada.id 
        ? { ...c, ultimaMensagem: novaMensagem, dataUltimaMensagem: new Date() }
        : c
    ));
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      enviarMensagem();
    }
  };

  const formatarHora = (data) => {
    return new Date(data).toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatarDataUltimaMensagem = (data) => {
    const hoje = new Date();
    const dataMsg = new Date(data);
    const diffDias = Math.floor((hoje - dataMsg) / (1000 * 60 * 60 * 24));
    
    if (diffDias === 0) {
      return formatarHora(data);
    } else if (diffDias === 1) {
      return 'Ontem';
    } else if (diffDias < 7) {
      return dataMsg.toLocaleDateString('pt-BR', { weekday: 'short' });
    } else {
      return dataMsg.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
    }
  };

  const conversasFiltradas = conversas.filter(c =>
    c.clienteNome.toLowerCase().includes(busca.toLowerCase())
  );

  const clientesFiltrados = clientesAtivos.filter(c =>
    c.nome.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <LayoutPrincipal paginaAtiva="chat">
      <div className="chat-container">
        {/* Painel lateral - Lista de conversas/clientes */}
        {isAdmin && (
          <div className="chat-sidebar">
            <div className="chat-sidebar-header">
            <div className="chat-tabs">
              <button 
                className={`chat-tab ${abaAtiva === 'conversas' ? 'active' : ''}`}
                onClick={() => setAbaAtiva('conversas')}
              >
                💬
                Conversas
                {conversas.filter(c => c.naoLidas > 0).length > 0 && (
                  <span className="badge">
                    {conversas.reduce((total, c) => total + c.naoLidas, 0)}
                  </span>
                )}
              </button>
              <button 
                className={`chat-tab ${abaAtiva === 'clientes' ? 'active' : ''}`}
                onClick={() => setAbaAtiva('clientes')}
              >
                👥
                Clientes
                <span className="badge-success">
                  {clientesAtivos.filter(c => c.online).length}
                </span>
              </button>
            </div>
            <div className="chat-search">
              <span className="search-icon">🔍</span>
              <input 
                type="text" 
                placeholder={abaAtiva === 'conversas' ? 'Buscar conversas...' : 'Buscar clientes...'}
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
              />
            </div>
          </div>

          <div className="chat-list">
            {abaAtiva === 'conversas' ? (
              conversasFiltradas.length > 0 ? (
                conversasFiltradas.map(conversa => (
                  <div 
                    key={conversa.id}
                    className={`chat-item ${conversaSelecionada?.id === conversa.id ? 'active' : ''}`}
                    onClick={() => selecionarConversa(conversa)}
                  >
                    <div className="chat-item-avatar">
                      <div className="avatar">
                        {conversa.clienteFoto ? (
                          <img src={conversa.clienteFoto} alt={conversa.clienteNome} />
                        ) : (
                          <span className="avatar-icon">👤</span>
                        )}
                      </div>
                      {conversa.online && <span className="status-indicator online"></span>}
                    </div>
                    <div className="chat-item-content">
                      <div className="chat-item-header">
                        <h4>{conversa.clienteNome}</h4>
                        <span className="chat-time">{formatarDataUltimaMensagem(conversa.dataUltimaMensagem)}</span>
                      </div>
                      <div className="chat-item-preview">
                        <p>{conversa.ultimaMensagem}</p>
                        {conversa.naoLidas > 0 && (
                          <span className="unread-badge">{conversa.naoLidas}</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-state">
                  <span className="empty-icon">💬</span>
                  <p>Nenhuma conversa encontrada</p>
                </div>
              )
            ) : (
              clientesFiltrados.length > 0 ? (
                clientesFiltrados.map(cliente => (
                  <div 
                    key={cliente.id}
                    className="chat-item"
                    onClick={() => iniciarNovaConversa(cliente)}
                  >
                    <div className="chat-item-avatar">
                      <div className="avatar">
                        <span className="avatar-icon">👤</span>
                      </div>
                      {cliente.online && <span className="status-indicator online"></span>}
                    </div>
                    <div className="chat-item-content">
                      <div className="chat-item-header">
                        <h4>{cliente.nome}</h4>
                        <span className={`status-text ${cliente.online ? 'online' : 'offline'}`}>
                          {cliente.online ? 'Online' : 'Offline'}
                        </span>
                      </div>
                      {!cliente.online && (
                        <div className="chat-item-preview">
                          <p className="last-seen">
                            Visto {formatarDataUltimaMensagem(cliente.ultimoAcesso)}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-state">
                  <span className="empty-icon">👥</span>
                  <p>Nenhum cliente encontrado</p>
                </div>
              )
            )}
          </div>
        </div>
        )}

        {/* Área de mensagens */}
        <div className="chat-main">
          {conversaSelecionada ? (
            <>
              {/* Cabeçalho da conversa */}
              <div className="chat-header">
                <div className="chat-header-info">
                  <div className="chat-item-avatar">
                    <div className="avatar">
                      {conversaSelecionada.clienteFoto ? (
                        <img src={conversaSelecionada.clienteFoto} alt={conversaSelecionada.clienteNome} />
                      ) : (
                        <span className="avatar-icon">👤</span>
                      )}
                    </div>
                    {conversaSelecionada.online && <span className="status-indicator online"></span>}
                  </div>
                  <div>
                    <h3>{conversaSelecionada.clienteNome}</h3>
                    <span className={`status-text ${conversaSelecionada.online ? 'online' : 'offline'}`}>
                      {conversaSelecionada.online ? 'Online' : 'Offline'}
                    </span>
                  </div>
                </div>
                {/* Removido botões de ação do header para simplificar */}
              </div>

              {/* Área de mensagens */}
              <div className="chat-messages">
                {mensagens.length > 0 ? (
                  mensagens.map(mensagem => (
                    <div 
                      key={mensagem.id}
                      className={`message ${mensagem.remetenteId === (usuarioAtual?.id || 1) ? 'sent' : 'received'}`}
                    >
                      <div className="message-content">
                        {mensagem.remetenteId !== (usuarioAtual?.id || 1) && (
                          <span className="message-sender">{mensagem.remetente}</span>
                        )}
                        <p>{mensagem.conteudo}</p>
                        <span className="message-time">
                          {formatarHora(mensagem.dataEnvio)}
                          {mensagem.remetenteId === (usuarioAtual?.id || 1) && (
                            <span className="material-icons message-status">
                              {mensagem.lida ? 'done_all' : 'done'}
                            </span>
                          )}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="empty-messages">
                    <span className="empty-icon">💬</span>
                    <p>Nenhuma mensagem ainda</p>
                    <p className="text-muted">Envie a primeira mensagem para iniciar a conversa</p>
                  </div>
                )}
                <div ref={mensagensEndRef} />
              </div>

              {/* Input de mensagem */}
              <div className="chat-input-area">
                <textarea
                  placeholder="Digite sua mensagem..."
                  value={novaMensagem}
                  onChange={(e) => setNovaMensagem(e.target.value)}
                  onKeyPress={handleKeyPress}
                  rows="1"
                />
                <button 
                  className="send-button"
                  onClick={enviarMensagem}
                  disabled={!novaMensagem.trim()}
                  title="Enviar mensagem"
                >
                  ➤
                </button>
              </div>
            </>
          ) : (
            <div className="chat-empty">
              <span className="empty-icon">💬</span>
              <h3>Selecione uma conversa</h3>
              <p>Escolha uma conversa da lista ou inicie um novo chat com um cliente</p>
            </div>
          )}
        </div>
      </div>
    </LayoutPrincipal>
  );
};

export default Chat;
