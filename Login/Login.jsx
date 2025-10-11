import React, { useState } from "react";
import "./Login.css"; // Importa o CSS puro
import { useNavigate, Link } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();
  const handleSubmit = (e) => {
    e.preventDefault();
    // Lógica fictícia de autenticação
    if (email === "admin@admin.com" && password === "admin") {
      localStorage.setItem("role", "admin");
      navigate("/gerenciamento-servicos");
    } else {
      localStorage.setItem("role", "cliente");
      navigate("/agendamento");
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
            <button type="submit" className="btn-primary">
              Entrar
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
