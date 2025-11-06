import React, { useState, useEffect } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { apiService } from "../services/api";
import "./RecuperarSenha.css"; // Importa o CSS puro

const RecuperarSenha = () => {
  const [email, setEmail] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // Verifica se tem token na URL
  const token = searchParams.get('token');
  const isResetMode = !!token; // true se tem token, false se não tem

  // Função para solicitar recuperação de senha (envia email)
  const handleSolicitarRecuperacao = async (e) => {
    e.preventDefault();
    if (!email) {
      setMessage({ text: "Digite seu email para continuar", type: "error" });
      return;
    }

    setLoading(true);
    try {
      await apiService.usuarios.recuperarSenha(email);
      setMessage({ 
        text: "Um link de recuperação foi enviado para seu e-mail!", 
        type: "success" 
      });
      setEmail(""); // Limpa o campo
      
      // Redireciona para login após 2 segundos
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (error) {
      console.error('❌ Erro ao solicitar recuperação:', error);
      const errorMessage = error.message || 'Erro ao enviar email de recuperação. Tente novamente.';
      setMessage({ text: errorMessage, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  // Função para redefinir senha com token
  const handleRedefinirSenha = async (e) => {
    e.preventDefault();
    
    if (!novaSenha || !confirmarSenha) {
      setMessage({ text: "Preencha todos os campos", type: "error" });
      return;
    }
    
    if (novaSenha !== confirmarSenha) {
      setMessage({ text: "As senhas não coincidem", type: "error" });
      return;
    }
    
    if (novaSenha.length < 6) {
      setMessage({ text: "A senha deve ter pelo menos 6 caracteres", type: "error" });
      return;
    }

    setLoading(true);
    try {
      // Chama API para redefinir senha com token
      await apiService.usuarios.redefinirSenha(token, novaSenha, confirmarSenha);
      setMessage({ 
        text: "Senha redefinida com sucesso! Você já pode fazer login.", 
        type: "success" 
      });
      setNovaSenha("");
      setConfirmarSenha("");
      
      // Redireciona para login após 2 segundos
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (error) {
      console.error('❌ Erro ao redefinir senha:', error);
      const errorMessage = error.message || 'Erro ao redefinir senha. Token pode ter expirado.';
      setMessage({ text: errorMessage, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="recover-container">
      <header className="recover-header">
        <div className="logo-area">
          <div className="logo-icon">
            <svg
              fill="currentColor"
              viewBox="0 0 48 48"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                clipRule="evenodd"
                d="M47.2426 24L24 47.2426L0.757355 24L24 0.757355L47.2426 24ZM12.2426 21H35.7574L24 9.24264L12.2426 21Z"
                fill="currentColor"
                fillRule="evenodd"
              />
            </svg>
          </div>
          <h2>BarberApp</h2>
        </div>
        <Link to="/" className="btn-login">Login</Link>
      </header>

      <main className="recover-main">
        <div className="recover-card">
          <div className="text-center">
            <h1>{isResetMode ? "Redefinir senha" : "Recuperar senha"}</h1>
            <p>
              {isResetMode 
                ? "Digite sua nova senha abaixo." 
                : "Informe seu e-mail e nós enviaremos um link para redefinir sua senha."
              }
            </p>
          </div>

          {/* Mensagem de feedback */}
          {message.text && (
            <div 
              className={`message ${message.type}`}
              style={{
                padding: '12px',
                borderRadius: '6px',
                marginBottom: '20px',
                backgroundColor: message.type === 'success' ? '#dcfce7' : '#fee2e2',
                border: `1px solid ${message.type === 'success' ? '#86efac' : '#fecaca'}`,
                color: message.type === 'success' ? '#166534' : '#dc2626',
                fontSize: '14px'
              }}
            >
              {message.text}
            </div>
          )}

          {!isResetMode ? (
            // Formulário para solicitar recuperação
            <form onSubmit={handleSolicitarRecuperacao}>
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  type="email"
                  placeholder="Digite seu e-mail"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? "Enviando..." : "Enviar link de recuperação"}
              </button>
            </form>
          ) : (
            // Formulário para redefinir senha
            <form onSubmit={handleRedefinirSenha}>
              <div className="form-group">
                <label htmlFor="novaSenha">Nova senha</label>
                <input
                  id="novaSenha"
                  type="password"
                  placeholder="Digite sua nova senha"
                  value={novaSenha}
                  onChange={(e) => setNovaSenha(e.target.value)}
                  required
                  minLength={6}
                />
              </div>
              <div className="form-group">
                <label htmlFor="confirmarSenha">Confirmar senha</label>
                <input
                  id="confirmarSenha"
                  type="password"
                  placeholder="Confirme sua nova senha"
                  value={confirmarSenha}
                  onChange={(e) => setConfirmarSenha(e.target.value)}
                  required
                  minLength={6}
                />
              </div>
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? "Salvando..." : "Redefinir senha"}
              </button>
            </form>
          )}

          <p className="already-account">
            Lembrou sua senha? <Link to="/" className="link-primary">Faça login</Link>
          </p>
        </div>
      </main>
    </div>
  );
};

export default RecuperarSenha;
