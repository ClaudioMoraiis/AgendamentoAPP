import { createContext, useContext, useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import wsService from '../services/websocket';
import apiService from '../services/api';

const ChatContext = createContext();

export function ChatProvider({ children }) {
  const [mensagensNaoLidas, setMensagensNaoLidas] = useState(0);
  const [ultimaMensagemRecebida, setUltimaMensagemRecebida] = useState(null);
  const [notificacoes, setNotificacoes] = useState([]);
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const userId = localStorage.getItem('usuarioId');
    const userType = localStorage.getItem('tipoUsuario');
    const userEmail = localStorage.getItem('userEmail') || '';
    
    // Verifica se é admin
    const isAdmin = userType === 'ADMIN' || 
                    userEmail.toUpperCase() === 'ADM@GMAIL.COM' ||
                    localStorage.getItem('role') === 'admin';
    
    if (!token || !userId) {
      console.log('❌ ChatContext: Sem token ou userId');
      return;
    }

    console.log(`🔔 ChatContext: Iniciando para ${isAdmin ? 'ADMIN' : 'CLIENTE'}`);

    // Carrega contagem inicial
    carregarMensagensNaoLidas();

    // Verifica se está na página do chat (tanto cliente /chat quanto admin /admin/chat)
    const isOnChatPage = location.pathname === '/chat' || location.pathname === '/admin/chat';
    console.log(`📍 Está na página do chat: ${isOnChatPage} (path: ${location.pathname})`);

    // Conecta ao WebSocket se NÃO estiver na página do chat
    // (Chat.jsx gerencia sua própria conexão)
    if (!isOnChatPage) {
      console.log('🔌 ChatContext: Conectando WebSocket...');
      wsService.connect(token);

      // Escuta novas mensagens
      const unsubscribe = wsService.onMessage((mensagem) => {
        console.log('🔔 Nova mensagem recebida no ChatContext:', mensagem);
        
        // Não notifica se for mensagem enviada pelo próprio usuário
        const currentUserId = parseInt(localStorage.getItem('usuarioId'));
        if (mensagem.senderId === currentUserId || mensagem.remetenteId === currentUserId) {
          console.log('⏭️ Ignorando mensagem própria');
          return;
        }
        
        // Incrementa contador
        setMensagensNaoLidas(prev => prev + 1);
        
        // Cria notificação
        const novaNotificacao = {
          id: Date.now(),
          conversaId: mensagem.conversaId,
          clienteId: mensagem.remetenteId || mensagem.senderId,
          nome: mensagem.remetenteNome || (isAdmin ? 'Cliente' : 'Administrador'),
          foto: mensagem.remetenteFoto,
          mensagem: mensagem.conteudo,
          timestamp: new Date()
        };
        
        setNotificacoes(prev => [...prev, novaNotificacao]);
        setUltimaMensagemRecebida(novaNotificacao);
        
        // Som de notificação
        playNotificationSound();
      });

      return () => {
        console.log('🧹 ChatContext: Limpando WebSocket');
        unsubscribe();
        wsService.disconnect();
      };
    } else {
      // Se está na página do chat, apenas carrega mensagens não lidas
      console.log('📊 ChatContext: Apenas monitorando contagem (Chat.jsx gerencia WS)');
      
      // Atualiza contagem a cada 5 segundos
      const interval = setInterval(() => {
        carregarMensagensNaoLidas();
      }, 5000);

      return () => {
        clearInterval(interval);
      };
    }
  }, [location.pathname]);

  const carregarMensagensNaoLidas = async () => {
    try {
      // Tenta usar o endpoint específico, senão usa lógica alternativa
      try {
        const response = await apiService.chat.contarNaoLidas();
        const count = typeof response === 'number' ? response : (response?.total || 0);
        setMensagensNaoLidas(count);
        console.log(`📊 Mensagens não lidas: ${count}`);
      } catch (error) {
        // Se o endpoint não existir, conta manualmente das conversas
        console.log('⚠️ Endpoint de contagem não disponível, usando contagem manual');
        // Por enquanto mantém o valor atual
      }
    } catch (error) {
      console.error('❌ Erro ao carregar mensagens não lidas:', error);
    }
  };

  const marcarTodasComoLidas = () => {
    setMensagensNaoLidas(0);
  };

  const removerNotificacao = (id) => {
    setNotificacoes(prev => prev.filter(n => n.id !== id));
  };

  const playNotificationSound = () => {
    try {
      const audio = new Audio('/notification.mp3');
      audio.volume = 0.5;
      audio.play().catch(e => console.log('Não foi possível tocar som:', e));
    } catch (error) {
      console.log('Som de notificação não disponível');
    }
  };

  return (
    <ChatContext.Provider value={{
      mensagensNaoLidas,
      ultimaMensagemRecebida,
      notificacoes,
      marcarTodasComoLidas,
      carregarMensagensNaoLidas,
      removerNotificacao
    }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat deve ser usado dentro de ChatProvider');
  }
  return context;
}
