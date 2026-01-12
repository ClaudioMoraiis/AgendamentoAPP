import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './ChatNotificationToast.css';

const ChatNotificationToast = ({ notification, onClose }) => {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Animação de entrada
    setTimeout(() => setIsVisible(true), 10);
  }, []);

  const handleClose = (e) => {
    e.stopPropagation();
    setIsVisible(false);
    setTimeout(() => onClose(), 300);
  };

  const handleClick = () => {
    // Redireciona para o chat com o ID da conversa
    navigate('/chat', { 
      state: { 
        conversaId: notification.conversaId,
        clienteId: notification.clienteId 
      } 
    });
    handleClose({ stopPropagation: () => {} });
  };

  if (!notification) return null;

  return (
    <div 
      className={`chat-notification-toast ${isVisible ? 'visible' : ''}`}
      onClick={handleClick}
    >
      <div className="toast-content">
        <div className="toast-avatar">
          {notification.foto ? (
            <img src={notification.foto} alt={notification.nome} />
          ) : (
            <span className="avatar-icon">👤</span>
          )}
        </div>
        <div className="toast-body">
          <div className="toast-header">
            <strong>{notification.nome}</strong>
            <span className="toast-time">agora</span>
          </div>
          <p className="toast-message">{notification.mensagem}</p>
        </div>
      </div>
      <button 
        className="toast-close" 
        onClick={handleClose}
        aria-label="Fechar notificação"
      >
        ✕
      </button>
    </div>
  );
};

export default ChatNotificationToast;
