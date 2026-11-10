import React from "react";
import { AuthContext } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import TurmasDisponiveis from "./pages/TurmasDisponiveis";
import MinhaGrade from "./pages/MinhaGrade";
import NovaTurma from "./pages/NovaTurma";
import Disciplinas from "./pages/Disciplinas";
import GradeOfertas from "./pages/GradeOfertas";
 
const PAGINAS = {
  login: { componente: Login, perfil: null },
  "aluno-turmas": { componente: TurmasDisponiveis, perfil: "aluno" },
  "aluno-grade": { componente: MinhaGrade, perfil: "aluno" },
  "gestor-grade": { componente: GradeOfertas, perfil: "gestor" },
  "gestor-nova-turma": { componente: NovaTurma, perfil: "gestor" },
  "gestor-disciplinas": { componente: Disciplinas, perfil: "gestor" },
};
 
function paginaInicial(usuario) {
  if (!usuario) return "login";
  return usuario.perfil === "gestor" ? "gestor-grade" : "aluno-turmas";
}

export default class App extends React.Component {
  static contextType = AuthContext;
  state = { pagina: paginaInicial(JSON.parse(localStorage.getItem("usuario"))) };
 
  navegar = (pagina) => this.setState({ pagina });
 
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
