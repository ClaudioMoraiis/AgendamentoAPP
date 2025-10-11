import React, { useState } from "react";
import "./GerenciamentoClientes.css";
import LayoutPrincipal from "../LayoutPrincipal/LayoutPrincipal";

const clientesIniciais = [
  { nome: "Carlos Silva", email: "carlos.silva@email.com", telefone: "(11) 98765-4321", cpf: "123.456.789-00" },
  { nome: "Ana Souza", email: "ana.souza@email.com", telefone: "(21) 91234-5678", cpf: "987.654.321-00" },
  { nome: "Ricardo Almeida", email: "ricardo.almeida@email.com", telefone: "(31) 99876-5432", cpf: "456.789.012-34" },
  { nome: "Fernanda Costa", email: "fernanda.costa@email.com", telefone: "(41) 91234-5678", cpf: "789.012.345-67" },
  { nome: "Lucas Pereira", email: "lucas.pereira@email.com", telefone: "(51) 98765-4321", cpf: "012.345.678-90" },
  { nome: "Mariana Oliveira", email: "mariana.oliveira@email.com", telefone: "(61) 91234-5678", cpf: "345.678.901-23" },
];

export default function GerenciamentoClientes() {
  const [clientes, setClientes] = useState(clientesIniciais);
  const [busca, setBusca] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [modalEditarOpen, setModalEditarOpen] = useState(false);
  const [clienteEditando, setClienteEditando] = useState(null);
  const [novoCliente, setNovoCliente] = useState({
    nome: "",
    email: "",
    telefone: "",
    cpf: ""
  });

  // Funções auxiliares para modais e ações
  const abrirModalNovo = () => {
    setNovoCliente({ nome: "", email: "", telefone: "", cpf: "" });
    setModalOpen(true);
  };

  const fecharModalNovo = () => {
    setModalOpen(false);
  };

  const abrirModalEditar = (cliente, index) => {
    setClienteEditando({ ...cliente, index });
    setModalEditarOpen(true);
  };

  const fecharModalEditar = () => {
    setModalEditarOpen(false);
    setClienteEditando(null);
  };

  const salvarNovoCliente = (e) => {
    e.preventDefault();
    if (!novoCliente.nome || !novoCliente.email || !novoCliente.telefone || !novoCliente.cpf) {
      alert("Preencha todos os campos obrigatórios!");
      return;
    }
    setClientes([...clientes, novoCliente]);
    fecharModalNovo();
  };

  const salvarEdicaoCliente = (e) => {
    e.preventDefault();
    if (!clienteEditando.nome || !clienteEditando.email || !clienteEditando.telefone || !clienteEditando.cpf) {
      alert("Preencha todos os campos obrigatórios!");
      return;
    }
    const novosClientes = clientes.map((c, i) => 
      i === clienteEditando.index ? {
        nome: clienteEditando.nome,
        email: clienteEditando.email,
        telefone: clienteEditando.telefone,
        cpf: clienteEditando.cpf
      } : c
    );
    setClientes(novosClientes);
    fecharModalEditar();
  };

  const visualizarCliente = (cliente) => {
    alert(`📋 Cliente: ${cliente.nome}\n📧 Email: ${cliente.email}\n📞 Telefone: ${cliente.telefone}\n🆔 CPF: ${cliente.cpf}`);
  };

  const excluirCliente = (index) => {
    if (window.confirm("Tem certeza que deseja excluir este cliente?")) {
      setClientes(clientes.filter((_, i) => i !== index));
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
                {clientesFiltrados.length > 0 ? (
                  clientesFiltrados.map((cliente, index) => (
                    <tr key={index}>
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
                            onClick={() => excluirCliente(index)}
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
                  </div>
                  <div className="gc-modal-buttons">
                    <button type="button" onClick={fecharModalNovo} className="gc-btn-cancel">
                      Cancelar
                    </button>
                    <button type="submit" className="gc-btn-save">
                      <span className="material-symbols-outlined" style={{fontSize: '1.1rem', marginRight: '0.25rem'}}>save</span>
                      Salvar Cliente
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
                    <button type="submit" className="gc-btn-save">
                      <span className="material-symbols-outlined" style={{fontSize: '1.1rem', marginRight: '0.25rem'}}>save</span>
                      Salvar Alterações
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