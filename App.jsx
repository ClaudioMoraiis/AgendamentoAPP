import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ROUTES } from "./constants/routes";
import Login from "./Login/Login";
import Cadastro from "./CadastroUsuario/CadastroUsuario";
import RecuperarSenha from "./RecuperarSenha/RecuperarSenha";
import AlterarSenha from "./AlterarSenha/AlterarSenha";
import Agendamento from "./Agendamento/Agendamento";
import Servicos from "./Servicos/Servicos";
import MeusAgendamentos from "./MeusAgendamentos/MeusAgendamentos";
import Dashboard from "./Dashboard/Dashboard";
import GerenciamentoServicos from "./GerenciamentoServicos/GerenciamentoServicos";
import GerenciamentoClientes from "./GerenciamentoClientes/GerenciamentoClientes";
import GerenciamentoAgendamentos from "./GerenciamentoAgendamentos/GerenciamentoAgendamentos";
import GerenciamentoProfissionais from "./GerenciamentoProfissionais/GerenciamentoProfissionais";
import GerenciamentoEspecialidades from "./GerenciamentoEspecialidades/GerenciamentoEspecialidades";
import GerenciamentoHorarios from "./GerenciamentoHorarios/GerenciamentoHorarios";
import {
  RedirectToAdminServicos,
  RedirectToAdminClientes,
  RedirectToAdminAgendamentos,
  RedirectToAdminProfissionais,
  RedirectToAgendamento
} from "./components/Redirects/LegacyRouteRedirects";

function App() {
  return (
    <Router>
      <Routes>
        {/* Rotas públicas */}
        <Route path={ROUTES.LOGIN} element={<Login />} />
        <Route path={ROUTES.CADASTRO} element={<Cadastro />} />
        <Route path={ROUTES.RECUPERAR_SENHA} element={<RecuperarSenha />} />
        <Route path={ROUTES.ALTERAR_SENHA} element={<AlterarSenha />} />
        
        {/* Rotas do cliente */}
        <Route path={ROUTES.SERVICOS} element={<Servicos />} />
        <Route path={ROUTES.AGENDAMENTO} element={<Agendamento />} />
        <Route path={ROUTES.MEUS_AGENDAMENTOS} element={<MeusAgendamentos />} />
        
        {/* Rotas de compatibilidade (redirecionamento automático) */}
        <Route path="/agendamentoCliente" element={<RedirectToAgendamento />} />
        <Route path="/gerenciamento-servicos" element={<RedirectToAdminServicos />} />
        <Route path="/gerenciamento-clientes" element={<RedirectToAdminClientes />} />
        <Route path="/gerenciamento-agendamentos" element={<RedirectToAdminAgendamentos />} />
        <Route path="/gerenciamento-profissionais" element={<RedirectToAdminProfissionais />} />
        
        {/* Rotas administrativas (padrão atual) */}
        <Route path={ROUTES.DASHBOARD} element={<Dashboard />} />
        <Route path={ROUTES.GERENCIAMENTO_SERVICOS} element={<GerenciamentoServicos />} />
        <Route path={ROUTES.GERENCIAMENTO_CLIENTES} element={<GerenciamentoClientes />} />
        <Route path={ROUTES.GERENCIAMENTO_AGENDAMENTOS} element={<GerenciamentoAgendamentos />} />
        <Route path={ROUTES.GERENCIAMENTO_PROFISSIONAIS} element={<GerenciamentoProfissionais />} />
        <Route path={ROUTES.GERENCIAMENTO_ESPECIALIDADES} element={<GerenciamentoEspecialidades />} />
        <Route path={ROUTES.GERENCIAMENTO_HORARIOS} element={<GerenciamentoHorarios />} />
      </Routes>
    </Router>
  );
}

export default App;
