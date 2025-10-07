import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./Login/Login";
import Cadastro from "./CadastroUsuario/CadastroUsuario";
import RecuperarSenha from "./RecuperarSenha/RecuperarSenha";
import AlterarSenha from "./AlterarSenha/AlterarSenha";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/cadastro" element={<Cadastro />} />
        <Route path="/recuperar-senha" element={<RecuperarSenha />} />
        <Route path="/mudar-senha" element={<AlterarSenha />} />
      </Routes>
    </Router>
  );
}

export default App;
