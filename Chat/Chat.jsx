import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import LayoutPrincipal from '../LayoutPrincipal/LayoutPrincipal';
import apiService from '../services/api';
import wsService from '../services/websocket';
import { useChat } from '../contexts/ChatContext';
import './Chat.css';

const Chat = () => {
  const location = useLocation();
  
  // Torna o contexto opcional para não quebrar se ChatProvider não estiver configurado
  let marcarTodasComoLidas;
  try {
    const chatContext = useChat();
    marcarTodasComoLidas = chatContext.marcarTodasComoLidas;
  } catch (error) {
    // ChatProvider não está configurado, usa função vazia
    marcarTodasComoLidas = () => {};
  }
  
  const [conversas, setConversas] = useState([]);
  const [conversaSelecionada, setConversaSelecionada] = useState(null);
  const conversaSelecionadaRef = useRef(null); // Ref para manter estado atualizado no WebSocket
  const [mensagens, setMensagens] = useState([]);
  const [clientesAtivosCount, setClientesAtivosCount] = useState(0);
  const [novaMensagem, setNovaMensagem] = useState('');
  const [busca, setBusca] = useState('');
  const [abaAtiva, setAbaAtiva] = useState('conversas'); // 'conversas' ou 'clientes'
  const [clientesAtivos, setClientesAtivos] = useState([]);
  const mensagensEndRef = useRef(null);
  const [usuarioAtual, setUsuarioAtual] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [paginaAtual, setPaginaAtual] = useState(0);
  const [temMaisMensagens, setTemMaisMensagens] = useState(true);
  const [carregando, setCarregando] = useState(false);
  const [wsConectado, setWsConectado] = useState(false);
  const chatMessagesRef = useRef(null);
  const [mensagemParaDeletar, setMensagemParaDeletar] = useState(null); // Modal de confirmação
  const [swipedMessageId, setSwipedMessageId] = useState(null); // Mensagem com swipe ativo
  const [mostrarModalLimparConversa, setMostrarModalLimparConversa] = useState(false); // Modal para limpar conversa

  // Inicialização: carregar dados do usuário e configurar WebSocket
  useEffect(() => {
    // Obter dados do usuário logado
    const usuarioLogado = JSON.parse(localStorage.getItem('usuario') || '{}');
    const userEmail = localStorage.getItem('userEmail') || '';
    const userRole = localStorage.getItem('role') || '';
    const token = localStorage.getItem('authToken');
    
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

    // Marca todas como lidas ao entrar no chat
    marcarTodasComoLidas();
    console.log('✅ Mensagens marcadas como lidas ao entrar no chat');

    // Carregar conversas existentes
    carregarConversas(adminStatus);
    
    // Polling para atualizar lista de clientes a cada 3 segundos
    let pollingInterval = null;
    if (adminStatus) {
      carregarClientesAtivos();
      
      pollingInterval = setInterval(() => {
        carregarClientesAtivos();
      }, 3000);
    }

    // Configurar WebSocket para mensagens em tempo real com STOMP + SockJS
    console.log('🔌 Conectando WebSocket STOMP...');
    wsService.connect(token);

    // Handler para mensagens recebidas
    const removeMessageHandler = wsService.onMessage((mensagem) => {
      console.log('📩 Nova mensagem via WebSocket:', mensagem);
      handleNovaMensagemRecebida(mensagem);
    });

    // Handler para mudanças de conexão
    const removeConnectionHandler = wsService.onConnectionChange((conectado) => {
      console.log('🔌 Status WebSocket:', conectado ? 'Conectado' : 'Desconectado');
      setWsConectado(conectado);
    });

    // Cleanup ao desmontar componente
    return () => {
      if (pollingInterval) clearInterval(pollingInterval);
      removeMessageHandler();
      removeConnectionHandler();
      wsService.disconnect();
    };
  }, []);

  // Scroll automático para última mensagem
  useEffect(() => {
    mensagensEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mensagens]);

  // Recarrega conversas quando volta para a página do chat
  useEffect(() => {
    if (isAdmin) {
      console.log('🔄 Voltou para página do chat - recarregando conversas');
      carregarConversas(true);
    }
  }, []); // Só executa quando monta o componente

  // Detecta navegação via notificação e abre a conversa automaticamente
  useEffect(() => {
    if (location.state?.conversaId && location.state?.clienteId) {
      const { conversaId, clienteId } = location.state;
      console.log('🔔 Abrindo conversa da notificação:', { conversaId, clienteId });
      
      // Aguarda as conversas carregarem
      setTimeout(() => {
        const conversa = conversas.find(c => c.id === conversaId || c.clienteId === clienteId);
        if (conversa) {
          selecionarConversa(conversa);
          setAbaAtiva('mensagens');
        } else {
          // Se não encontrou conversa, tenta buscar mensagens diretamente
          carregarMensagens(conversaId, clienteId);
        }
      }, 500);
      
      // Limpa o state da navegação
      window.history.replaceState({}, document.title);
    }
  }, [location.state, conversas]);

  const carregarConversas = async (isAdminUser) => {
    try {
      if (isAdminUser) {
        // Admin: busca lista de clientes que têm mensagens
        console.log('📋 Buscando lista de usuários para conversas...');
        
        const usuarios = await apiService.usuarios.listar();
        console.log('👥 Usuários recebidos:', usuarios);
        
        // Filtra apenas clientes (remove todos os admins)
        const clientes = usuarios.filter(u => {
          const tipo = String(u.tipo || u.role || u.perfil || '').toUpperCase();
          const email = String(u.email || '').toUpperCase();
          
          // Remove se for admin OU se for o email administrativo
          const isAdmin = tipo === 'ADMIN' || 
                         tipo === 'ADMINISTRADOR' || 
                         email === 'ADM@GMAIL.COM';
          
          return !isAdmin;
        });
        
        console.log('👤 Clientes filtrados (sem admins):', clientes.length);
        
        // Para cada cliente, busca a última mensagem (se houver)
        const conversasPromises = clientes.map(async (cliente) => {
          try {
            const userId = localStorage.getItem('usuarioId') || usuarioAtual?.id;
            // Busca TODAS as páginas para pegar a mensagem mais recente
            // Primeiro, pega info da primeira página para saber quantas páginas existem
            const primeiraResposta = await apiService.chat.listarMensagens(cliente.id, userId, 0, 20);
            
            if (!primeiraResposta.content || primeiraResposta.totalElements === 0) {
              console.log(`ℹ️ Cliente ${cliente.nome} sem mensagens - não incluído em conversas`);
              return null;
            }
            
            // Como backend retorna do mais antigo ao mais novo, a ÚLTIMA página tem as mensagens mais recentes
            const ultimaPagina = primeiraResposta.totalPages - 1;
            const msgResponse = ultimaPagina > 0 
              ? await apiService.chat.listarMensagens(cliente.id, userId, ultimaPagina, 20)
              : primeiraResposta;
            
            // Pega a ÚLTIMA mensagem do array (mais recente)
            const ultimaMensagem = msgResponse.content[msgResponse.content.length - 1];
            
            // Conta mensagens não lidas deste cliente
            // IMPORTANTE: Só conta mensagens que o CLIENTE enviou e que NÃO foram lidas pelo ADMIN
            let naoLidas = 0;
            const adminId = parseInt(localStorage.getItem('usuarioId'));
            
            // Percorre todas as páginas para contar mensagens não lidas
            for (let pagina = 0; pagina < primeiraResposta.totalPages; pagina++) {
              const paginaMsg = pagina === 0 ? primeiraResposta : await apiService.chat.listarMensagens(cliente.id, userId, pagina, 20);
              const naoLidasNaPagina = paginaMsg.content.filter(msg => {
                // Mensagem não lida E foi enviada PELO CLIENTE (não pelo admin)
                const foiEnviadaPeloCliente = msg.senderId === cliente.id || msg.remetenteId === cliente.id;
                const naoFoiLida = msg.situacao !== 'READ'; // Backend retorna 'READ' ou 'UNREAD'
                
                return naoFoiLida && foiEnviadaPeloCliente;
              }).length;
              naoLidas += naoLidasNaPagina;
            }
            
            console.log(`📊 Cliente ${cliente.nome} - Total não lidas: ${naoLidas}`);
            
            // Valida e formata a data
            let dataUltimaMensagem = new Date();
            if (ultimaMensagem.dataEnvio) {
              const dataTemp = new Date(ultimaMensagem.dataEnvio);
              if (!isNaN(dataTemp.getTime())) {
                dataUltimaMensagem = dataTemp;
              }
            }
            
            return {
              id: cliente.id,
              clienteId: cliente.id,
              clienteNome: cliente.nome || cliente.email,
              clienteFoto: null,
              ultimaMensagem: ultimaMensagem.conteudo,
              dataUltimaMensagem: dataUltimaMensagem,
              naoLidas: naoLidas
            };
          } catch (err) {
            // Se houver erro (ex: cliente sem mensagens), não inclui na lista
            console.log(`ℹ️ Cliente ${cliente.nome} sem mensagens ou erro ao buscar`);
            return null;
          }
        });
        
        const todasConversas = await Promise.all(conversasPromises);
        
        // Filtra apenas conversas que existem (remove null)
        const conversasComMensagens = todasConversas.filter(c => c !== null);
        
        console.log('💬 Conversas com mensagens:', conversasComMensagens.length);
        setConversas(conversasComMensagens);
        
      } else {
        // Cliente vê apenas conversa com o Admin
        console.log('👤 Carregando conversa do cliente com admin...');
        
        try {
          const usuarios = await apiService.usuarios.listar();
          const admin = usuarios.find(u => {
            const tipo = String(u.tipo || u.role || '').toUpperCase();
            const email = String(u.email || '').toUpperCase();
            return tipo === 'ADMIN' || email === 'ADM@GMAIL.COM';
          });
          
          const adminId = admin?.id || 1;
          const adminNome = admin?.nome || 'Administrador';
          
          console.log('📬 Admin encontrado:', adminId, adminNome);
          
          // Busca mensagens do cliente logado
          const userId = parseInt(localStorage.getItem('usuarioId'));
          const msgResponse = await apiService.chat.listarMensagens(adminId, userId, 0, 1);
          const ultimaMensagem = msgResponse.content?.[0];
          
          console.log('💬 Última mensagem do cliente:', ultimaMensagem);
          
          const conversaAdmin = {
            id: adminId,
            clienteId: adminId,
            clienteNome: adminNome,
            clienteFoto: null,
            ultimaMensagem: ultimaMensagem?.conteudo || 'Sem mensagens',
            dataUltimaMensagem: ultimaMensagem?.dataEnvio || new Date(),
            naoLidas: 0,
            online: adminOnline
          };
          setConversas([conversaAdmin]);
          
          // Auto-selecionar a conversa com o admin
          setTimeout(() => {
            selecionarConversa(conversaAdmin);
          }, 100);
        } catch (err) {
          console.error('❌ Erro ao buscar admin:', err);
          
          // Busca mensagens do cliente logado mesmo sem achar admin
          try {
            const userId = parseInt(localStorage.getItem('usuarioId'));
            const adminId = 1; // Fallback para admin ID 1
            const msgResponse = await apiService.chat.listarMensagens(adminId, userId, 0, 1);
            const ultimaMensagem = msgResponse.content?.[0];
            
            const conversaAdminFallback = {
              id: 1,
              clienteId: 1,
              clienteNome: 'Administrador',
              clienteFoto: null,
              ultimaMensagem: ultimaMensagem?.conteudo || 'Sem mensagens',
              dataUltimaMensagem: ultimaMensagem?.dataEnvio || new Date(),
              naoLidas: 0,
              online: false
            };
            setConversas([conversaAdminFallback]);
            setTimeout(() => {
              selecionarConversa(conversaAdminFallback);
            }, 100);
          } catch (msgErr) {
            console.error('❌ Erro ao buscar mensagens:', msgErr);
          }
        }
      }
    } catch (error) {
      console.error('❌ Erro ao carregar conversas:', error);
    }
  };

  const carregarClientesAtivos = async () => {
    try {
      console.log('👥 Buscando clientes ativos...');
      
      const usuarios = await apiService.usuarios.listar();
      console.log('📋 Usuários recebidos:', usuarios);
      
      // Filtra apenas clientes (remove todos os admins)
      const clientes = usuarios
        .filter(u => {
          const tipo = String(u.tipo || u.role || u.perfil || '').toUpperCase();
          const email = String(u.email || '').toUpperCase();
          
          // Remove se for admin OU se for o email administrativo
          const isAdmin = tipo === 'ADMIN' || 
                         tipo === 'ADMINISTRADOR' || 
                         email === 'ADM@GMAIL.COM';
          
          if (isAdmin) {
            console.log(`🚫 Removendo admin da lista de clientes: ${u.nome || u.email}`);
          }
          
          return !isAdmin;
        })
        .map(u => ({
          id: u.id,
          nome: u.nome || u.email,
          ultimoAcesso: new Date()
        }));
      
      console.log('✅ Clientes ativos (sem admins):', clientes.length);
      setClientesAtivos(clientes);
      setClientesAtivosCount(clientes.length);
      
      // Atualiza status online nas conversas existentes
      setConversas(prev => prev.map(conversa => {
        const clienteAtualizado = clientes.find(c => c.id === conversa.clienteId);
        if (clienteAtualizado) {
          return conversa;
        }
        return conversa;
      }));
    } catch (error) {
      console.error('❌ Erro ao buscar clientes ativos:', error);
    }
  };

  const carregarMensagens = async (conversaId, clienteId, pagina = null) => {
    try {
      setCarregando(true);
      
      // Obtém userId uma vez no início
      const userId = parseInt(localStorage.getItem('usuarioId') || usuarioAtual?.id);
      
      // WORKAROUND: Backend retorna mensagens antigas primeiro
      // Se pagina não especificada, busca ÚLTIMA página (mensagens mais recentes)
      let paginaParaBuscar = pagina;
      
      if (pagina === null || pagina === 0) {
        // Primeiro, busca quantas páginas existem
        const tempResponse = await apiService.chat.listarMensagens(clienteId, userId, 0, 20);
        const ultimaPagina = tempResponse.totalPages - 1;
        paginaParaBuscar = ultimaPagina >= 0 ? ultimaPagina : 0;
        console.log(`📄 Backend tem ${tempResponse.totalPages} páginas, buscando última (${paginaParaBuscar})`);
      }
      
      console.log(`📬 Buscando mensagens do cliente ${clienteId}, página ${paginaParaBuscar}...`);
      
      // Usa a API real para buscar mensagens
      const response = await apiService.chat.listarMensagens(clienteId, userId, paginaParaBuscar, 20);
      
      console.log('📬 Resposta completa:', response);
      console.log('📬 Total de mensagens:', response.totalElements);
      console.log('📬 Conteúdo:', response.content);
      
      // Backend retorna: { content: [...], totalElements, totalPages, page, size }
      let novasMensagens = response.content || response;
      
      // Mapeia mensagens para adicionar campos que faltam
      novasMensagens = novasMensagens.map((msg, index) => {
        // Determina o remetente corretamente
        let remetente;
        if (msg.senderId === userId) {
          remetente = 'Você';
        } else if (isAdmin) {
          // Se eu sou admin, o outro é o cliente
          remetente = conversaSelecionada?.clienteNome || 'Cliente';
        } else {
          // Se eu sou cliente, o outro é o admin
          remetente = 'ADM';
        }
        
        const mensagemProcessada = {
          ...msg,
          // Usa ID real do backend (prioridade) ou gera único com timestamp
          id: msg.id || msg.messageId || `msg-${clienteId}-${paginaParaBuscar}-${index}-${Date.now()}`,
          dataEnvio: msg.dataEnvio || msg.dataCriacao || new Date(),
          lida: msg.lida || false,
          remetente
        };
        
        // Log primeira mensagem para debug
        if (index === 0) {
          console.log('📋 Processando primeira mensagem:', {
            senderId: msg.senderId,
            userId,
            isAdmin,
            remetente,
            mensagem: mensagemProcessada
          });
        }
        
        return mensagemProcessada;
      });
      
      console.log('📬 Mensagens processadas:', novasMensagens.length);
      console.log('📬 Primeira mensagem:', novasMensagens[0]);
      
      // Se for primeira carga (pagina null), substitui. Senão, adiciona mensagens antigas ANTES
      if (pagina === null || pagina === response.totalPages - 1) {
        setMensagens(novasMensagens);
        console.log('✅ Mensagens setadas no estado (última página)!');
      } else {
        // Paginação para trás: adiciona mensagens antigas ANTES das atuais
        setMensagens(prev => [...novasMensagens, ...prev]);
        console.log('✅ Mensagens antigas adicionadas ANTES!');
      }
      
      // Verifica se tem mais páginas para carregar (indo para trás)
      setTemMaisMensagens(paginaParaBuscar > 0);
      setPaginaAtual(paginaParaBuscar);
      
    } catch (error) {
      console.error('❌ Erro ao carregar mensagens:', error);
      // Em caso de erro, usa dados mockados como fallback
      usarMensagensMockadas();
    } finally {
      setCarregando(false);
    }
  };

  const usarMensagensMockadas = () => {
    const mensagensMock = [
      {
        id: 1,
        senderId: 101,
        clienteId: usuarioAtual?.id || 1,
        remetente: 'João Silva',
        conteudo: 'Olá, boa tarde!',
        dataEnvio: new Date(Date.now() - 7200000),
        lida: true
      },
      {
        id: 2,
        senderId: usuarioAtual?.id || 1,
        clienteId: 101,
        remetente: 'Você',
        conteudo: 'Boa tarde, João! Como posso ajudar?',
        dataEnvio: new Date(Date.now() - 7000000),
        lida: true
      },
      {
        id: 3,
        senderId: 101,
        clienteId: usuarioAtual?.id || 1,
        remetente: 'João Silva',
        conteudo: 'Gostaria de reagendar minha consulta de amanhã, se possível.',
        dataEnvio: new Date(Date.now() - 3600000),
        lida: true
      }
    ];
    setMensagens(mensagensMock);
  };

  const selecionarConversa = (conversa) => {
    console.log('🔍 Conversa selecionada:', conversa);
    setConversaSelecionada(conversa);
    conversaSelecionadaRef.current = conversa; // Atualiza ref também
    setPaginaAtual(0);
    setTemMaisMensagens(true);
    
    console.log('📞 Chamando carregarMensagens com:', {
      conversaId: conversa.id,
      clienteId: conversa.clienteId,
      pagina: 0
    });
    
    carregarMensagens(conversa.id, conversa.clienteId, 0);
    
    // SEMPRE marcar mensagens como lidas quando abre a conversa
    console.log(`📖 Marcando todas as mensagens de ${conversa.clienteNome} como lidas`);
    marcarComoLida(conversa.clienteId);
  };

  const iniciarNovaConversa = (cliente) => {
    console.log('🆕 Iniciando nova conversa com:', cliente);
    
    // Verificar se já existe conversa com este cliente
    const conversaExistente = conversas.find(c => c.clienteId === cliente.id);
    
    if (conversaExistente) {
      console.log('✅ Conversa já existe, selecionando...');
      selecionarConversa(conversaExistente);
      setAbaAtiva('conversas');
    } else {
      console.log('🆕 Criando nova conversa...');
      // Criar nova conversa
      const novaConversa = {
        id: cliente.id,
        clienteId: cliente.id,
        clienteNome: cliente.nome,
        clienteFoto: null,
        ultimaMensagem: 'Iniciar conversa',
        dataUltimaMensagem: new Date(),
        naoLidas: 0,
        online: cliente.online
      };
      
      setConversas([novaConversa, ...conversas]);
      setConversaSelecionada(novaConversa);
      setMensagens([]); // Começa sem mensagens
      setAbaAtiva('mensagens');
      console.log('✅ Nova conversa criada e selecionada!');
    }
  };

  const marcarComoLida = async (clienteId) => {
    try {
      console.log(`📖 Marcando mensagens do cliente ${clienteId} como lidas`);
      console.log(`🔗 Endpoint que será chamado: PUT /mensagem/lidas?idCliente=${clienteId}`);
      
      // Marca todas as mensagens do cliente como lidas
      const resultado = await apiService.chat.marcarVariasComoLidas(clienteId);
      
      console.log(`✅ Resposta do backend:`, resultado);
      console.log(`✅ Mensagens marcadas com sucesso - zerando contador`);
      
      setConversas(conversas.map(c => 
        c.clienteId === clienteId ? { ...c, naoLidas: 0 } : c
      ));
      
      // Atualiza contador global
      marcarTodasComoLidas();
      
    } catch (error) {
      console.error('❌ Erro ao marcar mensagens como lidas:', error);
      console.error('❌ Detalhes do erro:', error.message);
    }
  };

  const deletarMensagem = async (mensagemId) => {
    try {
      console.log(`🗑️ Deletando mensagem ${mensagemId}`);
      
      const userId = localStorage.getItem('usuarioId') || usuarioAtual?.id;
      await apiService.chat.deletarMensagem(mensagemId, userId);
      
      // Remove a mensagem da lista
      setMensagens(prev => prev.filter(m => m.id !== mensagemId));
      
      // Fecha o modal
      setMensagemParaDeletar(null);
      setSwipedMessageId(null);
      
      console.log('✅ Mensagem deletada com sucesso');
    } catch (error) {
      console.error('❌ Erro ao deletar mensagem:', error);
      alert('Erro ao deletar mensagem. Tente novamente.');
    }
  };

  const limparConversa = async () => {
    if (!conversaSelecionada) return;
    
    try {
      console.log(`🗑️ Limpando conversa do cliente ${conversaSelecionada.clienteId}`);
      
      const userId = localStorage.getItem('usuarioId') || usuarioAtual?.id;
      const conversaId = conversaSelecionada.clienteId;
      
      await apiService.chat.deletarVariasMensagens(conversaId, userId);
      
      // Limpa as mensagens da tela
      setMensagens([]);
      
      // Admin: Remove conversa da lista e desmarca
      // Cliente: Mantém conversa mas atualiza para "sem mensagens"
      if (isAdmin) {
        setConversas(prev => prev.filter(c => c.clienteId !== conversaId));
        setConversaSelecionada(null);
      } else {
        // Cliente mantém a conversa com admin mas sem mensagens
        setConversas(prev => prev.map(c => 
          c.clienteId === conversaId 
            ? { ...c, ultimaMensagem: 'Sem mensagens', naoLidas: 0 }
            : c
        ));
      }
      
      // Fecha o modal
      setMostrarModalLimparConversa(false);
      
      console.log('✅ Conversa limpa com sucesso');
    } catch (error) {
      console.error('❌ Erro ao limpar conversa:', error);
      alert('Erro ao limpar conversa. Tente novamente.');
    }
  };

  const enviarMensagem = async () => {
    if (!novaMensagem.trim() || !conversaSelecionada) return;
    
    const conteudoEnviado = novaMensagem; // Salva antes de limpar
    let mensagemOtimistaId = null;
    
    try {
      // Pega o ID do usuário do localStorage
      const userId = localStorage.getItem('usuarioId') || usuarioAtual?.id;
      
      if (!userId) {
        console.error('❌ ID do usuário não encontrado!');
        alert('Erro: Usuário não identificado. Faça login novamente.');
        return;
      }
      
      console.log('📤 Enviando mensagem com:', {
        clienteId: conversaSelecionada.clienteId,
        senderId: userId,
        conteudo: conteudoEnviado,
        isAdmin,
        conversaSelecionada
      });
      
      // Adiciona mensagem OTIMISTICAMENTE (aparece instantaneamente)
      mensagemOtimistaId = `temp-${Date.now()}`;
      const mensagemOtimista = {
        id: mensagemOtimistaId,
        senderId: parseInt(userId),
        clienteId: conversaSelecionada.clienteId,
        conteudo: conteudoEnviado,
        dataEnvio: new Date(),
        lida: false,
        remetente: 'Você'
      };
      
      console.log('✅ Adicionando mensagem otimista:', mensagemOtimista);
      setMensagens(prev => {
        const novaLista = [...prev, mensagemOtimista];
        console.log('📋 Lista de mensagens após adicionar:', novaLista.length, 'mensagens');
        return novaLista;
      });
      
      // Limpa o campo de texto imediatamente
      setNovaMensagem('');
      
      // Backend usa: clienteId (destinatário) e senderId (remetente)
      const mensagemData = {
        clienteId: conversaSelecionada.clienteId,
        senderId: parseInt(userId),
        conteudo: conteudoEnviado,
        situacao: 'OFFLINE' // Por enquanto sempre OFFLINE até backend retornar status
      };

      console.log('🚀 ENVIANDO PARA BACKEND:', mensagemData);
      console.log('📋 Contexto:', {
        isAdmin,
        euSouCliente: !isAdmin,
        meuId: parseInt(userId),
        conversaClienteId: conversaSelecionada.clienteId
      });

      // Enviar via API (em segundo plano)
      const response = await apiService.chat.enviarMensagem(mensagemData);
      console.log('✅ Mensagem salva no backend:', response);
      console.log('✅ RESPOSTA COMPLETA:', JSON.stringify(response, null, 2));

      // Atualizar última mensagem na lista de conversas
      setConversas(conversas.map(c => 
        c.id === conversaSelecionada.id 
          ? { ...c, ultimaMensagem: conteudoEnviado, dataUltimaMensagem: new Date() }
          : c
      ));

      // WebSocket vai trazer a mensagem de volta automaticamente
      // Não precisa recarregar manualmente

    } catch (error) {
      console.error('❌ Erro ao enviar mensagem:', error);
      alert('Erro ao enviar mensagem. Tente novamente.');
      
      // Remove a mensagem otimista em caso de erro
      if (mensagemOtimistaId) {
        setMensagens(prev => prev.filter(m => m.id !== mensagemOtimistaId));
      }
    }
  };

  // Handler para mensagens recebidas via WebSocket
  const handleNovaMensagemRecebida = (mensagem) => {
    console.log('📩 Nova mensagem recebida via WebSocket:', mensagem);
    console.log('📩 conversaSelecionada (ref):', conversaSelecionadaRef.current);
    
    const userId = localStorage.getItem('usuarioId') || usuarioAtual?.id;
    const userIdInt = parseInt(userId);
    console.log('📩 userId atual:', userIdInt);
    
    // Usa REF para pegar o valor atualizado
    const conversaAtual = conversaSelecionadaRef.current;
    
    // Verifica se a mensagem é da conversa atual
    // LÓGICA:
    // - Se EU enviei (senderId === userIdInt), a mensagem pertence à conversa que estou vendo
    // - Se OUTRA PESSOA enviou, verifica se o senderId é o cliente da conversa
    const isConversaAtual = conversaAtual && (
      mensagem.senderId === userIdInt || // Eu enviei
      mensagem.senderId === conversaAtual.clienteId // O cliente da conversa enviou
    );
    
    console.log('🔍 É da conversa atual?', isConversaAtual, {
      conversaAtual: conversaAtual?.clienteNome,
      conversaClienteId: conversaAtual?.clienteId,
      senderId: mensagem.senderId,
      userIdInt,
      euEnviei: mensagem.senderId === userIdInt,
      clienteEnviou: mensagem.senderId === conversaAtual?.clienteId
    });
    
    if (isConversaAtual) {
      // Remove mensagem otimista temporária se esta for a versão real do backend
      setMensagens(prev => {
        // Se for minha própria mensagem vindo do WebSocket, remove a versão otimista temporária
        if (mensagem.senderId === userIdInt) {
          console.log('🔄 Substituindo mensagem otimista pela real do backend');
          // Remove qualquer mensagem temporária com o mesmo conteúdo
          const semTemporarias = prev.filter(m => 
            !(m.id.toString().startsWith('temp-') && m.conteudo === mensagem.conteudo)
          );
          
          // Adiciona a mensagem real do backend
          const mensagemCompleta = {
            ...mensagem,
            id: mensagem.id || `ws-${Date.now()}-${Math.random()}`,
            dataEnvio: mensagem.dataEnvio || new Date(),
            lida: mensagem.lida || false,
            remetente: 'Você'
          };
          
          return [...semTemporarias, mensagemCompleta];
        } else {
          // Mensagem de outra pessoa - adiciona normalmente
          const mensagemCompleta = {
            ...mensagem,
            id: mensagem.id || `ws-${Date.now()}-${Math.random()}`,
            dataEnvio: mensagem.dataEnvio || new Date(),
            lida: mensagem.lida || false,
            remetente: conversaAtual?.clienteNome || 'Cliente'
          };
          
          console.log('📩 Adicionando mensagem recebida:', mensagemCompleta);
          return [...prev, mensagemCompleta];
        }
      });

      // Marca como lida se a conversa está aberta e não foi eu quem enviou
      if (mensagem.senderId !== userIdInt) {
        console.log('📖 Marcando mensagem como lida');
        apiService.chat.marcarComoLida(mensagem.id, userIdInt)
          .catch(err => console.error('Erro ao marcar como lida:', err));
      }
    }

    // Atualiza lista de conversas SEMPRE (mesmo que não seja a conversa atual)
    setConversas(prev => {
      console.log('🔄 Atualizando lista de conversas com mensagem:', {
        senderId: mensagem.senderId,
        clienteId: mensagem.clienteId,
        userIdInt,
        isAdmin
      });
      
      // Identifica o ID do cliente (quem não sou eu)
      const clienteIdDaMensagem = mensagem.senderId === userIdInt 
        ? mensagem.clienteId  // Eu enviei, então cliente é o destinatário
        : mensagem.senderId;  // Outra pessoa enviou, então ela é o cliente
      
      console.log('👤 Meu ID:', userIdInt, 'Cliente ID da mensagem:', clienteIdDaMensagem);
      
      const conversaIndex = prev.findIndex(c => c.clienteId === clienteIdDaMensagem);

      if (conversaIndex >= 0) {
        const updated = [...prev];
        const conversaAnterior = updated[conversaIndex];
        
        // Valida a data antes de criar o objeto Date
        let dataAtualizada = new Date();
        if (mensagem.dataEnvio) {
          const dataTemp = new Date(mensagem.dataEnvio);
          if (!isNaN(dataTemp.getTime())) {
            dataAtualizada = dataTemp;
          }
        }
        
        updated[conversaIndex] = {
          ...conversaAnterior,
          ultimaMensagem: mensagem.conteudo,
          dataUltimaMensagem: dataAtualizada,
          naoLidas: isConversaAtual ? 0 : (conversaAnterior.naoLidas || 0) + 1
        };
        
        console.log('✅ Conversa atualizada:', updated[conversaIndex].clienteNome, {
          ultimaMensagem: mensagem.conteudo,
          naoLidas: updated[conversaIndex].naoLidas
        });
        
        // Move conversa atualizada para o topo
        const conversaAtualizada = updated.splice(conversaIndex, 1)[0];
        return [conversaAtualizada, ...updated];
      }
      
      // ✅ Conversa não existe - ADICIONA DE VOLTA (foi deletada antes)
      console.log('⚠️ Conversa não encontrada na lista - Adicionando de volta. Cliente ID:', clienteIdDaMensagem);
      console.log('📋 Conversas existentes:', prev.map(c => ({ id: c.clienteId, nome: c.clienteNome })));
      
      // Cria conversa IMEDIATAMENTE com dados básicos
      const novaConversa = {
        id: clienteIdDaMensagem,
        clienteId: clienteIdDaMensagem,
        clienteNome: isAdmin ? `Cliente ${clienteIdDaMensagem}` : 'Administrador', // Admin vê "Cliente", Cliente vê "Administrador"
        clienteFoto: null,
        ultimaMensagem: mensagem.conteudo,
        dataUltimaMensagem: new Date(mensagem.dataEnvio || Date.now()),
        naoLidas: isConversaAtual ? 0 : 1,
        online: false
      };
      
      // Busca nome real em background
      apiService.usuarios.listar()
        .then(usuarios => {
          const usuario = usuarios.find(u => u.id === clienteIdDaMensagem);
          if (usuario) {
            setConversas(prevConv => 
              prevConv.map(c => 
                c.clienteId === clienteIdDaMensagem 
                  ? { ...c, clienteNome: usuario.nome } 
                  : c
              )
            );
            console.log('✅ Nome atualizado para:', usuario.nome);
          }
        })
        .catch(err => console.error('❌ Erro ao buscar nome:', err));
      
      console.log('✅ Conversa adicionada de volta:', novaConversa);
      return [novaConversa, ...prev];
    });
  };

  // Carregar mais mensagens (paginação)
  const carregarMaisMensagens = () => {
    if (!carregando && temMaisMensagens && conversaSelecionada) {
      // Carrega página ANTERIOR (indo para trás, mensagens antigas)
      carregarMensagens(conversaSelecionada.id, conversaSelecionada.clienteId, paginaAtual - 1);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      enviarMensagem();
    }
  };

  const formatarHora = (data) => {
    if (!data) return '--:--';
    try {
      return new Date(data).toLocaleTimeString('pt-BR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } catch (error) {
      return '--:--';
    }
  };

  const formatarDataUltimaMensagem = (data) => {
    if (!data) return 'Agora';
    
    const dataMsg = new Date(data);
    
    // Verifica se a data é válida
    if (isNaN(dataMsg.getTime())) {
      return 'Agora';
    }
    
    const hoje = new Date();
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

  // Log para debug
  console.log('🔄 Render - Estado atual:', {
    conversaSelecionada: conversaSelecionada?.clienteNome,
    totalMensagens: mensagens.length,
    mensagens: mensagens
  });

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
                  {clientesAtivosCount}
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
                    className={`chat-item ${conversaSelecionada?.id === conversa.id ? 'active' : ''} ${conversa.naoLidas > 0 ? 'has-unread' : ''}`}
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
                    </div>
                    <div className="chat-item-content">
                      <div className="chat-item-header">
                        <h4>{cliente.nome}</h4>
                      </div>
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
                  </div>
                  <div>
                    <h3>{conversaSelecionada.clienteNome}</h3>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                  {/* Botão para limpar conversa - Para admin e cliente */}
                  <button
                    onClick={() => setMostrarModalLimparConversa(true)}
                    style={{
                      padding: '8px 12px',
                      background: '#ff4444',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px'
                    }}
                    title="Limpar toda a conversa"
                  >
                    🗑️ Limpar Conversa
                  </button>
                  {/* Status do WebSocket */}
                  <div style={{ fontSize: '12px', color: wsConectado ? '#28a745' : '#dc3545' }}>
                    {wsConectado ? '🟢 Conectado' : '🔴 Desconectado'}
                  </div>
                </div>
              </div>

              {/* Área de mensagens */}
              <div className="chat-messages" ref={chatMessagesRef}>
                {/* Botão para carregar mensagens antigas - só mostra se tem mensagens */}
                {temMaisMensagens && mensagens.length > 0 && (
                  <div style={{ textAlign: 'center', padding: '10px' }}>
                    <button 
                      onClick={carregarMaisMensagens} 
                      disabled={carregando}
                      style={{
                        padding: '8px 16px',
                        background: '#007bff',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: carregando ? 'not-allowed' : 'pointer',
                        opacity: carregando ? 0.6 : 1
                      }}
                    >
                      {carregando ? '⏳ Carregando...' : '↑ Carregar mensagens antigas'}
                    </button>
                  </div>
                )}
                
                {/* Debug - verificar array */}
                {console.log('🎯 RENDER - Total mensagens:', mensagens.length, 'Array:', mensagens)}
                
                {mensagens.map(mensagem => {
                  const userId = localStorage.getItem('usuarioId') || usuarioAtual?.id;
                  const userIdInt = parseInt(userId);
                  const isMinhaMensagem = mensagem.senderId === userIdInt;
                  const isSwiped = swipedMessageId === mensagem.id;
                  
                  // Verifica se a mensagem tem ID numérico (salva no banco) - não permite deletar mensagens temporárias
                  const isIdNumerico = typeof mensagem.id === 'number' || (!String(mensagem.id).startsWith('ws-') && !String(mensagem.id).startsWith('msg-'));
                  const podeSerDeletada = isMinhaMensagem && mensagem.situacao !== 'READ' && isIdNumerico;
                  
                  // Debug cada mensagem
                  console.log('📨 Renderizando mensagem:', {
                    id: mensagem.id,
                    conteudo: mensagem.conteudo,
                    senderId: mensagem.senderId,
                    userId: userIdInt,
                    isMinhaMensagem,
                    remetente: mensagem.remetente
                  });
                  
                  return (
                    <div 
                      key={mensagem.id || Math.random()}
                      className={`message-wrapper ${isMinhaMensagem ? 'sent' : 'received'}`}
                      style={{ position: 'relative' }}
                    >
                      {/* Botão de deletar - APENAS para mensagens próprias, não lidas E que já foram salvas no banco */}
                      {isSwiped && podeSerDeletada && (
                        <button 
                          className="delete-message-btn"
                          onClick={() => setMensagemParaDeletar(mensagem)}
                          style={{
                            position: 'absolute',
                            right: '10px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            background: '#ff4444',
                            color: 'white',
                            border: 'none',
                            borderRadius: '50%',
                            width: '40px',
                            height: '40px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '18px',
                            zIndex: 1
                          }}
                        >
                          🗑️
                        </button>
                      )}
                      
                      <div 
                        className={`message ${isMinhaMensagem ? 'sent' : 'received'} ${isSwiped ? 'swiped' : ''}`}
                        onClick={() => podeSerDeletada ? setSwipedMessageId(isSwiped ? null : mensagem.id) : null}
                        style={{
                          cursor: podeSerDeletada ? 'pointer' : 'default',
                          transition: 'transform 0.2s ease',
                          transform: isSwiped && isMinhaMensagem ? 'translateX(-60px)' : 'translateX(0)'
                        }}
                      >
                        <div className="message-content">
                          {!isMinhaMensagem && (
                            <span className="message-sender">{mensagem.remetente || 'Cliente'}</span>
                          )}
                          <p style={{ margin: '0 0 6px 0' }}>{mensagem.conteudo}</p>
                          <span className="message-time">
                            {formatarHora(mensagem.dataEnvio)}
                            {isMinhaMensagem && (
                              <span className={`message-status-icon ${mensagem.lida ? 'read' : 'delivered'}`}>
                                {mensagem.lida ? '✓✓' : '✓'}
                              </span>
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
                
                {mensagens.length === 0 && (
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
              <h3>{abaAtiva === 'conversas' && conversasFiltradas.length === 0 ? 'Nenhuma conversa encontrada' : 'Selecione uma conversa'}</h3>
              <p>{abaAtiva === 'conversas' && conversasFiltradas.length === 0 ? 'Suas conversas aparecerão aqui' : 'Escolha uma conversa da lista ou inicie um novo chat com um cliente'}</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal de confirmação para deletar mensagem */}
      {mensagemParaDeletar && (
        <div className="modal-overlay" onClick={() => setMensagemParaDeletar(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Deletar Mensagem</h3>
            <p>Tem certeza que deseja deletar esta mensagem?</p>
            <p style={{ fontStyle: 'italic', color: '#666', marginTop: '10px' }}>
              "{mensagemParaDeletar.conteudo}"
            </p>
            <div className="modal-actions">
              <button 
                className="btn-cancel"
                onClick={() => setMensagemParaDeletar(null)}
              >
                Cancelar
              </button>
              <button 
                className="btn-delete"
                onClick={() => deletarMensagem(mensagemParaDeletar.id)}
              >
                Deletar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmação para limpar conversa inteira */}
      {mostrarModalLimparConversa && (
        <div className="modal-overlay" onClick={() => setMostrarModalLimparConversa(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>⚠️ Limpar Conversa</h3>
            <p>Tem certeza que deseja deletar TODAS as mensagens desta conversa?</p>
            <p style={{ fontWeight: 'bold', color: '#ff4444', marginTop: '10px' }}>
              Esta ação não pode ser desfeita!
            </p>
            <div className="modal-actions">
              <button 
                className="btn-cancel"
                onClick={() => setMostrarModalLimparConversa(false)}
              >
                Cancelar
              </button>
              <button 
                className="btn-delete"
                onClick={limparConversa}
              >
                Sim, Limpar Tudo
              </button>
            </div>
          </div>
        </div>
      )}
    </LayoutPrincipal>
  );
};

export default Chat;
