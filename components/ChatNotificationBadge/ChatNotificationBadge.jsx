import { useChat } from '../../contexts/ChatContext';
import './ChatNotificationBadge.css';

const ChatNotificationBadge = () => {
  const { mensagensNaoLidas } = useChat();

  if (mensagensNaoLidas === 0) return null;

  return (
    <div className="chat-notification-badge">
      {mensagensNaoLidas > 99 ? '99+' : mensagensNaoLidas}
    </div>
  );
};

export default ChatNotificationBadge;
