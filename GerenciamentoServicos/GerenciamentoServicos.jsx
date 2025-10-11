import React, { useState } from "react";
import "./GerenciamentoServicos.css";
import LayoutPrincipal from "../LayoutPrincipal/LayoutPrincipal";

const servicosIniciais = [
  { nome: "Corte de cabelo", duracao: "30 minutos", preco: "R$ 45,00" },
  { nome: "Barba", duracao: "20 minutos", preco: "R$ 30,00" },
  { nome: "Corte e Barba", duracao: "50 minutos", preco: "R$ 70,00" },
  { nome: "Design de sobrancelhas", duracao: "15 minutos", preco: "R$ 25,00" },
  { nome: "Pacote completo (corte, barba e sobrancelhas)", duracao: "1 hora", preco: "R$ 90,00" },
];

export default function GerenciamentoServicos() {
  const [servicos, setServicos] = useState(servicosIniciais);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalEditarOpen, setModalEditarOpen] = useState(false);
  const [novoServico, setNovoServico] = useState({ nome: "", duracao: "", preco: "" });
  const [servicoEditando, setServicoEditando] = useState({ index: null, nome: "", duracao: "", preco: "" });

  const openModal = () => setModalOpen(true);
  const closeModal = () => { setModalOpen(false); setNovoServico({ nome: "", duracao: "", preco: "" }); };
  const abrirModalEditar = (index) => {
    const servico = servicos[index];
    setServicoEditando({ index, nome: servico.nome, duracao: servico.duracao, preco: servico.preco });
    setModalEditarOpen(true);
  };
  const closeModalEditar = () => { setModalEditarOpen(false); setServicoEditando({ index: null, nome: "", duracao: "", preco: "" }); };
  const salvarServico = (e) => {
    e.preventDefault();
    if (!novoServico.nome || !novoServico.duracao || !novoServico.preco) {
      alert("Preencha todos os campos antes de salvar!");
      return;
    }
    setServicos([...servicos, novoServico]);
    closeModal();
  };
  const salvarEdicaoServico = (e) => {
    e.preventDefault();
    if (!servicoEditando.nome || !servicoEditando.duracao || !servicoEditando.preco) {
      alert("Preencha todos os campos antes de salvar!");
      return;
    }
    const novosServicos = [...servicos];
    novosServicos[servicoEditando.index] = {
      nome: servicoEditando.nome,
      duracao: servicoEditando.duracao,
      preco: servicoEditando.preco
    };
    setServicos(novosServicos);
    closeModalEditar();
  };
  const excluirServico = () => {
    if (window.confirm("Tem certeza que deseja excluir este serviço?")) {
      const novosServicos = servicos.filter((_, index) => index !== servicoEditando.index);
      setServicos(novosServicos);
      closeModalEditar();
    }
  };

  return (
    <LayoutPrincipal paginaAtiva="servicos">
      <div className="gs-main">
        <div className="gs-main-content">
          <div className="gs-header">
            <h2>Serviços</h2>
            <button className="gs-btn-primary" onClick={openModal}>
              <span className="material-symbols-outlined">add</span>
              Novo serviço
            </button>
          </div>
          <div className="gs-table-card">
            <table>
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Duração</th>
                  <th>Preço</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {servicos.map((s, i) => (
                  <tr key={i}>
                    <td>{s.nome}</td>
                    <td>{s.duracao}</td>
                    <td>{s.preco}</td>
                    <td>
                      <button 
                        className="gs-link-edit" 
                        onClick={() => abrirModalEditar(i)}
                      >
                        Editar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      {/* Modal de novo serviço */}
      {modalOpen && (
        <div className="gs-modal-overlay" onClick={closeModal}>
          <div
            className="gs-modal"
            onClick={(e) => e.stopPropagation()} // evita fechar ao clicar dentro
          >
            <h3>Novo Serviço</h3>
            <form onSubmit={salvarServico}>
              <label>Nome do serviço</label>
              <input
                type="text"
                value={novoServico.nome}
                onChange={(e) =>
                  setNovoServico({ ...novoServico, nome: e.target.value })
                }
                placeholder="Ex: Corte de cabelo"
                required
              />

              <label>Duração</label>
              <input
                type="text"
                value={novoServico.duracao}
                onChange={(e) =>
                  setNovoServico({ ...novoServico, duracao: e.target.value })
                }
                placeholder="Ex: 30 minutos"
                required
              />

              <label>Preço</label>
              <input
                type="text"
                value={novoServico.preco}
                onChange={(e) =>
                  setNovoServico({ ...novoServico, preco: e.target.value })
                }
                placeholder="Ex: R$ 50,00"
                required
              />

              <div className="gs-modal-buttons">
                <button type="button" onClick={closeModal} className="cancelar">
                  Cancelar
                </button>
                <button type="submit" className="salvar">
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de editar serviço */}
      {modalEditarOpen && (
        <div className="gs-modal-overlay" onClick={closeModalEditar}>
          <div
            className="gs-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <h3>Editar Serviço</h3>
            <form onSubmit={salvarEdicaoServico}>
              <label>Nome do serviço</label>
              <input
                type="text"
                value={servicoEditando.nome}
                onChange={(e) =>
                  setServicoEditando({ ...servicoEditando, nome: e.target.value })
                }
                placeholder="Ex: Corte de cabelo"
                required
              />

              <label>Duração</label>
              <input
                type="text"
                value={servicoEditando.duracao}
                onChange={(e) =>
                  setServicoEditando({ ...servicoEditando, duracao: e.target.value })
                }
                placeholder="Ex: 30 minutos"
                required
              />

              <label>Preço</label>
              <input
                type="text"
                value={servicoEditando.preco}
                onChange={(e) =>
                  setServicoEditando({ ...servicoEditando, preco: e.target.value })
                }
                placeholder="Ex: R$ 50,00"
                required
              />

              <div className="gs-modal-buttons">
                <button 
                  type="button" 
                  onClick={excluirServico} 
                  className="excluir"
                >
                  Excluir
                </button>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button type="button" onClick={closeModalEditar} className="cancelar">
                    Cancelar
                  </button>
                  <button type="submit" className="salvar">
                    Salvar
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
    </LayoutPrincipal>
  );
}