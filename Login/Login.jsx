import React, { useState } from "react";
import "./Login.css"; // Importa o CSS puro
import { Link } from "react-router-dom";
import { useAppNavigation } from "../hooks/useAppNavigation";
import { ROUTES } from "../constants/routes";
import { apiService } from "../services/api";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { navigateTo } = useAppNavigation();
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); // Limpa erros anteriores
    setLoading(true);
    
    console.log('🚀 Iniciando login com:', { email });
    
    try {
      // Chama a API real para fazer login
      const response = await apiService.usuarios.login({ email, senha: password });
      
      console.log('✅ Login realizado com sucesso:', response);
      console.log('🔍 Estrutura completa da resposta:', JSON.stringify(response, null, 2));
      
      // Salva os dados do usuário
      localStorage.setItem("userEmail", email);
      
      // Salva o token - extrai da estrutura específica do backend
      let token = null;
      
      if (response.Sucesso && typeof response.Sucesso === 'string') {
        // Extrai o token da string "Login realizado com sucesso\nToken: {jwt}"
        const match = response.Sucesso.match(/Token:\s*(.+)/);
        if (match && match[1]) {
          token = match[1].trim();
        }
      } else if (response.token) {
        token = response.token;
      } else if (response.accessToken) {
        token = response.accessToken;
      } else if (response.jwt) {
        token = response.jwt;
      } else if (response.authToken) {
        token = response.authToken;
      } else if (response.access_token) {
        token = response.access_token;
      } else if (typeof response === 'string') {
        // Se a resposta é diretamente o token
        token = response;
      }
      
      if (token) {
        localStorage.setItem("authToken", token);
        console.log('💾 Token JWT salvo no localStorage:', token.substring(0, 30) + '...');
      } else {
        console.warn('⚠️ Token não encontrado na resposta do login');
        console.warn('Propriedades disponíveis:', Object.keys(response || {}));
      }
      
      // Verifica se é o email administrativo específico
      if (email === "adm@gmail.com") {
        console.log('👑 Usuário administrativo detectado, redirecionando para dashboard');
        localStorage.setItem("role", "admin");
        navigateTo.dashboard(); // Redireciona para o dashboard administrativo
      } else {
        console.log('👤 Usuário cliente, redirecionando para serviços');
        localStorage.setItem("role", "cliente");
        navigateTo.servicos(); // Leva para página de serviços
      }
      
    } catch (error) {
      console.error('❌ Erro no login:', error);
      
      // Extrai apenas a mensagem de erro limpa do backend
      let errorMessage = "Erro ao fazer login. Verifique suas credenciais.";
      
      if (error.message) {
        // Remove prefixos como "Erro HTTP: 400 - " ou "BadCredentialsException - "
        errorMessage = error.message
          .replace(/^Erro HTTP: \d+ - /, '') // Remove "Erro HTTP: 400 - "
          .replace(/^.*Exception - /, '') // Remove "BadCredentialsException - "
          .replace(/^Erro: .*Exception - /, ''); // Remove "Erro: BadCredentialsException - "
      } else if (typeof error === 'string') {
        errorMessage = error
          .replace(/^Erro HTTP: \d+ - /, '')
          .replace(/^.*Exception - /, '')
          .replace(/^Erro: .*Exception - /, '');
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <header className="login-header">
        <div className="logo-area">
          <div className="logo-icon">
            <svg
              fill="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M19.266 12.002L12.001 2.373L4.736 12.002L12.001 21.631L19.266 12.002ZM12.001 8.44L16.275 14.173H7.727L12.001 8.44Z"></path>
            </svg>
          </div>
          <h1>AgendamentoAPP</h1>
        </div>
      </header>

      {/* Main */}
      <main className="login-main">
        <div className="login-card">
          <h2>Bem vindo de volta</h2>

          {error && (
            <div className="error-message" style={{
              backgroundColor: '#fee2e2',
              border: '1px solid #fecaca',
              color: '#dc2626',
              padding: '12px',
              borderRadius: '6px',
              marginBottom: '20px',
              fontSize: '14px'
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                placeholder="Coloque seu email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Senha</label>
              <input
                id="password"
                type="password"
                placeholder="Coloque sua senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? "Entrando..." : "Entrar"}
            </button>
          </form>

          <div className="extra-links">
            <p>
              Não possui uma conta?{" "}
              <a href="/cadastro" className="link-signup">Cadastre-se</a>
            </p>
            <a href="/recuperar-senha">Esqueceu sua senha?</a>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Login;
