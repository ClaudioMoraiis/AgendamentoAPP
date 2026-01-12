// Serviço de WebSocket para Chat em Tempo Real com STOMP + SockJS
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

class WebSocketService {
  constructor() {
    this.client = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 3000;
    this.messageHandlers = [];
    this.connectionHandlers = [];
    this.isConnected = false;
    this.subscriptions = [];
  }

  /**
   * Conecta ao WebSocket usando STOMP + SockJS
   * @param {string} token - Token JWT para autenticação
   */
  connect(token = null) {
    try {
      // Se já existe conexão, fecha primeiro
      if (this.client) {
        this.disconnect();
      }

      console.log('🔌 Conectando ao WebSocket com STOMP + SockJS...');

      // Cria cliente STOMP
      this.client = new Client({
        // Usa SockJS como WebSocket fallback
        webSocketFactory: () => new SockJS('http://localhost:8080/ws-chat'),
        
        // Headers de conexão (inclui token se fornecido)
        connectHeaders: token ? {
          Authorization: `Bearer ${token}`
        } : {},

        // Debug
        debug: (str) => {
          console.log('📡 STOMP:', str);
        },

        // Reconexão automática
        reconnectDelay: this.reconnectDelay,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,

        // Callback quando conectar
        onConnect: () => {
          console.log('✅ WebSocket STOMP conectado!');
          this.isConnected = true;
          this.reconnectAttempts = 0;
          
          // Notifica handlers de conexão
          this.connectionHandlers.forEach(handler => handler(true));

          // Subscribe nos tópicos privados
          this.subscribeToTopics();
        },

        // Callback quando desconectar
        onDisconnect: () => {
          console.log('🔌 WebSocket STOMP desconectado');
          this.isConnected = false;
          
          // Notifica handlers de desconexão
          this.connectionHandlers.forEach(handler => handler(false));
        },

        // Callback de erro
        onStompError: (frame) => {
          console.error('❌ Erro STOMP:', frame.headers['message']);
          console.error('Detalhes:', frame.body);
          this.isConnected = false;
        },

        // Callback de erro do WebSocket
        onWebSocketError: (event) => {
          console.error('❌ Erro no WebSocket:', event);
          this.isConnected = false;
        }
      });

      // Ativa a conexão
      this.client.activate();

    } catch (error) {
      console.error('❌ Erro ao conectar WebSocket:', error);
      this.isConnected = false;
    }
  }

  /**
   * Subscribe nos tópicos privados do usuário
   */
  subscribeToTopics() {
    if (!this.client || !this.client.connected) {
      console.warn('⚠️ Cliente STOMP não está conectado');
      return;
    }

    // Subscribe para receber mensagens privadas
    const messagesSub = this.client.subscribe('/user/queue/messages', (message) => {
      try {
        console.log('🔔 MENSAGEM BRUTA RECEBIDA:', message);
        console.log('🔔 BODY:', message.body);
        const data = JSON.parse(message.body);
        console.log('📩 Nova mensagem recebida:', data);
        console.log('📩 Handlers registrados:', this.messageHandlers.length);
        
        // Notifica todos os handlers registrados
        this.messageHandlers.forEach(handler => {
          console.log('📤 Chamando handler...');
          handler(data);
        });
      } catch (error) {
        console.error('❌ Erro ao processar mensagem:', error);
      }
    });

    // Subscribe para receber status de mensagens (lida, enviada, etc)
    const statusSub = this.client.subscribe('/user/queue/message-status', (message) => {
      try {
        const data = JSON.parse(message.body);
        console.log('📖 Status de mensagem atualizado:', data);
        
        // Você pode adicionar handlers específicos para status se necessário
        this.messageHandlers.forEach(handler => handler(data));
      } catch (error) {
        console.error('❌ Erro ao processar status:', error);
      }
    });

    this.subscriptions.push(messagesSub, statusSub);
    console.log('✅ Subscribed em tópicos privados');
  }

  /**
   * Envia uma mensagem via STOMP
   * @param {Object} message - Mensagem a ser enviada
   */
  sendMessage(message) {
    if (!this.client || !this.client.connected) {
      console.error('❌ WebSocket não está conectado');
      throw new Error('WebSocket não está conectado');
    }

    try {
      // Envia para o endpoint /app/chat.sendMessage
      this.client.publish({
        destination: '/app/chat.sendMessage',
        body: JSON.stringify(message)
      });
      
      console.log('📤 Mensagem enviada via WebSocket:', message);
    } catch (error) {
      console.error('❌ Erro ao enviar mensagem:', error);
      throw error;
    }
  }

  /**
   * Marca mensagem como lida via WebSocket
   * @param {number} mensagemId - ID da mensagem
   */
  markAsRead(mensagemId) {
    if (!this.client || !this.client.connected) {
      console.warn('⚠️ WebSocket não está conectado, não foi possível marcar como lida');
      return;
    }

    try {
      this.client.publish({
        destination: '/app/chat.markAsRead',
        body: JSON.stringify({ mensagemId })
      });
      
      console.log('📖 Marcado como lida via WebSocket:', mensagemId);
    } catch (error) {
      console.error('❌ Erro ao marcar como lida:', error);
    }
  }

  /**
   * Registra um handler para mensagens recebidas
   * @param {Function} handler - Função que será chamada quando uma mensagem for recebida
   * @returns {Function} Função para remover o handler
   */
  onMessage(handler) {
    this.messageHandlers.push(handler);
    
    // Retorna função para remover o handler
    return () => {
      this.messageHandlers = this.messageHandlers.filter(h => h !== handler);
    };
  }

  /**
   * Registra um handler para mudanças de conexão
   * @param {Function} handler - Função que será chamada quando a conexão mudar (true = conectado, false = desconectado)
   * @returns {Function} Função para remover o handler
   */
  onConnectionChange(handler) {
    this.connectionHandlers.push(handler);
    
    // Retorna função para remover o handler
    return () => {
      this.connectionHandlers = this.connectionHandlers.filter(h => h !== handler);
    };
  }

  /**
   * Desconecta o WebSocket
   */
  disconnect() {
    if (this.client) {
      console.log('🔌 Desconectando WebSocket STOMP...');
      
      // Unsubscribe de todos os tópicos
      this.subscriptions.forEach(sub => {
        try {
          sub.unsubscribe();
        } catch (error) {
          console.warn('⚠️ Erro ao fazer unsubscribe:', error);
        }
      });
      this.subscriptions = [];
      
      // Desativa o cliente
      this.client.deactivate();
      this.client = null;
      this.isConnected = false;
      this.messageHandlers = [];
      this.connectionHandlers = [];
    }
  }

  /**
   * Verifica se está conectado
   * @returns {boolean}
   */
  isWebSocketConnected() {
    return this.isConnected && this.client && this.client.connected;
  }
}

// Exporta instância única (singleton)
const wsService = new WebSocketService();
export default wsService;
