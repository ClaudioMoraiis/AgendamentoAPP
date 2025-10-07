import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./RecuperarSenha.css"; // Importa o CSS puro

const RecuperarSenha = () => {
  const [email, setEmail] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Recuperação de senha para:", email);
    alert("Um link de recuperação foi enviado para seu e-mail!");
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
        <Link to="/login" className="btn-login">Login</Link>
      </header>

      <main className="recover-main">
        <div className="recover-card">
          <div className="text-center">
            <h1>Recuperar senha</h1>
            <p>Informe seu e-mail e nós enviaremos um link para redefinir sua senha.</p>
          </div>

          <form onSubmit={handleSubmit}>
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

            <button type="submit" className="btn-primary">Enviar link</button>
          </form>

          <p className="already-account">
            Lembrou sua senha? <Link to="/login" className="link-primary">Faça login</Link>
          </p>
        </div>
      </main>
    </div>
  );
};

export default RecuperarSenha;
