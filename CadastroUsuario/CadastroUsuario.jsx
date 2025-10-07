import React, { useState } from "react";
import "./CadastroUsuario.css"; // Importa o CSS puro

const Register = () => {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        cpf: "",
        password: "",
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("Form enviado:", formData);
    };

    return (
        <div className="register-container">
            {/* Header */}
            <header className="register-header">
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
                            ></path>
                        </svg>
                    </div>
                    <h2>AgendamentoAPP</h2>
                </div>
            </header>

            {/* Main */}
            <main className="register-main">
                <div className="register-card">
                    <div className="text-center">
                        <h1>Crie sua conta</h1>
                        <p>Junte se a nós e crie agendamentos de forma fácil.</p>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="name">Nome</label>
                            <input
                                id="name"
                                name="name"
                                type="text"
                                placeholder="Coloque seu nome inteiro"
                                required
                                value={formData.name}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="email">Email</label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="Coloque seu email"
                                required
                                value={formData.email}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="phone">Celular</label>
                            <input
                                id="phone"
                                name="phone"
                                type="tel"
                                placeholder="Coloque seu número de celular"
                                required
                                value={formData.phone}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="cpf">CPF</label>
                            <input
                                id="cpf"
                                name="cpf"
                                type="text"
                                placeholder="Coloque seu CPF"
                                required
                                value={formData.cpf}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="password">Senha</label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                placeholder=" Coloque sua senha"
                                required
                                value={formData.password}
                                onChange={handleChange}
                            />
                        </div>

                        <button type="submit" className="btn-primary">
                            Cadastrar
                        </button>
                    </form>

                    <p className="already-account">
                        Já possui uma conta?{" "}
                        <a href="/login" className="link-primary">
                            Entrar
                        </a>
                    </p>
                </div>
            </main>
        </div>
    );
};

export default Register;
