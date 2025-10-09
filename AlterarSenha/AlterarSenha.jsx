import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./AlterarSenha.css"; // Importa o CSS puro

const AlterarSenha = () => {
  const [formData, setFormData] = useState({
    senhaAtual: "",
    novaSenha: "",
    confirmarSenha: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (formData.novaSenha !== formData.confirmarSenha) {
      alert("As senhas não coincidem!");
      return;
    }

    console.log("Senha alterada com sucesso:", formData);
    alert("Senha alterada com sucesso!");
  };

  return (
    <div className="change-container">
      <header className="change-header">
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
          <h2>AgendamentoAPP</h2>
        </div>
        <Link to="/" className="btn-login">Ir para Login</Link>
      </header>

      <main className="change-main">
        <div className="change-card">
          <div className="text-center">
            <h1>Alterar senha</h1>
            <p>Escolha sua nova senha.</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="novaSenha">Nova senha</label>
              <input
                id="novaSenha"
                name="novaSenha"
                type="password"
                placeholder="Digite a nova senha"
                value={formData.novaSenha}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmarSenha">Confirmar nova senha</label>
              <input
                id="confirmarSenha"
                name="confirmarSenha"
                type="password"
                placeholder="Confirme a nova senha"
                value={formData.confirmarSenha}
                onChange={handleChange}
                required
              />
            </div>

            <button type="submit" className="btn-primary">
              Alterar senha
            </button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default AlterarSenha;
