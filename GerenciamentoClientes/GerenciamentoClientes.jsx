import React, { useState, useEffect } from "react";
import "./GerenciamentoClientes.css";
import LayoutPrincipal from "../LayoutPrincipal/LayoutPrincipal";
import { apiService } from "../services/api";



export default function GerenciamentoClientes() {
  const [clientes, setClientes] = useState([]);
  const [busca, setBusca] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [modalEditarOpen, setModalEditarOpen] = useState(false);
  const [clienteEditando, setClienteEditando] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingClientes, setLoadingClientes] = useState(true);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [novoCliente, setNovoCliente] = useState({
    nome: "",
    email: "",
    telefone: "",
    cpf: ""
  });

  // Carrega clientes da API ao iniciar o componente
  useEffect(() => {
    carregarClientes();
  }, []);

  // Função para carregar clientes da API
  const carregarClientes = async () => {
    try {
      setLoadingClientes(true);
      const response = await apiService.usuarios.listar();
      
      // Mapeia os dados da API para o formato do componente
      const clientesFormatados = response.map(cliente => ({
        id: cliente.id,
        nome: cliente.nome,
        email: cliente.email,
        telefone: cliente.celular, // API usa 'celular', componente usa 'telefone'
        cpf: cliente.cpf
      }));
      
      console.log('👥 Clientes carregados com IDs:', clientesFormatados.map(c => ({ nome: c.nome, id: c.id })));
      setClientes(clientesFormatados);
    } catch (error) {
      console.error('❌ Erro ao carregar clientes:', error);
      setMessage({ 
        text: 'Erro ao carregar clientes. Tente novamente.', 
        type: "error" 
      });
      // Se der erro, usa uma lista vazia
      setClientes([]);
    } finally {
      setLoadingClientes(false);
    }
  };

  // Funções auxiliares para modais e ações
  const abrirModalNovo = () => {
    setNovoCliente({ nome: "", email: "", telefone: "", cpf: "" });
    setModalOpen(true);
  };

  const fecharModalNovo = () => {
    setModalOpen(false);
  };

  const abrirModalEditar = (cliente, index) => {
    setClienteEditando({ 
      ...cliente, 
      index,
      id: cliente.id // Garante que o ID seja incluído
    });
    setModalEditarOpen(true);
  };

  const fecharModalEditar = () => {
    setModalEditarOpen(false);
    setClienteEditando(null);
  };

  // Função para gerar senha com os 4 primeiros dígitos do CPF
  const gerarSenhaCPF = (cpf) => {
    // Remove tudo que não é número
    const numerosApenas = cpf.replace(/\D/g, "");
    // Retorna os 4 primeiros dígitos
    return numerosApenas.substring(0, 4);
  };

  const salvarNovoCliente = async (e) => {
    e.preventDefault();
    
    if (!novoCliente.nome || !novoCliente.email || !novoCliente.telefone || !novoCliente.cpf) {
      setMessage({ text: "Preencha todos os campos obrigatórios!", type: "error" });
      return;
    }

    setLoading(true);
    setMessage({ text: "", type: "" });

    try {
      // Gera a senha com os 4 primeiros dígitos do CPF
      const senha = gerarSenhaCPF(novoCliente.cpf);
      
      // Prepara os dados no formato da API de cadastro
      const dadosCadastro = {
        name: novoCliente.nome,
        email: novoCliente.email,
        phone: novoCliente.telefone,
        cpf: novoCliente.cpf,
        password: senha
      };

      // Chama a API de cadastro
      const response = await apiService.usuarios.cadastrar(dadosCadastro);
      
      // Verifica se a resposta contém erro (mesmo com status 200)
      if (response && typeof response === 'object' && response.Erro) {
        setMessage({ 
          text: response.Erro, 
          type: "error" 
        });
        return;
      }
      
      // Verifica se há uma mensagem de sucesso na resposta
      let successMessage = `Cliente cadastrado com sucesso! Senha gerada: ${senha}`;
      if (response && typeof response === 'object' && response.Sucesso) {
        successMessage = `${response.Sucesso} Senha gerada: ${senha}`;
      }
      
      // Se chegou até aqui, o cadastro foi bem-sucedido
      setMessage({ 
        text: successMessage, 
        type: "success" 
      });
      
      // Recarrega a lista de clientes da API
      await carregarClientes();
      
      // Limpa o formulário após 2 segundos
      setTimeout(() => {
        fecharModalNovo();
        setMessage({ text: "", type: "" });
      }, 2000);
      
    } catch (error) {
      console.error('❌ Erro ao cadastrar cliente:', error);
      
      // A mensagem de erro já foi tratada no api.js
      const errorMessage = error.message || 'Erro ao cadastrar cliente. Tente novamente.';
      setMessage({ text: errorMessage, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const salvarEdicaoCliente = async (e) => {
    e.preventDefault();
    
    if (!clienteEditando.nome || !clienteEditando.email || !clienteEditando.telefone || !clienteEditando.cpf) {
      setMessage({ text: "Preencha todos os campos obrigatórios!", type: "error" });
      return;
    }

    setLoading(true);
    setMessage({ text: "", type: "" });

    try {
      console.log('✏️ Editando cliente ID:', clienteEditando.id, 'Dados:', clienteEditando);
      
      // Chama a API de alterar usuário
      const response = await apiService.usuarios.alterar(clienteEditando.id, {
        nome: clienteEditando.nome,
        email: clienteEditando.email,
        telefone: clienteEditando.telefone,
        cpf: clienteEditando.cpf
      });
      
      // Verifica se há mensagem de sucesso na resposta
      let successMessage = 'Cliente alterado com sucesso!';
      if (response && typeof response === 'object' && response.Sucesso) {
        successMessage = response.Sucesso;
      }
      
      setMessage({ 
        text: successMessage, 
        type: "success" 
      });
      
      // Recarrega a lista de clientes da API
      await carregarClientes();
      
      // Fecha o modal após 2 segundos
      setTimeout(() => {
        fecharModalEditar();
        setMessage({ text: "", type: "" });
      }, 2000);
      
    } catch (error) {
      console.error('❌ Erro ao alterar cliente:', error);
      const errorMessage = error.message || 'Erro ao alterar cliente. Tente novamente.';
      setMessage({ text: errorMessage, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const visualizarCliente = (cliente) => {
    alert(`📋 Cliente: ${cliente.nome}\n📧 Email: ${cliente.email}\n📞 Telefone: ${cliente.telefone}\n🆔 CPF: ${cliente.cpf}`);
  };

  const excluirCliente = async (cliente, index) => {
    if (!window.confirm(`Tem certeza que deseja excluir o cliente "${cliente.nome}"?`)) {
      return;
    }

    setMessage({ text: "", type: "" });

    try {
      console.log('🗑️ Excluindo cliente ID:', cliente.id, 'Nome:', cliente.nome);
      
      // Chama a API de deletar usuário
      const response = await apiService.usuarios.deletar(cliente.id);
      
      // Verifica se há mensagem de sucesso na resposta
      let successMessage = 'Cliente excluído com sucesso!';
      if (response && typeof response === 'object' && response.Sucesso) {
        successMessage = response.Sucesso;
      }
      
      setMessage({ 
        text: successMessage, 
        type: "success" 
      });
      
      // Recarrega a lista de clientes da API
      await carregarClientes();
      
      // Limpa a mensagem após 3 segundos
      setTimeout(() => {
        setMessage({ text: "", type: "" });
      }, 3000);
      
    } catch (error) {
      console.error('❌ Erro ao excluir cliente:', error);
      const errorMessage = error.message || 'Erro ao excluir cliente. Tente novamente.';
      setMessage({ text: errorMessage, type: "error" });
    }
  };

  // Filtro de clientes
  const clientesFiltrados = clientes.filter(
    (cliente) =>
      cliente.nome.toLowerCase().includes(busca.toLowerCase()) ||
      cliente.email.toLowerCase().includes(busca.toLowerCase()) ||
      cliente.telefone.toLowerCase().includes(busca.toLowerCase()) ||
      cliente.cpf.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <LayoutPrincipal paginaAtiva="clientes">
      <div className="gc-main">
        <div className="gc-container">
          {/* Cabeçalho */}
          <div className="gc-page-header">
            <h1>👥 Gerenciar Clientes</h1>
            <button className="gc-btn-primary" onClick={abrirModalNovo}>
              <span className="material-symbols-outlined">person_add</span>
              Novo Cliente
            </button>
          </div>

          {/* Mensagem global de feedback */}
          {message.text && !modalOpen && (
            <div 
              className={`gc-message-global ${message.type}`}
              style={{
                padding: '12px 16px',
                borderRadius: '8px',
                marginBottom: '20px',
                backgroundColor: message.type === 'success' ? '#dcfce7' : '#fee2e2',
                border: `1px solid ${message.type === 'success' ? '#86efac' : '#fecaca'}`,
                color: message.type === 'success' ? '#166534' : '#dc2626',
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <span className="material-symbols-outlined">
                {message.type === 'success' ? 'check_circle' : 'error'}
              </span>
              {message.text}
            </div>
          )}

          {/* Barra de Busca */}
          <div className="gc-search-container">
            <div className="gc-search">
              <span className="material-symbols-outlined gc-search-icon">search</span>
              <input
                type="text"
                placeholder="Buscar por nome, email, telefone ou CPF..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="gc-search-input"
              />
            </div>
          </div>

          {/* Tabela */}
          <div className="gc-table-container">
            <table className="gc-table">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th className="gc-hide-lg">Email</th>
                  <th className="gc-hide-md">Telefone</th>
                  <th className="gc-hide-xl">CPF</th>
                  <th className="gc-actions">Ações</th>
                </tr>
              </thead>
              <tbody>
                {loadingClientes ? (
                  <tr>
                    <td colSpan="5" className="gc-empty-state">
                      <span className="material-symbols-outlined">hourglass_empty</span>
                      <p>Carregando clientes...</p>
                    </td>
                  </tr>
                ) : clientesFiltrados.length > 0 ? (
                  clientesFiltrados.map((cliente, index) => (
                    <tr key={cliente.id || index}>
                      <td className="gc-cell-name">{cliente.nome}</td>
                      <td className="gc-hide-lg">{cliente.email}</td>
                      <td className="gc-hide-md">{cliente.telefone}</td>
                      <td className="gc-hide-xl">{cliente.cpf}</td>
                      <td className="gc-cell-actions">
                        <div className="gc-actions-buttons">
                          <button 
                            className="gc-btn-action gc-btn-view"
                            onClick={() => visualizarCliente(cliente)}
                            title="Visualizar"
                          >
                            <span className="material-symbols-outlined">visibility</span>
                          </button>
                          <button 
                            className="gc-btn-action gc-btn-edit"
                            onClick={() => abrirModalEditar(cliente, index)}
                            title="Editar"
                          >
                            <span className="material-symbols-outlined">edit</span>
                          </button>
                          <button 
                            className="gc-btn-action gc-btn-delete"
                            onClick={() => excluirCliente(cliente, index)}
                            title="Excluir"
                          >
                            <span className="material-symbols-outlined">delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="gc-empty-state">
                      <span className="material-symbols-outlined">search_off</span>
                      <p>Nenhum cliente encontrado</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Modal Novo Cliente */}
          {modalOpen && (
            <div className="gc-modal-overlay" onClick={fecharModalNovo}>
              <div className="gc-modal" onClick={e => e.stopPropagation()}>
                <h3>➕ Novo Cliente</h3>
                
                {/* Mensagem de feedback */}
                {message.text && (
                  <div 
                    className={`gc-message ${message.type}`}
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

                <form onSubmit={salvarNovoCliente}>
                  <div className="gc-form-group">
                    <label>Nome Completo *</label>
                    <input
                      type="text"
                      value={novoCliente.nome}
                      onChange={e => setNovoCliente({ ...novoCliente, nome: e.target.value })}
                      placeholder="Digite o nome completo"
                      required
                    />
                  </div>
                  <div className="gc-form-group">
                    <label>Email *</label>
                    <input
                      type="email"
                      value={novoCliente.email}
                      onChange={e => setNovoCliente({ ...novoCliente, email: e.target.value })}
                      placeholder="exemplo@email.com"
                      required
                    />
                  </div>
                  <div className="gc-form-group">
                    <label>Telefone *</label>
                    <input
                      type="text"
                      value={novoCliente.telefone}
                      onChange={e => setNovoCliente({ ...novoCliente, telefone: e.target.value })}
                      placeholder="(00) 00000-0000"
                      required
                    />
                  </div>
                  <div className="gc-form-group">
                    <label>CPF *</label>
                    <input
                      type="text"
                      value={novoCliente.cpf}
                      onChange={e => setNovoCliente({ ...novoCliente, cpf: e.target.value })}
                      placeholder="000.000.000-00"
                      required
                    />
                    <small style={{color: '#6b7280', fontSize: '0.8rem', marginTop: '4px'}}>
                      💡 A senha será gerada automaticamente com os 4 primeiros dígitos do CPF
                    </small>
                  </div>
                  <div className="gc-modal-buttons">
                    <button type="button" onClick={fecharModalNovo} className="gc-btn-cancel">
                      Cancelar
                    </button>
                    <button type="submit" className="gc-btn-save" disabled={loading}>
                      {loading ? (
                        <>
                          <span className="material-symbols-outlined" style={{fontSize: '1.1rem', marginRight: '0.25rem'}}>hourglass_empty</span>
                          Cadastrando...
                        </>
                      ) : (
                        <>
                          <span className="material-symbols-outlined" style={{fontSize: '1.1rem', marginRight: '0.25rem'}}>save</span>
                          Salvar Cliente
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Modal Editar Cliente */}
          {modalEditarOpen && clienteEditando && (
            <div className="gc-modal-overlay" onClick={fecharModalEditar}>
              <div className="gc-modal" onClick={e => e.stopPropagation()}>
                <h3>✏️ Editar Cliente</h3>
                
                {/* Mensagem de feedback */}
                {message.text && (
                  <div 
                    className={`gc-message ${message.type}`}
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

                <form onSubmit={salvarEdicaoCliente}>
                  <div className="gc-form-group">
                    <label>Nome Completo *</label>
                    <input
                      type="text"
                      value={clienteEditando.nome}
                      onChange={e => setClienteEditando({ ...clienteEditando, nome: e.target.value })}
                      placeholder="Digite o nome completo"
                      required
                    />
                  </div>
                  <div className="gc-form-group">
                    <label>Email *</label>
                    <input
                      type="email"
                      value={clienteEditando.email}
                      onChange={e => setClienteEditando({ ...clienteEditando, email: e.target.value })}
                      placeholder="exemplo@email.com"
                      required
                    />
                  </div>
                  <div className="gc-form-group">
                    <label>Telefone *</label>
                    <input
                      type="text"
                      value={clienteEditando.telefone}
                      onChange={e => setClienteEditando({ ...clienteEditando, telefone: e.target.value })}
                      placeholder="(00) 00000-0000"
                      required
                    />
                  </div>
                  <div className="gc-form-group">
                    <label>CPF *</label>
                    <input
                      type="text"
                      value={clienteEditando.cpf}
                      onChange={e => setClienteEditando({ ...clienteEditando, cpf: e.target.value })}
                      placeholder="000.000.000-00"
                      required
                    />
                  </div>
                  <div className="gc-modal-buttons">
                    <button type="button" className="gc-btn-cancel" onClick={fecharModalEditar}>
                      Cancelar
                    </button>
                    <button type="submit" className="gc-btn-save" disabled={loading}>
                      {loading ? (
                        <>
                          <span className="material-symbols-outlined" style={{fontSize: '1.1rem', marginRight: '0.25rem'}}>hourglass_empty</span>
                          Salvando...
                        </>
                      ) : (
                        <>
                          <span className="material-symbols-outlined" style={{fontSize: '1.1rem', marginRight: '0.25rem'}}>save</span>
                          Salvar Alterações
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </LayoutPrincipal>
  );
}