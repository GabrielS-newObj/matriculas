import React from "react";
export const AuthContext = React.createContext({
  usuario: null,
  login: () => {},
  logout: () => {},
});
 
export class AuthProvider extends React.Component {
  state = { usuario: null };
 
  login = (usuario) => this.setState({ usuario });
  logout = () => this.setState({ usuario: null });
 
  render() {
    const valor = { usuario: this.state.usuario, login: this.login, logout: this.logout };
    return <AuthContext.Provider value={valor}>{this.props.children}</AuthContext.Provider>;
  }
}
