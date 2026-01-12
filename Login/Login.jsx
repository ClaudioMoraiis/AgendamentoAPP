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
  const [showPassword, setShowPassword] = useState(false);

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
        // Extrai o token da string "Login realizado com sucesso\nToken: {jwt} ID :{id}"
        const tokenMatch = response.Sucesso.match(/Token:\s*([^\s]+)/);
        if (tokenMatch && tokenMatch[1]) {
          token = tokenMatch[1].trim();
        }
        
        // Extrai o ID do usuário
        const idMatch = response.Sucesso.match(/ID\s*:(\d+)/);
        if (idMatch && idMatch[1]) {
          localStorage.setItem("usuarioId", idMatch[1].trim());
          console.log('💾 usuarioId salvo no localStorage:', idMatch[1].trim());
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
      
      // Salva o usuarioId se vier na resposta
      let usuarioId = null;
      if (response.usuarioId) {
        usuarioId = response.usuarioId;
        localStorage.setItem("usuarioId", usuarioId);
        console.log('💾 usuarioId salvo no localStorage:', usuarioId);
      } else if (response.id) {
        usuarioId = response.id;
        localStorage.setItem("usuarioId", usuarioId);
        console.log('💾 usuarioId (id) salvo no localStorage:', usuarioId);
      }
      
      // Busca o role real do backend
      let isAdmin = false;
      if (usuarioId) {
        try {
          const roleResponse = await apiService.usuario.getRole(usuarioId);
          console.log('🎭 Role do backend:', roleResponse);
          
          // Verifica se é admin baseado na resposta do backend
          const role = roleResponse.role || roleResponse.tipo || roleResponse;
          isAdmin = String(role).toUpperCase() === 'ADMIN';
          
          localStorage.setItem("role", isAdmin ? "admin" : "cliente");
          console.log('🔐 Usuário é admin?', isAdmin);
        } catch (roleError) {
          console.warn('⚠️ Erro ao buscar role, usando validação por email:', roleError);
          // Fallback: verifica pelo email se a API falhar
          isAdmin = email.toUpperCase() === "ADM@GMAIL.COM";
          localStorage.setItem("role", isAdmin ? "admin" : "cliente");
        }
      } else {
        // Fallback: verifica pelo email se não tiver ID
        isAdmin = email.toUpperCase() === "ADM@GMAIL.COM";
        localStorage.setItem("role", isAdmin ? "admin" : "cliente");
      }
      
      // Atualiza status para ONLINE após login bem-sucedido
      if (usuarioId) {
        try {
          await apiService.usuarios.atualizarStatusOnline(usuarioId, true);
          console.log('🟢 Status atualizado para ONLINE');
        } catch (onlineError) {
          console.warn('⚠️ Erro ao atualizar status online:', onlineError);
          // Não interrompe o fluxo de login
        }
      }
      
      // Redireciona baseado no role real
      if (isAdmin) {
        console.log('👑 Usuário administrativo detectado, redirecionando para dashboard');
        // Antes de redirecionar, tenta carregar lista de profissionais para uso no admin
        try {
          const profsResp = await apiService.profissionais.listar();
          const profs = Array.isArray(profsResp)
            ? profsResp.map(p => ({ id: p.id, nome: p.nome, codigo: p.codigo || p.nome }))
            : [];
          localStorage.setItem('profissionaisList', JSON.stringify(profs));
          console.log('💾 Profissionais salvos em localStorage:', profs.length);
        } catch (err) {
          console.warn('⚠️ Não foi possível carregar profissionais após login:', err.message || err);
          // Não interrompe o fluxo de login; apenas prossegue para a dashboard
        }

        navigateTo.dashboard(); // Redireciona para o dashboard administrativo
      } else {
        console.log('👤 Usuário cliente, redirecionando para serviços');
        navigateTo.servicos(); // Leva para página de serviços
      }
      
    } catch (error) {
      console.error('❌ Erro no login:', error);
      
      // Extrai apenas a mensagem de erro limpa do backend
      let errorMessage = "Erro ao fazer login. Verifique suas credenciais.";
      
      if (error.message) {
        // Remove prefixos como "Erro HTTP: 401 - " ou "Erro HTTP: 401" 
        errorMessage = error.message
          .replace(/^Erro HTTP:\s*\d+\s*-?\s*/, '') // Remove "Erro HTTP: 401 - " ou "Erro HTTP: 401"
          .replace(/^.*Exception\s*-\s*/, '') // Remove "BadCredentialsException - "
          .replace(/^Erro:\s*.*Exception\s*-\s*/, '') // Remove "Erro: BadCredentialsException - "
          .trim();
        
        // Se sobrou só números ou string vazia, usa mensagem padrão
        if (!errorMessage || /^\d+$/.test(errorMessage)) {
          errorMessage = "Credenciais inválidas. Verifique seu email e senha.";
        }
      } else if (typeof error === 'string') {
        errorMessage = error
          .replace(/^Erro HTTP:\s*\d+\s*-?\s*/, '')
          .replace(/^.*Exception\s*-\s*/, '')
          .replace(/^Erro:\s*.*Exception\s*-\s*/, '')
          .trim();
          
        if (!errorMessage || /^\d+$/.test(errorMessage)) {
          errorMessage = "Credenciais inválidas. Verifique seu email e senha.";
        }
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
              <div style={{ position: 'relative' }}>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Coloque sua senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#666'
                  }}
                  title={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                    {showPassword ? 'visibility' : 'visibility_off'}
                  </span>
                </button>
              </div>
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
