import React from "react";
import { AuthContext } from "../context/AuthContext";
import { api } from "../services/api";
import Alerta from "../components/Alerta";
 
export default class Login extends React.Component {
  static contextType = AuthContext;
  state = { email: "", senha: "", mensagem: null, enviando: false };
 
  mudar = (evento) => this.setState({ [evento.target.name]: evento.target.value });
 
  entrar = async (evento) => {
    evento.preventDefault();
    this.setState({ enviando: true, mensagem: null });
    try {
      const usuario = await api.login(this.state.email, this.state.senha);
      this.context.login(usuario); 
      this.props.onNavegar(usuario.perfil === "gestor" ? "gestor-grade" : "aluno-turmas");
    } catch (e) {
      this.setState({ enviando: false, mensagem: { tipo: "danger", texto: e.message } });
    }
  };
 
  render() {
    const { email, senha, mensagem, enviando } = this.state;
    return (
      <div className="row justify-content-center">
        <div className="col-md-5">
          <h2 className="mb-3">Entrar</h2>
          <Alerta mensagem={mensagem} />
          <form onSubmit={this.entrar}>
            <div className="mb-3">
              <label className="form-label">E-mail</label>
              <input className="form-control" name="email" type="email" value={email}
                onChange={this.mudar} required />
            </div>
            <div className="mb-3">
              <label className="form-label">Senha</label>
              <input className="form-control" name="senha" type="password" value={senha}
                onChange={this.mudar} required />
            </div>
            <button className="btn btn-primary" disabled={enviando}>
              {enviando ? "Entrando..." : "Entrar"}
            </button>
          </form>
        </div>
      </div>
    );
  }
}
