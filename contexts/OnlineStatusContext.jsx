import { createContext, useContext, useEffect, useState } from 'react';
import { apiService } from '../services/api';
import { API_BASE_URL } from '../constants/api';

const OnlineStatusContext = createContext(null);

// Gerenciador de status online/offline sincronizado entre abas
const STATUS_STORAGE_KEY = 'usuarios_online_status';
const CHANNEL_NAME = 'online_status_channel';

// Broadcast channel para sincronizar entre abas
let broadcastChannel = null;
try {
  broadcastChannel = new BroadcastChannel(CHANNEL_NAME);
} catch (error) {
  console.warn('⚠️ BroadcastChannel não suportado');
}

// Funções utilitárias para gerenciar status
export const StatusManager = {
  // Marca usuário como online
  setOnline: (userId) => {
    const status = JSON.parse(localStorage.getItem(STATUS_STORAGE_KEY) || '{}');
    status[userId] = {
      online: true,
      timestamp: Date.now()
    };
    localStorage.setItem(STATUS_STORAGE_KEY, JSON.stringify(status));
    
    // Notifica outras abas
    broadcastChannel?.postMessage({ type: 'status_change', userId, online: true });
    
    console.log(`🟢 Status ONLINE salvo localmente para usuário ${userId}`);
  },
  
  // Marca usuário como offline
  setOffline: (userId) => {
    const status = JSON.parse(localStorage.getItem(STATUS_STORAGE_KEY) || '{}');
    status[userId] = {
      online: false,
      timestamp: Date.now()
    };
    localStorage.setItem(STATUS_STORAGE_KEY, JSON.stringify(status));
    
    // Notifica outras abas
    broadcastChannel?.postMessage({ type: 'status_change', userId, online: false });
    
    console.log(`🔴 Status OFFLINE salvo localmente para usuário ${userId}`);
  },
  
  // Verifica se usuário está online
  isOnline: (userId) => {
    const status = JSON.parse(localStorage.getItem(STATUS_STORAGE_KEY) || '{}');
    const userStatus = status[userId];
    
    if (!userStatus) return false;
    
    // Considera offline se última atualização foi há mais de 30 segundos
    const isStale = Date.now() - userStatus.timestamp > 30000;
    return userStatus.online && !isStale;
  },
  
  // Obtém todos os status
  getAll: () => {
    const status = JSON.parse(localStorage.getItem(STATUS_STORAGE_KEY) || '{}');
    const now = Date.now();
    const result = {};
    
    Object.keys(status).forEach(userId => {
      const userStatus = status[userId];
      // Considera offline se passou mais de 30 segundos
      const isStale = now - userStatus.timestamp > 30000;
      result[userId] = userStatus.online && !isStale;
    });
    
    return result;
  },
  
  // Limpa status antigos (mais de 1 hora)
  cleanup: () => {
    const status = JSON.parse(localStorage.getItem(STATUS_STORAGE_KEY) || '{}');
    const now = Date.now();
    const cleaned = {};
    
    Object.keys(status).forEach(userId => {
      // Mantém apenas status dos últimos 1 hora
      if (now - status[userId].timestamp < 3600000) {
        cleaned[userId] = status[userId];
      }
    });
    
    localStorage.setItem(STATUS_STORAGE_KEY, JSON.stringify(cleaned));
  }
};

export const useOnlineStatus = () => {
  const context = useContext(OnlineStatusContext);
  if (!context) {
    console.warn('⚠️ useOnlineStatus sendo usado fora do OnlineStatusProvider');
    return { 
      statusMap: {},
      isUserOnline: () => false,
      refreshStatus: () => {}
    };
  }
  return context;
};

/**
 * Provider para gerenciar status online/offline do usuário de forma centralizada
 */
export const OnlineStatusProvider = ({ children }) => {
  const [statusMap, setStatusMap] = useState({});
  
  useEffect(() => {
    const usuarioId = localStorage.getItem('usuarioId');
    
    if (!usuarioId) {
      console.log('ℹ️ Usuário não logado, não gerencia status online');
      return;
    }

    console.log('🟢 OnlineStatusProvider iniciado para usuário', usuarioId);

    // 1. Marca como ONLINE ao iniciar
    StatusManager.setOnline(usuarioId);
    apiService.usuarios.atualizarStatusOnline(usuarioId, true)
      .then(() => console.log('✅ Status inicial: ONLINE (backend atualizado)'))
      .catch(err => console.warn('⚠️ Erro ao marcar online inicial no backend:', err));

    // 2. Heartbeat: mantém status online a cada 5 segundos
    const heartbeatInterval = setInterval(() => {
      StatusManager.setOnline(usuarioId); // Atualiza timestamp local
      apiService.usuarios.atualizarStatusOnline(usuarioId, true)
        .catch(err => console.warn('⚠️ Erro no heartbeat:', err));
    }, 5000);

    // 3. Cleanup de status antigos a cada minuto
    const cleanupInterval = setInterval(() => {
      StatusManager.cleanup();
      setStatusMap(StatusManager.getAll());
    }, 60000);

    // 4. Detecta quando usuário fecha aba/navegador
    const handleBeforeUnload = () => {
      const token = localStorage.getItem('authToken');
      const url = `${API_BASE_URL}/usuario/online/${usuarioId}?mOnline=false`;
      
      StatusManager.setOffline(usuarioId);
      
      try {
        fetch(url, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          keepalive: true
        });
        console.log('🔴 Status OFFLINE enviado (página fechando)');
      } catch (error) {
        console.warn('⚠️ Erro ao enviar offline no beforeunload:', error);
      }
    };

    // 5. Detecta quando usuário sai da página (mudança de visibilidade)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        StatusManager.setOffline(usuarioId);
        apiService.usuarios.atualizarStatusOnline(usuarioId, false)
          .catch(err => console.warn('⚠️ Erro ao marcar offline (hidden):', err));
      } else if (document.visibilityState === 'visible') {
        StatusManager.setOnline(usuarioId);
        apiService.usuarios.atualizarStatusOnline(usuarioId, true)
          .catch(err => console.warn('⚠️ Erro ao marcar online (visible):', err));
      }
    };

    // 6. Escuta mudanças de outras abas
    const handleBroadcastMessage = (event) => {
      if (event.data.type === 'status_change') {
        console.log(`📡 Status atualizado em outra aba: ${event.data.userId} → ${event.data.online ? 'ONLINE' : 'OFFLINE'}`);
        setStatusMap(StatusManager.getAll());
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    broadcastChannel?.addEventListener('message', handleBroadcastMessage);

    // Estado inicial
    setStatusMap(StatusManager.getAll());

    // Cleanup ao desmontar
    return () => {
      clearInterval(heartbeatInterval);
      clearInterval(cleanupInterval);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      broadcastChannel?.removeEventListener('message', handleBroadcastMessage);
      
      // Marca como offline ao desmontar o provider
      StatusManager.setOffline(usuarioId);
      apiService.usuarios.atualizarStatusOnline(usuarioId, false)
        .catch(err => console.warn('⚠️ Erro ao marcar offline (cleanup):', err));
    };
  }, []);

  const contextValue = {
    statusMap,
    isUserOnline: (userId) => StatusManager.isOnline(userId),
    refreshStatus: () => setStatusMap(StatusManager.getAll())
  };

  return (
    <OnlineStatusContext.Provider value={contextValue}>
      {children}
    </OnlineStatusContext.Provider>
  );
};
