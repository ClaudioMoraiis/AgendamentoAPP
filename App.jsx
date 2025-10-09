import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./Login/Login";
import Cadastro from "./CadastroUsuario/CadastroUsuario";
import RecuperarSenha from "./RecuperarSenha/RecuperarSenha";
import AlterarSenha from "./AlterarSenha/AlterarSenha";
import Agendamento from "./Agendamento/Agendamento";
import Servicos from "./Servicos/Servicos";
import MeusAgendamentos from "./MeusAgendamentos/MeusAgendamentos";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/cadastro" element={<Cadastro />} />
        <Route path="/recuperar-senha" element={<RecuperarSenha />} />
        <Route path="/mudar-senha" element={<AlterarSenha />} />
        <Route path="/agendamento" element={<Agendamento />} />
        <Route path="/servicos" element={<Servicos />} />
        <Route path="/meus-agendamentos" element={<MeusAgendamentos />} />
      </Routes>
    </Router>
  );
}

export default App;
