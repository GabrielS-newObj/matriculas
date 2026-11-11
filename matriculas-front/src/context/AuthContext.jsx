import React from "react";
import { lerUsuario, salvarUsuario, limparSessao } from "../utils/sessao";
export const AuthContext = React.createContext({
  usuario: null,
  login: () => {},
  logout: () => {},
});

export class AuthProvider extends React.Component {
  state = { usuario: lerUsuario() };
 
  login = (usuario) => {
    salvarUsuario(usuario);
    this.setState({ usuario });
  };
  logout = () => {
    limparSessao();
    this.setState({ usuario: null });
  };
 
  render() {
    const valor = { usuario: this.state.usuario, login: this.login, logout: this.logout };
    return <AuthContext.Provider value={valor}>{this.props.children}</AuthContext.Provider>;
  }
}
