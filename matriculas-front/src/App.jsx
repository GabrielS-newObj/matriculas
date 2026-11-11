import React from "react";
import { AuthContext } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import TurmasDisponiveis from "./pages/TurmasDisponiveis";
import MinhaGrade from "./pages/MinhaGrade";
import NovaTurma from "./pages/NovaTurma";
import Disciplinas from "./pages/Disciplinas";
import GradeOfertas from "./pages/GradeOfertas";
import { lerUsuario, lerPagina, salvarPagina } from "./utils/sessao";
 
const PAGINAS = {
  login: { componente: Login, perfil: null },
  "aluno-turmas": { componente: TurmasDisponiveis, perfil: "aluno" },
  "aluno-grade": { componente: MinhaGrade, perfil: "aluno" },
  "gestor-grade": { componente: GradeOfertas, perfil: "gestor" },
  "gestor-nova-turma": { componente: NovaTurma, perfil: "gestor" },
  "gestor-disciplinas": { componente: Disciplinas, perfil: "gestor" },
};
 
// Ao carregar (ou apertar F5): volta para a tela em que a pessoa estava, se ainda for permitida.
function paginaInicial() {
  const usuario = lerUsuario();
  if (!usuario) return "login";
  const salva = PAGINAS[lerPagina()];
  if (salva && salva.perfil === usuario.perfil) return lerPagina();
  return usuario.perfil === "gestor" ? "gestor-grade" : "aluno-turmas";
}
 
export default class App extends React.Component {
  static contextType = AuthContext;
  state = { pagina: paginaInicial() };
 
  navegar = (pagina) => {
    salvarPagina(pagina);
    this.setState({ pagina });
  };
 
  render() {
    const { usuario } = this.context;
    const definicao = PAGINAS[this.state.pagina];
    const permitido =
      definicao && (definicao.perfil === null || (usuario && usuario.perfil === definicao.perfil));
    const Pagina = permitido ? definicao.componente : Login;
 
    return (
      <div>
        <Navbar onNavegar={this.navegar} />
        <div className="container py-4">
          <Pagina onNavegar={this.navegar} />
        </div>
      </div>
    );
  }
}
