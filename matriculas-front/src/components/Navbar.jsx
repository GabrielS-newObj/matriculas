import React from "react";
import { AuthContext } from "../context/AuthContext";
 
const LINKS = {
  aluno: [
    ["aluno-turmas", "Turmas disponíveis"],
    ["aluno-grade", "Minha grade"],
  ],
  gestor: [
    ["gestor-grade", "Grade e professores"],
    ["gestor-nova-turma", "Ofertar turma"],
    ["gestor-disciplinas", "Disciplinas"],
  ],
};
 
export default class Navbar extends React.Component {
  static contextType = AuthContext; 
 
  sair = () => {
    this.context.logout();
    this.props.onNavegar("login");
  };
 
  render() {
    const { usuario } = this.context;
    return (
      <nav className="navbar navbar-expand navbar-dark bg-primary px-3">
        <span className="navbar-brand">Matrículas</span>
        <ul className="navbar-nav me-auto">
          {usuario &&
            LINKS[usuario.perfil].map(([pagina, texto]) => (
              <li className="nav-item" key={pagina}>
                <button
                  className="btn btn-link nav-link"
                  onClick={() => this.props.onNavegar(pagina)}
                >
                  {texto}
                </button>
              </li>
            ))}
        </ul>
        {usuario && (
          <div className="text-white">
            <span className="me-3">{usuario.nome}</span>
            <button className="btn btn-outline-light btn-sm" onClick={this.sair}>
              Sair
            </button>
          </div>
        )}
      </nav>
    );
  }
}
