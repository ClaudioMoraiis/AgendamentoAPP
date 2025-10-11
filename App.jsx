import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./Login/Login";
import Cadastro from "./CadastroUsuario/CadastroUsuario";
import RecuperarSenha from "./RecuperarSenha/RecuperarSenha";
import AlterarSenha from "./AlterarSenha/AlterarSenha";
import Agendamento from "./Agendamento/Agendamento";
import Servicos from "./Servicos/Servicos";
import MeusAgendamentos from "./MeusAgendamentos/MeusAgendamentos";
import GerenciamentoServicos from "./GerenciamentoServicos/GerenciamentoServicos";
import GerenciamentoClientes from "./GerenciamentoClientes/GerenciamentoClientes";
import GerenciamentoAgendamentos from "./GerenciamentoAgendamentos/GerenciamentoAgendamentos";
import GerenciamentoProfissionais from "./GerenciamentoProfissionais/GerenciamentoProfissionais";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/cadastro" element={<Cadastro />} />
        <Route path="/recuperar-senha" element={<RecuperarSenha />} />
        <Route path="/mudar-senha" element={<AlterarSenha />} />
        <Route path="/agendamentoCliente" element={<Agendamento />} />
        <Route path="/servicos" element={<Servicos />} />
        <Route path="/meus-agendamentos" element={<MeusAgendamentos />} />
        <Route path="/gerenciamento-servicos" element={<GerenciamentoServicos />} />
        <Route path="/gerenciamento-clientes" element={<GerenciamentoClientes />} />
        <Route path="/gerenciamento-agendamentos" element={<GerenciamentoAgendamentos />} />
        <Route path="/gerenciamento-profissionais" element={<GerenciamentoProfissionais />} />
      </Routes>
    </Router>
  );
}

export default App;
