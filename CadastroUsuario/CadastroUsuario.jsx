import React, { useState } from "react";
import { apiService } from "../services/api";
import "./CadastroUsuario.css"; // Importa o CSS puro

const Register = () => {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        cpf: "",
        password: "",
    });

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: "", text: "" });

    const handleChange = (e) => {
        let { name, value } = e.target;

        // Aplicar máscaras de formatação
        if (name === "cpf") {
            // Máscara do CPF: 000.000.000-00
            value = value
                .replace(/\D/g, "") // Remove tudo que não é dígito
                .replace(/(\d{3})(\d)/, "$1.$2") // Coloca um ponto entre o terceiro e quarto dígitos
                .replace(/(\d{3})(\d)/, "$1.$2") // Coloca um ponto entre o terceiro e quarto dígitos
                .replace(/(\d{3})(\d{1,2})$/, "$1-$2"); // Coloca um hífen entre o terceiro e quarto dígitos
        } else if (name === "phone") {
            // Máscara do telefone: (00) 00000-0000
            value = value
                .replace(/\D/g, "") // Remove tudo que não é dígito
                .replace(/(\d{2})(\d)/, "($1) $2") // Coloca parênteses em volta dos dois primeiros dígitos
                .replace(/(\d{4,5})(\d{4})$/, "$1-$2"); // Coloca um hífen entre o quarto e quinto dígitos
        }

        setFormData({ ...formData, [name]: value });
        
        // Limpa mensagens ao digitar
        if (message.text) {
            setMessage({ type: "", text: "" });
        }
    };

    // Função para validar CPF
    const validateCPF = (cpf) => {
        const cleanCPF = cpf.replace(/\D/g, "");
        return cleanCPF.length === 11;
    };

    // Função para validar telefone
    const validatePhone = (phone) => {
        const cleanPhone = phone.replace(/\D/g, "");
        return cleanPhone.length >= 10;
    };

    // Função para chamar a API de cadastro
    const registerUser = async (userData) => {
        try {
            const result = await apiService.usuarios.cadastrar(userData);
            return result;
        } catch (error) {
            throw error;
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: "", text: "" });

        try {
            // Validações do formulário
            if (!validateCPF(formData.cpf)) {
                throw new Error("CPF deve ter 11 dígitos");
            }

            if (!validatePhone(formData.phone)) {
                throw new Error("Telefone deve ter pelo menos 10 dígitos");
            }

            if (formData.password.length < 6) {
                throw new Error("Senha deve ter pelo menos 6 caracteres");
            }

            // Chama a API
            const result = await registerUser(formData);

            // Sucesso
            setMessage({
                type: "success",
                text: "Usuário cadastrado com sucesso! Redirecionando para o login..."
            });

            // Limpa o formulário
            setFormData({
                name: "",
                email: "",
                phone: "",
                cpf: "",
                password: "",
            });

            // Redireciona após 2 segundos
            setTimeout(() => {
                window.location.href = "/";
            }, 2000);

        } catch (error) {
            console.error("Erro no cadastro:", error);
            
            // Trata diferentes tipos de erro
            let errorMessage = "Erro ao cadastrar usuário. Tente novamente.";
            
            if (error.message) {
                // Se o erro tem uma mensagem específica do backend, usa ela
                errorMessage = error.message;
            } else if (error.name === "TypeError") {
                // Erro de rede/conexão
                errorMessage = "Erro de conexão. Verifique se o servidor está rodando.";
            }
            
            setMessage({
                type: "error",
                text: errorMessage
            });
        } finally {
            setLoading(false);
        }
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

                    {/* Mensagem de feedback */}
                    {message.text && (
                        <div className={`message-alert ${message.type === "success" ? "success" : "error"}`}>
                            <div className="message-content">
                                <span className="message-icon">
                                    {message.type === "success" ? "✅" : "❌"}
                                </span>
                                <span className="message-text">{message.text}</span>
                            </div>
                        </div>
                    )}

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
                                placeholder="(00) 00000-0000"
                                required
                                value={formData.phone}
                                onChange={handleChange}
                                maxLength="15"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="cpf">CPF</label>
                            <input
                                id="cpf"
                                name="cpf"
                                type="text"
                                placeholder="000.000.000-00"
                                required
                                value={formData.cpf}
                                onChange={handleChange}
                                maxLength="14"
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

                        <button 
                            type="submit" 
                            className="btn-primary"
                            disabled={loading}
                        >
                            {loading ? (
                                <span className="loading-content">
                                    <span className="spinner"></span>
                                    Cadastrando...
                                </span>
                            ) : (
                                "Cadastrar"
                            )}
                        </button>
                    </form>

                    <p className="already-account">
                        Já possui uma conta?{" "}
                        <a href="/" className="link-primary">
                            Entrar
                        </a>
                    </p>
                </div>
            </main>
        </div>
    );
};

export default Register;
